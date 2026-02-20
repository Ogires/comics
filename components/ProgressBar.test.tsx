import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('renders 0% progress correctly', () => {
    render(<ProgressBar value={0} />)
    const pbar = screen.getByRole('progressbar')
    expect(pbar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('renders 50% progress correctly', () => {
    render(<ProgressBar value={50} />)
    const pbar = screen.getByRole('progressbar')
    expect(pbar.getAttribute('aria-valuenow')).toBe('50')
  })

  it('renders 100% progress correctly', () => {
    render(<ProgressBar value={100} />)
    const pbar = screen.getByRole('progressbar')
    expect(pbar.getAttribute('aria-valuenow')).toBe('100')
  })

  it('clamps values below 0', () => {
    render(<ProgressBar value={-10} />)
    const pbar = screen.getByRole('progressbar')
    expect(pbar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('clamps values above 100', () => {
    render(<ProgressBar value={150} />)
    const pbar = screen.getByRole('progressbar')
    expect(pbar.getAttribute('aria-valuenow')).toBe('100')
  })
})
