"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Project } from "./podium-ranker"

interface ProjectCardProps {
  project: Project
  isRanked: boolean
  position: number
  onAssign: (position: number) => void
  onRemove: () => void
  disabled?: boolean
  takenPositions: number[]
}

export function ProjectCard({
  project,
  isRanked,
  position,
  onAssign,
  onRemove,
  disabled,
  takenPositions,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const medals = [
    {
      emoji: "🥇",
      selectedBorder: "ring-2 ring-gold ring-offset-2",
      cardBorder: "border-gold",
    },
    {
      emoji: "🥈",
      selectedBorder: "ring-2 ring-silver ring-offset-2",
      cardBorder: "border-silver",
    },
    {
      emoji: "🥉",
      selectedBorder: "ring-2 ring-bronze ring-offset-2",
      cardBorder: "border-bronze",
    },
  ]

  const handleMedalClick = (pos: number) => {
    if (disabled) return

    if (position === pos) {
      onRemove()
    } else {
      onAssign(pos)
    }
  }

  const getBorderColor = () => {
    if (!isRanked) return "border-border"
    return medals[position]?.cardBorder || "border-border"
  }

  return (
    <div
      className={`relative bg-card rounded-xl border-2 transition-all duration-300 overflow-hidden ${getBorderColor()} ${
        isRanked ? "bg-primary/5" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div className="p-3">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground text-base leading-tight flex-1">{project.name}</h3>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors flex-shrink-0"
            >
              <span>Info</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          {isExpanded && <p className="text-muted-foreground text-xs leading-snug">{project.description}</p>}
        </div>

        <div className="flex gap-3 justify-center">
          {medals.map((medal, pos) => {
            const isSelected = position === pos
            const isTakenByOther = !isSelected && takenPositions.includes(pos)

            return (
              <button
                key={pos}
                onClick={() => handleMedalClick(pos)}
                disabled={disabled || isTakenByOther}
                className={`flex items-center justify-center w-14 h-14 bg-white rounded-lg shadow-md transition-all ${
                  isSelected
                    ? `${medal.selectedBorder}`
                    : isTakenByOther
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:shadow-lg hover:scale-105"
                }`}
              >
                <span className="text-4xl">{medal.emoji}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
