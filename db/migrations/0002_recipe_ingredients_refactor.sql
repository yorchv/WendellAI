-- First drop foreign key constraints
ALTER TABLE IF EXISTS "shopping_list_items" DROP CONSTRAINT IF EXISTS "shopping_list_items_user_id_fkey";
ALTER TABLE IF EXISTS "shopping_list_items" DROP CONSTRAINT IF EXISTS "shopping_list_items_ingredient_id_fkey";
ALTER TABLE IF EXISTS "shopping_lists" DROP CONSTRAINT IF EXISTS "shopping_lists_user_id_fkey";

-- Drop existing tables that will be replaced
DROP TABLE IF EXISTS "shopping_lists" CASCADE;

-- Create ingredients table if it doesn't exist
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

-- Migrate existing recipe ingredients to new structure
DO $$
DECLARE
  r RECORD;
  ingredient_json RECORD;
BEGIN
  FOR r IN SELECT id, ingredients FROM recipes WHERE ingredients IS NOT NULL AND ingredients::text != 'null'
  LOOP
    FOR ingredient_json IN SELECT * FROM jsonb_array_elements(r.ingredients)
    LOOP
      -- Insert or get ingredient
      WITH ins AS (
        INSERT INTO ingredients (name)
        VALUES (lower(trim((ingredient_json->>'name')::text)))
        ON CONFLICT (name) DO UPDATE SET updated_at = now()
        RETURNING id
      )
      -- Create recipe-ingredient relationship
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes)
      SELECT r.id, ins.id, 
        NULLIF((ingredient_json->>'quantity')::text, '')::decimal,
        NULLIF((ingredient_json->>'unit')::text, ''),
        NULLIF((ingredient_json->>'notes')::text, '')
      FROM ins;
    END LOOP;
  END LOOP;
END
$$;

-- Now handle the shopping_list_items table
-- First, backup existing data
CREATE TEMP TABLE temp_shopping_items AS
SELECT 
  user_id,
  name,
  week_start,
  checked,
  recipes
FROM shopping_list_items;

-- Drop and recreate shopping_list_items with new structure
DROP TABLE IF EXISTS "shopping_list_items" CASCADE;

CREATE TABLE IF NOT EXISTS "shopping_list_items" (
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

-- Migrate existing shopping list items to new structure
INSERT INTO shopping_list_items (user_id, ingredient_id, start_date, end_date, checked, recipe_ids)
SELECT 
  t.user_id,
  i.id as ingredient_id,
  t.week_start as start_date,
  t.week_start + interval '7 days' as end_date,
  t.checked,
  t.recipes as recipe_ids
FROM temp_shopping_items t
JOIN ingredients i ON lower(trim(t.name)) = i.name;

-- Drop temporary table
DROP TABLE temp_shopping_items;

-- Drop the ingredients column from recipes after successful migration
ALTER TABLE recipes DROP COLUMN IF EXISTS ingredients;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_recipe_ingredients_recipe_id" ON "recipe_ingredients"("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_ingredients_ingredient_id" ON "recipe_ingredients"("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_user_id" ON "shopping_list_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_ingredient_id" ON "shopping_list_items"("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_shopping_list_items_date_range" ON "shopping_list_items"("start_date", "end_date");