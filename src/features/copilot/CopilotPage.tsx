import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/ui/Card";
import { SectionHeader } from "../../components/common/States";
import { BotOrb } from "../../components/common/BotOrb";
import { useCollection } from "../../hooks/useCollection";
import { propertiesService } from "../../services/crmServices";
import { expiringContracts, daysUntil } from "../../lib/contracts";
import { useToast } from "../../context/ToastContext";

const suggestedPrompts = [
  { icon: "🎯", text: "Which leads should I contact today?" },
  { icon: "💼", text: "Which deals need attention?" },
  { icon: "🏠", text: "Which contracts are expiring soon?" },
  { icon: "⚡", text: "What should I prioritize?" },
];

const demoResponses: Record<string, string> = {
  "Which leads should I contact today?":
    "Based on your pipeline, 4 leads haven't been contacted in over a week. Prioritize hot-scored leads first — they're most likely to convert.",
  "Which deals need attention?":
    "3 deals in Negotiation have passed their expected close date. A quick check-in call could help re-accelerate them.",
  "What should I prioritize?":
    "Focus on overdue follow-ups first, then move qualified leads into Proposal stage — that's where most of your pipeline value is currently sitting.",
  "Show my highest-value opportunities.":
    "Your top opportunities are concentrated in the Proposal and Negotiation stages. Consider allocating more time there this week.",
};

interface Message {
  role: "user" | "assistant";
  text: string;
  time: number;
}

function welcomeMessage(): Message {
  return {
    role: "assistant",
    text: "Hi! I'm FLOW AI. Ask me about your leads, deals, properties, or what to prioritize today.",
    time: Date.now(),
  };
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      title="Copy"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--text-tertiary)",
        fontSize: 11,
        padding: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      {copied ? "✓ Copied" : "⧉"}
    </button>
  );
}

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const step = () => {
      i += Math.max(1, Math.round(text.length / 60));
      setShown(text.slice(0, i));
      if (i < text.length) {
        raf = window.setTimeout(step, 12);
      } else {
        onDone?.();
      }
    };
    let raf = window.setTimeout(step, 12);
    return () => window.clearTimeout(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return <>{shown}</>;
}

function FeedbackButtons() {
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const { show } = useToast();

  function pick(next: "up" | "down") {
    if (choice) return;
    setChoice(next);
    show(next === "up" ? "Thanks for the feedback!" : "Thanks — we'll use this to improve.", "success");
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        type="button"
        onClick={() => pick("up")}
        title="Good response"
        style={{
          background: "none",
          border: "none",
          cursor: choice ? "default" : "pointer",
          color: choice === "up" ? "var(--success)" : "var(--text-tertiary)",
          fontSize: 11,
          padding: 2,
          opacity: choice && choice !== "up" ? 0.35 : 1,
        }}
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => pick("down")}
        title="Not helpful"
        style={{
          background: "none",
          border: "none",
          cursor: choice ? "default" : "pointer",
          color: choice === "down" ? "var(--danger)" : "var(--text-tertiary)",
          fontSize: 11,
          padding: 2,
          opacity: choice && choice !== "down" ? 0.35 : 1,
        }}
      >
        👎
      </button>
    </div>
  );
}

export function CopilotPage() {
  const { items: properties } = useCollection(propertiesService);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingReply = useRef<number | null>(null);

  const contractsDue = useMemo(() => expiringContracts(properties), [properties]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function contractsReply(): string {
    if (contractsDue.length === 0) {
      return "No lease or sale contracts are expiring soon — you're all clear for the next 30 days.";
    }
    const lines = contractsDue.slice(0, 5).map((p) => {
      const days = daysUntil(p.contractEnd);
      const status = days !== null && days < 0 ? `expired ${Math.abs(days)}d ago` : days === 0 ? "expires today" : `expires in ${days}d`;
      return `• ${p.title || p.address} (${p.type}) — ${status}${p.clientName ? `, ${p.clientName}` : ""}`;
    });
    return `You have ${contractsDue.length} contract${contractsDue.length > 1 ? "s" : ""} needing attention:\n${lines.join("\n")}`;
  }

  function send(text: string) {
    if (!text.trim() || typing) return;
    setMessages((prev) => [...prev, { role: "user", text, time: Date.now() }]);
    setInput("");
    setTyping(true);
    pendingReply.current = window.setTimeout(() => {
      const reply =
        text === "Which contracts are expiring soon?"
          ? contractsReply()
          : demoResponses[text] ??
            "This is a preview of FLOW AI. In this version, responses are sample content — a real AI-powered assistant is on our roadmap.";
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, text: reply, time: Date.now() }];
        setStreamingIndex(next.length - 1);
        return next;
      });
      setTyping(false);
      pendingReply.current = null;
    }, 650);
  }

  function stopGenerating() {
    if (pendingReply.current) {
      window.clearTimeout(pendingReply.current);
      pendingReply.current = null;
    }
    setTyping(false);
  }

  function newChat() {
    setMessages([welcomeMessage()]);
    setStreamingIndex(0);
    setInput("");
  }

  return (
    <div>
      <SectionHeader title="AI Copilot" subtitle="A preview of FLOW's upcoming AI-powered sales assistant." />

      <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 999 }}>
          Preview feature — responses are sample content, not generated by a live AI model
        </span>
        {contractsDue.length > 0 && (
          <span style={{ fontSize: 11.5, color: "var(--warning)", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>
            ⚠ {contractsDue.length} contract{contractsDue.length > 1 ? "s" : ""} need attention
          </span>
        )}
      </div>

      <div
        className="animated-gradient-border"
        style={{
          borderRadius: "var(--radius-xl)",
          padding: 1,
          backgroundImage: "linear-gradient(120deg, rgba(99,102,241,0.5), rgba(34,211,238,0.3), rgba(139,92,246,0.45), rgba(99,102,241,0.5))",
        }}
      >
        <Card
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: 660,
            padding: 0,
            overflow: "hidden",
            borderRadius: "calc(var(--radius-xl) - 1px)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.5,
              backgroundImage:
                "radial-gradient(circle, rgba(99,102,241,0.5) 1px, transparent 1.5px), radial-gradient(circle, rgba(34,211,238,0.4) 1px, transparent 1.5px), radial-gradient(circle, rgba(139,92,246,0.4) 1px, transparent 1.5px)",
              backgroundSize: "180px 180px, 240px 240px, 300px 300px",
              backgroundPosition: "10% 20%, 70% 60%, 40% 85%",
              animation: "copilotParticles 30s linear infinite",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              background: "linear-gradient(180deg, rgba(99,102,241,0.08), transparent)",
            }}
          >
            <div style={{ position: "relative" }}>
              <BotOrb size={44} active={typing} />
              <span style={{ position: "absolute", top: -4, right: -6, fontSize: 9, animation: "sparkleFloat 2.2s ease-in-out infinite" }}>✦</span>
              <span style={{ position: "absolute", bottom: -2, left: -8, fontSize: 7, animation: "sparkleFloat 2.6s ease-in-out infinite 0.6s" }}>✦</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>FLOW AI</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--success)",
                    display: "inline-block",
                    animation: "orbPulse 2s ease-in-out infinite",
                  }}
                />
                <span className={typing ? "shimmer-text" : undefined}>{typing ? "Thinking…" : "Ready to help"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={newChat}
              disabled={messages.length <= 1}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "7px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                cursor: messages.length <= 1 ? "default" : "pointer",
                opacity: messages.length <= 1 ? 0.5 : 1,
              }}
            >
              + New chat
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }} className="scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  maxWidth: "82%",
                  animation: "messageIn 320ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              >
                {m.role === "assistant" && <BotOrb size={30} />}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      background: m.role === "user" ? "var(--gradient-brand-diag)" : "var(--bg-elevated)",
                      color: m.role === "user" ? "#fff" : "var(--text-primary)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-lg)",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      whiteSpace: "pre-line",
                      boxShadow: m.role === "user" ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
                    }}
                  >
                    {m.role === "assistant" && i === streamingIndex ? (
                      <TypewriterText text={m.text} onDone={() => setStreamingIndex(null)} />
                    ) : (
                      m.text
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 14, paddingLeft: m.role === "user" ? 0 : 4 }}>
                    <span style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>{formatTime(m.time)}</span>
                    {m.role === "assistant" && i > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 8, opacity: hovered === i ? 1 : 0, transition: "opacity var(--transition-fast)" }}>
                        <CopyButton text={m.text} />
                        <FeedbackButtons />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", alignItems: "center", animation: "messageIn 250ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <BotOrb size={30} active />
                <div style={{ background: "var(--bg-elevated)", padding: "12px 16px", borderRadius: "var(--radius-lg)", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        animation: `typingDot 1.2s ${i * 0.15}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={stopGenerating}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ width: 7, height: 7, background: "currentColor", borderRadius: 2 }} />
                  Stop
                </button>
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", padding: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {suggestedPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => send(p.text)}
                  disabled={typing}
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    cursor: typing ? "default" : "pointer",
                    opacity: typing ? 0.5 : 1,
                    transform: "scale(1)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <span>{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                borderRadius: 999,
                padding: 5,
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FLOW AI anything about your workspace…"
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                aria-label="Send"
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--gradient-brand-diag)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: typing || !input.trim() ? "default" : "pointer",
                  opacity: typing || !input.trim() ? 0.5 : 1,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                  transform: "scale(1)",
                  transition: "transform var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!typing && input.trim()) e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
