export interface ThrottledFn<T extends (...args: never[]) => void> {
  (...args: Parameters<T>): void
  /** Cancel any pending trailing-edge call */
  cancel(): void
}

/**
 * Creates a throttled version of a function that fires at most once per interval.
 *
 * - First call fires immediately.
 * - Subsequent calls within the interval are suppressed, but the latest args
 *   are saved and forwarded when the interval expires (trailing edge).
 * - This guarantees the final call is never lost.
 * - Call `.cancel()` to clear any pending trailing-edge timer.
 */
export function makeThrottled<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number
): ThrottledFn<T> {
  let lastCallTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  const throttled = (...args: Parameters<T>): void => {
    const now = Date.now()
    const elapsed = now - lastCallTime

    if (elapsed >= intervalMs) {
      // Enough time has passed — fire immediately
      lastCallTime = now
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      pendingArgs = null
      fn(...args)
    } else {
      // Within the interval — save args for trailing-edge delivery
      pendingArgs = args
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null
          lastCallTime = Date.now()
          if (pendingArgs !== null) {
            fn(...pendingArgs)
            pendingArgs = null
          }
        }, intervalMs - elapsed)
      }
    }
  }

  throttled.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    pendingArgs = null
  }

  return throttled
}
