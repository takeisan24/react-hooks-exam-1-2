import { useId } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { AccountFields } from './AccountFields'
import { PasswordFields } from './PasswordFields'
import type { SignUpFieldGroupProps } from './types'
import { useSignUpForm } from './useSignUpForm'

export function SignUpForm() {
  const headingId = useId()
  const form = useSignUpForm()

  const fieldGroupProps: SignUpFieldGroupProps = {
    values: form.values,
    onChange: form.updateField,
    registerInput: form.registerInput,
    showValidation: form.isSubmitAttempted,
    disabled: form.isSubmitting,
  }

  return (
    // noValidate: the fields show their own errors instead of the browser's bubbles.
    <Stack
      key={form.formVersion}
      component="form"
      aria-labelledby={headingId}
      noValidate
      spacing={2}
      onSubmit={form.handleSubmit}
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

      <AccountFields {...fieldGroupProps} usernameServerError={form.usernameServerError} />
      <PasswordFields {...fieldGroupProps} />

      {/* Stays enabled while the form is invalid: clicking it explains what is missing. */}
      <Button
        type="submit"
        variant="contained"
        loading={form.isSubmitting}
        sx={{ alignSelf: 'flex-start' }}
      >
        Create account
      </Button>

      {form.createdAccount && (
        <Alert severity="success" onClose={form.dismissCreatedAccount}>
          Account created for <strong>{form.createdAccount.username}</strong> (
          {form.createdAccount.email}). Demo only — no data left your browser.
        </Alert>
      )}
    </Stack>
  )
}
