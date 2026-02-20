'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  owned: boolean
  onChange: (newOwned: boolean) => void
  disabled?: boolean
}

export default function OwnedBadge({ owned, onChange, disabled }: Props) {
  const { t } = useTranslation()

  const colors = {
    owned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    notOwned: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      onChange(!owned)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${owned ? colors.owned : colors.notOwned} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
    >
      {owned ? '✓ ' : ''}{t(owned ? 'ownershipStatus.owned' : 'ownershipStatus.notOwned')}
    </button>
  )
}
