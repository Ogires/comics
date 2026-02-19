import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('renders page info', () => {
    render(<Pagination currentPage={2} totalPages={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('calls onPrev when Previous is clicked', async () => {
    const onPrev = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPrev={onPrev} onNext={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /common\.previous/i }))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when Next is clicked', async () => {
    const onNext = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPrev={vi.fn()} onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: /common\.next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('disables Previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /common\.previous/i })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /common\.next/i })).toBeDisabled()
  })
})
