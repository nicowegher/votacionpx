"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, LogIn } from "lucide-react"

interface LoginScreenProps {
  onLogin: (email: string) => void
  onBack: () => void
}

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Lista de correos permitidos específicos (usuarios finales)
  const ALLOWED_EMAILS = [
    "camigd2901@gmail.com",
    "socuerdo@gmail.com",
    "pablomartino94@gmail.com",
  ]

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return false
    }
    const emailLower = email.toLowerCase()
    // Permitir correos específicos o dominios permitidos
    return (
      ALLOWED_EMAILS.includes(emailLower) ||
      emailLower.endsWith("@pxsol.com") ||
      emailLower.endsWith("@racimo.tech")
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("El correo es requerido")
      return
    } else if (!validateEmail(email)) {
      setError("Correo no autorizado. Usa un correo con dominio @pxsol.com, @racimo.tech o un correo permitido")
      return
    }

    setError(null)
    onLogin(email.trim().toLowerCase())
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs">Volver</span>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Identifícate</h1>
          <p className="text-muted-foreground text-sm">Ingresa tu correo para registrar tu voto</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground font-medium text-sm">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@pxsol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 pl-10 text-sm ${error ? "border-destructive" : ""}`}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full h-11 text-sm bg-primary hover:bg-primary/90 mt-4">
            <LogIn className="w-4 h-4 mr-2" />
            Continuar
          </Button>
        </form>

        {/* Info */}
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Usamos tu correo para asegurar que cada persona vote una sola vez
        </p>
      </div>
    </div>
  )
}
