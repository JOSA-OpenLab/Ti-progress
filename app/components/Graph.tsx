"use client"

import { useCallback, useState } from "react"
import {
  ReactFlow, Background, BackgroundVariant,
  useNodesState, useEdgesState,
  type Node, type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { WeekNode, type WeekNodeData } from "./WeekNode"
import { TaskNode, type TaskNodeData } from "./TaskNode"
import { DetailPanel } from "./DetailPanel"
import { TopBlur, BottomBlur } from "./ui/edge-blur"

const nodeTypes = { week: WeekNode, task: TaskNode }

type Task = {
  id: string; type: string; title: string; status: "done" | "in-progress" | "pending"
  reflection: string | null; commands: string[]; output: string | null
  screenshot: string | null; pr: string | null
}
type Week = { id: number; title: string; status: "done" | "in-progress" | "pending"; deadline: string; tasks: Task[] }
type Selected = { kind: "week"; week: Week } | { kind: "task"; task: Task; week: Week }

function buildGraph(weeks: Week[], onSelect: (s: Selected) => void): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  weeks.forEach((week, wi) => {
    const weekX = wi * 380
    const weekNodeId = `week-${week.id}`
    const done = week.tasks.filter(t => t.status === "done").length

    nodes.push({
      id: weekNodeId, type: "week",
      position: { x: weekX, y: 0 },
      data: {
        week: week.id, title: week.title, status: week.status,
        deadline: week.deadline, taskCount: week.tasks.length, doneCount: done,
        onClick: () => onSelect({ kind: "week", week }),
      } as unknown as Record<string, unknown>,
    })

    week.tasks.forEach((task, ti) => {
      const taskNodeId = `task-${week.id}-${task.id}`
      const taskY = (ti - (week.tasks.length - 1) / 2) * 100
      nodes.push({
        id: taskNodeId, type: "task",
        position: { x: weekX + 280, y: taskY },
        data: {
          title: task.title, type: task.type, status: task.status,
          onClick: () => onSelect({ kind: "task", task, week }),
        } as unknown as Record<string, unknown>,
      })
      edges.push({
        id: `e-${weekNodeId}-${taskNodeId}`,
        source: weekNodeId, target: taskNodeId,
        animated: task.status === "in-progress",
        style: { stroke: "#21262d", strokeWidth: 1, strokeDasharray: "4 4" },
      })
    })
  })

  return { nodes, edges }
}

export function Graph({ weeks }: { weeks: Week[] }) {
  const [selected, setSelected] = useState<Selected | null>(null)
  const { nodes: init, edges: initE } = buildGraph(weeks, setSelected)
  const [nodes, , onNodesChange] = useNodesState(init)
  const [edges, , onEdgesChange] = useEdgesState(initE)
  const onClose = useCallback(() => setSelected(null), [])

  const totalDone = weeks.flatMap(w => w.tasks).filter(t => t.status === "done").length
  const total = weeks.flatMap(w => w.tasks).length

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      {/* EdgeBlur — below header */}
      <TopBlur height={64} />
      <BottomBlur height={64} />

      {/* Header — z-50 to sit above the blur (z-40) */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#00b4d8", fontFamily: "monospace" }}>
            JOSA OpenLab
          </span>
          <span style={{ width: 1, height: 12, background: "#21262d" }} />
          <span style={{ fontSize: 11, color: "#6e7681", fontFamily: "monospace" }}>
            {weeks.length} week{weeks.length !== 1 ? "s" : ""} · 2026
          </span>
        </div>
        <div style={{
          fontSize: 11, color: "#6e7681", fontFamily: "monospace",
          background: "#111318", border: "1px solid #21262d",
          padding: "4px 12px", borderRadius: 6,
        }}>
          {totalDone} / {total} done
        </div>
      </div>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.35 }}
        minZoom={0.3} maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: "#0a0a0a" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1a1f27" />
      </ReactFlow>

      <DetailPanel selected={selected} onClose={onClose} />

      {/* Personal site footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        paddingBottom: 14, textAlign: "center", pointerEvents: "none",
      }}>
        <a
          href="http://ti0.me"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10, color: "#3d444d",
            fontFamily: "monospace", letterSpacing: 3, textTransform: "uppercase",
            textDecoration: "none", transition: "color 0.2s", pointerEvents: "auto",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#00b4d8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#3d444d")}
        >
          Qutibah Ananzeh · ti0.me ↗
        </a>
      </div>
    </div>
  )
}
