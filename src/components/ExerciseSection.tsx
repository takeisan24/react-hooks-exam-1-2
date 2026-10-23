import type { ReactNode } from 'react'
import { Paper, Stack, Typography } from '@mui/material'

interface ExerciseSectionProps {
  id: string
  label: string
  title: string
  description: string
  children: ReactNode
}

export function ExerciseSection({ id, label, title, description, children }: ExerciseSectionProps) {
  const headingId = `${id}-heading`

  return (
    <Paper component="section" aria-labelledby={headingId} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="overline" color="primary">
          {label}
        </Typography>
        <Typography id={headingId} variant="h5" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      {children}
    </Paper>
  )
}
