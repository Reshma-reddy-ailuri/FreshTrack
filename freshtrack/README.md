# FreshTrack (MERN Demo)

FreshTrack is a self-contained MERN demo for grocery **expiry tracking** and **AI-powered sales suggestions**.

## Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally on `mongodb://localhost:27017`
- (Optional) Anthropic/Claude API key for live AI suggestions

## Setup

### 1) Backend

```bash
cd server
npm install
node seed.js
npm run dev
```

Backend runs on **port 5000**.

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on **port 5173**.

## Environment variables

Create `server/.env` (see `server/.env.example`):

```bash
MONGODB_URI=mongodb://localhost:27017/freshtrack
PORT=5000
ANTHROPIC_API_KEY=your_key_here
```

## API endpoints

All endpoints are under:

- `GET /api/freshtrack/dashboard-summary`
- `GET /api/freshtrack/expiry-list?filter=7|30|expired|all&category=&search=`
- `GET /api/freshtrack/suggestions?regenerate=false`
- `GET /api/freshtrack/alerts`
- `POST /api/freshtrack/alerts/:id/action` body `{ action: "actioned" | "dismissed" }`
- `GET /api/freshtrack/analytics/expiry-by-category`
- `GET /api/freshtrack/analytics/revenue-at-risk`

