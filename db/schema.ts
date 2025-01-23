import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  birthDate: date("birth_date").notNull(),
  isGuest: boolean("is_guest").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dietaryPreferences = pgTable("dietary_preferences", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  type: text("type").notNull(), // 'ALLERGY', 'DIET', 'SUPPLEMENTATION'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMemberDietaryPreferences = pgTable("family_member_dietary_preferences", {
  id: serial("id").primaryKey(),
  familyMemberId: integer("family_member_id")
    .references(() => familyMembers.id)
    .notNull(),
  dietaryPreferenceId: integer("dietary_preference_id")
    .references(() => dietaryPreferences.id)
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  instructions: jsonb("instructions").$type<string[]>().notNull(),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  image: text("image"),
  sources: jsonb("sources").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id, { onDelete: "cascade" })
    .notNull(),
  ingredientId: integer("ingredient_id")
    .references(() => ingredients.id)
    .notNull(),
  quantity: decimal("quantity"),
  unit: text("unit"),
  notes: text("notes"),
});

export const recipeDietaryPreferences = pgTable("recipe_dietary_preferences", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id, { onDelete: "cascade" })
    .notNull(),
  dietaryPreferenceId: integer("dietary_preference_id")
    .references(() => dietaryPreferences.id)
    .notNull(),
  isCompatible: boolean("is_compatible").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMemberMealParticipation = pgTable("family_member_meal_participation", {
  id: serial("id").primaryKey(),
  familyMemberId: integer("family_member_id")
    .references(() => familyMembers.id)
    .notNull(),
  defaultParticipation: boolean("default_participation").default(true).notNull(),
  defaultMeals: jsonb("default_meals").$type<MealType[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  days: jsonb("days").$type<Array<{
    dayName: DayType;
    calendarDay: string;
    meals: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  ingredientId: integer("ingredient_id")
    .references(() => ingredients.id)
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  quantity: decimal("quantity"),
  unit: text("unit"),
  checked: boolean("checked").default(false),
  recipeIds: jsonb("recipe_ids").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  mealPlans: many(mealPlans),
  shoppingListItems: many(shoppingListItems),
  familyMembers: many(familyMembers),
}));

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  ingredients: many(recipeIngredients),
  dietaryPreferences: many(recipeDietaryPreferences),
}));

export const ingredientRelations = relations(ingredients, ({ many }) => ({
  recipes: many(recipeIngredients),
  shoppingListItems: many(shoppingListItems),
}));

export const recipeIngredientRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  user: one(users, {
    fields: [apiUsage.userId],
    references: [users.id],
  }),
}));


export const familyMemberRelations = relations(familyMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [familyMembers.userId],
    references: [users.id],
  }),
  dietaryPreferences: many(familyMemberDietaryPreferences),
  mealParticipations: many(familyMemberMealParticipation),
}));

export const dietaryPreferenceRelations = relations(dietaryPreferences, ({ many }) => ({
  familyMembers: many(familyMemberDietaryPreferences),
  recipes: many(recipeDietaryPreferences),
}));

export const familyMemberDietaryPreferenceRelations = relations(familyMemberDietaryPreferences, ({ one }) => ({
  familyMember: one(familyMembers, {
    fields: [familyMemberDietaryPreferences.familyMemberId],
    references: [familyMembers.id],
  }),
  dietaryPreference: one(dietaryPreferences, {
    fields: [familyMemberDietaryPreferences.dietaryPreferenceId],
    references: [dietaryPreferences.id],
  }),
}));

export const recipeDietaryPreferenceRelations = relations(recipeDietaryPreferences, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeDietaryPreferences.recipeId],
    references: [recipes.id],
  }),
  dietaryPreference: one(dietaryPreferences, {
    fields: [recipeDietaryPreferences.dietaryPreferenceId],
    references: [dietaryPreferences.id],
  }),
}));

export const familyMemberMealParticipationRelations = relations(familyMemberMealParticipation, ({ one }) => ({
  familyMember: one(familyMembers, {
    fields: [familyMemberMealParticipation.familyMemberId],
    references: [familyMembers.id],
  }),
}));


// Types
export const mealTypeEnum = ["breakfast", "lunch", "dinner"] as const;
export type MealType = typeof mealTypeEnum[number];

export const dayEnum = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type DayType = typeof dayEnum[number];

export type MealPlan = typeof mealPlans.$inferSelect & {
  days?: Array<{
    dayName: DayType;
    calendarDay: string;
    meals: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  }>;
};

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = typeof recipeIngredients.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = User;

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = typeof shoppingListItems.$inferInsert;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

export type DietaryPreference = typeof dietaryPreferences.$inferSelect;
export type InsertDietaryPreference = typeof dietaryPreferences.$inferInsert;

export type FamilyMemberDietaryPreference = typeof familyMemberDietaryPreferences.$inferSelect;
export type InsertFamilyMemberDietaryPreference = typeof familyMemberDietaryPreferences.$inferInsert;

export type RecipeDietaryPreference = typeof recipeDietaryPreferences.$inferSelect;
export type InsertRecipeDietaryPreference = typeof recipeDietaryPreferences.$inferInsert;

export type FamilyMemberMealParticipation = typeof familyMemberMealParticipation.$inferSelect;
export type InsertFamilyMemberMealParticipation = typeof familyMemberMealParticipation.$inferInsert;

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);

export const insertIngredientSchema = createInsertSchema(ingredients);
export const selectIngredientSchema = createSelectSchema(ingredients);

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients);
export const selectRecipeIngredientSchema = createSelectSchema(recipeIngredients);

export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems);
export const selectShoppingListItemSchema = createSelectSchema(shoppingListItems);

export const insertFamilyMemberSchema = createInsertSchema(familyMembers);
export const selectFamilyMemberSchema = createSelectSchema(familyMembers);

export const insertDietaryPreferenceSchema = createInsertSchema(dietaryPreferences);
export const selectDietaryPreferenceSchema = createSelectSchema(dietaryPreferences);

export const insertFamilyMemberDietaryPreferenceSchema = createInsertSchema(familyMemberDietaryPreferences);
export const selectFamilyMemberDietaryPreferenceSchema = createSelectSchema(familyMemberDietaryPreferences);

export const insertRecipeDietaryPreferenceSchema = createInsertSchema(recipeDietaryPreferences);
export const selectRecipeDietaryPreferenceSchema = createSelectSchema(recipeDietaryPreferences);

export const insertFamilyMemberMealParticipationSchema = createInsertSchema(familyMemberMealParticipation);
export const selectFamilyMemberMealParticipationSchema = createSelectSchema(familyMemberMealParticipation);

export const insertWaitlistSchema = createInsertSchema(waitlist);
export const selectWaitlistSchema = createSelectSchema(waitlist);