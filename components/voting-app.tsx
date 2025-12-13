"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { LoginScreen } from "./login-screen"
import { PodiumRanker } from "./podium-ranker"
import { ThankYouScreen } from "./thank-you-screen"
import { AdminDashboard } from "./admin-dashboard"
import { isAdmin } from "@/lib/admin"
import { toast } from "sonner"

export type AppScreen = "welcome" | "login" | "voting" | "thankyou" | "admin"

export interface UserData {
  email: string
  hasVoted: boolean
  ranking?: string[]
  timeExpired?: boolean
  userId?: string
}

export function VotingApp() {
  const [screen, setScreen] = useState<AppScreen>("welcome")
  const [finalRanking, setFinalRanking] = useState<string[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [timeExpired, setTimeExpired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("restart") === "true") {
      localStorage.removeItem("pxsol_week_user")
      window.history.replaceState({}, "", window.location.pathname)
      return
    }

    const savedUser = localStorage.getItem("pxsol_week_user")
    if (savedUser) {
      const userData: UserData = JSON.parse(savedUser)
      setUser(userData)
      if (isAdmin(userData.email)) {
        setScreen("admin")
      }
      // No confiar en localStorage para hasVoted - siempre verificar con Firestore en handleLogin
    }
  }, [])

  const handleStartVoting = () => {
    setScreen("login")
  }

  const handleLogin = async (email: string, userId: string) => {
    if (isAdmin(email)) {
      const adminUser: UserData = { email, hasVoted: false, userId }
      setUser(adminUser)
      localStorage.setItem("pxsol_week_user", JSON.stringify(adminUser))
      setScreen("admin")
      return
    }

    // Verificar si el usuario ya votó en Firestore
    try {
      const { getUserVote, getVotingConfig } = await import("@/lib/firebase/firestore")
      const existingVote = await getUserVote(userId)
      
      // Verificar inconsistencia: si localStorage dice que votó pero Firestore no tiene voto
      const savedUser = localStorage.getItem("pxsol_week_user")
      if (savedUser) {
        const savedUserData: UserData = JSON.parse(savedUser)
        if (savedUserData.hasVoted && !existingVote) {
          // Inconsistencia detectada: limpiar localStorage
          console.warn("Inconsistencia detectada: localStorage indica que el usuario votó, pero Firestore no tiene voto. Limpiando cache local.")
          localStorage.removeItem("pxsol_week_user")
        }
      }
      
      const votingConfig = await getVotingConfig()

      // Verificar si la votación está cerrada
      if (votingConfig?.status === "closed") {
        if (existingVote) {
          // Si ya votó, mostrar pantalla de agradecimiento
          const userData: UserData = {
            email,
            hasVoted: true,
            ranking: existingVote.ranking,
            timeExpired: existingVote.timeExpired,
            userId,
          }
          setUser(userData)
          setFinalRanking(existingVote.ranking)
          setTimeExpired(existingVote.timeExpired)
          localStorage.setItem("pxsol_week_user", JSON.stringify(userData))
          setScreen("thankyou")
        } else {
          // Si no votó y la votación está cerrada, permitir ver equipos pero no votar
          const newUser: UserData = { email, hasVoted: false, userId }
          setUser(newUser)
          localStorage.setItem("pxsol_week_user", JSON.stringify(newUser))
          setScreen("voting")
        }
        return
      }

      if (existingVote) {
        const userData: UserData = {
          email,
          hasVoted: true,
          ranking: existingVote.ranking,
          timeExpired: existingVote.timeExpired,
          userId,
        }
        setUser(userData)
        setFinalRanking(existingVote.ranking)
        setTimeExpired(existingVote.timeExpired)
        localStorage.setItem("pxsol_week_user", JSON.stringify(userData))
        setScreen("thankyou")
      } else {
        const newUser: UserData = { email, hasVoted: false, userId }
        setUser(newUser)
        localStorage.setItem("pxsol_week_user", JSON.stringify(newUser))
        setScreen("voting")
      }
    } catch (error) {
      console.error("Error verificando voto:", error)
      // Si hay error, limpiar localStorage para evitar inconsistencias
      localStorage.removeItem("pxsol_week_user")
      // Continuar con el flujo normal
      const newUser: UserData = { email, hasVoted: false, userId }
      setUser(newUser)
      localStorage.setItem("pxsol_week_user", JSON.stringify(newUser))
      setScreen("voting")
    }
  }

  const handleVoteSubmitted = async (ranking: string[], wasTimeExpired = false) => {
    if (!user || !user.userId) return

    // Prevenir múltiples envíos simultáneos
    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      // #region agent log
      const { auth } = await import("@/lib/firebase/config")
      const currentAuthUser = auth?.currentUser
      fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voting-app.tsx:124',message:'handleVoteSubmitted entry',data:{userUserId:user.userId,userEmail:user.email,currentAuthUid:currentAuthUser?.uid,currentAuthEmail:currentAuthUser?.email,isAuthenticated:!!currentAuthUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion

      // Verificar primero si la votación está cerrada
      const { getVotingConfig, saveVote, getUserVote } = await import("@/lib/firebase/firestore")
      const { Timestamp } = await import("firebase/firestore")
      
      const votingConfig = await getVotingConfig()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voting-app.tsx:133',message:'votingConfig check',data:{votingConfigStatus:votingConfig?.status,isClosed:votingConfig?.status==='closed'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (votingConfig?.status === "closed") {
        toast.error("La votación está cerrada. No se pueden enviar más votos.")
        return
      }
      
      // VERIFICAR SI EL USUARIO YA VOTÓ ANTES DE INTENTAR GUARDAR
      const existingVote = await getUserVote(user.userId)
      if (existingVote) {
        toast.error("Ya has votado anteriormente. No puedes votar más de una vez.")
        const userData: UserData = {
          ...user,
          hasVoted: true,
          ranking: existingVote.ranking,
          timeExpired: existingVote.timeExpired,
        }
        setUser(userData)
        setFinalRanking(existingVote.ranking)
        setTimeExpired(existingVote.timeExpired)
        localStorage.setItem("pxsol_week_user", JSON.stringify(userData))
        setScreen("thankyou")
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voting-app.tsx:139',message:'before saveVote call',data:{voteUserId:user.userId,voteUserEmail:user.email,rankingLength:ranking.length,currentAuthUid:auth?.currentUser?.uid,userIdMatch:user.userId===auth?.currentUser?.uid,emailMatch:user.email===auth?.currentUser?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,E'})}).catch(()=>{});
      // #endregion
      // Guardar voto en Firestore
      await saveVote({
        userId: user.userId,
        userEmail: user.email,
        ranking,
        timeExpired: wasTimeExpired,
        voteStartTime: Timestamp.now(), // Podrías guardar el tiempo real de inicio si lo tienes
      })

      const updatedUser: UserData = {
        ...user,
        hasVoted: true,
        ranking,
        timeExpired: wasTimeExpired,
      }
      setUser(updatedUser)
      setFinalRanking(ranking)
      setTimeExpired(wasTimeExpired)
      localStorage.setItem("pxsol_week_user", JSON.stringify(updatedUser))

      setScreen("thankyou")
    } catch (error: any) {
      // #region agent log
      const { auth } = await import("@/lib/firebase/config")
      fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voting-app.tsx:171',message:'handleVoteSubmitted error',data:{errorCode:error?.code,errorMessage:error?.message,errorName:error?.name,userUserId:user?.userId,userEmail:user?.email,currentAuthUid:auth?.currentUser?.uid,currentAuthEmail:auth?.currentUser?.email,isAuthenticated:!!auth?.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      console.error("Error guardando voto:", error)
      
      // Manejar diferentes tipos de errores
      if (error?.code === "invalid-email") {
        toast.error("Tu email no está autorizado para votar.")
        return
      }
      
      if (error?.code === "already-voted") {
        toast.error("Ya has votado anteriormente. No puedes votar más de una vez.")
        try {
          const { getUserVote } = await import("@/lib/firebase/firestore")
          const existingVote = await getUserVote(user!.userId!)
          if (existingVote) {
            const userData: UserData = {
              ...user!,
              hasVoted: true,
              ranking: existingVote.ranking,
              timeExpired: existingVote.timeExpired,
            }
            setUser(userData)
            setFinalRanking(existingVote.ranking)
            setTimeExpired(existingVote.timeExpired)
            localStorage.setItem("pxsol_week_user", JSON.stringify(userData))
            setScreen("thankyou")
          }
        } catch (fetchError) {
          console.error("Error obteniendo voto existente:", fetchError)
        }
        return
      }
      
      if (error?.code === "permission-denied") {
        try {
          const { getVotingConfig } = await import("@/lib/firebase/firestore")
          const votingConfig = await getVotingConfig()
          
          // Si la votación está cerrada, mostrar mensaje específico
          if (votingConfig?.status === "closed") {
            toast.error("La votación está cerrada. No se pueden enviar más votos.")
            return
          }
          
          // Si la votación está abierta pero hay error de permisos, es otro problema
          toast.error("Error al guardar tu voto. Por favor intenta nuevamente.")
          return
        } catch (configError) {
          // Si no podemos verificar el estado, mostrar mensaje genérico
          toast.error("Error al guardar tu voto. Por favor intenta nuevamente.")
          return
        }
      }
      
      // Para otros errores que no sean de permisos
      toast.error("Error al guardar tu voto. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoteAgain = () => {
    setScreen("voting")
  }

  const handleBack = () => {
    switch (screen) {
      case "login":
        setScreen("welcome")
        break
      case "voting":
        setScreen("login")
        break
      case "thankyou":
        setScreen("voting")
        break
      default:
        setScreen("welcome")
    }
  }

  const handleBackToStart = () => {
    setScreen("welcome")
    setUser(null)
    setFinalRanking([])
    setTimeExpired(false)
  }

  if (screen === "welcome") {
    return <WelcomeScreen onStart={handleStartVoting} />
  }

  if (screen === "login") {
    return <LoginScreen onLogin={handleLogin} onBack={handleBack} />
  }

  if (screen === "admin") {
    return <AdminDashboard adminEmail={user?.email || ""} onBackToStart={handleBackToStart} />
  }

  if (screen === "thankyou") {
    return <ThankYouScreen ranking={finalRanking} timeExpired={timeExpired} />
  }

  return <PodiumRanker onVoteSubmitted={handleVoteSubmitted} onBack={handleBack} />
}
