import { notFound } from 'next/navigation'
import { buildComicVineUrl, stripHtml } from '@/lib/comicVineUrl'
import CharacterDetail from './CharacterDetail'
import type { Character } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function CharacterPage({ params }: Props) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId) || numericId <= 0) notFound()

  const url = buildComicVineUrl(`/character/4005-${numericId}/`, {
    field_list: 'id,name,image,deck,issue_credits',
  })
  const response = await fetch(url, {
    headers: { 'User-Agent': 'comics-explorer/1.0' },
    next: { revalidate: 300 },
  })
  if (!response.ok) notFound()

  const data = await response.json()
  const character: Character = {
    ...data.results,
    deck: stripHtml(data.results.deck),
  }

  return <CharacterDetail character={character} />
}
