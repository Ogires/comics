import { Skeleton } from '@/components/ui/skeleton'

export default function CharacterLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-20 mb-4" />
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <Skeleton className="w-48 h-48 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
