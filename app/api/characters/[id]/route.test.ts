import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

const mockCharacter = {
  results: {
    id: 1234,
    name: 'Spider-Man',
    image: { medium_url: '', super_url: '' },
    deck: '<p>Peter Parker</p>',
    description: '<p>Spider-Man is a <strong>superhero</strong> from Marvel.</p>',
    real_name: 'Peter Parker',
    aliases: 'Spidey\nWeb-Slinger',
    publisher: { id: 31, name: 'Marvel' },
    origin: { id: 4, name: 'Human' },
    powers: [{ id: 1, name: 'Wall Crawling' }],
    teams: [{ id: 10, name: 'Avengers' }],
    first_appeared_in_issue: { id: 100, name: 'Amazing Fantasy #15', issue_number: '15' },
    creators: [{ id: 50, name: 'Stan Lee' }],
    count_of_issue_appearances: 5000,
    character_friends: [{ id: 200, name: 'Human Torch' }],
    character_enemies: [{ id: 300, name: 'Green Goblin' }],
    issue_credits: [],
  },
  status_code: 1,
}

describe('GET /api/characters/[id]', () => {
  it('returns character with stripped deck HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(structuredClone(mockCharacter)),
    } as Response)

    const req = new NextRequest('http://localhost/api/characters/1234')
    const res = await GET(req, { params: Promise.resolve({ id: '1234' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.deck).toBe('Peter Parker')
  })

  it('returns character with stripped description HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(structuredClone(mockCharacter)),
    } as Response)

    const req = new NextRequest('http://localhost/api/characters/1234')
    const res = await GET(req, { params: Promise.resolve({ id: '1234' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.description).toBe('Spider-Man is a superhero from Marvel.')
  })

  it('returns 400 for invalid id', async () => {
    const req = new NextRequest('http://localhost/api/characters/abc')
    const res = await GET(req, { params: Promise.resolve({ id: 'abc' }) })

    expect(res.status).toBe(400)
  })

  it('returns 502 on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))
    const req = new NextRequest('http://localhost/api/characters/1')
    const res = await GET(req, { params: Promise.resolve({ id: '1' }) })

    expect(res.status).toBe(502)
  })
})
