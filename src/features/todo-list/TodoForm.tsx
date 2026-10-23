import { useRef, useState } from 'react'
import { Button, Stack, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { TODO_MAX_LENGTH } from './types'

interface TodoFormProps {
  onAdd: (text: string) => void
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const text = draft.trim()

  return (
    <Stack
      component="form"
      direction="row"
      spacing={1}
      sx={{ alignItems: 'flex-start' }}
      onSubmit={(event) => {
        event.preventDefault()
        if (text === '') return
        onAdd(text)
        setDraft('')
        // Clicking "Add" moves focus to the button; bring it back for quick consecutive entry.
        inputRef.current?.focus()
      }}
    >
      <TextField
        label="New todo"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        inputRef={inputRef}
        helperText={`${draft.length}/${TODO_MAX_LENGTH}`}
        autoComplete="off"
        fullWidth
        slotProps={{
          htmlInput: { maxLength: TODO_MAX_LENGTH },
          formHelperText: { sx: { textAlign: 'right' } },
        }}
      />
      {/* A disabled submit button also blocks implicit submission with Enter. */}
      <Button
        type="submit"
        variant="contained"
        startIcon={<AddIcon />}
        disabled={text === ''}
        sx={{ height: 56, flexShrink: 0 }}
      >
        Add
      </Button>
    </Stack>
  )
}
