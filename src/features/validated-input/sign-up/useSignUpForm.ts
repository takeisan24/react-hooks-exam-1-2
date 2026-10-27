import { useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { registerAccount } from './registerAccount'
import type { SignUpField, SignUpValues } from './types'
import { findFirstInvalidField } from './validateSignUp'

const EMPTY_VALUES: SignUpValues = { username: '', email: '', password: '', confirmPassword: '' }

interface CreatedAccount {
  username: string
  email: string
}

// All state and submit logic of the sign-up form; the components only render.
export function useSignUpForm() {
  const [values, setValues] = useState<SignUpValues>(EMPTY_VALUES)
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameServerError, setUsernameServerError] = useState<string | null>(null)
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null)
  // Bumped after a successful sign-up. Used as the form's key to remount the fields,
  // which resets their dirty state.
  const [formVersion, setFormVersion] = useState(0)

  // One ref holding every input, filled through registerInput's callback refs.
  const inputsRef = useRef<Partial<Record<SignUpField, HTMLInputElement | null>>>({})
  const registerInput = (field: SignUpField) => (input: HTMLInputElement | null) => {
    inputsRef.current[field] = input
  }

  const updateField = (field: SignUpField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // The server error was about the submitted username; editing it makes the error stale.
    if (field === 'username') setUsernameServerError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setCreatedAccount(null)

    const firstInvalid = findFirstInvalidField(values)
    if (firstInvalid !== null) {
      // Reveal the errors of fields the user never typed in, too.
      setIsSubmitAttempted(true)
      inputsRef.current[firstInvalid]?.focus()
      return
    }

    const { username, email, password } = values
    setIsSubmitting(true)
    const result = await registerAccount({ username, email, password })

    if (!result.ok) {
      // The fields are disabled while submitting; commit the re-enabled DOM first so
      // the username input can take focus.
      flushSync(() => {
        setIsSubmitting(false)
        setUsernameServerError(result.usernameError)
      })
      inputsRef.current.username?.focus()
      return
    }

    setIsSubmitting(false)
    setCreatedAccount({ username, email })
    setValues(EMPTY_VALUES)
    setIsSubmitAttempted(false)
    setFormVersion((version) => version + 1)
  }

  return {
    values,
    updateField,
    registerInput,
    isSubmitAttempted,
    isSubmitting,
    usernameServerError,
    createdAccount,
    dismissCreatedAccount: () => setCreatedAccount(null),
    formVersion,
    handleSubmit,
  }
}
