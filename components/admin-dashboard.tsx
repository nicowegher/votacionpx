"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Home, X, Play, Square, Loader2, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  subscribeToVotes,
  subscribeToVotingConfig,
  updateVotingStatus,
  type Vote,
  type VotingConfig,
} from "@/lib/firebase/firestore"
import { toast } from "sonner"

interface AdminDashboardProps {
  adminEmail: string
  onBackToStart?: () => void
}

interface ProjectStats {
  name: string
  firstPlace: number
  secondPlace: number
  thirdPlace: number
  totalPoints: number
}

export function AdminDashboard({ adminEmail, onBackToStart }: AdminDashboardProps) {
  const router = useRouter()
  const [totalVotes, setTotalVotes] = useState(0)
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showVotersModal, setShowVotersModal] = useState(false)
  const [voters, setVoters] = useState<Vote[]>([])
  const [votingConfig, setVotingConfig] = useState<VotingConfig | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const calculateStats = (votes: Vote[]) => {
    const validVotes = votes.filter((v) => v.ranking && v.ranking.length === 3)

    setTotalVotes(validVotes.length)
    setVoters(validVotes)

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
    // Suscribirse a cambios en votos
    const unsubscribeVotes = subscribeToVotes((votes) => {
      calculateStats(votes)
    })

    // Suscribirse a cambios en configuración
    const unsubscribeConfig = subscribeToVotingConfig((config) => {
      setVotingConfig(config)
    })

    return () => {
      unsubscribeVotes()
      unsubscribeConfig()
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Los datos se actualizan automáticamente con los listeners
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleUpdateStatus = async (newStatus: "pending" | "active" | "closed") => {
    try {
      setIsUpdatingStatus(true)
      await updateVotingStatus(newStatus, adminEmail)
      toast.success(
        `Votación ${newStatus === "active" ? "activada" : newStatus === "closed" ? "cerrada" : "pausada"}`
      )
    } catch (error) {
      console.error("Error updating voting status:", error)
      toast.error("Error al actualizar el estado de la votación")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleBackToStart = () => {
    if (confirm("¿Quieres cerrar sesión y volver al inicio? Esto limpiará tu sesión actual.")) {
      if (onBackToStart) {
        onBackToStart()
      } else {
        window.location.reload()
      }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "active":
        return "Activa"
      case "closed":
        return "Cerrada"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "closed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleBackToStart} className="shrink-0 bg-transparent">
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Conectado como: <span className="font-medium text-foreground">{adminEmail}</span>
        </p>

        {/* Estado de Votación */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Estado:</span>
              {votingConfig && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    votingConfig.status
                  )}`}
                >
                  {getStatusLabel(votingConfig.status)}
                </span>
              )}
            </div>
          </div>

          {/* Controles de Estado */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus("pending")}
              disabled={isUpdatingStatus || votingConfig?.status === "pending"}
              className="flex-1"
            >
              {isUpdatingStatus && votingConfig?.status !== "pending" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Pendiente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus("active")}
              disabled={isUpdatingStatus || votingConfig?.status === "active"}
              className="flex-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
            >
              {isUpdatingStatus && votingConfig?.status !== "active" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Activar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus("closed")}
              disabled={isUpdatingStatus || votingConfig?.status === "closed"}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
            >
              {isUpdatingStatus && votingConfig?.status !== "closed" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Cerrar
            </Button>
          </div>

          {/* Botón de Presentación */}
          <div className="mt-3">
            <Button
              onClick={() => router.push("/admin/presentation")}
              size="sm"
              className="w-full bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] hover:text-[#f59e0b]"
            >
              <Presentation className="w-4 h-4 mr-2" />
              Ver Presentación
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Total de Votos</p>
        <button
          onClick={() => setShowVotersModal(true)}
          className="text-4xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          {totalVotes}
        </button>
        <p className="text-xs text-muted-foreground mt-1">(Clic para ver detalle)</p>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Ranking en Tiempo Real</h2>

        {projectStats.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground">Aún no hay votos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectStats.map((project, index) => (
              <div key={project.name} className="bg-card rounded-xl p-4 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                    <h3 className="text-lg font-bold text-foreground">{project.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-primary">{project.totalPoints} pts.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gold/10 rounded-lg p-2 text-center border border-gold/20">
                    <p className="text-xl font-bold text-foreground">{project.firstPlace}</p>
                    <p className="text-xs text-muted-foreground">🥇 1°</p>
                  </div>
                  <div className="bg-silver/10 rounded-lg p-2 text-center border border-silver/20">
                    <p className="text-xl font-bold text-foreground">{project.secondPlace}</p>
                    <p className="text-xs text-muted-foreground">🥈 2°</p>
                  </div>
                  <div className="bg-bronze/10 rounded-lg p-2 text-center border border-bronze/20">
                    <p className="text-xl font-bold text-foreground">{project.thirdPlace}</p>
                    <p className="text-xs text-muted-foreground">🥉 3°</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground text-center">
          Los datos se actualizan automáticamente cada 2 segundos. Los administradores no pueden votar.
        </p>
      </div>

      {showVotersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Usuarios que Votaron</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowVotersModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {voters.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay votos registrados</p>
              ) : (
                <div className="space-y-2">
                  {voters.map((voter, index) => (
                    <div
                      key={voter.userId}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{voter.userEmail}</p>
                        {voter.ranking && (
                          <p className="text-xs text-muted-foreground mt-1">
                            🥇 {voter.ranking[0]} • 🥈 {voter.ranking[1]} • 🥉 {voter.ranking[2]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
