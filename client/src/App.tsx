import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import RecipeView from "./pages/RecipeView";
import RecipesPage from "./pages/RecipesPage";
import MealPlanner from "./pages/MealPlanner";
import ShoppingList from "./pages/ShoppingList";
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
          <Route path="/recipes" component={RecipesPage} />
          <Route path="/recipes/:id" component={RecipeView} />
          <Route path="/recipes/new" component={() => {
            window.location.href = "/meal-planner";
            return null;
          }} />
          <Route path="/meal-planner" component={MealPlanner} />
          <Route path="/shopping-list" component={ShoppingList} />
          <Route>404 - Not Found</Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;