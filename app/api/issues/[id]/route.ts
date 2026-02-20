import { NextRequest, NextResponse } from 'next/server'
import { buildComicVineUrl, stripHtml } from '@/lib/comicVineUrl'

type Params = Promise<{ id: string }>

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 })
  }

  try {
    const url = buildComicVineUrl(`/issue/4000-${numericId}/`, {
      field_list: 'id,name,issue_number,image,deck,description,volume,cover_date,store_date,person_credits,character_credits,team_credits,location_credits,concept_credits,story_arc_credits,first_appearance_characters,first_appearance_teams',
    })
    const response = await fetch(url, {
      headers: { 'User-Agent': 'comics-explorer/1.0' },
      next: { revalidate: 300 },
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'Comic Vine API error' }, { status: 502 })
    }
    const data = await response.json()
    if (data.results) {
      data.results.deck = stripHtml(data.results.deck)
      data.results.description = stripHtml(data.results.description)
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Comic Vine API unavailable' }, { status: 502 })
  }
}
