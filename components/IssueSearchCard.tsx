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
    <Link href={`/issue/${issue.id}`}>
      <Card className="overflow-hidden hover:ring-2 hover:ring-red-500 transition-all py-0 gap-0">
        <div className="relative aspect-[2/3]">
          <Image
            src={issue.image?.medium_url || '/placeholder.png'}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
            className="object-cover"
          />
        </div>
        <CardContent className="p-3 space-y-1">
          <h3 className="font-semibold text-slate-100 truncate">{title}</h3>
          {issue.volume?.name ? (
            <p className="text-xs text-slate-400 truncate">
              {t('issues.volume')}: {issue.volume.name}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
