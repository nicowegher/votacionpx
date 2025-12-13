"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Mail, Loader2, AlertCircle } from "lucide-react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

interface LoginScreenProps {
  onLogin: (email: string, userId: string) => void
  onBack: () => void
}

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Lista de correos permitidos específicos (usuarios finales)
  const ALLOWED_EMAILS = [
    "nicolas.wegher@gmail.com",
    "camigd2901@gmail.com",
    "socuerdo@gmail.com",
    "pablomartino94@gmail.com",
    "digitalhotelero@gmail.com",
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

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase no está inicializado")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      if (!user.email) {
        throw new Error("No se pudo obtener el email del usuario")
      }

      const emailLower = user.email.toLowerCase()
      if (!validateEmail(emailLower)) {
        await auth.signOut()
        setError("Correo no autorizado. Usa un correo con dominio @pxsol.com o un correo permitido")
        setLoading(false)
        return
      }

      onLogin(emailLower, user.uid)
    } catch (error: any) {
      console.error("Error en Google Sign-In:", error)
      if (error.code === "auth/popup-closed-by-user") {
        setError("Inicio de sesión cancelado")
      } else {
        setError(error.message || "Error al iniciar sesión con Google")
      }
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Identifícate
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresa tus credenciales para registrar tu voto
          </p>
        </div>

        {/* Google Sign-In Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-11 text-sm mb-4"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continuar con Google Workspace
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Acceso no autorizado</AlertTitle>
            <AlertDescription className="text-sm mt-1">{error}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Inicia sesión con tu cuenta de @pxsol.com
        </p>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Usamos tu correo para asegurar que cada persona vote una sola vez
        </p>
      </div>
    </div>
  )
}
