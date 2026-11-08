from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="AI Engine Health Check",
    description="Returns the operational status and service identifier for the AI engine.",
)
async def get_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="aapadamitra-ai"
    )

