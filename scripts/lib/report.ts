import { write } from "./fsx";
import type { CaptainReport } from "../captain.types";
export function saveReport(r:CaptainReport){
  const name = `reports/auto_check_${r.timestamp.replace(/[:.]/g,"-")}.md`;
  write(name, render(r)); return name;
}
function render(r:CaptainReport){
  const lines = [
    "# SELF-CHECK COMPLIANCE REPORT",
    `**Timestamp:** ${r.timestamp}`,
    "## Summary", r.summary,
    "## Totals", `Score: ${r.totals.score} → Status: ${r.totals.status}`,
    "## Breakdown", ...r.scores.map(s=>`- ${s.flow}: ${s.status} (${s.score}) ${s.notes?.join("; ")||""}`),
    "## Actions Planned", ...r.actionsPlanned.map(a=>`- ${a}`),
    "## Actions Taken", ...r.actionsTaken.map(a=>`- ${a}`)
  ];
  return lines.join("\n");
}
