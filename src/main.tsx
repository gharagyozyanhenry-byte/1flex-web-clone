import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import { BlinkProvider, BlinkAuthProvider } from '@blinkdotnew/react'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

const projectId = import.meta.env.VITE_BLINK_PROJECT_ID || '1flex-web-clone-a50bk27w'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlinkProvider projectId={projectId}>
      <BlinkAuthProvider>
        <QueryClientProvider client={queryClient}>
          <BlinkUIProvider theme="linear" darkMode="system">
            <Toaster />
            <div className="flex w-full flex-1 flex-col min-h-0">
              <App />
            </div>
          </BlinkUIProvider>
        </QueryClientProvider>
      </BlinkAuthProvider>
    </BlinkProvider>
  </React.StrictMode>,
)
