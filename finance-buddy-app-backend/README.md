# FinSight Backend API

The FinSight Backend API is a Node.js Express server that coordinates user sessions, financial logging (expenses and income), simulation scenarios, financial news, OCR receipt parsing, and educational gamification modules.

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Object Storage / Uploads**: Multer (saves to local `/uploads` directory)
- **OCR Engine**: Tesseract.js (leveraging `eng.traineddata`)
- **Authentication**: JSON Web Token (JWT)

## Port Configuration

- Local Port: `5050`

## API Routes

| Endpoint | Auth Required | Description |
| :--- | :---: | :--- |
| `POST /api/auth/*` | No | User authentication, registration, and credential validation. |
| `GET/POST /api/finance/*` | Yes | Retrieves and updates user budget benchmarks and financial profiles. |
| `GET/POST/PUT/DELETE /api/expenses/*` | Yes | CRUD endpoints for logging expenditures. |
| `GET/POST/PUT/DELETE /api/incomes/*` | Yes | CRUD endpoints for logging salary, investments, and other incomes. |
| `POST /api/statements/*` | Yes | Uploads bank statements (multipart/form-data) for processing. |
| `POST /api/simulator/*` | Yes | Computes compounding interest, debt paydown, and investment scenarios. |
| `GET /api/news/*` | Yes | Pulls context-relevant market headlines. |
| `GET/POST /api/quiz/*` | Yes | Exposes trivia quiz questions and checks user answers. |
| `GET/POST /api/challenge/*` | Yes | Manages gamified saving goals and weekly challenges. |
| `POST /api/expense/*` | No | Asynchronously parses unstructured receipts into structured JSON. |

## Environment Configuration

Create a `.env` file in the backend directory containing:
```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/finsight
JWT_SECRET=your_jwt_signature_key
NEWS_API_KEY=your_newsapi_org_key
```

## Running Locally

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Start the Express server in development mode:
   ```bash
   npm start
   ```
