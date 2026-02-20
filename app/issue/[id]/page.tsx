import { notFound } from 'next/navigation'
import { buildComicVineUrl, stripHtml } from '@/lib/comicVineUrl'
import { createClient } from '@/lib/supabase/server'
import IssueDetail from './IssueDetail'
import type { Issue } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function IssuePage({ params }: Props) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId) || numericId <= 0) notFound()

  const url = buildComicVineUrl(`/issue/4000-${numericId}/`, {
    field_list: 'id,name,issue_number,image,description,volume,cover_date,person_credits',
  })

  const [issueRes, supabase] = await Promise.all([
    fetch(url, {
      headers: { 'User-Agent': 'comics-explorer/1.0' },
      next: { revalidate: 300 },
    }),
    createClient(),
  ])

  if (!issueRes.ok) notFound()

  const data = await issueRes.json()
  const issue: Issue = {
    ...data.results,
    description: stripHtml(data.results.description),
  }

  const { data: { user } } = await supabase.auth.getUser()

  let initialIsFavorite = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('issue_id', numericId)
      .maybeSingle()
    initialIsFavorite = !!fav
  }

  return (
    <IssueDetail
      issue={issue}
      userId={user?.id ?? null}
      initialIsFavorite={initialIsFavorite}
    />
  )
}
