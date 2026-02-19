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
    description: '<p>First appearance of Spider-Man</p>',
    volume: { name: 'Amazing Fantasy' },
    cover_date: '1962-08-01',
    person_credits: [{ name: 'Stan Lee', role: 'writer' }],
  },
  status_code: 1,
}

describe('GET /api/issues/[id]', () => {
  it('returns issue with stripped description HTML', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockIssue),
    } as Response)

    const req = new NextRequest('http://localhost/api/issues/9999')
    const res = await GET(req, { params: Promise.resolve({ id: '9999' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.description).toBe('First appearance of Spider-Man')
  })

  it('returns 400 for invalid id', async () => {
    const req = new NextRequest('http://localhost/api/issues/xyz')
    const res = await GET(req, { params: Promise.resolve({ id: 'xyz' }) })

    expect(res.status).toBe(400)
  })
})
