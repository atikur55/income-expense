# Expense Tracker

## MongoDB persistence (Vercel API)

This project now stores expenses in MongoDB for the `/api/expenses` serverless routes.

### Required environment variables

- `MONGODB_URI` = your MongoDB connection string
- `MONGODB_DB` = database name (example: `expense_tracker`)

### Optional

- `MONGODB_COLLECTION` = collection name (default: `expenses`)
- `EXPENSE_TTL_DAYS` = auto-expire records after N days (example: `60`)

If `EXPENSE_TTL_DAYS` is not set or `0`, data will not auto-expire.

## Run locally

```bash
npm install
npm run dev
```
