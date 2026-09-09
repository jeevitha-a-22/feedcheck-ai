import os
import shutil
import random
from collections import defaultdict
from sklearn.model_selection import train_test_split
import pandas as pd

RAW_DATASET_DIR = r"C:\Users\jeevitha\Downloads\Feed Bunk Score Images - FBSI\Feed Bunk Score Images - FBSI"
RAW_IMG_DIR = os.path.join(RAW_DATASET_DIR, "dataset")
BASE_OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset")

# Folder mapping in raw dataset -> standardized class name
FOLDER_TO_CLASS = {
    "Score 0": "score_0",
    "Score 1": "score_1",
    "Score 1-2": "score_1_2",
    "Score 2": "score_2",
    "Score 3": "score_3",
    "Score 4": "score_4",
}

def create_dataset_splits(seed=42):
    print("=== Step 1: Scanning Raw FBSI Dataset ===")
    records = []
    
    for folder_name, class_name in FOLDER_TO_CLASS.items():
        folder_path = os.path.join(RAW_IMG_DIR, folder_name)
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"Raw image directory not found: {folder_path}")
        
        files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        for f in files:
            full_path = os.path.join(folder_path, f)
            records.append({
                "filename": f,
                "src_path": full_path,
                "raw_folder": folder_name,
                "class_name": class_name
            })
    
    df = pd.DataFrame(records)
    print(f"Total images found: {len(df)}")
    print("\nClass distribution in raw dataset:")
    counts = df['class_name'].value_counts().sort_index()
    for c, cnt in counts.items():
        print(f"  {c}: {cnt} images")
        
    print("\n=== Step 2: Stratified 70/15/15 Split ===")
    # First split: 70% train, 30% temp (val + test)
    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=seed,
        stratify=df['class_name']
    )
    
    # Second split: split temp equally (15% val, 15% test)
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=seed,
        stratify=temp_df['class_name']
    )
    
    splits = {
        "train": train_df,
        "validation": val_df,
        "test": test_df
    }
    
    print("\nSplit Summary:")
    summary_rows = []
    for split_name, split_data in splits.items():
        c_counts = split_data['class_name'].value_counts().to_dict()
        row = {"Split": split_name, "Total": len(split_data), "Ratio": f"{len(split_data)/len(df)*100:.1f}%"}
        for c in sorted(FOLDER_TO_CLASS.values()):
            row[c] = c_counts.get(c, 0)
        summary_rows.append(row)
    
    summary_df = pd.DataFrame(summary_rows)
    print(summary_df.to_string(index=False))
    
    # Check for duplicate images across splits
    train_files = set(train_df['filename'])
    val_files = set(val_df['filename'])
    test_files = set(test_df['filename'])
    
    overlap_tv = train_files.intersection(val_files)
    overlap_tt = train_files.intersection(test_files)
    overlap_vt = val_files.intersection(test_files)
    
    print(f"\nLeakage Check:")
    print(f"  Train & Val overlap: {len(overlap_tv)}")
    print(f"  Train & Test overlap: {len(overlap_tt)}")
    print(f"  Val & Test overlap: {len(overlap_vt)}")
    assert len(overlap_tv) == 0 and len(overlap_tt) == 0 and len(overlap_vt) == 0, "Data leakage detected!"
    print("  => Zero overlap confirmed across all splits.")
    
    print("\n=== Step 3: Copying Images into ml/dataset/ ===")
    for split_name, split_data in splits.items():
        for class_name in FOLDER_TO_CLASS.values():
            target_dir = os.path.join(BASE_OUT_DIR, split_name, class_name)
            os.makedirs(target_dir, exist_ok=True)
            
        for _, row in split_data.iterrows():
            target_path = os.path.join(BASE_OUT_DIR, split_name, row['class_name'], row['filename'])
            if not os.path.exists(target_path):
                shutil.copy2(row['src_path'], target_path)
                
    print("\nAll files successfully organized into ml/dataset/train, ml/dataset/validation, and ml/dataset/test!")
    
    # Save split metadata for reproducibility
    train_df.assign(split="train").to_csv(os.path.join(BASE_OUT_DIR, "train_split.csv"), index=False)
    val_df.assign(split="validation").to_csv(os.path.join(BASE_OUT_DIR, "val_split.csv"), index=False)
    test_df.assign(split="test").to_csv(os.path.join(BASE_OUT_DIR, "test_split.csv"), index=False)
    print("Split CSVs saved to ml/dataset/ directory.")

if __name__ == "__main__":
    create_dataset_splits()
