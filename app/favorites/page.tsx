import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FavoritesList from './FavoritesList'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <FavoritesList favorites={favorites ?? []} />
}
