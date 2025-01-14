
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
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6">
              <a href="https://github.com/replit" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a href="https://youtube.com/@ReplitOfficial" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} WendellAI. An open source project built in public.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
