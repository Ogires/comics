import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssuePage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '9999' }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

// Mock lib/api
vi.mock('@/lib/api', () => ({
  fetchIssue: vi.fn().mockResolvedValue({
    results: {
      id: 9999,
      name: 'Amazing Fantasy',
      issue_number: '15',
      image: { medium_url: 'http://img.test/af.jpg', super_url: '' },
      description: 'First appearance of Spider-Man',
      volume: { name: 'Amazing Fantasy' },
      cover_date: '1962-08-01',
      person_credits: [{ name: 'Stan Lee', role: 'writer' }],
    },
  }),
}))

// Mock supabase
const mockFrom = vi.fn()
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

// Supabase chain builder
function makeChain(result: object) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return chain
}

describe('IssuePage — favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Add to Favorites when user is logged in and issue is not a favorite', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(makeChain({ data: null }))

    render(<IssuePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /issue\.addFavorite/i })).toBeInTheDocument()
    })
  })

  it('shows In Favorites when issue is already a favorite', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(makeChain({ data: { id: 'fav-1' } }))

    render(<IssuePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /issue\.inFavorites/i })).toBeInTheDocument()
    })
  })

  it('shows login prompt when user is not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockFrom.mockReturnValue(makeChain({ data: null }))

    render(<IssuePage />)

    await waitFor(() => {
      expect(screen.getByText(/issue\.loginPrompt/i)).toBeInTheDocument()
    })
  })

  it('calls insert when Add to Favorites is clicked', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const chain = makeChain({ data: null })
    mockFrom.mockReturnValue(chain)

    render(<IssuePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /issue\.addFavorite/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /issue\.addFavorite/i }))

    await waitFor(() => {
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ issue_id: 9999 })
      )
    })
  })
})
