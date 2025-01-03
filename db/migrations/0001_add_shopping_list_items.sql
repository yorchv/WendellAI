
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
