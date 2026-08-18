"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, Bug, Check, ChevronDown, ChevronRight, CircleHelp,
  Command, Crosshair, Gauge, Keyboard, Menu, Mouse, RotateCcw, Search, ShieldCheck,
  Target, Timer, X, Zap,
} from "lucide-react";

type OS = "mac" | "windows";
type View = "keyboard" | "typing" | "mouse";
type Layout = "full" | "tkl" | "60";
type KeyDef = { code: string; label: string; width?: number; mac?: string; win?: string };
type LogItem = { id: number; time: string; type: string; detail: string };
type DeviceInfo = { label: string; platform: string; input: string };

const rows: KeyDef[][] = [
  [
    { code: "Escape", label: "Esc" }, { code: "F1", label: "F1" }, { code: "F2", label: "F2" },
    { code: "F3", label: "F3" }, { code: "F4", label: "F4" }, { code: "F5", label: "F5" },
    { code: "F6", label: "F6" }, { code: "F7", label: "F7" }, { code: "F8", label: "F8" },
    { code: "F9", label: "F9" }, { code: "F10", label: "F10" }, { code: "F11", label: "F11" },
    { code: "F12", label: "F12" }, { code: "PrintScreen", label: "PrtSc" }, { code: "ScrollLock", label: "ScrLk" }, { code: "Pause", label: "Pause" },
  ],
  [
    { code: "Backquote", label: "`" }, { code: "Digit1", label: "1" }, { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" }, { code: "Digit4", label: "4" }, { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" }, { code: "Digit7", label: "7" }, { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" }, { code: "Digit0", label: "0" }, { code: "Minus", label: "−" },
    { code: "Equal", label: "=" }, { code: "Backspace", label: "Backspace", width: 2 },
    { code: "Insert", label: "Ins" }, { code: "Home", label: "Home" }, { code: "PageUp", label: "PgUp" },
  ],
  [
    { code: "Tab", label: "Tab", width: 1.5 }, ..."QWERTYUIOP".split("").map((k) => ({ code: `Key${k}`, label: k })),
    { code: "BracketLeft", label: "[" }, { code: "BracketRight", label: "]" }, { code: "Backslash", label: "\\", width: 1.5 },
    { code: "Delete", label: "Del" }, { code: "End", label: "End" }, { code: "PageDown", label: "PgDn" },
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.8 }, ..."ASDFGHJKL".split("").map((k) => ({ code: `Key${k}`, label: k })),
    { code: "Semicolon", label: ";" }, { code: "Quote", label: "'" }, { code: "Enter", label: "Enter", width: 2.2 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.25 }, ..."ZXCVBNM".split("").map((k) => ({ code: `Key${k}`, label: k })),
    { code: "Comma", label: "," }, { code: "Period", label: "." }, { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", width: 2.75 }, { code: "ArrowUp", label: "↑" },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.35 }, { code: "MetaLeft", label: "", mac: "⌘", win: "Win", width: 1.35 },
    { code: "AltLeft", label: "", mac: "⌥", win: "Alt", width: 1.35 }, { code: "Space", label: "", width: 6.4 },
    { code: "AltRight", label: "", mac: "⌥", win: "Alt", width: 1.35 }, { code: "MetaRight", label: "", mac: "⌘", win: "Win", width: 1.35 },
    { code: "ContextMenu", label: "Menu", width: 1.35 }, { code: "ControlRight", label: "Ctrl", width: 1.35 },
    { code: "ArrowLeft", label: "←" }, { code: "ArrowDown", label: "↓" }, { code: "ArrowRight", label: "→" },
  ],
];

const macRows: KeyDef[][] = rows.map((row, rowIndex) => {
  if (rowIndex === 0) {
    const functionLabels: Record<string, string> = {
      F1: "F1 · ☀−", F2: "F2 · ☀+", F3: "F3 · Mission", F4: "F4 · Search",
      F5: "F5 · Mic", F6: "F6 · Focus", F7: "F7 · ◀◀", F8: "F8 · ▶Ⅱ",
      F9: "F9 · ▶▶", F10: "F10 · Mute", F11: "F11 · Vol−", F12: "F12 · Vol+",
    };
    return row.map((key) => ({ ...key, mac: functionLabels[key.code] ?? key.mac }));
  }
  const labels: Record<string, string> = {
    Backspace: "delete ⌫", Enter: "return ↩", CapsLock: "caps lock ⇪",
    ShiftLeft: "shift ⇧", ShiftRight: "shift ⇧", ControlLeft: "control ⌃",
    ControlRight: "control ⌃", AltLeft: "option ⌥", AltRight: "option ⌥",
    MetaLeft: "command ⌘", MetaRight: "command ⌘", Delete: "delete ⌦",
  };
  return row.map((key) => ({ ...key, mac: labels[key.code] ?? key.mac }));
});

macRows[5] = [
  { code: "ControlLeft", label: "", mac: "control ⌃", width: 1.45 },
  { code: "AltLeft", label: "", mac: "option ⌥", width: 1.45 },
  { code: "MetaLeft", label: "", mac: "command ⌘", width: 1.75 },
  { code: "Space", label: "", width: 6.2 },
  { code: "MetaRight", label: "", mac: "command ⌘", width: 1.75 },
  { code: "AltRight", label: "", mac: "option ⌥", width: 1.45 },
  { code: "ArrowLeft", label: "←" }, { code: "ArrowDown", label: "↓" },
  { code: "ArrowRight", label: "→" },
];

const numpadRows: KeyDef[][] = [
  [{ code: "NumLock", label: "Num" }, { code: "NumpadDivide", label: "/" }, { code: "NumpadMultiply", label: "×" }, { code: "NumpadSubtract", label: "−" }],
  [{ code: "Numpad7", label: "7" }, { code: "Numpad8", label: "8" }, { code: "Numpad9", label: "9" }, { code: "NumpadAdd", label: "+" }],
  [{ code: "Numpad4", label: "4" }, { code: "Numpad5", label: "5" }, { code: "Numpad6", label: "6" }, { code: "NumpadAdd", label: "+" }],
  [{ code: "Numpad1", label: "1" }, { code: "Numpad2", label: "2" }, { code: "Numpad3", label: "3" }, { code: "NumpadEnter", label: "Enter" }],
  [{ code: "Numpad0", label: "0", width: 2 }, { code: "NumpadDecimal", label: "." }, { code: "NumpadEnter", label: "Enter" }],
];

const guide = [
  { category: "Keyboard Hardware", issue: "Sticky or Unresponsive Key", solutions: ["Clean around the key with compressed air.", "Check for physical obstructions beneath the keycap.", "Verify the connection using multiple USB ports."] },
  { category: "Keyboard Software", issue: "Wrong Characters Inputted", solutions: ["Check OS language and keyboard layout settings, such as QWERTY versus DVORAK.", "Disable specialized macro or remapping software and retest."] },
  { category: "Mouse Sensor", issue: "Jittery or Unresponsive Cursor", solutions: ["Clean the optical sensor with a soft, dry cloth.", "Test on a different surface—ideally a consistent mousepad.", "Check for wireless interference or a low battery."] },
];

const typingPassages = [
  "Reliable diagnostics begin with careful observation. Type at a steady pace, keep your eyes on the text, and prioritize accuracy before speed.",
  "Modern input devices translate tiny physical movements into precise digital signals. Consistent rhythm and relaxed hands often produce the best results.",
  "A quick brown fox jumps over the lazy dog while bright monitors glow nearby. Every accurate keystroke helps build a clearer performance profile.",
];

const targetPositions = [
  [12, 18], [78, 72], [48, 34], [86, 15], [24, 78], [62, 58], [7, 52], [69, 25],
  [42, 82], [91, 48], [31, 12], [55, 69], [15, 35], [81, 88], [38, 48], [66, 8],
  [5, 86], [92, 30], [51, 17], [27, 60],
];

function Keycap({ item, os, pressed, passed }: { item: KeyDef; os: OS; pressed: boolean; passed: boolean }) {
  const label = os === "mac" ? item.mac ?? item.label : item.win ?? item.label;
  return (
    <div
      className={`keycap ${pressed ? "pressed" : passed ? "passed" : ""}`}
      style={{ "--key-width": item.width ?? 1 } as React.CSSProperties}
      title={item.code}
    >
      <span>{label}</span>
      {passed && !pressed && <Check size={10} strokeWidth={3} className="key-check" />}
    </div>
  );
}

export default function Home() {
  const [os, setOs] = useState<OS>("mac");
  const [device, setDevice] = useState<DeviceInfo>({ label: "Detecting device…", platform: "Browser check", input: "—" });
  const [view, setView] = useState<View>("keyboard");
  const [layout, setLayout] = useState<Layout>("full");
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState({ key: "—", code: "Awaiting input", keyCode: "—" });
  const [maxRollover, setMaxRollover] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideQuery, setGuideQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(0);
  const [mouseButtons, setMouseButtons] = useState<Set<number>>(new Set());
  const [scrollLines, setScrollLines] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [mobileNav, setMobileNav] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingDuration, setTypingDuration] = useState(60);
  const [typingTime, setTypingTime] = useState(60);
  const [typingActive, setTypingActive] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(-1);
  const [targetHits, setTargetHits] = useState(0);
  const [targetMisses, setTargetMisses] = useState(0);
  const [targetTimes, setTargetTimes] = useState<number[]>([]);
  const targetShownAt = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const logId = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nav = navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };
      const platform = nav.userAgentData?.platform || navigator.platform || "Unknown platform";
      const agent = navigator.userAgent;
      const isMac = /Mac|iPhone|iPad|iPod/i.test(platform) || /Macintosh|iPhone|iPad|iPod/i.test(agent);
      const isWindows = /Win/i.test(platform) || /Windows/i.test(agent);
      if (isMac) setOs("mac");
      else if (isWindows) setOs("windows");

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const hover = window.matchMedia("(hover: hover)").matches;
      const touchPoints = navigator.maxTouchPoints || 0;
      const mobile = nav.userAgentData?.mobile ?? /Android|iPhone|Mobile/i.test(agent);
      const tablet = !mobile && touchPoints > 0 && coarse;
      const label = mobile ? "Mobile device" : tablet ? "Tablet" : "Desktop or laptop";
      const input = coarse && !hover ? "Touch input" : touchPoints > 0 ? "Mouse/trackpad + touch" : "Mouse or trackpad";
      const detectedPlatform = isMac ? (/iPhone|iPad|iPod/i.test(platform + agent) ? "iOS / iPadOS" : "macOS") : isWindows ? "Windows" : platform;
      setDevice({ label, platform: detectedPlatform, input });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addLog = useCallback((type: string, detail: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions);
    setLogs((old) => [{ id: ++logId.current, time, type, detail }, ...old].slice(0, 120));
  }, []);

  useEffect(() => {
    if (view !== "keyboard") return;
    const down = (e: KeyboardEvent) => {
      const isBrowserShortcut = (e.metaKey || e.ctrlKey) && !["Escape"].includes(e.code);
      if (isBrowserShortcut || ["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      setPressed((old) => {
        const next = new Set(old).add(e.code);
        setMaxRollover((max) => Math.max(max, next.size));
        return next;
      });
      setPassed((old) => new Set(old).add(e.code));
      setLastKey({ key: e.key, code: e.code, keyCode: String(e.keyCode) });
      addLog("keydown", `${e.code} · key="${e.key}" · keyCode=${e.keyCode} · ${os === "mac" ? "macOS" : "Windows"}`);
    };
    const up = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressed((old) => { const next = new Set(old); next.delete(e.code); return next; });
      addLog("keyup", e.code);
    };
    const clear = () => setPressed(new Set());
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up, { passive: false });
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [view, os, addLog]);

  useEffect(() => {
    if (!typingActive) return;
    const timer = window.setInterval(() => {
      setTypingTime((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setTypingActive(false);
          setTypingDone(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [typingActive]);

  const resetKeyboard = () => {
    setPressed(new Set()); setPassed(new Set()); setMaxRollover(0);
    setLastKey({ key: "—", code: "Awaiting input", keyCode: "—" });
    addLog("system", "Keyboard test reset");
  };

  const resetMouse = () => {
    setMouseButtons(new Set()); setScrollLines(0); setCursor({ x: 0, y: 0 }); lastPoint.current = null;
    const canvas = canvasRef.current; if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    addLog("system", "Mouse test reset");
  };

  const mouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); setMouseButtons((old) => new Set(old).add(e.button));
    addLog("mousedown", `button=${e.button} · X=${e.clientX} · Y=${e.clientY}`);
  };
  const mouseUp = (e: React.MouseEvent) => {
    setMouseButtons((old) => { const next = new Set(old); next.delete(e.button); return next; });
    addLog("mouseup", `button=${e.button}`);
  };
  const moveTrack = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left), y = Math.round(e.clientY - rect.top);
    setCursor({ x, y });
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    if (lastPoint.current) {
      ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(49, 225, 216, .72)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = "rgba(49, 225, 216, .045)"; ctx.fill();
    }
    lastPoint.current = { x, y };
  };

  const visibleRows = useMemo(() => (os === "mac" ? macRows : rows).map((row, rowIndex) =>
    row.filter((key) => {
      if (layout === "full") return true;
      if (layout === "tkl") return true;
      if (rowIndex === 0) return false;
      return !["Insert", "Home", "PageUp", "Delete", "End", "PageDown", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(key.code);
    })
  ), [layout, os]);

  const filteredGuide = guide.filter((g) => `${g.category} ${g.issue} ${g.solutions.join(" ")}`.toLowerCase().includes(guideQuery.toLowerCase()));
  const totalKeys = visibleRows.flat().length + (layout === "full" ? 20 : 0);
  const visibleCodes = new Set([...visibleRows.flat(), ...(layout === "full" ? numpadRows.flat() : [])].map((key) => key.code));
  const testedVisibleKeys = [...passed].filter((code) => visibleCodes.has(code)).length;
  const passage = typingPassages[passageIndex];
  const correctChars = [...typingText].filter((char, index) => char === passage[index]).length;
  const elapsedMinutes = Math.max(1 / 60, (typingDuration - typingTime) / 60);
  const grossWpm = Math.round((typingText.length / 5) / elapsedMinutes);
  const netWpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
  const typingAccuracy = typingText.length ? Math.round((correctChars / typingText.length) * 100) : 100;
  const resetTyping = () => {
    setTypingText(""); setTypingTime(typingDuration); setTypingActive(false); setTypingDone(false);
    setPassageIndex((value) => (value + 1) % typingPassages.length);
  };
  const startTargetTest = () => {
    setTargetIndex(0); setTargetHits(0); setTargetMisses(0); setTargetTimes([]);
    targetShownAt.current = performance.now(); addLog("system", "Fitts-style pointer test started");
  };
  const hitTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reaction = performance.now() - targetShownAt.current;
    setTargetTimes((old) => [...old, reaction]); setTargetHits((value) => value + 1);
    if (targetIndex >= targetPositions.length - 1) {
      setTargetIndex(-2); addLog("system", "Pointer benchmark completed");
    } else {
      setTargetIndex((value) => value + 1); targetShownAt.current = performance.now();
    }
  };
  const targetAttempts = targetHits + targetMisses;
  const targetAccuracy = targetAttempts ? Math.round((targetHits / targetAttempts) * 100) : 100;
  const averageTargetTime = targetTimes.length ? Math.round(targetTimes.reduce((a, b) => a + b, 0) / targetTimes.length) : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu"><Menu size={20} /></button>
          <div className="brand-mark"><Activity size={20} /></div>
          <span>OMNI<span>TEST</span></span>
          <div className="status-pill"><i /> SYSTEM READY</div>
        </div>
        <div className="os-toggle" role="group" aria-label="Operating system">
          <button className={os === "mac" ? "active" : ""} onClick={() => setOs("mac")}><Command size={14} /> macOS</button>
          <button className={os === "windows" ? "active" : ""} onClick={() => setOs("windows")}><span className="win-icon">⊞</span> Windows</button>
        </div>
        <div className="secure-label device-summary" title={`${device.label} · ${device.input}`}><ShieldCheck size={16} /><span><b>{device.platform}</b><small>{device.label}</small></span></div>
      </header>

      <div className="body-grid">
        <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
          <nav>
            <p className="nav-label">TEST TOOLS</p>
            <button className={view === "keyboard" ? "nav-item active" : "nav-item"} onClick={() => { setView("keyboard"); setMobileNav(false); }}>
              <Keyboard size={18} /> Keyboard Test <ChevronRight size={15} />
            </button>
            <button className={view === "typing" ? "nav-item active" : "nav-item"} onClick={() => { setView("typing"); setMobileNav(false); }}>
              <Timer size={18} /> Typing Speed <ChevronRight size={15} />
            </button>
            <button className={view === "mouse" ? "nav-item active" : "nav-item"} onClick={() => { setView("mouse"); setMobileNav(false); }}>
              <Mouse size={18} /> Mouse Test <ChevronRight size={15} />
            </button>
            <p className="nav-label spaced">DIAGNOSTIC TOOLS</p>
            <button className="nav-item" onClick={() => setConsoleOpen(true)}><Bug size={18} /> Open Debug Console <ChevronRight size={15} /></button>
          </nav>
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={19} /></div>
            <div><b>Need help?</b><p>Find guided solutions for common issues.</p></div>
            <button onClick={() => setGuideOpen(!guideOpen)}>Troubleshooting Guide <ArrowRight size={15} /></button>
          </div>
          <div className="privacy"><ShieldCheck size={16} /><span><b>100% private testing</b><small>No input data leaves your browser.</small></span></div>
        </aside>

        <section className="workspace">
          {view === "keyboard" ? (
            <>
              <div className="page-heading">
                <div><div className="eyebrow"><span>01</span> INPUT DIAGNOSTIC</div><h1>Keyboard <em>Test</em></h1><p>Press every key. Each input is mapped by its physical location.</p><div className="detected-device"><Activity size={13} /><b>Detected:</b> {device.platform} · {device.label} · {device.input}</div></div>
                <label className="select-wrap">LAYOUT
                  <select value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
                    <option value="full">Full-Size (100%)</option><option value="tkl">TKL (80%)</option><option value="60">60%</option>
                  </select><ChevronDown size={15} />
                </label>
              </div>
              <div className="tester-card">
                <div className="tester-top">
                  <div className="legend"><span><i className="dot untested" /> Untested</span><span><i className="dot press" /> Pressed</span><span><i className="dot pass" /> Passed</span></div>
                  <div className="test-live"><i /> TEST ACTIVE</div>
                </div>
                <div className={`keyboard-frame layout-${layout}`}>
                  <div className="keyboard-main">
                    {visibleRows.map((row, i) => <div className="key-row" key={i}>{row.map((key) => <Keycap key={`${key.code}-${i}`} item={key} os={os} pressed={pressed.has(key.code)} passed={passed.has(key.code)} />)}</div>)}
                  </div>
                  {layout === "full" && <div className="numpad">{numpadRows.map((row, i) => <div className="key-row" key={i}>{row.map((key, j) => <Keycap key={`${key.code}-${i}-${j}`} item={key} os={os} pressed={pressed.has(key.code)} passed={passed.has(key.code)} />)}</div>)}</div>}
                </div>
                <div className="progress-row"><span>{testedVisibleKeys} / {totalKeys} keys tested</span><div className="progress"><i style={{ width: `${Math.min(100, (testedVisibleKeys / totalKeys) * 100)}%` }} /></div><b>{Math.round(Math.min(100, (testedVisibleKeys / totalKeys) * 100))}%</b></div>
              </div>
              <div className="telemetry">
                <div className="telemetry-title"><div><Gauge size={18} /><span><b>LIVE TELEMETRY</b><small>Real-time input data</small></span></div><button onClick={resetKeyboard}><RotateCcw size={15} /> Reset Test</button></div>
                <div className="metric wide"><label>LAST PRESSED KEY</label><strong>{lastKey.key}</strong><code>{lastKey.code}</code><small>keyCode: {lastKey.keyCode}</small></div>
                <div className="metric"><label>MAX ROLL-OVER <span>NKRO</span></label><strong>{maxRollover}</strong><small>simultaneous keys</small></div>
                <div className="metric"><label>ACTIVE NOW</label><strong className="cyan">{pressed.size}</strong><small>{pressed.size ? [...pressed].join(" + ") : "No keys held"}</small></div>
              </div>
            </>
          ) : view === "typing" ? (
            <>
              <div className="page-heading">
                <div><div className="eyebrow"><span>02</span> PERFORMANCE BENCHMARK</div><h1>Typing <em>Speed</em></h1><p>A standardized, accuracy-aware words-per-minute test.</p></div>
                <label className="select-wrap">DURATION
                  <select value={typingDuration} disabled={typingActive} onChange={(e) => { const value = Number(e.target.value); setTypingDuration(value); setTypingTime(value); }}>
                    <option value={30}>30 seconds</option><option value={60}>60 seconds</option><option value={120}>2 minutes</option>
                  </select><ChevronDown size={15} />
                </label>
              </div>
              <div className="typing-card">
                <div className="typing-top">
                  <div><Zap size={17} /><span><b>STANDARD WPM TEST</b><small>One word equals five characters</small></span></div>
                  <strong className={typingTime <= 10 && typingActive ? "urgent" : ""}>{Math.floor(typingTime / 60)}:{String(typingTime % 60).padStart(2, "0")}</strong>
                </div>
                <div className="typing-passage" onClick={() => document.getElementById("typing-input")?.focus()}>
                  {[...passage].map((char, index) => {
                    const state = index < typingText.length ? (typingText[index] === char ? "correct" : "wrong") : index === typingText.length ? "current" : "";
                    return <span className={state} key={index}>{char}</span>;
                  })}
                </div>
                <textarea
                  id="typing-input"
                  value={typingText}
                  disabled={typingDone}
                  spellCheck={false}
                  autoCapitalize="off"
                  placeholder={typingDone ? "Test complete — reset to try again." : "Click here and start typing…"}
                  onPaste={(e) => e.preventDefault()}
                  onChange={(e) => {
                    if (!typingActive && !typingDone) setTypingActive(true);
                    setTypingText(e.target.value.slice(0, passage.length));
                    if (e.target.value.length >= passage.length) { setTypingActive(false); setTypingDone(true); }
                  }}
                />
                <div className="typing-results">
                  <div><label>NET SPEED</label><strong>{netWpm}</strong><small>WPM</small></div>
                  <div><label>GROSS SPEED</label><strong>{grossWpm}</strong><small>WPM</small></div>
                  <div><label>ACCURACY</label><strong>{typingAccuracy}</strong><small>%</small></div>
                  <div><label>CHARACTERS</label><strong>{correctChars}</strong><small>correct</small></div>
                  <button onClick={resetTyping}><RotateCcw size={15} /> New Test</button>
                </div>
              </div>
              <div className="method-card">
                <ShieldCheck size={18} /><div><b>Transparent methodology</b><p>Net speed uses correctly entered characters ÷ 5 ÷ elapsed minutes. Accuracy is correct characters divided by all typed characters.</p></div>
                <a href="https://www.typing.com/blog/what-is-words-per-minute/" target="_blank" rel="noreferrer">WPM convention <ArrowRight size={13} /></a>
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div><div className="eyebrow"><span>03</span> POINTER DIAGNOSTIC</div><h1>Mouse <em>Test</em></h1><p>Click every button, scroll, trace the sensor, and run a guided benchmark.</p></div>
                <button className="reset-head" onClick={resetMouse}><RotateCcw size={15} /> Reset Test</button>
              </div>
              <div className="mouse-grid">
                <div className="mouse-card">
                  <div className="card-label"><Mouse size={17} /> BUTTON RESPONSE</div>
                  <div className="mouse-stage" onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseLeave={() => setMouseButtons(new Set())} onContextMenu={(e) => e.preventDefault()}>
                    <div className={`mouse-body ${mouseButtons.size ? "reacting" : ""}`}>
                      <div className={`mouse-left ${mouseButtons.has(0) ? "active" : ""}`}><span>LEFT</span></div>
                      <div className={`mouse-right ${mouseButtons.has(2) ? "active" : ""}`}><span>RIGHT</span></div>
                      <div className={`mouse-wheel ${mouseButtons.has(1) ? "active" : ""}`}><i /></div>
                      <div className={`side-btn one ${mouseButtons.has(3) ? "active" : ""}`}>4</div>
                      <div className={`side-btn two ${mouseButtons.has(4) ? "active" : ""}`}>5</div>
                    </div>
                  </div>
                  <div className="button-readouts">{["Left", "Middle", "Right", "Side 4", "Side 5"].map((name, i) => {
                    const index = [0, 1, 2, 3, 4][i]; return <div key={name} className={mouseButtons.has(index) ? "active" : ""}><i />{name}</div>;
                  })}</div>
                </div>
                <div className="sensor-card">
                  <div className="card-label"><Activity size={17} /> SENSOR TRACKING <span>MOVE HERE</span></div>
                  <div className="canvas-wrap">
                    <canvas ref={canvasRef} width={760} height={390} onMouseMove={moveTrack} onMouseLeave={() => { lastPoint.current = null; }} />
                    {!cursor.x && !cursor.y && <div className="canvas-hint"><Activity size={27} /><b>Move your mouse here</b><span>A smooth line indicates consistent sensor tracking</span></div>}
                    <div className="coords">X <b>{cursor.x}</b> &nbsp; Y <b>{cursor.y}</b></div>
                  </div>
                </div>
                <div className="scroll-card" onWheel={(e) => { e.preventDefault(); const lines = e.deltaMode === 1 ? e.deltaY : e.deltaY / 100; setScrollLines((v) => v + Math.sign(lines)); addLog("wheel", `deltaY=${Math.round(e.deltaY)}`); }}>
                  <div><div className="scroll-wheel-icon"><i /></div><span><b>SCROLL WHEEL TEST</b><small>Scroll over this area</small></span></div>
                  <strong>{scrollLines > 0 ? "+" : ""}{scrollLines}</strong><span>lines scrolled</span>
                </div>
                <div className="target-card">
                  <div className="card-label"><Crosshair size={17} /> MOVE &amp; CLICK BENCHMARK <span>20 TARGETS</span></div>
                  <div className="target-stage" onMouseDown={(e) => { if (targetIndex >= 0 && e.target === e.currentTarget) setTargetMisses((v) => v + 1); }}>
                    {targetIndex >= 0 && <button
                      className="click-target"
                      aria-label={`Target ${targetIndex + 1} of ${targetPositions.length}`}
                      style={{ left: `${targetPositions[targetIndex][0]}%`, top: `${targetPositions[targetIndex][1]}%` }}
                      onMouseDown={hitTarget}
                    ><i /></button>}
                    {targetIndex === -1 && <div className="target-intro"><Target size={28} /><b>Fitts-style pointing test</b><span>Move quickly and click each target. Empty-area clicks count as misses.</span><button onClick={startTargetTest}>Start 20-target test</button></div>}
                    {targetIndex === -2 && <div className="target-intro complete"><Check size={28} /><b>Benchmark complete</b><span>{averageTargetTime} ms average · {targetAccuracy}% accuracy</span><button onClick={startTargetTest}>Run again</button></div>}
                  </div>
                  <div className="target-metrics">
                    <div><label>PROGRESS</label><strong>{targetHits}<small>/20</small></strong></div>
                    <div><label>AVG. TARGET TIME</label><strong>{averageTargetTime || "—"}<small>{averageTargetTime ? " ms" : ""}</small></strong></div>
                    <div><label>ACCURACY</label><strong>{targetAccuracy}<small>%</small></strong></div>
                    <a href="https://www.iso.org/standard/54106.html" target="_blank" rel="noreferrer">Based on ISO 9241-411 pointing evaluation <ArrowRight size={12} /></a>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className={`guide-panel ${guideOpen ? "open" : ""}`}>
          <div className="guide-head"><div><span>SUPPORT</span><h2>Troubleshooting</h2></div><button onClick={() => setGuideOpen(false)} aria-label="Close guide"><X size={19} /></button></div>
          <div className="guide-search"><Search size={16} /><input placeholder="Search issues or solutions…" value={guideQuery} onChange={(e) => setGuideQuery(e.target.value)} /></div>
          <div className="guide-results">
            {filteredGuide.map((g, i) => <div className="guide-item" key={g.category}>
              <button onClick={() => setExpanded(expanded === i ? null : i)}><span><small>0{i + 1}</small><b>{g.category}</b></span><ChevronDown size={17} className={expanded === i ? "rotated" : ""} /></button>
              {expanded === i && <div className="guide-content"><h3>{g.issue}</h3><ul>{g.solutions.map((s) => <li key={s}><Check size={13} />{s}</li>)}</ul></div>}
            </div>)}
            {!filteredGuide.length && <p className="no-results">No matching solutions found.</p>}
          </div>
          <div className="guide-note"><CircleHelp size={18} /><p><b>Still having trouble?</b><br />Try the device on another computer to isolate hardware from software issues.</p></div>
        </aside>
      </div>

      {consoleOpen && <div className="modal-backdrop" onMouseDown={() => setConsoleOpen(false)}>
        <div className="console-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="console-head"><div><Bug size={18} /><span><b>RAW EVENT LOG</b><small>{logs.length} events captured</small></span></div><button onClick={() => setConsoleOpen(false)}><X size={18} /></button></div>
          <div className="console-actions"><span><i /> Listening for device events</span><button onClick={() => setLogs([])}>Clear log</button></div>
          <div className="console-body">{logs.length ? logs.map((log) => <div key={log.id}><time>{log.time}</time><b>{log.type}</b><code>{log.detail}</code></div>) : <p>Interact with the keyboard or mouse to populate the event stream.</p>}</div>
        </div>
      </div>}
    </main>
  );
}

