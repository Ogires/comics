import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockPayload = {
  results: [{ id: 1, name: 'Spider-Man', image: { medium_url: 'http://img.test/sm.jpg', super_url: '' } }],
  total_results: 1,
  limit: 20,
  offset: 0,
  status_code: 1,
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('GET /api/characters', () => {
  it('returns Comic Vine response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPayload),
    } as Response)

    const req = new NextRequest('http://localhost/api/characters?query=spider')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results[0].name).toBe('Spider-Man')
  })

  it('returns 502 when Comic Vine is down', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const req = new NextRequest('http://localhost/api/characters')
    const res = await GET(req)

    expect(res.status).toBe(502)
  })

  it('returns 502 when Comic Vine returns non-ok', async () => {
    mockFetch.mockResolvedValue({ ok: false } as Response)

    const req = new NextRequest('http://localhost/api/characters')
    const res = await GET(req)

    expect(res.status).toBe(502)
  })
})
