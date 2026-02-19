import { NextRequest, NextResponse } from 'next/server'
import { buildComicVineUrl, stripHtml } from '@/lib/comicVineUrl'

type Params = Promise<{ id: string }>

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid character id' }, { status: 400 })
  }

  try {
    const url = buildComicVineUrl(`/character/4005-${numericId}/`, {
      field_list: 'id,name,image,deck,issue_credits',
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
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Comic Vine API unavailable' }, { status: 502 })
  }
}
