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

### Troubleshooting: `querySrv ECONNREFUSED` / `ENOTFOUND _mongodb._tcp...`

This is a **DNS** failure, not a MongoDB or credentials problem — `mongodb+srv://`
requires an SRV record lookup, and many home routers, office networks and VPNs
refuse SRV queries. The database is never contacted.

Check whether SRV resolution works at all:

```bash
nslookup -type=SRV _mongodb._tcp.<your-cluster>.mongodb.net 8.8.8.8
```

Fix it either way:

1. **Change your DNS** to `8.8.8.8` / `1.1.1.1` (Windows: Settings → Network →
   Adapter options → IPv4 → Properties), then run `ipconfig /flushdns`.
2. **Or bypass SRV entirely** using the non-SRV connection string — in Atlas pick
   Connect → Drivers → *Node.js 2.2.12 or later*. It lists the shard hosts
   directly, so no SRV lookup happens:

   ```
   MONGO_URI=mongodb://<user>:<pass>@host-00:27017,host-01:27017,host-02:27017/?ssl=true&replicaSet=<replica-set>&authSource=admin&retryWrites=true&w=majority
   ```

If DNS resolves but the connection still times out, check that your current IP is
in the Atlas **Network Access** allow-list.

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
