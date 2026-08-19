import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { leadsService, dealsService, followupsService } from "../../services/crmServices";
import { KpiCard } from "../../components/common/KpiCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SectionHeader, LoadingState, EmptyState } from "../../components/common/States";
import { StatusBadge } from "../../components/common/Badge";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();
  const leads = useCollection(leadsService);
  const deals = useCollection(dealsService);
  const followups = useCollection(followupsService);

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const loading = leads.loading || deals.loading || followups.loading;

  const activeDeals = deals.items.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const openFollowups = followups.items.filter((f) => !f.completed);
  const hasAnyData = leads.items.length > 0 || deals.items.length > 0 || followups.items.length > 0;

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <KpiCard label="New Leads" value={String(leads.items.length)} icon="🎯" tone="indigo" trend={leads.items.length ? "Live from your data" : undefined} />
            <KpiCard label="Active Deals" value={String(activeDeals.length)} icon="💼" tone="violet" />
            <KpiCard label="Follow-ups" value={String(openFollowups.length)} icon="⏰" tone="cyan" />
            <KpiCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon="📈" tone="emerald" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-lg)",
                padding: 1,
                background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(34,211,238,0.3), rgba(139,92,246,0.4))",
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
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--gradient-brand-diag)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 17,
                        boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                      }}
                    >
                      ✨
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: 16 }}>AI Briefing</h3>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 999 }}>
                    Preview
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 14 }}>
                  Your sales pipeline needs attention.
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)", fontSize: 13.5, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li>3 high-value deals are losing momentum.</li>
                  <li>{openFollowups.length} follow-ups are ready for attention.</li>
                  <li>Expected revenue this week: ${Math.round(pipelineValue * 0.2).toLocaleString()}.</li>
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
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Upcoming follow-ups</h3>
              {openFollowups.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Nothing scheduled.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {openFollowups.slice(0, 5).map((f) => (
                    <div key={f.id} style={{ fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                      <span>{f.title}</span>
                      <span style={{ color: "var(--text-tertiary)" }}>{f.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card style={{ marginTop: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Recent leads</h3>
            {leads.items.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No leads yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leads.items.slice(0, 5).map((l) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
                    <span>{l.name} <span style={{ color: "var(--text-tertiary)" }}>· {l.company}</span></span>
                    <StatusBadge status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
