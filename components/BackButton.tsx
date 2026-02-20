'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="gap-1"
    >
      <ArrowLeft className="size-4" />
      {t('common.back')}
    </Button>
  )
}
