import pytest
import io
import uuid
from pathlib import Path
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.database import engine, Base
import backend.app.models  # noqa: F401

@pytest.mark.asyncio
async def test_complete_end_to_end_user_journey():
    # Initialize database tables directly
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    test_email = f"analyst.{uuid.uuid4().hex[:8]}@appcheck.io"
    intruder_email = f"intruder.{uuid.uuid4().hex[:8]}@domain.com"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # 1. Register User 1
        reg_payload = {
            "full_name": "Senior Security Analyst",
            "email": test_email,
            "password": "Argon2Security2026!",
            "terms_accepted": True
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201, res_reg.text
        auth_data = res_reg.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        user_id = auth_data["user"]["id"]

        # Duplicate registration prevention
        res_dup = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_dup.status_code == 409

        # 2. Login verification
        res_login = await ac.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "Argon2Security2026!"
        })
        assert res_login.status_code == 200
        assert "access_token" in res_login.json()

        # 3. Authenticated profile check
        res_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == test_email

        # 4. Check initial dashboard stats (must be 0 scans, not fabricated numbers!)
        res_dash_init = await ac.get("/api/v1/dashboard/stats", headers=headers)
        assert res_dash_init.status_code == 200
        dash_data_init = res_dash_init.json()
        assert dash_data_init["total_scans"] == 0
        assert dash_data_init["safe_count"] == 0

        # 5. Scan 1: Upload and analyze Clean Calculator APK
        safe_apk_path = Path("sample_safe_calculator.apk")
        assert safe_apk_path.exists()
        
        with open(safe_apk_path, "rb") as f:
            files = {"file": ("sample_safe_calculator.apk", f, "application/vnd.android.package-archive")}
            res_scan_safe = await ac.post("/api/v1/scans", files=files, headers=headers)
        
        assert res_scan_safe.status_code == 201, res_scan_safe.text
        safe_scan_result = res_scan_safe.json()
        safe_scan_id = safe_scan_result["id"]
        assert safe_scan_result["application"]["package_name"] == "com.clean.tools.calculator"
        assert safe_scan_result["risk_assessment"]["risk_level"] in ["SAFE", "LOW"]
        assert safe_scan_result["risk_assessment"]["score"] <= 25

        # 6. Scan 2: Upload and analyze High-Risk Spyware APK
        risk_apk_path = Path("sample_high_risk_spyware.apk")
        assert risk_apk_path.exists()

        with open(risk_apk_path, "rb") as f:
            files = {"file": ("sample_high_risk_spyware.apk", f, "application/vnd.android.package-archive")}
            res_scan_risk = await ac.post("/api/v1/scans", files=files, headers=headers)
        
        assert res_scan_risk.status_code == 201, res_scan_risk.text
        risk_scan_result = res_scan_risk.json()
        risk_scan_id = risk_scan_result["id"]
        assert risk_scan_result["application"]["package_name"] == "com.suspicious.analytics.tracker"
        assert risk_scan_result["risk_assessment"]["risk_level"] in ["HIGH", "CRITICAL"]
        assert risk_scan_result["risk_assessment"]["score"] >= 50

        # Check detected high-risk rules
        finding_rule_ids = [f["rule_id"] for f in risk_scan_result["findings"]]
        assert "RULE-SEC-01" in finding_rule_ids  # Debuggable flag
        assert "RULE-SEC-05A" in finding_rule_ids # SMS exfiltration combination
        assert "RULE-SEC-06" in finding_rule_ids  # System alert window overlay

        # 7. Check updated dashboard stats (real database aggregation!)
        res_dash_updated = await ac.get("/api/v1/dashboard/stats", headers=headers)
        assert res_dash_updated.status_code == 200
        dash_updated = res_dash_updated.json()
        assert dash_updated["total_scans"] == 2
        assert dash_updated["safe_count"] == 1
        assert dash_updated["high_risk_count"] == 1
        assert len(dash_updated["recent_scans"]) == 2

        # 8. Download PDF Report
        res_pdf = await ac.get(f"/api/v1/scans/{risk_scan_id}/report", headers=headers)
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert len(res_pdf.content) > 1000

        # 9. Scan History
        res_history = await ac.get("/api/v1/scans", headers=headers)
        assert res_history.status_code == 200
        assert len(res_history.json()) == 2

        # 10. User Isolation / Authorization Security Test
        # Create User 2
        res_u2 = await ac.post("/api/v1/auth/register", json={
            "full_name": "Unauthorized User",
            "email": intruder_email,
            "password": "Password12345!",
            "terms_accepted": True
        })
        u2_token = res_u2.json()["access_token"]
        u2_headers = {"Authorization": f"Bearer {u2_token}"}

        # User 2 MUST NOT be able to access User 1's scan report!
        res_unauthorized_get = await ac.get(f"/api/v1/scans/{risk_scan_id}", headers=u2_headers)
        assert res_unauthorized_get.status_code == 404

        # User 2 MUST NOT be able to delete User 1's scan report!
        res_unauthorized_del = await ac.delete(f"/api/v1/scans/{risk_scan_id}", headers=u2_headers)
        assert res_unauthorized_del.status_code == 404

        # 11. Delete scan by owner
        res_del = await ac.delete(f"/api/v1/scans/{safe_scan_id}", headers=headers)
        assert res_del.status_code == 200

        # Verify scan list count decreased to 1
        res_history_after = await ac.get("/api/v1/scans", headers=headers)
        assert len(res_history_after.json()) == 1

        print("\nAll End-to-End User Journey Tests Passed Successfully!")
