import { useState } from 'react'
import { Button, List, Snackbar, Stack, Typography } from '@mui/material'
import { TodoForm } from './TodoForm'
import { TodoItem } from './TodoItem'
import type { Todo } from './types'

const INITIAL_TODOS: Todo[] = [
  { id: 'seed-1', text: 'Read the React docs on useState', completed: true },
  { id: 'seed-2', text: 'Build the Todo List for Exam 1.2', completed: false },
  { id: 'seed-3', text: 'Push the solution to GitHub', completed: false },
]

interface DeletedTodo {
  todo: Todo
  index: number
}

interface DeletedBatch {
  id: string
  message: string
  items: DeletedTodo[]
}

// Re-inserts deleted todos at their original positions. Items are in ascending index
// order, so inserting them one by one rebuilds the original order.
function restoreTodos(todos: Todo[], items: DeletedTodo[]): Todo[] {
  const restored = [...todos]
  for (const { todo, index } of items) {
    if (restored.some((existing) => existing.id === todo.id)) continue
    restored.splice(Math.min(index, restored.length), 0, todo)
  }
  return restored
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [editingId, setEditingId] = useState<string | null>(null)
  // The batch outlives `isUndoOpen` so the snackbar keeps its text while it animates out.
  const [deletedBatch, setDeletedBatch] = useState<DeletedBatch | null>(null)
  const [isUndoOpen, setIsUndoOpen] = useState(false)

  const completedCount = todos.filter((todo) => todo.completed).length

  const addTodo = (text: string) => {
    // Created outside the updater: StrictMode calls updaters twice, and randomUUID()
    // inside one would make it impure.
    const todo: Todo = { id: crypto.randomUUID(), text, completed: false }
    setTodos((prev) => [...prev, todo])
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  const saveTodo = (id: string, text: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
    setEditingId(null)
  }

  const removeTodos = (ids: ReadonlySet<string>) => {
    const items = todos.flatMap((todo, index) => (ids.has(todo.id) ? [{ todo, index }] : []))
    if (items.length === 0) return

    setTodos((prev) => prev.filter((todo) => !ids.has(todo.id)))
    // "Clear completed" can remove the todo that is being edited.
    if (editingId !== null && ids.has(editingId)) setEditingId(null)

    const message =
      items.length === 1 ? `Deleted "${items[0].todo.text}"` : `Deleted ${items.length} todos`
    setDeletedBatch({ id: crypto.randomUUID(), message, items })
    setIsUndoOpen(true)
  }

  const deleteTodo = (id: string) => removeTodos(new Set([id]))

  const clearCompleted = () =>
    removeTodos(new Set(todos.filter((todo) => todo.completed).map((todo) => todo.id)))

  const undoDelete = () => {
    // Ignore extra clicks while the snackbar is animating out.
    if (!isUndoOpen || deletedBatch === null) return
    setTodos((prev) => restoreTodos(prev, deletedBatch.items))
    setIsUndoOpen(false)
  }

  return (
    <>
      <Stack spacing={2}>
        <TodoForm onAdd={addTodo} />

        {todos.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No todos yet — add your first one above.
          </Typography>
        ) : (
          <>
            <List aria-label="Todos" disablePadding>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isEditing={todo.id === editingId}
                  canEdit={editingId === null}
                  onToggle={toggleTodo}
                  onStartEdit={setEditingId}
                  onSave={saveTodo}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={deleteTodo}
                />
              ))}
            </List>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {completedCount} of {todos.length} completed
              </Typography>
              <Button size="small" onClick={clearCompleted} disabled={completedCount === 0}>
                Clear completed
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <Snackbar
        // A new key re-mounts the snackbar so its auto-hide timer restarts for each deletion.
        key={deletedBatch?.id}
        open={isUndoOpen}
        autoHideDuration={5000}
        onClose={(_event, reason) => {
          // Keep the undo option while the user carries on clicking around the list.
          if (reason !== 'clickaway') setIsUndoOpen(false)
        }}
        message={deletedBatch?.message}
        action={
          <Button color="secondary" size="small" onClick={undoDelete}>
            Undo
          </Button>
        }
      />
    </>
  )
}
