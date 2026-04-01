"""Initial migration — users and reports tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-03-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email",     sa.String(255), nullable=False, unique=True),
        sa.Column("name",      sa.String(255), nullable=False),
        sa.Column("picture",   sa.String(512), nullable=True),
        sa.Column("google_id", sa.String(255), nullable=True, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  onupdate=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── reports ────────────────────────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id",          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id",     UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_name",   sa.String(512), nullable=False),
        sa.Column("file_path",   sa.String(512), nullable=True),
        sa.Column("file_type",   sa.String(50),  nullable=True),
        sa.Column("report_name", sa.String(255), nullable=True),
        sa.Column("raw_text",    sa.Text,        nullable=True),
        sa.Column("summary",     sa.Text,        nullable=True),
        sa.Column("parameters",     sa.JSON, nullable=True),
        sa.Column("recommendations", sa.JSON, nullable=True),
        sa.Column("flag_count",  sa.Integer, nullable=False, server_default="0"),
        sa.Column("status",
                  sa.Enum("pending", "extracted", "analyzed", "failed", name="reportstatus"),
                  nullable=False, server_default="pending"),
        sa.Column("overall_status",
                  sa.Enum("normal", "attention", "critical", name="overallstatus"),
                  nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("analyzed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_reports_user_id", "reports", ["user_id"])


def downgrade() -> None:
    op.drop_table("reports")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS reportstatus")
    op.execute("DROP TYPE IF EXISTS overallstatus")
