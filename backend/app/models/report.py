"""
app/models/report.py — Medical Report ORM model
"""
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class ReportStatus(str, enum.Enum):
    PENDING   = "pending"
    EXTRACTED = "extracted"
    ANALYZED  = "analyzed"
    FAILED    = "failed"


class OverallStatus(str, enum.Enum):
    NORMAL    = "normal"
    ATTENTION = "attention"
    CRITICAL  = "critical"


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── File metadata ──────────────────────────────────────────────────────────
    file_name: Mapped[str] = mapped_column(String(512), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # pdf / image / text

    # ── Report data ───────────────────────────────────────────────────────────
    report_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)          # OCR output
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    parameters: Mapped[Any] = mapped_column(JSON, nullable=True)               # list[ParameterDict]
    recommendations: Mapped[Any] = mapped_column(JSON, nullable=True)          # list[RecommendationDict]
    flag_count: Mapped[int] = mapped_column(default=0)

    # ── Status ────────────────────────────────────────────────────────────────
    status: Mapped[ReportStatus] = mapped_column(
        SAEnum(ReportStatus), default=ReportStatus.PENDING
    )
    overall_status: Mapped[OverallStatus | None] = mapped_column(
        SAEnum(OverallStatus), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="reports")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Report {self.report_name} | {self.status}>"
