const BASE_URL = 'https://comicvine.gamespot.com/api'

type QueryParams = Record<string, string | number | undefined>

export function buildComicVineUrl(path: string, params: QueryParams): string {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', process.env.COMIC_VINE_API_KEY ?? '')
  url.searchParams.set('format', 'json')
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export function parsePositiveInt(
  value: string | null | undefined,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (value === null || value === undefined) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return defaultValue
  return Math.min(Math.max(parsed, min), max)
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}
