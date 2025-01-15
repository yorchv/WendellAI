
-- Convert existing meal plans data to use array structure
CREATE OR REPLACE FUNCTION temp_convert_meal_plans_to_array() RETURNS void AS $$
DECLARE
    meal_plan RECORD;
    updated_meals jsonb;
BEGIN
    FOR meal_plan IN SELECT * FROM meal_plans LOOP
        WITH meal_data AS (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'day', meal->>'day',
                    'meals', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'mealType', meal_type,
                                'recipes', COALESCE((
                                    SELECT jsonb_agg(value::text::integer)
                                    FROM jsonb_each((meal->'recipes'->meal_type) - 'participants')
                                    WHERE key != 'participants'
                                ), '[]'::jsonb),
                                'participants', COALESCE(meal->'recipes'->meal_type->'participants', '[]'::jsonb)
                            )
                        )
                        FROM jsonb_array_elements_text('["breakfast", "lunch", "dinner"]'::jsonb) meal_type
                        WHERE meal->'recipes' ? meal_type
                    )
                )
            )
            FROM jsonb_array_elements(meal_plan.meals) meal
        )
        SELECT meals INTO updated_meals FROM meal_data;

        UPDATE meal_plans
        SET meals = updated_meals
        WHERE id = meal_plan.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the conversion function
SELECT temp_convert_meal_plans_to_array();

-- Drop the temporary function
DROP FUNCTION temp_convert_meal_plans_to_array();
