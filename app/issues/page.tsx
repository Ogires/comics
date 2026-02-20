'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import IssueSearchCard from '@/components/IssueSearchCard'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
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
      <h1 className="text-3xl font-bold text-red-500 mb-6">{t('issues.title')}</h1>
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('issues.placeholder')}
        aria-label={t('issues.placeholder')}
        className="max-w-xl bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus-visible:ring-red-500 mb-6"
      />
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <p className="text-slate-300 mb-4" role="status" aria-live="polite">{t('issues.searching')}</p>
      ) : null}
      {!loading && total > 0 ? (
        <p className="text-slate-300 text-sm mb-4" role="status" aria-live="polite">
          {t('common.results', { count: total })}
        </p>
      ) : null}
      {!loading && !error && issues.length === 0 && query.trim().length === 0 ? (
        <p className="text-slate-300">{t('issues.noQuery')}</p>
      ) : null}
      {!loading && !error && issues.length === 0 && query.trim().length > 0 ? (
        <p className="text-slate-300">{t('common.noResults')}</p>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {issues.map((issue) => (
          <IssueSearchCard key={issue.id} issue={issue} />
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
