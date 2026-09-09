import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(OUTPUTS_DIR, "models")
GRAPHS_DIR = os.path.join(OUTPUTS_DIR, "graphs")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
CLASSES = ["score_0", "score_1", "score_1_2", "score_2", "score_3", "score_4"]

def evaluate_test_set():
    model_path = os.path.join(MODELS_DIR, "fbsi_mobilenetv2.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
        
    print(f"Loading trained FBSI model from: {model_path}")
    model = tf.keras.models.load_model(model_path)
    
    test_dir = os.path.join(DATASET_DIR, "test")
    print(f"Loading test set from: {test_dir}")
    
    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels='inferred',
        label_mode='categorical',
        class_names=CLASSES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False
    )
    
    # Collect true labels and predictions
    y_true_list = []
    y_pred_probs_list = []
    
    for images, labels in test_ds:
        probs = model.predict(images, verbose=0)
        y_pred_probs_list.append(probs)
        y_true_list.append(labels.numpy())
        
    y_true_cat = np.concatenate(y_true_list, axis=0)
    y_pred_probs = np.concatenate(y_pred_probs_list, axis=0)
    
    y_true = np.argmax(y_true_cat, axis=1)
    y_pred = np.argmax(y_pred_probs, axis=1)
    
    # Calculate Overall Metrics
    acc = accuracy_score(y_true, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average='macro')
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted')
    
    print("\n=======================================================")
    print("           FBSI TEST SET EVALUATION REPORT            ")
    print("=======================================================")
    print(f"Total Test Samples: {len(y_true)}")
    print(f"Test Accuracy:      {acc * 100:.2f}%")
    print(f"Macro Precision:    {p_macro * 100:.2f}%")
    print(f"Macro Recall:       {r_macro * 100:.2f}%")
    print(f"Macro F1-Score:     {f1_macro * 100:.2f}%")
    print(f"Weighted F1-Score:  {f1_weighted * 100:.2f}%")
    print("-------------------------------------------------------")
    
    # Detailed Classification Report
    clf_report_dict = classification_report(y_true, y_pred, target_names=CLASSES, output_dict=True)
    clf_report_str = classification_report(y_true, y_pred, target_names=CLASSES, digits=4)
    print("\nPer-Class Classification Report:\n")
    print(clf_report_str)
    
    # Compute Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    print("Confusion Matrix:\n", cm)
    
    # Plot Confusion Matrix
    cm_path = os.path.join(GRAPHS_DIR, "confusion_matrix.png")
    plot_confusion_matrix(cm, CLASSES, cm_path)
    print(f"\n[OK] Confusion matrix plot saved to: {cm_path}")
    
    # Save results JSON
    results = {
        "test_samples": int(len(y_true)),
        "accuracy": float(acc),
        "macro_precision": float(p_macro),
        "macro_recall": float(r_macro),
        "macro_f1": float(f1_macro),
        "weighted_f1": float(f1_weighted),
        "confusion_matrix": cm.tolist(),
        "per_class_metrics": clf_report_dict
    }
    
    results_path = os.path.join(OUTPUTS_DIR, "evaluation_results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[OK] Full evaluation results saved to: {results_path}")
    
    return results

def plot_confusion_matrix(cm, class_names, save_path):
    plt.figure(figsize=(8, 7))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('FBSI MobileNetV2 - Test Set Confusion Matrix', fontsize=13, fontweight='bold', pad=15)
    plt.colorbar()
    
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=45, ha='right', fontsize=10)
    plt.yticks(tick_marks, class_names, fontsize=10)
    
    # Threshold for text coloring
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val = cm[i, j]
            plt.text(j, i, f"{val}",
                     horizontalalignment="center",
                     verticalalignment="center",
                     color="white" if val > thresh else "black",
                     fontsize=11, fontweight='bold')
            
    plt.ylabel('True FBSI Class', fontsize=11, fontweight='bold')
    plt.xlabel('Predicted FBSI Class', fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()

if __name__ == "__main__":
    evaluate_test_set()
