import { describe, it, expect } from 'vitest'
import { buildComicVineUrl, parsePositiveInt, stripHtml } from './comicVineUrl'

describe('buildComicVineUrl', () => {
  it('includes the base Comic Vine URL', () => {
    const url = buildComicVineUrl('/characters/', { limit: 10, offset: 0 })
    expect(url).toContain('https://comicvine.gamespot.com/api/characters/')
  })

  it('always includes api_key and format=json', () => {
    const url = buildComicVineUrl('/characters/', { limit: 10, offset: 0 })
    expect(url).toContain('api_key=')
    expect(url).toContain('format=json')
  })

  it('includes provided query params', () => {
    const url = buildComicVineUrl('/characters/', { filter: 'name:Spider', limit: 5, offset: 0 })
    expect(url).toContain('filter=name%3ASpider')
    expect(url).toContain('limit=5')
    expect(url).toContain('offset=0')
  })

  it('includes field_list when provided', () => {
    const url = buildComicVineUrl('/character/4005-1234/', { field_list: 'id,name,image' })
    expect(url).toContain('field_list=id%2Cname%2Cimage')
  })
})

describe('parsePositiveInt', () => {
  it('returns the number when valid', () => {
    expect(parsePositiveInt('5', 1, 100, 10)).toBe(5)
  })

  it('returns default when value is missing', () => {
    expect(parsePositiveInt(null, 1, 100, 10)).toBe(10)
  })

  it('clamps to min when below range', () => {
    expect(parsePositiveInt('0', 1, 100, 10)).toBe(1)
  })

  it('clamps to max when above range', () => {
    expect(parsePositiveInt('999', 1, 100, 10)).toBe(100)
  })

  it('returns default when NaN', () => {
    expect(parsePositiveInt('abc', 1, 100, 10)).toBe(10)
  })
})

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World')
  })

  it('returns empty string for null/undefined', () => {
    expect(stripHtml(null)).toBe('')
    expect(stripHtml(undefined)).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(stripHtml('Hello World')).toBe('Hello World')
  })
})
