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
      className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden"
    >
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
