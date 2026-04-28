import React from "react"
import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export const ScoreGauge = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 10, 
  color = "#ff4b3e",
  className 
}: ScoreGaugeProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1s ease-in-out'
          }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 dark:text-white leading-none transition-colors">{percentage}%</span>
      </div>
    </div>
  )
}
