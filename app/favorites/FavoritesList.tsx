'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Favorite } from '@/types'

export default function FavoritesList({ favorites }: { favorites: Favorite[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold gradient-text-accent mb-6">{t('favorites.title')}</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">
          {t('favorites.empty')}{' '}
          <Link href="/" className="text-red-400 hover:text-red-300 hover:underline transition-colors">
            {t('favorites.browse')}
          </Link>{' '}
          {t('favorites.toSave')}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((fav, i) => (
            <Link
              key={fav.id}
              href={`/issue/${fav.issue_id}`}
              className="group block bg-card rounded-lg overflow-hidden border border-border/50 hover:border-border/80 hover:shadow-lg hover:shadow-red-500/[0.06] hover:-translate-y-0.5 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={fav.issue_thumbnail || '/placeholder.png'}
                  alt={fav.issue_title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{fav.issue_title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
