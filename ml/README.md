# FeedCheck AI — FBSI Vision Model Pipeline

This sub-pipeline implements computer vision transfer learning using **MobileNetV2** (pre-trained on ImageNet) to classify feed bunk images into standardized **Feed Bunk Score Index (FBSI)** scores.

---

## 1. What the Model Does

The FBSI model analyzes feed bunk and silage bunk images to quantify remaining feed quantity according to the standard 6-class Feed Bunk Score Index:

| FBSI Score Class | Bunk Description & Definition | Target Management Action |
|---|---|---|
| `score_0` | **Score 0**: 0% feed remaining; completely bare/slick bunk | Increase feed delivery |
| `score_1_2` | **Score 0.5**: Scattered feed remnants remaining (< 5% of delivered feed) | Increase feed delivery |
| `score_1` | **Score 1**: Thin uniform layer across bottom (approx. 5% remaining) | Maintain current ration |
| `score_2` | **Score 2**: 25% to 50% feed remaining (uneven crowns and piles) | Decrease feed delivery |
| `score_3` | **Score 3**: > 50% feed remaining throughout bunk | Decrease feed delivery |
| `score_4` | **Score 4**: Virtually untouched feed (100% remaining) | Investigate herd health / decrease |

---

## 2. Model Architecture & Pipeline

- **Feature Extractor**: MobileNetV2 pre-trained on ImageNet (frozen initially, fine-tuned in later layers).
- **Input Dimensions**: 224 × 224 × 3 RGB.
- **Data Augmentation**: Random horizontal flipping, random rotation ($\pm 8\%$), random zoom ($\pm 8\%$), and subtle contrast adjustment to ensure robust feature invariance across varying farm lighting.
- **Classification Head**:
  - Global Average Pooling 2D
  - Batch Normalization
  - Dense (256 units, ReLU activation, L2 regularization)
  - Dropout (40%)
  - Dense (6 units, Softmax activation)
- **Class Imbalance Handling**: Inverse class weighting applied during training loss calculation to prevent dominance by majority classes (`score_4`, `score_3`).
- **Two-Stage Optimization**:
  1. **Phase 1**: Frozen base with classification head trained using Adam ($\text{lr} = 10^{-3}$) with EarlyStopping and ReduceLROnPlateau.
  2. **Phase 2**: Unfrozen top 30 MobileNetV2 layers fine-tuned at $\text{lr} = 10^{-5}$.

---

## 3. Dataset Breakdown

- **Total Images**: 1,511 real bunk images
- **Train Set (70.0%)**: 1,057 images
- **Validation Set (15.0%)**: 227 images
- **Test Set (15.0%)**: 227 images (completely untouched during training and tuning)

| Class | Train | Validation | Test | Total |
|---|:---:|:---:|:---:|:---:|
| `score_0` | 59 | 13 | 13 | 85 |
| `score_1` | 185 | 40 | 40 | 265 |
| `score_1_2` | 186 | 40 | 40 | 266 |
| `score_2` | 83 | 17 | 18 | 118 |
| `score_3` | 189 | 41 | 40 | 270 |
| `score_4` | 355 | 76 | 76 | 507 |
| **Total** | **1,057** | **227** | **227** | **1,511** |

---

## 4. Scope & Strict Model Limitations

> [!IMPORTANT]
> **Scope Boundaries & Prohibitions**:
> - **FBSI Score Only**: This computer vision model predicts **only** the Feed Bunk Score index (`score_0` through `score_4`).
> - **No Chemical/Sensory Extrapolations**: The vision model does **NOT** predict pH, moisture content, protein, fiber, or aflatoxin/mycotoxins from visual pixels.
> - **No Direct Quality Claims**: FBSI reflects physical feed quantity/intake dynamics. An empty bunk (`score_0`) or full bunk (`score_4`) does not inherently mean "good" or "poor" biochemical silage quality.
> - **Camera Angle Dependency**: Best results require photos taken overlooking the feed bunk cross-section with adequate lighting.

---

## 5. Usage & Inference

### Running Prediction from CLI:
```bash
python ml/src/predict.py path/to/bunk_image.jpg
```

### Python API:
```python
from ml.src.predict import predict_fbsi

result = predict_fbsi("path/to/bunk_image.jpg")
print(f"Predicted FBSI Score: {result['predicted_score']}")
print(f"Confidence: {result['confidence'] * 100:.2f}%")
print("Probabilities:", result['class_probabilities'])
```

---

## 6. Output Artifacts

- Model checkpoint: `ml/outputs/models/fbsi_mobilenetv2.keras`
- Class mapping: `ml/outputs/models/class_indices.json`
- Training curves: `ml/outputs/graphs/training_history.png`
- Confusion matrix: `ml/outputs/graphs/confusion_matrix.png`
- Evaluation report: `ml/outputs/evaluation_results.json`
