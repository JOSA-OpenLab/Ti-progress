"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { BgAnimateButton } from "./ui/bg-animate-button"
import { BottomBlur } from "./ui/edge-blur"
import { Dithering } from "@paper-design/shaders-react"
import week01 from "../../data/weeks/week-01.json"
import week02 from "../../data/weeks/week-02.json"
import week03 from "../../data/weeks/week-03.json"
import week04 from "../../data/weeks/week-04.json"
import week05 from "../../data/weeks/week-05.json"
import week06 from "../../data/weeks/week-06.json"
import week07 from "../../data/weeks/week-07.json"
import week08 from "../../data/weeks/week-08.json"
import week09 from "../../data/weeks/week-09.json"
import week10 from "../../data/weeks/week-10.json"
import week11 from "../../data/weeks/week-11.json"
import week12 from "../../data/weeks/week-12.json"

// Single source of truth — derived from the week data files so the hero
// can never drift out of sync with the graph again. (Every new week-NN.json
// must be added here AND in page.tsx, or the hero shows it as pending.)
const TOTAL = 12
const known = [week01.status, week02.status, week03.status, week04.status, week05.status, week06.status, week07.status, week08.status, week09.status, week10.status, week11.status, week12.status]
const weeks = Array.from({ length: TOTAL }, (_, i) => known[i] ?? "pending")

const doneCount = weeks.filter((s) => s === "done").length
const currentIndex = weeks.findIndex((s) => s === "in-progress")
const leadIndex = currentIndex >= 0 ? currentIndex : Math.max(0, doneCount - 1)
const fillPct = (leadIndex / (TOTAL - 1)) * 100

const MONO = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', Georgia, serif"
const CYAN = "#00b4d8"
const GREEN = "#3fb950"
const AMBER = "#f59e0b"

const statusColor: Record<string, string> = {
  done: GREEN,
  "in-progress": AMBER,
  pending: "rgba(255,255,255,0.14)",
}

// The progress view is reachable from the repo's Month*/ markdown instead, so
// the hero offers one way in. `onEnter` is kept in the prop type so page.tsx
// can keep wiring it up for when the view comes back.
// The zoom runs in two halves: this long while the hero is still mounted, then
// the exit below carries it the rest of the way while Impact fades up underneath.
const LEAD_MS = 480

const REPO_URL = "https://github.com/JOSA-OpenLab/Ti-progress"

// lucide-react 1.x dropped brand icons, so the mark is inline.
function GitHubMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function HeroPage({ onStats }: { onEnter?: () => void; onStats: () => void }) {
  // Flying into the sphere, then handing over to Impact mid-zoom.
  const [launching, setLaunching] = useState(false)

  const launch = () => {
    if (launching) return
    setLaunching(true)
    window.setTimeout(onStats, LEAD_MS)
  }

  return (
    <motion.div
      // Coming back from Impact, the hero pulls out of the sphere rather than
      // appearing: it starts held at the scale the exit finished on.
      initial={{ opacity: 0, scale: 1.35 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 2.6 }}
      transition={{ duration: 0.72, ease: [0.22, 0.61, 0.24, 1] }}
      style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden", background: "#000", display: "flex", flexDirection: "column", willChange: "transform, opacity" }}
    >

      {/* Dithering sphere — the signature atmosphere, and the thing we fly into */}
      <motion.div
        animate={launching ? { scale: 4.2, opacity: 0.85 } : { scale: 1, opacity: 0.22 }}
        transition={{ duration: 1.1, ease: [0.62, 0, 0.78, 0] }}
        style={{ position: "absolute", inset: 0, zIndex: 0, transformOrigin: "50% 46%", willChange: "transform, opacity" }}
      >
        <Dithering
          colorBack="#000000"
          colorFront="#00b4d8"
          shape="sphere"
          type="4x4"
          size={2}
          speed={0.32}
          scale={0.82}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* Atmosphere igniting as the sphere fills the frame */}
      {launching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeIn" }}
          style={{
            position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 46%, rgba(0,180,216,0.55) 0%, rgba(0,180,216,0.12) 38%, transparent 68%)",
          }}
        />
      )}

      {/* Vignette so edges fall to pure black */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 68% 58% at 50% 48%, transparent 0%, rgba(0,0,0,0.72) 68%, #000 100%)",
      }} />

      {/* Soft cyan bloom behind the wordmark */}
      <div style={{
        position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)",
        width: 620, height: 280, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(0,180,216,0.16), transparent 70%)",
        filter: "blur(20px)",
      }} />

      {/* Content — centered on the sphere (footer is absolute so it doesn't shift this) */}
      <motion.div
        animate={launching ? { opacity: 0, scale: 1.14, filter: "blur(14px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.4, 0, 1, 1] }}
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 32px", textAlign: "center",
          pointerEvents: launching ? "none" : "auto",
        }}
      >

        {/* Eyebrow — slash motif borrowed from the JOSA decks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}
        >
          <span style={{ color: "rgba(0,180,216,0.35)", fontFamily: MONO, fontSize: 11, letterSpacing: 1 }}>////</span>
          <span style={{
            fontFamily: MONO, fontSize: 10.5, fontWeight: 500,
            letterSpacing: 4.5, textTransform: "uppercase", color: "#7d8590",
          }}>
            OpenLab Apprenticeship <span style={{ color: CYAN }}>·</span> 2026
          </span>
          <span style={{ color: "rgba(0,180,216,0.35)", fontFamily: MONO, fontSize: 11, letterSpacing: 1 }}>////</span>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(38px, 6vw, 82px)",
            fontWeight: 500,
            letterSpacing: "-2px",
            lineHeight: 0.98,
            color: "#f4f6f8",
            marginBottom: 34,
            textAlign: "center",
          }}
        >
          JOSA{" "}
          <span style={{
            fontStyle: "italic",
            backgroundImage: "linear-gradient(180deg, #5fd0ec 0%, #00b4d8 55%, #0090b5 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}>
            OpenLab
          </span>
        </motion.h1>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
        >
          <BgAnimateButton
            gradient="cyan"
            animation="spin-slow"
            rounded="full"
            size="lg"
            onClick={launch}
          >
            Impact
          </BgAnimateButton>

          {/* Repo. A real anchor rather than BgAnimateButton: that component's
              asChild path feeds two children to a Radix Slot, which throws.
              Mirrors its markup so the two sit as a matched pair. */}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View the repository on GitHub"
            className="group relative inline-block overflow-hidden cursor-pointer rounded-full transition-all duration-200 ease-out hover:scale-[1.04] active:scale-95 hover:shadow-[0_0_28px_-4px_rgba(0,180,216,0.65)]"
          >
            <span className="absolute inset-[-1000%] m-auto block animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00b4d8_0%,#0077b6_50%,#00b4d8_100%)]" />
            <div className="relative flex items-center justify-center rounded-full bg-zinc-950 px-7 py-3 text-white transition-colors duration-200 ease-in-out group-hover:bg-zinc-800 group-hover:text-cyan-50">
              <GitHubMark />
            </div>
          </a>
        </motion.div>

        {/* Progress rail — replaces the old dot grid + legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 48, width: "min(300px, 76vw)" }}
        >
          {/* Caption — the week, and nothing after it */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
            color: "#6e7681", marginBottom: 15,
          }}>
            Week {String(leadIndex + 1).padStart(2, "0")}
          </div>

          {/* Track + fill + ticks */}
          <div style={{ position: "relative", height: 14, display: "flex", alignItems: "center" }}>
            {/* base track */}
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.07)" }} />
            {/* filled progress */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              style={{
                position: "absolute", left: 0, height: 2, borderRadius: 2,
                background: `linear-gradient(90deg, ${GREEN}, ${CYAN})`,
                boxShadow: `0 0 10px ${CYAN}`,
              }}
            />
            {/* ticks */}
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", width: "100%" }}>
              {weeks.map((s, i) => {
                const isCurrent = s === "in-progress"
                const isDone = s === "done"
                const dot = isCurrent ? 11 : isDone ? 8 : 6
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.65 + i * 0.035, type: "spring", stiffness: 420, damping: 24 }}
                    style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {/* pulsing halo on the current week */}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        style={{ position: "absolute", width: dot, height: dot, borderRadius: "50%", background: AMBER }}
                      />
                    )}
                    <div style={{
                      width: dot, height: dot, borderRadius: "50%",
                      background: statusColor[s],
                      boxShadow: isCurrent ? `0 0 10px ${AMBER}` : isDone ? `0 0 7px rgba(63,185,80,0.6)` : "none",
                      border: isCurrent ? "1px solid rgba(255,255,255,0.25)" : "none",
                    }} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Footer credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
          paddingBottom: 26, textAlign: "center",
          fontFamily: MONO, letterSpacing: 3, textTransform: "uppercase",
        }}
      >
        <a
          href="http://ti0.me"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10, color: "#3d444d", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00b4d8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#3d444d")}
        >
          Qutibah Ananzeh · ti0.me ↗
        </a>
      </motion.div>

      <BottomBlur height={80} />
    </motion.div>
  )
}
