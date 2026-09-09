import os
import sys
import json
import argparse
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "outputs", "models", "fbsi_mobilenetv2.keras")
DEFAULT_CLASSES_PATH = os.path.join(BASE_DIR, "outputs", "models", "class_indices.json")

FALLBACK_CLASSES = ["score_0", "score_1", "score_1_2", "score_2", "score_3", "score_4"]

# Global cache for loaded model
_MODEL_CACHE = None
_CLASSES_CACHE = None

def get_class_names(classes_path=DEFAULT_CLASSES_PATH):
    global _CLASSES_CACHE
    if _CLASSES_CACHE is not None:
        return _CLASSES_CACHE
    if os.path.exists(classes_path):
        try:
            with open(classes_path, "r") as f:
                mapping = json.load(f)
                _CLASSES_CACHE = [mapping[str(i)] if str(i) in mapping else mapping[i] for i in range(len(mapping))]
                return _CLASSES_CACHE
        except Exception:
            pass
    _CLASSES_CACHE = FALLBACK_CLASSES
    return _CLASSES_CACHE

def load_fbsi_model(model_path=DEFAULT_MODEL_PATH):
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}. Please train the model first.")
    _MODEL_CACHE = tf.keras.models.load_model(model_path)
    return _MODEL_CACHE

def preprocess_image(image_input):
    """
    Accepts either a file path string or a PIL Image instance.
    Resizes to (224, 224) and converts to numpy array.
    """
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise FileNotFoundError(f"Image not found at: {image_input}")
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    else:
        raise ValueError("Unsupported image input type. Expected filepath string or PIL.Image.")
        
    img = img.resize((224, 224), Image.Resampling.BILINEAR)
    img_array = np.array(img, dtype=np.float32)
    # Add batch dimension: (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_fbsi(image_path_or_pil, model_path=DEFAULT_MODEL_PATH):
    """
    Inference function for FBSI image classification.
    
    Returns:
    {
        "predicted_score": "score_1_2",
        "confidence": 0.8924,
        "class_probabilities": { ... }
    }
    """
    model = load_fbsi_model(model_path)
    class_names = get_class_names()
    
    img_tensor = preprocess_image(image_path_or_pil)
    
    # Model includes mobilenet_v2.preprocess_input inside its architecture
    preds = model.predict(img_tensor, verbose=0)[0]
    
    pred_idx = int(np.argmax(preds))
    confidence = float(preds[pred_idx])
    predicted_score = class_names[pred_idx]
    
    class_probabilities = {class_names[i]: float(preds[i]) for i in range(len(class_names))}
    
    return {
        "predicted_score": predicted_score,
        "confidence": round(confidence, 4),
        "class_probabilities": {k: round(v, 4) for k, v in class_probabilities.items()}
    }

def main():
    parser = argparse.ArgumentParser(description="FeedCheck AI - FBSI Image Classifier Predictor")
    parser.add_argument("image_path", type=str, help="Path to feed bunk image file")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL_PATH, help="Path to saved .keras model")
    
    args = parser.parse_args()
    
    print(f"\nAnalyzing image: {args.image_path}")
    result = predict_fbsi(args.image_path, model_path=args.model)
    
    print("\n--- Prediction Result ---")
    print(f"Predicted FBSI Score: {result['predicted_score']}")
    print(f"Confidence:           {result['confidence'] * 100:.2f}%")
    print("\nClass Probabilities:")
    for cls_name, prob in result["class_probabilities"].items():
        bar = "=" * int(prob * 25)
        print(f"  {cls_name:10s} : {prob*100:6.2f}% [{bar:<25s}]")
    print("-------------------------\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ml/src/predict.py <path_to_image>")
        sys.exit(1)
    main()
