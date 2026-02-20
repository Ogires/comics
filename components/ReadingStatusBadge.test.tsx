import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReadingStatusBadge from './ReadingStatusBadge'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('ReadingStatusBadge', () => {
  it('renders pending state', () => {
    render(<ReadingStatusBadge status="pending" onChange={vi.fn()} />)
    expect(screen.getByText('readingStatus.pending')).toBeDefined()
  })

  it('renders reading state', () => {
    render(<ReadingStatusBadge status="reading" onChange={vi.fn()} />)
    expect(screen.getByText('readingStatus.reading')).toBeDefined()
  })

  it('renders read state', () => {
    render(<ReadingStatusBadge status="read" onChange={vi.fn()} />)
    expect(screen.getByText('readingStatus.read')).toBeDefined()
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    render(<ReadingStatusBadge status="pending" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith('reading')
  })
})
