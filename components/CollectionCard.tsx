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

  // Calculate percentage length handling 0 divisor safely
  const percentage = collection.total_items > 0
    ? Math.round((collection.read_items / collection.total_items) * 100)
    : 0

  return (
    <Link href={`/collections/${collection.id}`} className="block h-full cursor-pointer hover:no-underline transition-all hover:scale-[1.02]">
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl line-clamp-1">{collection.name}</CardTitle>
          {collection.description && (
            <CardDescription className="line-clamp-2 min-h-10 mt-1">
              {collection.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto pt-4 border-t flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {collection.items.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0 relative border shadow-sm"
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
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                )}
              </div>
            ))}
            {collection.total_items > 3 && (
              <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground border">
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
              <span className="font-medium">{percentage}%</span>
            </div>
            <ProgressBar value={percentage} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
