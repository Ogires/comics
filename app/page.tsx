'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertCircle } from 'lucide-react'
import CharacterCard from '@/components/CharacterCard'
import Pagination from '@/components/Pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { searchCharacters } from '@/lib/api'
import type { CharacterSummary } from '@/types'

const PAGE_SIZE = 20

export default function HomePage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
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
      doSearch(query, 1)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    if (currentPageRef.current !== page) {
      currentPageRef.current = page
      doSearch(query, page)
    }
  }, [page])

  async function doSearch(q: string, p: number) {
    setLoading(true)
    setError('')
    try {
      const offset = (p - 1) * PAGE_SIZE
      const data = await searchCharacters(q, PAGE_SIZE, offset)
      setCharacters(data.results ?? [])
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
      {/* Hero */}
      <div className="relative pt-8 sm:pt-12 pb-2 mb-6">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-red-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text">
            {t('home.title')}
          </h1>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-foreground transition-colors duration-200" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('home.placeholder')}
              aria-label={t('home.placeholder')}
              className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30 transition-all duration-200 text-sm"
            />
          </div>
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
            <p className="text-sm text-muted-foreground">{t('home.searching')}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No results */}
      {!loading && !error && characters.length === 0 && query.length > 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('common.noResults')}</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.map((c, i) => (
          <div
            key={c.id}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
          >
            <CharacterCard character={c} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </div>
  )
}
