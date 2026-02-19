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
          <h2 className="text-xl font-semibold text-slate-100 mb-4">{t('character.issuesTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {character.issue_credits.map((issue) => (
              <Link
                key={issue.id}
                href={`/issue/${issue.id}`}
                className="block bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
              >
                <div className="relative aspect-[2/3]">
                  <Image
                    src={issue.image?.medium_url || '/placeholder.png'}
                    alt={issue.name || `#${issue.issue_number}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-300 truncate">
                    {issue.name || `#${issue.issue_number}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
