import { NextRequest, NextResponse } from 'next/server'
import { buildComicVineUrl, parsePositiveInt } from '@/lib/comicVineUrl'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('query')?.trim() ?? ''
  const limit = parsePositiveInt(searchParams.get('limit'), 1, 100, 20)
  const offset = parsePositiveInt(searchParams.get('offset'), 0, 10000, 0)

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const url = buildComicVineUrl('/search/', {
      resources: 'issue',
      query,
      field_list: 'id,name,issue_number,image,volume',
      limit,
      offset,
    })
    const response = await fetch(url, {
      headers: { 'User-Agent': 'comics-explorer/1.0' },
      next: { revalidate: 300 },
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'Comic Vine API error' }, { status: 502 })
    }
    const data = await response.json()
    // Return only expected fields, normalize total_results
    return NextResponse.json({
      results: data.results,
      total_results: data.number_of_total_results ?? data.total_results ?? 0,
      limit: data.limit,
      offset: data.offset,
      status_code: data.status_code,
    })
  } catch {
    return NextResponse.json({ error: 'Comic Vine API unavailable' }, { status: 502 })
  }
}
