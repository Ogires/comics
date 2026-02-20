import React from 'react'

interface ProgressBarProps {
  value: number
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden"
    >
      <div
        className="h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-orange-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
