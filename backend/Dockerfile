FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package installation
RUN pip install --no-cache-dir uv

# Copy requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN uv pip install --system -r /app/backend/requirements.txt email-validator asyncpg

# Copy application source
COPY backend /app/backend
COPY sample_safe_calculator.apk /app/sample_safe_calculator.apk
COPY sample_high_risk_spyware.apk /app/sample_high_risk_spyware.apk

# Train & serialize ML model if not already bundled
RUN python /app/backend/ml/train_model.py

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
