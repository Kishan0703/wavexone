import { createContext, use, useEffect, useMemo, useRef, useState } from 'react'

import { createBackend } from './index'
import type { WaveXBackend } from './contract'
import { BackendError, userMessageFor } from './errors'

/**
 * Gives the app exactly one backend instance.
 *
 * It matters that this is a single instance rather than a module singleton:
 * the duplicate-submission memo in `Gate` lives on the instance, so two
 * backends would mean two memos and a mutation could run twice.
 */

const BackendContext = createContext<WaveXBackend | null>(null)

export function BackendProvider({
  children,
  backend,
}: {
  children: React.ReactNode
  /** Injected in tests; the app leaves it undefined. */
  backend?: WaveXBackend
}) {
  const value = useMemo(() => backend ?? createBackend(), [backend])
  return <BackendContext value={value}>{children}</BackendContext>
}

export function useBackend(): WaveXBackend {
  const backend = use(BackendContext)
  if (!backend) throw new Error('useBackend must be used inside <BackendProvider>')
  return backend
}

export type QueryState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: string }

/**
 * Minimal read hook.
 *
 * Reads only — there is no `useMutation` counterpart on purpose. Guide §6.4
 * forbids automatic retries on every mutating call, and the value of a
 * mutation hook is mostly the retry and refetch behaviour that would be
 * illegal here. Mutations go through `useBackend()` from an explicit handler.
 */
export function useBackendQuery<T>(
  key: string,
  read: (backend: WaveXBackend) => Promise<T>,
): QueryState<T> {
  const backend = useBackend()
  // The result carries the key it belongs to, so a stale one can be spotted
  // during render instead of being cleared by a second setState.
  const [state, setState] = useState<QueryState<T> & { key: string }>({
    status: 'loading',
    key,
  })

  // `read` is a fresh closure every render, so it cannot be a dependency
  // without refetching forever. `key` is what describes the read; changing it
  // is what should re-run one.
  const latestRead = useRef(read)
  useEffect(() => {
    latestRead.current = read
  })

  useEffect(() => {
    let cancelled = false

    // `Promise.resolve().then(…)` rather than calling `read` directly: a read
    // that throws synchronously would otherwise escape the rejection handler
    // below and surface as an error thrown from the effect, which is the one
    // failure this hook exists to turn into a message.
    Promise.resolve()
      .then(() => latestRead.current(backend))
      .then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data, key })
      },
      (error: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          // Guide §5: server wording is for diagnostics, not for the user.
          error:
            error instanceof BackendError
              ? userMessageFor(error)
              : 'Something went wrong. Try again.',
          key,
        })
      },
    )

    return () => {
      cancelled = true
    }
  }, [key, backend])

  // A result from the previous key is another instrument's numbers. Report
  // loading rather than showing them under the new heading.
  return state.key === key ? state : { status: 'loading' }
}
