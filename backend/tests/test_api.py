import os
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def wait_for_server(timeout=60):
    start = time.time()
    while time.time() - start < timeout:
        try:
            res = requests.get(f"{BASE_URL}/health", timeout=2)
            if res.status_code == 200:
                print(f"[OK] FastAPI Server is reachable at {BASE_URL}")
                return True
        except Exception:
            time.sleep(1)
    return False

def test_api():
    print("=== Testing FastAPI /analyze Endpoint with Real Test Images ===\n")
    if not wait_for_server():
        print("[ERROR] Server not reachable. Check uvicorn logs.")
        return

    test_cases = [
        {
            "label": "Test Case 1: FBSI Score 0 (Clean Bunk + Optimal Parameters)",
            "image_path": os.path.join(PROJECT_ROOT, "ml", "dataset", "test", "score_0", "score-0_10.jpg"),
            "data": {
                "pH": "3.9",
                "moisture": "64.5",
                "temperature": "21.5",
                "feed_type_id": "corn_silage",
                "farm_location": "Bunker Bay #1",
                "batch_id": "BATCH-2026-A1"
            }
        },
        {
            "label": "Test Case 2: FBSI Score 0.5 / 1-2 (Scattered Remnants + Normal Parameters)",
            "image_path": os.path.join(PROJECT_ROOT, "ml", "dataset", "test", "score_1_2", "score-0.5_101.jpg"),
            "data": {
                "pH": "4.1",
                "moisture": "66.0",
                "temperature": "23.0",
                "feed_type_id": "grass_silage",
                "farm_location": "South Trench #4",
                "batch_id": "BATCH-2026-B2"
            }
        },
        {
            "label": "Test Case 3: FBSI Score 2 (25-50% Remnants + Moderate Warming Parameters)",
            "image_path": os.path.join(PROJECT_ROOT, "ml", "dataset", "test", "score_2", "score-2_0.jpg"),
            "data": {
                "pH": "4.45",
                "moisture": "71.0",
                "temperature": "29.5",
                "feed_type_id": "alfalfa_haylage",
                "farm_location": "West Bunker Lot 3",
                "batch_id": "BATCH-2026-C3"
            }
        },
        {
            "label": "Test Case 4: FBSI Score 4 (Untouched Full Bunk + Critical Spoilage Metrics)",
            "image_path": os.path.join(PROJECT_ROOT, "ml", "dataset", "test", "score_4", "score-4_0.jpg"),
            "data": {
                "pH": "4.9",
                "moisture": "75.0",
                "temperature": "39.0",
                "feed_type_id": "corn_silage",
                "farm_location": "East Silo Bag #9",
                "batch_id": "BATCH-2026-D4"
            }
        }
    ]

    for tc in test_cases:
        print(f"================================================================================")
        print(tc["label"])
        print(f"Image: {tc['image_path']}")
        print(f"Inputs: pH={tc['data']['pH']}, moisture={tc['data']['moisture']}%, temp={tc['data']['temperature']}°C")
        print(f"--------------------------------------------------------------------------------")

        if not os.path.exists(tc["image_path"]):
            print(f"[ERROR] Image path does not exist: {tc['image_path']}")
            continue

        with open(tc["image_path"], "rb") as f:
            files = {"image": (os.path.basename(tc["image_path"]), f, "image/jpeg")}
            response = requests.post(f"{BASE_URL}/analyze", data=tc["data"], files=files, timeout=30)

        if response.status_code == 200:
            res_json = response.json()
            display_json = {k: v for k, v in res_json.items() if k != "image_url"}
            display_json["image_url"] = f"<data:image/jpeg;base64,... length={len(res_json.get('image_url', ''))}>"
            print(json.dumps(display_json, indent=2))
        else:
            print(f"[ERROR {response.status_code}]: {response.text}")
        print("\n")

if __name__ == "__main__":
    test_api()
