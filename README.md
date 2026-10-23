# React Hooks — Exam 1.2

Solutions to both questions of Exam 1.2, rendered as two sections of a single page:

- **Question 1 — Form Input Validation with `useEffect()`**
- **Question 2 — Todo List with `useState()`**

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (strict) + production build
npm run lint     # oxlint
```

**Stack:** React 19, TypeScript (strict), Vite, MUI v9, oxlint. The app runs inside
`<StrictMode>` on purpose, so effects and state updaters are double-invoked in development —
the code is written to stay correct under that.

```
src/
  App.tsx                         # page layout: one section per question
  components/ExerciseSection.tsx
  features/
    validated-input/              # Question 1
      ValidatedInput.tsx          # the component + Validator type
      validators.ts               # username / email / password rules
      ValidatedInputDemo.tsx
    todo-list/                    # Question 2
      TodoList.tsx                # list state, handlers, undo snackbar
      TodoForm.tsx                # "add" form
      TodoItem.tsx                # one row (view mode)
      TodoEditForm.tsx            # one row (edit mode)
      types.ts
```

---

## Question 1 — `ValidatedInput`

| Requirement | Where |
|---|---|
| Validate input with a **provided validation function** | `validate: Validator` prop — `(value: string) => string \| null` |
| **Display an error message** when invalid | MUI `error` + `helperText`, `aria-invalid`, `aria-live="polite"` |
| Validate **whenever the value changes** (`componentDidUpdate`) | `useEffect(() => setError(validate(value)), [value, validate])` |

Extras: a check mark when the value is valid, and a show/hide toggle for password fields.

### Key decisions

- **Validators return the message, not a boolean.** Each field owns its wording, and the result
  is a primitive — `setError` with an unchanged string bails out, so the effect can never loop.
- **The error is always computed; `isDirty` only gates its display.** An untouched empty field
  does not greet the user with "required". Skipping the first effect run with a `useRef` was
  rejected: StrictMode re-runs effects on a simulated remount while the ref keeps its value, so
  the "skip" silently stops working.
- **Validators live at module scope** so `validate` keeps a stable reference. An inline arrow
  function would re-run the effect after every render (harmless here thanks to the bail-out,
  but wasteful).
- `type="text"` + `inputMode="email"` instead of `type="email"`: browsers sanitize email
  inputs (e.g. strip trailing spaces), which desyncs a controlled input.
- Helper text is always rendered (a blank line at minimum), so the layout does not jump when an
  error appears.

### The dependency array

| Dependencies | Behaviour |
|---|---|
| *(none)* | Runs after **every** render — correct but wasteful |
| `[]` | Runs once on mount — typing never re-validates (**bug**) |
| `[value]` | Misses a change of validator; flagged by `react/exhaustive-deps` |
| `[value, validate]` | ✅ Re-validates exactly when an input to the validation changes |

`react/exhaustive-deps` is enabled as an **error** in `.oxlintrc.json`.

### Effect vs. derived value

Validation is a value *derived* from state, so idiomatic React would compute it during render
(`const error = validate(value)`), avoiding the extra render that `setState` inside an effect
causes. The exam explicitly asks for `useEffect`, so Q1 uses it and disables oxlint's
`react/set-state-in-effect` on that single line with a comment. **Question 2 shows the
derived approach** (`TodoEditForm`'s empty check), for contrast.

---

## Question 2 — Todo List

| Requirement | Where |
|---|---|
| Input field for new todos | `TodoForm` — trimmed, max 100 characters, live counter |
| Button to submit | `type="submit"` "Add" button (Enter works too); disabled while empty |
| Display the list | `TodoList` → `TodoItem`, keyed by `todo.id`; empty-state message |
| Edit button next to each item | Inline edit; one item at a time |
| Delete button next to each item | With an **Undo** snackbar |
| `useState()` manages the list | `useState<Todo[]>` — no `useReducer`, as the exam specifies |
| "Delete items once they are completed" | Completed checkbox + "Clear completed" |

### Key decisions

- **Immutable, functional updates** (`setTodos(prev => …)`) everywhere, so updates never read a
  stale closure.
- **New todos are created outside the updater.** StrictMode calls updaters twice;
  `crypto.randomUUID()` inside one would make it impure.
- **State is colocated.** The "add" draft lives in `TodoForm` (typing does not re-render the
  list); `editingId` lives in `TodoList` because "one edit at a time" spans items.
- **`TodoEditForm` mounts fresh for each edit**, so `useState(initialText)` always starts from
  the current text — no effect syncing props into state.
- **Editing is explicit:** Enter / ✓ saves, Escape / ✕ cancels, blur does nothing, empty text
  disables Save. Other items' Edit buttons are disabled meanwhile, so no draft is lost.
- **Focus management:** the edit field is focused with the caret at the end; afterwards focus
  returns to the item's Edit button; after adding, focus stays in the input.
- **Escape ignores IME composition** (`isComposing`) and is consumed so it does not also
  dismiss the undo snackbar.
- **Undo** records each deleted todo with its index and re-inserts in ascending order, restoring
  the original positions. Delete and "Clear completed" share this path, which also leaves edit
  mode if the edited todo is removed. The snackbar is keyed per deletion so its 5-second timer
  restarts, and ignores clickaway so the user can keep working.
- **Derived values are not state** — `completedCount` is computed from `todos`.

---

## Intentionally out of scope

- **Persistence** (localStorage) — it would need `useEffect`; the exam scopes Q2 to `useState`.
- **`React.memo` / `useCallback`** — the list is small; there is nothing measurable to gain.
- **Automated tests** — both questions were verified manually in a real browser (Playwright)
  against the checklists below.

## Verification checklist

**Question 1:** no error on load · email `a` → format error, `a@b.co` → valid, cleared or
whitespace-only → required · username `ab` / `ab c` / `Tuấn` / 21 chars → errors, `abc_1` →
valid · password `abc` / `abcdefgh` / `12345678` → errors, `abc12345` → valid · field height
constant (no layout shift) · password toggle keeps focus.

**Question 2:** add via Enter and button (trimmed, input cleared and refocused) · whitespace-only
cannot be added · duplicates allowed · 100-character cap · toggle completed · edit save via
Enter/✓, cancel via Escape/✕, empty blocked, focus returns to Edit · delete + undo restores
position · clear completed + undo restores both · double-clicking Undo does not duplicate ·
Escape in edit keeps the snackbar · consecutive deletes restart the timer · empty state · no
horizontal overflow at 375 px with a 100-character unbroken todo · clean console under
StrictMode.
