'use client'

import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationProps } from '@/types'

export default function Pagination({ currentPage, totalPages, onPrev, onNext }: PaginationProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label={t('common.previous')}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-white/[0.03] text-foreground hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
      >
        <ChevronLeft className="size-3.5" />
        {t('common.previous')}
      </button>
      <span className="text-sm text-muted-foreground font-mono tabular-nums min-w-[4rem] text-center">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label={t('common.next')}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-white/[0.03] text-foreground hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
      >
        {t('common.next')}
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  )
}
