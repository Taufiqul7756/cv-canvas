# CV Canvas — Backend

Express.js API with TypeScript, Prisma ORM, PostgreSQL, and Redis.

## Folder Structure

```
backend/
├── src/
│   ├── index.ts                → App entry point, server startup
│   ├── app.ts                  → Express app setup, middleware, static /uploads route
│   ├── db.ts                   → Prisma client singleton
│   ├── redis.ts                → Redis client (token blacklist, rate limiting, hot-list cache)
│   ├── routes/
│   │   ├── index.ts            → Route aggregator (all routes prefixed /api/v1)
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── cv.routes.ts
│   │   ├── template.routes.ts
│   │   ├── vote.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── download.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── moderation.routes.ts
│   │   ├── payment.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── cv.controller.ts
│   │   ├── template.controller.ts
│   │   ├── vote.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── download.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── moderation.controller.ts
│   │   └── payment.controller.ts
│   ├── models/                 → Prisma-based data access layer
│   │   ├── auth.model.ts
│   │   ├── user.model.ts
│   │   ├── cv.model.ts
│   │   ├── template.model.ts
│   │   ├── vote.model.ts
│   │   ├── comment.model.ts
│   │   ├── download.model.ts
│   │   └── payment.model.ts
│   ├── services/               → Business logic (NOT data access — that's models)
│   │   ├── pdf.service.ts      → Puppeteer HTML→PDF rendering
│   │   ├── storage.service.ts  → Cloudinary + R2 upload/delete helpers
│   │   ├── stripe.service.ts   → Stripe checkout, webhook verification
│   │   ├── sslcommerz.service.ts
│   │   └── render.service.ts   → Renders cv_data + template_html → final HTML
│   ├── middleware/
│   │   ├── auth.middleware.ts   → Cookie JWT verification
│   │   ├── admin.middleware.ts  → Requires req.user.role === "ADMIN"
│   │   ├── validate.middleware.ts → Zod schema validation
│   │   ├── upload.middleware.ts → Multer config for uploads
│   │   ├── ratelimit.middleware.ts → Redis-backed rate limit
│   │   └── error.middleware.ts  → Global error handler
│   ├── validators/             → Zod schemas for request validation
│   │   ├── auth.validator.ts
│   │   ├── cv.validator.ts
│   │   ├── template.validator.ts
│   │   ├── upload.validator.ts
│   │   └── user.validator.ts
│   ├── utils/
│   │   ├── jwt.ts              → Token generation/verification helpers
│   │   ├── password.ts         → bcrypt hash/compare helpers
│   │   ├── cookie.ts           → Cookie set/clear helpers
│   │   ├── pagination.ts       → Paginated response builder
│   │   ├── slugify.ts          → URL-safe slug for CV titles
│   │   ├── pii.ts              → Phone/email regex helpers for upload warnings
│   │   └── errors.ts           → Custom error classes
│   └── types/
│       └── express.d.ts        → Express Request type augmentation (req.user)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                 → Seeds admin user + 3 starter templates
│   └── migrations/
├── uploads/                    → Local temp dir for incoming uploads (deleted after R2 push)
├── .env
├── tsconfig.json
└── package.json
```

## MVC + Service Pattern

```
Request → Route → Controller → Service (when business logic)
                      ↓             ↓
                   Model ←──────────┘
                      ↓
                  Database
```

- **Routes**: Define endpoints, attach middleware and controller methods
- **Controllers**: Handle request/response, orchestrate calls, format output. NO direct Prisma calls.
- **Models**: Data access layer — all Prisma queries live here, return plain JS objects.
- **Services**: Cross-cutting business logic — PDF generation, Stripe integration, rendering. They call models, never controllers.

## Prisma Schema — Core Models

```prisma
enum UserRole {
  USER
  ADMIN
}

enum CvType {
  EDITABLE_TEMPLATE
  EDITABLE_USER
  INSPIRATION_UPLOAD
}

enum CvStatus {
  PENDING
  APPROVED
  REJECTED
}

enum VoteType {
  UP
  DOWN
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password        String
  full_name       String?
  bio             String?
  avatar_url      String?
  role            UserRole  @default(USER)
  is_active       Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  email_verified  Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  cvs        Cv[]
  votes      Vote[]
  comments   Comment[]
  downloads  Download[]
  payments   Payment[]
  reports    Report[]
  templates_authored Template[] @relation("TemplateAuthor")
}

model Template {
  id              Int      @id @default(autoincrement())
  name            String
  slug            String   @unique
  description     String?
  preview_image_url String?
  html_structure  String   @db.Text   // The CV layout HTML with {{placeholders}}
  css_styles      String   @db.Text
  default_data    Json                 // Empty/example cv_data shape
  is_active       Boolean  @default(true)
  is_deleted      Boolean  @default(false)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  author_id  Int
  author     User @relation("TemplateAuthor", fields: [author_id], references: [id])
  cvs        Cv[]
}

model Cv {
  id              Int       @id @default(autoincrement())
  title           String
  slug            String?
  type            CvType
  status          CvStatus  @default(APPROVED)
  is_public       Boolean   @default(true)
  tags            String[]  @default([])

  cv_data         Json?                       // Form data for EDITABLE_*
  file_url        String?                     // R2 URL for INSPIRATION_UPLOAD or generated PDF cache
  thumbnail_url   String?                     // Cloudinary URL for previews
  original_file_name String?
  file_mime_type  String?

  upvotes_count   Int       @default(0)
  downvotes_count Int       @default(0)
  comments_count  Int       @default(0)
  views_count     Int       @default(0)

  is_deleted      Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  user_id     Int
  user        User      @relation(fields: [user_id], references: [id])
  template_id Int?
  template    Template? @relation(fields: [template_id], references: [id])
  forked_from_id Int?
  forked_from    Cv?    @relation("CvFork", fields: [forked_from_id], references: [id])
  forks          Cv[]   @relation("CvFork")

  votes      Vote[]
  comments   Comment[]
  downloads  Download[]
  payments   Payment[]
  reports    Report[]

  @@index([type, status, is_public, is_deleted])
  @@index([upvotes_count])
  @@index([created_at])
}

model Vote {
  id          Int      @id @default(autoincrement())
  vote_type   VoteType
  created_at  DateTime @default(now())

  user_id Int
  user    User @relation(fields: [user_id], references: [id])
  cv_id   Int
  cv      Cv   @relation(fields: [cv_id], references: [id])

  @@unique([user_id, cv_id])
}

model Comment {
  id         Int      @id @default(autoincrement())
  content    String
  is_deleted Boolean  @default(false)
  created_at DateTime @default(now())

  user_id Int
  user    User @relation(fields: [user_id], references: [id])
  cv_id   Int
  cv      Cv   @relation(fields: [cv_id], references: [id])
}

model Download {
  id            Int      @id @default(autoincrement())
  is_paid       Boolean  @default(false)   // True if covered by an unlock payment
  downloaded_at DateTime @default(now())

  user_id Int
  user    User @relation(fields: [user_id], references: [id])
  cv_id   Int
  cv      Cv   @relation(fields: [cv_id], references: [id])

  @@index([user_id, cv_id])
}

model Payment {
  id            Int           @id @default(autoincrement())
  amount        Int                              // Cents/poisha
  currency      String        @default("USD")
  status        PaymentStatus @default(PENDING)
  provider      String                           // "stripe" | "sslcommerz"
  provider_id   String                           // External transaction id
  unlocks_cv    Boolean       @default(true)     // True = unlimited downloads of this CV
  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt

  user_id Int
  user    User @relation(fields: [user_id], references: [id])
  cv_id   Int
  cv      Cv   @relation(fields: [cv_id], references: [id])

  @@unique([provider, provider_id])
}

model Report {
  id         Int      @id @default(autoincrement())
  reason     String
  details    String?
  resolved   Boolean  @default(false)
  created_at DateTime @default(now())

  user_id Int
  user    User @relation(fields: [user_id], references: [id])
  cv_id   Int
  cv      Cv   @relation(fields: [cv_id], references: [id])
}
```

## API Endpoints

```
# Auth (public)
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me                          (protected)

# Users (protected unless noted)
GET    /api/v1/users/                           search users (paginated, ?search=)
GET    /api/v1/users/me                         get own profile + stats
PATCH  /api/v1/users/me                         update own profile
PATCH  /api/v1/users/me/avatar                  upload own avatar (multipart, 5MB)
PATCH  /api/v1/users/change-password
GET    /api/v1/users/:id                        get user profile (public)
GET    /api/v1/users/:id/cvs                    user's public CVs (paginated)

# Templates (admin-managed editable layouts)
GET    /api/v1/templates/                       list active templates (public)
GET    /api/v1/templates/:id                    get template (public)
POST   /api/v1/templates/                       create template (admin)
PATCH  /api/v1/templates/:id                    update template (admin)
DELETE /api/v1/templates/:id                    soft delete (admin)

# CVs — unified endpoint for all 3 types
GET    /api/v1/cvs/                             list CVs (public, paginated)
                                                ?type=EDITABLE_TEMPLATE|EDITABLE_USER|INSPIRATION_UPLOAD
                                                ?sort=upvotes|newest|trending
                                                ?tags=tech,design  ?search=
GET    /api/v1/cvs/:id                          get single CV with rendered HTML (public)
POST   /api/v1/cvs/:id/fork                     fork an editable CV → new EDITABLE_USER (protected)
PATCH  /api/v1/cvs/:id                          update cv_data on owned EDITABLE_USER (protected)
PATCH  /api/v1/cvs/:id/visibility               toggle is_public (owner only)
DELETE /api/v1/cvs/:id                          soft delete (owner or admin)
POST   /api/v1/cvs/:id/render                   server-render HTML preview (protected, owner only)

# Votes & Comments
POST   /api/v1/cvs/:id/vote                     toggle vote (body: { vote_type: "UP" | "DOWN" }) (protected)
DELETE /api/v1/cvs/:id/vote                     remove own vote (protected)
GET    /api/v1/cvs/:id/comments                 list comments (paginated, public)
POST   /api/v1/cvs/:id/comments                 add comment (protected)
DELETE /api/v1/cvs/:id/comments/:commentId      delete own comment (protected)

# Downloads
POST   /api/v1/cvs/:id/download                 generate + stream PDF (protected)
                                                Returns 402 payment_required if quota exceeded
GET    /api/v1/cvs/:id/download/quota           remaining free downloads for current user (protected)

# Uploads (inspiration CVs)
POST   /api/v1/uploads/                         multipart, 5MB max, accepts pdf/png/jpg (protected)
                                                Returns CV with status=PENDING

# Moderation (admin)
GET    /api/v1/moderation/queue                 list PENDING uploads (admin)
PATCH  /api/v1/moderation/:cvId/approve         approve upload (admin)
PATCH  /api/v1/moderation/:cvId/reject          reject upload with reason (admin)

# Reports
POST   /api/v1/cvs/:id/report                   submit a report (protected)
GET    /api/v1/admin/reports                    list reports (admin)
PATCH  /api/v1/admin/reports/:id/resolve        mark resolved (admin)

# Payments
POST   /api/v1/payments/checkout                start checkout for a CV unlock (protected)
                                                Body: { cv_id, provider: "stripe" | "sslcommerz" }
                                                Returns { checkout_url }
POST   /api/v1/payments/webhook/stripe          Stripe webhook (raw body)
POST   /api/v1/payments/webhook/sslcommerz      SSLCommerz callback
GET    /api/v1/payments/me                      list own payments (protected)
```

## Cookie Auth Implementation

### Setting Cookies (on login/register)

```typescript
// utils/cookie.ts
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
```

### Auth Middleware

```typescript
// middleware/auth.middleware.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.access_token;
  if (!token)
    return res.status(401).json({
      type: "auth_error",
      errors: [
        { code: "not_authenticated", detail: "Authentication required." },
      ],
    });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      type: "auth_error",
      errors: [
        { code: "token_not_valid", detail: "Token is invalid or expired." },
      ],
    });
  }
};
```

### Admin Middleware

```typescript
// middleware/admin.middleware.ts
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      type: "forbidden",
      errors: [{ code: "admin_only", detail: "Admin access required." }],
    });
  }
  next();
};
```

## Vote Toggle Logic (Reference Implementation)

Vote semantics live in `vote.model.ts` and run in a transaction so the denormalized counters on `Cv` stay consistent.

```typescript
// models/vote.model.ts
export const toggleVote = async (
  userId: number,
  cvId: number,
  voteType: VoteType,
) => {
  return db.$transaction(async (tx) => {
    const existing = await tx.vote.findUnique({
      where: { user_id_cv_id: { user_id: userId, cv_id: cvId } },
    });

    if (existing && existing.vote_type === voteType) {
      // Same type → remove
      await tx.vote.delete({ where: { id: existing.id } });
      await tx.cv.update({
        where: { id: cvId },
        data:
          voteType === "UP"
            ? { upvotes_count: { decrement: 1 } }
            : { downvotes_count: { decrement: 1 } },
      });
      return { vote: null };
    }

    if (existing) {
      // Opposite type → replace, swap counters
      await tx.vote.update({
        where: { id: existing.id },
        data: { vote_type: voteType },
      });
      await tx.cv.update({
        where: { id: cvId },
        data:
          voteType === "UP"
            ? {
                upvotes_count: { increment: 1 },
                downvotes_count: { decrement: 1 },
              }
            : {
                downvotes_count: { increment: 1 },
                upvotes_count: { decrement: 1 },
              },
      });
      return { vote: { ...existing, vote_type: voteType } };
    }

    // New vote
    const created = await tx.vote.create({
      data: { user_id: userId, cv_id: cvId, vote_type: voteType },
    });
    await tx.cv.update({
      where: { id: cvId },
      data:
        voteType === "UP"
          ? { upvotes_count: { increment: 1 } }
          : { downvotes_count: { increment: 1 } },
    });
    return { vote: created };
  });
};
```

## Download Quota Logic (Reference)

```typescript
// services/pdf.service.ts (excerpt)
const FREE_LIMIT = parseInt(process.env.FREE_DOWNLOADS_PER_CV ?? "3", 10);

export const checkDownloadEligibility = async (
  userId: number,
  cvId: number,
) => {
  const paidUnlock = await db.payment.findFirst({
    where: {
      user_id: userId,
      cv_id: cvId,
      status: "SUCCEEDED",
      unlocks_cv: true,
    },
  });
  if (paidUnlock) return { allowed: true, paid: true };

  const count = await db.download.count({
    where: { user_id: userId, cv_id: cvId },
  });
  if (count < FREE_LIMIT)
    return { allowed: true, paid: false, remaining: FREE_LIMIT - count };

  return { allowed: false, paid: false, remaining: 0 };
};
```

When `allowed === false`, the controller returns `402` with `{ type: "payment_required", errors: [{ code: "quota_exceeded", detail: "Free download limit reached." }] }`.

## Error Response Format

All errors follow this structure:

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

Error types: `validation_error`, `auth_error`, `not_found`, `forbidden`, `quota_exceeded`, `payment_required`, `server_error`

## Pagination Response Format

All list endpoints return:

```json
{
  "count": 100,
  "next": "/api/v1/cvs/?page=2&page_size=20",
  "previous": null,
  "results": [...]
}
```

## File Upload Notes

- **Multer** in-memory mode for incoming files; immediately streamed to Cloudinary or R2.
- **User avatar**: single image, max 5MB, JPG/PNG/WebP only → Cloudinary
- **CV inspiration upload**: single file, max 5MB, PDF/PNG/JPG only → R2 (PDF) or Cloudinary (images)
- **Validate magic bytes** with `file-type` package, not just MIME header
- **Generate thumbnail** for every upload via Cloudinary (auto for images, `pdf-thumbnail` server-side for PDFs)
- **Strip EXIF** from uploaded images (user privacy)
- Files temporarily land in `./uploads/` only if Multer disk mode is needed; always clean up after upload

## PDF Generation (Puppeteer)

```typescript
// services/pdf.service.ts (excerpt)
import puppeteer from "puppeteer";
import { renderCvHtml } from "./render.service";

export const generatePdfBuffer = async (
  cv: Cv & { template: Template },
): Promise<Buffer> => {
  const html = renderCvHtml(cv.template, cv.cv_data);
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
  } finally {
    await browser.close();
  }
};
```

The same `renderCvHtml` is used for the live web preview, so what users see on the site == what they download.

## Commands

```bash
npm run dev               # Start with nodemon (port 8000)
npm run build             # Compile TypeScript
npm run start             # Production start
npm run lint              # ESLint check
npx prisma migrate dev    # Create/apply migrations
npx prisma studio         # Visual database browser
npx prisma generate       # Regenerate Prisma client
npm run seed              # Seed admin user + 3 starter templates
```

## Redis Usage

- Refresh token blacklisting on logout (token revocation)
- Rate limiting on auth + upload + download endpoints (`ratelimit.middleware.ts`)
- Hot-list caching: top 50 CVs by `upvotes_count` cached for 60s under key `cvs:hot`
- Idempotency keys for payment webhooks (24h TTL) — prevents double-processing on retries

## Important Rules

- NEVER return password field in any API response — always exclude it via `select` in Prisma
- NEVER trust client data — validate everything with Zod
- NEVER modify files in `prisma/migrations/` directly
- NEVER allow editing or PDF generation on a CV with `type === "INSPIRATION_UPLOAD"` — return 403
- NEVER let a non-admin endpoint touch the `Template` table
- Always use `authenticate` middleware on protected routes; add `requireAdmin` for admin-only
- All database queries go through model layer, never in controllers
- Use transactions for multi-step operations: vote toggle, fork-CV, download+counter, payment-success
- Soft delete: set `is_deleted = true`, never hard delete user/cv data (keeps comment threads coherent)
- bcrypt with salt rounds of 12 for password hashing
- Rate limit `POST /uploads/` to 10/hour per user (Redis)
- Rate limit `POST /cvs/:id/download` to 30/hour per user (Redis) — prevents abuse even on paid CVs
- Stripe webhook MUST verify signature with `stripe.webhooks.constructEvent` before mutating any record
- Payment webhooks must be idempotent — check Redis idempotency key before applying side effects
- FormData validators must use `z.preprocess((v) => (v === "" ? null : v), ...)` for nullable ID and date fields
- `cv.model.ts` `cvSelect` constant must be used everywhere a CV is returned to keep response shape consistent
- When fork-creating a CV, copy `template_id` and `cv_data` deeply, set `forked_from_id`, reset all counters to 0, set `is_public=false` and `status=APPROVED`
- Never expose `cv_data` of a non-public, non-owned CV — strip it in the controller
