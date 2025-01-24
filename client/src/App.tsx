import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2 } from "lucide-react";

import { queryClient } from "./lib/queryClient";
import { useUser } from "./hooks/use-user";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { AnalyticsProvider, useAnalytics } from "./providers/AnalyticsProvider";
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
import RecipeFormatter from "./pages/tools/RecipeFormatter"; // Added import
import DietaryChecker from "./pages/tools/DietaryChecker";   // Added import
import CookbookToPhone from "./pages/tools/CookbookToPhone"; // Added import
import CookingMode from "./pages/CookingMode";


function AppContent() {
  const { isAuthenticated, handleAuthRedirect } = useAuth();
  const { user } = useUser();
  const path = window.location.pathname;

  if (!handleAuthRedirect(path)) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Navigation user={user || undefined} />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            {/* Protected routes - only accessible when authenticated */}
            {isAuthenticated ? (
              <>
                <Route path="/" component={MealPlanner} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/recipes" component={RecipesPage} />
                <Route path="/recipes/:id" component={RecipeView} />
                <Route path="/meal-planner" component={MealPlanner} />
                <Route path="/meals/:planId/:day/:type" component={MealView} />
                <Route path="/shopping-list" component={ShoppingList} />
                <Route path="/family" component={FamilyDashboard} />
                <Route path="/recipes/:id/cooking" component={CookingMode} />
              </>
            ) : (
              <>
                <Route path="/" component={Marketing} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/tools/recipe-formatter" component={RecipeFormatter} />
                <Route path="/tools/dietary-checker" component={DietaryChecker} />
                <Route path="/tools/cookbook-to-phone" component={CookbookToPhone} />
              </>
            )}
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