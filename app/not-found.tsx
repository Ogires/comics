'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center mt-24 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">{t('notFound.title')}</h1>
      <p className="text-slate-300 mb-8">{t('notFound.description')}</p>
      <Button asChild>
        <Link href="/">{t('notFound.backHome')}</Link>
      </Button>
    </div>
  )
}
