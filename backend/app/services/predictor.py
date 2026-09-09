import os
import json
import io
import numpy as np
from PIL import Image
import tensorflow as tf

# Dynamic base directory and model path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))

CANDIDATE_MODEL_PATHS = [
    os.environ.get("FBSI_MODEL_PATH"),
    os.environ.get("MODEL_PATH"),
    os.path.join(CURRENT_DIR, "..", "models", "fbsi_mobilenetv2.keras"),
    os.path.join(PROJECT_ROOT, "backend", "app", "models", "fbsi_mobilenetv2.keras"),
    os.path.join(PROJECT_ROOT, "ml", "outputs", "models", "fbsi_mobilenetv2.keras"),
    os.path.join(PROJECT_ROOT, "models", "fbsi_mobilenetv2.keras"),
]

CANDIDATE_INDICES_PATHS = [
    os.environ.get("CLASS_INDICES_PATH"),
    os.path.join(CURRENT_DIR, "..", "models", "class_indices.json"),
    os.path.join(PROJECT_ROOT, "backend", "app", "models", "class_indices.json"),
    os.path.join(PROJECT_ROOT, "ml", "outputs", "models", "class_indices.json"),
    os.path.join(PROJECT_ROOT, "models", "class_indices.json"),
]

def resolve_file_path(candidates):
    for path in candidates:
        if path and os.path.exists(path):
            return os.path.abspath(path)
    return None

MODEL_PATH = resolve_file_path(CANDIDATE_MODEL_PATHS) or CANDIDATE_MODEL_PATHS[2]
CLASS_INDICES_PATH = resolve_file_path(CANDIDATE_INDICES_PATHS) or CANDIDATE_INDICES_PATHS[1]

FALLBACK_CLASSES = ["score_0", "score_1", "score_1_2", "score_2", "score_3", "score_4"]

class FBSIPredictor:
    def __init__(self, model_path=None, class_indices_path=None):
        self.model_path = model_path or resolve_file_path(CANDIDATE_MODEL_PATHS) or MODEL_PATH
        self.class_indices_path = class_indices_path or resolve_file_path(CANDIDATE_INDICES_PATHS) or CLASS_INDICES_PATH
        self.model = None
        self.class_names = []
        self._load_class_names()
        self._load_model()

    def _load_class_names(self):
        if self.class_indices_path and os.path.exists(self.class_indices_path):
            try:
                with open(self.class_indices_path, "r") as f:
                    mapping = json.load(f)
                    self.class_names = [mapping[str(i)] if str(i) in mapping else mapping[i] for i in range(len(mapping))]
                print(f"[Predictor] Loaded class mapping from: {self.class_indices_path}")
                return
            except Exception as e:
                print(f"[Predictor] Warning reading class indices: {e}")
        self.class_names = FALLBACK_CLASSES

    def _load_model(self):
        if not self.model_path or not os.path.exists(self.model_path):
            raise FileNotFoundError(f"FBSI model not found at {self.model_path}. Ensure ML model file is included in deployment.")
        print(f"[Predictor] Loading FBSI MobileNetV2 from: {self.model_path}")
        self.model = tf.keras.models.load_model(self.model_path)
        print("[Predictor] Model loaded successfully.")

    def preprocess_image(self, image_data):
        """
        Prepares image for MobileNetV2 feature extractor.
        Accepts raw bytes, PIL Image, or file path.
        """
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        elif isinstance(image_data, str):
            image = Image.open(image_data).convert("RGB")
        elif isinstance(image_data, Image.Image):
            image = image_data.convert("RGB")
        else:
            raise ValueError("Unsupported image input format. Expected bytes, path, or PIL.Image.")

        image = image.resize((224, 224), Image.Resampling.BILINEAR)
        img_array = np.array(image, dtype=np.float32)
        img_tensor = np.expand_dims(img_array, axis=0)
        return img_tensor

    def predict(self, image_data):
        """
        Runs inference on feed bunk image.
        Returns predicted FBSI score, confidence, and class probabilities.
        """
        if self.model is None:
            self._load_model()

        img_tensor = self.preprocess_image(image_data)
        preds = self.model.predict(img_tensor, verbose=0)[0]
        
        pred_idx = int(np.argmax(preds))
        confidence = float(preds[pred_idx])
        predicted_score = self.class_names[pred_idx]

        probabilities = {self.class_names[i]: float(preds[i]) for i in range(len(self.class_names))}

        return {
            "fbsi_score": predicted_score,
            "confidence": round(confidence, 4),
            "class_probabilities": {k: round(v, 4) for k, v in probabilities.items()}
        }

# Global singleton predictor instance
_predictor_instance = None

def get_predictor():
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = FBSIPredictor()
    return _predictor_instance
