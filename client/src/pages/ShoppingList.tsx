
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useShoppingList } from "@/hooks/use-shopping-list";

export default function ShoppingList() {
  const { searchTerm, setSearchTerm, sortedItems, toggleItem, isLoading } = useShoppingList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Shopping List</h1>
        <p className="text-muted-foreground">
          Items needed for your meal plan this week
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sortedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(index)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <p className={`${item.checked ? "line-through text-muted-foreground" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Used in: {item.recipes.join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {sortedItems.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "No matching ingredients found" : "No ingredients in your shopping list"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
