# CV Canvas

A community-driven CV/Resume platform where users discover, fork, edit, and download CVs. Admin-curated editable templates plus user-uploaded inspiration files. Upvotes, comments, and a 3-free-then-paid PDF download model.

## Monorepo Structure

```
cv-canvas/
├── frontend/          → Next.js 15 (App Router), TypeScript, Tailwind CSS
├── backend/           → Express.js, Prisma, PostgreSQL, Redis
├── nginx/             → Reverse proxy config
├── docker-compose.yml → Full stack orchestration
├── .github/workflows/ → CI/CD with GitHub Actions
└── .env.example       → Environment variable template
```

## Tech Stack

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, React Query, Tailwind CSS |
| Backend  | Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis          |
| Auth     | Cookie-based (httpOnly), Access + Refresh tokens               |
| Storage  | Cloudinary (images, thumbnails) + Cloudflare R2 (PDFs)         |
| Payments | Stripe (intl) / SSLCommerz (BD)                                |
| PDF Gen  | Puppeteer (headless Chrome HTML → PDF)                         |
| Infra    | Docker, Nginx, GitHub Actions CI/CD                            |

## Brand & Design Tokens

The site uses **Modern Indigo** as its theme. These tokens MUST be used everywhere — never invent new colors.

```ts
// Primary palette
brand:      "#4F46E5"   // indigo-600 — buttons, active states, links
brand-dark: "#4338CA"   // indigo-700 — hover state on primary
brand-light:"#EEF2FF"   // indigo-50  — light backgrounds, badge fills

// Text & ink
ink:        "#0F172A"   // slate-900  — headings, primary text
ink-muted:  "#64748B"   // slate-500  — secondary text, hints
ink-subtle: "#94A3B8"   // slate-400  — tertiary text, icons

// Surfaces
surface:    "#FFFFFF"   // cards, modals
surface-2:  "#F8FAFC"   // page background
border:     "#E2E8F0"   // slate-200  — default borders
border-2:   "#CBD5E1"   // slate-300  — input borders

// Semantic
accent:     "#10B981"   // emerald-500 — success, "verified" tag
warning:    "#F59E0B"   // amber-500   — warnings
danger:     "#EF4444"   // red-500     — destructive actions
upload-tag-bg:   "#FFEDD5"  // orange-200 — "Inspiration" badge bg
upload-tag-text: "#9A3412"  // orange-800 — "Inspiration" badge text
template-tag-bg:   "#EEF2FF"  // indigo-50   — "Template" badge bg
template-tag-text: "#4338CA"  // indigo-700  — "Template" badge text
```

These are wired into `frontend/tailwind.config.ts` as `bg-brand`, `text-ink-muted`, etc. Reference by token name, not raw hex.

## Core Domain Concepts

- **User**: Authenticated member with profile, avatar, role (`USER` | `ADMIN`)
- **Template**: Admin-created HTML/CSS layout that defines the look of an editable CV. Stored once, used by many CVs.
- **CV**: The central content unit. Has a `type` field — `EDITABLE_TEMPLATE` (admin master), `EDITABLE_USER` (user's forked copy), or `INSPIRATION_UPLOAD` (uploaded PDF/image, not editable).
- **Fork**: When a user clicks "Use this" on an editable CV, the system copies the CV record into their account so they can edit freely without touching the original.
- **Vote**: Upvote or downvote on any CV. One vote per user per CV (toggle / replace semantics).
- **Comment**: Text comment on any CV, deletable by the comment author.
- **Download**: Tracked PDF download per (user, cv). First 3 downloads of a given CV are free; the 4th requires payment.
- **Payment**: One-time unlock per CV (or future subscription). On success, downloads for that CV become unlimited for the buyer.
- **Moderation**: User uploads enter `PENDING` status; admin must approve before they appear in public lists.

## CV Type Matrix

| Field               | EDITABLE_TEMPLATE       | EDITABLE_USER         | INSPIRATION_UPLOAD       |
| ------------------- | ----------------------- | --------------------- | ------------------------ |
| Created by          | Admin                   | Any user (via fork)   | Any user (upload)        |
| `template_id`       | self-reference          | inherited from parent | NULL                     |
| `cv_data` (JSON)    | default empty structure | user-filled data      | NULL                     |
| `file_url`          | NULL                    | NULL                  | Cloudinary/R2 URL        |
| `thumbnail_url`     | NULL (rendered live)    | NULL (rendered live)  | Cloudinary URL           |
| Editable            | Admin only              | Owner only            | Never                    |
| Forkable            | Yes                     | Yes (if `is_public`)  | No (button: "Make mine") |
| PDF download        | No (must fork first)    | Yes (with quota)      | No                       |
| Upvote/comment      | Yes                     | Yes                   | Yes                      |
| Default `status`    | APPROVED                | APPROVED              | PENDING                  |
| Default `is_public` | true                    | false (user opt-in)   | true (after approval)    |

## Authentication Flow

- Cookie-based auth using httpOnly cookies (`access_token` 15 min + `refresh_token` 7 days)
- `GET /api/v1/auth/me` → Frontend calls this to check if user is authenticated
- If 401, frontend attempts token refresh via `POST /api/v1/auth/refresh`
- Refresh tokens are rotated on use and blacklisted in Redis on logout
- If refresh fails, redirect to `/login`
- Registration: email + password; email verification optional in MVP
- Browsing the CV list is public; voting, commenting, forking, uploading, and downloading require login (frontend redirects to `/login?next=...` on click)

## Architecture Decisions

- Backend follows MVC pattern (Model-Controller, no View since it's API-only)
- Frontend uses service layer pattern for API calls (see `frontend/CLAUDE.md`)
- All API routes prefixed with `/api/v1/`
- Pagination on all list endpoints: `?page=1&page_size=20`
- Soft delete for users and CVs (`is_deleted` flag); votes/comments/downloads are hard-deleted
- File storage:
  - Images (CV thumbnails, user avatars, upload previews) → **Cloudinary** (auto-thumbnail, transformations)
  - PDFs (generated CV downloads, original uploaded PDFs) → **Cloudflare R2** (no egress fees)
  - URLs stored in DB; never the binary itself
- PDF generation: server renders the CV's HTML template + `cv_data` via Puppeteer, streams the PDF back, and uploads a copy to R2 for caching. The download counter increments only on successful generation.
- Vote semantics: clicking the same vote type removes it; clicking the opposite type replaces it. Counters on the CV row are denormalized and updated transactionally.

## MVP Scope (v1)

| Feature                                               | Status   |
| ----------------------------------------------------- | -------- |
| Auth (register, login, refresh, logout)               | Required |
| User profile (basic) + avatar                         | Required |
| Browse CV list (paginated, filter by type/tag, sort)  | Required |
| CV detail page (preview + comments + vote buttons)    | Required |
| Admin: create/edit/delete editable templates          | Required |
| User: fork an editable CV                             | Required |
| User: form-based editor for forked CVs (live preview) | Required |
| User: download own CV as PDF (3 free per CV)          | Required |
| Vote (upvote / downvote, toggle)                      | Required |
| Comments (add, delete own)                            | Required |
| Upload (PDF / PNG / JPG) for inspiration              | Required |
| Admin moderation queue (approve / reject uploads)     | Required |
| Tags + filter + search                                | Required |
| Payment (Stripe / SSLCommerz) for 4th+ download       | Required |
| Report a CV (abuse / privacy violation)               | Required |

Out of scope for v1 (planned later): OCR-based upload-to-template extraction, multi-template per CV, AI bullet-point suggestions, profile pages with portfolio of CVs, email notifications, social login.

## Development Commands

```bash
# Start everything
docker-compose up -d

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Database
cd backend && npx prisma migrate dev
cd backend && npx prisma studio

# Linting (runs via husky pre-commit)
cd frontend && npm run lint
cd backend && npm run lint
```

## API Design Conventions

- RESTful endpoints: `GET /api/v1/cvs/`, `POST /api/v1/cvs/`, `PATCH /api/v1/cvs/:id/`
- Consistent error response format:
  ```json
  {
    "type": "validation_error",
    "errors": [
      {
        "code": "required",
        "detail": "This field is required.",
        "attr": "email"
      }
    ]
  }
  ```
- Error types: `validation_error`, `auth_error`, `not_found`, `forbidden`, `quota_exceeded`, `payment_required`, `server_error`
- Success responses return the resource directly (not wrapped)
- List endpoints return: `{ count, next, previous, results }`

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@db:5432/cv_canvas
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
PORT=8000

# File storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=cv-canvas-pdfs
R2_PUBLIC_URL=https://cdn.cv-canvas.com

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...

# Download quota
FREE_DOWNLOADS_PER_CV=3
PAID_UNLOCK_PRICE_USD=2

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BRAND_NAME=cv Canvas
```

## Git Conventions

- Branch naming: `feature/feature-name`, `fix/bug-name`, `chore/task-name`
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`)
- Always create feature branch from `main`
- Husky pre-commit runs lint check on frontend & backend

## Important Rules

- NEVER commit `.env` files
- NEVER store passwords in plain text — always bcrypt hash (12 rounds)
- NEVER return password fields in API responses
- NEVER let an `INSPIRATION_UPLOAD` enter the editor or PDF-download path
- NEVER decrement the download counter — it's append-only via the `downloads` table
- All protected routes must validate cookie auth middleware
- Every database change needs a Prisma migration
- Use server components by default in Next.js, client components only when needed
- Keep components under 150 lines — extract into smaller components
- Vote and download operations MUST run inside a Prisma transaction so denormalized counters stay consistent
- Uploaded files: validate MIME type AND magic bytes (not just extension) before persisting
- Auto-detected PII (phone/email regex) in uploaded PDFs should trigger a soft warning to the uploader, never auto-redact silently
