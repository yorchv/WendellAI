
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  CalendarCheck2,
  ShoppingCart,
  Clock,
  Sprout,
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
            Join Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Mindful <span className="text-primary">Meal Planning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              "The care of the Earth is our most ancient and most worthy, and after all, our most pleasing responsibility." - Wendell Berry
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              An open-source meal planning assistant built with AI, inspired by Wendell Berry's philosophy of mindful living and sustainable food practices.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            A Different Approach to Meal Planning
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Sprout,
                title: "Mindful Planning",
                description: "Plan meals with intention, reducing waste and connecting with your food choices."
              },
              {
                icon: Heart,
                title: "Family-Focused",
                description: "Create meal plans that consider everyone's needs and preferences."
              },
              {
                icon: ChefHat,
                title: "AI-Powered",
                description: "Leverage AI to help organize and suggest recipes while maintaining personal touch."
              },
              {
                icon: ShoppingCart,
                title: "Shopping Lists",
                description: "Generate organized shopping lists from your meal plans."
              },
              {
                icon: CalendarCheck2,
                title: "Simple Planning",
                description: "Easy-to-use interface for weekly meal planning."
              },
              {
                icon: Clock,
                title: "Time-Aware",
                description: "Plan ahead and make cooking fit your schedule."
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
            Join Our Growing Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An open-source project combining AI technology with mindful meal planning principles.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WendellAI. Open source project inspired by Wendell Berry.
          </div>
        </div>
      </footer>
    </div>
  );
}
