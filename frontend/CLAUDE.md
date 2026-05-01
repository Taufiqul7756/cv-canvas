# CV Canvas — Frontend

Next.js 15 App Router with TypeScript, Tailwind CSS, and React Query.

## Folder Structure

```
frontend/
├── src/
│   ├── app/                          → Next.js App Router pages and layouts
│   │   ├── (auth)/                   → Public routes (no auth required)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (public)/                 → Public browsable routes
│   │   │   ├── page.tsx              → Homepage / CV grid (default landing)
│   │   │   ├── cvs/[id]/page.tsx     → CV detail (preview + comments + vote)
│   │   │   └── layout.tsx            → Public layout with TopBar
│   │   ├── (main)/                   → Protected routes (require login)
│   │   │   ├── editor/[cvId]/page.tsx → Form-based CV editor + live preview
│   │   │   ├── my-cvs/page.tsx       → User's forked + uploaded CVs
│   │   │   ├── upload/page.tsx       → Inspiration upload form
│   │   │   ├── settings/page.tsx     → Profile, avatar, password
│   │   │   └── layout.tsx            → Main layout with TopBar + LeftSidebar
│   │   ├── (admin)/                  → Admin-only routes
│   │   │   ├── admin/templates/page.tsx          → Template list
│   │   │   ├── admin/templates/new/page.tsx      → Create template (HTML/CSS editor)
│   │   │   ├── admin/templates/[id]/page.tsx     → Edit template
│   │   │   ├── admin/moderation/page.tsx         → Pending uploads queue
│   │   │   ├── admin/reports/page.tsx            → User reports
│   │   │   └── layout.tsx            → Admin layout (gated by role check)
│   │   ├── layout.tsx                → Root layout with providers
│   │   ├── not-found.tsx             → 404 page
│   │   └── icon.tsx                  → Favicon
│   ├── components/
│   │   ├── ui/                       → Generic primitives
│   │   │   ├── Logo.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx             → "Template" / "Inspiration" pills
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layout/
│   │   │   ├── TopBar.tsx            → Logo, search, login/avatar
│   │   │   ├── LeftSidebar.tsx       → Browse / My CVs / Upload (main)
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── cv/
│   │   │   ├── CvCard.tsx            → Grid card (thumbnail, title, votes, comments)
│   │   │   ├── CvGrid.tsx            → Responsive grid wrapper
│   │   │   ├── CvFilters.tsx         → Type chips + tag chips + sort dropdown
│   │   │   ├── CvPreview.tsx         → Renders cv_data into HTML using template
│   │   │   ├── CvVoteButtons.tsx     → Up/down with optimistic toggle
│   │   │   ├── CvCommentList.tsx
│   │   │   ├── CvCommentForm.tsx
│   │   │   ├── ForkButton.tsx        → "Use this" / "Make mine"
│   │   │   ├── ReportButton.tsx
│   │   │   └── DownloadButton.tsx    → Shows quota + payment modal trigger
│   │   ├── editor/
│   │   │   ├── CvEditor.tsx          → Two-pane: form left, live preview right
│   │   │   ├── PersonalInfoForm.tsx
│   │   │   ├── SummaryForm.tsx
│   │   │   ├── ExperienceForm.tsx    → Repeatable experience entries
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   └── EditorTopBar.tsx      → Save status, download, visibility toggle
│   │   ├── upload/
│   │   │   ├── UploadDropzone.tsx
│   │   │   ├── UploadForm.tsx        → Title + tags + consent checkbox
│   │   │   └── UploadConsentNotice.tsx
│   │   ├── payment/
│   │   │   └── UnlockModal.tsx       → "Unlock this CV for $2"
│   │   ├── admin/
│   │   │   ├── TemplateForm.tsx      → Name + HTML editor + CSS editor + default_data
│   │   │   ├── ModerationCard.tsx    → Approve/reject buttons
│   │   │   └── ReportRow.tsx
│   │   └── auth/
│   │       ├── LoginRequiredModal.tsx
│   │       └── RoleGuard.tsx         → Wraps admin pages, redirects non-admin
│   ├── hooks/
│   │   ├── useAuth.ts                → Auth context hook (current user, isLoading)
│   │   ├── useQueryWithTokenRefresh.ts  → React Query useQuery + auto token refresh on 401
│   │   ├── useMutationWithTokenRefresh.ts → React Query useMutation + auto token refresh on 401
│   │   ├── useDebouncedValue.ts
│   │   └── useRequireAuth.ts         → Redirects to /login if not authenticated
│   ├── service/                      → API service layer (one file per domain)
│   │   ├── authService.ts
│   │   ├── userService.ts            → getMe, updateProfile, uploadAvatar, getUser
│   │   ├── cvService.ts              → listCvs, getCv, forkCv, updateCv, deleteCv, renderCv
│   │   ├── templateService.ts        → listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate
│   │   ├── voteService.ts            → toggleVote, removeVote
│   │   ├── commentService.ts         → listComments, addComment, deleteComment
│   │   ├── downloadService.ts        → downloadPdf, getQuota
│   │   ├── uploadService.ts          → uploadInspirationCv
│   │   ├── moderationService.ts      → listPending, approve, reject
│   │   ├── reportService.ts          → reportCv, listReports, resolveReport
│   │   └── paymentService.ts         → startCheckout, listPayments
│   ├── lib/
│   │   ├── api/
│   │   │   └── authHandlers.ts       → Axios instance with interceptors (get, post, put, patch, del, delMany)
│   │   └── cv/
│   │       └── renderCv.ts           → Client-side render of cv_data + template → HTML string
│   ├── providers/
│   │   ├── AuthProvider.tsx          → Auth context provider
│   │   ├── QueryProvider.tsx         → React Query provider
│   │   └── ToastProvider.tsx
│   ├── types/
│   │   ├── Config.ts                 → API base URL and app config
│   │   ├── Types.ts                  → Global shared TypeScript interfaces
│   │   └── models/                   → Domain-specific TypeScript interfaces
│   │       ├── User.ts
│   │       ├── Cv.ts
│   │       ├── Template.ts
│   │       ├── Vote.ts
│   │       ├── Comment.ts
│   │       ├── Payment.ts
│   │       └── CvData.ts             → Shape of cv_data JSON (full_name, experience[], etc.)
│   └── utils/
│       ├── format.ts                 → Date, count formatters
│       ├── validators.ts             → Email, password, file-size client-side checks
│       └── constants.ts              → CV_TYPES, SORT_OPTIONS, FREE_DOWNLOAD_LIMIT
├── public/
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Tailwind Theme — Modern Indigo

The full theme lives in `tailwind.config.ts`. Always reference token names (`bg-brand`, `text-ink-muted`), never raw hex.

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5", // indigo-600
          dark: "#4338CA", // indigo-700
          light: "#EEF2FF", // indigo-50
        },
        ink: {
          DEFAULT: "#0F172A", // slate-900
          muted: "#64748B", // slate-500
          subtle: "#94A3B8", // slate-400
        },
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#F8FAFC", // slate-50 (page bg)
        },
        line: {
          DEFAULT: "#E2E8F0", // slate-200
          strong: "#CBD5E1", // slate-300
        },
        accent: "#10B981", // emerald-500
        warn: "#F59E0B", // amber-500
        danger: "#EF4444", // red-500
        "tag-template-bg": "#EEF2FF",
        "tag-template-text": "#4338CA",
        "tag-upload-bg": "#FFEDD5",
        "tag-upload-text": "#9A3412",
      },
      borderRadius: {
        card: "12px",
        chip: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Component Color Cheat Sheet

| Element               | Classes                                                          |
| --------------------- | ---------------------------------------------------------------- |
| Primary button        | `bg-brand hover:bg-brand-dark text-white`                        |
| Secondary button      | `bg-white text-ink border border-line-strong hover:bg-surface-2` |
| Page background       | `bg-surface-2`                                                   |
| Card                  | `bg-surface border border-line rounded-card`                     |
| Heading               | `text-ink font-medium`                                           |
| Body text             | `text-ink`                                                       |
| Muted text            | `text-ink-muted`                                                 |
| Hint / icon           | `text-ink-subtle`                                                |
| Template badge        | `bg-tag-template-bg text-tag-template-text`                      |
| Inspiration badge     | `bg-tag-upload-bg text-tag-upload-text`                          |
| Active filter chip    | `bg-brand text-white`                                            |
| Inactive filter chip  | `bg-white text-ink border border-line-strong`                    |
| Upvote (active)       | `text-brand`                                                     |
| Vote count            | `text-ink`                                                       |
| Destructive button    | `bg-danger text-white hover:opacity-90`                          |
| Success toast / badge | `bg-accent text-white`                                           |

## API Call Pattern

This project uses a specific pattern for API calls. Follow it exactly.

### 1. HTTP Handler (`lib/api/authHandlers.ts`)

Axios instance with cookie-based auth. Exports: `get`, `post`, `put`, `patch`, `del`, `delMany`.
All requests use `withCredentials: true` for cookie auth. NO Authorization headers.

### 2. Service Layer (`service/*.ts`)

Each domain has a service factory function. Example:

```typescript
import { get, post, patch, del } from "@/lib/api/authHandlers";
import { Cv, CvListResponse, CvType, SortOption } from "@/types/models/Cv";

interface ListCvsParams {
  page: number;
  page_size: number;
  type?: CvType;
  sort?: SortOption;
  tags?: string[];
  search?: string;
}

export const cvService = () => ({
  listCvs: async (params: ListCvsParams) => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("page_size", String(params.page_size));
    if (params.type) qs.set("type", params.type);
    if (params.sort) qs.set("sort", params.sort);
    if (params.tags?.length) qs.set("tags", params.tags.join(","));
    if (params.search) qs.set("search", params.search);

    const response = await get<CvListResponse>(`/cvs/?${qs.toString()}`);
    if (!response) throw new Error("Failed to fetch CVs");
    return response;
  },

  getCv: async (id: number) => {
    const response = await get<Cv>(`/cvs/${id}`);
    if (!response) throw new Error("Failed to fetch CV");
    return response;
  },

  forkCv: async (id: number) => {
    const response = await post<Cv>(`/cvs/${id}/fork`, {});
    if (!response) throw new Error("Failed to fork CV");
    return response;
  },

  updateCv: async (id: number, cv_data: Record<string, unknown>) => {
    const response = await patch<Cv>(`/cvs/${id}`, { cv_data });
    if (!response) throw new Error("Failed to update CV");
    return response;
  },

  deleteCv: async (id: number) => {
    await del(`/cvs/${id}`);
  },
});
```

### 3. Query Hook (`useQueryWithTokenRefresh`)

Wraps React Query's `useQuery` with automatic token refresh on 401.

```typescript
const { data, isLoading } = useQueryWithTokenRefresh(
  ["cvs", { page, type, sort, tags, search }],
  async () =>
    cvService().listCvs({ page, page_size: 20, type, sort, tags, search }),
  { enabled: true },
);
```

### 4. Mutation Hook (`useMutationWithTokenRefresh`)

Wraps React Query's `useMutation` with automatic token refresh on 401.

```typescript
const forkCv = useMutationWithTokenRefresh(
  (id: number) => cvService().forkCv(id),
  {
    onSuccess: (newCv) => {
      queryClient.invalidateQueries({ queryKey: ["my-cvs"] });
      router.push(`/editor/${newCv.id}`);
      toast.success("CV forked! Edit your copy now.");
    },
  },
);
```

## Auth Check Pattern

Frontend determines auth state by calling `/auth/me`:

```typescript
const { data: user, isLoading } = useQueryWithTokenRefresh(["auth", "me"], () =>
  authService().getMe(),
);
// If error/401 after refresh attempt → redirect to login
```

The homepage (`/`) and CV detail page (`/cvs/[id]`) are PUBLIC — they call list/get endpoints without auth required. Only when the user clicks an action that needs auth (vote, fork, comment, upload, download), the frontend either:

1. Redirects to `/login?next=<current-path>` via `useRequireAuth()`, OR
2. Opens the `LoginRequiredModal` — preferred when the action is mid-flow

## Vote Optimistic Update Pattern

```typescript
const toggleVote = useMutationWithTokenRefresh(
  ({ cvId, voteType }: { cvId: number; voteType: "UP" | "DOWN" }) =>
    voteService().toggleVote(cvId, voteType),
  {
    onMutate: async ({ cvId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ["cv", cvId] });
      const prev = queryClient.getQueryData<Cv>(["cv", cvId]);
      // optimistic counter update
      if (prev) {
        queryClient.setQueryData<Cv>(
          ["cv", cvId],
          applyOptimisticVote(prev, voteType),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["cv", ctx.prev.id], ctx.prev);
      toast.error("Could not register your vote.");
    },
    onSettled: (_data, _err, { cvId }) => {
      queryClient.invalidateQueries({ queryKey: ["cv", cvId] });
    },
  },
);
```

## Editor Live Preview

The editor is a two-pane layout. The left pane is the form, the right pane is `<CvPreview>` which receives `cv_data` and `template` props and renders the same HTML the backend would render.

The renderer (`lib/cv/renderCv.ts`) is a pure function shared in spirit with the backend's `render.service.ts` — both must produce identical output for the live preview to match the downloaded PDF. Keep placeholder syntax (`{{full_name}}`, `{{#each experience}}...{{/each}}`) in lockstep.

Form changes are debounced (300ms) before pushing into the preview state. Save-to-server is debounced separately at 1500ms — auto-save with a "Saved" indicator in the EditorTopBar.

## Code Conventions

- TypeScript strict mode, no `any` types
- Use named exports, not default exports (except for pages)
- Functional components only, no class components
- Use `async/await`, never `.then()` chains
- Tailwind CSS for all styling — no custom CSS files
- Use `"use client"` only when component needs interactivity
- Server components by default
- Keep components under 150 lines — extract into smaller components
- All color references go through Tailwind tokens (`bg-brand`, `text-ink`); never inline hex
- Use lucide-react for icons, never raw SVG paste

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run lint       # ESLint check
npm run format     # Prettier format
```

## Important Rules

- NEVER store tokens in localStorage — cookies only
- NEVER use `useEffect` for data fetching — use React Query
- NEVER hardcode API URLs — always use `Config.ts`
- NEVER hardcode colors as hex in components — use Tailwind theme tokens
- NEVER show the editor or download button on a CV with `type === "INSPIRATION_UPLOAD"`
- NEVER call admin endpoints from non-admin pages — wrap admin pages in `<RoleGuard>`
- Toast notifications for all user actions (success/error)
- Loading states for all async operations
- All forms must have client-side validation before API call
- File uploads (avatar, inspiration CV) must use `FormData` with `multipart/form-data`
- Disable destructive actions (delete CV, delete comment) until a confirmation modal is shown
- The `<UnlockModal>` opens automatically when `downloadPdf` returns 402 `payment_required` — never preempt the modal client-side, let the server tell us
- The CV detail page must show a "Login to vote/comment/fork" inline CTA for unauthenticated users instead of hiding the buttons
- When the user is on a forked CV they own, the editor button replaces the fork button — do not show both
