import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { WorkoutSessionProvider } from '@/contexts/WorkoutSessionContext';
import '@/lib/nativeBridge';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkoutSessionProvider>
          <App />
        </WorkoutSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);