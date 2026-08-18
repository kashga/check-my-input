# OmniTest Technical Decisions

## D001 — Keep diagnostics local and anonymous

**Decision:** Run all tests in the browser with no accounts, analytics, persistence, or event uploads.

**Why:** Users are entering keystrokes and generating detailed pointer/touch traces. Local-only processing supports the product’s trust proposition and avoids collecting sensitive input.

**Rejected:** Sending raw logs to a backend, saving test histories by default, or requiring sign-in.

**Reconsider only if:** A clearly scoped feature needs persistence and includes explicit consent, retention, security, and privacy design.

## D002 — Map keyboards with `KeyboardEvent.code`

**Decision:** Use `event.code` as the key identity; show `event.key` and `keyCode` only as telemetry.

**Why:** `code` represents physical location and remains stable across language/layout choices, which is the purpose of a hardware tester.

**Rejected:** Mapping by `event.key`, which would make the visual test dependent on OS language and active layout. `keyCode` is deprecated and retained only because users may recognize it in diagnostics.

## D003 — Separate OS presentation from physical logic

**Decision:** Keep a common physical model plus OS-specific labels and Mac row presentation. Auto-detect the OS, but retain a manual toggle.

**Why:** Apple and Windows keyboards differ in legends and modifier order, while physical event codes remain compatible. Automatic detection can be wrong under privacy reduction or remote sessions.

**Rejected:** One Windows-centric layout with only Command/Windows renamed.

## D004 — Suppress browser shortcuts only during active keyboard testing

**Decision:** Prevent relevant browser defaults in the keyboard view while allowing normal behavior elsewhere and accepting that OS-level shortcuts cannot be captured.

**Why:** A keyboard test must observe combinations such as Command/Ctrl shortcuts without unexpectedly navigating or reloading, but global suppression would damage normal site usability.

**Rejected:** Site-wide shortcut blocking and claims that every system shortcut can be tested in a browser.

## D005 — Use `cross-env` in npm scripts

**Decision:** Prefix vinext commands with `cross-env WRANGLER_LOG_PATH=...`.

**Why:** Unix environment-variable syntax failed on Windows with “WRANGLER_LOG_PATH is not recognized.”

**Rejected:** Platform-specific duplicate scripts or asking Windows developers to set variables manually.

**Warning:** `package.json` is strict JSON. Do not add comments or trailing commas.

## D006 — Use conventional, transparent typing metrics

**Decision:** Define one word as five characters and expose the formulas in the UI.

**Why:** This is a broadly recognized WPM convention and lets users understand results.

**Rejected:** Opaque scoring or a dependency on a remote typing-test service.

## D007 — Keep mouse testing visual and benchmark-oriented

**Decision:** Combine raw button/wheel feedback, a canvas path, and a deterministic Fitts-style target task.

**Why:** These tools reveal different failure modes: buttons, scrolling, sensor consistency, and pointing performance.

**Rejected:** Calling the benchmark ISO-certified. The link is methodological context, not a compliance claim.

## D008 — Detect device families, not exact models

**Decision:** Detect iPhone, Android phone, iPad, Android tablet, or broad desktop/laptop capabilities; provide manual correction.

**Why:** User-Agent reduction and privacy controls make exact model detection unreliable. iPad may present as Mac, requiring the `MacIntel` plus multi-touch heuristic.

**Rejected:** Guessing model names from viewport dimensions or presenting uncertain values as facts.

## D009 — Use a touch-only mobile product surface

**Decision:** Automatically open the touch view and remove desktop navigation, OS toggle, and debug logger on detected phones/tablets.

**Why:** The earlier desktop dashboard was crowded and irrelevant on a small touch device. The primary mobile job is testing the screen.

**Rejected:** Merely stacking every desktop tool vertically on mobile.

## D010 — Represent the test as a phone/tablet screen

**Decision:** Use responsive CSS device frames whose proportions change with the selected family.

**Why:** The screen-testing task is easier to understand when the active surface visually matches the class of device.

**Rejected:** A fixed 540-pixel desktop card and fake exact-device emulation. The frames communicate form factor, not hardware simulation.

## D011 — Fullscreen API plus CSS viewport fallback

**Decision:** Highlight full-screen testing, request native element fullscreen where supported, and keep a fixed `100dvh` fallback with an internal exit control.

**Why:** Fullscreen is the best way to discover edge dead zones, but iPhone Safari may not support arbitrary element fullscreen. A fallback is required for the platform that most needs mobile testing.

**Rejected:** Depending exclusively on `requestFullscreen()` or hiding browser incompatibility behind a disabled button.

## D012 — Pointer Events for touch diagnostics

**Decision:** Use Pointer Events, pointer IDs, and pointer capture instead of separate touch-event code.

**Why:** Pointer Events provide a consistent contact model and support multi-touch maps with less duplicated logic.

**Rejected:** Maintaining parallel mouse/touch handlers for the screen grid.

## D013 — Keep browser-derived performance claims modest

**Decision:** Label touch latency and smoothness as browser-level approximations/heuristics.

**Why:** JavaScript event timing cannot isolate panel scan rate, OS scheduling, browser coalescing, refresh rate, or hardware latency.

**Rejected:** Reporting a laboratory-grade latency or sensor-health score.

## D014 — Preserve dormant platform scaffolding but do not treat it as active

**Decision:** Keep the starter’s D1, Drizzle, Worker image, and ChatGPT-auth helpers for now, while documenting that OmniTest does not use them.

**Why:** They are part of the hosting starter and may support future work, but removing them was not necessary to deliver the diagnostic suite.

**Rejected:** Inventing database or authentication architecture that the product does not have.

## D015 — Treat GitHub publication and site deployment as separate

**Decision:** Verify repository changes independently from the hosted Sites deployment.

**Why:** Several updates were published directly to GitHub through a connected integration because shell network access was unreliable. A successful GitHub commit does not prove the Sites URL or custom domain has redeployed.

**Rejected:** Reporting the public website as updated solely because `master` changed.

## D016 — Defer component extraction until behavior is covered

**Decision:** Accept the current monolithic page/CSS as debt and prioritize behavior-preserving tests before a large refactor.

**Why:** Keyboard, pointer, touch, timing, and fullscreen state interact. Splitting files without coverage creates a high regression risk.

**Rejected:** A cosmetic folder restructure that changes no user value but risks event behavior.

