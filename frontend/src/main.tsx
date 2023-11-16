import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReactDOM from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx'


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
