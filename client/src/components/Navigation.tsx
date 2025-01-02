import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@db/schema";
import { useUser } from "@/hooks/use-user";
import { CalendarDays, ChefHat, List, LogOut, User as UserIcon } from "lucide-react";

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-2xl font-bold text-primary">WendellAI</a>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/meal-planner">
              <Button variant="ghost" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Meal Planner
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="ghost" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Recipes
              </Button>
            </Link>
            <Link href="/shopping-list">
              <Button variant="ghost" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Shopping List
              </Button>
            </Link>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {user.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}