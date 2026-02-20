import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueDetail from './IssueDetail'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

// Mock next/navigation (needed by BackButton)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
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
    order: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return chain
}

describe('IssueDetail — collections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Add to Collection button when user is logged in', () => {
    render(<IssueDetail issue={testIssue} userId="user-1" />)
    expect(screen.getByRole('button', { name: /collections\.addTo/i })).toBeInTheDocument()
  })

  it('shows login prompt when user is not logged in', () => {
    render(<IssueDetail issue={testIssue} userId={null} />)
    expect(screen.getByText(/issue\.loginPrompt/i)).toBeInTheDocument()
  })

  it('does not show Add to Collection when user is not logged in', () => {
    render(<IssueDetail issue={testIssue} userId={null} />)
    expect(screen.queryByRole('button', { name: /collections\.addTo/i })).not.toBeInTheDocument()
  })

  it('opens collection list when Add to Collection is clicked', async () => {
    const chain = makeChain({ data: [] })
    mockFrom.mockReturnValue(chain)

    render(<IssueDetail issue={testIssue} userId="user-1" />)
    await userEvent.click(screen.getByRole('button', { name: /collections\.addTo/i }))

    expect(screen.getByText(/collections\.title/i)).toBeInTheDocument()
  })

  it('renders issue title and metadata', () => {
    render(<IssueDetail issue={testIssue} userId="user-1" />)
    expect(screen.getByRole('heading', { name: 'Amazing Fantasy' })).toBeInTheDocument()
    expect(screen.getByText(/1962-08-01/)).toBeInTheDocument()
  })
})
