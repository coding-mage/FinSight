# FinSight (Finance Buddy)

FinSight (a.k.a Finance Buddy) is a full-stack project to help users parse, analyze and manage financial data from bank statements, receipts and news. It contains a Node.js + Express backend with AI/ OCR integration (Tesseract + Google Gemini) and a React frontend.

## Contents

- `finance-buddy-app-backend/` — Express API server, OCR parsing, AI integrations, and MongoDB models
- `finance-buddy-app-frontend/` — React single-page application (UI for authentication, parsing, quizzes, and simulator)
- `uploads/` — temporary upload storage used by backend

## Highlights

- OCR for images and PDFs (Tesseract.js + pdf-parse)
- AI-powered parsing using Google Gemini / generative AI
- Authentication with JWT
- Endpoints for expenses, incomes, quizzes, news-impact analysis, challenges and a what-if simulator

## Quickstart

Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud URI)

Two main pieces to run: backend and frontend.

### Backend

1. Open a terminal and go to the backend folder:

```bash
cd finance-buddy-app-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `finance-buddy-app-backend/` with at least the following variables:

```env
MONGO_URI=mongodb://localhost:27017/bank-statements
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
# Optional:
PORT=5050
NEWS_API_KEY=your_news_api_key_here
```

Notes:
- The project includes `eng.traineddata` for Tesseract; Tesseract.js will use it for English OCR.
- Uploaded files are temporarily stored in `uploads/` (git-ignored in most setups).

4. Start the backend (development):

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The server defaults to port `5050` (see `server.js`). The API base is `http://localhost:5050/api`.

### Frontend

1. In a new terminal, open the frontend folder:

```bash
cd finance-buddy-app-frontend
```

2. Install dependencies and start:

```bash
npm install
npm start
```

The React app runs on `http://localhost:3000` by default. The backend is configured to accept requests from `http://localhost:3000` (CORS set in `server.js`).

## Environment / Config

- Backend config is in `finance-buddy-app-backend/config/config.js` and `config/db.js`. The important env vars are `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`. Several routes may also use `NEWS_API_KEY` for news fetching.

## API Overview

The backend exposes a set of REST endpoints. Many routes require a valid JWT token (sent as `Authorization: Bearer <token>`). Authentication endpoints return a token on success.

Authentication
- POST `/api/auth/register` — register a user (returns token)
- POST `/api/auth/login` — login (returns token)

OCR & Parsing
- POST `/api/ocr/ocr` — upload an image (field `image`) to run OCR and structured parsing (Tesseract + Gemini)
- POST `/api/ocr/bank-ocr` — upload a bank statement file (field `file`) for bank-specific OCR + analysis
- POST `/api/parse/parse` — parse PDF or image file; returns AI-parsed structured output

AI-assisted routes (mounted under `/api/ai`)
- POST `/api/ai/parse-expense` — parse an expense file (used by frontend)
- POST `/api/ai/autocomplete-income` — send partial income data and receive autocomplete suggestions

Finance data (require auth)
- GET `/api/expenses` — fetch user's expenses
- GET `/api/incomes` — fetch user's incomes

Note: some frontend components call additional create/autocomplete endpoints (e.g. `/api/incomes`, `/api/incomes/autocomplete`, `/api/expense/parse`) — these may need server-side handlers added or routes reconciled if you plan to use them. The legacy `/api/finance/*` routes were removed because they duplicated functionality and were not referenced by the frontend.

Quizzes & Challenges (require auth)
- POST `/api/quiz/generate` — generate a quiz via Gemini
- POST `/api/quiz/submit` — submit answers, save attempt
- GET `/api/quiz/history/:userId` — get quiz history

News
- GET `/api/news/top-finance` — fetch recent finance news (requires `NEWS_API_KEY` env)
- POST `/api/news/analyze` — analyze the impact of a news item using AI

Statements & Simulator (require auth)
- `/api/statements` — operations for statements (see `StatementRoutes.js`)
- `/api/simulator` — what-if simulator endpoints

Files & Uploads
- Uploaded files are saved to `uploads/` with a timestamped filename. Static files served from `/uploads` (see `server.js`).

## Development notes

- Authentication uses JWT tokens created with `JWT_SECRET` (see `models/User.js`). Tokens expire in 1 hour by default.
- Gemini integration uses `GEMINI_API_KEY` and the Google Generative AI library. There are helper services in `services/` (`geminiService.js`, `analyzeBankStatementText.js`, `analyzeNewsImpact.js`).
- OCR uses `tesseract.js` and `pdf-parse`. `eng.traineddata` is included for English recognition.
- If you change routes or models, update frontend API calls in `finance-buddy-app-frontend/src/services/authService.js` and components under `src/components/`.

## Troubleshooting

- MongoDB connection errors: ensure `MONGO_URI` is reachable and credentials (if any) are correct.
- Gemini / AI errors: verify `GEMINI_API_KEY` and that the API quota/permissions are valid.
- Tesseract OCR failures: ensure `eng.traineddata` is present and readable.

## Tests

No automated tests are included by default. You can run the frontend's `npm test` to start React tests scaffolding.


## Contact

If you have questions or need help running the project, open an issue in the repository or contact the maintainers.

---

Happy hacking — this README covers the basics for getting the app running locally.
