"use client"

import { useState } from "react"
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

const weeks = [week01, week02, week03, week04, week05, week06, week07]

type View = "hero" | "graph" | "stats"

export default function Home() {
  const [view, setView] = useState<View>("hero")
  const [prev, setPrev] = useState<View>("hero")

  // Remember where we were so a page can offer a real "back".
  const go = (next: View) => {
    setPrev(view)
    setView(next)
  }

  if (view === "graph") return <Graph weeks={weeks as never} onNavigate={go} />
  if (view === "stats") return <StatsPage onNavigate={go} from={prev} />
  return <HeroPage onEnter={() => go("graph")} onStats={() => go("stats")} />
}
