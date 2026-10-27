import { useEffect, useId, useState, type Ref } from 'react'
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
  value: string
  onChange: (value: string) => void
  validate: Validator
  /** Shown under the input while there is no error to display. */
  hint?: string
  placeholder?: string
  /**
   * Show the validation result even if the user has not typed yet —
   * set by the parent form after a submit attempt.
   */
  showValidation?: boolean
  /** An error the validator cannot know about, e.g. one returned by the server. */
  externalError?: string | null
  disabled?: boolean
  /** Forwarded to the native input, so the parent form can focus the first invalid field. */
  ref?: Ref<HTMLInputElement>
  required?: boolean
  /** `password` also renders a show/hide toggle. */
  type?: 'text' | 'password'
  inputMode?: 'text' | 'email'
  autoComplete?: string
}

export function ValidatedInput({
  label,
  value,
  onChange,
  validate,
  hint,
  placeholder,
  showValidation = false,
  externalError = null,
  disabled = false,
  ref,
  required = false,
  type = 'text',
  inputMode = 'text',
  autoComplete,
}: ValidatedInputProps) {
  const id = useId()
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
  // The validator's error wins: the parent clears `externalError` when the value changes.
  const displayedError = error ?? externalError
  const isRevealed = isDirty || showValidation
  const showError = isRevealed && displayedError !== null
  const showValid = isRevealed && displayedError === null
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
        onChange(event.target.value)
        setIsDirty(true)
      }}
      inputRef={ref}
      placeholder={placeholder}
      disabled={disabled}
      type={isPassword && !isPasswordVisible ? 'password' : 'text'}
      required={required}
      autoComplete={autoComplete}
      error={showError}
      // Always render helper text (a blank line at minimum) so the layout does not
      // jump when an error appears.
      helperText={showError ? displayedError : (hint ?? ' ')}
      fullWidth
      slotProps={{
        input: { endAdornment },
        htmlInput: { inputMode, spellCheck: false },
        formHelperText: { 'aria-live': 'polite' },
      }}
    />
  )
}
