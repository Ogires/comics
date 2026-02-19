'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { fetchCharacter } from '@/lib/api'
import type { Character } from '@/types'

export default function CharacterPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCharacter(id)
      .then((data) => setCharacter(data.results))
      .catch(() => setError(t('character.error')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-slate-400">{t('common.loading')}</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!character) return null

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-48 h-48 shrink-0">
          <Image
            src={character.image.super_url || character.image.medium_url || '/placeholder.png'}
            alt={character.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">{character.name}</h1>
          {character.deck && <p className="text-slate-300 leading-relaxed">{character.deck}</p>}
        </div>
      </div>

      {character.issue_credits.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            {t('character.issuesTitle')} ({character.issue_credits.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {character.issue_credits.map((issue) => (
              <Link
                key={issue.id}
                href={`/issue/${issue.id}`}
                className="block bg-slate-800 rounded-lg px-3 py-2 hover:ring-2 hover:ring-red-500 transition-all"
              >
                <p className="text-sm text-slate-300 truncate">
                  {issue.name || `Issue #${issue.id}`}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
