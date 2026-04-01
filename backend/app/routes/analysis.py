"""
app/routes/analysis.py — Trigger AI analysis for a report
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.report import Report, ReportStatus, OverallStatus
from app.models.schemas import AnalysisRequest, AnalysisResult
from app.services.ai_analysis import analyze_report, count_flags

router = APIRouter()


@router.post("/", response_model=AnalysisResult)
async def trigger_analysis(
    body: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Run AI analysis on an already-uploaded report.
    Persists the result and returns structured insights.
    """
    # Fetch & authorise
    result = await db.execute(
        select(Report).where(
            Report.id == body.report_id,
            Report.user_id == current_user.id,
        )
    )
    report: Report | None = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.raw_text:
        raise HTTPException(status_code=400, detail="No text extracted from report yet")

    # Run AI
    try:
        ai_result = await analyze_report(report.raw_text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    # Map overall_status string → enum
    overall_raw = ai_result.get("overallStatus", "normal").lower()
    overall_map = {
        "normal":    OverallStatus.NORMAL,
        "attention": OverallStatus.ATTENTION,
        "critical":  OverallStatus.CRITICAL,
    }
    overall = overall_map.get(overall_raw, OverallStatus.NORMAL)

    # Persist
    params = ai_result.get("parameters", [])
    report.report_name    = ai_result.get("reportName", report.file_name)
    report.summary        = ai_result.get("summary", "")
    report.parameters     = params
    report.recommendations = ai_result.get("recommendations", [])
    report.flag_count     = count_flags(params)
    report.overall_status = overall
    report.status         = ReportStatus.ANALYZED
    report.analyzed_at    = datetime.now(timezone.utc)

    await db.flush()

    return AnalysisResult(
        report_id=report.id,
        report_name=report.report_name,
        summary=report.summary,
        parameters=params,
        recommendations=report.recommendations,
        overall_status=overall.value,
    )


@router.get("/{report_id}", response_model=AnalysisResult)
async def get_analysis(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return cached analysis for an already-analysed report."""
    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.user_id == current_user.id,
        )
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status != ReportStatus.ANALYZED:
        raise HTTPException(status_code=400, detail="Report has not been analysed yet")

    return AnalysisResult(
        report_id=report.id,
        report_name=report.report_name,
        summary=report.summary,
        parameters=report.parameters or [],
        recommendations=report.recommendations or [],
        overall_status=report.overall_status.value if report.overall_status else "normal",
    )
