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
import { useApiUsage } from "@/hooks/use-api-usage"; // Added import

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();
  const apiUsage = useApiUsage();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-2xl font-bold logo">Wendell</a>
          </Link>
          <div className="flex items-center gap-4"> {/* Added div for API usage display */}
            <Button onClick={() => {}}> {/* Placeholder button -  Original code lacked a target for replacement */}
              <span>Dashboard</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              {apiUsage.data?.remaining || "..."} requests remaining
            </div>
          </div> {/* End of added div */}
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
                <ShoppingBasket className="h-4 w-4" />
                Shopping List
              </Button>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
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
            <Button variant="ghost" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {user.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/family">
              <DropdownMenuItem className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Family Dashboard
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
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