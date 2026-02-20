// Comic Vine API types

export interface ComicVineImage {
  medium_url: string
  super_url: string
}

export interface CharacterSummary {
  id: number
  name: string
  image: ComicVineImage
}

export interface Character extends CharacterSummary {
  deck?: string
  issue_credits: IssueSummary[]
}

export interface IssueSummary {
  id: number
  name: string
  issue_number: string
  image: ComicVineImage
}

export interface Issue extends IssueSummary {
  description?: string
  volume?: { name: string }
  cover_date?: string
  person_credits?: { name: string; role: string }[]
}

export interface ComicVineListResponse<T> {
  results: T[]
  total_results: number
  limit: number
  offset: number
  status_code: number
}

export interface ComicVineDetailResponse<T> {
  results: T
  status_code: number
}

// Favorites (Supabase)

export interface Favorite {
  id: string
  user_id: string
  issue_id: number
  issue_title: string
  issue_thumbnail: string
  created_at: string
}

// Pagination

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}
