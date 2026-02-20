# Collections + Reading Tracker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add personal comic collections with reading progress tracking to comics-explorer.

**Architecture:** Two new Supabase tables (`collections`, `collection_items`) with RLS. New Next.js pages for listing and detail. Existing issue detail page gets "Add to collection" UI replacing the flat favorites button.

**Tech Stack:** Next.js 16, React 19, Supabase (PostgreSQL + RLS), TypeScript, Tailwind CSS, Vitest, react-i18next

**Working directory:** `F:\2026\Master\TFM\Op02\analisis-funcionalidad\comics-explorer`

---

## Task 1: Supabase Schema

**Files:**
- Create: `supabase/migrations/20260220_collections.sql`

**Step 1: Write the migration SQL**

```sql
-- collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) <= 100),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- collection_items table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  issue_id integer NOT NULL,
  issue_title text,
  issue_thumbnail text,
  reading_status text NOT NULL DEFAULT 'pending'
    CHECK (reading_status IN ('pending', 'reading', 'read')),
  owned boolean NOT NULL DEFAULT false,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, issue_id)
);

-- RLS: collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS: collection_items (via collection ownership)
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in own collections"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into own collections"
  ON public.collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own collections"
  ON public.collection_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own collections"
  ON public.collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON public.collection_items(collection_id);
```

**Step 2: Apply migration in Supabase**

Run this SQL in the Supabase Dashboard → SQL Editor.

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add collections and collection_items schema with RLS"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `types/index.ts`

**Step 1: Add collection types after the existing `Favorite` interface**

```typescript
// Collections

export type ReadingStatus = 'pending' | 'reading' | 'read'

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  issue_id: number
  issue_title: string | null
  issue_thumbnail: string | null
  reading_status: ReadingStatus
  owned: boolean
  added_at: string
}

export interface CollectionWithProgress extends Collection {
  total_items: number
  read_items: number
  owned_items: number
  items: CollectionItem[]
}
```

**Step 2: Commit**

```bash
git add types/
git commit -m "feat: add Collection and CollectionItem types"
```

---

## Task 3: Collections Data Access Layer

**Files:**
- Create: `lib/collections.ts`
- Test: `lib/collections.test.ts`

**Step 1: Write the data access functions**

Create `lib/collections.ts` with functions for:
- `getUserCollections(supabase, userId)` — list all collections with item counts + read counts
- `getCollection(supabase, collectionId)` — get one collection with its items
- `createCollection(supabase, userId, name, description?)` — create new collection
- `updateCollection(supabase, collectionId, name, description?)` — rename/update
- `deleteCollection(supabase, collectionId)` — delete collection
- `addItemToCollection(supabase, collectionId, issueData)` — add issue
- `removeItemFromCollection(supabase, itemId)` — remove issue
- `updateReadingStatus(supabase, itemId, status)` — change reading status
- `updateOwnedStatus(supabase, itemId, owned)` — change owned status
- `getCollectionsForIssue(supabase, userId, issueId)` — which collections contain this issue

All functions should validate inputs (name length, valid status) before calling Supabase. Return `{ data, error }` pattern consistent with Supabase.

**Step 2: Write unit tests**

Create `lib/collections.test.ts` testing input validation logic:
- Name too long (>100 chars) returns error
- Empty name returns error
- Invalid reading status returns error
- Valid inputs call Supabase correctly (mock Supabase client)

```bash
npx vitest run lib/collections.test.ts
```

**Step 3: Commit**

```bash
git add lib/collections.ts lib/collections.test.ts
git commit -m "feat: add collections data access layer with tests"
```

---

## Task 4: Middleware Update

**Files:**
- Modify: `middleware.ts`

**Step 1: Extend protected routes to include `/collections`**

Update the middleware matcher and redirect logic:

```typescript
// Change this:
if (!session && request.nextUrl.pathname.startsWith('/favorites')) {

// To this:
const protectedPaths = ['/favorites', '/collections']
if (!session && protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
```

Update matcher:
```typescript
export const config = {
  matcher: ['/favorites/:path*', '/collections/:path*'],
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect /collections routes in middleware"
```

---

## Task 5: i18n Translations

**Files:**
- Modify: `i18n/es-ES.ts`
- Modify: `i18n/en-US.ts`

**Step 1: Add collection strings to both language files**

Add a new `collections` namespace and `readingStatus` keys:

```typescript
// es-ES
collections: {
  title: 'Mis Colecciones',
  empty: 'Aún no tienes colecciones.',
  create: 'Crear colección',
  new: 'Nueva colección',
  name: 'Nombre',
  namePlaceholder: 'Ej: Saga de Batman',
  description: 'Descripción (opcional)',
  descriptionPlaceholder: 'Breve descripción de esta colección',
  save: 'Guardar',
  cancel: 'Cancelar',
  edit: 'Editar',
  delete: 'Eliminar',
  deleteConfirm: '¿Eliminar esta colección? Los cómics no se borrarán de la base de datos.',
  progress: '{{read}} de {{total}} leídos',
  addTo: 'Añadir a colección',
  removeFrom: 'Quitar de la colección',
  alreadyIn: 'Ya está en esta colección',
  issuesCount: '{{count}} issue(s)',
  noIssues: 'Esta colección está vacía. Busca personajes y añade issues.',
},
readingStatus: {
  pending: 'Por leer',
  reading: 'Leyendo',
  read: 'Leído',
},
ownershipStatus: {
  owned: 'En propiedad',
  notOwned: 'No en propiedad',
},
```

```typescript
// en-US
collections: {
  title: 'My Collections',
  empty: 'You have no collections yet.',
  create: 'Create collection',
  new: 'New collection',
  name: 'Name',
  namePlaceholder: 'E.g: Batman Saga',
  description: 'Description (optional)',
  descriptionPlaceholder: 'Brief description of this collection',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  deleteConfirm: 'Delete this collection? Comics won\'t be removed from the database.',
  progress: '{{read}} of {{total}} read',
  addTo: 'Add to collection',
  removeFrom: 'Remove from collection',
  alreadyIn: 'Already in this collection',
  issuesCount: '{{count}} issue(s)',
  noIssues: 'This collection is empty. Search characters and add issues.',
},
readingStatus: {
  pending: 'To read',
  reading: 'Reading',
  read: 'Read',
},
ownershipStatus: {
  owned: 'Owned',
  notOwned: 'Not owned',
},
```

**Step 2: Commit**

```bash
git add i18n/
git commit -m "feat: add i18n strings for collections"
```

---

## Task 6: Collections List Page

**Files:**
- Create: `app/collections/page.tsx` — server component (fetch collections)
- Create: `app/collections/CollectionsList.tsx` — client component (UI)
- Create: `app/collections/CreateCollectionForm.tsx` — client component (form)
- Create: `components/CollectionCard.tsx` — reusable card
- Create: `components/ProgressBar.tsx` — reading progress bar

**Step 1: Create `ProgressBar.tsx`**

Simple component: receives `value` (0-100) and renders a styled bar.

**Step 2: Create `CollectionCard.tsx`**

Shows collection name, description truncated, issue count, progress bar, and up to 3 thumbnail previews.

**Step 3: Create `CreateCollectionForm.tsx`**

Client form with name input (required, max 100 chars) and description textarea (optional, max 500 chars). Calls `createCollection` on submit. Shows validation errors.

**Step 4: Create `CollectionsList.tsx`**

Client component rendering the grid of `CollectionCard` components, the "Create collection" button that shows/hides the form, and empty state.

**Step 5: Create `page.tsx`**

Server component: fetch user, redirect if not logged in, fetch collections with progress, render `CollectionsList`.

```typescript
// app/collections/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CollectionsList from './CollectionsList'

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: collections } = await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Transform to add progress
  const collectionsWithProgress = (collections ?? []).map(c => ({
    ...c,
    total_items: c.collection_items.length,
    read_items: c.collection_items.filter(i => i.reading_status === 'read').length,
    owned_items: c.collection_items.filter(i => i.owned).length,
    items: c.collection_items,
  }))

  return <CollectionsList collections={collectionsWithProgress} />
}
```

**Step 6: Commit**

```bash
git add app/collections/ components/CollectionCard.tsx components/ProgressBar.tsx
git commit -m "feat: add collections list page with create form"
```

---

## Task 7: Collection Detail Page

**Files:**
- Create: `app/collections/[id]/page.tsx` — server component
- Create: `app/collections/[id]/CollectionDetail.tsx` — client component
- Create: `components/ReadingStatusBadge.tsx` — clickable badge
- Create: `components/OwnedBadge.tsx` — clickable badge para estado de posesión

**Step 1: Create `ReadingStatusBadge.tsx`**

A badge that shows the current status with color coding:
- `pending` → slate/gray
- `reading` → amber/yellow
- `read` → green

Clicking cycles through statuses: pending → reading → read → pending.

**Step 2: Create `CollectionDetail.tsx`**

Client component showing:
- Header with name, description, edit/delete buttons
- Progress bar
- Grid of issues with thumbnail, title, y badges `ReadingStatusBadge` y `OwnedBadge`
- Button to remove issue from collection
- Empty state with link to home search

**Step 3: Create `page.tsx`**

Server component: validates UUID param, fetches collection with items, verifies ownership, renders `CollectionDetail`.

**Step 4: Commit**

```bash
git add app/collections/[id]/ components/ReadingStatusBadge.tsx components/OwnedBadge.tsx
git commit -m "feat: add collection detail page with reading and ownership tracker"
```

---

## Task 8: Update Issue Detail — "Add to Collection"

**Files:**
- Modify: `app/issue/[id]/page.tsx`
- Modify: `app/issue/[id]/IssueDetail.tsx`
- Create: `components/AddToCollectionModal.tsx`

**Step 1: Create `AddToCollectionModal.tsx`**

A dropdown/modal component that:
- Lists the user's collections
- Shows a checkmark on collections that already contain this issue
- Allows clicking to toggle add/remove
- Has a "Create new collection" inline form at the bottom
- Receives `userId`, `issueId`, `issueTitle`, `issueThumbnail` as props

**Step 2: Update `IssueDetail.tsx`**

Replace the single "Add to favorites" button with an "Add to collection" button that opens the modal. Keep backward compatibility: if the user has no collections, still offer to create one.

**Step 3: Update `page.tsx`**

Fetch the user's collections and which ones contain this issue (use `getCollectionsForIssue`). Pass the data to `IssueDetail`.

**Step 4: Commit**

```bash
git add app/issue/ components/AddToCollectionModal.tsx
git commit -m "feat: replace favorites with add-to-collection on issue page"
```

---

## Task 9: Navbar Update

**Files:**
- Modify: `components/Navbar.tsx`

**Step 1: Add "Collections" link to Navbar**

Add a link to `/collections` next to the existing "Favorites" link. Only show when user is logged in. Consider keeping "Favorites" for backward compat or removing it.

**Step 2: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: add Collections link to navbar"
```

---

## Task 10: Component Tests

**Files:**
- Create: `components/ProgressBar.test.tsx`
- Create: `components/ReadingStatusBadge.test.tsx`

**Step 1: Write ProgressBar tests**

```typescript
// Test cases:
// - Renders 0% progress correctly
// - Renders 50% progress correctly
// - Renders 100% progress correctly
// - Has proper aria attributes (role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax)
```

**Step 2: Write ReadingStatusBadge tests**

```typescript
// Test cases:
// - Renders 'pending' state with correct text
// - Renders 'reading' state with correct text
// - Renders 'read' state with correct text
// - Calls onChange when clicked
```

**Step 3: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add components/ProgressBar.test.tsx components/ReadingStatusBadge.test.tsx
git commit -m "test: add ProgressBar and ReadingStatusBadge tests"
```

---

## Verification Plan

### Automated Tests

```bash
# Run all unit tests
cd F:\2026\Master\TFM\Op02\analisis-funcionalidad\comics-explorer
npx vitest run
```

All tests should pass, including:
- Existing: `Pagination.test.tsx`, `comicVineUrl.test.ts`, `route.test.ts`
- New: `collections.test.ts`, `ProgressBar.test.tsx`, `ReadingStatusBadge.test.tsx`, `OwnedBadge.test.tsx`

### Manual Verification (user)

1. **Login** → Navigate to `/collections` → See empty state
2. **Create collection** → Fill name "Test Collection" → See it in list
3. **Search a character** → Go to a character → Click an issue
4. **Add to collection** → Click "Add to collection" → Select "Test Collection"
5. **View collection** → Navigate to `/collections` → Click "Test Collection" → See the issue
6. **Change reading status** → Click the status badge → See it cycle through states
7. **Change ownership status** → Click the owned toggle/badge → See it change visually
8. **Progress bar** → Mark issue as read → See progress update
9. **Delete from collection** → Remove an issue → See it disappear
10. **Delete collection** → Delete "Test Collection" → Confirm → See it gone
11. **Middleware** → Logout → Navigate to `/collections` → Should redirect to `/login`
