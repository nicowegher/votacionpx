"use client"

import { useState, useEffect } from "react"
import { ProjectCard } from "./project-card"
import { Podium } from "./podium"
import { VotingTimer } from "./voting-timer"
import { Sparkles, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Project {
  id: string
  name: string
  description: string
  emoji: string
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Copilot IA",
    description:
      "Asistente que procesa tu pantalla en tiempo real, te guía clic a clic, interpreta errores en vivo y te dice exactamente qué hacer.",
    emoji: "🖥️",
  },
  {
    id: "2",
    name: "Conciliación Bancaria IA",
    description:
      "El Bot de Conciliación Inteligente de Pxsol que analiza automáticamente y en segundos los datos del PMS, Movimientos bancarios, Compras y ventas.",
    emoji: "🏦",
  },
  {
    id: "3",
    name: "MentorIA",
    description:
      "Agente Pxsolero Interdisciplinario que centraliza el conocimiento y los flujos de trabajo entre distintas áreas con el fin de reducir consultas cruzadas y aumentar la eficiencia operativa.",
    emoji: "🧠",
  },
]

const getVotingEndTime = () => new Date(Date.now() + 2 * 60 * 1000)

interface PodiumRankerProps {
  onVoteSubmitted?: (ranking: string[], timeExpired?: boolean) => void
  onBack?: () => void
}

export function PodiumRanker({ onVoteSubmitted, onBack }: PodiumRankerProps) {
  const [projects] = useState<Project[]>(initialProjects)
  const [ranking, setRanking] = useState<(Project | null)[]>([null, null, null])
  const [showPodium, setShowPodium] = useState(false)
  const [votingClosed, setVotingClosed] = useState(false)
  const [closedByAdmin, setClosedByAdmin] = useState(false)
  const [endTime] = useState(getVotingEndTime)

  // Suscribirse al estado de la votación en tiempo real
  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const { subscribeToVotingConfig } = await import("@/lib/firebase/firestore")
        const unsubscribe = subscribeToVotingConfig((config) => {
          if (config?.status === "closed") {
            setVotingClosed(true)
            setClosedByAdmin(true)
          }
        })
        return unsubscribe
      } catch (error) {
        console.error("Error suscribiéndose al estado de votación:", error)
      }
    }

    let unsubscribe: (() => void) | undefined
    checkVotingStatus().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const assignToPosition = (project: Project, position: number) => {
    if (votingClosed) return

    setRanking((prev) => {
      const newRanking = [...prev]
      const existingIndex = newRanking.findIndex((p) => p?.id === project.id)
      if (existingIndex !== -1) {
        newRanking[existingIndex] = null
      }
      if (newRanking[position] !== null) {
        const displaced = newRanking[position]
        if (existingIndex !== -1 && displaced) {
          newRanking[existingIndex] = displaced
        }
      }
      newRanking[position] = project
      return newRanking
    })
  }

  const removeProjectFromRanking = (projectId: string) => {
    if (votingClosed) return
    setRanking((prev) => {
      const newRanking = [...prev]
      const index = newRanking.findIndex((p) => p?.id === projectId)
      if (index !== -1) {
        newRanking[index] = null
      }
      return newRanking
    })
  }

  const isProjectRanked = (projectId: string) => {
    return ranking.some((p) => p?.id === projectId)
  }

  const getProjectPosition = (projectId: string) => {
    return ranking.findIndex((p) => p?.id === projectId)
  }

  const getTakenPositions = (projectId: string): number[] => {
    const positions: number[] = []
    ranking.forEach((p, index) => {
      if (p && p.id !== projectId) {
        positions.push(index)
      }
    })
    return positions
  }

  const allRanked = ranking.every((p) => p !== null)

  const resetRanking = () => {
    if (votingClosed) return
    setRanking([null, null, null])
    setShowPodium(false)
  }

  const handleTimeUp = () => {
    setVotingClosed(true)
    if (onVoteSubmitted) {
      const rankingNames = ranking.map((p) => (p ? p.name : ""))
      onVoteSubmitted(rankingNames, true) // true indica que el tiempo se agotó
    }
  }

  const handleSubmitVote = () => {
    if (allRanked && onVoteSubmitted) {
      const rankingNames = ranking.map((p) => p!.name)
      onVoteSubmitted(rankingNames, false) // false indica que el voto fue enviado a tiempo
    } else {
      setShowPodium(true)
    }
  }

  if (showPodium && allRanked) {
    return (
      <Podium
        ranking={ranking as Project[]}
        onBack={() => setShowPodium(false)}
        onReset={resetRanking}
        onConfirm={() => {
          if (onVoteSubmitted) {
            const rankingNames = ranking.map((p) => p!.name)
            onVoteSubmitted(rankingNames, false) // false indica que el voto fue enviado a tiempo
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-3 py-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-foreground">Concurso IA</h1>
        <VotingTimer endTime={endTime} onTimeUp={handleTimeUp} />
      </div>

      {/* Subtitle */}
      <div className="text-center mb-4">
        <p className="text-muted-foreground text-xs">Seleccioná la medalla de cada proyecto</p>
      </div>

      {votingClosed && (
        <div className="mb-4 p-3 bg-destructive/10 rounded-xl text-center">
          <p className="text-destructive font-medium text-sm">
            {closedByAdmin ? "La votación ha sido cerrada por los administradores" : "El tiempo se ha agotado"}
          </p>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto pb-3">
        <div className="space-y-2.5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isRanked={isProjectRanked(project.id)}
              position={getProjectPosition(project.id)}
              onAssign={(position) => assignToPosition(project, position)}
              onRemove={() => removeProjectFromRanking(project.id)}
              disabled={votingClosed}
              takenPositions={getTakenPositions(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 left-0 right-0 bg-background pt-3 pb-2 border-t border-border -mx-3 px-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11 text-sm bg-transparent"
            onClick={resetRanking}
            disabled={ranking.every((p) => p === null) || votingClosed}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reiniciar
          </Button>
          <Button
            className="flex-1 h-11 text-sm bg-primary hover:bg-primary/90"
            onClick={handleSubmitVote}
            disabled={!allRanked || votingClosed}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Enviar Voto
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RankingSlotProps {
  position: number
  project: Project | null
  onRemove: () => void
  disabled?: boolean
}

function RankingSlot({ position, project, onRemove, disabled }: RankingSlotProps) {
  const medals = [
    { label: "1°", emoji: "🥇", color: "bg-gold text-primary-foreground", border: "border-gold" },
    { label: "2°", emoji: "🥈", color: "bg-silver text-foreground", border: "border-silver" },
    { label: "3°", emoji: "🥉", color: "bg-bronze text-accent-foreground", border: "border-bronze" },
  ]

  const medal = medals[position]

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        project ? medal.border : "border-dashed border-muted"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
          project ? medal.color : "bg-muted text-muted-foreground"
        }`}
      >
        {medal.emoji}
      </div>
      {project ? (
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{project.emoji}</span>
            <span className="font-medium text-foreground">{project.name}</span>
          </div>
          {!disabled && (
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full bg-muted hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Sin asignar</span>
      )}
    </div>
  )
}
