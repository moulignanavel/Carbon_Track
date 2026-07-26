import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }      from '@/context/AuthContext';
import { ThemeProvider }     from '@/context/ThemeContext';
import { DensityProvider }   from '@/context/DensityContext';
import { ActivityProvider }  from '@/context/ActivityContext';
import { GoalProvider }      from '@/context/GoalContext';
import { ChallengeProvider } from '@/context/ChallengeContext';
import { AlertProvider }     from '@/context/AlertContext';
import { CelebrationProvider } from '@/context/CelebrationContext';
import AppRouter             from '@/routes/AppRouter';
import ErrorBoundary         from '@/components/errors/ErrorBoundary';
import CarbonBotWidget       from '@/components/ai/CarbonBotWidget';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <DensityProvider>
            <AuthProvider>
              <CelebrationProvider>
                <ActivityProvider>
                  <GoalProvider>
                    <ChallengeProvider>
                      <AlertProvider>
                        <AppRouter />
                        <CarbonBotWidget />
                      </AlertProvider>
                    </ChallengeProvider>
                  </GoalProvider>
                </ActivityProvider>
              </CelebrationProvider>
            </AuthProvider>
          </DensityProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
