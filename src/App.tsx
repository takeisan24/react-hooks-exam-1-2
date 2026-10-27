import { Container, Stack, Typography } from '@mui/material'
import { ExerciseSection } from './components/ExerciseSection'
import { TodoList } from './features/todo-list/TodoList'
import { SignUpForm } from './features/validated-input/sign-up/SignUpForm'

function App() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        <header>
          <Typography variant="h4" component="h1">
            React Hooks — Exam 1.2
          </Typography>
        </header>

        <ExerciseSection
          id="q1"
          label="Question 1"
          title="Form Input Validation with useEffect()"
          description="Each input validates its value inside useEffect whenever the value changes; submitting re-checks every field."
        >
          <SignUpForm />
        </ExerciseSection>

        <ExerciseSection
          id="q2"
          label="Question 2"
          title="Todo List"
          description="Add, edit, complete and delete todos — state managed with useState()."
        >
          <TodoList />
        </ExerciseSection>
      </Stack>
    </Container>
  )
}

export default App
