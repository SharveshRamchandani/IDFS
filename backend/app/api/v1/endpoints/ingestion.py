from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_ingestion():
    return {"message": "Data Ingestion module"}
