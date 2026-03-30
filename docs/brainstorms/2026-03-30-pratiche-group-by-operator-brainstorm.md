---
date: 2026-03-30
topic: pratiche-group-by-operator
---

# Pratiche Grouped by Operator

## What We're Building
On `/pratiche`, we will replace the flat table flow with grouped sections by operator. Each section shows an operator header and its practice rows, and each section is collapsible. Sections are expanded by default.

The current operator filter in the toolbar will be removed. Other filters (status, client, search, date) remain unchanged and continue to drive the visible dataset before grouping.

Scope is limited to `/pratiche`; `/mie-pratiche` stays unchanged.

## Why This Approach
We considered three options:
- Client-side grouping after existing filters (chosen)
- Refactoring mapping layer to output grouped structures
- API-side grouped response

We chose client-side grouping because it is the simplest change with the lowest risk and best reuse of current behavior (stats, selection, search, date/status filters). It avoids backend dependency and keeps implementation incremental.

## Key Decisions
- Grouping happens after existing filter logic (`filteredPractices`).
- Groups are collapsible and expanded by default.
- Operator filter is removed from `/pratiche` toolbar.
- Group order is deterministic by operator name, with `Non assegnato` as fallback bucket.
- Top stats remain computed from filtered practices, independent from collapse state.
- Select-all acts on currently visible rows (collapsed rows excluded).
- `/mie-pratiche` behavior remains unchanged.

## Open Questions
- None.

## Next Steps
-> `/workflows:plan` to define implementation steps, file-level changes, and verification.

