"use client"

import { useState, useEffect } from "react"
import { subscribeToVotes, type Vote } from "@/lib/firestore/votes"
import { getVotingConfig } from "@/lib/firestore/voting-config"
import { Trophy } from "lucide-react"

interface ProjectStats {
  name: string
  firstPlace: number
  secondPlace: number
  thirdPlace: number
  totalPoints: number
}

export function PresentationDashboard() {
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [isVotingClosed, setIsVotingClosed] = useState(false)

  const calculateStats = (votes: Vote[]) => {
    const validVotes = votes.filter((v) => v.ranking && v.ranking.length === 3)

    setTotalVotes(validVotes.length)

    const stats: Record<string, ProjectStats> = {}

    validVotes.forEach((vote) => {
      if (!vote.ranking) return

      vote.ranking.forEach((projectName, index) => {
        if (!projectName) return

        if (!stats[projectName]) {
          stats[projectName] = {
            name: projectName,
            firstPlace: 0,
            secondPlace: 0,
            thirdPlace: 0,
            totalPoints: 0,
          }
        }

        if (index === 0) {
          stats[projectName].firstPlace++
          stats[projectName].totalPoints += 3
        } else if (index === 1) {
          stats[projectName].secondPlace++
          stats[projectName].totalPoints += 2
        } else if (index === 2) {
          stats[projectName].thirdPlace++
          stats[projectName].totalPoints += 1
        }
      })
    })

    const sortedStats = Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints)
    setProjectStats(sortedStats)
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    // Verificar primero si la votación está cerrada
    const checkVotingStatus = async () => {
      try {
        const config = await getVotingConfig()
        const closed = config?.status === "closed"
        setIsVotingClosed(closed)

        // Solo suscribirse a votos si la votación está cerrada
        if (closed) {
          unsubscribe = subscribeToVotes(
            (votes) => {
              calculateStats(votes)
            },
            (error) => {
              console.error("Error en listener de votos:", error)
              // Si hay error de permisos, intentar usar getAllVotes con polling
              if (error.message?.includes("permission") || error.message?.includes("permission-denied")) {
                console.log("Usando polling como alternativa debido a permisos")
              }
            }
          )
        }
      } catch (error) {
        console.error("Error verificando estado de votación:", error)
      }
    }

    checkVotingStatus()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇"
    if (position === 1) return "🥈"
    return "🥉"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
            <Trophy className="w-10 h-10 text-[#fbbf24]" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] bg-clip-text text-transparent">
            Resultados Finales
          </h1>
          <p className="text-2xl text-muted-foreground">Concurso IA - PXSOL 2025</p>
          <div className="mt-6 text-4xl font-bold text-[#fbbf24]">{totalVotes} Votos</div>
        </div>

        {/* Podium Visual */}
        {projectStats.length >= 3 && (
          <div className="mb-12 flex items-end justify-center gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="flex-1 flex flex-col items-center opacity-0 animate-[fadeIn_0.6s_ease-out_0s_forwards]">
              <div className="w-full bg-card/80 rounded-t-3xl p-6 border-2 border-border text-center mb-4 backdrop-blur-sm">
                <span className="text-5xl mb-2 block">🥈</span>
                <span className="font-bold text-xl text-foreground line-clamp-2">{projectStats[1].name}</span>
                <div className="mt-3 text-3xl font-bold text-muted-foreground">{projectStats[1].totalPoints} pts</div>
              </div>
              <div className="w-full h-32 bg-gradient-to-t from-muted to-muted/70 rounded-t-2xl flex items-center justify-center shadow-lg border-t border-border">
                <span className="text-4xl font-bold text-foreground">2°</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex-1 flex flex-col items-center opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]">
              <div className="w-full bg-gradient-to-b from-[#fbbf24]/30 to-[#f59e0b]/20 rounded-t-3xl p-8 border-2 border-[#fbbf24] text-center mb-4 backdrop-blur-sm shadow-2xl">
                <span className="text-6xl mb-3 block">🥇</span>
                <span className="font-bold text-2xl text-foreground line-clamp-2">{projectStats[0].name}</span>
                <div className="mt-4 text-4xl font-bold text-[#fbbf24]">{projectStats[0].totalPoints} pts</div>
              </div>
              <div className="w-full h-40 bg-gradient-to-t from-[#f59e0b] to-[#fbbf24] rounded-t-2xl flex items-center justify-center shadow-2xl border-t border-[#fbbf24]">
                <span className="text-5xl font-bold text-white">1°</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex-1 flex flex-col items-center opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
              <div className="w-full bg-card/80 rounded-t-3xl p-6 border-2 border-border text-center mb-4 backdrop-blur-sm">
                <span className="text-5xl mb-2 block">🥉</span>
                <span className="font-bold text-xl text-foreground line-clamp-2">{projectStats[2].name}</span>
                <div className="mt-3 text-3xl font-bold text-muted-foreground">{projectStats[2].totalPoints} pts</div>
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-[#d97706] to-[#f59e0b] rounded-t-2xl flex items-center justify-center shadow-lg border-t border-[#d97706]">
                <span className="text-3xl font-bold text-white">3°</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {projectStats.map((project, index) => (
            <div
              key={project.name}
              className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMedalEmoji(index)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                    <p className="text-2xl font-bold text-[#fbbf24] mt-1">{project.totalPoints} puntos</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-[#fbbf24]/20 rounded-lg p-3 text-center border border-[#fbbf24]/30">
                  <p className="text-2xl font-bold text-[#fbbf24]">{project.firstPlace}</p>
                  <p className="text-xs text-muted-foreground mt-1">🥇 1°</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
                  <p className="text-2xl font-bold text-foreground">{project.secondPlace}</p>
                  <p className="text-xs text-muted-foreground mt-1">🥈 2°</p>
                </div>
                <div className="bg-[#d97706]/30 rounded-lg p-3 text-center border border-[#d97706]/30">
                  <p className="text-2xl font-bold text-[#d97706]">{project.thirdPlace}</p>
                  <p className="text-xs text-muted-foreground mt-1">🥉 3°</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projectStats.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">Aún no hay votos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}

