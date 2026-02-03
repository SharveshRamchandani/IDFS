from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_dashboard():
    return {"message": "Dashboard module"}
