import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }     from '@/context/AuthContext';
import { ThemeProvider }    from '@/context/ThemeContext';
import { DensityProvider }  from '@/context/DensityContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { GoalProvider }     from '@/context/GoalContext';
import { AlertProvider }    from '@/context/AlertContext';
import AppRouter            from '@/routes/AppRouter';
import ErrorBoundary        from '@/components/errors/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <DensityProvider>
            <AuthProvider>
              <ActivityProvider>
                <GoalProvider>
                  <AlertProvider>
                    <AppRouter />
                  </AlertProvider>
                </GoalProvider>
              </ActivityProvider>
            </AuthProvider>
          </DensityProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
