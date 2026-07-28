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

### Troubleshooting connection problems

Run the diagnostic first — it tests DNS, hostname resolution, port 27017 and
authentication separately and tells you which one is actually broken:

```bash
npm run doctor
```

The output is safe to share; credentials are redacted.

#### `querySrv ECONNREFUSED` / `ENOTFOUND _mongodb._tcp...`

This is a **DNS** failure, not a MongoDB or credentials problem — `mongodb+srv://`
requires an SRV record lookup, and many home routers, office networks and VPNs
refuse SRV queries. The database is never contacted.

Check whether SRV resolution works at all:

```bash
nslookup -type=SRV _mongodb._tcp.<your-cluster>.mongodb.net 8.8.8.8
```

A common cause on Windows is a leftover `127.0.0.1` DNS entry from an uninstalled
VPN or ad blocker (Cloudflare WARP, NordVPN, Pi-hole, AdGuard). Ordinary browsing
still works, and MongoDB Compass still connects — it uses its own resolver — but
Node's SRV lookup is refused.

Fix it any of these ways:

1. **Point Node at a working resolver** (no admin rights needed) — add to `.env`:

   ```
   DNS_SERVERS=8.8.8.8,1.1.1.1
   ```

2. **Change your system DNS** to `8.8.8.8` / `1.1.1.1` (Settings → Network →
   Adapter options → IPv4 → Properties), then run `ipconfig /flushdns`.
3. **Or bypass SRV entirely** using the non-SRV connection string — in Atlas pick
   Connect → Drivers → *Node.js 2.2.12 or later*. It lists the shard hosts
   directly, so no SRV lookup happens:

   ```
   MONGO_URI=mongodb://<user>:<pass>@host-00:27017,host-01:27017,host-02:27017/?ssl=true&replicaSet=<replica-set>&authSource=admin&retryWrites=true&w=majority
   ```

If DNS resolves but the connection still times out, check that your current IP is
in the Atlas **Network Access** allow-list.

#### Nothing works — use a local database

Some office and campus networks block outbound port 27017 entirely, which neither
fix above can work around. Run MongoDB locally instead:

```bash
docker run -d -p 27017:27017 --name question-hub-db mongo:8
```

(or install MongoDB Community Server). Then in `backend/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=question-hub
```

Run `npm run seed` and everything works offline with no Atlas access.

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
