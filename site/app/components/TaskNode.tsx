"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";

export type TaskNodeData = {
  title: string;
  type: string;
  status: "done" | "in-progress" | "pending";
  onClick: () => void;
};

const typeConfig: Record<string, { label: string; color: string }> = {
  archaeology:  { label: "GIT",        color: "#00b4d8" },
  reflog:       { label: "RECOVERY",   color: "#f59e0b" },
  rebase:       { label: "REBASE",     color: "#3fb950" },
  "soft-skill": { label: "SOFT SKILL", color: "#8b5cf6" },
};

const statusIcon: Record<string, string> = {
  done:        "✓",
  "in-progress": "●",
  pending:     "○",
};

export function TaskNode({ data }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const config = typeConfig[d.type] ?? { label: d.type.toUpperCase(), color: "#6e7681" };

  return (
    <div
      onClick={d.onClick}
      className="cursor-pointer select-none"
      style={{
        background: "#0d1117",
        border: "1px solid #21262d",
        borderLeft: `2px solid ${config.color}`,
        borderRadius: 6,
        padding: "10px 14px",
        minWidth: 160,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${config.color}22`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `#30363d`;
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = config.color;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#21262d";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = config.color;
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 2, color: config.color, textTransform: "uppercase", marginBottom: 5 }}>
        {config.label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 6 }}>
        {d.title}
      </div>
      <div style={{ fontSize: 11, color: "#6e7681" }}>
        <span style={{ color: d.status === "done" ? "#3fb950" : d.status === "in-progress" ? "#f59e0b" : "#6e7681" }}>
          {statusIcon[d.status]}
        </span>
        {" "}
        <span style={{ textTransform: "capitalize" }}>{d.status.replace("-", " ")}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#30363d", border: "none", width: 6, height: 6 }} />
    </div>
  );
}
