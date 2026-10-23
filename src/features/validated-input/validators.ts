import type { Validator } from './ValidatedInput'

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/
// Pragmatic check (something@something.tld) — full RFC 5322 is out of scope.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateUsername: Validator = (value) => {
  if (value.trim() === '') return 'Username is required'
  if (!USERNAME_PATTERN.test(value)) return 'Use only letters (a–z), numbers and underscores'
  if (value.length < 3 || value.length > 20) return 'Username must be 3–20 characters long'
  return null
}

export const validateEmail: Validator = (value) => {
  if (value.trim() === '') return 'Email is required'
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address, e.g. name@example.com'
  return null
}

// Not trimmed: whitespace is a legitimate password character.
export const validatePassword: Validator = (value) => {
  if (value === '') return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Za-z]/.test(value)) return 'Password must include at least one letter'
  if (!/\d/.test(value)) return 'Password must include at least one number'
  return null
}
