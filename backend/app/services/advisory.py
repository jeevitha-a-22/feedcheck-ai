"""
FeedCheck AI — Farmer Advisory Service (Prototype Screening Recommendations)

DISCLAIMER:
Provides operational bunk management and storage screening observations based on visual traits
and field measurements. Does NOT make medical, toxicology, or certified laboratory safety claims.
"""

from typing import Dict, Any, List

def generate_advisory(
    screening_result: str,
    risk_level: str,
    fbsi_score: str,
    ph: float,
    moisture: float,
    temperature: float
) -> Dict[str, Any]:
    """
    Generates structured, practical farmer feeding and bunker management screening advice.
    """
    if screening_result == "GOOD":
        summary = (
            "Prototype screening indicates measurements within configured baseline ranges. "
            "Continue routine bunk management and monitor storage conditions."
        )
        herd_inclusion = (
            "Measurements are consistent with target screening ranges. Review ration inclusion with your "
            "herd nutritionist according to your farm's feeding plan."
        )
        bunker_action = (
            "Maintain clean bunker face management and feed out at a uniform daily rate. "
            "Ensure plastic cover remains securely weighted against oxygen exposure."
        )
        recommendations = [
            "Continue routine monitoring of storage moisture and pH conditions.",
            "Maintain steady bunker face removal and proper sealing practices.",
            "Keep daily feed push-up schedules consistent."
        ]
    elif screening_result == "MODERATE":
        summary = (
            "Prototype screening indicates mild measurement variability or elevated bunk residuals. "
            "Inspect bunker face for localized warming and monitor herd intake patterns."
        )
        herd_inclusion = (
            "Review moisture and pH measurements with your herd manager. Consider consulting a nutritionist "
            "before significant ration adjustments."
        )
        bunker_action = (
            "Review daily feedout pace across the face to minimize surface aerobic exposure. "
            "Remove any loose, warm surface layers before loading mixer wagon."
        )
        recommendations = [
            "Monitor moisture, pH, and core temperature closely over the next 48-72 hours.",
            "Inspect bunk and storage face for localized heating or physical changes.",
            "Consider professional forage testing if intake variability persists."
        ]
    else:  # POOR
        summary = (
            "Prototype screening flags one or more measurements outside configured target ranges. "
            "Further physical inspection or laboratory assessment is recommended."
        )
        herd_inclusion = (
            "Hold ration formulation adjustments pending physical inspection and consultation "
            "with a qualified nutritionist or feed advisor."
        )
        bunker_action = (
            "Isolate and inspect sections showing elevated temperature or physical anomalies. "
            "Check bunker cover and oxygen barrier film for punctures or tire displacement."
        )
        recommendations = [
            "Flag the sample for closer physical assessment.",
            "Inspect storage face and bunk for visible signs of deterioration or heating.",
            "Recommend obtaining laboratory forage analysis before making feeding decisions."
        ]

    return {
        "summary": summary,
        "herd_inclusion": herd_inclusion,
        "bunker_action": bunker_action,
        "recommendations": recommendations
    }
