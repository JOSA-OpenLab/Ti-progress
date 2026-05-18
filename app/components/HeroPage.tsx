"use client"

import { motion } from "motion/react"
import { BgAnimateButton } from "./ui/bg-animate-button"
import { BottomBlur } from "./ui/edge-blur"
import { Dithering } from "@paper-design/shaders-react"

const weeks = [
  { n: "01", status: "done" },
  { n: "02", status: "in-progress" },
  { n: "03", status: "pending" },
  { n: "04", status: "pending" },
  { n: "05", status: "pending" },
  { n: "06", status: "pending" },
  { n: "07", status: "pending" },
  { n: "08", status: "pending" },
  { n: "09", status: "pending" },
  { n: "10", status: "pending" },
  { n: "11", status: "pending" },
]

const statusColor: Record<string, string> = {
  done: "#3fb950",
  "in-progress": "#f59e0b",
  pending: "#2d333b",
}

export function HeroPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Dithering — dimmed to ~15% so text is always readable */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.18 }}>
        <Dithering
          colorBack="#000000"
          colorFront="#00b4d8"
          shape="sphere"
          type="4x4"
          size={2}
          speed={0.35}
          scale={0.6}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Dark radial vignette so edges stay very dark */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.7) 70%, #000 100%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        flex: 1, padding: "0 32px", textAlign: "center",
        paddingTop: "14vh",
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 24 }}
        >
          <span style={{
            fontFamily: "monospace", fontSize: 11,
            letterSpacing: 4, textTransform: "uppercase",
            color: "#00b4d8",
            border: "1px solid rgba(0,180,216,0.35)",
            padding: "5px 16px", borderRadius: 20,
            background: "rgba(0,0,0,0.6)",
          }}>
            OpenLab Apprenticeship · 2026
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            fontSize: "clamp(36px, 7vw, 80px)",
            fontWeight: 700,
            letterSpacing: "-2.5px",
            lineHeight: 1.0,
            color: "#ffffff",
            marginBottom: 14,
            textAlign: "center",
            width: "100%",
          }}
        >
          JOSA{" "}
          <span style={{ color: "#00b4d8" }}>OpenLab</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          style={{
            fontSize: 13, color: "#8b949e",
            marginBottom: 40, maxWidth: 460,
            fontFamily: "monospace", letterSpacing: 2,
            textAlign: "center",
          }}
        >
          11 weeks · real contributions · open source
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.26 }}
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

        {/* Week dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", gap: 10, marginTop: 52, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 400 }}
        >
          {weeks.map((w, i) => (
            <motion.div
              key={w.n}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.04, type: "spring", stiffness: 400, damping: 22 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: statusColor[w.status],
                boxShadow: w.status !== "pending" ? `0 0 8px ${statusColor[w.status]}` : "none",
              }} />
              <span style={{
                fontSize: 9, fontFamily: "monospace",
                color: w.status === "pending" ? "#3d444d" : "#8b949e",
                letterSpacing: 0.5,
              }}>
                {w.n}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ display: "flex", gap: 24, marginTop: 18, justifyContent: "center", width: "100%" }}
        >
          {[
            { color: "#3fb950", label: "done" },
            { color: "#f59e0b", label: "in progress" },
            { color: "#2d333b", label: "upcoming" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 10, color: "#6e7681", fontFamily: "monospace" }}>{label}</span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "relative", zIndex: 10,
          paddingBottom: 28, textAlign: "center",
          fontFamily: "monospace", letterSpacing: 3, textTransform: "uppercase",
        }}
      >
        <a
          href="http://ti0.me"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10, color: "#3d444d", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#00b4d8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#3d444d")}
        >
          Qutibah Ananzeh · ti0.me ↗
        </a>
      </motion.div>

      <BottomBlur height={80} />
    </div>
  )
}
