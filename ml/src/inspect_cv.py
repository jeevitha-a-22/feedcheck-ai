import pandas as pd
import os

cv_base = r"C:\Users\jeevitha\Downloads\Feed Bunk Score Images - FBSI\Feed Bunk Score Images - FBSI\cross_validation\cv_1\split_1"
for split in ["Train.csv", "Val.csv", "Test.csv"]:
    p = os.path.join(cv_base, split)
    if os.path.exists(p):
        df = pd.read_csv(p)
        print(f"--- {split} --- (total: {len(df)})")
        print("Columns:", df.columns.tolist())
        print("Score counts:\n", df['score'].value_counts() if 'score' in df.columns else df.iloc[:, -1].value_counts())
        if 'farm' in df.columns:
            print("Farm counts:\n", df['farm'].value_counts())
        print()
