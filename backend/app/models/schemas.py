"""
app/models/schemas.py — Pydantic request / response schemas
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    code: str = Field(..., description="OAuth authorization code from Google")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    picture: Optional[str] = None
    created_at: datetime
    report_count: int = 0

    class Config:
        from_attributes = True


# ── Report ────────────────────────────────────────────────────────────────────

class ParameterSchema(BaseModel):
    name: str
    value: str
    unit: str
    range: str
    status: str                   # normal | high | low | borderline
    bar_percent: int = Field(50, ge=0, le=100)
    explanation: Optional[str] = None


class RecommendationSchema(BaseModel):
    icon: str
    text: str


class ReportCreate(BaseModel):
    file_name: str
    raw_text: Optional[str] = None   # when pasting text directly


class ReportOut(BaseModel):
    id: uuid.UUID
    file_name: str
    report_name: Optional[str] = None
    summary: Optional[str] = None
    parameters: Optional[list[ParameterSchema]] = None
    recommendations: Optional[list[RecommendationSchema]] = None
    flag_count: int
    status: str
    overall_status: Optional[str] = None
    created_at: datetime
    analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportListOut(BaseModel):
    id: uuid.UUID
    file_name: str
    report_name: Optional[str] = None
    flag_count: int
    status: str
    overall_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analysis ──────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    report_id: uuid.UUID


class AnalysisResult(BaseModel):
    report_id: uuid.UUID
    report_name: str
    summary: str
    parameters: list[ParameterSchema]
    recommendations: list[RecommendationSchema]
    overall_status: str
