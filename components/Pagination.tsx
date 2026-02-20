'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { PaginationProps } from '@/types'

export default function Pagination({ currentPage, totalPages, onPrev, onNext }: PaginationProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-4 justify-center mt-8">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label={t('common.previous')}
      >
        {t('common.previous')}
      </Button>
      <span className="text-slate-300">{currentPage} / {totalPages}</span>
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label={t('common.next')}
      >
        {t('common.next')}
      </Button>
    </div>
  )
}
