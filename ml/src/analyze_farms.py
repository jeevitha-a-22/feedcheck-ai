import pandas as pd
import os

csv_path = r"C:\Users\jeevitha\Downloads\Feed Bunk Score Images - FBSI\Feed Bunk Score Images - FBSI\annotations.csv"
df = pd.read_csv(csv_path)

print("Columns:", df.columns.tolist())
print(f"Total rows: {len(df)}")
print("\nUnique Scores:", df['score'].unique())
print("Score distribution:\n", df['score'].value_counts())
print("\nUnique Farms:", df['farm'].unique())
print("Farm counts:\n", df['farm'].value_counts())

print("\nCrosstab Farm vs Score:")
print(pd.crosstab(df['farm'], df['score']))
