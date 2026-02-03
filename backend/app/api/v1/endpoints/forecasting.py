from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_forecasting():
    return {"message": "Forecasting module"}
