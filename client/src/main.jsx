import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './hooks/useAuth.jsx'
import { Toaster } from './components/ui/Toaster'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Toaster>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)