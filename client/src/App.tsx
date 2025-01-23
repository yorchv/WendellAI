import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2 } from "lucide-react";

import { queryClient } from "./lib/queryClient";
import { useUser } from "./hooks/use-user";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { AnalyticsProvider, useAnalytics } from "./providers/AnalyticsProvider"; // Added import
import Navigation from "./components/Navigation";
import AuthPage from "./pages/AuthPage";
import Marketing from "./pages/Marketing";
import Dashboard from "./pages/Dashboard";
import RecipeView from "./pages/RecipeView";
import RecipesPage from "./pages/RecipesPage";
import MealPlanner from "./pages/MealPlanner";
import MealView from "./pages/MealView";
import ShoppingList from "./pages/ShoppingList";
import FamilyDashboard from "./pages/FamilyDashboard";
import StreamStarting from "./pages/StreamStarting";
import StreamBreak from "./pages/StreamBreak";
import { useEffect } from 'react';


function AppContent() {
  const { isAuthenticated, handleAuthRedirect } = useAuth();
  const { user } = useUser();
  const path = window.location.pathname;
  const { initAnalytics } = useAnalytics();

  useEffect(() => {
    initAnalytics();
  }, [initAnalytics]);

  if (!handleAuthRedirect(path)) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Marketing} />
          <Route path="/auth" component={AuthPage} />
          <Route>404 - Not Found</Route>
        </Switch>
        <Toaster />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={MealPlanner} />
            <Route path="/recipes" component={RecipesPage} />
            <Route path="/recipes/:id" component={RecipeView} />
            <Route path="/meal-planner" component={MealPlanner} />
            <Route path="/meal/:planId/:day/:type" component={MealView} />
            <Route path="/shopping-list" component={ShoppingList} />
            <Route path="/family" component={FamilyDashboard} />
            <Route path="/stream/starting" component={StreamStarting} />
            <Route path="/stream/break" component={StreamBreak} />
            <Route>404 - Not Found</Route>
          </Switch>
        </main>
        <Toaster />
      </div>
    </DndProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}

export default App;