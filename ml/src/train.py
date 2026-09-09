import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Set random seeds for reproducibility
SEED = 42
tf.keras.utils.set_random_seed(SEED)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(OUTPUTS_DIR, "models")
GRAPHS_DIR = os.path.join(OUTPUTS_DIR, "graphs")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(GRAPHS_DIR, exist_ok=True)

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_CLASSES = 6
CLASSES = ["score_0", "score_1", "score_1_2", "score_2", "score_3", "score_4"]

def build_datasets():
    print(f"Loading datasets from {DATASET_DIR}...")
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATASET_DIR, "train"),
        labels='inferred',
        label_mode='categorical',
        class_names=CLASSES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=True,
        seed=SEED
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATASET_DIR, "validation"),
        labels='inferred',
        label_mode='categorical',
        class_names=CLASSES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False
    )
    
    test_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATASET_DIR, "test"),
        labels='inferred',
        label_mode='categorical',
        class_names=CLASSES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False
    )
    
    # Prefetch for performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.prefetch(buffer_size=AUTOTUNE)
    
    return train_ds, val_ds, test_ds

def calculate_class_weights():
    # Count images per class in train directory
    train_dir = os.path.join(DATASET_DIR, "train")
    counts = []
    for c in CLASSES:
        c_path = os.path.join(train_dir, c)
        c_count = len([f for f in os.listdir(c_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        counts.append(c_count)
    
    total = sum(counts)
    class_weights = {}
    print("\n--- Training Set Class Counts & Weights ---")
    for i, (c, cnt) in enumerate(zip(CLASSES, counts)):
        # balanced weight formula: total / (num_classes * count)
        w = total / (NUM_CLASSES * cnt)
        class_weights[i] = float(w)
        print(f"  Class {i} ({c}): {cnt} samples -> weight: {w:.4f}")
        
    return class_weights

def build_fbsi_model():
    print("\n--- Constructing MobileNetV2 Transfer Learning Architecture ---")
    # Base feature extractor pretrained on ImageNet
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    # Freeze the base feature extractor initially
    base_model.trainable = False
    
    # Augmentation layers (active only during training)
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.08),
        layers.RandomZoom(0.08),
        layers.RandomContrast(0.08),
    ], name="data_augmentation")
    
    # Model definition
    inputs = tf.keras.Input(shape=(224, 224, 3), name="input_image")
    x = data_augmentation(inputs)
    # Preprocess input for MobileNetV2 (scales [-1, 1])
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    # Feature extraction
    x = base_model(x, training=False)
    # 6-class classification head
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="head_batchnorm")(x)
    x = layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(1e-4), name="head_dense_1")(x)
    x = layers.Dropout(0.4, name="head_dropout")(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax', name="fbsi_classification_head")(x)
    
    model = tf.keras.Model(inputs, outputs, name="FBSI_MobileNetV2")
    return model, base_model

def train():
    train_ds, val_ds, test_ds = build_datasets()
    class_weights = calculate_class_weights()
    
    model, base_model = build_fbsi_model()
    model.summary()
    
    # --- PHASE 1: Train classification head with frozen base ---
    print("\n==========================================")
    print("PHASE 1: Training Classification Head")
    print("==========================================")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks_p1 = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1
        )
    ]
    
    history_p1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        class_weight=class_weights,
        callbacks=callbacks_p1,
        verbose=1
    )
    
    # --- PHASE 2: Fine-tune top layers of MobileNetV2 ---
    print("\n==========================================")
    print("PHASE 2: Fine-Tuning MobileNetV2 Top Layers")
    print("==========================================")
    
    # Unfreeze top layers of base model
    base_model.trainable = True
    # Freeze all layers except the last 30 layers
    fine_tune_at = len(base_model.layers) - 30
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
        
    print(f"Unfrozen {len(base_model.layers) - fine_tune_at} top layers in MobileNetV2 base.")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks_p2 = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    history_p2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        class_weight=class_weights,
        callbacks=callbacks_p2,
        verbose=1
    )
    
    # --- Save Trained Model & Class Metadata ---
    model_path = os.path.join(MODELS_DIR, "fbsi_mobilenetv2.keras")
    model.save(model_path)
    print(f"\n[OK] Model successfully saved to: {model_path}")
    
    class_indices_path = os.path.join(MODELS_DIR, "class_indices.json")
    class_mapping = {i: c for i, c in enumerate(CLASSES)}
    with open(class_indices_path, "w") as f:
        json.dump(class_mapping, f, indent=2)
    print(f"[OK] Class indices saved to: {class_indices_path}")
    
    # --- Plot Training History ---
    plot_training_curves(history_p1, history_p2)
    
    return model, test_ds

def plot_training_curves(h1, h2):
    acc = h1.history['accuracy'] + h2.history['accuracy']
    val_acc = h1.history['val_accuracy'] + h2.history['val_accuracy']
    loss = h1.history['loss'] + h2.history['loss']
    val_loss = h1.history['val_loss'] + h2.history['val_loss']
    
    epochs_range = range(1, len(acc) + 1)
    split_epoch = len(h1.history['accuracy'])
    
    plt.figure(figsize=(14, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Train Accuracy', color='#10B981', lw=2)
    plt.plot(epochs_range, val_acc, label='Val Accuracy', color='#3B82F6', lw=2)
    plt.axvline(x=split_epoch, color='gray', linestyle='--', label='Fine-Tuning Start')
    plt.title('FBSI Training & Validation Accuracy', fontsize=12, fontweight='bold')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Train Loss', color='#EF4444', lw=2)
    plt.plot(epochs_range, val_loss, label='Val Loss', color='#F59E0B', lw=2)
    plt.axvline(x=split_epoch, color='gray', linestyle='--', label='Fine-Tuning Start')
    plt.title('FBSI Training & Validation Loss', fontsize=12, fontweight='bold')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend(loc='upper right')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    chart_path = os.path.join(GRAPHS_DIR, "training_history.png")
    plt.savefig(chart_path, dpi=300)
    plt.close()
    print(f"[OK] Training history chart saved to: {chart_path}")

if __name__ == "__main__":
    train()
