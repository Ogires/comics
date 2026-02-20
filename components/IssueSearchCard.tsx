'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import type { IssueSummary } from '@/types'

interface Props {
  issue: IssueSummary
}

export default function IssueSearchCard({ issue }: Props) {
  const { t } = useTranslation()
  const title = issue.name || `#${issue.issue_number}`

  return (
    <Link href={`/issue/${issue.id}`} className="group">
      <Card className="overflow-hidden border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/[0.06] hover:-translate-y-0.5 py-0 gap-0 bg-card">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={issue.image?.medium_url || '/placeholder.png'}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3 space-y-1">
          <h3 className="font-medium text-sm text-foreground truncate">{title}</h3>
          {issue.volume?.name ? (
            <p className="text-xs text-muted-foreground truncate">
              {issue.volume.name}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
