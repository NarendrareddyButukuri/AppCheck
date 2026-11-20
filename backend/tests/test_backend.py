import pytest
import io
import zipfile
from pathlib import Path
from backend.app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from backend.app.services.permission_service import analyze_permission
from backend.app.services.static_analysis import evaluate_security_rules
from backend.app.services.risk_engine import calculate_risk_assessment
from backend.app.services.ml_service import predict_apk_features, get_ml_status
from backend.app.services.apk_service import is_valid_apk, calculate_sha256
from backend.app.services.report_service import generate_pdf_report

def create_mock_apk_bytes() -> bytes:
    """Constructs an in-memory valid APK archive containing AndroidManifest.xml and classes.dex"""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("AndroidManifest.xml", b"<manifest xmlns:android='http://schemas.android.com/apk/res/android' package='com.example.securitytest' />")
        zf.writestr("classes.dex", b"dex\n035\x00dummy_dex_bytecode_headers")
        zf.writestr("resources.arsc", b"ARSCdummy_resources")
        zf.writestr("META-INF/MANIFEST.MF", b"Manifest-Version: 1.0\r\n")
    return buf.getvalue()

def test_password_hashing_argon2id():
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    user_id = "test-user-12345"
    token = create_access_token(user_id)
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "access"

def test_permission_intelligence_categorization():
    # Dangerous fine location
    fine_loc = analyze_permission("android.permission.ACCESS_FINE_LOCATION")
    assert fine_loc["category"] == "Location"
    assert fine_loc["is_dangerous"] is True
    assert fine_loc["protection_level"] == "Dangerous"

    # SMS
    send_sms = analyze_permission("android.permission.SEND_SMS")
    assert send_sms["category"] == "SMS"
    assert send_sms["is_dangerous"] is True

    # Custom permission
    custom_p = analyze_permission("com.custom.app.ACCESS_VAULT")
    assert custom_p["protection_level"] == "Custom"
    assert custom_p["is_recognized"] is False

def test_security_rules_evaluation():
    apk_mock_data = {
        "package_name": "com.vulnerable.app",
        "target_sdk": "28",
        "debuggable": True,
        "allow_backup": True,
        "cleartext_traffic": True,
        "permissions": [
            "android.permission.INTERNET",
            "android.permission.SEND_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.SYSTEM_ALERT_WINDOW"
        ],
        "exported_components": [
            {"name": "com.vulnerable.app.UnprotectedService", "type": "Service", "exported": True}
        ]
    }
    findings = evaluate_security_rules(apk_mock_data)
    rule_ids = [f["rule_id"] for f in findings]
    
    assert "RULE-SEC-01" in rule_ids  # Debuggable
    assert "RULE-SEC-02" in rule_ids  # Unprotected exported
    assert "RULE-SEC-03" in rule_ids  # Cleartext traffic
    assert "RULE-SEC-05A" in rule_ids # SMS exfiltration combination
    assert "RULE-SEC-06" in rule_ids  # SYSTEM_ALERT_WINDOW overlay

def test_risk_scoring_engine():
    apk_mock_data = {
        "permissions": ["android.permission.INTERNET", "android.permission.CAMERA"]
    }
    findings = [
        {"rule_id": "RULE-SEC-01", "severity": "CRITICAL", "category": "App Config", "title": "Debuggable"},
        {"rule_id": "RULE-SEC-05A", "severity": "HIGH", "category": "SMS", "title": "SMS Fraud"}
    ]
    assessment = calculate_risk_assessment(findings, apk_mock_data)
    assert 0 <= assessment["score"] <= 100
    assert assessment["risk_level"] in ["SAFE", "MEDIUM", "HIGH"]
    assert "Preliminary Heuristic Assessment" in assessment["methodology"]

def test_ml_model_operational_and_inference():
    status = get_ml_status()
    assert status["available"] is True
    assert status["model_name"] == "RandomForestClassifier"

    # Test benign app prediction
    benign_apk = {
        "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"],
        "debuggable": False,
        "exported_components": []
    }
    res_benign = predict_apk_features(benign_apk)
    assert res_benign["available"] is True
    assert res_benign["prediction"] == "BENIGN / NORMAL"

    # Test malicious app prediction (SMS interception + overlay + dropper)
    mal_apk = {
        "permissions": [
            "android.permission.INTERNET",
            "android.permission.SEND_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.SYSTEM_ALERT_WINDOW",
            "android.permission.REQUEST_INSTALL_PACKAGES"
        ],
        "debuggable": False,
        "exported_components": [{"name": "Foo", "exported": True}]
    }
    res_mal = predict_apk_features(mal_apk)
    assert res_mal["available"] is True
    assert res_mal["prediction"] == "MALICIOUS / HIGH RISK"

def test_apk_validation(tmp_path: Path):
    valid_apk_file = tmp_path / "test_app.apk"
    valid_apk_file.write_bytes(create_mock_apk_bytes())
    
    valid, reason = is_valid_apk(valid_apk_file)
    assert valid is True
    assert "Valid" in reason

    # Test corrupted APK (not a zip)
    invalid_apk = tmp_path / "corrupted.apk"
    invalid_apk.write_bytes(b"This is just random corrupted data, not a zip file.")
    v2, r2 = is_valid_apk(invalid_apk)
    assert v2 is False

def test_pdf_report_generation(tmp_path: Path):
    pdf_dest = tmp_path / "test_report.pdf"
    test_scan_data = {
        "application": {
            "app_name": "TestSecApp",
            "package_name": "com.test.sec",
            "version_name": "1.2.0",
            "version_code": "12",
            "target_sdk": "34",
            "min_sdk": "24",
            "file_size_bytes": 1048576,
            "sha256_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
        },
        "risk_assessment": {
            "score": 15,
            "risk_level": "SAFE",
            "summary": "Low Risk Profile",
            "ml_prediction": "BENIGN / NORMAL"
        },
        "findings": [
            {
                "rule_id": "RULE-INFO-01",
                "severity": "INFORMATIONAL",
                "title": "Baseline Passed",
                "category": "General",
                "description": "No critical vulnerabilities.",
                "evidence": "Manifest clean",
                "recommended_action": "None"
            }
        ],
        "permissions": [
            {
                "permission_name": "android.permission.INTERNET",
                "category": "Network",
                "protection_level": "Normal",
                "is_dangerous": False,
                "security_relevance": "Standard socket connection capability."
            }
        ]
    }
    generated_path = generate_pdf_report(test_scan_data, pdf_dest)
    assert generated_path.exists()
    assert generated_path.stat().st_size > 1000
