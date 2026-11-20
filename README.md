# NexusAI — Enterprise Intelligence Platform

A full-stack starter for an enterprise document intelligence workspace.

## Stack
- Frontend: Next.js App Router, TypeScript, custom CSS, Framer Motion, Lucide
- Backend: FastAPI, SQLAlchemy, SQLite (PostgreSQL-ready), JWT authentication
- Document ingestion: PDF, DOCX, TXT
- Retrieval: local TF-IDF retrieval baseline; optional OpenAI answer generation
- Uploads: local filesystem for development

> This is a development MVP scaffold, not a production security/compliance certification. Before real company data: add malware scanning, object storage, encryption/key management, stronger tenant isolation, backups, observability, and security review.

## 1. Prerequisites
- Node.js 20+
- Python 3.11+
- Git
- (Optional) PostgreSQL 15+

## 2. Run the backend (Windows PowerShell)
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 3. Run the frontend (new terminal)
```powershell
cd frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```
Open http://localhost:3000

## 4. First use
1. Register an account.
2. Sign in.
3. Upload a PDF, DOCX, or TXT file from the Documents page.
4. Open AI Workspace and ask a question about the uploaded material.
5. The assistant retrieves relevant document passages. If `OPENAI_API_KEY` is configured in the backend, it can use the OpenAI API to generate a grounded answer. Otherwise, it returns an extractive response with source passages.

## 5. Environment variables
Backend `.env`:
```env
DATABASE_URL=sqlite:///./nexusai.db
JWT_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=./uploads
FRONTEND_ORIGIN=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```
Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
For PostgreSQL, use a SQLAlchemy URL such as:
`postgresql+psycopg://user:password@localhost:5432/nexusai`

## 6. Project structure
```text
NexusAI/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── db/
│       ├── models/
│       ├── schemas/
│       └── services/
└── docs/
```

## 7. Current implementation
- Register/login with hashed passwords and JWT
- Current-user endpoint
- Upload and extract PDF/DOCX/TXT text
- Persist document metadata and extracted text
- Document list and delete
- Workspace question endpoint with per-user document retrieval
- Optional OpenAI grounded generation
- Animated responsive dashboard shell

## 8. Important next engineering milestones
1. Replace local file storage with S3-compatible object storage.
2. Replace baseline TF-IDF retrieval with embeddings + pgvector.
3. Add background ingestion jobs (Redis + Celery).
4. Add refresh-token rotation, email verification, password reset and MFA.
5. Add tenant/workspace membership and granular document ACLs.
6. Add audit events, rate limits, file scanning and structured logs.
7. Add automated tests, CI, Docker Compose and deployment.
