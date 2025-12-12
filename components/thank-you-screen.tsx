"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { CheckCircle2, Clock, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVotingConfig, type VotingConfig } from "@/lib/firestore/voting-config"

interface ThankYouScreenProps {
  ranking: string[]
  timeExpired: boolean
}

export function ThankYouScreen({ ranking, timeExpired }: ThankYouScreenProps) {
  const router = useRouter()
  const [votingConfig, setVotingConfig] = useState<VotingConfig | null>(null)

  useEffect(() => {
    if (!timeExpired) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#ef4444", "#000000", "#ffffff", "#fbbf24", "#d1d5db", "#f97316"],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#ef4444", "#000000", "#ffffff", "#fbbf24", "#d1d5db", "#f97316"],
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [timeExpired])

  useEffect(() => {
    // Verificar el estado de votación periódicamente
    const checkVotingStatus = async () => {
      try {
        const config = await getVotingConfig()
        setVotingConfig(config)
      } catch (error) {
        console.error("Error checking voting status:", error)
        // Si hay error, asumir que la votación no está cerrada
        setVotingConfig(null)
      }
    }

    // Verificar inmediatamente
    checkVotingStatus()

    // Verificar cada 3 segundos para actualizar el estado
    const interval = setInterval(checkVotingStatus, 3000)

    return () => clearInterval(interval)
  }, [])

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇"
    if (position === 1) return "🥈"
    return "🥉"
  }

  const isVotingClosed = votingConfig?.status === "closed"

  const handleViewResults = () => {
    if (isVotingClosed) {
      router.push("/admin/presentation")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className={`${timeExpired ? "bg-orange-500/10" : "bg-green-500/10"} rounded-full p-4 inline-flex`}>
              {timeExpired ? (
                <Clock className="w-12 h-12 text-orange-500" />
              ) : (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold">{timeExpired ? "Tiempo agotado" : "¡Gracias por votar!"}</h1>
          <p className="text-sm text-muted-foreground">
            {timeExpired
              ? "El tiempo se agotó, pero tu voto fue registrado."
              : "Tu voto ha sido registrado correctamente"}
          </p>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border space-y-3">
          <h2 className="font-semibold text-center text-sm text-muted-foreground">Tu Ranking</h2>
          <div className="space-y-2">
            {ranking.map((projectName, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                <span className="font-medium text-sm">{projectName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleViewResults}
            disabled={!isVotingClosed}
            className="w-full bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] hover:text-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Presentation className="w-4 h-4 mr-2" />
            Ver Resultados
          </Button>
          {!isVotingClosed && (
            <p className="text-xs text-center text-muted-foreground">
              Los resultados estarán disponibles cuando la votación haya cerrado
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">Concurso IA - Pxsol 2025</p>
      </div>
    </div>
  )
}
