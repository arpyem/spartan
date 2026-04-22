# Mobile Frame Height Cap Fix

## Summary

- removed the desktop minimum height from the signed-in `.mobile-frame.service-shell` so the outer shell can collapse to the actual service-record content height
- preserved the existing full-viewport mobile behavior under the `max-width: 640px` rule
- preserved the full-height shared `.mobile-frame` behavior for boot and auth surfaces

## Decision

- the height cap needed to live at the shell level rather than only on the `HomeScreen` grid because `.mobile-frame` was still forcing a near-full-viewport minimum height and visually undoing the inner dashboard sizing work
- the desktop override should apply only to `.service-shell`, not to every `.mobile-frame`, because the boot and auth screens still benefit from a full-height presentation
- a capped desktop minimum still left measurable empty space below the signed-in dashboard, so the correct fix was to clear the service-shell minimum entirely at `xl` instead of tuning the cap value

## Verification

- passed: `npm test`
- passed: `npm run build`
- passed: `npm run test:e2e -- e2e/home.spec.ts`
- passed: one-off Playwright desktop capture confirmed `.mobile-frame.service-shell` dropped from `768px` to `723px`, matching the signed-in dashboard content height instead of forcing extra bottom space
