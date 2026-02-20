'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CollectionWithProgress } from '@/types'
import CollectionCard from '@/components/CollectionCard'
import CreateCollectionForm from './CreateCollectionForm'
import { Button } from '@/components/ui/button'

interface Props {
  collections: CollectionWithProgress[]
  userId: string
}

export default function CollectionsList({ collections, userId }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const handleCreated = () => {
    setShowForm(false)
    router.refresh()
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8 px-4">
      <div className="flex justify-between items-center bg-card p-6 border rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{t('collections.title')}</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            {t('collections.create')}
          </Button>
        )}
      </div>

      {showForm && (
        <CreateCollectionForm
          userId={userId}
          onSuccess={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-lg bg-card/50 text-muted-foreground min-h-[300px]">
          <svg className="w-16 h-16 mb-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">{t('collections.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  )
}
