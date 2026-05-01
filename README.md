# CV Canvas

A community-driven CV/Resume platform — discover, fork, edit, and download CVs. Admin-curated editable templates plus user-uploaded inspiration files. Upvotes, comments, and a 3-free-then-paid PDF download model.

## Stack

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, React Query, Tailwind CSS |
| Backend  | Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis          |
| Auth     | Cookie-based httpOnly (access 15 min + refresh 7 days)         |
| Storage  | Cloudinary (images) + Cloudflare R2 (PDFs)                     |
| Payments | Stripe (international) / SSLCommerz (Bangladesh)               |
| PDF Gen  | Puppeteer (headless Chrome)                                    |
| Infra    | Docker, Nginx, GitHub Actions CI/CD                            |

## Quickstart

```bash
cp .env.example .env          # fill in secrets
docker-compose up -d          # starts frontend, backend, db, redis, nginx
```

The app is served at **http://localhost** via Nginx.

- Frontend dev server: http://localhost:3000 (direct)
- Backend API: http://localhost:8000/api/v1 (direct)

## Development

```bash
npm run dev        # docker-compose up (full stack)
npm run lint       # lint all workspaces
npm run format     # prettier --write .
```
