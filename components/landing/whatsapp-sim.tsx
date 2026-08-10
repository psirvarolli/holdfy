"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BatteryFull,
  CheckCheck,
  Copy,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  RotateCcw,
  ShieldCheck,
  Signal,
  Smile,
  Video,
  Wifi,
} from "lucide-react";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary, type WhatsAppScriptMessage } from "@/lib/i18n/landing-dictionary";

// Typing-indicator duration per script message, in display order — a
// presentation/timing detail, not translatable content, so it's kept out of
// the dictionary and just indexed in parallel to dict.whatsapp.script.
const TYPING_MS = [1100, 1300, 1000, 1400, 900, 1700, 900, 1100, 1200, 1400];

function HoldfyMessage({ msg }: { msg: WhatsAppScriptMessage & { from: "holdfy" } }) {
  if (msg.kind === "card") {
    return (
      <div className="bubble holdfy" data-testid="wa-holdfy-card">
        <div className="holdfy-brand">
          <span className="brand-left">
            <ShieldCheck size={14} /> {msg.brandLabel}
          </span>
          <span className="chip" style={{ padding: "3px 10px" }}>
            {msg.escrowChip}
          </span>
        </div>
        <div className="holdfy-desc">{msg.desc}</div>
        <div className="holdfy-amount">{msg.amount}</div>
        <div className="holdfy-divider" />
        <div className="holdfy-link">
          <span>{msg.link}</span>
          <Copy size={14} />
        </div>
        <div className="holdfy-foot">
          <Lock size={11} /> {msg.foot} · {msg.time}
        </div>
      </div>
    );
  }
  if (msg.kind === "locked") {
    return (
      <div className="bubble holdfy" data-testid="wa-holdfy-locked">
        <div className="holdfy-row">
          <span className="icon-badge">
            <Lock />
          </span>
          <div>
            <strong>{msg.title}</strong>
            <span>
              {msg.desc} · {msg.time}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bubble holdfy" data-testid="wa-holdfy-released">
      <div className="holdfy-row">
        <span className="icon-badge">
          <BadgeCheck />
        </span>
        <div>
          <strong>{msg.title}</strong>
          <span>
            {msg.desc} · {msg.time}
          </span>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <span className="chip" style={{ padding: "3px 10px" }}>
          {msg.badge}
        </span>
      </div>
    </div>
  );
}

export function WhatsAppSim() {
  const { locale } = useLandingLocale();
  const { whatsapp } = landingDictionary[locale];
  const SCRIPT = whatsapp.script;

  const wrapRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [runId, setRunId] = useState(0);
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState<"in" | "out" | "holdfy" | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timer = setTimeout(res, ms);
      });

    (async () => {
      setCount(0);
      setTyping(null);
      await wait(800);
      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        setTyping(SCRIPT[i].from);
        await wait(TYPING_MS[i] ?? 1200);
        if (cancelled) return;
        setTyping(null);
        setCount(i + 1);
        await wait(SCRIPT[i].from === "holdfy" ? 1700 : 1000);
      }
      await wait(6500);
      if (!cancelled) setRunId((r) => r + 1);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, runId, locale]);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [count, typing]);

  return (
    <div className="phone-wrap" ref={wrapRef} data-testid="whatsapp-sim">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-status">
            <span>09:12</span>
            <span className="status-icons">
              <Signal size={13} />
              <Wifi size={13} />
              <BatteryFull size={15} />
            </span>
          </div>
          <div className="chat-header">
            <span className="chat-avatar">CF</span>
            <div className="chat-meta">
              <div className="chat-name">{whatsapp.contactName}</div>
              <div className="chat-status">{typing === "in" ? whatsapp.typingLabel : whatsapp.onlineLabel}</div>
            </div>
            <div className="chat-actions">
              <Video size={17} />
              <Phone size={16} />
              <MoreVertical size={16} />
            </div>
          </div>

          <div className="chat-body" ref={chatRef} aria-live="polite">
            {SCRIPT.slice(0, count).map((msg, i) =>
              msg.from === "holdfy" ? (
                <HoldfyMessage key={`${runId}-${i}`} msg={msg} />
              ) : (
                <div key={`${runId}-${i}`} className={`bubble ${msg.from}`}>
                  {msg.text}
                  <span className="meta">
                    {msg.time}
                    {msg.from === "out" && <CheckCheck size={13} />}
                  </span>
                </div>
              )
            )}
            {typing && (
              <div className={`typing ${typing}`} aria-label={whatsapp.typingAriaLabel}>
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>

          <div className="chat-input" aria-hidden="true">
            <div className="fake-input">
              <Smile size={17} />
              {whatsapp.inputPlaceholder}
            </div>
            <span className="send-btn">
              <Mic size={17} />
            </span>
          </div>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={() => setRunId((r) => r + 1)} data-testid="whatsapp-replay-button">
        <RotateCcw size={15} />
        {whatsapp.replayButton}
      </button>
    </div>
  );
}
