'use client'

import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function CharacterError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="max-w-md mx-auto mt-16">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>{t('character.error')}</AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4">
        {t('common.retry')}
      </Button>
    </div>
  )
}
