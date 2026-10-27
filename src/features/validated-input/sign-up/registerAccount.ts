import type { SignUpValues } from './types'

export type SignUpData = Omit<SignUpValues, 'confirmPassword'>

export type SignUpResult = { ok: true } | { ok: false; usernameError: string }

const FAKE_LATENCY_MS = 1000
const TAKEN_USERNAMES = new Set(['admin', 'root'])

// Stand-in for a sign-up API call. A taken username is something only the server
// can know, so it comes back as a result rather than from a client-side validator.
export function registerAccount({ username }: SignUpData): Promise<SignUpResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        TAKEN_USERNAMES.has(username.toLowerCase())
          ? { ok: false, usernameError: 'This username is already taken' }
          : { ok: true },
      )
    }, FAKE_LATENCY_MS)
  })
}
