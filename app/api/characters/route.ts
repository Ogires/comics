import { NextRequest, NextResponse } from 'next/server'
import { buildComicVineUrl, parsePositiveInt } from '@/lib/comicVineUrl'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('query')?.trim() ?? ''
  const limit = parsePositiveInt(searchParams.get('limit'), 1, 100, 20)
  const offset = parsePositiveInt(searchParams.get('offset'), 0, 10000, 0)

  const params: Record<string, string | number> = {
    limit,
    offset,
    field_list: 'id,name,image',
  }
  if (query) {
    params.filter = `name:${query}`
  }

  try {
    const url = buildComicVineUrl('/characters/', params)
    const response = await fetch(url, {
      headers: { 'User-Agent': 'comics-explorer/1.0' },
      next: { revalidate: 300 },
    })
    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: 'Comic Vine API error', status: response.status, body: text.slice(0, 500) },
        { status: 502 },
      )
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Comic Vine API unavailable', message: String(err) },
      { status: 502 },
    )
  }
}
