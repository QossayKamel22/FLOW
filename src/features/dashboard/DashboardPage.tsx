import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { leadsService, dealsService, followupsService, propertiesService } from "../../services/crmServices";
import { KpiCard } from "../../components/common/KpiCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BotOrb } from "../../components/common/BotOrb";
import { Avatar } from "../../components/common/Avatar";
import { Sparkline } from "../../components/common/Sparkline";
import { SectionHeader, LoadingState, EmptyState } from "../../components/common/States";
import { StatusBadge } from "../../components/common/Badge";
import { expiringContracts, daysUntil } from "../../lib/contracts";
import { Link } from "react-router-dom";

const DAY_MS = 86_400_000;

export function DashboardPage() {
  const { user } = useAuth();
  const leads = useCollection(leadsService);
  const deals = useCollection(dealsService);
  const followups = useCollection(followupsService);
  const properties = useCollection(propertiesService);

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const loading = leads.loading || deals.loading || followups.loading;

  const activeDeals = deals.items.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const openFollowups = followups.items.filter((f) => !f.completed);
  const contractsDue = expiringContracts(properties.items);
  const hasAnyData = leads.items.length > 0 || deals.items.length > 0 || followups.items.length > 0 || properties.items.length > 0;

  const weeklyTrend = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startMs = todayStart.getTime() - 6 * DAY_MS;
    const buckets = Array.from({ length: 7 }, () => 0);
    for (const l of leads.items) {
      if (!l.createdAt) continue;
      const idx = Math.floor((l.createdAt - startMs) / DAY_MS);
      if (idx >= 0 && idx < 7) buckets[idx] += 1;
    }
    return buckets;
  }, [leads.items]);

  const weeklyTotal = weeklyTrend.reduce((s, v) => s + v, 0);
  const weeklyPrevHalf = weeklyTrend.slice(0, 3).reduce((s, v) => s + v, 0);
  const weeklyRecentHalf = weeklyTrend.slice(4).reduce((s, v) => s + v, 0);
  const trendUp = weeklyRecentHalf >= weeklyPrevHalf;

  const now = new Date();
  const wonThisMonth = deals.items.filter((d) => {
    if (d.stage !== "Won" || !d.createdAt) return false;
    const dt = new Date(d.createdAt);
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  }).length;
  const avgDealSize = activeDeals.length ? Math.round(pipelineValue / activeDeals.length) : 0;
  const pipelineHealth = deals.items.length
    ? Math.round((deals.items.filter((d) => d.stage !== "Lost").length / deals.items.length) * 100)
    : 100;

  return (
    <div>
      <SectionHeader title={`Good morning, ${firstName} 👋`} subtitle="Here's what's happening with your sales today." />

      {loading ? (
        <LoadingState rows={4} />
      ) : !hasAnyData ? (
        <EmptyState
          title="Your workspace is empty"
          description="Add your first lead or deal to see live metrics here."
          action={{ label: "Add a lead", onClick: () => (window.location.href = "/app/leads") }}
        />
      ) : (
        <>
          <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
            <KpiCard label="New Leads" value={String(leads.items.length)} icon="🎯" tone="indigo" trend={leads.items.length ? "Live from your data" : undefined} />
            <KpiCard label="Active Deals" value={String(activeDeals.length)} icon="💼" tone="violet" />
            <KpiCard label="Follow-ups" value={String(openFollowups.length)} icon="⏰" tone="cyan" />
            <KpiCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon="📈" tone="emerald" />
          </div>

          <div className="stagger-in" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>{wonThisMonth}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>won this month</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8" }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>${avgDealSize.toLocaleString()}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>avg deal size</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4af6a" }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>{properties.items.length}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>properties tracked</span>
            </div>
            {contractsDue.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--warning)" }}>{contractsDue.length}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>contracts need attention</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, animation: "fadeIn 400ms ease 80ms both" }}>
            <div
              className="animated-gradient-border"
              style={{
                position: "relative",
                borderRadius: "var(--radius-lg)",
                padding: 1,
                backgroundImage: "linear-gradient(120deg, rgba(99,102,241,0.55), rgba(34,211,238,0.35), rgba(139,92,246,0.5), rgba(99,102,241,0.55))",
              }}
            >
              <Card
                style={{
                  borderRadius: "calc(var(--radius-lg) - 1px)",
                  background: "linear-gradient(160deg, rgba(99,102,241,0.08), var(--bg-card) 40%)",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <BotOrb size={36} />
                    <h3 style={{ fontWeight: 800, fontSize: 16 }}>AI Briefing</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative", width: 34, height: 34 }} title={`Pipeline health: ${pipelineHealth}%`}>
                      <svg width="34" height="34" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="url(#healthGrad)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(pipelineHealth / 100) * 94.2} 94.2`}
                          style={{ transformOrigin: "18px 18px", transform: "rotate(-90deg)", transition: "stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)" }}
                        />
                        <defs>
                          <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>
                        {pipelineHealth}%
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 999 }}>
                      Preview
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 14 }}>
                  Your sales pipeline needs attention.
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)", fontSize: 13.5, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li>{openFollowups.length} follow-ups are ready for attention.</li>
                  <li>Expected revenue this week: ${Math.round(pipelineValue * 0.2).toLocaleString()}.</li>
                  {contractsDue.length > 0 && (
                    <li style={{ color: "var(--warning)", fontWeight: 600 }}>
                      {contractsDue.length} lease/sale contract{contractsDue.length > 1 ? "s" : ""} need attention
                      {(() => {
                        const d = daysUntil(contractsDue[0].contractEnd);
                        return d !== null ? ` — next in ${d < 0 ? "overdue" : `${d}d`}` : "";
                      })()}
                    </li>
                  )}
                </ul>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Link to="/app/copilot" style={{ textDecoration: "none" }}>
                    <Button size="sm" type="button">View Recommendations</Button>
                  </Link>
                  <Link to="/app/copilot" style={{ textDecoration: "none" }}>
                    <Button size="sm" variant="ghost" type="button">Ask FLOW AI</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>⏰</span> Upcoming follow-ups
                </h3>
                <Link to="/app/followups" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                  View all →
                </Link>
              </div>
              {openFollowups.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Nothing scheduled.</p>
              ) : (
                <div className="stagger-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {openFollowups.slice(0, 5).map((f) => {
                    const overdue = f.date ? new Date(f.date) < new Date(new Date().toDateString()) : false;
                    return (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: "var(--radius-md)",
                          borderLeft: `3px solid ${overdue ? "var(--danger)" : "var(--accent)"}`,
                          background: "var(--bg-elevated)",
                          transition: "transform var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                      >
                        <button
                          type="button"
                          aria-label="Complete"
                          onClick={() => followups.uid && followupsService.update(followups.uid, f.id, { completed: true })}
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: 5,
                            border: "1.5px solid var(--border-strong)",
                            background: "transparent",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? "var(--danger)" : "var(--text-tertiary)", flexShrink: 0 }}>
                          {overdue ? "Overdue" : f.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, animation: "fadeIn 400ms ease 160ms both" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15 }}>New leads · this week</h3>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{weeklyTotal}</div>
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 999,
                    color: trendUp ? "var(--success)" : "var(--text-tertiary)",
                    background: trendUp ? "rgba(34,197,94,0.12)" : "var(--bg-elevated)",
                  }}
                >
                  {trendUp ? "▲" : "▼"} {trendUp ? "Trending up" : "Slowing down"}
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Sparkline values={weeklyTrend} color="#6366f1" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 4 }}>
                <span>7 days ago</span>
                <span>Today</span>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Recent leads</h3>
              {leads.items.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No leads yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {leads.items.slice(0, 5).map((l) => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <Avatar name={l.name} size={30} />
                        <span style={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.name} <span style={{ color: "var(--text-tertiary)" }}>· {l.company}</span>
                        </span>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
