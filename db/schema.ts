import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  instructions: jsonb("instructions").$type<string[]>().notNull(),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  image: text("image"),
  sources: jsonb("sources").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  meals: jsonb("meals").$type<
    {
      day: string;
      recipes: { breakfast: number; lunch: number; dinner: number };
    }[]
  >(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pantryItems = pgTable("pantry_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  items:
    jsonb("items").$type<
      { name: string; quantity: number; unit: string; checked: boolean }[]
    >(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  mealPlans: many(mealPlans),
  pantryItems: many(pantryItems),
  shoppingLists: many(shoppingLists),
}));

export const recipeRelations = relations(recipes, ({ one }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type PantryItem = typeof pantryItems.$inferSelect;
export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  weekStart: timestamp("week_start").notNull(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  checked: boolean("checked").default(false),
  recipes: jsonb("recipes").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
