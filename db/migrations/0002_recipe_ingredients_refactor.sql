-- First drop foreign key constraints
ALTER TABLE IF EXISTS "shopping_list_items" DROP CONSTRAINT IF EXISTS "shopping_list_items_user_id_fkey";
ALTER TABLE IF EXISTS "shopping_lists" DROP CONSTRAINT IF EXISTS "shopping_lists_user_id_fkey";

-- Drop existing tables that will be replaced
DROP TABLE IF EXISTS "shopping_lists" CASCADE;
DROP TABLE IF EXISTS "shopping_list_items" CASCADE;

-- Create ingredients table
CREATE TABLE IF NOT EXISTS "ingredients" (
  "id" serial PRIMARY KEY,
  "name" text UNIQUE NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
  "id" serial PRIMARY KEY,
  "recipe_id" integer REFERENCES "recipes"("id") ON DELETE CASCADE,
  "ingredient_id" integer REFERENCES "ingredients"("id") ON DELETE CASCADE,
  "quantity" decimal,
  "unit" text,
  "notes" text
);

-- Modify recipes table to remove ingredients column
ALTER TABLE IF EXISTS "recipes" DROP COLUMN IF EXISTS "ingredients";

-- Create new shopping_list_items table with proper constraints
CREATE TABLE "shopping_list_items" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
  "ingredient_id" integer REFERENCES "ingredients"("id") ON DELETE CASCADE,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "quantity" decimal,
  "unit" text,
  "checked" boolean DEFAULT false,
  "recipe_ids" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_recipe_ingredients_recipe_id" ON "recipe_ingredients"("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_ingredients_ingredient_id" ON "recipe_ingredients"("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_user_id" ON "shopping_list_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_ingredient_id" ON "shopping_list_items"("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_date_range" ON "shopping_list_items"("start_date", "end_date");