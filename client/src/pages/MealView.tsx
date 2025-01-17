import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Plus, ArrowLeft, User, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { useState } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
import type { MealType, DayType } from "@db/schema";
import { useFamilyMembers } from "@/hooks/use-family-members";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

export default function MealView() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { mealPlans, updateMealPlan } = useMealPlans();
  const { recipes } = useRecipes();
  const { familyMembers } = useFamilyMembers();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");

  const planId = parseInt(params.planId ?? "0", 10);
  const day = params.day as DayType;
  const mealType = params.type as MealType;

  const plan = mealPlans?.find(p => p.id === planId);
  const dayMeal = plan?.meals?.find(m => m.day === day);
  const mealData = dayMeal?.recipes[mealType];

  const handleRemoveRecipe = async (recipeId: number) => {
    if (!plan || !mealData) return;

    const updatedMeals = plan.meals?.map(meal => {
      if (meal.day === day) {
        return {
          ...meal,
          recipes: {
            ...meal.recipes,
            [mealType]: {
              recipeIds: mealData.recipeIds.filter(id => id !== recipeId),
              participants: mealData.participants
            }
          }
        };
      }
      return meal;
    });

    if (updatedMeals) {
      await updateMealPlan({ ...plan, meals: updatedMeals });
    }
  };

  const handleAddRecipe = async (recipe: { id: number }) => {
    if (!plan) return;

    const updatedMeals = plan.meals?.map(meal => {
      if (meal.day === day) {
        const currentMealData = meal.recipes[mealType] || { recipeIds: [], participants: [] };
        return {
          ...meal,
          recipes: {
            ...meal.recipes,
            [mealType]: {
              recipeIds: [...currentMealData.recipeIds, recipe.id],
              participants: currentMealData.participants
            }
          }
        };
      }
      return meal;
    });

    if (updatedMeals) {
      await updateMealPlan({ ...plan, meals: updatedMeals });
    }
    setIsSearchOpen(false);
  };

  const handleToggleParticipant = async (familyMemberId: number) => {
    if (!plan) return;

    const updatedMeals = plan.meals?.map(meal => {
      if (meal.day === day) {
        const currentMealData = meal.recipes[mealType] || { recipeIds: [], participants: [] };
        const updatedParticipants = currentMealData.participants || [];

        const newParticipants = updatedParticipants.includes(familyMemberId)
          ? updatedParticipants.filter(id => id !== familyMemberId)
          : [...updatedParticipants, familyMemberId];

        return {
          ...meal,
          recipes: {
            ...meal.recipes,
            [mealType]: {
              ...currentMealData,
              participants: newParticipants
            }
          }
        };
      }
      return meal;
    });

    if (updatedMeals) {
      await updateMealPlan({ ...plan, meals: updatedMeals });
    }
  };

  const recipesMap = recipes?.reduce((acc, recipe) => {
    acc[recipe.id] = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description || undefined,
      prepTime: recipe.prepTime || undefined,
      cookTime: recipe.cookTime || undefined,
      servings: recipe.servings || undefined
    };
    return acc;
  }, {} as Record<number, Recipe>) ?? {};

  const filteredFamilyMembers = familyMembers?.filter(member => 
    member.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  return (
    <div className="container max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/meal-planner")} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meal Planner
        </Button>
        <h1 className="text-3xl font-bold">
          {day} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </h1>
        <p className="text-muted-foreground">{format(new Date(plan?.weekStart || new Date()), "MMMM d, yyyy")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Participants</CardTitle>
            <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Participant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Participant</DialogTitle>
                </DialogHeader>
                <Command>
                  <CommandInput 
                    placeholder="Search participants..." 
                    value={participantSearch}
                    onValueChange={setParticipantSearch}
                  />
                  <CommandEmpty>No participants found.</CommandEmpty>
                  <CommandGroup heading="Family Members">
                    {filteredFamilyMembers?.filter(member => !member.isGuest).map((member) => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => {
                          handleToggleParticipant(member.id);
                          setIsParticipantDialogOpen(false);
                        }}
                      >
                        <User className={cn(
                          "mr-2 h-4 w-4",
                          mealData?.participants?.includes(member.id) ? "text-primary" : "text-muted-foreground"
                        )} />
                        {member.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Guests">
                    {filteredFamilyMembers?.filter(member => member.isGuest).map((member) => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => {
                          handleToggleParticipant(member.id);
                          setIsParticipantDialogOpen(false);
                        }}
                      >
                        <UserPlus className={cn(
                          "mr-2 h-4 w-4",
                          mealData?.participants?.includes(member.id) ? "text-primary" : "text-muted-foreground"
                        )} />
                        {member.name}
                      </CommandItem>
                    ))}
                    <CommandItem
                      onSelect={() => {
                        navigate("/family-dashboard?newGuest=true");
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4 text-primary" />
                      Add New Guest
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {familyMembers?.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={mealData?.participants?.includes(member.id) ?? false}
                    onCheckedChange={() => handleToggleParticipant(member.id)}
                  />
                  <label
                    htmlFor={`member-${member.id}`}
                    className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {member.isGuest ? (
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{member.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mealData?.recipeIds?.map((id) => {
            const recipe = recipesMap[id];
            return recipe ? (
              <Card key={id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg cursor-pointer" onClick={() => navigate(`/recipes/${id}`)}>
                    {recipe.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveRecipe(id)}>
                    Remove
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    {(recipe.prepTime || recipe.cookTime) && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {recipe.prepTime && `${recipe.prepTime} min prep`}
                        {recipe.prepTime && recipe.cookTime && " + "}
                        {recipe.cookTime && `${recipe.cookTime} min cook`}
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {recipe.servings} servings
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })}

          <Button onClick={() => setIsSearchOpen(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
        </div>
      </div>

      <RecipeSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectRecipe={handleAddRecipe}
        participantIds={mealData?.participants}
      />
    </div>
  );
}