import type { RefCallback } from 'react'

export interface SignUpValues {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type SignUpField = keyof SignUpValues

/** What every group of fields needs from the form. */
export interface SignUpFieldGroupProps {
  values: SignUpValues
  onChange: (field: SignUpField, value: string) => void
  /** Ref for a field's input, so the form can focus the first invalid one. */
  registerInput: (field: SignUpField) => RefCallback<HTMLInputElement>
  /** Reveal errors on untouched fields too — true after a submit attempt. */
  showValidation: boolean
  disabled: boolean
}
