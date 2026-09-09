from typing import Dict, Any, List


FBSI_DESCRIPTIONS = {
    "score_0": "FBSI Score 0: Bare/slick bunk with approximately 0% feed remaining",
    "score_1_2": "FBSI Score 0.5: Scattered feed remnants with less than approximately 5% remaining",
    "score_1": "FBSI Score 1: Thin, relatively uniform layer across the bunk floor",
    "score_2": "FBSI Score 2: Approximately 25% to 50% feed remaining with visible crowns/piles",
    "score_3": "FBSI Score 3: More than approximately 50% feed remaining",
    "score_4": "FBSI Score 4: Feed appears largely untouched",
}


def evaluate_risk(
    fbsi_score: str,
    fbsi_confidence: float,
    ph: float,
    moisture: float,
    temperature: float,
    feed_type_name: str = "Corn Silage",
) -> Dict[str, Any]:
    """
    Prototype screening engine.

    Combines:
    1. AI-based FBSI visual screening
    2. User/field-entered pH
    3. User/field-entered moisture
    4. User/field-entered temperature

    IMPORTANT:
    This is a screening/risk assessment system.
    It does not perform laboratory chemical analysis or confirm
    contamination, mold, toxins, or feed safety.
    """

    flags: List[str] = []
    evidence: List[str] = []
    visual_indicators: List[str] = []

    # ---------------------------------------------------------
    # 1. AI VISUAL SCREENING
    # ---------------------------------------------------------

    bunk_desc = FBSI_DESCRIPTIONS.get(
        fbsi_score,
        f"Visual FBSI Score: {fbsi_score}",
    )

    confidence_pct = fbsi_confidence * 100

    visual_indicators.append(
        f"AI Visual Screening: {bunk_desc} "
        f"(Model Confidence: {confidence_pct:.1f}%)"
    )

    if fbsi_score == "score_0":
        visual_indicators.append(
            "Bunk surface appears to have minimal visible feed residue."
        )
        visual_indicators.append(
            "Visual pattern is consistent with a low residual feed level."
        )

    elif fbsi_score == "score_1_2":
        visual_indicators.append(
            "Scattered residual feed particles are visible along the bunk floor."
        )
        visual_indicators.append(
            "Visual pattern indicates a relatively low residual feed level."
        )

    elif fbsi_score == "score_1":
        visual_indicators.append(
            "A relatively uniform thin layer of feed is visible along the bunk base."
        )
        visual_indicators.append(
            "Visual pattern indicates a relatively low residual feed level."
        )

    elif fbsi_score == "score_2":
        visual_indicators.append(
            "Moderate residual feed volume is visible across the bunk."
        )
        visual_indicators.append(
            "Uneven feed accumulation is visible in parts of the bunk."
        )

    elif fbsi_score == "score_3":
        visual_indicators.append(
            "A relatively high residual feed volume is visible."
        )
        visual_indicators.append(
            "Substantial unconsumed feed appears to remain across the bunk."
        )

    elif fbsi_score == "score_4":
        visual_indicators.append(
            "A large amount of feed appears to remain in the bunk."
        )
        visual_indicators.append(
            "Visual pattern is consistent with a high residual feed level."
        )

    # ---------------------------------------------------------
    # 2. FIELD MEASUREMENT SCREENING
    # ---------------------------------------------------------

    # pH:
    # Configured prototype screening range: 3.8 - 4.3
    is_ph_danger = ph > 4.7 or ph < 3.5
    is_ph_warning = 4.3 < ph <= 4.7

    if is_ph_danger:
        flags.append(
            f"pH reading ({ph:.2f}) is outside the configured "
            "screening range (3.8 - 4.3)."
        )
        evidence.append(
            f"Field pH reading ({ph:.2f}) is outside the configured "
            "screening range. Further physical or laboratory "
            "assessment may be appropriate."
        )

    elif is_ph_warning:
        evidence.append(
            f"Field pH reading ({ph:.2f}) is above the configured "
            "screening range (3.8 - 4.3)."
        )

    else:
        evidence.append(
            f"Field pH reading ({ph:.2f}) is within the configured "
            "screening range (3.8 - 4.3)."
        )

    # Moisture:
    # Configured prototype screening range: 60% - 70%
    is_moisture_danger = moisture > 73.0 or moisture < 52.0
    is_moisture_warning = (
        52.0 <= moisture < 60.0
        or 70.0 < moisture <= 73.0
    )

    if is_moisture_danger:
        flags.append(
            f"Moisture reading ({moisture:.1f}%) is outside the "
            "configured screening range (60 - 70%)."
        )
        evidence.append(
            f"Moisture reading ({moisture:.1f}%) is outside the "
            "configured screening range. This is a potential "
            "storage-condition risk indicator."
        )

    elif is_moisture_warning:
        evidence.append(
            f"Moisture reading ({moisture:.1f}%) is slightly outside "
            "the configured screening range (60 - 70%)."
        )

    else:
        evidence.append(
            f"Moisture reading ({moisture:.1f}%) is within the "
            "configured screening range (60 - 70%)."
        )

    # Temperature:
    # Configured prototype baseline: < 28°C
    is_temp_danger = temperature > 36.0
    is_temp_warning = 28.0 <= temperature <= 36.0

    if is_temp_danger:
        flags.append(
            f"Core temperature ({temperature:.1f}°C) is above the "
            "configured screening baseline (< 28°C)."
        )
        evidence.append(
            f"Core temperature ({temperature:.1f}°C) is elevated "
            "relative to the configured baseline. Further assessment "
            "may be appropriate."
        )

    elif is_temp_warning:
        evidence.append(
            f"Core temperature ({temperature:.1f}°C) is above the "
            "configured baseline (< 28°C). Continued monitoring is recommended."
        )

    else:
        evidence.append(
            f"Core temperature ({temperature:.1f}°C) is within the "
            "configured baseline (< 28°C)."
        )

    # ---------------------------------------------------------
    # 3. SCREENING DECISION
    # ---------------------------------------------------------

    if (
        is_ph_danger
        or is_temp_danger
        or (
            is_moisture_danger
            and (is_ph_warning or is_temp_warning)
        )
    ):
        screening_result = "POOR"
        risk_level = "HIGH"
        score_index = 52

    elif (
        fbsi_score in ["score_3", "score_4"]
        and (
            is_ph_warning
            or is_temp_warning
            or is_moisture_danger
        )
    ):
        screening_result = "POOR"
        risk_level = "HIGH"
        score_index = 58

    elif (
        is_ph_warning
        or is_moisture_warning
        or is_temp_warning
        or fbsi_score in ["score_2", "score_3", "score_4"]
    ):
        screening_result = "MODERATE"
        risk_level = "MEDIUM"
        score_index = 76

    else:
        screening_result = "GOOD"
        risk_level = "LOW"
        score_index = 92

    # ---------------------------------------------------------
    # 4. METRIC STATUS
    # ---------------------------------------------------------

    metrics_status = {
        "pH": (
            "danger"
            if is_ph_danger
            else "warning"
            if is_ph_warning
            else "within_range"
        ),
        "moisture": (
            "danger"
            if is_moisture_danger
            else "warning"
            if is_moisture_warning
            else "within_range"
        ),
        "temperature": (
            "danger"
            if is_temp_danger
            else "warning"
            if is_temp_warning
            else "within_range"
        ),
    }

    # ---------------------------------------------------------
    # 5. RETURN SCREENING RESULT
    # ---------------------------------------------------------

    return {
        "screening_result": screening_result,
        "quality": screening_result.lower(),
        "risk_level": risk_level,
        "score_index": score_index,

        "assessment_basis": [
            "AI visual screening using the FBSI classifier",
            "Field pH measurement",
            "Field moisture measurement",
            "Field temperature measurement",
        ],

        "visual_indicators": visual_indicators,
        "evidence": evidence,
        "flags": flags,
        "metrics_status": metrics_status,

        "limitations": [
            "Prototype screening only; not a laboratory analysis.",
            "Visual screening does not confirm toxins, mycotoxins, mold contamination, or nutritional composition.",
            "Does not confirm laboratory feed quality or safety guarantees.",
            "Configured ranges should be validated against field and laboratory measurements before production deployment.",
        ],
    }