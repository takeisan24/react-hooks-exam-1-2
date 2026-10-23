import { useState } from 'react'
import { Checkbox, IconButton, ListItem, ListItemText } from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { TodoEditForm } from './TodoEditForm'
import type { Todo } from './types'

interface TodoItemProps {
  todo: Todo
  isEditing: boolean
  /** False while another item is being edited — only one edit at a time. */
  canEdit: boolean
  onToggle: (id: string) => void
  onStartEdit: (id: string) => void
  onSave: (id: string, text: string) => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
}

export function TodoItem({
  todo,
  isEditing,
  canEdit,
  onToggle,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: TodoItemProps) {
  // The view row only re-mounts when an edit ends, so once this item has been edited its
  // Edit button takes focus back — otherwise focus would fall to <body>.
  const [hasEdited, setHasEdited] = useState(false)

  if (isEditing) {
    return (
      <ListItem>
        <TodoEditForm
          initialText={todo.text}
          onSave={(text) => {
            setHasEdited(true)
            onSave(todo.id, text)
          }}
          onCancel={() => {
            setHasEdited(true)
            onCancelEdit()
          }}
        />
      </ListItem>
    )
  }

  return (
    <ListItem sx={{ gap: 1 }}>
      <Checkbox
        edge="start"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        slotProps={{ input: { 'aria-label': `Mark "${todo.text}" as completed` } }}
      />
      <ListItemText
        primary={todo.text}
        sx={{ minWidth: 0 }}
        slotProps={{
          primary: {
            sx: {
              // Long words without spaces must wrap instead of overflowing the row.
              overflowWrap: 'anywhere',
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'text.secondary' : 'text.primary',
            },
          },
        }}
      />
      <IconButton
        aria-label={`Edit "${todo.text}"`}
        onClick={() => onStartEdit(todo.id)}
        disabled={!canEdit}
        autoFocus={hasEdited}
      >
        <EditOutlinedIcon />
      </IconButton>
      <IconButton edge="end" aria-label={`Delete "${todo.text}"`} onClick={() => onDelete(todo.id)}>
        <DeleteOutlinedIcon />
      </IconButton>
    </ListItem>
  )
}
