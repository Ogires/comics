'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import BackButton from '@/components/BackButton'
import Breadcrumbs from '@/components/Breadcrumbs'
import type { Issue } from '@/types'

interface Props {
  issue: Issue
  userId: string | null
  initialIsFavorite: boolean
}

export default function IssueDetail({ issue, userId, initialIsFavorite }: Props) {
  const { t } = useTranslation()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [saving, setSaving] = useState(false)
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

  const writer = issue.person_credits?.find((p) => p.role === 'writer')
  const issueTitle = issue.name || `#${issue.issue_number}`

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: issueTitle },
        ]} />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="relative w-48 shrink-0 aspect-[2/3]">
          <Image
            src={issue.image.super_url || issue.image.medium_url || '/placeholder.png'}
            alt={issueTitle}
            fill
            sizes="192px"
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-red-500">{issueTitle}</h1>
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
          {writer && (
            <p className="text-slate-300 text-sm">
              {t('issue.writer')}: {writer.name}
            </p>
          )}
          {userId ? (
            <Button
              onClick={toggleFavorite}
              disabled={saving}
              className="mt-2 self-start bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? t('issue.saving') : isFavorite ? t('issue.inFavorites') : t('issue.addFavorite')}
            </Button>
          ) : (
            <p className="text-slate-300 text-sm mt-2">
              <Link href="/login" className="text-red-400 hover:underline">
                {t('issue.loginPrompt')}
              </Link>
            </p>
          )}
        </div>
      </div>
      {issue.description && (
        <p className="text-slate-300 leading-relaxed">{issue.description}</p>
      )}
    </div>
  )
}
