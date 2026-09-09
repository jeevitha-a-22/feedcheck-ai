"""
ML Configuration & Hyperparameters
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "dataset"
OUTPUTS_DIR = BASE_DIR / "outputs"
MODELS_DIR = OUTPUTS_DIR / "models"
GRAPHS_DIR = OUTPUTS_DIR / "graphs"

CLASSES = ["good", "moderate", "poor"]
NUM_CLASSES = len(CLASSES)

IMAGE_SIZE = 224
BATCH_SIZE = 32
LEARNING_RATE = 1e-4
NUM_EPOCHS = 20
PRETRAINED_MODEL = "mobilenet_v2"
