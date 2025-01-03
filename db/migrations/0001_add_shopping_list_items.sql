-- First drop foreign key constraints
ALTER TABLE IF EXISTS "shopping_list_items" DROP CONSTRAINT IF EXISTS "shopping_list_items_user_id_fkey";
ALTER TABLE IF EXISTS "shopping_list_items" DROP CONSTRAINT IF EXISTS "shopping_list_items_ingredient_id_fkey";
ALTER TABLE IF EXISTS "shopping_lists" DROP CONSTRAINT IF EXISTS "shopping_lists_user_id_fkey";

-- Drop existing tables that will be replaced
DROP TABLE IF EXISTS "shopping_lists" CASCADE;

-- Create initial shopping_list_items table
CREATE TABLE IF NOT EXISTS "shopping_list_items" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users"("id"),
  "week_start" timestamp NOT NULL,
  "name" text NOT NULL,
  "checked" boolean DEFAULT false,
  "recipes" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_user_id" ON "shopping_list_items"("user_id");

-- Create ingredients table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ingredients" (
  "id" serial PRIMARY KEY,
  "name" text UNIQUE NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add ingredient_id to shopping_list_items
ALTER TABLE "shopping_list_items" 
ADD COLUMN "ingredient_id" integer REFERENCES "ingredients"("id"),
ADD COLUMN "start_date" timestamp,
ADD COLUMN "end_date" timestamp,
ADD COLUMN "quantity" decimal,
ADD COLUMN "unit" text;

-- Migrate existing recipe ingredients to new structure
DO $$
DECLARE
  r RECORD;
  ingredient_json RECORD;
BEGIN
  -- First, create ingredients from existing shopping list items
  INSERT INTO ingredients (name)
  SELECT DISTINCT lower(trim(name))
  FROM shopping_list_items
  ON CONFLICT (name) DO NOTHING;

  -- Then update shopping_list_items with ingredient_id references
  UPDATE shopping_list_items sli
  SET 
    ingredient_id = i.id,
    start_date = week_start,
    end_date = week_start + interval '7 days',
    quantity = null,  -- We don't have this info in the old structure
    unit = null      -- We don't have this info in the old structure
  FROM ingredients i
  WHERE lower(trim(sli.name)) = i.name;
END
$$;

-- Make ingredient_id NOT NULL after migration
ALTER TABLE "shopping_list_items" 
  ALTER COLUMN "ingredient_id" SET NOT NULL,
  ALTER COLUMN "start_date" SET NOT NULL,
  ALTER COLUMN "end_date" SET NOT NULL;

-- Rename recipes column to recipe_ids for consistency
ALTER TABLE "shopping_list_items" 
  RENAME COLUMN "recipes" TO "recipe_ids";

-- Drop the name column as it's no longer needed
ALTER TABLE "shopping_list_items" 
  DROP COLUMN "name",
  DROP COLUMN "week_start";

-- Add indexes for better query performance (already added above, but adding again for completeness if this migration runs multiple times)
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_ingredient_id" ON "shopping_list_items"("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_date_range" ON "shopping_list_items"("start_date", "end_date");