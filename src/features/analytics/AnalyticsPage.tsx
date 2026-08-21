import { useEffect, useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { dealsService, leadsService, followupsService } from "../../services/crmServices";
import { scoreTier } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/common/KpiCard";
import { BotOrb } from "../../components/common/BotOrb";
import { BarChart } from "../../components/common/BarChart";
import { SectionHeader, LoadingState, EmptyState } from "../../components/common/States";

const donutColors = ["#6366f1", "#22d3ee", "#a855f7", "#f59e0b", "#22c55e", "#ec4899"];
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

export function AnalyticsPage() {
  const leads = useCollection(leadsService);
  const deals = useCollection(dealsService);
  const followups = useCollection(followupsService);
  const loading = leads.loading || deals.loading || followups.loading;
  const hasData = leads.items.length > 0 || deals.items.length > 0;

  const won = deals.items.filter((d) => d.stage === "Won");
  const lost = deals.items.filter((d) => d.stage === "Lost");
  const closedCount = won.length + lost.length;
  const winRate = closedCount ? Math.round((won.length / closedCount) * 100) : 0;
  const revenue = won.reduce((s, d) => s + d.value, 0);
  const pipelineValue = deals.items.filter((d) => d.stage !== "Won" && d.stage !== "Lost").reduce((s, d) => s + d.value, 0);

  const leadConversion = leads.items.length ? Math.round((leads.items.filter((l) => l.status === "Won").length / leads.items.length) * 100) : 0;

  const sourceCounts = leads.items.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1;
    return acc;
  }, {});
  const stageCounts = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => {
    const stageDeals = deals.items.filter((d) => d.stage === stage);
    return { stage, count: stageDeals.length, value: stageDeals.reduce((s, d) => s + (d.value || 0), 0) };
  });

  const completedFollowups = followups.items.filter((f) => f.completed).length;
  const followupCompletion = followups.items.length ? Math.round((completedFollowups / followups.items.length) * 100) : 0;

  const revenueTrend = useMemo(() => {
    const now = Date.now();
    const buckets = Array.from({ length: 6 }, (_, i) => ({ label: i === 5 ? "This week" : `${5 - i}w ago`, value: 0 }));
    for (const d of won) {
      if (!d.createdAt) continue;
      const weeksAgo = Math.floor((now - d.createdAt) / WEEK_MS);
      const idx = 5 - weeksAgo;
      if (idx >= 0 && idx < 6) buckets[idx].value += d.value || 0;
    }
    return buckets;
  }, [won]);
  const revenueTrendTotal = revenueTrend.reduce((s, v) => s + v.value, 0);

  const leadsTrend = useMemo(() => {
    const now = Date.now();
    const buckets = Array.from({ length: 6 }, (_, i) => ({ label: i === 5 ? "This week" : `${5 - i}w ago`, value: 0 }));
    for (const l of leads.items) {
      if (!l.createdAt) continue;
      const weeksAgo = Math.floor((now - l.createdAt) / WEEK_MS);
      const idx = 5 - weeksAgo;
      if (idx >= 0 && idx < 6) buckets[idx].value += 1;
    }
    return buckets;
  }, [leads.items]);
  const leadsTrendTotal = leadsTrend.reduce((s, v) => s + v.value, 0);

  const funnelStages: { stage: string; count: number }[] = useMemo(() => {
    const order = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];
    return order.map((stage, i) => ({
      stage,
      count: deals.items.filter((d) => order.indexOf(d.stage) >= i).length,
    }));
  }, [deals.items]);
  const funnelMax = Math.max(1, funnelStages[0]?.count ?? 0);

  const scoreTiers = useMemo(() => {
    const tiers: Record<"Hot" | "Warm" | "Cold", number> = { Hot: 0, Warm: 0, Cold: 0 };
    for (const l of leads.items) tiers[scoreTier(l.score)] += 1;
    return tiers;
  }, [leads.items]);
  const maxTier = Math.max(1, scoreTiers.Hot, scoreTiers.Warm, scoreTiers.Cold);

  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  const sourceEntries = Object.entries(sourceCounts);
  const totalSources = sourceEntries.reduce((s, [, c]) => s + c, 0);
  let cursor = 0;
  const donutStops = sourceEntries.map(([source, count], i) => {
    const start = (cursor / totalSources) * 360;
    cursor += count;
    const end = (cursor / totalSources) * 360;
    return { source, count, color: donutColors[i % donutColors.length], start, end };
  });
  const donutGradient = totalSources
    ? `conic-gradient(${donutStops.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(", ")})`
    : "var(--bg-elevated)";

  const topSource = sourceEntries.length ? sourceEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;
  const avgDealSize = deals.items.length ? Math.round((revenue + pipelineValue) / deals.items.length) : 0;

  const insight = topSource
    ? `Your win rate is ${winRate}% with $${revenue.toLocaleString()} closed so far. Most leads come from ${topSource} — worth doubling down there. ${
        followupCompletion >= 70
          ? `Follow-up discipline is strong at ${followupCompletion}%.`
          : `Follow-up completion is at ${followupCompletion}% — tightening that up could lift your win rate further.`
      }`
    : `Once you have a few leads and deals logged, I'll surface patterns here — like your best-performing source and where deals tend to stall.`;

  const [thinking, setThinking] = useState(true);
  useEffect(() => {
    if (loading) return;
    setThinking(true);
    const t = window.setTimeout(() => setThinking(false), 900);
    return () => window.clearTimeout(t);
  }, [loading, insight]);

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Sales performance derived from your live workspace data." />

      {loading ? (
        <LoadingState />
      ) : !hasData ? (
        <EmptyState title="Not enough data yet" description="Add leads and deals to see analytics here." />
      ) : (
        <>
          <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <KpiCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon="📈" tone="indigo" />
            <KpiCard label="Revenue Won" value={`$${revenue.toLocaleString()}`} icon="💰" tone="emerald" />
            <KpiCard label="Deal Win Rate" value={`${winRate}%`} icon="🏆" tone="violet" />
            <KpiCard label="Lead Conversion" value={`${leadConversion}%`} icon="🎯" tone="cyan" />
          </div>

          <div
            className="animated-gradient-border"
            style={{
              borderRadius: "var(--radius-lg)",
              padding: 1,
              marginBottom: 16,
              backgroundImage: "linear-gradient(120deg, rgba(99,102,241,0.5), rgba(34,211,238,0.3), rgba(139,92,246,0.45), rgba(99,102,241,0.5))",
            }}
          >
            <Card style={{ borderRadius: "calc(var(--radius-lg) - 1px)", background: "linear-gradient(160deg, rgba(99,102,241,0.08), var(--bg-card) 40%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <BotOrb size={32} active={thinking} />
                <h3 style={{ fontWeight: 800, fontSize: 15 }}>AI Insights</h3>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 999, marginLeft: "auto" }}>
                  Preview
                </span>
              </div>
              {thinking ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        animation: `typingDotAnalytics 1.2s ${i * 0.15}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, animation: "messageIn 320ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
                  {insight}
                </p>
              )}
              {!thinking && avgDealSize > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, animation: "messageIn 320ms cubic-bezier(0.16, 1, 0.3, 1) 80ms both" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                    Avg deal size: ${avgDealSize.toLocaleString()}
                  </span>
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>📊</span> Deals by stage
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stageCounts.map((s) => (
                  <div key={s.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{s.stage}</span>
                      <span style={{ fontWeight: 600 }}>
                        {s.count}
                        {s.value > 0 && <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}> · ${s.value.toLocaleString()}</span>}
                      </span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(s.count / maxStage) * 100}%`,
                          background: "linear-gradient(90deg, var(--accent), #06b6d4)",
                          borderRadius: 6,
                          transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🧭</span> Lead sources
              </h3>
              {sourceEntries.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No leads yet.</p>
              ) : (
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      background: donutGradient,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "popIn 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "var(--bg-card)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{totalSources}</div>
                      <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>leads</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                    {donutStops.map((s) => (
                      <div key={s.source} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-secondary)" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                          {s.source}
                        </span>
                        <span style={{ fontWeight: 600 }}>{s.count} · {Math.round((s.count / totalSources) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💵</span> Revenue won · last 6 weeks
                  </h3>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>${revenueTrendTotal.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <BarChart data={revenueTrend} color="#34d399" formatValue={(v) => `$${v.toLocaleString()}`} />
              </div>
            </Card>

            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔥</span> Lead score mix
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(
                  [
                    ["Hot", "var(--danger)"],
                    ["Warm", "var(--warning)"],
                    ["Cold", "var(--text-tertiary)"],
                  ] as const
                ).map(([tier, color]) => (
                  <div key={tier}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{tier}</span>
                      <span style={{ fontWeight: 600 }}>{scoreTiers[tier]}</span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(scoreTiers[tier] / maxTier) * 100}%`,
                          background: color,
                          borderRadius: 6,
                          transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>🎯</span> New leads · last 6 weeks
                  </h3>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{leadsTrendTotal}</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <BarChart data={leadsTrend} color="#6366f1" />
              </div>
            </Card>

            <Card
              style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>✅</span> Follow-up completion
              </h3>
              <div style={{ fontSize: 26, fontWeight: 800, animation: "valuePop 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}>{followupCompletion}%</div>
              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{completedFollowups} of {followups.items.length} follow-ups completed</p>
            </Card>
          </div>

          <Card
            style={{ marginTop: 16, transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔻</span> Deal conversion funnel
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {funnelStages.map((s, i) => {
                const widthPct = (s.count / funnelMax) * 100;
                const prevCount = i > 0 ? funnelStages[i - 1].count : s.count;
                const dropPct = i > 0 && prevCount > 0 ? Math.round(((prevCount - s.count) / prevCount) * 100) : 0;
                return (
                  <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 90, fontSize: 12.5, color: "var(--text-secondary)", flexShrink: 0 }}>{s.stage}</div>
                    <div style={{ flex: 1, height: 26, background: "var(--bg-elevated)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(widthPct, s.count > 0 ? 4 : 0)}%`,
                          background: `linear-gradient(90deg, #6366f1, ${donutColors[i % donutColors.length]})`,
                          borderRadius: 6,
                          transition: "width 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          paddingRight: 8,
                        }}
                      >
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{s.count}</span>
                      </div>
                    </div>
                    <div style={{ width: 60, fontSize: 11, color: dropPct > 0 ? "var(--danger)" : "var(--text-tertiary)", flexShrink: 0, textAlign: "right" }}>
                      {i > 0 && dropPct > 0 ? `-${dropPct}%` : i === 0 ? "start" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <style>{`
        @keyframes typingDotAnalytics {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
