import type {
  ComicVineListResponse,
  ComicVineDetailResponse,
  CharacterSummary,
  Character,
  Issue,
} from '@/types'

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function searchCharacters(
  query: string,
  limit = 20,
  offset = 0
): Promise<ComicVineListResponse<CharacterSummary>> {
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    offset: String(offset),
  })
  return apiFetch(`/api/characters?${params}`)
}

export async function fetchCharacter(id: string): Promise<ComicVineDetailResponse<Character>> {
  return apiFetch(`/api/characters/${id}`)
}

export async function fetchIssue(id: string): Promise<ComicVineDetailResponse<Issue>> {
  return apiFetch(`/api/issues/${id}`)
}
