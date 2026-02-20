import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-64 mb-6" />
      <Skeleton className="h-9 w-full max-w-xl mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
