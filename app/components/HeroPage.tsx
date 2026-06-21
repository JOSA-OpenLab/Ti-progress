"use client"

import { motion } from "motion/react"
import { BgAnimateButton } from "./ui/bg-animate-button"
import { BottomBlur } from "./ui/edge-blur"
import { Dithering } from "@paper-design/shaders-react"
import week01 from "../../data/weeks/week-01.json"
import week02 from "../../data/weeks/week-02.json"
import week03 from "../../data/weeks/week-03.json"
import week04 from "../../data/weeks/week-04.json"
import week05 from "../../data/weeks/week-05.json"

// Single source of truth — derived from the week data files so the hero
// can never drift out of sync with the graph again.
const TOTAL = 11
const known = [week01.status, week02.status, week03.status, week04.status, week05.status]
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

export function HeroPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Dithering sphere — the signature atmosphere */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.22 }}>
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
      </div>

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
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 32px", textAlign: "center",
      }}>

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
        >
          <BgAnimateButton
            gradient="cyan"
            animation="spin-slow"
            rounded="full"
            size="lg"
            onClick={onEnter}
          >
            View Progress
          </BgAnimateButton>
        </motion.div>

        {/* Progress rail — replaces the old dot grid + legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 48, width: "min(300px, 76vw)" }}
        >
          {/* Caption — single centered line */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", gap: 12,
            fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
            marginBottom: 15,
          }}>
            <span style={{ color: "#6e7681" }}>
              Week {String(leadIndex + 1).padStart(2, "0")} <span style={{ color: "#3d444d" }}>/ {TOTAL}</span>
            </span>
            <span style={{ color: "#2d333b" }}>·</span>
            <span style={{ color: currentIndex >= 0 ? AMBER : GREEN, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: currentIndex >= 0 ? AMBER : GREEN }} />
              {currentIndex >= 0 ? "In Progress" : `${doneCount} Done`}
            </span>
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

      </div>

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
    </div>
  )
}
