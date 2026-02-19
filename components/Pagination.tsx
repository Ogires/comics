'use client'

import { useTranslation } from 'react-i18next'
import type { PaginationProps } from '@/types'

export default function Pagination({ currentPage, totalPages, onPrev, onNext }: PaginationProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-4 justify-center mt-8">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="px-4 py-2 bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600"
      >
        {t('common.previous')}
      </button>
      <span className="text-slate-300">{currentPage} / {totalPages}</span>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600"
      >
        {t('common.next')}
      </button>
    </div>
  )
}
