import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User } from "@db/schema";
import { useUser } from "@/hooks/use-user";
import { CalendarDays, ChefHat, List, LogOut, User as UserIcon, ShoppingBasket, Users } from "lucide-react";

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
              WendellAI
            </a>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/meal-planner">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2 h-9">
                <CalendarDays className="h-4 w-4" />
                Meal Planner
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2 h-9">
                <ChefHat className="h-4 w-4" />
                Recipes
              </Button>
            </Link>
            <Link href="/shopping-list">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2 h-9">
                <ShoppingBasket className="h-4 w-4" />
                Shopping List
              </Button>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <List className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Link href="/meal-planner">
                <DropdownMenuItem className="cursor-pointer">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Meal Planner
                </DropdownMenuItem>
              </Link>
              <Link href="/recipes">
                <DropdownMenuItem className="cursor-pointer">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Recipes
                </DropdownMenuItem>
              </Link>
              <Link href="/shopping-list">
                <DropdownMenuItem className="cursor-pointer">
                  <ShoppingBasket className="h-4 w-4 mr-2" />
                  Shopping List
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2 h-9">
              <UserIcon className="h-4 w-4" />
              {user.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Link href="/family">
              <DropdownMenuItem className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Family Dashboard
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}