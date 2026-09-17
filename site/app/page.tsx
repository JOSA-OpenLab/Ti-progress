"use client"

import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { HeroPage } from "./components/HeroPage"
import { Graph } from "./components/Graph"
import { StatsPage } from "./components/StatsPage"
import week01 from "../data/weeks/week-01.json"
import week02 from "../data/weeks/week-02.json"
import week03 from "../data/weeks/week-03.json"
import week04 from "../data/weeks/week-04.json"
import week05 from "../data/weeks/week-05.json"
import week06 from "../data/weeks/week-06.json"
import week07 from "../data/weeks/week-07.json"
import week08 from "../data/weeks/week-08.json"
import week09 from "../data/weeks/week-09.json"
import week10 from "../data/weeks/week-10.json"
import week11 from "../data/weeks/week-11.json"
import week12 from "../data/weeks/week-12.json"

const weeks = [week01, week02, week03, week04, week05, week06, week07, week08, week09, week10, week11, week12]

type View = "hero" | "graph" | "stats"

export default function Home() {
  const [view, setView] = useState<View>("hero")
  const [prev, setPrev] = useState<View>("hero")

  // Remember where we were so a page can offer a real "back".
  const go = (next: View) => {
    setPrev(view)
    setView(next)
  }

  // Views overlap while swapping: the one leaving keeps animating on top while
  // the one arriving fades up underneath, so there is no frame where the screen
  // cuts. Each root is absolutely positioned for that to work.
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      <AnimatePresence initial={false}>
        {view === "graph" && <Graph key="graph" weeks={weeks as never} onNavigate={go} />}
        {view === "stats" && <StatsPage key="stats" onNavigate={go} from={prev} />}
        {view === "hero" && <HeroPage key="hero" onEnter={() => go("graph")} onStats={() => go("stats")} />}
      </AnimatePresence>
    </div>
  )
}
