import os
import glob
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict

RAW_DATASET_DIR = r"C:\Users\jeevitha\Downloads\Feed Bunk Score Images - FBSI\Feed Bunk Score Images - FBSI"

print("--- Inspecting RAW FBSI Dataset ---")
print("Base Path:", RAW_DATASET_DIR)

# List subdirectories
if os.path.exists(RAW_DATASET_DIR):
    subdirs = os.listdir(RAW_DATASET_DIR)
    print("Found entries:", subdirs)
else:
    print("ERROR: Dataset directory does not exist!")

img_dir = os.path.join(RAW_DATASET_DIR, "dataset")
xml_dir = os.path.join(RAW_DATASET_DIR, "xml")
cv_dir = os.path.join(RAW_DATASET_DIR, "cross_validation")

print("\n--- Inspecting Images ---")
if os.path.exists(img_dir):
    for sub in sorted(os.listdir(img_dir)):
        sub_path = os.path.join(img_dir, sub)
        if os.path.isdir(sub_path):
            imgs = [f for f in os.listdir(sub_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            print(f"  Class folder '{sub}': {len(imgs)} images")
            if imgs:
                print(f"    Sample filenames: {imgs[:3]}")

print("\n--- Inspecting XML Annotations ---")
if os.path.exists(xml_dir):
    for sub in sorted(os.listdir(xml_dir)):
        sub_path = os.path.join(xml_dir, sub)
        if os.path.isdir(sub_path):
            xmls = [f for f in os.listdir(sub_path) if f.lower().endswith('.xml')]
            print(f"  XML folder '{sub}': {len(xmls)} xml files")
            # Parse a few sample xmls to see tags
            if xmls:
                sample_xml = os.path.join(sub_path, xmls[0])
                try:
                    tree = ET.parse(sample_xml)
                    root = tree.getroot()
                    tags = {elem.tag: elem.text for elem in root.iter()}
                    print(f"    Sample XML '{xmls[0]}' tags: {list(tags.keys())}")
                    for k, v in list(tags.items())[:8]:
                        print(f"      {k}: {v}")
                except Exception as e:
                    print(f"    Error reading XML: {e}")

print("\n--- Inspecting Cross Validation CSVs ---")
if os.path.exists(cv_dir):
    for cv in sorted(os.listdir(cv_dir)):
        cv_path = os.path.join(cv_dir, cv)
        if os.path.isdir(cv_path):
            files = os.listdir(cv_path)
            print(f"  CV folder '{cv}': {files}")
            # read first line of Train.csv if exists
            train_csv = os.path.join(cv_path, "Train.csv")
            if os.path.exists(train_csv):
                with open(train_csv, 'r') as f:
                    head = [f.readline().strip() for _ in range(3)]
                    print(f"    Train.csv preview: {head}")
