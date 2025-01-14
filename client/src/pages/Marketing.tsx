import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  CalendarCheck2,
  ShoppingCart,
  Clock,
  DollarSign,
  ChefHat,
  Heart
} from "lucide-react";

export default function Marketing() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">WendellAI</div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Meal Planning Made <span className="text-primary">Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop stressing about what to cook. Save time and money with AI-powered meal planning that adapts to your family's needs.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Solve Your Daily Meal Planning Challenges
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: "Save Time",
                description: "Cut meal planning time by 80% with AI-generated personalized meal plans."
              },
              {
                icon: DollarSign,
                title: "Reduce Costs",
                description: "Save up to 25% on grocery bills by eliminating food waste and optimizing shopping lists."
              },
              {
                icon: Heart,
                title: "Eat Better",
                description: "Enjoy healthier, varied meals that match your dietary preferences and restrictions."
              },
              {
                icon: ShoppingCart,
                title: "Smart Shopping",
                description: "Generate organized shopping lists automatically based on your meal plans."
              },
              {
                icon: ChefHat,
                title: "Recipe Variety",
                description: "Access thousands of recipes and get personalized suggestions based on your preferences."
              },
              {
                icon: CalendarCheck2,
                title: "Easy Planning",
                description: "Drag-and-drop interface makes weekly meal planning a breeze."
              }
            ].map((benefit, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-lg bg-card">
                <benefit.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Your Meal Planning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of families who have transformed their meal planning routine with WendellAI.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WendellAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
