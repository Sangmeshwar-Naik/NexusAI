# API quick reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| GET | `/auth/me` | Yes | Current user |
| POST | `/documents` | Yes | Upload PDF/DOCX/TXT |
| GET | `/documents` | Yes | List own documents |
| DELETE | `/documents/{id}` | Yes | Delete own document |
| POST | `/chat` | Yes | Ask across own documents |

Interactive OpenAPI documentation: `http://localhost:8000/docs`
