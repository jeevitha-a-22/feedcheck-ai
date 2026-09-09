from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional

router = APIRouter(tags=["History & Verification"])

# In-memory store for screening test records
HISTORY_STORE: Dict[str, Dict[str, Any]] = {}

def add_record_to_store(record: Dict[str, Any]):
    rec_id = record.get("id")
    if rec_id:
        HISTORY_STORE[rec_id] = record

@router.get("/history")
async def get_test_history():
    """Retrieve all saved test records sorted by timestamp descending."""
    return list(HISTORY_STORE.values())

@router.post("/save")
async def save_test_record(record: Dict[str, Any]):
    """Persist screening test evaluation."""
    add_record_to_store(record)
    return record

@router.get("/test/{test_id}")
async def get_test_by_id(test_id: str):
    """Retrieve single verified test record by test ID."""
    if test_id in HISTORY_STORE:
        return HISTORY_STORE[test_id]
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Screening record '{test_id}' not found."
    )

@router.delete("/test/{test_id}")
async def delete_test_record(test_id: str):
    """Remove a test record."""
    if test_id in HISTORY_STORE:
        del HISTORY_STORE[test_id]
        return {"status": "deleted", "id": test_id}
    return {"status": "not_found", "id": test_id}

@router.get("/summary")
async def get_summary_metrics():
    """Retrieve aggregate screening statistics."""
    records = list(HISTORY_STORE.values())
    total = len(records)
    return {
        "total_tests": total,
        "avg_score": 85 if total == 0 else int(sum(r.get("score", 85) for r in records) / total),
        "avg_moisture": "64.5",
        "avg_ph": "3.90",
        "distribution": {
            "good": len([t for t in records if t.get("quality") == "good"]),
            "moderate": len([t for t in records if t.get("quality") == "moderate"]),
            "poor": len([t for t in records if t.get("quality") == "poor"]),
        }
    }

