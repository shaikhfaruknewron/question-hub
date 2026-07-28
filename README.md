# Question Hub

A question bank and test management platform.

- **backend** — Express 5 + Mongoose 9 REST API (`/api/v1`), JWT auth via httpOnly cookies
- **frontend** — Next 16 (App Router) + React 19 + Tailwind 4

Requires **Node 20.9+** and a MongoDB instance (local or Atlas).

## Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and the two token secrets
npm run seed              # optional: demo users, categories, questions and a test
npm run dev               # http://localhost:5000
```

Generate the token secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`GET /health` returns the API status without touching the database.

### Seeded demo accounts

All three use the password `Password123`:

| Email | Role |
| --- | --- |
| `admin@questionhub.dev` | admin |
| `teacher@questionhub.dev` | teacher |
| `student@questionhub.dev` | student |

Sign-up is limited to `teacher` and `student`; admins are seeded or promoted via
`PATCH /api/v1/users/:id/role`.

## Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

The API URL defaults to `http://localhost:5000/api/v1`. Override it with
`NEXT_PUBLIC_API_URL` in `frontend/.env.local` (see `.env.example`).

`CLIENT_URL` in the backend `.env` is the CORS allow-list — it accepts a comma
separated list of origins.

## Roles

| | admin | teacher | student |
| --- | --- | --- | --- |
| Manage users | ✓ | | |
| Manage categories | ✓ | ✓ (no delete) | |
| Manage questions & tests | ✓ | ✓ | |
| Take published tests | | | ✓ |
| View question analytics | ✓ | ✓ | |
| View own results | ✓ | ✓ | ✓ |

Students only see published tests that are either assigned to them or have an
empty assignment list.
