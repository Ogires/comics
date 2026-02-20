import { Skeleton } from '@/components/ui/skeleton'

export default function CharacterLoading() {
  return (
    <div>
      {/* Navigation */}
      <Skeleton className="h-8 w-20 mb-4" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <Skeleton className="w-48 h-48 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* Powers */}
      <Skeleton className="h-px w-full mb-6" />
      <Skeleton className="h-5 w-24 mb-3" />
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`power-${i}`} className="h-6 w-24 rounded-full" />
        ))}
      </div>

      {/* Teams */}
      <Skeleton className="h-px w-full mb-6" />
      <Skeleton className="h-5 w-20 mb-3" />
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`team-${i}`} className="h-6 w-28 rounded-full" />
        ))}
      </div>

      {/* Biography */}
      <Skeleton className="h-px w-full mb-6" />
      <Skeleton className="h-5 w-28 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Issues */}
      <Skeleton className="h-px w-full my-6" />
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`issue-${i}`} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
