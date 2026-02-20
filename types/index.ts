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
  description?: string
  real_name?: string
  aliases?: string
  publisher?: { id: number; name: string }
  origin?: { id: number; name: string }
  powers?: { id: number; name: string }[]
  teams?: { id: number; name: string }[]
  first_appeared_in_issue?: { id: number; name: string; issue_number: string }
  creators?: { id: number; name: string }[]
  count_of_issue_appearances?: number
  character_friends?: { id: number; name: string }[]
  character_enemies?: { id: number; name: string }[]
  issue_credits: IssueSummary[]
}

export interface IssueSummary {
  id: number
  name: string
  issue_number: string
  image: ComicVineImage
}

export interface Issue extends IssueSummary {
  deck?: string
  description?: string
  volume?: { name: string }
  cover_date?: string
  store_date?: string
  person_credits?: { id: number; name: string; role: string }[]
  character_credits?: { id: number; name: string }[]
  team_credits?: { id: number; name: string }[]
  location_credits?: { id: number; name: string }[]
  concept_credits?: { id: number; name: string }[]
  story_arc_credits?: { id: number; name: string }[]
  first_appearance_characters?: { id: number; name: string }[]
  first_appearance_teams?: { id: number; name: string }[]
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
