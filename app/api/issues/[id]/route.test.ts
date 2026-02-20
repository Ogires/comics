import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

const mockIssue = {
  results: {
    id: 9999,
    name: 'Amazing Fantasy',
    issue_number: '15',
    image: { medium_url: '', super_url: '' },
    deck: '<p>First appearance of Spider-Man in comics.</p>',
    description: '<p>First appearance of Spider-Man</p>',
    volume: { name: 'Amazing Fantasy' },
    cover_date: '1962-08-01',
    store_date: '1962-08-10',
    person_credits: [
      { id: 1, name: 'Stan Lee', role: 'writer' },
      { id: 2, name: 'Steve Ditko', role: 'artist' },
    ],
    character_credits: [
      { id: 101, name: 'Spider-Man' },
      { id: 102, name: 'Aunt May' },
    ],
    team_credits: [{ id: 201, name: 'Avengers' }],
    location_credits: [{ id: 301, name: 'New York City' }],
    concept_credits: [{ id: 401, name: 'Radioactivity' }],
    story_arc_credits: [{ id: 501, name: 'Origin' }],
    first_appearance_characters: [{ id: 101, name: 'Spider-Man' }],
    first_appearance_teams: [],
  },
  status_code: 1,
}

describe('GET /api/issues/[id]', () => {
  it('returns issue with stripped description HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(structuredClone(mockIssue)),
    } as Response)

    const req = new NextRequest('http://localhost/api/issues/9999')
    const res = await GET(req, { params: Promise.resolve({ id: '9999' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.description).toBe('First appearance of Spider-Man')
  })

  it('returns issue with stripped deck HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(structuredClone(mockIssue)),
    } as Response)

    const req = new NextRequest('http://localhost/api/issues/9999')
    const res = await GET(req, { params: Promise.resolve({ id: '9999' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.deck).toBe('First appearance of Spider-Man in comics.')
  })

  it('returns 400 for invalid id', async () => {
    const req = new NextRequest('http://localhost/api/issues/xyz')
    const res = await GET(req, { params: Promise.resolve({ id: 'xyz' }) })

    expect(res.status).toBe(400)
  })
})
