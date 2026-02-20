'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import BackButton from '@/components/BackButton'
import Breadcrumbs from '@/components/Breadcrumbs'
import type { Character } from '@/types'

const ISSUE_LIMIT = 50
const BIO_TRUNCATE_LENGTH = 300

export default function CharacterDetail({ character }: { character: Character }) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)

  const issues = showAll ? character.issue_credits : character.issue_credits.slice(0, ISSUE_LIMIT)
  const aliasesList = character.aliases
    ? character.aliases.split('\n').filter((a) => a.trim())
    : []
  const bioNeedsTruncation =
    character.description && character.description.length > BIO_TRUNCATE_LENGTH
  const displayedBio =
    showFullBio || !bioNeedsTruncation
      ? character.description
      : character.description?.slice(0, BIO_TRUNCATE_LENGTH) + '…'

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: character.name }]}
        />
      </div>

      {/* Header: Image + Info */}
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
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-red-500 mb-1">{character.name}</h1>

          {character.real_name && (
            <p className="text-lg text-slate-400 italic mb-2">{character.real_name}</p>
          )}

          {/* Publisher / Origin badges */}
          {(character.publisher || character.origin) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {character.publisher && (
                <Badge variant="secondary">{character.publisher.name}</Badge>
              )}
              {character.origin && (
                <Badge variant="outline">{character.origin.name}</Badge>
              )}
            </div>
          )}

          {character.deck && (
            <p className="text-slate-300 leading-relaxed mb-3">{character.deck}</p>
          )}

          {/* Meta info */}
          <div className="space-y-1 text-sm text-slate-400">
            {character.first_appeared_in_issue && (
              <p>
                {t('character.firstAppearance')}:{' '}
                <Link
                  href={`/issue/${character.first_appeared_in_issue.id}`}
                  className="text-red-400 hover:underline"
                >
                  {character.first_appeared_in_issue.name ||
                    `#${character.first_appeared_in_issue.issue_number}`}
                </Link>
              </p>
            )}
            {character.creators && character.creators.length > 0 && (
              <p>
                {t('character.creators')}:{' '}
                {character.creators.map((c) => c.name).join(', ')}
              </p>
            )}
            {character.count_of_issue_appearances != null &&
              character.count_of_issue_appearances > 0 && (
                <p>
                  {t('character.appearances')}:{' '}
                  {character.count_of_issue_appearances.toLocaleString()}{' '}
                  {t('character.issuesTitle').toLowerCase()}
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Aliases */}
      {aliasesList.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('character.aliases')}
            </h2>
            <p className="text-sm text-slate-400">{aliasesList.join(', ')}</p>
          </section>
        </>
      )}

      {/* Powers */}
      {character.powers && character.powers.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('character.powers')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {character.powers.map((power) => (
                <Badge key={power.id} variant="default">
                  {power.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Teams */}
      {character.teams && character.teams.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('character.teams')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {character.teams.map((team) => (
                <Badge key={team.id} variant="secondary">
                  {team.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Allies & Enemies */}
      {((character.character_friends && character.character_friends.length > 0) ||
        (character.character_enemies && character.character_enemies.length > 0)) && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('character.allies')} & {t('character.enemies')}
            </h2>

            {character.character_friends && character.character_friends.length > 0 && (
              <div className="mb-3">
                <span className="text-sm font-medium text-slate-400">
                  {t('character.allies')}:{' '}
                </span>
                <span className="text-sm">
                  {character.character_friends.map((friend, i) => (
                    <span key={friend.id}>
                      {i > 0 && <span className="text-slate-600"> | </span>}
                      <Link
                        href={`/character/${friend.id}`}
                        className="text-red-400 hover:underline"
                      >
                        {friend.name}
                      </Link>
                    </span>
                  ))}
                </span>
              </div>
            )}

            {character.character_enemies && character.character_enemies.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-400">
                  {t('character.enemies')}:{' '}
                </span>
                <span className="text-sm">
                  {character.character_enemies.map((enemy, i) => (
                    <span key={enemy.id}>
                      {i > 0 && <span className="text-slate-600"> | </span>}
                      <Link
                        href={`/character/${enemy.id}`}
                        className="text-red-400 hover:underline"
                      >
                        {enemy.name}
                      </Link>
                    </span>
                  ))}
                </span>
              </div>
            )}
          </section>
        </>
      )}

      {/* Biography */}
      {character.description && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('character.biography')}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {displayedBio}
            </p>
            {bioNeedsTruncation && (
              <Button
                variant="link"
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-1 p-0 h-auto text-sm text-red-400"
              >
                {showFullBio ? t('character.readLess') : t('character.readMore')}
              </Button>
            )}
          </section>
        </>
      )}

      {/* Issues */}
      {character.issue_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
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
              <Button
                variant="link"
                onClick={() => setShowAll(true)}
                className="mt-3 text-sm text-red-400"
              >
                {t('character.showAll', { count: character.issue_credits.length })}
              </Button>
            )}
          </section>
        </>
      )}
    </div>
  )
}
