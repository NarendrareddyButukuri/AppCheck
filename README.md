# AppCheck — Universal Android Security Intelligence Platform

> **Know what an app can access.**  
> A genuine, end-to-end full-stack Android application security intelligence platform that helps ordinary users, students, developers, and security researchers understand Android application permissions and identify potential security risks before installation.

---

## 1. Product Identity & Design System

- **Product Name**: AppCheck
- **Category**: Android Application Security & Permission Auditing
- **Tagline**: *Know what an app can access.*
- **Audience**: Everyday smartphone users, developers, and cybersecurity researchers.

### Futuristic Motion Design System
AppCheck implements a distinctive, restrained visual identity featuring:
- **Canvas-based Motion Background**: Tiny interconnected security nodes moving at slow, organic velocities with dynamic line connections and ambient radial depth.
- **Atmospheric Palette**:
  - Primary Background: `#0B0E13`
  - Secondary Background: `#121720`
  - Surface: `#171F2B`
  - Primary Accent: `#79B8FF`
  - Secondary Accent: `#A5B9D1`
  - Success: `#67C99A`
  - Warning: `#E9B96A`
  - Danger: `#E87575`
  - Primary Text: `#F5F7FA`
  - Secondary Text: `#A1ACBA`
- **Accessibility & Performance**: Automatic pause when document tab is hidden; respects `prefers-reduced-motion`.

---

## 2. Mandatory User Journey

1. **Step 1 — Login Page (First Screen)**: When any visitor opens the application, the first screen is strictly the authentication page. No dashboard is exposed before authentication. Features email/password inputs, show/hide password, remember me, validation, and Argon2id verification.
2. **Step 2 — Sign Up**: Full registration with email validation, strong password policy, duplicate prevention, and Argon2id password hashing.
3. **Step 3 — Forgot Password**: Single-use cryptographic reset token workflow. Protects privacy by never exposing whether an arbitrary email address exists.
4. **Step 4 — Landing Page After Login**: After authenticating, users enter the product landing page featuring the hero ("*Understand what's happening inside your apps.*"), interactive animated security visualization, architecture breakdown, and FAQ.
5. **Step 5 — Authenticated Workspace**: Clicking "Start scanning" navigates to the dedicated workspace with complete sidebar navigation (Overview, New Scan, Scan History, Security Reports, Settings, Help & Methodology).
6. **Step 6 — Security Dashboard**: Real-time aggregated statistics queried directly from the authenticated user's database records (total scans, safe/medium/high counts, recent findings, ML model status). If empty, displays a professional empty state with a "Start Your First Scan" action.
7. **Step 7 — APK Scanner**: Drag-and-drop APK upload with archive integrity validation, file size enforcement (150 MB max), genuine multi-stage static analysis, and bundled test samples.
8. **Step 8 — Results & PDF Reports**: Full security dossier with risk score (0–100), permission intelligence, evidence-backed findings, component analysis, ML predictions, and downloadable ReportLab PDF reports.

---

## 3. Architecture & Tech Stack

```
AppCheck/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST Endpoints (auth, scans, reports, dashboard, system, users)
│   │   ├── core/            # Config, database session, Argon2id security, JWT
│   │   ├── models/          # 13 SQLAlchemy normalized entities
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # APK parser, permission service, rule engine, risk scoring, ML, ReportLab PDF
│   │   └── main.py          # FastAPI application entrypoint
│   ├── ml/
│   │   ├── models/          # Serialized Random Forest model & feature_names.json
│   │   └── train_model.py   # Training pipeline on Drebin / CICAndMal2017 schema
│   ├── tests/               # Pytest unit & comprehensive end-to-end integration tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # MotionBackground (Canvas), BrandLogo, RiskBadge
│   │   ├── context/         # AuthContext
│   │   ├── layouts/         # WorkspaceLayout (Sidebar, Topbar)
│   │   ├── pages/           # Login, Register, ForgotPassword, Landing, Scanner, Results, History, Reports, Settings
│   │   ├── services/api.js  # API client
│   │   └── App.jsx
│   └── package.json
├── docker-compose.yml       # Production PostgreSQL + Backend + Frontend containers
└── sample_*.apk             # Pre-compiled valid Android packages for one-click testing
```

---

## 4. Static Security Rule & Risk Engine

AppCheck strictly performs non-destructive static analysis on the server. The APK is never executed, eliminating runtime risk.

### Security Rules Evaluated
- **`RULE-SEC-01` (Critical)**: Application marked as `debuggable="true"` in AndroidManifest.xml.
- **`RULE-SEC-02` (High/Medium)**: Unprotected exported Android components (Activities, Services, Receivers) without permission guards.
- **`RULE-SEC-03` (Medium)**: Cleartext HTTP network traffic permitted (`usesCleartextTraffic="true"`).
- **`RULE-SEC-04` (Low)**: Application data backup enabled via ADB backup (`allowBackup="true"`).
- **`RULE-SEC-05A` (High)**: SMS exfiltration cluster (`SEND_SMS` / `RECEIVE_SMS` + `INTERNET`).
- **`RULE-SEC-05B` (High)**: Multi-sensor surveillance cluster (`RECORD_AUDIO` / `ACCESS_FINE_LOCATION` / `CAMERA` + `INTERNET`).
- **`RULE-SEC-06` (High)**: System alert window overlay capability (`SYSTEM_ALERT_WINDOW`).
- **`RULE-SEC-07` (Medium)**: Package installation dropper capability (`REQUEST_INSTALL_PACKAGES`).
- **`RULE-SEC-08` (Medium)**: Outdated Target SDK (< API 31) bypassing modern runtime restrictions.

### Explainable Risk Scoring (0–100)
- **Formula**: Severity weights (Critical: +35, High: +20, Medium: +10, Low: +4) with category diversity damping (0.4x factor on repeated findings in the same category) plus dangerous permission density penalty (capped at 15 points).
- **Risk Tiers**:
  - `0 – 25`: Safe / Low Risk
  - `26 – 55`: Medium Risk
  - `56 – 100`: High / Critical Risk

---

## 5. Machine Learning Pipeline

- **Libraries**: Scikit-Learn, Pandas, NumPy, Joblib.
- **Model**: Supervised Random Forest Classifier with probability calibration.
- **Dataset Schema**: Canonical 26-dimension permission and component feature matrix adhering to Drebin and CICAndMal2017 research distributions.
- **Fallback**: If the ML model is absent, AppCheck continues with rule-based static analysis and displays:  
  `"Machine Learning analysis unavailable — rule-based analysis was completed."`

---

## 6. Running Locally

### Backend Setup
```bash
# 1. Create Python virtual environment
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt email-validator

# 3. Train ML model (if not already trained)
python ml/train_model.py

# 4. Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/api/docs`.

### Frontend Setup
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. Running Tests

```bash
# Run all unit and comprehensive end-to-end integration tests
backend\.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

All 9 tests pass with 0 warnings:
1. `test_password_hashing_argon2id`: Verifies Argon2id cryptographic hashing.
2. `test_jwt_token_generation_and_decoding`: Verifies JWT issuance and decoding.
3. `test_permission_intelligence_categorization`: Verifies permission categorization across subsystems.
4. `test_security_rules_evaluation`: Verifies static rule engine.
5. `test_risk_scoring_engine`: Verifies 0-100 mathematical risk scoring.
6. `test_ml_model_operational_and_inference`: Verifies Random Forest ML inference.
7. `test_apk_validation`: Verifies archive and manifest structure checks.
8. `test_pdf_report_generation`: Verifies ReportLab PDF generation.
9. `test_complete_end_to_end_user_journey`: Verifies the complete user journey from registration through scanning both safe & high-risk APKs, dashboard aggregation, PDF downloads, and user account authorization isolation.

---

## 8. Docker Deployment

```bash
docker-compose up --build -d
```
Services started:
- PostgreSQL 15 database on port 5432
- FastAPI backend on port 8000
- Nginx frontend on port 80
