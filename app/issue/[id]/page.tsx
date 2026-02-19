'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { fetchIssue } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import type { Issue } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function IssuePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    fetchIssue(id)
      .then((data) => setIssue(data.results))
      .catch(() => setError(t('issue.error')))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('issue_id', parseInt(id, 10))
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data))
  }, [user, id])

  async function toggleFavorite() {
    if (!user || !issue) return
    setSaving(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issue.id)
        setIsFavorite(false)
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          issue_id: issue.id,
          issue_title: issue.name || `#${issue.issue_number}`,
          issue_thumbnail: issue.image.medium_url,
        })
        setIsFavorite(true)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-400">{t('common.loading')}</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!issue) return <p className="text-slate-400">{t('issue.notFound')}</p>

  const writer = issue.person_credits?.find((p) => p.role === 'writer')

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="relative w-48 shrink-0 aspect-[2/3]">
          <Image
            src={issue.image.super_url || issue.image.medium_url || '/placeholder.png'}
            alt={issue.name || `#${issue.issue_number}`}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-red-500">
            {issue.name || `#${issue.issue_number}`}
          </h1>
          {issue.volume && (
            <p className="text-slate-400 text-sm">
              {t('issue.series')}: {issue.volume.name}
            </p>
          )}
          {issue.cover_date && (
            <p className="text-slate-400 text-sm">
              {t('issue.published')}: {issue.cover_date}
            </p>
          )}
          {writer && (
            <p className="text-slate-400 text-sm">
              {t('issue.writer')}: {writer.name}
            </p>
          )}
          {user ? (
            <button
              onClick={toggleFavorite}
              disabled={saving}
              className="mt-2 px-4 py-2 rounded font-semibold disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white self-start"
            >
              {saving ? t('issue.saving') : isFavorite ? t('issue.inFavorites') : t('issue.addFavorite')}
            </button>
          ) : (
            <p className="text-slate-400 text-sm mt-2">
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
