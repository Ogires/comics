'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { addItemToCollection, removeItemFromCollection, createCollection, getUserCollections } from '@/lib/collections'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
  issueId: number
  issueTitle: string
  issueThumbnail: string
}

export default function AddToCollectionModal({ userId, issueId, issueTitle, issueThumbnail }: Props) {
  const { t } = useTranslation()
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  
  const [newColName, setNewColName] = useState('')
  const [creating, setCreating] = useState(false)

  const supabase = createClient()

  const fetchCollections = async () => {
    setLoading(true)
    const { data } = await getUserCollections(supabase, userId)
    setCollections(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  const isIssueInCollection = (collection: any) => {
    return collection.collection_items?.some((item: any) => item.issue_id === issueId)
  }

  const handleToggle = async (collection: any) => {
    const inCollection = isIssueInCollection(collection)
    
    // optimistically update UI
    setCollections(cols => cols.map(c => {
      if (c.id === collection.id) {
        if (inCollection) {
          return { ...c, collection_items: c.collection_items.filter((i: any) => i.issue_id !== issueId) }
        } else {
          return { ...c, collection_items: [...c.collection_items, { issue_id: issueId }] }
        }
      }
      return c
    }))

    if (inCollection) {
      const item = collection.collection_items.find((i: any) => i.issue_id === issueId)
      if (item?.id) {
        await removeItemFromCollection(supabase, item.id)
      }
    } else {
      await addItemToCollection(supabase, collection.id, {
        issue_id: issueId,
        issue_title: issueTitle,
        issue_thumbnail: issueThumbnail
      })
    }
    
    // Refresh to get real IDs
    fetchCollections()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return
    setCreating(true)
    const { data, error } = await createCollection(supabase, userId, newColName)
    if (!error && data) {
      setNewColName('')
      // Immediately add the issue to the new collection
      await addItemToCollection(supabase, data.id, {
        issue_id: issueId,
        issue_title: issueTitle,
        issue_thumbnail: issueThumbnail
      })
      await fetchCollections()
    }
    setCreating(false)
  }

  return (
    <div className="relative">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {t('collections.addTo')}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-card border rounded-md shadow-lg z-50 p-4 max-h-[80vh] flex flex-col">
            <h3 className="font-semibold mb-3">{t('collections.title')}</h3>
            
            <div className="flex-1 overflow-y-auto space-y-1 mb-4 min-h-20">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('common.loading')}</p>
              ) : collections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('collections.empty')}</p>
              ) : (
                collections.map(col => {
                  const inCol = isIssueInCollection(col)
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggle(col)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted flex justify-between items-center group"
                    >
                      <span className="truncate pr-2">{col.name}</span>
                      {inCol && <span className="text-primary text-lg leading-none">✓</span>}
                      {!inCol && <span className="opacity-0 group-hover:opacity-100 text-muted-foreground text-lg leading-none">+</span>}
                    </button>
                  )
                })
              )}
            </div>

            <form onSubmit={handleCreate} className="border-t pt-3 mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder={t('collections.new')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={100}
                />
                <Button 
                  type="submit" 
                  disabled={creating || !newColName.trim()} 
                  size="sm"
                >
                  {creating ? '...' : '+'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
