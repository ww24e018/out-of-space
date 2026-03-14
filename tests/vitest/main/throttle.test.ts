import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { makeThrottled } from '../../../src/main/throttle'

describe('makeThrottled', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires the first call immediately', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('suppresses calls within the interval', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)
    throttled(2)
    throttled(3)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('delivers the last suppressed call on trailing edge', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)
    throttled(2)
    throttled(3)

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
  })

  it('allows a new immediate call after the interval expires', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)
    vi.advanceTimersByTime(100)
    throttled(2)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  it('does not fire trailing edge if there were no suppressed calls', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)
    vi.advanceTimersByTime(200)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('handles rapid bursts correctly', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    // First burst: 1 fires immediately, 2+3 suppressed, trailing delivers 3
    throttled(1)
    throttled(2)
    throttled(3)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn.mock.calls.map((c) => c[0])).toEqual([1, 3])

    // Second burst after interval: 4 fires immediately, 5 suppressed, trailing delivers 5
    vi.advanceTimersByTime(100)
    throttled(4)
    throttled(5)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(4)
    expect(fn.mock.calls.map((c) => c[0])).toEqual([1, 3, 4, 5])
  })

  it('cancel prevents pending trailing-edge call', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled(1)
    throttled(2) // suppressed, pending trailing edge

    throttled.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('cancel is safe to call when nothing is pending', () => {
    const fn = vi.fn()
    const throttled = makeThrottled(fn, 100)

    throttled.cancel() // no-op
    throttled(1)
    throttled.cancel() // no pending trailing edge (first call fired immediately)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
