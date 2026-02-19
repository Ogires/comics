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
    issue_credits: [],
  },
  status_code: 1,
}

describe('GET /api/characters/[id]', () => {
  it('returns character with stripped deck HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCharacter),
    } as Response)

    const req = new NextRequest('http://localhost/api/characters/1234')
    const res = await GET(req, { params: Promise.resolve({ id: '1234' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.deck).toBe('Peter Parker')
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
