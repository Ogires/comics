'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Favorite } from '@/types'

export default function FavoritesList({ favorites }: { favorites: Favorite[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold text-red-500 mb-6">{t('favorites.title')}</h1>
      {favorites.length === 0 ? (
        <p className="text-slate-300">
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
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
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
