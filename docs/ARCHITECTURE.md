# OmniTest Architecture

## System overview

OmniTest is a client-heavy single-page React application built with the Next.js App Router API surface through vinext and Vite, then served by a Cloudflare Worker. There is no active backend application data flow.

```text
Browser input APIs
  ├─ KeyboardEvent / WheelEvent / MouseEvent
  ├─ PointerEvent + pointer capture
  ├─ matchMedia / navigator capability detection
  ├─ Fullscreen API with CSS fallback
  └─ Vibration and orientation APIs
           ↓
app/page.tsx React state and refs
           ↓
Keyboard / Typing / Mouse / Touch views
           ↓
app/globals.css responsive presentation

HTTP request → Cloudflare Worker → vinext App Router handler → page assets
```

## Frontend structure

### Application shell

`app/layout.tsx` loads Geist and Geist Mono, defines product metadata, and renders the single application route. `app/page.tsx` is a client component and owns all interactive state.

The page has four logical views:

- `keyboard`: physical-location key testing and live telemetry.
- `typing`: timed WPM and accuracy benchmark.
- `mouse`: buttons, wheel, movement canvas, and target benchmark.
- `touch`: phone/tablet diagnostics and full-screen dead-zone test.

The desktop shell includes header, navigation sidebar, troubleshooting drawer, and debug modal. Detected touch devices bypass desktop navigation and open the touch view directly.

### Keyboard subsystem

Key definitions are data arrays containing `code`, display label, optional width, and OS-specific labels. `KeyboardEvent.code` is the canonical identity. `keydown` updates active and passed sets, maximum simultaneous count, telemetry, and logs. `keyup` removes active state but does not clear passed state.

The layout filter implements full-size, TKL, and 60% presentations. Numpad definitions are separate. The Mac row data is derived from common rows and replaces Apple-specific labels and the modifier row.

### Typing subsystem

Typing passages are local constants. The timer starts on the first edit. Metrics are derived in memory:

- gross WPM: typed characters / 5 / elapsed minutes;
- net displayed WPM: correct characters / 5 / elapsed minutes;
- accuracy: correct characters / typed characters.

Paste is disabled. Results are not stored.

### Mouse subsystem

React mouse events track buttons 0–4, wheel direction/count, and cursor coordinates. A canvas draws the pointer path for visual smoothness inspection. The target benchmark advances through deterministic percentage positions, recording misses and average acquisition time.

### Touch subsystem

Pointer Events provide a single model for touch contacts. Active contacts are stored in a ref-backed map so multi-touch and pinch distance can be computed without waiting for React renders. State records:

- visited cells in a 6 × 10 grid;
- maximum simultaneous contacts;
- last recognized gesture;
- approximate event latency samples;
- movement-event consistency;
- pinch scale;
- orientation;
- vibration result;
- mobile typing metrics.

Gesture recognition is intentionally simple: travel over a threshold becomes a swipe, a held stationary contact becomes a long press, and two close taps become a double tap.

The browser-detected device family selects one of four profiles: iPhone, Android phone, iPad, or Android tablet. The profile changes visual proportions only; it does not emulate hardware.

Full-screen testing first activates a fixed viewport class, then requests element fullscreen where available. This ordering preserves a functional fallback when the Fullscreen API is absent or rejected. A `fullscreenchange` listener resets state when the user exits through browser controls.

## Styling and responsiveness

`app/globals.css` contains Tailwind’s import but the product UI is primarily custom CSS. It defines the dark theme, 3D keycaps, mouse illustration, diagnostic cards, touch frames, and responsive breakpoints.

At narrow widths, desktop navigation becomes a drawer. On automatically detected phones/tablets, React removes that navigation entirely and CSS changes the layout to a touch-only viewport. Full-screen touch mode uses `100dvh`, safe-area environment variables, and an overlay z-index above all app chrome.

## Server and deployment

`worker/index.ts` is the Cloudflare Worker entry. It delegates application requests to vinext and handles `/_vinext/image` through Cloudflare image transformation. `vite.config.ts` composes:

- `vinext()`;
- the local Sites plugin;
- `@cloudflare/vite-plugin` for Worker/RSC environments.

`.openai/hosting.json` identifies Sites project `appgprj_6a6603db42c48191bcfa24ab8524ef7a`. Both `d1` and `r2` are `null`. Local Wrangler and Miniflare state is project-local and ignored.

The known development URL is `https://omnitest-diagnostics.addar-veten.chatgpt.site/`. Repository publication does not by itself prove that the hosted site has redeployed. The planned custom domain is `checkmyinput.com`, but its DNS and attachment live outside this repository.

## APIs and external services

There are no application-owned HTTP APIs and no third-party runtime integrations. The only external links in the UI explain WPM methodology and ISO pointing evaluation.

Browser APIs used include Keyboard Events, Pointer Events, Canvas 2D, Fullscreen, Vibration, orientation/resize, User-Agent Client Hints when available, and media queries.

## Database and storage

There is no active database or persistence. `db/schema.ts` exports nothing, `d1` is disabled, and `db/index.ts` will throw if called without a binding. The D1 example under `examples/d1/` is reference material only.

Do not introduce storage merely to retain diagnostic results without an explicit product and privacy decision. Device-local preferences could use browser storage if clearly requested.

## Authentication and authorization

The app is public and anonymous. `app/chatgpt-auth.ts` contains optional starter helpers for OpenAI Sites identity headers, but no current route imports them. There are no protected routes, sessions, roles, or user records.

## Important directories

- `app/`: production route, layout, styles, and optional auth helper.
- `worker/`: Cloudflare Worker entry.
- `build/`: local Sites/Vite integration.
- `db/`: dormant Drizzle/D1 scaffolding.
- `examples/d1/`: non-production database example.
- `drizzle/`: migration metadata only.
- `public/`: favicon and unused starter assets.
- `tests/`: currently stale rendered-HTML tests.
- `docs/`: durable project handoff and decision records.

## Data and privacy flow

All diagnostic event data remains in ephemeral React state and refs. Reset actions clear the relevant state; a reload clears everything. No fetch call sends diagnostic data. This is both an architectural property and a visible product promise.

