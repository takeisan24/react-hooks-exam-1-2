import { ValidatedInput } from '../ValidatedInput'
import { validateEmail, validateUsername } from '../validators'
import type { SignUpFieldGroupProps } from './types'

interface AccountFieldsProps extends SignUpFieldGroupProps {
  usernameServerError: string | null
}

export function AccountFields({
  values,
  onChange,
  registerInput,
  showValidation,
  disabled,
  usernameServerError,
}: AccountFieldsProps) {
  return (
    <>
      <ValidatedInput
        ref={registerInput('username')}
        label="Username"
        value={values.username}
        onChange={(value) => onChange('username', value)}
        validate={validateUsername}
        externalError={usernameServerError}
        hint="3–20 characters: letters, numbers or underscores"
        placeholder="e.g. john_doe"
        showValidation={showValidation}
        disabled={disabled}
        required
        autoComplete="username"
      />
      <ValidatedInput
        ref={registerInput('email')}
        label="Email"
        value={values.email}
        onChange={(value) => onChange('email', value)}
        validate={validateEmail}
        placeholder="name@example.com"
        showValidation={showValidation}
        disabled={disabled}
        required
        inputMode="email"
        autoComplete="email"
      />
    </>
  )
}
