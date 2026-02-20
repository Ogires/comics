import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CollectionDetail from './CollectionDetail'
import { CollectionWithProgress } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CollectionPage({ params }: { params: { id: string } }) {
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

  // Validate UUID (very basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(params.id)) {
    redirect('/collections')
  }

  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('id', params.id)
    .single()

  if (error || !collection || collection.user_id !== user.id) {
    redirect('/collections')
  }

  // Transform data to include progress
  const collectionWithProgress: CollectionWithProgress = {
    ...collection,
    total_items: collection.collection_items?.length || 0,
    read_items: collection.collection_items?.filter((i: any) => i.reading_status === 'read').length || 0,
    owned_items: collection.collection_items?.filter((i: any) => i.owned).length || 0,
    items: collection.collection_items?.sort((a: any, b: any) => 
      new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    ) || [],
  }

  return <CollectionDetail collection={collectionWithProgress} />
}
