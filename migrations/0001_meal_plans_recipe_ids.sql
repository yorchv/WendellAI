
-- Convert existing meal plans data to use arrays for recipeIds
CREATE OR REPLACE FUNCTION temp_convert_meal_plans() RETURNS void AS $$
DECLARE
    meal_plan RECORD;
    updated_meals jsonb;
BEGIN
    FOR meal_plan IN SELECT * FROM meal_plans LOOP
        SELECT jsonb_agg(
            jsonb_build_object(
                'day', meal->>'day',
                'recipes', jsonb_build_object(
                    'breakfast', jsonb_build_object(
                        'recipeIds', COALESCE(ARRAY(
                            SELECT jsonb_array_elements_text(
                                CASE 
                                    WHEN jsonb_typeof((meal->'recipes'->'breakfast')) = 'object' THEN
                                        jsonb_object_keys((meal->'recipes'->'breakfast')) ::jsonb
                                    ELSE '[]'::jsonb
                                END
                            )::jsonb
                        ), ARRAY[]::text[]),
                        'participants', COALESCE((meal->'recipes'->'breakfast'->'participants'), '[]'::jsonb)
                    ),
                    'lunch', jsonb_build_object(
                        'recipeIds', COALESCE(ARRAY(
                            SELECT jsonb_array_elements_text(
                                CASE 
                                    WHEN jsonb_typeof((meal->'recipes'->'lunch')) = 'object' THEN
                                        jsonb_object_keys((meal->'recipes'->'lunch')) ::jsonb
                                    ELSE '[]'::jsonb
                                END
                            )::jsonb
                        ), ARRAY[]::text[]),
                        'participants', COALESCE((meal->'recipes'->'lunch'->'participants'), '[]'::jsonb)
                    ),
                    'dinner', jsonb_build_object(
                        'recipeIds', COALESCE(ARRAY(
                            SELECT jsonb_array_elements_text(
                                CASE 
                                    WHEN jsonb_typeof((meal->'recipes'->'dinner')) = 'object' THEN
                                        jsonb_object_keys((meal->'recipes'->'dinner')) ::jsonb
                                    ELSE '[]'::jsonb
                                END
                            )::jsonb
                        ), ARRAY[]::text[]),
                        'participants', COALESCE((meal->'recipes'->'dinner'->'participants'), '[]'::jsonb)
                    )
                )
            )
        )
        INTO updated_meals
        FROM jsonb_array_elements(meal_plan.meals) meal;

        UPDATE meal_plans
        SET meals = updated_meals
        WHERE id = meal_plan.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the conversion function
SELECT temp_convert_meal_plans();

-- Drop the temporary function
DROP FUNCTION temp_convert_meal_plans();
