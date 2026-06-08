"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  ReactFlow, Background, BackgroundVariant,
  useNodesState, useEdgesState,
  type Node, type Edge, type ReactFlowInstance,
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

const TASK_GAP = 110
const WEEK_GROUP_GAP = 80
const TASK_X = 320

function buildGraph(weeks: Week[], onSelect: (s: Selected) => void): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Pre-compute row start Y for each week
  const rowStartY: number[] = []
  let y = 0
  weeks.forEach((week, wi) => {
    rowStartY[wi] = y
    y += Math.max(1, week.tasks.length) * TASK_GAP + WEEK_GROUP_GAP
  })

  weeks.forEach((week, wi) => {
    const weekNodeId = `week-${week.id}`
    const done = week.tasks.filter(t => t.status === "done").length
    const taskCount = Math.max(1, week.tasks.length)
    const groupHeight = (taskCount - 1) * TASK_GAP
    const weekNodeY = rowStartY[wi] + groupHeight / 2

    nodes.push({
      id: weekNodeId, type: "week",
      position: { x: 0, y: weekNodeY },
      data: {
        week: week.id, title: week.title, status: week.status,
        deadline: week.deadline, taskCount: week.tasks.length, doneCount: done,
        onClick: () => onSelect({ kind: "week", week }),
      } as unknown as Record<string, unknown>,
    })

    week.tasks.forEach((task, ti) => {
      const taskNodeId = `task-${week.id}-${task.id}`
      nodes.push({
        id: taskNodeId, type: "task",
        position: { x: TASK_X, y: rowStartY[wi] + ti * TASK_GAP },
        data: {
          title: task.title, type: task.type, status: task.status,
          onClick: () => onSelect({ kind: "task", task, week }),
        } as unknown as Record<string, unknown>,
      })
      edges.push({
        id: `e-${weekNodeId}-${taskNodeId}`,
        source: weekNodeId, target: taskNodeId,
        sourceHandle: "tasks",
        animated: task.status === "in-progress",
        style: { stroke: "#21262d", strokeWidth: 1, strokeDasharray: "4 4" },
      })
    })

    // Timeline spine: connect consecutive weeks top-to-bottom
    if (wi > 0) {
      const prevWeekNodeId = `week-${weeks[wi - 1].id}`
      edges.push({
        id: `e-timeline-${wi}`,
        source: prevWeekNodeId, target: weekNodeId,
        sourceHandle: "bottom", targetHandle: "top",
        style: { stroke: "#30363d", strokeWidth: 1.5 },
        type: "smoothstep",
      })
    }
  })

  return { nodes, edges }
}

export function Graph({ weeks }: { weeks: Week[] }) {
  const [selected, setSelected] = useState<Selected | null>(null)
  const rf = useRef<ReactFlowInstance | null>(null)

  // The week to open on: the one in progress, otherwise the latest.
  const currentWeek = useMemo(
    () => weeks.find(w => w.status === "in-progress") ?? weeks[weeks.length - 1],
    [weeks],
  )
  const focusNodes = useMemo(() => {
    if (!currentWeek) return []
    return [
      { id: `week-${currentWeek.id}` },
      ...currentWeek.tasks.map(t => ({ id: `task-${currentWeek.id}-${t.id}` })),
    ]
  }, [currentWeek])

  // Smoothly center a single node, nudged left so the detail panel doesn't cover it.
  const focusNode = useCallback((id: string) => {
    const inst = rf.current
    if (!inst) return
    const n = inst.getNode(id)
    if (!n) return
    const zoom = Math.max(inst.getZoom(), 0.85)
    const w = n.measured?.width ?? 200
    const h = n.measured?.height ?? 60
    inst.setCenter(n.position.x + w / 2 + 200 / zoom, n.position.y + h / 2, { zoom, duration: 650 })
  }, [])

  const handleSelect = useCallback((s: Selected) => {
    setSelected(s)
    const id = s.kind === "week" ? `week-${s.week.id}` : `task-${s.week.id}-${s.task.id}`
    focusNode(id)
  }, [focusNode])

  const { nodes: init, edges: initE } = useMemo(() => buildGraph(weeks, handleSelect), [weeks, handleSelect])
  const [nodes, , onNodesChange] = useNodesState(init)
  const [edges, , onEdgesChange] = useEdgesState(initE)
  const onClose = useCallback(() => setSelected(null), [])

  // Intro: hold the full overview for a beat, then glide-zoom into the current week.
  const handleInit = useCallback((inst: ReactFlowInstance) => {
    rf.current = inst
    inst.fitView({ padding: 0.4, duration: 0 })
    if (focusNodes.length === 0) return
    window.setTimeout(() => {
      inst.fitView({ nodes: focusNodes, padding: 0.6, maxZoom: 1, duration: 1500 })
    }, 700)
  }, [focusNodes])

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
        onInit={handleInit}
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
