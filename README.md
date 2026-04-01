# 🧠 MediScan AI — Medical Report Analyzer

> Upload any medical report. Get a clear, plain-language breakdown powered by Gemini AI.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 **Upload reports** | PDF, JPG, PNG, TIFF — or paste raw text directly |
| 🔍 **OCR extraction** | Tesseract + PyPDF2 pull text from scanned documents |
| 🧠 **AI analysis** | Gemini reads every parameter and flags abnormal values |
| ⚠️ **Abnormal detection** | Color-coded cards: green / amber / red per result |
| 💡 **Plain English** | Jargon translated into simple patient-friendly explanations |
| 🔐 **Google OAuth 2.0** | Secure sign-in; JWT access + refresh token rotation |
| 📊 **Report history** | Dashboard tracks all past uploads with flag counts |
| 🐳 **Docker ready** | One `docker compose up` spins everything up |

---

## 🏗️ Architecture

```
mediscan/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py     # Pydantic-settings — reads .env
│   │   │   ├── database.py   # Async SQLAlchemy engine + session
│   │   │   └── security.py   # JWT helpers + get_current_user dep
│   │   ├── models/
│   │   │   ├── user.py       # User ORM model
│   │   │   ├── report.py     # Report ORM model (status enums)
│   │   │   └── schemas.py    # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── auth.py       # Google OAuth callback + JWT refresh
│   │   │   ├── users.py      # GET /api/users/me
│   │   │   ├── reports.py    # Upload, list, get, delete
│   │   │   └── analysis.py   # Trigger + retrieve` AI analysis
│   │   ├── services/
│   │   │   ├── ocr.py        # Tesseract OCR (image + PDF)
│   │   │   ├── ai_analysis.py# Google Gemini integration
│   │   │   └── google_auth.py# Google token exchange + userinfo
│   │   └── main.py           # App factory, middleware, routers
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/                 # Next.js 14 frontend
│   ├── pages/
│   │   ├── index.js          # Landing / marketing page
│   │   ├── login.js          # Google OAuth sign-in
│   │   ├── dashboard.js      # Report history + stats
│   │   ├── upload.js         # File drop + paste + submit
│   │   ├── analysis/[id].js  # Dynamic AI results page
│   │   ├── profile.js        # User info + logout
│   │   └── 404.js            # Custom not-found page
│   ├── components/
│   │   ├── Layout.js         # Page shell with grid background
│   │   ├── Navbar.js         # Auth-aware navigation
│   │   ├── StatCard.js       # Dashboard stat tile
│   │   ├── ReportRow.js      # Report list item
│   │   ├── ParameterCard.js  # Lab value card with status bar
│   │   └── LoadingSpinner.js # Shared loading state
│   ├── utils/
│   │   ├── api.js            # Axios client + JWT auto-refresh
│   │   └── AuthContext.js    # React auth context + useAuth hook
│   ├── styles/globals.css    # CSS variables + global styles
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker (recommended)

```bash
# 1. Clone
git clone https://github.com/your-repo/mediscan-ai.git
cd mediscan-ai

# 2. Configure
cp .env.example .env
# Edit .env — fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GEMINI_API_KEY, JWT_SECRET

# 3. Run
docker compose up --build

# App is live at:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:8000
#   API docs  →  http://localhost:8000/docs
```

### Option B — Local development

**Backend**
```bash
cd backend

# Create virtual environment
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies (includes Tesseract Python bindings)
pip install -r requirements.txt

# Install Tesseract OCR engine (system level)
# macOS:   brew install tesseract
# Ubuntu:  sudo apt install tesseract-ocr
# Windows: https://github.com/UB-Mannheim/tesseract/wiki

# Set up database
cp ../.env.example ../.env   # edit values
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file at project root (copy from `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `JWT_SECRET` | ✅ | Long random secret for signing tokens |
| `GOOGLE_CLIENT_ID` | ✅ | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | ✅ | Must match OAuth consent screen config |
| `GEMINI_API_KEY` | ✅ | From Google AI Studio API Keys |
| `GEMINI_MODEL` | — | Gemini model name (default: `gemini-2.5-flash`) |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL seen by browser |
| `UPLOAD_DIR` | — | Local directory for uploaded files (default: `uploads`) |
| `MAX_UPLOAD_SIZE_MB` | — | Max file size in MB (default: `10`) |
| `DEBUG` | — | Enable SQLAlchemy query logging (default: `false`) |

### Google OAuth setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** → Web application
3. Add Authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
4. Copy Client ID and Secret into `.env`

---

## 📡 API Reference

All routes are prefixed with `/api`. Interactive docs at `/docs` (Swagger) or `/redoc`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/google/url` | Get Google consent screen URL |
| `POST` | `/api/auth/google/callback` | Exchange code → JWT tokens |
| `POST` | `/api/auth/refresh` | Rotate access + refresh tokens |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | 🔐 | Get current user profile |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reports/upload` | 🔐 | Upload file or paste text |
| `GET` | `/api/reports/` | 🔐 | List all reports |
| `GET` | `/api/reports/{id}` | 🔐 | Get single report |
| `DELETE` | `/api/reports/{id}` | 🔐 | Delete report + file |

### Analysis
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analysis/` | 🔐 | Run AI analysis on a report |
| `GET` | `/api/analysis/{id}` | 🔐 | Get cached analysis result |

---

## 🔐 Authentication Flow

```
Browser                    Backend                    Google
   │                          │                          │
   │── GET /api/auth/google/url ──▶│                     │
   │◀── { url: "https://accounts.google.com/..." } ──────│
   │                          │                          │
   │── redirect user ─────────────────────────────────▶ │
   │◀── redirect with ?code=... ──────────────────────── │
   │                          │                          │
   │── POST /api/auth/google/callback { code } ──▶│      │
   │                          │── exchange code ────────▶│
   │                          │◀── access_token ─────── │
   │                          │── GET userinfo ─────────▶│
   │                          │◀── { email, name, ... } ─│
   │                          │── upsert User in DB      │
   │◀── { access_token, refresh_token } ──────────────── │
   │                          │                          │
   │ [stores tokens in cookies]│                         │
   │── GET /api/users/me  ───▶│                          │
   │   Authorization: Bearer <access_token>              │
```

---

## 🗄️ Database Schema

```sql
-- users
id          UUID PRIMARY KEY
email       VARCHAR(255) UNIQUE NOT NULL
name        VARCHAR(255) NOT NULL
picture     VARCHAR(512)
google_id   VARCHAR(255) UNIQUE
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ

-- reports
id             UUID PRIMARY KEY
user_id        UUID REFERENCES users(id) ON DELETE CASCADE
file_name      VARCHAR(512) NOT NULL
file_path      VARCHAR(512)
file_type      VARCHAR(50)          -- pdf | image | text
report_name    VARCHAR(255)
raw_text       TEXT                 -- OCR output
summary        TEXT                 -- AI summary
parameters     JSONB                -- list of ParameterSchema
recommendations JSONB               -- list of RecommendationSchema
flag_count     INTEGER DEFAULT 0
status         ENUM(pending, extracted, analyzed, failed)
overall_status ENUM(normal, attention, critical)
created_at     TIMESTAMPTZ
analyzed_at    TIMESTAMPTZ
```

---

## 🧠 AI Analysis Pipeline

```
File Upload / Paste Text
        │
        ▼
   OCR Service (ocr.py)
   ┌─────────────────────────────────┐
   │  PDF?  → PyPDF2 text layer      │
   │         → pdf2image + Tesseract │
   │  Image? → Pillow preprocess     │
   │         → Tesseract OCR         │
   │  Text?  → use as-is             │
   └─────────────────────────────────┘
        │
        ▼ raw_text saved to DB (status: extracted)
        │
   AI Analysis (ai_analysis.py)
   ┌─────────────────────────────────┐
   │  Google Gemini (gemini-2.5-flash) │
   │  System: medical analyst prompt │
   │  Returns strict JSON:           │
   │  { reportName, summary,         │
   │    parameters[], recommendations│
   │    overallStatus }              │
   └─────────────────────────────────┘
        │
        ▼ results saved to DB (status: analyzed)
        │
   Frontend renders:
   • AI summary card
   • Parameter cards (colored by status)
   • Progress bars (position in range)
   • Recommendations list
   • Overall status badge
```

---

## 🛠️ Database Migrations

```bash
cd backend

# Apply all migrations
alembic upgrade head

# Create a new migration after changing models
alembic revision --autogenerate -m "add_some_field"

# Rollback one step
alembic downgrade -1
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React 18, CSS Variables |
| **Backend** | FastAPI, Python 3.12 |
| **Database** | PostgreSQL 16 + SQLAlchemy (async) |
| **Auth** | Google OAuth 2.0 + JWT (python-jose) |
| **OCR** | Tesseract + PyPDF2 + Pillow |
| **AI/NLP** | Google Gemini (gemini-2.5-flash) |
| **Migrations** | Alembic |
| **HTTP client** | Axios (frontend), HTTPX (backend) |
| **Deployment** | Docker + Docker Compose |

---

## 🚢 Production Deployment

For production, consider:

1. **Environment** — Set `DEBUG=false`, use strong `JWT_SECRET`
2. **Database** — Use managed PostgreSQL (AWS RDS, Supabase, Neon)
3. **Storage** — Replace local `uploads/` with S3/R2 for file storage
4. **HTTPS** — Terminate TLS at a reverse proxy (Nginx / Caddy)
5. **CORS** — Update `ALLOWED_ORIGINS` to your actual domain
6. **Google OAuth** — Add production redirect URI in Google Console

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 💡 Inspiration

Built to demystify medical reports and reduce the anxiety caused by confusing lab values — because everyone deserves to understand their own health data.
