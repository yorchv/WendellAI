
import React, { createContext, useContext, useEffect } from 'react';
import posthog from 'posthog-js';

type AnalyticsContextType = {
  initAnalytics: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(
      import.meta.env.VITE_POSTHOG_KEY,
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (import.meta.env.DEV) posthog.opt_out_capturing();
        }
      }
    );
  }, []);

  return (
    <AnalyticsContext.Provider value={{}}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
