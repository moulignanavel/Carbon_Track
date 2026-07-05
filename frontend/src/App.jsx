import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }     from '@/context/AuthContext';
import { ThemeProvider }    from '@/context/ThemeContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { GoalProvider }     from '@/context/GoalContext';
import AppRouter            from '@/routes/AppRouter';
import ErrorBoundary        from '@/components/errors/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ActivityProvider>
              <GoalProvider>
                <AppRouter />
              </GoalProvider>
            </ActivityProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
