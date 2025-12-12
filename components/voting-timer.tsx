"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface VotingTimerProps {
  endTime: Date
  onTimeUp?: () => void
}

export function VotingTimer({ endTime, onTimeUp }: VotingTimerProps) {
  const calculateTimeLeft = useCallback(() => {
    const difference = endTime.getTime() - new Date().getTime()
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [endTime])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      const totalSeconds = newTimeLeft.hours * 3600 + newTimeLeft.minutes * 60 + newTimeLeft.seconds
      setIsUrgent(totalSeconds > 0 && totalSeconds <= 30)

      if (totalSeconds <= 0) {
        clearInterval(timer)
        onTimeUp?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onTimeUp, calculateTimeLeft])

  const formatNumber = (num: number) => num.toString().padStart(2, "0")
  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Tiempo agotado</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
        isUrgent ? "bg-destructive/10" : "bg-muted"
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`text-sm font-mono font-medium ${isUrgent ? "text-destructive" : "text-foreground"}`}>
        {formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </span>
      {isUrgent && <span className="text-xs text-destructive">Apúrate</span>}
    </div>
  )
}
