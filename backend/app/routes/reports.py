"""
app/routes/reports.py — CRUD for medical reports + file upload
"""
import os
import uuid
import aiofiles
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.report import Report, ReportStatus
from app.models.schemas import ReportOut, ReportListOut
from app.services.ocr import extract_text

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


# ── Upload ─────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile | None = File(None),
    raw_text: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Accept either a file upload (PDF/image) or pasted raw_text.
    Runs OCR on file uploads, saves text to DB.
    """
    if not file and not raw_text:
        raise HTTPException(status_code=400, detail="Provide a file or raw_text")

    extracted = raw_text or ""
    file_name = "pasted_text.txt"
    file_path = None

    if file:
        # Validate size
        file_bytes = await file.read()
        if len(file_bytes) > MAX_BYTES:
            raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit")

        file_name = file.filename or "upload"
        safe_name = f"{uuid.uuid4()}_{file_name}"
        file_path = str(UPLOAD_DIR / safe_name)

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_bytes)

        extracted = extract_text(file_bytes, file_name)

    report = Report(
        user_id=current_user.id,
        file_name=file_name,
        file_path=file_path,
        file_type=_detect_type(file_name),
        raw_text=extracted,
        status=ReportStatus.EXTRACTED if extracted else ReportStatus.PENDING,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report


# ── List ───────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ReportListOut])
async def list_reports(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


# ── Get single ─────────────────────────────────────────────────────────────────

@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await _get_owned_report(report_id, current_user.id, db)
    return report


# ── Delete ─────────────────────────────────────────────────────────────────────

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await _get_owned_report(report_id, current_user.id, db)
    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)
    await db.execute(delete(Report).where(Report.id == report_id))


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_owned_report(report_id, user_id, db) -> Report:
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == user_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


def _detect_type(file_name: str) -> str:
    ext = Path(file_name).suffix.lower()
    if ext == ".pdf":
        return "pdf"
    elif ext in {".jpg", ".jpeg", ".png", ".tiff", ".bmp"}:
        return "image"
    return "text"
