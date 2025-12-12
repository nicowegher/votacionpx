"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Vote } from "lucide-react"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4">
      {/* Logo / Branding */}
      <div className="mb-3 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">Concurso IA</h1>
        <p className="text-sm text-primary font-medium">Votación de Proyectos 2025</p>
      </div>

      <div className="max-w-sm text-center mb-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Ordena los 3 proyectos finalistas en un podio según tu preferencia.
        </p>
      </div>

      {/* Features */}
      <div className="w-full max-w-sm space-y-1.5 mb-4">
        <FeatureItem number="1" text="Revisa los proyectos finalistas" />
        <FeatureItem number="2" text="Asigna posiciones: 1°, 2° y 3° lugar" />
        <FeatureItem number="3" text="Confirma tu voto antes del cierre" />
      </div>

      {/* CTA */}
      <Button onClick={onStart} size="lg" className="w-full max-w-sm h-11 text-sm bg-primary hover:bg-primary/90">
        <Vote className="w-4 h-4 mr-2" />
        Comenzar a Votar
      </Button>
    </div>
  )
}

function FeatureItem({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{number}</span>
      </div>
      <span className="text-foreground text-xs">{text}</span>
    </div>
  )
}
