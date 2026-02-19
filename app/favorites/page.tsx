'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Favorite } from '@/types'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const supabase = createClient()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error: err } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) {
        setError(t('favorites.error'))
      } else {
        setFavorites(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-slate-400">{t('common.loading')}</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-red-500 mb-6">{t('favorites.title')}</h1>
      {favorites.length === 0 ? (
        <p className="text-slate-400">
          {t('favorites.empty')}{' '}
          <Link href="/" className="text-red-400 hover:underline">
            {t('favorites.browse')}
          </Link>{' '}
          {t('favorites.toSave')}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/issue/${fav.issue_id}`}
              className="block bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={fav.issue_thumbnail || '/placeholder.png'}
                  alt={fav.issue_title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-300 truncate">{fav.issue_title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
