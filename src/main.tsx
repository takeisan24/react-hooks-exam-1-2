import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App.tsx'

const theme = createTheme({
  components: {
    MuiFormLabel: {
      styleOverrides: {
        // Required-field asterisks in the error colour, the usual convention.
        asterisk: ({ theme }) => ({ color: theme.palette.error.main }),
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
