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
      validators.ts               # username / email / password / confirm rules
      sign-up/                    # beyond the exam: a full sign-up form
        SignUpForm.tsx            # layout only: title, field groups, button, success alert
        useSignUpForm.ts          # all form state and the submit logic (no JSX)
        AccountFields.tsx         # Username + Email
        PasswordFields.tsx        # Password + Confirm (memoized confirm validator)
        validateSignUp.ts         # pure: first invalid field, in on-screen order
        registerAccount.ts        # fake sign-up API (1 s delay, some usernames taken)
        types.ts
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

### Beyond the exam: a complete sign-up form

The exam only asks for the input, but a form with nothing to submit is not finished from a
product point of view. `SignUpForm` turns the demo into a working sign-up flow:

| Feature | Behaviour |
|---|---|
| **Form title** | "Create your account", so the user knows what the form is for; it also names the `<form>` for screen readers |
| **Required fields** | Asterisks in red (theme override in `main.tsx`), explained by a "Fields marked * are required" line |
| **Submit** | "Create account" button; Enter in any field submits too |
| **Validation on submit** | Errors appear on every invalid field, including untouched ones; focus moves to the first invalid field |
| **Placeholders** | Example values (`e.g. john_doe`, `name@example.com`) that do not repeat the hint text |
| **Confirm password** | Re-validates when *Password* changes — see the dependency array below |
| **Submitting state** | Button shows a spinner and the fields are disabled, so the form cannot be sent twice |
| **Server error** | Usernames `admin` / `root` come back as "already taken"; the error clears as soon as the username is edited |
| **Success** | A success alert, then the form is cleared and back to its untouched state |

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
- **The form owns the values; each input owns its error.** `ValidatedInput` is controlled
  (`value` / `onChange`) so the form can submit the data, while validation stays inside the
  input's effect as the exam asks. On submit the form re-runs the same validators to get the
  result synchronously, then sets `showValidation` to reveal errors on untouched fields.
- **The submit button stays enabled while the form is invalid.** A disabled button cannot
  explain what is missing; clicking it does. (The todo "Add" button is disabled instead: one
  field, obvious reason.)
- **Server errors are a separate prop** (`externalError`), because a validator cannot know a
  username is taken. The form clears it in the username's `onChange` — no effect needed.
- **Resetting after success remounts the form** with a new `key`, which resets each input's
  `isDirty` state without extra props.
- **The sign-up form separates logic from layout.** `useSignUpForm` owns every piece of state
  and the submit flow; the components only render. Fields are grouped by meaning
  (account / password) rather than one file per input — *Confirm* depends on *Password*, so they
  live together. Inputs are reached through `registerInput(field)` callback refs, so no ref is
  read during render.

### The dependency array

| Dependencies | Behaviour |
|---|---|
| *(none)* | Runs after **every** render — correct but wasteful |
| `[]` | Runs once on mount — typing never re-validates (**bug**) |
| `[value]` | Misses a change of validator; flagged by `react/exhaustive-deps` |
| `[value, validate]` | ✅ Re-validates exactly when an input to the validation changes |

`react/exhaustive-deps` is enabled as an **error** in `.oxlintrc.json`.

**Confirm password is the case where `validate` matters.** Its validator depends on the
password, so `PasswordFields` builds it with
`useMemo(() => createConfirmPasswordValidator(values.password), [values.password])`. Type `abc12345` in both fields, then change *Password*: the confirm field's own
value did not change, but its `validate` did, so the effect re-runs and shows "Passwords do not
match". With `[value]` alone the stale "valid" state would stay on screen.

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
- **A real backend** — `registerAccount` only simulates latency and a taken username; nothing
  leaves the browser.
- **Automated tests** — both questions were verified manually in a real browser (Playwright)
  against the checklists below.

## Verification checklist

**Question 1:** no error on load · email `a` → format error, `a@b.co` → valid, cleared or
whitespace-only → required · username `ab` / `ab c` / `Tuấn` / 21 chars → errors, `abc_1` →
valid · password `abc` / `abcdefgh` / `12345678` → errors, `abc12345` → valid · field height
constant (no layout shift) · password toggle keeps focus · submit while empty → all four
errors, focus on Username · Enter submits · confirm valid, then change Password → "Passwords
do not match" · username `Admin` → spinner, fields disabled, then "already taken" with focus on
Username; editing it clears the error · valid submit → success alert, form cleared with no
errors shown.

**Question 2:** add via Enter and button (trimmed, input cleared and refocused) · whitespace-only
cannot be added · duplicates allowed · 100-character cap · toggle completed · edit save via
Enter/✓, cancel via Escape/✕, empty blocked, focus returns to Edit · delete + undo restores
position · clear completed + undo restores both · double-clicking Undo does not duplicate ·
Escape in edit keeps the snackbar · consecutive deletes restart the timer · empty state · no
horizontal overflow at 375 px with a 100-character unbroken todo · clean console under
StrictMode.
