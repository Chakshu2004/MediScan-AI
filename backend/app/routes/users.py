"""
app/routes/users.py — Current-user profile endpoint
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.schemas import UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's profile + report count."""
    result = await db.execute(
        select(func.count()).where(Report.user_id == current_user.id)
    )
    count = result.scalar() or 0

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
        created_at=current_user.created_at,
        report_count=count,
    )
