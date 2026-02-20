'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { CollectionWithProgress, CollectionItem, ReadingStatus } from '@/types'
import { updateReadingStatus, updateOwnedStatus, removeItemFromCollection, deleteCollection } from '@/lib/collections'
import ProgressBar from '@/components/ProgressBar'
import ReadingStatusBadge from '@/components/ReadingStatusBadge'
import OwnedBadge from '@/components/OwnedBadge'
import AddIssueSearch from '@/components/AddIssueSearch'
import { Button } from '@/components/ui/button'

interface Props {
  collection: CollectionWithProgress
}

export default function CollectionDetail({ collection: initialCollection }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const [collection, setCollection] = useState(initialCollection)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const handleStatusChange = async (itemId: string, newStatus: ReadingStatus) => {
    setCollection(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === itemId ? { ...item, reading_status: newStatus } : item
      )
      return {
        ...prev,
        items: updatedItems,
        read_items: updatedItems.filter(i => i.reading_status === 'read').length,
      }
    })

    const { error } = await updateReadingStatus(supabase, itemId, newStatus)
    if (error) {
      console.error('Failed to update status', error)
      setCollection(prev => {
        const revertedItems = prev.items.map(item =>
          item.id === itemId ? { ...item, reading_status: item.reading_status } : item
        )
        return { ...prev, items: revertedItems }
      })
      router.refresh()
    }
  }

  const handleOwnedChange = async (itemId: string, newOwned: boolean) => {
    setCollection(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === itemId ? { ...item, owned: newOwned } : item
      )
      return {
        ...prev,
        items: updatedItems,
        owned_items: updatedItems.filter(i => i.owned).length,
      }
    })

    const { error } = await updateOwnedStatus(supabase, itemId, newOwned)
    if (error) {
      console.error('Failed to update owned status', error)
      router.refresh()
    }
  }

  const handleRemove = async (itemId: string) => {
    // Optimistic remove
    setCollection(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId)
      return {
        ...prev,
        items: updatedItems,
        total_items: updatedItems.length,
        read_items: updatedItems.filter(i => i.reading_status === 'read').length,
        owned_items: updatedItems.filter(i => i.owned).length,
      }
    })

    const { error } = await removeItemFromCollection(supabase, itemId)
    if (error) {
      console.error('Failed to remove item', error)
      router.refresh()
    }
  }

  const handleDeleteCollection = async () => {
    if (confirm(t('collections.deleteConfirm'))) {
      setIsDeleting(true)
      const { error } = await deleteCollection(supabase, collection.id)
      if (!error) {
        router.push('/collections')
      } else {
        setIsDeleting(false)
        console.error('Failed to delete collection', error)
      }
    }
  }

  const handleIssueAdded = (issueId: number, title: string, thumbnail: string) => {
    const newItem: CollectionItem = {
      id: `temp-${issueId}`,
      collection_id: collection.id,
      issue_id: issueId,
      issue_title: title,
      issue_thumbnail: thumbnail,
      reading_status: 'pending',
      owned: false,
      added_at: new Date().toISOString(),
    }
    setCollection(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      total_items: prev.total_items + 1,
    }))
    router.refresh()
  }

  const existingIssueIds = useMemo(
    () => collection.items.map((item) => item.issue_id),
    [collection.items]
  )

  const percentage = collection.total_items > 0
    ? Math.round((collection.read_items / collection.total_items) * 100)
    : 0

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 border rounded-lg shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
          {collection.description ? (
            <p className="text-muted-foreground">{collection.description}</p>
          ) : null}
          <div className="text-sm font-medium pt-2">
            {t('collections.issuesCount', { count: collection.total_items })}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDeleteCollection}
            disabled={isDeleting}
          >
            {isDeleting ? t('common.loading') : t('collections.delete')}
          </Button>
        </div>
      </div>

      <div className="bg-card p-6 border rounded-lg shadow-sm space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">{t('collections.addIssue')}</h2>
        <AddIssueSearch
          collectionId={collection.id}
          existingIssueIds={existingIssueIds}
          onIssueAdded={handleIssueAdded}
        />
      </div>

      <div className="bg-card p-6 border rounded-lg shadow-sm space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('collections.progress', { read: collection.read_items, total: collection.total_items })}</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <ProgressBar value={percentage} />
      </div>

      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-lg bg-card/50 text-muted-foreground min-h-[300px]">
          <p className="text-lg mb-4">{t('collections.noIssues')}</p>
          <Link href="/">
            <Button>{t('nav.home')}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card relative group">
              <Link href={`/issue/${item.issue_id}`} className="shrink-0">
                <div className="w-20 h-32 bg-muted rounded overflow-hidden relative shadow-sm hover:opacity-80 transition-opacity">
                  {item.issue_thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.issue_thumbnail}
                      alt={item.issue_title || 'Comic cover'}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
              </Link>
              <div className="flex flex-col flex-1 min-w-0 py-1 space-y-3">
                <Link href={`/issue/${item.issue_id}`} className="hover:underline line-clamp-2 text-sm font-medium">
                  {item.issue_title || `Issue #${item.issue_id}`}
                </Link>
                <div className="flex flex-wrap gap-2">
                  <ReadingStatusBadge
                    status={item.reading_status}
                    onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                  />
                  <OwnedBadge
                    owned={item.owned}
                    onChange={(newOwned) => handleOwnedChange(item.id, newOwned)}
                  />
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-destructive hover:underline hidden group-hover:block group-focus-within:block"
                  >
                    {t('collections.removeFrom')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
