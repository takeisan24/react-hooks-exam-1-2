import { useMemo } from 'react'
import { ValidatedInput } from '../ValidatedInput'
import { createConfirmPasswordValidator, validatePassword } from '../validators'
import type { SignUpFieldGroupProps } from './types'

export function PasswordFields({
  values,
  onChange,
  registerInput,
  showValidation,
  disabled,
}: SignUpFieldGroupProps) {
  // A new password yields a new `validate` function, which re-runs the confirm field's
  // validation effect even though its own value did not change.
  const validateConfirmPassword = useMemo(
    () => createConfirmPasswordValidator(values.password),
    [values.password],
  )

  return (
    <>
      <ValidatedInput
        ref={registerInput('password')}
        label="Password"
        value={values.password}
        onChange={(value) => onChange('password', value)}
        validate={validatePassword}
        hint="At least 8 characters, including a letter and a number"
        placeholder="Create a password"
        showValidation={showValidation}
        disabled={disabled}
        required
        type="password"
        autoComplete="new-password"
      />
      <ValidatedInput
        ref={registerInput('confirmPassword')}
        label="Confirm password"
        value={values.confirmPassword}
        onChange={(value) => onChange('confirmPassword', value)}
        validate={validateConfirmPassword}
        placeholder="Re-enter your password"
        showValidation={showValidation}
        disabled={disabled}
        required
        type="password"
        autoComplete="new-password"
      />
    </>
  )
}
