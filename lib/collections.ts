import { SupabaseClient } from '@supabase/supabase-js'
import { ReadingStatus } from '@/types'

export async function getUserCollections(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}

export async function getCollection(supabase: SupabaseClient, collectionId: string) {
  return await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('id', collectionId)
    .single()
}

export async function createCollection(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  description?: string
) {
  if (!name.trim()) return { data: null, error: new Error('Name is required') }
  if (name.length > 100) return { data: null, error: new Error('Name must be 100 characters or less') }
  if (description && description.length > 500) {
    return { data: null, error: new Error('Description must be 500 characters or less') }
  }

  return await supabase
    .from('collections')
    .insert([{ user_id: userId, name: name.trim(), description: description?.trim() || null }])
    .select()
    .single()
}

export async function updateCollection(
  supabase: SupabaseClient,
  collectionId: string,
  name: string,
  description?: string
) {
  if (!name.trim()) return { data: null, error: new Error('Name is required') }
  if (name.length > 100) return { data: null, error: new Error('Name must be 100 characters or less') }
  if (description && description.length > 500) {
    return { data: null, error: new Error('Description must be 500 characters or less') }
  }

  return await supabase
    .from('collections')
    .update({ name: name.trim(), description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', collectionId)
    .select()
    .single()
}

export async function deleteCollection(supabase: SupabaseClient, collectionId: string) {
  return await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
}

export async function addItemToCollection(
  supabase: SupabaseClient,
  collectionId: string,
  issueData: {
    issue_id: number
    issue_title?: string
    issue_thumbnail?: string
  }
) {
  return await supabase
    .from('collection_items')
    .insert([
      {
        collection_id: collectionId,
        issue_id: issueData.issue_id,
        issue_title: issueData.issue_title,
        issue_thumbnail: issueData.issue_thumbnail,
      },
    ])
    .select()
    .single()
}

export async function removeItemFromCollection(supabase: SupabaseClient, itemId: string) {
  return await supabase
    .from('collection_items')
    .delete()
    .eq('id', itemId)
}

export async function updateReadingStatus(
  supabase: SupabaseClient,
  itemId: string,
  status: ReadingStatus
) {
  if (!['pending', 'reading', 'read'].includes(status)) {
    return { data: null, error: new Error('Invalid reading status') }
  }

  return await supabase
    .from('collection_items')
    .update({ reading_status: status })
    .eq('id', itemId)
    .select()
    .single()
}

export async function updateOwnedStatus(
  supabase: SupabaseClient,
  itemId: string,
  owned: boolean
) {
  return await supabase
    .from('collection_items')
    .update({ owned })
    .eq('id', itemId)
    .select()
    .single()
}

export async function getCollectionsForIssue(
  supabase: SupabaseClient,
  userId: string,
  issueId: number
) {
  return await supabase
    .from('collections')
    .select('*, collection_items!inner(*)')
    .eq('user_id', userId)
    .eq('collection_items.issue_id', issueId)
}
