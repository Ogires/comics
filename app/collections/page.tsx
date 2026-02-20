import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CollectionsList from './CollectionsList'
import { CollectionWithProgress } from '@/types'

// Revalidate occasionally, but since mutations happen on the client
// Next.js might cache this route. This ensures dynamic rendering for auth
export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirectTo=/collections')
  }

  const { data: collections, error } = await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching collections:', error)
  }

  const collectionsWithProgress: CollectionWithProgress[] = (collections ?? []).map((c: any) => ({
    ...c,
    total_items: c.collection_items?.length || 0,
    read_items: c.collection_items?.filter((i: any) => i.reading_status === 'read').length || 0,
    owned_items: c.collection_items?.filter((i: any) => i.owned).length || 0,
    items: c.collection_items || [],
  }))

  return <CollectionsList collections={collectionsWithProgress} userId={user.id} />
}
