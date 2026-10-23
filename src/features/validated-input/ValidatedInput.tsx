import { useEffect, useId, useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

/**
 * Returns an error message when `value` is invalid, or `null` when it is valid.
 *
 * Validators must be pure and synchronous (StrictMode runs effects twice in development).
 * Declare them at module scope so their reference stays stable between renders —
 * an inline arrow function would re-run the validation effect after every render.
 */
export type Validator = (value: string) => string | null

interface ValidatedInputProps {
  label: string
  validate: Validator
  /** Shown under the input while there is no error to display. */
  hint?: string
  required?: boolean
  /** `password` also renders a show/hide toggle. */
  type?: 'text' | 'password'
  inputMode?: 'text' | 'email'
  autoComplete?: string
}

export function ValidatedInput({
  label,
  validate,
  hint,
  required = false,
  type = 'text',
  inputMode = 'text',
  autoComplete,
}: ValidatedInputProps) {
  const id = useId()
  const [value, setValue] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Equivalent of componentDidUpdate: re-validate after any render in which `value`
  // or `validate` changed. Without a dependency array this would run after every
  // render; with [] it would only ever validate the initial value.
  useEffect(() => {
    // The exam asks for useEffect-based validation. Deriving `error` during render
    // would avoid the extra render this setState causes.
    // oxlint-disable-next-line react/set-state-in-effect
    setError(validate(value))
  }, [value, validate])

  // The error is always computed (even on mount); `isDirty` only gates its display,
  // so an untouched empty field does not greet the user with "required".
  const showError = isDirty && error !== null
  const showValid = isDirty && error === null
  const isPassword = type === 'password'

  const endAdornment =
    showValid || isPassword ? (
      <InputAdornment position="end">
        {showValid && <CheckCircleIcon color="success" fontSize="small" />}
        {isPassword && (
          <IconButton
            edge="end"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            // Keep focus (and the caret) in the input while toggling.
            onMouseDown={(event) => event.preventDefault()}
          >
            {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        )}
      </InputAdornment>
    ) : undefined

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={(event) => {
        setValue(event.target.value)
        setIsDirty(true)
      }}
      type={isPassword && !isPasswordVisible ? 'password' : 'text'}
      required={required}
      autoComplete={autoComplete}
      error={showError}
      // Always render helper text (a blank line at minimum) so the layout does not
      // jump when an error appears.
      helperText={showError ? error : (hint ?? ' ')}
      fullWidth
      slotProps={{
        input: { endAdornment },
        htmlInput: { inputMode, spellCheck: false },
        formHelperText: { 'aria-live': 'polite' },
      }}
    />
  )
}
