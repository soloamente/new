## Background and Motivation
- Design team delivered three new SVG assets (`check`, `half-status`, `user-circle`) that must be exposed as reusable React icon components under `src/components/icons` so UI work can consume them consistently without inlining raw SVG.
- Product now needs the existing `arrow-up-right.svg` asset exposed as a typed React icon component so screens like `pratiche` can reference it without inlining SVG markup.
- Latest UI review flagged the `Body Head` wrapper on `src/app/pratiche/page.tsx` requiring an exact 12px gap expressed in rem units to align spacing tokens.
- QA just flagged `src/app/pratiche/page.tsx`: the experimental context menu should be removed, the operators table needs mock data so layout is verifiable, and the body cells must mirror the head columns for clarity and accessibility.
- Follow-up request: mock practice rows should display the time alongside the date (line 67 reference) so designers can validate temporal info layout.
- New requirement: convert every placeholder SVG under `src/components/icons/placeholders` into typed React components, surface them through the avatar fallback with deterministic randomness, and display those avatars in the practices table to make clients easy to scan.
- Latest UI feedback for avatars: the placeholder icon should render in `oklch(0.5693 0 0)` with a background of `oklch(0.36 0 0)` to match the new dark badge treatment demonstrated in the reference screenshot.

## Key Challenges and Analysis
- Ensure new components follow existing icon component conventions (typed props, optional `size`, `currentColor` fills, no hard-coded grays).
- Keep API flexible by extending `SVGProps<SVGSVGElement>` so consumers can set aria-label, className, etc.
- Update `index.ts` so new icons are discoverable via barrel exports.
- Maintain the circular background + accent colors defined in the SVG while still allowing consumers to override via props without violating "no grays" rule.
- `Body Head` spacing tweak must use rem (not px) while landing exactly on the requested 12px measure; Tailwind needs an arbitrary value to hit 0.75rem precisely.
- Removing the context menu must not regress any shared styles, and mock data should be typed to ease the eventual API swap while respecting the “no gray” visual rule in status badges.
- Avatar fallbacks have to remain deterministic (hashing based on client name/id) so identities don't jump between icons with every render.
- Placeholder icons should be centralized behind a helper array to simplify future additions and make random selection/testability straightforward.
- Adding avatars into the clients column must not break the 12-column layout or introduce dead interaction zones; we need to keep truncation + keyboard navigation accessible.
- The new placeholder palette requires centralized custom properties (light/dark) and `AvatarFallback` must consume them without overriding any consumer-provided inline styles.

## High-level Task Breakdown
1. Convert each new SVG asset into a typed React component (CheckIcon, HalfStatusIcon, UserCircleIcon) mirroring the structure of existing icons.
   - Default `size` to 15 to match source dimensions.
   - Replace static fills with `currentColor`.
2. Export the new components from `src/components/icons/index.ts`.
3. Verify builds/lints locally after changes (visual validation left to designers).
4. Convert `arrow-up-right.svg` into `ArrowUpRightIcon` component with configurable `size` prop and color overrides while preserving base appearance.
   - Accept `circleColor`/`arrowColor` props with sensible defaults derived from SVG.
   - Use `SVGProps<SVGSVGElement>` to allow className/aria attributes.
5. Export `ArrowUpRightIcon` through the icons barrel file.
6. Run targeted lint/type check covering the updated icons directory.
7. Remove the placeholder context menu elements/logic from `src/app/pratiche/page.tsx`.
8. Create a typed mock dataset for operators/users and render it in the table body.
9. Update table body structure to match header columns (labels, alignment, spacing).
10. Re-run targeted lint/type checks for the pratiche page, if feasible.
11. Append time to every mock date entry so QA can validate combined formatting.
12. Convert each placeholder SVG into a typed icon component and export them through the barrel file.
13. Build a deterministic placeholder icon selector so Avatar fallback art stays stable per client.
14. Update `src/components/ui/avatar.tsx` to render the selected placeholder icon within the fallback (with accessible labels + consistent sizing).
15. Integrate avatars within the `Pratiche` table client column without breaking layout/truncation.
16. Lint (and, if time permits, run quick tests) covering the touched files.

## Project Status Board
- [x] Task 1: Add `CheckIcon` component.
- [x] Task 2: Add `HalfStatusIcon` component.
- [x] Task 3: Add `UserCircleIcon` component.
- [x] Task 4: Update barrel exports.
- [x] Task 5: Run targeted lint/type check if feasible.
- [x] Task 6: Implement `ArrowUpRightIcon` component.
- [x] Task 7: Export `ArrowUpRightIcon` via barrel.
- [x] Task 8: Run lint on icons directory.
- [x] Task 9: Force Body Head gap to 12px using rem units on `pratiche`.
- [x] Task 10: Remove context menu block from `src/app/pratiche/page.tsx`.
- [x] Task 11: Add typed mock operator data and render rows.
- [x] Task 12: Ensure table body columns/widths match head.
- [x] Task 13: Lint/typecheck pratiche after updates.
- [x] Task 14: Append time to each mock practice date string.
- [x] Task 15: Re-run lint on `src/app/pratiche/page.tsx`.
- [x] Task 16: Convert placeholder SVGs into typed React components + export them.
- [x] Task 17: Add deterministic placeholder icon helper + update avatar fallback.
- [x] Task 18: Show avatar (with fallback icon) inside clients column on pratiche table.
- [x] Task 19: Run lint/tests covering updated icons + pratiche page.
- [x] Task 20: Introduce avatar placeholder CSS variables for icon + background tones.
- [x] Task 21: Apply the new palette inside `AvatarFallback` without breaking overrides.
- [x] Task 22: Match the select content width to its trigger in `create-practice-dialog`.
- [x] Task 23: Align practice statuses with API wording (use “sospesa” instead of “annullata”) and update dependent styling.
- [x] Task 24: Add operator creation flow per API (`/api/users` with `role_id=3`) and surface dialog in Operatori page.

## Current Status / Progress Tracking
- All three SVGs converted to typed components, exports updated, and `pnpm exec eslint src/components/icons` ran cleanly (Next 16 CLI lacks `next lint`, so we linted via ESLint directly).
- Added `ArrowUpRightIcon` with configurable colors + size, updated the icons barrel, and `npx eslint src/components/icons` passed.
- `Body Head` wrapper now uses `gap-3` (12px / 0.75rem) with an inline comment documenting the spec-driven spacing.
- `Body Head` rounded corners bumped to `rounded-xl` (12px) to satisfy the updated spec.
- `src/app/pratiche/page.tsx` now renders typed mock practice rows, the old context menu scaffold is gone, row columns mirror the header grid, and `pnpm exec eslint src/app/pratiche/page.tsx` passes.
- Mock practice entries display both date and time (per QA ask), keeping the column format untouched; lint re-run succeeded post-update.
- Placeholder SVGs (anchor through wand) now live as typed React components under `src/components/icons/placeholders`, re-exported via the main icons barrel for reuse in avatar fallbacks.
- Added `getAvatarPlaceholderIcon` helper + deterministic hashing so `AvatarFallback` now renders a consistent whimsical icon per client seed while keeping accessibility labels configurable.
- Client column in `pratiche` rows now renders the avatar component + fallback icon next to the name, making the table easier to scan visually.
- `pnpm exec eslint` over the icons directory, avatar utilities, and pratiche page completes cleanly after the updates.
- Need to add the requested `oklch` palette for avatar placeholders and wire it through `AvatarFallback`.
- `globals.css` defines `--avatar-placeholder-icon` (`oklch(0.5693 0 0)`) and `--avatar-placeholder-bg` (`oklch(0.36 0 0)`), and `AvatarFallback` now consumes them while preserving any consumer-provided inline styles.
- Select dropdown content in `create-practice-dialog` now uses the Radix trigger width CSS variable to stay equal in width to its trigger.
- Practice status taxonomy now matches the API: UI types use “suspended” for the `sospesa` state, labels render “Sospesa,” and all color tokens map to `status-suspended` variables (light/dark). Related dashboards and list/status badges updated accordingly.
- Operatori page now includes a “Crea operatore” dialog that posts to `/api/users` via the existing `createUser` server action (role_id fixed to 3), with validation, loading state, and page refresh on success.

## Executor's Feedback or Assistance Requests
- None; awaiting review/validation.

## Lessons
- Inline box-shadow with CSS variables works well for directional shadows when Tailwind utilities aren’t specific enough.
- Next 16 CLI no longer exposes `next lint`; run ESLint directly (e.g. `pnpm exec eslint <paths>`) for targeted linting.

