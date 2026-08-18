# OmniTest Agent Guide

## Product contract

OmniTest is a public, privacy-first browser diagnostic suite for keyboards, mice, typing, and touchscreens. Tests run entirely in the browser. Do not add telemetry, input capture, accounts, persistence, or network submission without explicit product approval and updated privacy copy.

## Commands

- Required Node.js: `>=22.13.0`.
- Install: `npm install`.
- Develop: `npm run dev`.
- Lint: `npm run lint`.
- Production check: `npm run build`.
- On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.
- `npm test` is currently stale and still asserts the removed starter skeleton. Fix it before treating it as a release gate.

The scripts intentionally use `cross-env` for `WRANGLER_LOG_PATH`; do not revert to Unix-only `VAR=value command` syntax.

## Architecture and coding rules

- The production UI is a client-side React page in `app/page.tsx`; global visual styling is in `app/globals.css`.
- Use `KeyboardEvent.code`, not `key`, to map physical keyboard locations. `key` and deprecated `keyCode` are telemetry only.
- Preserve keyboard states: untested, actively pressed, and persistently passed.
- Browser-hotkey suppression is active only in the keyboard test. Do not attempt to block OS-level shortcuts.
- macOS and Windows layouts are separate presentations. Preserve Apple modifier order and labels.
- Device detection is best-effort. Browsers do not reliably expose exact hardware models. Detect families and keep the manual iPhone/Android phone/iPad/Android tablet selector.
- Phones/tablets automatically enter the touch view and hide desktop tests, OS toggle, sidebar, and debug console.
- Touch input uses Pointer Events and pointer capture. Keep `touch-action: none` on the test surface.
- Full-screen touch testing must keep both paths: Fullscreen API where supported and a CSS full-viewport fallback for iPhone Safari.
- All feature-detection APIs must degrade gracefully (`navigator.vibrate`, fullscreen, `userAgentData`, media queries).
- Use Lucide icons; do not add hand-authored SVG UI icons.
- Keep the dark cyan/green visual language and accessible labels. Mobile layouts must fit narrow screens without horizontal page overflow.

## Infrastructure boundaries

- Runtime: vinext/Vite compiled to a Cloudflare Worker (`worker/index.ts`).
- Hosting config: `.openai/hosting.json`; D1 and R2 are currently `null`.
- `db/` and `app/chatgpt-auth.ts` are unused starter capabilities, not active product systems.
- No application API routes, database tables, authentication, analytics, or external services are currently used.
- Never commit `.npm-cache/`, `.wrangler/`, `dist/`, environment files, or `work/`.

## Release checklist

1. Inspect the exact diff and keep unrelated files unstaged.
2. Run `npm run lint` and `npm run build`.
3. Check keyboard, mouse, typing, and touch behavior affected by the change.
4. For touch changes, check phone and tablet proportions, touch-only navigation, and full-screen exit behavior.
5. Update docs when architecture or product behavior changes.

See `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md` before making structural changes.

