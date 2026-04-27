## Learned User Preferences

- Hover states on `bg-card` surfaces must be visually distinct: `hover:bg-foreground/5 dark:hover:bg-white/10` is preferred over `hover:bg-muted` (which is nearly invisible on card backgrounds in light theme).
- Text sizes in table rows must be consistent; column headers and cell content should inherit the base row size (`text-base`) and not introduce smaller overrides like `text-xs` or `text-sm` unless intentional.
- Borders on card containers in list/table views should be removed when the user requests a cleaner look; only row separators (`divide-y`) should remain.
- User writes feedback in Italian and uses Page Feedback blocks; respond with concise summaries in Italian listing what was changed.

## Learned Workspace Facts

- Theme toggle (`Preferences` component, `src/components/ui/preferences.tsx`) must use `fixed right-5 bottom-5 z-50` so it is not hidden under `z-10` main content layers.
- Radix `TooltipTrigger` without `asChild` wraps children in a `<button>`, which can force `ButtonText` (often black) onto nested avatars; always use `asChild` on `TooltipTrigger` wrapping avatar elements.
- `AvatarFallback` in `src/components/ui/avatar.tsx`: the `style` prop must be spread **after** `{...restProps}` so the primitive's injected `style` does not clobber operator-specific color tokens.
- Operator list phone placeholder text is `Non indicato`, sourced from a shared constant in `src/lib/operators-utils.ts`.
- Linting is run with `npx eslint <path>` directly on file paths; do not use `next lint` for per-file checks in this project.
- Operator avatar colors use CSS custom properties (`--operator-avatar-bg-1` … `--operator-avatar-bg-8`, `--operator-avatar-icon`) defined in `src/styles/globals.css` with light/dark theme variants.
