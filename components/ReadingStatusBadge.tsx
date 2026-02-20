'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReadingStatus } from '@/types'

interface Props {
  status: ReadingStatus
  onChange: (newStatus: ReadingStatus) => void
  disabled?: boolean
}

const statusCycle: Record<ReadingStatus, ReadingStatus> = {
  pending: 'reading',
  reading: 'read',
  read: 'pending',
}

export default function ReadingStatusBadge({ status, onChange, disabled }: Props) {
  const { t } = useTranslation()

  const colors = {
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    reading: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    read: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      onChange(statusCycle[status])
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${colors[status]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
    >
      {t(`readingStatus.${status}`)}
    </button>
  )
}
