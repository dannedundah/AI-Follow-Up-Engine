# AI Follow-Up Engine (MVP)

## 1) Systemdesign (kort)
- Monorepo med `/server` (Express + Prisma + SQLite + scheduler) och `/web` (React + Vite).
- Single-tenant utan auth, all konfig via `.env`.
- Prisma-modeller: `Lead`, `Rule`, `MessageLog`.
- API exponerar CRUD för leads/rules samt dashboard-data.
- Scheduler kör var 15:e minut via cron.
- Due-logic matchar status + inaktivitet + anti-spam (24h).
- När lead är due genereras ämne/body via OpenAI (fallback-template vid fel).
- Email skickas via Nodemailer SMTP och varje försök loggas i `MessageLog`.
- `last_contact_at` uppdateras vid lyckat utskick.
- Dashboard visar Due now, Recently sent (24h), Failed.
- Seed skapar 10 leads + 2 regler för snabb demo.
- Tester täcker due-logic och anti-spam.

## Struktur
- `server/` – API, scheduler, Prisma schema/migrations/seed, tester.
- `web/` – React UI med vyer för Leads, Rules, Dashboard.

## Kom igång
```bash
npm install
cp server/.env.example server/.env
cp web/.env.example web/.env
```

## Databas: migration + seed
```bash
npm run prisma:generate --workspace server
npm run prisma:migrate --workspace server
npm run prisma:seed --workspace server
```

## Starta allt
```bash
npm run dev
```
- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## Viktiga API-endpoints
- `GET/POST /api/leads`
- `PUT /api/leads/:id`
- `POST /api/leads/:id/mark-contacted`
- `GET/POST /api/rules`
- `PUT /api/rules/:id`
- `POST /api/rules/:id/toggle`
- `GET /api/dashboard`

## Tester
```bash
npm run test --workspace server
```

## ENV
Server behöver:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`
- `OPENAI_API_KEY`
- `APP_BASE_URL`
- `DATABASE_URL`
