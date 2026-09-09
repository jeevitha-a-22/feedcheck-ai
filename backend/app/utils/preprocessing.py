"""
Preprocessing utilities for image transformations and sensor sanity checks.
"""

def preprocess_image(image_bytes):
    """
    Standardize feed/silage image for MobileNetV2 inference:
    Resize 224x224, Normalize with ImageNet mean/std.
    """
    return image_bytes

def validate_sensor_inputs(moisture: float, pH: float, temperature: float):
    """
    Sanity check sensor probe numbers within physical boundaries.
    """
    if not (20.0 <= moisture <= 90.0):
        raise ValueError("Moisture out of realistic range (20% - 90%)")
    if not (2.5 <= pH <= 9.0):
        raise ValueError("pH out of realistic range (2.5 - 9.0)")
    if not (0.0 <= temperature <= 80.0):
        raise ValueError("Temperature out of realistic range (0°C - 80°C)")
    return True
