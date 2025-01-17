import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  CalendarCheck2,
  ShoppingCart,
  Clock,
  Sprout,
  ChefHat,
  Heart,
  Loader2
} from "lucide-react";
import { useState } from "react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function Marketing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: WaitlistForm) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join waitlist");
      }

      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll notify you when we launch!",
      });

      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">WendellAI</div>
          <div className="text-sm text-muted-foreground bg-secondary/20 px-3 py-1.5 rounded-md">
            Currently in closed beta
          </div>
        </div>
      </header>

      {/* Hero Section with Waitlist Form */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Smart <span className="text-primary">Meal Planning</span> Assistant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              An open-source AI-powered meal planner built to make your cooking journey easier and more enjoyable.
            </p>

            {/* Waitlist Form */}
            <div className="max-w-md mx-auto mt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 waitlist-form">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Enter your email to join the waitlist" 
                              {...field}
                              className="flex-1"
                            />
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Join Waitlist
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <div className="p-4 rounded-lg bg-secondary/20">
                <ChefHat className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI Recipe Generation</h3>
                <p className="text-sm text-muted-foreground">Generate personalized recipes based on your preferences</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Smart Shopping Lists</h3>
                <p className="text-sm text-muted-foreground">Automatically create organized shopping lists</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Family Friendly</h3>
                <p className="text-sm text-muted-foreground">Manage preferences and dietary restrictions for the whole family</p>
              </div>
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

      {/* Why Wendell Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Why Wendell?</h2>
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <blockquote className="text-xl italic mb-8 px-8 border-l-4 border-primary">
              "Eating is an agricultural act. Eating ends the annual drama of the food economy that begins with planting and birth."
              <footer className="text-sm mt-2">— Wendell Berry</footer>
            </blockquote>
            <p className="mb-8">
              Named in honor of Wendell Berry, this project embraces his philosophy of holistic integration between food systems and nature. His teachings about mindful consumption, sustainable practices, and the importance of understanding where our food comes from deeply inspire our approach to meal planning.
            </p>
            <p>
              Built by Valboa, a software engineer tackling the real challenges his own family faces with meal planning and dietary management. This open-source project combines AI technology with mindful eating principles to create a more sustainable and conscious approach to family meal planning.
            </p>
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
          <Button size="lg" onClick={() => document.querySelector('.waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6">
              <a href="https://github.com/yorchv/WendellAI" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a href="https://www.youtube.com/@Jvalboa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
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