import { Skeleton } from '@/components/ui/skeleton'

export default function IssueLoading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-8 w-20 mb-4" />
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <Skeleton className="w-48 shrink-0 aspect-[2/3] rounded-lg" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-36 mt-2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
