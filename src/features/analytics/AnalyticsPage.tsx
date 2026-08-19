import { useCollection } from "../../hooks/useCollection";
import { dealsService, leadsService, followupsService } from "../../services/crmServices";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/common/KpiCard";
import { SectionHeader, LoadingState, EmptyState } from "../../components/common/States";

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
  const stageCounts = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => ({
    stage,
    count: deals.items.filter((d) => d.stage === stage).length,
  }));

  const completedFollowups = followups.items.filter((f) => f.completed).length;
  const followupCompletion = followups.items.length ? Math.round((completedFollowups / followups.items.length) * 100) : 0;

  const maxSource = Math.max(1, ...Object.values(sourceCounts));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Sales performance derived from your live workspace data." />

      {loading ? (
        <LoadingState />
      ) : !hasData ? (
        <EmptyState title="Not enough data yet" description="Add leads and deals to see analytics here." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <KpiCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon="📈" />
            <KpiCard label="Revenue Won" value={`$${revenue.toLocaleString()}`} icon="💰" />
            <KpiCard label="Deal Win Rate" value={`${winRate}%`} icon="🏆" />
            <KpiCard label="Lead Conversion" value={`${leadConversion}%`} icon="🎯" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>Deals by stage</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stageCounts.map((s) => (
                  <div key={s.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{s.stage}</span>
                      <span>{s.count}</span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 6 }}>
                      <div style={{ height: "100%", width: `${(s.count / maxStage) * 100}%`, background: "linear-gradient(90deg, var(--accent), #06b6d4)", borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>Lead sources</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(sourceCounts).length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No leads yet.</p>
                ) : (
                  Object.entries(sourceCounts).map(([source, count]) => (
                    <div key={source}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-secondary)" }}>{source}</span>
                        <span>{count}</span>
                      </div>
                      <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 6 }}>
                        <div style={{ height: "100%", width: `${(count / maxSource) * 100}%`, background: "linear-gradient(90deg, #7c3aed, var(--accent))", borderRadius: 6 }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card style={{ marginTop: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 8 }}>Follow-up completion</h3>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{followupCompletion}%</div>
            <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{completedFollowups} of {followups.items.length} follow-ups completed</p>
          </Card>
        </>
      )}
    </div>
  );
}
