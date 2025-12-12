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

  const handleLogin = (email: string) => {
    if (isAdmin(email)) {
      const adminUser: UserData = { email, hasVoted: false }
      setUser(adminUser)
      localStorage.setItem("pxsol_week_user", JSON.stringify(adminUser))
      setScreen("admin")
      return
    }

    const existingUsers = JSON.parse(localStorage.getItem("pxsol_week_voters") || "[]")
    const existingUser = existingUsers.find((u: UserData) => u.email.toLowerCase() === email.toLowerCase())

    if (existingUser && existingUser.hasVoted) {
      setUser(existingUser)
      setFinalRanking(existingUser.ranking || [])
      setTimeExpired(existingUser.timeExpired || false)
      localStorage.setItem("pxsol_week_user", JSON.stringify(existingUser))
      setScreen("thankyou")
    } else {
      const newUser: UserData = { email, hasVoted: false }
      setUser(newUser)
      localStorage.setItem("pxsol_week_user", JSON.stringify(newUser))
      setScreen("voting")
    }
  }

  const handleVoteSubmitted = (ranking: string[], wasTimeExpired = false) => {
    if (!user) return

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

    const existingUsers = JSON.parse(localStorage.getItem("pxsol_week_voters") || "[]")
    const userIndex = existingUsers.findIndex((u: UserData) => u.email.toLowerCase() === user.email.toLowerCase())
    if (userIndex >= 0) {
      existingUsers[userIndex] = updatedUser
    } else {
      existingUsers.push(updatedUser)
    }
    localStorage.setItem("pxsol_week_voters", JSON.stringify(existingUsers))

    setScreen("thankyou")
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
