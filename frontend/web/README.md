## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Sign up at https://vercel.com using your GitHub account
3. Import the repo in Vercel
4. Set environment variables in Vercel dashboard:
   - MONGODB_URI — your MongoDB Atlas connection string
   - OPENAI_API_KEY — (optional) for AI insights feature
5. Deploy — Vercel auto-builds frontend and API routes

## Project structure

- frontend/web/          — React + Vite frontend (built and served by Vercel)
- api/                   — Vercel serverless functions (POST /api/create-scorecard, POST /api/ai-insights)
- api/lib/mongodb.ts     — shared MongoDB connection helper
- api/lib/scoring.ts     — shared scoring logic
- backend/               — original Azure Functions (kept for future Azure deployment)
- infrastructure/        — Bicep templates (kept for future Azure deployment)

## Local development (optional)

npm install              # install root deps (API functions)
cd frontend/web && npm install  # install frontend deps
npx vercel dev           # run Vercel dev server locally (frontend + API)
