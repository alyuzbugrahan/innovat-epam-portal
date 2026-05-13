# Quickstart: InnovatEPAM Portal Phase 1

## 1. Prerequisites
- Node.js 20+
- npm 10+

## 2. Setup
1. Install dependencies:
   - `npm install`
2. Create environment file:
   - Copy `.env.example` to `.env`
3. Required environment variables (example names):
   - `DATABASE_URL=file:./dev.db`
   - `AUTH_SECRET=<secure-random-value>`
   - `NEXTAUTH_URL=http://localhost:3000`
   - `UPLOAD_DIR=public/uploads`
4. Ensure upload directory exists:
   - `mkdir -p public/uploads`
5. Run Prisma migrations:
   - `npx prisma migrate dev`
6. Seed default roles/admin user if seed script exists:
   - `npx prisma db seed`
7. Start development server:
   - `npm run dev`

## 3. Manual Test Checklist (Critical Paths)

### Registration
1. Open register page.
2. Register submitter user.
3. Confirm duplicate email is rejected with inline error.

### Login/Logout
1. Log in with valid credentials.
2. Confirm protected pages are accessible.
3. Log out and verify protected pages redirect to login.

### Idea Submission
1. Submit idea with title, description, and category.
2. Verify idea appears in submitter list with `submitted` status.

### File Upload
1. Attach one allowed file under 10 MB and submit.
2. Verify attachment is retrievable from idea detail.
3. Attempt disallowed type and >10 MB file, verify graceful error.

### Admin Evaluation
1. Log in as admin and open all ideas queue.
2. Move an idea to `under_review`.
3. Finalize as `accepted` with comment.
4. Repeat with another idea as `rejected` with comment.

### Status Lifecycle and RBAC
1. Attempt invalid transition `submitted -> accepted` and verify rejection.
2. Attempt admin pages/actions as submitter and verify access denied.
3. Verify submitter sees latest status and evaluation comment.

## 4. UX and Accessibility Verification
- Test at 375px width and desktop width.
- Confirm keyboard navigation works on forms, dialogs, and action buttons.
- Confirm every async operation has loading and error states.
- Confirm empty states provide guidance text.

## 5. Completion Criteria
- All critical-path manual tests pass.
- No constitutional gate violations introduced.
- Feature ends in a committable state.
