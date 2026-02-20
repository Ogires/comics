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
import AddToCollectionModal from '@/components/AddToCollectionModal'
import type { Issue } from '@/types'

const DESC_TRUNCATE_LENGTH = 300

interface Props {
  issue: Issue
  userId: string | null
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

export default function IssueDetail({ issue, userId }: Props) {
  const { t } = useTranslation()
  const [showFullDescription, setShowFullDescription] = useState(false)

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
    <div className="animate-fade-in">
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
        <div className="relative w-48 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-border/50">
          <Image
            src={issue.image.super_url || issue.image.medium_url || '/placeholder.png'}
            alt={issueTitle}
            fill
            sizes="192px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold gradient-text-accent mb-1">{issueTitle}</h1>
          {issue.volume && (
            <p className="text-muted-foreground text-sm">
              {t('issue.series')}: {issue.volume.name}
            </p>
          )}
          {issue.cover_date && (
            <p className="text-muted-foreground text-sm">
              {t('issue.published')}: <span className="font-mono">{issue.cover_date}</span>
            </p>
          )}
          {issue.store_date && issue.store_date !== issue.cover_date && (
            <p className="text-muted-foreground text-sm">
              {t('issue.storeDate')}: <span className="font-mono">{issue.store_date}</span>
            </p>
          )}

          {issue.deck && (
            <p className="text-muted-foreground leading-relaxed mt-3">{issue.deck}</p>
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
            <p className="text-muted-foreground text-sm mt-3">
              <Link href="/login" className="text-red-400 hover:text-red-300 hover:underline transition-colors">
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {t('issue.creativeTeam')}
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              {Array.from(roleGroups.entries()).map(([role, names]) => (
                <p key={role}>
                  <span className="text-muted-foreground/70 capitalize">{role}:</span>{' '}
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {t('issue.description')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {displayedDescription}
            </p>
            {descNeedsTruncation && (
              <Button
                variant="link"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1 p-0 h-auto text-sm text-red-400 hover:text-red-300"
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {t('issue.characters')}
            </h2>
            <div className="text-sm">
              {issue.character_credits.map((char, i) => (
                <span key={char.id}>
                  {i > 0 && <span className="text-border"> | </span>}
                  <Link
                    href={`/character/${char.id}`}
                    className="text-red-400 hover:text-red-300 hover:underline transition-colors"
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {t('issue.firstAppearances')}
            </h2>
            {issue.first_appearance_characters && issue.first_appearance_characters.length > 0 && (
              <div className="text-sm mb-2">
                {issue.first_appearance_characters.map((char, i) => (
                  <span key={char.id}>
                    {i > 0 && <span className="text-border"> | </span>}
                    <Link
                      href={`/character/${char.id}`}
                      className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
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
                  <Badge key={team.id} variant="outline" className="border-yellow-500/50 text-yellow-400">
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
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
            <h2 className="text-lg font-semibold text-foreground mb-3">
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
