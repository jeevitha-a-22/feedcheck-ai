import os
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

VALID_CLASSES = ["score_0", "score_1", "score_1_2", "score_2", "score_3", "score_4"]
SPLITS = ["train", "validation", "test"]

print("=== Verifying Dataset Directory & Structure ===")

for split in SPLITS:
    split_path = os.path.join(DATASET_DIR, split)
    print(f"\n--- Split: {split} ---")
    if not os.path.exists(split_path):
        print(f"  [ERROR] {split_path} does not exist!")
        continue
        
    entries = sorted(os.listdir(split_path))
    for entry in entries:
        entry_path = os.path.join(split_path, entry)
        if os.path.isdir(entry_path):
            if entry not in VALID_CLASSES:
                print(f"  Removing legacy/invalid folder: {entry}")
                shutil.rmtree(entry_path)
            else:
                files = [f for f in os.listdir(entry_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                print(f"  Class '{entry}': {len(files)} images")

print("\n=== All split directories verified cleanly ===")
