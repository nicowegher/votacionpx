"use client"

import type { Project } from "./podium-ranker"
import { Trophy, ArrowLeft, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface PodiumProps {
  ranking: Project[]
  onBack: () => void
  onReset: () => void
  onConfirm?: () => void
}

export function Podium({ ranking, onBack, onReset, onConfirm }: PodiumProps) {
  useEffect(() => {
    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#FFD700", "#C0C0C0", "#CD7F32"],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#FFD700", "#C0C0C0", "#CD7F32"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <div className="px-4 py-6 max-w-lg mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Confirma tu Voto</h1>
        <p className="text-muted-foreground text-sm">Revisa tu ranking antes de enviarlo</p>
      </div>

      {/* Podium Visual */}
      <div className="flex-1 flex items-end justify-center gap-2 mb-6 px-2">
        {/* 2nd Place */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full bg-card rounded-t-2xl p-3 border border-b-0 border-silver text-center mb-2">
            <span className="text-2xl mb-1 block">{ranking[1].emoji}</span>
            <span className="font-semibold text-xs text-foreground line-clamp-2">{ranking[1].name}</span>
          </div>
          <div className="w-full h-20 bg-silver rounded-t-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">2°</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full bg-card rounded-t-2xl p-3 border border-b-0 border-gold text-center mb-2 shadow-lg">
            <span className="text-3xl mb-1 block">{ranking[0].emoji}</span>
            <span className="font-bold text-sm text-foreground line-clamp-2">{ranking[0].name}</span>
          </div>
          <div className="w-full h-28 bg-gold rounded-t-lg flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">1°</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full bg-card rounded-t-2xl p-3 border border-b-0 border-bronze text-center mb-2">
            <span className="text-2xl mb-1 block">{ranking[2].emoji}</span>
            <span className="font-semibold text-xs text-foreground line-clamp-2">{ranking[2].name}</span>
          </div>
          <div className="w-full h-14 bg-bronze rounded-t-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-foreground">3°</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-2 mb-6">
        {ranking.map((project, index) => (
          <div key={project.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
            <span className="text-xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
            <div className="flex-1">
              <span className="font-medium text-foreground">{project.name}</span>
              <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {onConfirm && (
          <Button className="w-full h-14 text-base bg-primary hover:bg-primary/90" onClick={onConfirm}>
            <Check className="w-5 h-5 mr-2" />
            Confirmar Voto
          </Button>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 bg-transparent" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Editar
          </Button>
          <Button variant="outline" className="flex-1 h-12 bg-transparent" onClick={onReset}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
