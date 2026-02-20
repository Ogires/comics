import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueDetail from './IssueDetail'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

// Mock supabase
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

const testIssue = {
  id: 9999,
  name: 'Amazing Fantasy',
  issue_number: '15',
  image: { medium_url: 'http://img.test/af.jpg', super_url: '' },
  description: 'First appearance of Spider-Man',
  volume: { name: 'Amazing Fantasy' },
  cover_date: '1962-08-01',
  person_credits: [{ name: 'Stan Lee', role: 'writer' }],
}

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

describe('IssueDetail — favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Add to Favorites when not a favorite', () => {
    render(<IssueDetail issue={testIssue} userId="user-1" initialIsFavorite={false} />)
    expect(screen.getByRole('button', { name: /issue\.addFavorite/i })).toBeInTheDocument()
  })

  it('shows In Favorites when already a favorite', () => {
    render(<IssueDetail issue={testIssue} userId="user-1" initialIsFavorite={true} />)
    expect(screen.getByRole('button', { name: /issue\.inFavorites/i })).toBeInTheDocument()
  })

  it('shows login prompt when user is not logged in', () => {
    render(<IssueDetail issue={testIssue} userId={null} initialIsFavorite={false} />)
    expect(screen.getByText(/issue\.loginPrompt/i)).toBeInTheDocument()
  })

  it('calls insert when Add to Favorites is clicked', async () => {
    const chain = makeChain({ data: null })
    mockFrom.mockReturnValue(chain)

    render(<IssueDetail issue={testIssue} userId="user-1" initialIsFavorite={false} />)
    await userEvent.click(screen.getByRole('button', { name: /issue\.addFavorite/i }))

    await waitFor(() => {
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ issue_id: 9999 })
      )
    })
  })

  it('rolls back on delete error', async () => {
    const deleteChain = {
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      }),
    }
    mockFrom.mockReturnValue(deleteChain)

    render(<IssueDetail issue={testIssue} userId="user-1" initialIsFavorite={true} />)
    await userEvent.click(screen.getByRole('button', { name: /issue\.inFavorites/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /issue\.inFavorites/i })).toBeInTheDocument()
    })
  })
})
