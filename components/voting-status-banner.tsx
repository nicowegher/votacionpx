"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"
import { subscribeToVotingConfig, type VotingConfig } from "@/lib/firebase/firestore"

export function VotingStatusBanner() {
  const [votingConfig, setVotingConfig] = useState<VotingConfig | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToVotingConfig((config) => {
      setVotingConfig(config)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  if (!votingConfig) {
    return null
  }

  const isClosed = votingConfig.status === "closed"

  return (
    <Alert
      className={`mb-4 ${
        isClosed
          ? "bg-amber-500/10 border-amber-500/20 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
          : "bg-green-500/10 border-green-500/20 [&>svg]:text-green-600 dark:[&>svg]:text-green-400"
      }`}
    >
      {isClosed ? (
        <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      )}
      <AlertTitle
        className={`font-semibold ${
          isClosed
            ? "text-amber-600 dark:text-amber-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {isClosed ? "Votación Cerrada" : "Votación Abierta"}
      </AlertTitle>
      <AlertDescription
        className={`text-sm mt-1 ${
          isClosed
            ? "text-amber-700 dark:text-amber-300"
            : "text-green-700 dark:text-green-300"
        }`}
      >
        {isClosed
          ? "La votación está cerrada, puedes ver los equipos pero no enviar votos."
          : "La votación está activa. Puedes seleccionar tus equipos favoritos y enviar tu voto."}
      </AlertDescription>
    </Alert>
  )
}
