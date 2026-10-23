import { Container, Stack, Typography } from '@mui/material'
import { ExerciseSection } from './components/ExerciseSection'
import { ValidatedInputDemo } from './features/validated-input/ValidatedInputDemo'

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
          description="Each input validates its value inside useEffect whenever the value changes."
        >
          <ValidatedInputDemo />
        </ExerciseSection>

        <ExerciseSection
          id="q2"
          label="Question 2"
          title="Todo List"
          description="Add, edit, complete and delete todos — state managed with useState()."
        >
          <Typography color="text.secondary">Coming soon…</Typography>
        </ExerciseSection>
      </Stack>
    </Container>
  )
}

export default App
