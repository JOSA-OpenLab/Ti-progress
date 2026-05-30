"use client"

import { useState } from "react"
import { HeroPage } from "./components/HeroPage"
import { Graph } from "./components/Graph"
import week01 from "../data/weeks/week-01.json"
import week02 from "../data/weeks/week-02.json"
import week03 from "../data/weeks/week-03.json"

const weeks = [week01, week02, week03]

export default function Home() {
  const [view, setView] = useState<"hero" | "graph">("hero")

  if (view === "graph") return <Graph weeks={weeks as never} />
  return <HeroPage onEnter={() => setView("graph")} />
}
