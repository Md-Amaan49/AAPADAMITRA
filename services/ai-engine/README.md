# AAPADAMITRA — AI Engine Service

Python FastAPI-based microservice foundation for predictive modeling, hydrological simulations, and hazard intelligence.

## Architecture
- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Configuration:** Pydantic Settings
- **Docs:** Interactive OpenAPI Swagger UI at `/docs`
- **Health Check:** `GET /health` -> `{"status": "ok", "service": "aapadamitra-ai"}`

## Environment Setup (Windows 10 / PowerShell)

1. Navigate to the service directory:
   ```powershell
   cd services/ai-engine
   ```

2. Create Python virtual environment:
   ```powershell
   python -m venv .venv
   ```

3. Activate virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   *(Note: If script execution policy blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell session).*

4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Run the service in development mode:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

6. Verify the service:
   - Endpoint: http://localhost:8000/health
   - Swagger Docs: http://localhost:8000/docs

