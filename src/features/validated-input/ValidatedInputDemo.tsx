import { Stack } from '@mui/material'
import { ValidatedInput } from './ValidatedInput'
import { validateEmail, validatePassword, validateUsername } from './validators'

export function ValidatedInputDemo() {
  return (
    // A <form> lets password managers and browsers treat the fields as a sign-up form.
    // There is nothing to submit, so Enter is a no-op.
    <Stack component="form" noValidate spacing={2} onSubmit={(event) => event.preventDefault()}>
      <ValidatedInput
        label="Username"
        validate={validateUsername}
        hint="3–20 characters: letters, numbers or underscores"
        required
        autoComplete="username"
      />
      <ValidatedInput
        label="Email"
        validate={validateEmail}
        hint="e.g. name@example.com"
        required
        inputMode="email"
        autoComplete="email"
      />
      <ValidatedInput
        label="Password"
        validate={validatePassword}
        hint="At least 8 characters, including a letter and a number"
        required
        type="password"
        autoComplete="new-password"
      />
    </Stack>
  )
}
