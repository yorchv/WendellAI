import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import RecipeView from "./pages/RecipeView";
import MealPlanner from "./pages/MealPlanner";
import Navigation from "./components/Navigation";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/recipes/:id" component={RecipeView} />
          <Route path="/meal-planner" component={MealPlanner} />
          <Route>404 - Not Found</Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
