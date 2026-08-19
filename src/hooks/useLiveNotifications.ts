import { useMemo } from "react";
import { useCollection } from "./useCollection";
import { followupsService, propertiesService, leadsService } from "../services/crmServices";
import { expiringContracts, daysUntil } from "../lib/contracts";

export interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: "followup" | "property" | "lead";
  href: string;
  severity: "danger" | "warning" | "accent";
}

/** Notifications computed live from CRM data — never persisted, always fresh. */
export function useLiveNotifications() {
  const followups = useCollection(followupsService);
  const properties = useCollection(propertiesService);
  const leads = useCollection(leadsService);

  const items = useMemo<LiveNotification[]>(() => {
    const out: LiveNotification[] = [];

    for (const f of followups.items) {
      if (f.completed || !f.date) continue;
      if (new Date(f.date) < new Date(new Date().toDateString())) {
        out.push({
          id: `followup-${f.id}`,
          title: "Overdue follow-up",
          message: `"${f.title}" was due ${f.date}${f.relatedTo ? ` · ${f.relatedTo}` : ""}`,
          type: "followup",
          href: "/app/followups",
          severity: "danger",
        });
      }
    }

    for (const p of expiringContracts(properties.items)) {
      const days = daysUntil(p.contractEnd);
      const overdue = days !== null && days < 0;
      out.push({
        id: `property-${p.id}`,
        title: overdue ? "Contract overdue" : "Contract expiring soon",
        message: `${p.title || p.address} (${p.type}) ${overdue ? `expired ${Math.abs(days!)}d ago` : `expires in ${days}d`}`,
        type: "property",
        href: "/app/properties",
        severity: overdue ? "danger" : "warning",
      });
    }

    for (const l of leads.items) {
      if (l.score >= 80 && l.status === "New") {
        out.push({
          id: `lead-${l.id}`,
          title: "Hot lead needs attention",
          message: `${l.name}${l.company ? ` at ${l.company}` : ""} scored ${l.score} and hasn't been contacted yet`,
          type: "lead",
          href: "/app/leads",
          severity: "accent",
        });
      }
    }

    return out;
  }, [followups.items, properties.items, leads.items]);

  const loading = followups.loading || properties.loading || leads.loading;
  return { items, loading };
}
