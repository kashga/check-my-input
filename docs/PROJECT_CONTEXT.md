# OmniTest Project Context

## Purpose and identity

OmniTest is a single-page diagnostic web application for checking computer and mobile input hardware. The public repository is `kashga/check-my-input`, and the intended public-facing domain is `checkmyinput.com`. During development, the app has been available at `https://omnitest-diagnostics.addar-veten.chatgpt.site/`. Custom-domain DNS or production-domain attachment is not represented in this repository and should be verified separately.

The name “OmniTest” was chosen because the product grew beyond a keyboard tester into an all-in-one input diagnostic suite. The repository name and planned domain use the more descriptive “Check My Input” phrasing. Renaming either surface should be treated as a branding/SEO decision, not an incidental code cleanup.

## Product evolution

The project began as a production-ready React/Tailwind/Lucide keyboard and mouse tester. It then accumulated these major capabilities:

1. Physical keyboard testing with full-size, TKL, and 60% layouts.
2. macOS/Windows presentation switching and later automatic platform detection.
3. Mouse button, wheel, sensor-path, and Fitts-style pointing tests.
4. A conventional typing-speed benchmark using five characters per word.
5. Mobile touch diagnostics: coverage grid, multi-touch, gestures, pinch, latency heuristic, movement consistency, virtual-keyboard typing, orientation, and vibration.
6. Automatic phone/tablet touch-only mode, with manual device-family correction.
7. A prominent full-screen screen-test mode with an iPhone-compatible viewport fallback.

All tests are deliberately local. No keystrokes, pointer paths, typed passages, device information, or results are transmitted or saved.

## Current user experience

### Desktop and laptop

Users see the normal application shell with keyboard, typing, mouse, and touch navigation. The header detects macOS or Windows and retains a manual OS toggle. A debug console shows the current session’s raw input events, and a searchable troubleshooting panel contains common keyboard and mouse solutions.

### Phone and tablet

The browser attempts to identify iPhone, Android phone, iPad, or Android tablet. Exact model detection is intentionally not promised because modern browsers withhold or reduce device-identifying data. Users can correct the detected family manually.

On a detected phone or tablet, the desktop sidebar, keyboard/mouse tools, OS toggle, and debug console are hidden. The touch experience is presented in a responsive simulated device frame. The highlighted full-screen action expands the grid to the whole viewport; supported browsers use the Fullscreen API, while iPhone Safari retains a fixed full-viewport CSS fallback. An exit control remains visible inside the test.

## Important implementation history

### Windows compatibility failure

The original npm scripts used Unix-style environment assignment:

```text
WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext dev
```

Windows reported that `WRANGLER_LOG_PATH` was not a recognized command. `cross-env` was added to `dev`, `build`, and `start`, and to the lockfile. Do not remove it. A separate problem occurred when `package.json` was manually edited with JavaScript comments and a trailing comma; package files must remain strict JSON.

PowerShell may also block `npm.ps1` under restrictive execution policies. `npm.cmd run ...` is a safe local workaround; this is not an application defect.

### macOS keyboard layout

The first keyboard layout was Windows-centric even when macOS was selected. The Mac presentation now uses Apple terminology, media/function legends, Apple modifier ordering, and excludes the Windows context-menu key. Physical matching continues to use `KeyboardEvent.code` so label changes do not break location testing.

### Device detection

The first automatic detection request included “what kind of device.” The implemented boundary is honest family/capability detection: OS family, mobile/tablet/desktop-or-laptop, coarse pointer, hover, touch count, and likely input type. Desktop versus laptop and exact phone model are not reliably discoverable in normal browser APIs. Manual device-family selection is the accepted fallback.

### Mobile display redesign

The initial touch dashboard looked like a desktop card placed on a phone. It was redesigned to:

- show a phone- or tablet-proportioned test frame;
- fit the actual mobile viewport;
- hide irrelevant desktop tools on detected touch devices;
- give the user a family selector;
- emphasize full-screen dead-zone testing.

Do not regress to a fixed-height desktop panel for mobile.

### GitHub publishing history

The repository was created publicly as `kashga/check-my-input`. In this original Codex workspace, normal shell network access to GitHub was unreliable and the local repository metadata lived under ignored `work/git-meta`; several updates were therefore written directly to `master` through the connected GitHub integration, producing one remote commit per updated file in some releases. A fresh clone should use ordinary Git metadata and normal branch/PR workflow. Do not copy the `work/git-meta` workaround into the repository.

## Quality and methodology notes

- Typing speed uses the common convention of five characters per word and reports gross speed, net/correct-character speed, accuracy, and correct characters.
- The mouse click benchmark is Fitts-style and links to ISO 9241-411, but it is not a certified conformance implementation.
- Touch latency is a browser event-timing approximation, not hardware instrumentation.
- Touch smoothness is a heuristic based on movement-event interval deviation, not a calibrated sensor score.
- Browser zoom, OS gesture interception, refresh rate, power saving, and browser privacy controls can influence results.
- Vibration often fails on iOS and may require user activation or be unavailable on desktop browsers; unsupported status is expected.
- Some browser/OS hotkeys cannot be prevented. The app suppresses relevant browser defaults only while the keyboard test is active.

## Known unfinished work and maintenance debt

1. `README.md` still describes the vinext starter rather than OmniTest and should be rewritten.
2. `tests/rendered-html.test.mjs` still asserts the removed starter loading skeleton. `npm test` is not a valid release signal until the test is replaced with OmniTest assertions.
3. `app/page.tsx` and `app/globals.css` are large, centralized files. Componentization is reasonable, but only with behavior-preserving tests because event interactions are tightly coupled.
4. No automated interaction coverage exists for keyboard rollover, pointer buttons, touch gestures, device detection, or fullscreen fallback.
5. No analytics or monitoring exists by design. Adding privacy-preserving aggregate analytics would require explicit product/privacy approval.
6. The custom domain `checkmyinput.com`, awareness/SEO work, and monetization discussed during planning are not implemented in code.
7. The production deployment corresponding to the latest GitHub commit should be verified after publishing; GitHub updates and hosted-site releases are separate operations.

## Important files

- `app/page.tsx`: all interactive product behavior, test state, browser event handling, and rendered views.
- `app/globals.css`: the full visual system, keyboard keycaps, mouse diagrams, touch device frames, responsive rules, and fullscreen fallback.
- `app/layout.tsx`: fonts and OmniTest metadata.
- `worker/index.ts`: Cloudflare Worker entry and vinext image optimization.
- `vite.config.ts`: vinext, Sites, Cloudflare plugin, local bindings, and sandbox polling behavior.
- `.openai/hosting.json`: Sites project identifier; no active D1 or R2 binding.
- `app/chatgpt-auth.ts`: optional unused ChatGPT sign-in helpers inherited from the starter.
- `db/index.ts` and `db/schema.ts`: optional unused D1/Drizzle scaffolding; schema is intentionally empty.
- `tests/rendered-html.test.mjs`: obsolete starter test requiring replacement.
- `README.md`: obsolete starter documentation requiring replacement.
- `package.json`: Node requirement and cross-platform scripts.

## Handoff priorities

The safest next work is to replace the stale README and tests, then add focused tests before splitting the main page into components. If deployment is the priority, first confirm that the Sites project deploys the current `master`, then attach and verify `checkmyinput.com` separately.

