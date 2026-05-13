"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";

export type WeekNodeData = {
  week: number;
  title: string;
  status: "done" | "in-progress" | "pending";
  deadline: string;
  taskCount: number;
  doneCount: number;
  onClick: () => void;
};

const statusColor: Record<WeekNodeData["status"], string> = {
  done: "#3fb950",
  "in-progress": "#f59e0b",
  pending: "#6e7681",
};

export function WeekNode({ data }: NodeProps) {
  const d = data as unknown as WeekNodeData;
  const color = statusColor[d.status];

  return (
    <div
      onClick={d.onClick}
      className="cursor-pointer select-none"
      style={{
        background: "#111318",
        border: `1px solid #30363d`,
        borderRadius: 8,
        padding: "14px 18px",
        minWidth: 200,
        boxShadow: `0 0 0 1px ${color}22`,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${color}66, 0 0 20px ${color}22`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${color}22`;
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 2, color: "#6e7681", textTransform: "uppercase", marginBottom: 6 }}>
        Week {String(d.week).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 10, lineHeight: 1.3 }}>
        {d.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 11, color: "#8b949e", textTransform: "capitalize" }}>{d.status.replace("-", " ")}</span>
        </div>
        <span style={{ fontSize: 11, color: "#6e7681", fontFamily: "monospace" }}>
          {d.doneCount}/{d.taskCount}
        </span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#30363d", border: "none", width: 8, height: 8 }} />
    </div>
  );
}
