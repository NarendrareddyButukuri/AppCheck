import json
from typing import List, Dict, Any, Tuple

SEVERITY_WEIGHTS = {
    "CRITICAL": 35,
    "HIGH": 20,
    "MEDIUM": 10,
    "LOW": 4,
    "INFORMATIONAL": 0
}

def calculate_risk_assessment(findings: List[Dict[str, Any]], apk_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes an explainable, reproducible security risk score (0-100)
    based on documented finding severity, category diversity, and dangerous permission density.
    Avoids duplicate counting of identical categories.
    """
    severity_counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
        "INFORMATIONAL": 0
    }
    
    seen_rule_categories = set()
    category_penalties = 0
    raw_score = 0
    contributing_reasons = []

    for f in findings:
        sev = f.get("severity", "LOW").upper()
        if sev in severity_counts:
            severity_counts[sev] += 1

        # Base severity score
        weight = SEVERITY_WEIGHTS.get(sev, 0)
        cat = f.get("category", "General")
        
        # Diminishing returns on repeated findings in same category to prevent artificial inflation
        if cat in seen_rule_categories:
            weight = int(weight * 0.4)  # 60% reduction for repetitive category findings
        else:
            seen_rule_categories.add(cat)

        raw_score += weight
        if sev in ["CRITICAL", "HIGH", "MEDIUM"]:
            contributing_reasons.append(f"{f.get('title')} (+{weight} pts)")

    # Dangerous permission density factor
    permissions = apk_data.get("permissions", [])
    dangerous_perms = [
        p for p in permissions if any(d in p for d in [
            "LOCATION", "RECORD_AUDIO", "CAMERA", "SMS", "CONTACTS", "PHONE_STATE", "SYSTEM_ALERT_WINDOW"
        ])
    ]
    perm_density_penalty = min(15, len(dangerous_perms) * 2)
    if perm_density_penalty > 0:
        raw_score += perm_density_penalty
        contributing_reasons.append(f"Dangerous permission footprint ({len(dangerous_perms)} sensitive perms) (+{perm_density_penalty} pts)")

    # Final score clamped 0 to 100
    final_score = min(100, max(0, raw_score))

    # Risk Level Classification
    if final_score <= 25:
        risk_level = "SAFE"
        summary_verdict = "Low Risk Profile: Minimal security indicators or sensitive permissions detected."
    elif final_score <= 55:
        risk_level = "MEDIUM"
        summary_verdict = "Moderate Risk Profile: Application requests sensitive capabilities or contains architectural exposures requiring review."
    else:
        risk_level = "HIGH"
        summary_verdict = "High Risk Profile: Multiple critical or high-severity security exposures and broad sensitive capabilities identified."

    methodology_doc = (
        "Preliminary Heuristic Assessment Methodology: "
        "Score is calculated using static rule severity weights (Critical: +35, High: +20, Medium: +10, Low: +4) "
        "with category diversity damping to prevent score inflation from repetitive findings, plus a sensitive permission "
        "density factor capped at 15 points. Final score is normalized between 0 and 100. "
        "Note: A low score does not constitute proof that an application is completely safe or free from runtime evasion."
    )

    calculation_breakdown = {
        "raw_score": raw_score,
        "final_score": final_score,
        "severity_distribution": severity_counts,
        "distinct_categories_impacted": list(seen_rule_categories),
        "dangerous_permissions_count": len(dangerous_perms),
        "perm_density_penalty": perm_density_penalty,
        "contributing_factors": contributing_reasons[:6]
    }

    return {
        "score": final_score,
        "risk_level": risk_level,
        "summary": summary_verdict,
        "methodology": methodology_doc,
        "calculation_breakdown": json.dumps(calculation_breakdown, indent=2),
    }
