import { describe, it, expect } from 'vitest'
import {
  createCollection,
  updateCollection,
  updateReadingStatus,
} from './collections'
import { SupabaseClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabase = {} as SupabaseClient

describe('Collections Data Access', () => {
  describe('createCollection', () => {
    it('returns error if name is empty', async () => {
      const { error } = await createCollection(mockSupabase, 'user-id', '   ')
      expect(error?.message).toBe('Name is required')
    })

    it('returns error if name is > 100 chars', async () => {
      const longName = 'a'.repeat(101)
      const { error } = await createCollection(mockSupabase, 'user-id', longName)
      expect(error?.message).toBe('Name must be 100 characters or less')
    })

    it('returns error if description is > 500 chars', async () => {
      const longDesc = 'a'.repeat(501)
      const { error } = await createCollection(mockSupabase, 'user-id', 'Valid Name', longDesc)
      expect(error?.message).toBe('Description must be 500 characters or less')
    })
  })

  describe('updateCollection', () => {
    it('returns error if name is empty', async () => {
      const { error } = await updateCollection(mockSupabase, 'col-id', '   ')
      expect(error?.message).toBe('Name is required')
    })
  })

  describe('updateReadingStatus', () => {
    it('returns error if status is invalid', async () => {
      // @ts-ignore - testing runtime validation
      const { error } = await updateReadingStatus(mockSupabase, 'item-id', 'invalid-status')
      expect(error?.message).toBe('Invalid reading status')
    })
  })
})
