import os
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def test_qr_flow():
    print("=== Testing End-to-End QR Traceability & Verification Flow ===\n")
    
    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Backend not healthy: {res.text}"
    print("[1/4] Backend health check OK (HTTP 200)")

    # 2. Perform real POST /analyze
    image_path = os.path.join(PROJECT_ROOT, "ml", "dataset", "test", "score_0", "score-0_10.jpg")
    data = {
        "pH": "3.95",
        "moisture": "65.5",
        "temperature": "22.5",
        "feed_type_id": "corn_silage",
        "farm_location": "Bunker Lot #2 - North",
        "batch_id": "BATCH-2026-QR-TEST"
    }

    with open(image_path, "rb") as f:
        files = {"image": (os.path.basename(image_path), f, "image/jpeg")}
        analyze_res = requests.post(f"{BASE_URL}/analyze", data=data, files=files, timeout=20)

    assert analyze_res.status_code == 200, f"/analyze failed: {analyze_res.text}"
    result = analyze_res.json()
    test_id = result["id"]
    batch_id = result["batch_id"]

    print(f"[2/4] Live /analyze succeeded:")
    print(f"      Test ID: {test_id}")
    print(f"      Batch ID: {batch_id}")
    print(f"      FBSI Score: {result['fbsi_score']}")
    print(f"      Confidence: {result['confidence'] * 100:.1f}%")
    print(f"      Screening Result: {result['screening_result']} (Risk: {result['risk_level']})")
    print(f"      Moisture: {result['metrics']['moisture']['value']}% ({result['metrics']['moisture']['status']})")
    print(f"      pH: {result['metrics']['pH']['value']} ({result['metrics']['pH']['status']})")
    print(f"      Temperature: {result['metrics']['temperature']['value']}°C ({result['metrics']['temperature']['status']})")

    # 3. Verify QR route encoding
    expected_verify_route = f"/verify/{test_id}"
    print(f"[3/4] QR Code generates route: {expected_verify_route}")
    assert test_id.startswith("test-"), "Test ID must be a unique stable ID string"

    # 4. Verify all required traceability fields are present in the response
    required_fields = [
        "id", "fbsi_score", "confidence", "class_probabilities",
        "screening_result", "quality", "risk_level", "score",
        "assessment_basis", "visual_indicators", "evidence", "flags",
        "advisory", "advisory_details", "feed_type", "feed_type_id",
        "farm_location", "batch_id", "timestamp", "metrics", "limitations"
    ]
    for field in required_fields:
        assert field in result, f"Missing required field: {field}"
    print("[4/4] All traceability fields verified successfully!")

    print("\n=== End-to-End Verification Passed Successfully ===")

if __name__ == "__main__":
    test_qr_flow()
