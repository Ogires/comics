import { Skeleton } from '@/components/ui/skeleton'

export default function FavoritesLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="p-2">
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
