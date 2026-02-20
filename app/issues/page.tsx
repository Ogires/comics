'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertCircle } from 'lucide-react'
import IssueSearchCard from '@/components/IssueSearchCard'
import Pagination from '@/components/Pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { searchIssues } from '@/lib/api'
import type { IssueSummary } from '@/types'

const PAGE_SIZE = 20

export default function IssuesPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [issues, setIssues] = useState<IssueSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentPageRef = useRef(page)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      currentPageRef.current = 1
      if (query.trim()) {
        doSearch(query, 1)
      } else {
        setIssues([])
        setTotal(0)
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    if (currentPageRef.current !== page) {
      currentPageRef.current = page
      if (query.trim()) {
        doSearch(query, page)
      }
    }
  }, [page])

  async function doSearch(q: string, p: number) {
    setLoading(true)
    setError('')
    try {
      const offset = (p - 1) * PAGE_SIZE
      const data = await searchIssues(q, PAGE_SIZE, offset)
      setIssues(data.results ?? [])
      setTotal(data.total_results ?? 0)
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <h1 className="text-3xl font-bold gradient-text-accent mb-6">{t('issues.title')}</h1>

      <div className="relative max-w-xl mb-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-foreground transition-colors duration-200" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('issues.placeholder')}
            aria-label={t('issues.placeholder')}
            className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-6 min-h-[24px]">
        {!loading && total > 0 && (
          <p className="text-sm text-muted-foreground font-mono animate-fade-in" role="status" aria-live="polite">
            {t('common.results', { count: total })}
          </p>
        )}
        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500/60 border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">{t('issues.searching')}</p>
          </div>
        )}
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!loading && !error && issues.length === 0 && query.trim().length === 0 ? (
        <p className="text-muted-foreground">{t('issues.noQuery')}</p>
      ) : null}
      {!loading && !error && issues.length === 0 && query.trim().length > 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('common.noResults')}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {issues.map((issue, i) => (
          <div
            key={issue.id}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
          >
            <IssueSearchCard issue={issue} />
          </div>
        ))}
      </div>

      {totalPages > 1 && query.trim().length > 0 ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      ) : null}
    </div>
  )
}
