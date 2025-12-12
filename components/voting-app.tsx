"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { LoginScreen } from "./login-screen"
import { PodiumRanker } from "./podium-ranker"
import { ThankYouScreen } from "./thank-you-screen"
import { AdminDashboard } from "./admin-dashboard"
import { isAdmin } from "@/lib/admin"

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
      } else if (userData.hasVoted && userData.ranking) {
        setFinalRanking(userData.ranking)
        setTimeExpired(userData.timeExpired || false)
        setScreen("thankyou")
      }
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
      const { getUserVote } = await import("@/lib/firebase/firestore")
      const existingVote = await getUserVote(userId)

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
      // Si hay error, continuar con el flujo normal
      const newUser: UserData = { email, hasVoted: false, userId }
      setUser(newUser)
      localStorage.setItem("pxsol_week_user", JSON.stringify(newUser))
      setScreen("voting")
    }
  }

  const handleVoteSubmitted = async (ranking: string[], wasTimeExpired = false) => {
    if (!user || !user.userId) return

    try {
      // Guardar voto en Firestore
      const { saveVote } = await import("@/lib/firebase/firestore")
      const { Timestamp } = await import("firebase/firestore")
      
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
    } catch (error) {
      console.error("Error guardando voto:", error)
      // Aún así mostrar la pantalla de agradecimiento
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
