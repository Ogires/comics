import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { CollectionWithProgress } from '@/types'
import ProgressBar from './ProgressBar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

interface CollectionCardProps {
  collection: CollectionWithProgress
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const { t } = useTranslation()

  const percentage = collection.total_items > 0
    ? Math.round((collection.read_items / collection.total_items) * 100)
    : 0

  return (
    <Link href={`/collections/${collection.id}`} className="block h-full group">
      <Card className="h-full flex flex-col border-border/50 hover:border-border/80 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-red-500/[0.06] hover:-translate-y-0.5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">{collection.name}</CardTitle>
          {collection.description && (
            <CardDescription className="line-clamp-2 min-h-10 mt-1">
              {collection.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {collection.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="w-10 h-14 bg-white/[0.04] rounded overflow-hidden flex-shrink-0 relative border border-border"
              >
                {item.issue_thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.issue_thumbnail}
                    alt={item.issue_title || 'Comic cover'}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.04]" />
                )}
              </div>
            ))}
            {collection.total_items > 3 && (
              <div className="w-10 h-14 bg-white/[0.04] rounded flex items-center justify-center text-xs text-muted-foreground border border-border font-mono">
                +{collection.total_items - 3}
              </div>
            )}
            {collection.total_items === 0 && (
              <p className="text-sm text-muted-foreground">0 issues</p>
            )}
          </div>

          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('collections.progress', { read: collection.read_items, total: collection.total_items })}</span>
              <span className="font-mono font-medium">{percentage}%</span>
            </div>
            <ProgressBar value={percentage} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
