
-- Convert existing meal plans data to include participants
CREATE OR REPLACE FUNCTION temp_convert_meal_plans_participants() RETURNS void AS $$
DECLARE
    meal_plan RECORD;
    updated_meals jsonb;
BEGIN
    FOR meal_plan IN SELECT * FROM meal_plans LOOP
        WITH meal_data AS (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'day', meal->>'day',
                    'recipes', jsonb_build_object(
                        'breakfast', jsonb_build_object(
                            'recipeIds', COALESCE(meal->'recipes'->'breakfast', '[]'::jsonb),
                            'participants', '[]'::jsonb
                        ),
                        'lunch', jsonb_build_object(
                            'recipeIds', COALESCE(meal->'recipes'->'lunch', '[]'::jsonb),
                            'participants', '[]'::jsonb
                        ),
                        'dinner', jsonb_build_object(
                            'recipeIds', COALESCE(meal->'recipes'->'dinner', '[]'::jsonb),
                            'participants', '[]'::jsonb
                        )
                    )
                )
            ) as meal_data_agg
            FROM jsonb_array_elements(meal_plan.meals) meal
        )
        SELECT meal_data_agg INTO updated_meals FROM meal_data;

        UPDATE meal_plans
        SET meals = updated_meals
        WHERE id = meal_plan.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the conversion function
SELECT temp_convert_meal_plans_participants();

-- Drop the temporary function
DROP FUNCTION temp_convert_meal_plans_participants();
