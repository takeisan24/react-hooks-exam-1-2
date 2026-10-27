import {
  createConfirmPasswordValidator,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../validators'
import type { SignUpField, SignUpValues } from './types'

// Each field holds its own error in state; the form re-runs the same validators so it
// knows the result synchronously, at submit time. Listed in on-screen order.
export function findFirstInvalidField(values: SignUpValues): SignUpField | null {
  const checks: [SignUpField, string | null][] = [
    ['username', validateUsername(values.username)],
    ['email', validateEmail(values.email)],
    ['password', validatePassword(values.password)],
    ['confirmPassword', createConfirmPasswordValidator(values.password)(values.confirmPassword)],
  ]
  return checks.find(([, error]) => error !== null)?.[0] ?? null
}
