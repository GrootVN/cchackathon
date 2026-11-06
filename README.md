# FlightPlan

**A little closer to home.** An interactive pediatric bedside care prototype that connects a reassuring family experience with an actionable clinical rounding workspace. Independent hackathon demonstration; not an official Cincinnati Children’s product.

## Run

Node 22+ and pnpm are required.

```sh
cd flightplan
pnpm install
pnpm dev
```

Open the local URL printed by Vite. `pnpm test` runs the workflow tests. `pnpm build` runs TypeScript checks and produces `dist/`; `pnpm preview` serves that production build. The esbuild install script is explicitly permitted in `pnpm-workspace.yaml`.

## What works

- Family dashboard: tappable milestones, approved daily priorities, personal checklist, editable patient-owned notes, protected clinician messages, questions and answers, and plan-opened acknowledgment.
- Clinical dashboard: verified patient snapshot, location-colored horizontal timeline, highlighted current day, expand/fit and jump-to-today controls, event details, expandable results, append-only internal event notes, and estimated discharge editing.
- Follow-ups: linked event, owner, date, priority, category, status, edit/complete/archive, and change history. Current/future markers are grouped by date. Historical overdue work remains in the table. Completed and archived work drops out of active markers.
- Six-column action history with filtering, date sorting, nurse-owned actions, overdue indicators, and questionnaires that support partial and complete progress.
- Explicit approval for family-facing priorities and rounds updates. Internal drafts, concerns, follow-ups, technical results, and action history are hidden in family-present mode.
- Quick rounds decisions with assignment, category, deadline, internal note, and optional explicitly approved family update.
- Education readings with discovery questions, a care-team quest, a playable matching game, original short stories, one-time discovery rewards, and quiet mode.
- Native modal focus handling and Escape, visible keyboard focus, labeled controls, reduced-motion support, and responsive layouts.
- Locally persistent state, toast feedback, storage-failure feedback, and a confirmation before demo reset or action archival.

## Architecture

React + TypeScript + Vite; Tailwind’s Vite integration plus a custom CSS design system; Lucide icons and original SVG illustration. No image service or API key is required. Fonts load from Google Fonts with local sans-serif fallback.

`src/model.ts` defines the typed shared state, fictional fixture, reducer mutations, and timeline selectors. Both views use the same reducer instance. `src/App.tsx` contains the views and focused interface primitives (dialog, section title, avatar, badge, illustration). `src/styles.css` owns the visual system, responsive rules, contrast refinements, and motion preferences. `src/model.test.ts` tests workflow boundaries and important edge cases.

State is stored under `flightplan-demo-v1` in this browser’s local storage. Patient and clinical views are presentation modes within the same app, not independently authenticated clients. Reloading returns to the family view and retains saved data. Separate browsers, origins, and devices do not synchronize. The fictional clinical clock is fixed at **November 6, 2026, 10:30 AM**; user-created notes use actual timestamps, while clinical action creation uses the fixed demonstration date. Use **Reset demo** for a clean presentation.

## Clinical and prototype boundaries

All patient and staff information is fictional. No birth dates or medical record numbers are collected. Never enter real health information into this prototype.

The nurse request is an explicitly labeled simulation; no nurse or emergency team is contacted. Messages are not monitored. The actual hospital call system remains the path for care needs. EHR data, results, verification labels, staff identity, authentication, and availability are simulated. The role entry screen provides no security. No diagnosis, treatment recommendation, urgency inference, or automated discharge prediction is generated.

Personal checklist completion never changes medication or treatment records. Rewards recognize voluntary education, not adherence. Family plan acknowledgment records that a plan was opened, not understanding or consent. Estimated discharge is clinician-entered and tentative. Future location periods are unknown and rendered with a dashed pattern.

Not implemented: live hospital systems, backend audit storage, cross-device delivery, configurable clinician roles, actual movies/videos, full timeline event scheduling/rescheduling, configurable diagnoses, and production access control. Follow-ups beyond the displayed discharge horizon remain discoverable in the action table. The example timeline supports a bounded long-admission demonstration by extending the estimate through December 2 and scrolling/expanding the timeline.

See [DEMO.md](DEMO.md) for the pitch, demo sequence, judge questions, and deployment prerequisites, and [QUALITY.md](QUALITY.md) for the self-assessment and actual verification record.
