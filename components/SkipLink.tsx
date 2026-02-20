'use client'

import { useTranslation } from 'react-i18next'

export default function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:m-2"
    >
      {t('common.skipToContent')}
    </a>
  )
}
