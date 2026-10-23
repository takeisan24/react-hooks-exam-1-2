import { useId, useState } from 'react'
import { IconButton, Stack, TextField } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { TODO_MAX_LENGTH } from './types'

interface TodoEditFormProps {
  initialText: string
  onSave: (text: string) => void
  onCancel: () => void
}

// Mounted fresh every time editing starts, so useState(initialText) always picks up the
// current text — no effect is needed to sync the prop into state.
export function TodoEditForm({ initialText, onSave, onCancel }: TodoEditFormProps) {
  const id = useId()
  const [draft, setDraft] = useState(initialText)
  const text = draft.trim()
  // Derived during render — unlike Q1, nothing here requires an effect.
  const isEmpty = text === ''

  return (
    <Stack
      component="form"
      direction="row"
      spacing={1}
      sx={{ alignItems: 'flex-start', width: '100%' }}
      onSubmit={(event) => {
        event.preventDefault()
        if (!isEmpty) onSave(text)
      }}
    >
      <TextField
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          // While an IME is composing, Escape cancels the composition, not the edit.
          if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
            // Consume the key so it does not also dismiss the undo snackbar.
            event.stopPropagation()
            onCancel()
          }
        }}
        onFocus={(event) => {
          const end = event.target.value.length
          event.target.setSelectionRange(end, end)
        }}
        autoFocus
        size="small"
        fullWidth
        autoComplete="off"
        error={isEmpty}
        helperText={isEmpty ? 'Todo cannot be empty' : `${draft.length}/${TODO_MAX_LENGTH}`}
        slotProps={{
          htmlInput: { maxLength: TODO_MAX_LENGTH, 'aria-label': 'Edit todo' },
          formHelperText: { sx: { textAlign: isEmpty ? 'left' : 'right' } },
        }}
      />
      <IconButton type="submit" aria-label="Save" color="primary" disabled={isEmpty}>
        <CheckIcon />
      </IconButton>
      <IconButton aria-label="Cancel editing" onClick={onCancel}>
        <CloseIcon />
      </IconButton>
    </Stack>
  )
}
