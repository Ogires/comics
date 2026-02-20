'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addItemToCollection } from '@/lib/collections'
import { searchIssues } from '@/lib/api'
import type { IssueSummary } from '@/types'

interface Props {
  collectionId: string
  existingIssueIds: number[]
  onIssueAdded: (issueId: number, title: string, thumbnail: string) => void
}

export default function AddIssueSearch({ collectionId, existingIssueIds, onIssueAdded }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IssueSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const supabase = useMemo(() => createClient(), [])
  const existingSet = useMemo(() => new Set(existingIssueIds), [existingIssueIds])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setShowPanel(false)
      return
    }
    let cancelled = false
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchIssues(query, 10, 0)
        if (!cancelled) {
          setResults(data.results ?? [])
          setShowPanel(true)
        }
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 400)
    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isInCollection = useCallback(
    (issueId: number) => existingSet.has(issueId) || addedIds.has(issueId),
    [existingSet, addedIds]
  )

  const handleAdd = async (issue: IssueSummary) => {
    if (isInCollection(issue.id) || addingIds.has(issue.id)) return

    const title = issue.name || `#${issue.issue_number}`
    const thumbnail = issue.image?.medium_url || ''

    // Optimistic update + lock
    setAddingIds((prev) => new Set(prev).add(issue.id))
    setAddedIds((prev) => new Set(prev).add(issue.id))

    const { error } = await addItemToCollection(supabase, collectionId, {
      issue_id: issue.id,
      issue_title: title,
      issue_thumbnail: thumbnail,
    })

    setAddingIds((prev) => {
      const next = new Set(prev)
      next.delete(issue.id)
      return next
    })

    if (error) {
      setAddedIds((prev) => {
        const next = new Set(prev)
        next.delete(issue.id)
        return next
      })
    } else {
      onIssueAdded(issue.id, title, thumbnail)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPanel || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          const issue = results[activeIndex]
          if (!isInCollection(issue.id)) handleAdd(issue)
        }
        break
      case 'Escape':
        setShowPanel(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1) }}
        onFocus={() => { if (results.length > 0) setShowPanel(true) }}
        onKeyDown={handleKeyDown}
        placeholder={t('collections.searchIssues')}
        aria-label={t('collections.searchIssues')}
        aria-expanded={showPanel}
        aria-controls="issue-search-listbox"
        role="combobox"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `issue-option-${results[activeIndex]?.id}` : undefined}
        className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus-visible:ring-red-500"
      />
      {showPanel ? (
        <div
          id="issue-search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
        >
          {loading ? (
            <p className="p-3 text-sm text-slate-400" role="status">{t('issues.searching')}</p>
          ) : null}
          {!loading && results.length === 0 && query.trim() ? (
            <p className="p-3 text-sm text-slate-400">{t('common.noResults')}</p>
          ) : null}
          {results.map((issue, index) => {
            const title = issue.name || `#${issue.issue_number}`
            const alreadyIn = isInCollection(issue.id)
            return (
              <div
                key={issue.id}
                id={`issue-option-${issue.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex items-center gap-3 p-2 hover:bg-slate-700/50 border-b border-slate-700 last:border-0 ${index === activeIndex ? 'bg-slate-700/50' : ''}`}
              >
                <div className="w-10 h-14 shrink-0 bg-slate-700 rounded overflow-hidden">
                  {issue.image?.medium_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.image.medium_url}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-100 truncate">{title}</p>
                  {issue.volume?.name ? (
                    <p className="text-xs text-slate-400 truncate">{issue.volume.name}</p>
                  ) : null}
                </div>
                {alreadyIn ? (
                  <>
                    <Check className="size-4 text-green-400 shrink-0" aria-hidden="true" />
                    <span className="sr-only">{t('collections.alreadyIn')}</span>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-red-400 hover:text-red-300 hover:bg-slate-700"
                    onClick={() => handleAdd(issue)}
                    disabled={addingIds.has(issue.id)}
                    aria-label={t('collections.addTo')}
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
