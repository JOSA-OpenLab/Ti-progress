"use client"

import { motion, AnimatePresence } from "motion/react"
import { CodeBlock } from "./ui/code-block"
import { EdgeBlur } from "./ui/edge-blur"
import { BorderBeamButton } from "./ui/border-beam-button"

type Task = {
  id: string; type: string; title: string; status: string
  reflection: string | null; commands: string[]; output: string | null
  screenshot: string | null; pr: string | null
}
type Week = { id: number; title: string; status: string; deadline: string; report?: string | null; tasks: Task[] }
type Selected = { kind: "week"; week: Week } | { kind: "task"; task: Task; week: Week }

const typeColor: Record<string, string> = {
  archaeology: "#00b4d8", reflog: "#f59e0b", rebase: "#3fb950", "soft-skill": "#8b5cf6",
}
const statusColor: Record<string, string> = {
  done: "#3fb950", "in-progress": "#f59e0b", pending: "#6e7681",
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#6e7681", marginBottom: 10, fontFamily: "monospace" }}>
      {children}
    </div>
  )
}

export function DetailPanel({ selected, onClose }: { selected: Selected | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {selected && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: 440, zIndex: 50,
              background: "#0d1117",
              borderLeft: "1px solid #21262d",
              overflowY: "auto",
            }}
          >
            {/* edge blur inside panel */}
            <EdgeBlur position="bottom" height={60} />

            <div style={{ padding: "32px 28px 80px" }}>
              {/* close */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute", top: 20, right: 20,
                  background: "none", border: "1px solid #21262d",
                  color: "#6e7681", width: 28, height: 28,
                  borderRadius: 6, cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>

              {selected.kind === "week" && <WeekDetail week={selected.week} />}
              {selected.kind === "task" && <TaskDetail task={selected.task} week={selected.week} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function WeekDetail({ week }: { week: Week }) {
  const done = week.tasks.filter(t => t.status === "done").length
  const color = statusColor[week.status] ?? "#6e7681"
  const progress = Math.round((done / week.tasks.length) * 100)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#6e7681", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
          Week {String(week.id).padStart(2, "0")} of 11
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", letterSpacing: -0.5, lineHeight: 1.2 }}>
          {week.title}
        </div>
      </div>

      {/* progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <SectionLabel>Progress</SectionLabel>
          <span style={{ fontSize: 11, color: "#6e7681", fontFamily: "monospace" }}>{done}/{week.tasks.length}</span>
        </div>
        <div style={{ height: 2, background: "#21262d", borderRadius: 1 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: color, borderRadius: 1 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <SectionLabel>Status</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 13, color: "#c9d1d9", textTransform: "capitalize" }}>{week.status.replace("-", " ")}</span>
          </div>
        </div>
        <div>
          <SectionLabel>Deadline</SectionLabel>
          <span style={{ fontSize: 13, color: "#c9d1d9", fontFamily: "monospace" }}>{week.deadline}</span>
        </div>
      </div>

      <div>
        <SectionLabel>Tasks</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {week.tasks.map(t => {
            const tc = typeColor[t.type] ?? "#6e7681"
            const sc = statusColor[t.status] ?? "#6e7681"
            return (
              <div key={t.id} style={{ borderLeft: `2px solid ${tc}`, paddingLeft: 12, paddingTop: 4, paddingBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: tc, marginBottom: 2, fontFamily: "monospace" }}>{t.type}</div>
                  <div style={{ fontSize: 13, color: "#c9d1d9" }}>{t.title}</div>
                </div>
                <div style={{ fontSize: 11, color: sc, textTransform: "capitalize" }}>{t.status.replace("-", " ")}</div>
              </div>
            )
          })}
        </div>
      </div>

      {week.report && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BorderBeamButton
            variant="ghost"
            colorVariant="mono"
            beamSize="md"
            className="px-6 text-sm font-semibold text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#e6edf3]"
            onClick={() => window.open((process.env.NEXT_PUBLIC_BASE_PATH ?? "") + week.report!, "_blank", "noreferrer")}
          >
            View Full Report
          </BorderBeamButton>
        </div>
      )}
    </div>
  )
}

function TaskDetail({ task, week }: { task: Task; week: Week }) {
  const color = typeColor[task.type] ?? "#6e7681"
  const sc = statusColor[task.status] ?? "#6e7681"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
          Week {String(week.id).padStart(2, "0")} · {task.type}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", letterSpacing: -0.5 }}>
          {task.title}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc }} />
        <span style={{ fontSize: 12, color: "#8b949e", textTransform: "capitalize" }}>{task.status.replace("-", " ")}</span>
      </div>

      {task.commands.length > 0 && (
        <div>
          <SectionLabel>Commands</SectionLabel>
          <CodeBlock code={task.commands.join("\n")} language="bash" />
        </div>
      )}

      {task.output && (
        <div>
          <SectionLabel>Output</SectionLabel>
          <CodeBlock code={task.output} language="output" />
        </div>
      )}

      {task.reflection && (
        <div>
          <SectionLabel>Reflection</SectionLabel>
          {/* Scrollable text with CSS mask-image fade — clean fade, no blur artifacts */}
          <div style={{ borderLeft: `2px solid ${color}`, paddingLeft: 16 }}>
            <div
              style={{
                maxHeight: 160,
                overflowY: "auto",
                scrollbarWidth: "none",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)",
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              <p style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.85, margin: 0 }}>
                {task.reflection}
              </p>
            </div>
          </div>
        </div>
      )}

      {task.screenshot && (
        <div>
          <SectionLabel>Screenshot</SectionLabel>
          <img src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + task.screenshot} alt="screenshot" style={{ width: "100%", borderRadius: 8, border: "1px solid #21262d" }} />
        </div>
      )}

      {task.pr && (
        <div>
          <SectionLabel>Pull Request</SectionLabel>
          <a href={task.pr} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color, textDecoration: "none", fontFamily: "monospace" }}>
            {task.pr} →
          </a>
        </div>
      )}

      {task.status === "pending" && (
        <div style={{ borderLeft: "2px solid #21262d", paddingLeft: 16, fontSize: 13, color: "#6e7681", fontStyle: "italic" }}>
          Not started yet.
        </div>
      )}
    </div>
  )
}
