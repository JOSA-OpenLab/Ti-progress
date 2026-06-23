"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  GitPullRequest, MessageSquareText, CircleDot, FileSearch,
  GitCommitHorizontal, GitMerge, ArrowLeft, ExternalLink, LayoutGrid,
} from "lucide-react"
import { TopBlur, BottomBlur } from "./ui/edge-blur"
import contributions from "../../data/contributions.json"

const MONO = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', Georgia, serif"
const CYAN = "#00b4d8"

type Kind = "pr" | "review" | "issue" | "analysis" | "bisect"
type Status = "merged" | "open" | "closed"
type Item = {
  id: string; kind: Kind; title: string; repo: string
  status: Status; date: string; url: string; summary: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
function RepoAvatar({ repo }: { repo: string }) {
  const owner = repo.split("/")[0]
  const [failed, setFailed] = useState(false)
  const base = {
    width: 22, height: 22, borderRadius: 6, border: "1px solid #21262d", flexShrink: 0,
  } as const
  if (failed) {
    return (
      <span style={{
        ...base, background: "#1b2230", color: "#8b949e", fontFamily: MONO, fontSize: 11,
        display: "flex", alignItems: "center", justifyContent: "center", textTransform: "uppercase",
      }}>
        {owner[0]}
      </span>
    )
  }
  return (
    <img
      src={`https://github.com/${owner}.png?size=48`} alt={owner} width={22} height={22}
      onError={() => setFailed(true)}
      style={{ ...base, background: "#15181e" }}
    />
  )
}

const items = contributions.items as Item[]

const KIND = {
  pr:       { label: "Pull Requests", short: "PRs",      icon: GitPullRequest,      color: "#a371f7" },
  review:   { label: "Reviews",       short: "Reviews",  icon: MessageSquareText,   color: "#00b4d8" },
  issue:    { label: "Issues & Triage", short: "Issues", icon: CircleDot,           color: "#3fb950" },
  analysis: { label: "Analyses",      short: "Analysis", icon: FileSearch,          color: "#f59e0b" },
  bisect:   { label: "Bisects",       short: "Bisect",   icon: GitCommitHorizontal, color: "#ec6547" },
} as const

const STATUS = {
  merged: { label: "Merged", color: "#a371f7" },
  open:   { label: "Open",   color: "#3fb950" },
  closed: { label: "Closed", color: "#8b949e" },
} as const

function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    let start = 0
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{n}</>
}

export function StatsPage({ onNavigate, from = "graph" }: { onNavigate: (v: "hero" | "graph" | "stats") => void; from?: "hero" | "graph" | "stats" }) {
  const backLabel = from === "hero" ? "Home" : "Graph"
  const [filter, setFilter] = useState<Kind | "all">("all")
  const [openId, setOpenId] = useState<string | null>(null)

  // Live PR state from GitHub's public API; the JSON status is the fallback.
  const [live, setLive] = useState<Record<string, Status>>({})
  useEffect(() => {
    let cancelled = false
    Promise.all(
      items.filter(i => i.kind === "pr").map(async (it) => {
        const m = it.url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
        if (!m) return null
        try {
          const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}/pulls/${m[3]}`)
          if (!r.ok) return null
          const d = await r.json()
          const s: Status = d.merged ? "merged" : d.state === "open" ? "open" : "closed"
          return [it.id, s] as const
        } catch { return null }
      })
    ).then(rows => {
      if (cancelled) return
      const map: Record<string, Status> = {}
      for (const row of rows) if (row) map[row[0]] = row[1]
      setLive(map)
    })
    return () => { cancelled = true }
  }, [])

  const eff = (i: Item): Status => live[i.id] ?? i.status

  const stats = useMemo(() => {
    const by = (k: Kind) => items.filter(i => i.kind === k).length
    const prMerged = items.filter(i => i.kind === "pr" && eff(i) === "merged").length
    const prOpen = items.filter(i => i.kind === "pr" && eff(i) === "open").length
    const repos = new Set(items.map(i => i.repo)).size
    return {
      total: items.length, pr: by("pr"), review: by("review"), issue: by("issue"),
      prMerged, prOpen, repos,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  const filtered = useMemo(() => {
    const list = filter === "all" ? items : items.filter(i => i.kind === filter)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [filter])

  const prTotal = stats.pr
  const bar = [
    { ...STATUS.merged, n: stats.prMerged },
    { ...STATUS.open, n: stats.prOpen },
  ]

  // Clickable headline tiles. Kind tiles filter the grid below.
  const tiles: Array<{
    label: string; value: number; icon: typeof GitMerge; color: string
    sub?: string; filter?: Kind | "all"
  }> = [
    { label: "Contributions", value: stats.total, icon: LayoutGrid, color: CYAN, sub: `${stats.repos} repositories`, filter: "all" },
    { label: "Pull Requests", value: stats.pr, icon: GitPullRequest, color: KIND.pr.color, sub: `${stats.prMerged} merged${stats.prOpen ? ` · ${stats.prOpen} open` : ""}`, filter: "pr" },
    { label: "Reviews", value: stats.review, icon: MessageSquareText, color: KIND.review.color, sub: "on real OSS PRs", filter: "review" },
    { label: "Issues & Triage", value: stats.issue, icon: CircleDot, color: KIND.issue.color, sub: "reported & reproduced", filter: "issue" },
  ]

  return (
    <div style={{ width: "100vw", height: "100vh", overflowY: "auto", background: "#0a0a0a", position: "relative" }}>
      <TopBlur height={64} />
      <BottomBlur height={56} />

      {/* Header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 56,
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(2px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => onNavigate(from)}
            style={{
              display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
              background: "#111318", border: "1px solid #21262d", borderRadius: 7,
              padding: "5px 11px", color: "#8b949e", fontFamily: MONO, fontSize: 11,
              transition: "color .2s, border-color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = CYAN; e.currentTarget.style.borderColor = "#284b54" }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8b949e"; e.currentTarget.style.borderColor = "#21262d" }}
          >
            <ArrowLeft size={13} /> {backLabel}
          </button>
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: CYAN, fontFamily: MONO }}>
            JOSA OpenLab
          </span>
          <span style={{ width: 1, height: 12, background: "#21262d" }} />
          <span style={{ fontSize: 11, color: "#6e7681", fontFamily: MONO }}>Impact</span>
        </div>
        <span style={{ fontSize: 10, color: "#3d444d", fontFamily: MONO, letterSpacing: 1 }}>
          updated {contributions.updated}
        </span>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "104px 24px 80px" }}>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ color: "rgba(0,180,216,0.4)", fontFamily: MONO, fontSize: 11 }}>////</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", color: "#7d8590" }}>
              You cannot improve what you do not measure
            </span>
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 500,
            letterSpacing: "-1.5px", lineHeight: 1, color: "#f4f6f8", margin: 0,
          }}>
            Open-source{" "}
            <span style={{
              fontStyle: "italic",
              backgroundImage: "linear-gradient(180deg,#5fd0ec,#00b4d8 55%,#0090b5)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>impact</span>
          </h1>
        </motion.div>

        {/* Stat tiles */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: 12, marginBottom: 34,
        }}>
          {tiles.map((t, i) => {
            const Icon = t.icon
            const active = t.filter !== undefined && filter === t.filter
            const clickable = t.filter !== undefined
            return (
              <motion.button
                key={t.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.2, 0.7, 0.2, 1] }}
                whileHover={clickable ? { y: -3 } : undefined}
                onClick={clickable ? () => setFilter(t.filter!) : undefined}
                style={{
                  flex: "1 1 200px", maxWidth: 260,
                  textAlign: "left", cursor: clickable ? "pointer" : "default",
                  background: active ? "rgba(0,180,216,0.06)" : "linear-gradient(180deg,#0e1014,#0b0d11)",
                  border: `1px solid ${active ? "#284b54" : "#1b1f27"}`,
                  borderRadius: 14, padding: "16px 16px 14px", position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%",
                  background: t.color, opacity: 0.10, filter: "blur(22px)",
                }} />
                <Icon size={16} color={t.color} style={{ marginBottom: 12 }} />
                <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 500, lineHeight: 1, color: "#f4f6f8" }}>
                  <CountUp value={t.value} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#c9d1d9", marginTop: 8, letterSpacing: 0.3 }}>
                  {t.label}
                </div>
                {t.sub && <div style={{ fontFamily: MONO, fontSize: 10, color: "#5c6470", marginTop: 3 }}>{t.sub}</div>}
              </motion.button>
            )
          })}
        </div>

        {/* Status distribution bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginBottom: 38 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#5c6470", marginBottom: 9 }}>
            Pull request outcomes
          </div>
          <div style={{ display: "flex", height: 8, borderRadius: 5, overflow: "hidden", background: "#15181e" }}>
            {bar.filter(s => s.n > 0).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ width: 0 }} animate={{ width: `${(s.n / prTotal) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.55 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                style={{ background: s.color }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 11, flexWrap: "wrap" }}>
            {bar.map(s => (
              <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 11, color: "#8b949e" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                {s.label} <span style={{ color: "#5c6470" }}>{s.n}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Contribution cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((it, i) => {
              const k = KIND[it.kind]
              const Icon = k.icon
              const st = STATUS[eff(it)]
              const isOpen = openId === it.id
              return (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.32, delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setOpenId(isOpen ? null : it.id)}
                  whileHover={{ y: -2 }}
                  style={{
                    cursor: "pointer", borderRadius: 13, padding: 16,
                    background: "linear-gradient(180deg,#0e1014,#0b0d11)",
                    border: `1px solid ${isOpen ? "#2b3038" : "#1b1f27"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <RepoAvatar repo={it.repo} />
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, color: k.color, letterSpacing: 0.5, textTransform: "uppercase" }}>
                        <Icon size={13} /> {k.short}
                      </span>
                    </span>
                    {it.kind === "pr" && (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 10,
                        color: st.color, background: `${st.color}18`, padding: "2px 8px", borderRadius: 999,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />
                        {st.label}
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.25, color: "#f0f3f6", marginBottom: 7 }}>
                    {it.title}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "#6e7681" }}>
                    {it.repo} <span style={{ color: "#3d444d" }}>· {fmtDate(it.date)}</span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.6, color: "#a8b1bd", margin: "13px 0 0", borderTop: "1px solid #1b1f27", paddingTop: 13 }}>
                          {it.summary}
                        </p>
                        <a
                          href={it.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                            fontFamily: MONO, fontSize: 11, color: CYAN, textDecoration: "none",
                            border: "1px solid #284b54", borderRadius: 7, padding: "6px 11px",
                          }}
                        >
                          View on GitHub <ExternalLink size={12} />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <a
            href="http://ti0.me" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: MONO, fontSize: 10, color: "#3d444d", letterSpacing: 3, textTransform: "uppercase", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
            onMouseLeave={e => (e.currentTarget.style.color = "#3d444d")}
          >
            Qutibah Ananzeh · ti0.me ↗
          </a>
        </div>
      </div>
    </div>
  )
}
