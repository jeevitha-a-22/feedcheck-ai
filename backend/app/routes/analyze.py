import os
import time
import base64
from datetime import datetime
from typing import Optional, List, Union
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from ..services.predictor import get_predictor
from ..services.risk_engine import evaluate_risk
from ..services.advisory import generate_advisory
from .history import add_record_to_store

router = APIRouter(tags=["Analysis"])

FEED_TYPE_NAMES = {
    "corn_silage": "Whole-Crop Corn Silage",
    "grass_silage": "Grass & Forage Silage",
    "alfalfa_haylage": "Alfalfa Haylage",
    "tmr_ration": "Total Mixed Ration (TMR)",
    "sorghum_silage": "Forage Sorghum Silage",
    "cereal_grain": "Small Grain / Barley Silage"
}

@router.post("/analyze")
async def analyze_sample(
    image: Optional[UploadFile] = File(None),
    ph: Optional[str] = Form(None),
    pH: Optional[str] = Form(None),
    moisture: Optional[str] = Form(None),
    temperature: Optional[str] = Form(None),
    feed_type_id: Optional[str] = Form("corn_silage"),
    farm_location: Optional[str] = Form("North Bunker Lot 1"),
    batch_id: Optional[str] = Form(None)
):
    """
    POST /analyze
    Receives sample image and sensor measurements (pH, moisture, temperature).
    Runs MobileNetV2 FBSI transfer learning model inference, rule-based risk evaluation,
    and returns comprehensive prototype screening results with advisory.
    """
    # 1. Validate Image
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required image file. Please provide a sample photo."
        )

    try:
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise ValueError("Uploaded image file is empty.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read image upload: {str(e)}"
        )

    # 2. Validate Measurements
    ph_raw = ph if ph is not None else pH
    if ph_raw is None or str(ph_raw).strip() == '':
        raise HTTPException(status_code=400, detail="Please enter silage pH.")
    try:
        ph_val = float(ph_raw)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pH reading. Expected numeric value (e.g. 3.9).")

    if moisture is None or str(moisture).strip() == '':
        raise HTTPException(status_code=400, detail="Please enter moisture content.")
    try:
        moisture_val = float(moisture)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid moisture value. Expected numeric percentage (e.g. 65.0).")

    if temperature is None or str(temperature).strip() == '':
        raise HTTPException(status_code=400, detail="Please enter core temperature.")
    try:
        temp_val = float(temperature)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid temperature value. Expected numeric reading in °C (e.g. 22).")

    # 3. Model Inference via MobileNetV2
    try:
        predictor = get_predictor()
        pred_result = predictor.predict(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(e)}"
        )

    fbsi_score = pred_result["fbsi_score"]
    confidence = pred_result["confidence"]
    class_probs = pred_result["class_probabilities"]

    feed_name = FEED_TYPE_NAMES.get(feed_type_id, "Silage Sample")

    # 4. Risk Engine Evaluation (Prototype screening logic)
    risk_assessment = evaluate_risk(
        fbsi_score=fbsi_score,
        fbsi_confidence=confidence,
        ph=ph_val,
        moisture=moisture_val,
        temperature=temp_val,
        feed_type_name=feed_name
    )

    screening_result = risk_assessment["screening_result"]
    risk_level = risk_assessment["risk_level"]
    quality = risk_assessment["quality"]
    score_idx = risk_assessment["score_index"]
    visual_indicators = risk_assessment["visual_indicators"]
    evidence = risk_assessment["evidence"]
    flags = risk_assessment["flags"]
    metric_status = risk_assessment["metrics_status"]

    # 5. Farmer Advisory Generation (Prototype screening guidance)
    advisory_data = generate_advisory(
        screening_result=screening_result,
        risk_level=risk_level,
        fbsi_score=fbsi_score,
        ph=ph_val,
        moisture=moisture_val,
        temperature=temp_val
    )

    # Encode uploaded image to data URL for frontend rendering
    content_type = image.content_type or "image/jpeg"
    b64_image = f"data:{content_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    test_id = f"test-{int(time.time() * 1000)}"
    timestamp_iso = datetime.utcnow().isoformat() + "Z"
    batch_identifier = batch_id or f"BATCH-{datetime.utcnow().year}-{int(time.time()) % 10000:04d}"

    # Build cleaned response contract
    response_payload = {
        "id": test_id,
        "fbsi_score": fbsi_score,
        "confidence": confidence,
        "class_probabilities": class_probs,
        "screening_result": screening_result,
        "quality": quality,
        "risk_level": risk_level,
        "score": score_idx,
        "assessment_basis": risk_assessment.get("assessment_basis", [
            "AI visual screening using the FBSI classifier",
            "Field pH measurement",
            "Field moisture measurement",
            "Field temperature measurement"
        ]),
        "visual_indicators": visual_indicators,
        "evidence": evidence,
        "flags": flags,
        "advisory": advisory_data["recommendations"],
        "advisory_details": advisory_data,
        "feed_type": feed_name,
        "feed_type_id": feed_type_id,
        "farm_location": farm_location or "Main Bunker Lot",
        "batch_id": batch_identifier,
        "image_url": b64_image,
        "timestamp": timestamp_iso,
        "metrics": {
            "moisture": {
                "value": moisture_val,
                "unit": "%",
                "status": metric_status.get("moisture", "within_range"),
                "range": "60 - 70%",
                "source": "field_input"
            },
            "pH": {
                "value": ph_val,
                "unit": "pH",
                "status": metric_status.get("pH", "within_range"),
                "range": "3.8 - 4.3",
                "source": "field_input"
            },
            "temperature": {
                "value": temp_val,
                "unit": "°C",
                "status": metric_status.get("temperature", "within_range"),
                "range": "< 28°C",
                "source": "field_input"
            }
        },
        "limitations": risk_assessment.get("limitations", [
            "Prototype screening only; not a laboratory analysis.",
            "Visual screening does not confirm toxins, mycotoxins, mold contamination, or nutritional composition.",
            "Does not confirm laboratory feed quality or safety guarantees.",
            "Configured ranges should be validated against field and laboratory measurements before production deployment."
        ])
    }

    # Store for cross-device QR batch verification
    add_record_to_store(response_payload)

    return response_payload
