import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { ValidatedInput } from './ValidatedInput'
import { registerAccount } from './registerAccount'
import {
  createConfirmPasswordValidator,
  validateEmail,
  validatePassword,
  validateUsername,
} from './validators'

interface CreatedAccount {
  username: string
  email: string
}

export function SignUpForm() {
  const headingId = useId()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameServerError, setUsernameServerError] = useState<string | null>(null)
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null)
  // Bumped after a successful sign-up to remount the fields, which resets their dirty state.
  const [formVersion, setFormVersion] = useState(0)

  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const validateConfirmPassword = useMemo(
    () => createConfirmPasswordValidator(password),
    [password],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setCreatedAccount(null)

    // Each field holds its own error in state; re-run the same validators here so the
    // form knows the result synchronously, at submit time.
    const fields = [
      { error: validateUsername(username), ref: usernameRef },
      { error: validateEmail(email), ref: emailRef },
      { error: validatePassword(password), ref: passwordRef },
      { error: validateConfirmPassword(confirmPassword), ref: confirmPasswordRef },
    ]
    const firstInvalid = fields.find((field) => field.error !== null)
    if (firstInvalid) {
      // Reveal the errors of fields the user never typed in, too.
      setIsSubmitAttempted(true)
      firstInvalid.ref.current?.focus()
      return
    }

    setIsSubmitting(true)
    const result = await registerAccount({ username, email, password })

    if (!result.ok) {
      // The fields are disabled while submitting; commit the re-enabled DOM first so
      // the username input can take focus.
      flushSync(() => {
        setIsSubmitting(false)
        setUsernameServerError(result.usernameError)
      })
      usernameRef.current?.focus()
      return
    }

    setIsSubmitting(false)
    setCreatedAccount({ username, email })
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setIsSubmitAttempted(false)
    setFormVersion((version) => version + 1)
  }

  return (
    // noValidate: the fields show their own errors instead of the browser's bubbles.
    <Stack
      key={formVersion}
      component="form"
      aria-labelledby={headingId}
      noValidate
      spacing={2}
      onSubmit={handleSubmit}
    >
      <Box sx={{ mb: 1 }}>
        <Typography id={headingId} variant="h6" component="h3">
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fields marked{' '}
          <Box component="span" aria-hidden sx={{ color: 'error.main' }}>
            *
          </Box>{' '}
          are required.
        </Typography>
      </Box>

      <ValidatedInput
        ref={usernameRef}
        label="Username"
        value={username}
        onChange={(value) => {
          setUsername(value)
          setUsernameServerError(null)
        }}
        validate={validateUsername}
        externalError={usernameServerError}
        hint="3–20 characters: letters, numbers or underscores"
        placeholder="e.g. john_doe"
        showValidation={isSubmitAttempted}
        disabled={isSubmitting}
        required
        autoComplete="username"
      />
      <ValidatedInput
        ref={emailRef}
        label="Email"
        value={email}
        onChange={setEmail}
        validate={validateEmail}
        placeholder="name@example.com"
        showValidation={isSubmitAttempted}
        disabled={isSubmitting}
        required
        inputMode="email"
        autoComplete="email"
      />
      <ValidatedInput
        ref={passwordRef}
        label="Password"
        value={password}
        onChange={setPassword}
        validate={validatePassword}
        hint="At least 8 characters, including a letter and a number"
        placeholder="Create a password"
        showValidation={isSubmitAttempted}
        disabled={isSubmitting}
        required
        type="password"
        autoComplete="new-password"
      />
      <ValidatedInput
        ref={confirmPasswordRef}
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        validate={validateConfirmPassword}
        placeholder="Re-enter your password"
        showValidation={isSubmitAttempted}
        disabled={isSubmitting}
        required
        type="password"
        autoComplete="new-password"
      />

      {/* Stays enabled while the form is invalid: clicking it explains what is missing. */}
      <Button
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ alignSelf: 'flex-start' }}
      >
        Create account
      </Button>

      {createdAccount && (
        <Alert severity="success" onClose={() => setCreatedAccount(null)}>
          Account created for <strong>{createdAccount.username}</strong> ({createdAccount.email}).
          Demo only — no data left your browser.
        </Alert>
      )}
    </Stack>
  )
}
