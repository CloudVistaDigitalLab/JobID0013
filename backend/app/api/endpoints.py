from fastapi import APIRouter # type: ignore

router = APIRouter()

@router.get("/test/{val}")
async def read_item(val: int):
    return {"val": val}
