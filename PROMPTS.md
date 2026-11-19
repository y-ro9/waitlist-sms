# PROMPTS.md — Vibe Coding Traceability Log

This file documents the exact sequence of prompts used to guide the AI assistant
(Antigravity) through a **TDD-first** build of the Class Waitlist SMS Notification
Job (Twilio Mock). Each step lists the prompt, the intent, and the outcome.

---

## Step 1 — Project scaffold + architecture

**Prompt:**
> Set up a Vite + React + TypeScript project called `waitlist-sms`. Use plain CSS
> (no Tailwind). Configure Vitest + React Testing Library with jsdom. Create a
> `src/services/api.ts` mock API layer backed by localStorage, plus `src/types.ts`
> with `Student`, `ClassInfo`, `WaitlistEntry`, `SmsLog`.

**Intent:** Lock down the tech stack and the data model before writing any UI.

**Outcome:** `vite.config.ts`, `tsconfig.json`, `package.json`, `types.ts`,
`data/store.ts`, `data/seed.ts` created.

---

## Step 2 — Write the test suite FIRST (TDD)

**Prompt:**
> Do not write feature code yet. Write Vitest tests for the acceptance criteria
> below. Cover happy path AND every unhappy path. The tests must currently FAIL
> because no implementation exists.
>
> Acceptance criteria:
> - Sanitize `<` and `>` in every text input (XSS).
> - Reject invalid phone (non 10-15 digits) and invalid email.
> - Add to waitlist assigns next sequential position.
> - Notify sends SMS via mock Twilio and marks entry `notified` on success.
> - Notify returns `failed` status if mock fails.
> - Empty states show "No data found" text.
> - Spinner visible during async ops.
> - Analytics `console.log` on notify actions.

**Intent:** Lock the contract via tests before implementation (Red phase).

**Outcome:** `__tests__/sanitize.test.ts`, `__tests__/validation.test.ts`,
`__tests__/api.test.ts`, `__tests__/App.test.tsx` written and failing.

---

## Step 3 — Implement utilities (Green)

**Prompt:**
> Now implement the utilities so `sanitize.test.ts` and `validation.test.ts` pass:
> `sanitizeInput`, `validateName`, `validatePhone`, `validateEmail`.
> Sanitization must escape `<` and `>` to HTML entities and trim whitespace.
> Phone validation must accept 10-15 digits with optional leading `+`.

**Outcome:** `utils/sanitize.ts`, `utils/validation.ts` written. Tests pass.

---

## Step 4 — Implement mock Twilio + API service layer

**Prompt:**
> Implement `utils/twilioMock.ts` — `sendSms(to, body)` with a 600 ms delay,
> returns `{ sid, status, to, body, sentAt }`. It must FAIL deterministically if
> `to` (digits only) ends in `0000`. Then implement `services/api.ts`:
> `getClasses`, `getWaitlist`, `addToWaitlist`, `notifyWaitlistEntry`, `getSmsLogs`,
> plus a `ValidationError` class with a `field` property. All functions must
> sanitize text inputs and persist via `loadDB`/`saveDB`. Add 150-300 ms delays
> to simulate network.

**Outcome:** API layer implemented. `api.test.ts` passes.

---

## Step 5 — Build the UI

**Prompt:**
> Build the React UI. Requirements:
> - Header with title + "Add Student" button.
> - Class selector + search input in a toolbar.
> - Waitlist table (position, name, phone, status, joined, Notify action).
> - SMS log panel showing sent/failed with timestamps.
> - `AddStudentForm` modal with inline red field errors + `aria-invalid` + `aria-describedby`.
> - `NotifyDialog` modal with editable message + Send button.
> - `Spinner` used during every async op.
> - `EmptyState` component for "No data found" messages.
> - `trackEvent(action)` called on: add student, open notify dialog, send SMS, class change.
> - Monochromatic CSS with CSS vars, 16/32 px spacing.

**Outcome:** All components + `App.tsx` + `index.css` written. `App.test.tsx` passes.

---

## Step 6 — Unhappy path hardening (iterative loop)

**Prompt:**
> Two gaps found: (1) when `addToWaitlist` throws `ValidationError`, the parent
> must re-throw so the form can highlight the specific field, but for non-validation
> errors it should only show the banner and NOT close the form. (2) When search
> returns no rows, ensure the "No data found" empty state takes precedence over the
> main empty state message.

**Outcome:** Refined `handleAdd` catch block; verified empty-state precedence.

---

## Step 7 — Lint + a11y + DoD

**Prompt:**
> Ensure zero ESLint warnings. Verify all buttons have accessible names, modals
> use `role="dialog"` + `aria-modal`, Escape closes dialogs, and focus moves to
> the first field on dialog open. Confirm the analytics string matches exactly:
> `[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock)`.

**Outcome:** All DoD items verified. Ready to deploy.