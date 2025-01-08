import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(

  
  <StrictMode>
    <App />
    <div>
      <Toaster 
      position='top-center'
      toastOptions={{
        success: {
          style: {
            background: "#003049",
            color: 'white',
          },
        },
      }}
      
      ></Toaster>
    </div>
  </StrictMode>,
)
