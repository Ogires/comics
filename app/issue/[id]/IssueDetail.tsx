'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import BackButton from '@/components/BackButton'
import Breadcrumbs from '@/components/Breadcrumbs'
import AddToCollectionModal from '@/components/AddToCollectionModal'
import type { Issue } from '@/types'

const DESC_TRUNCATE_LENGTH = 300

interface Props {
  issue: Issue
  userId: string | null
  initialIsFavorite: boolean
}

function groupByRole(credits: { id: number; name: string; role: string }[]) {
  const map = new Map<string, string[]>()
  for (const c of credits) {
    const role = c.role || 'other'
    if (!map.has(role)) map.set(role, [])
    map.get(role)!.push(c.name)
  }
  return map
}

export default function IssueDetail({ issue, userId, initialIsFavorite }: Props) {
  const { t } = useTranslation()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [saving, setSaving] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const supabase = createClient()

  async function toggleFavorite() {
    if (!userId) return
    const previous = isFavorite
    setIsFavorite(!previous)
    setSaving(true)
    try {
      if (previous) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('issue_id', issue.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: userId,
          issue_id: issue.id,
          issue_title: issue.name || `#${issue.issue_number}`,
          issue_thumbnail: issue.image.medium_url,
        })
        if (error) throw error
      }
    } catch {
      setIsFavorite(previous)
    } finally {
      setSaving(false)
    }
  }

  const issueTitle = issue.name || `#${issue.issue_number}`
  const descNeedsTruncation =
    issue.description && issue.description.length > DESC_TRUNCATE_LENGTH
  const displayedDescription =
    showFullDescription || !descNeedsTruncation
      ? issue.description
      : issue.description?.slice(0, DESC_TRUNCATE_LENGTH) + '…'

  const roleGroups = issue.person_credits?.length
    ? groupByRole(issue.person_credits)
    : null

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: issueTitle },
        ]} />
      </div>

      {/* Header: Cover + Info */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-48 shrink-0 aspect-[2/3]">
          <Image
            src={issue.image.super_url || issue.image.medium_url || '/placeholder.png'}
            alt={issueTitle}
            fill
            sizes="192px"
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-red-500 mb-1">{issueTitle}</h1>
          {issue.volume && (
            <p className="text-slate-300 text-sm">
              {t('issue.series')}: {issue.volume.name}
            </p>
          )}
          {issue.cover_date && (
            <p className="text-slate-300 text-sm">
              {t('issue.published')}: {issue.cover_date}
            </p>
          )}
          {issue.store_date && issue.store_date !== issue.cover_date && (
            <p className="text-slate-300 text-sm">
              {t('issue.storeDate')}: {issue.store_date}
            </p>
          )}

          {issue.deck && (
            <p className="text-slate-300 leading-relaxed mt-3">{issue.deck}</p>
          )}

          {userId ? (
            <div className="mt-3 self-start">
              <AddToCollectionModal
                userId={userId}
                issueId={issue.id}
                issueTitle={issueTitle}
                issueThumbnail={issue.image.super_url || issue.image.medium_url || ''}
              />
            </div>
          ) : (
            <p className="text-slate-300 text-sm mt-3">
              <Link href="/login" className="text-red-400 hover:underline">
                {t('issue.loginPrompt')}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Creative Team */}
      {roleGroups && roleGroups.size > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.creativeTeam')}
            </h2>
            <div className="space-y-1 text-sm text-slate-300">
              {Array.from(roleGroups.entries()).map(([role, names]) => (
                <p key={role}>
                  <span className="text-slate-400 capitalize">{role}:</span>{' '}
                  {names.join(', ')}
                </p>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Description */}
      {issue.description && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.description')}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {displayedDescription}
            </p>
            {descNeedsTruncation && (
              <Button
                variant="link"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1 p-0 h-auto text-sm text-red-400"
              >
                {showFullDescription ? t('issue.readLess') : t('issue.readMore')}
              </Button>
            )}
          </section>
        </>
      )}

      {/* Characters */}
      {issue.character_credits && issue.character_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.characters')}
            </h2>
            <div className="text-sm">
              {issue.character_credits.map((char, i) => (
                <span key={char.id}>
                  {i > 0 && <span className="text-slate-600"> | </span>}
                  <Link
                    href={`/character/${char.id}`}
                    className="text-red-400 hover:underline"
                  >
                    {char.name}
                  </Link>
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {/* First Appearances */}
      {((issue.first_appearance_characters && issue.first_appearance_characters.length > 0) ||
        (issue.first_appearance_teams && issue.first_appearance_teams.length > 0)) && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.firstAppearances')}
            </h2>
            {issue.first_appearance_characters && issue.first_appearance_characters.length > 0 && (
              <div className="text-sm mb-2">
                {issue.first_appearance_characters.map((char, i) => (
                  <span key={char.id}>
                    {i > 0 && <span className="text-slate-600"> | </span>}
                    <Link
                      href={`/character/${char.id}`}
                      className="text-yellow-400 hover:underline"
                    >
                      &#11088; {char.name}
                    </Link>
                  </span>
                ))}
              </div>
            )}
            {issue.first_appearance_teams && issue.first_appearance_teams.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {issue.first_appearance_teams.map((team) => (
                  <Badge key={team.id} variant="outline" className="border-yellow-500 text-yellow-400">
                    &#11088; {team.name}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Teams */}
      {issue.team_credits && issue.team_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.teams')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {issue.team_credits.map((team) => (
                <Badge key={team.id} variant="secondary">
                  {team.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Story Arcs */}
      {issue.story_arc_credits && issue.story_arc_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.storyArcs')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {issue.story_arc_credits.map((arc) => (
                <Badge key={arc.id} variant="secondary">
                  {arc.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Locations */}
      {issue.location_credits && issue.location_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.locations')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {issue.location_credits.map((loc) => (
                <Badge key={loc.id} variant="outline">
                  {loc.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Concepts */}
      {issue.concept_credits && issue.concept_credits.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              {t('issue.concepts')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {issue.concept_credits.map((concept) => (
                <Badge key={concept.id} variant="outline">
                  {concept.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  )
}
