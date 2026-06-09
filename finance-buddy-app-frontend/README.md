# FinSight Frontend Client

FinSight Frontend Client is a React application built with Bootstrap that connects users to the FinSight personal finance tracking, receipt parsing, and investment scenario modeling engine.

## Port Configuration

- Local Development Port: `3000`

## Features & Dashboards

The client application includes the following interfaces, secured by a JWT wrapper (`ProtectedRoute.js`):

- **Auth Portal (`/login`, `/register`)**: Coordinates user credential verification and session persistence.
- **Main Dashboard (`/dashboard`)**: Displays budget alerts, monthly statistics, and interactive ledgers for income and expense logs.
- **Expense Evaluator (`/expense-evaluator`)**: Allows pasting raw receipt text or OCR scans to parse expenditures automatically.
- **Statement Decoder (`/statement-decoder`)**: Uploads PDF/image bank statements to extract and categorize transactions.
- **What-If Simulators (`/simulators`)**: Interactive compound interest, mortgage, and retirement planning charts.
- **Daily Digest (`/daily-digest`)**: Shows latest financial news articles and tags their potential budget impact.
- **Gamified Modules (`/quiz`, `/challenges`)**: Exposes financial literacy quizzes and savings goals/challenges.

## Technical Stack

- **Framework**: React 18+
- **Styling**: Bootstrap 5 (CSS)
- **Routing**: React Router DOM 6
- **API Client**: Axios (configured to query the local Node.js endpoint at `http://localhost:5050/api`)

## Local Development Setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment endpoints (if needed) in a local `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5050/api
   ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in a web browser to view the client app.
