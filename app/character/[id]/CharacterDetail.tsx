'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Character } from '@/types'

const ISSUE_LIMIT = 50

export default function CharacterDetail({ character }: { character: Character }) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const issues = showAll ? character.issue_credits : character.issue_credits.slice(0, ISSUE_LIMIT)

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-48 h-48 shrink-0">
          <Image
            src={character.image.super_url || character.image.medium_url || '/placeholder.png'}
            alt={character.name}
            fill
            sizes="192px"
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
            {issues.map((issue) => (
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
          {!showAll && character.issue_credits.length > ISSUE_LIMIT && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 text-sm text-red-400 hover:underline"
            >
              Show all {character.issue_credits.length} issues
            </button>
          )}
        </>
      )}
    </div>
  )
}
