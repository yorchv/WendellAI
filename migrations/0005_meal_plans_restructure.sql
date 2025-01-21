
-- Update meal plans to new structure
CREATE OR REPLACE FUNCTION temp_convert_meal_plans_to_new_structure() RETURNS void AS $$
DECLARE
    meal_plan RECORD;
    updated_days jsonb;
BEGIN
    FOR meal_plan IN SELECT * FROM meal_plans LOOP
        WITH day_data AS (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'dayName', meal->>'day',
                    'calendarDay', (meal_plan.weekStart::date + (CASE (meal->>'day')
                        WHEN 'Monday' THEN 0
                        WHEN 'Tuesday' THEN 1
                        WHEN 'Wednesday' THEN 2
                        WHEN 'Thursday' THEN 3
                        WHEN 'Friday' THEN 4
                        WHEN 'Saturday' THEN 5
                        WHEN 'Sunday' THEN 6
                    END || ' days')::interval)::text,
                    'meals', meal->'recipes'
                )
            )
            FROM jsonb_array_elements(meal_plan.meals) meal
        )
        SELECT days INTO updated_days FROM day_data;

        UPDATE meal_plans
        SET meals = updated_days
        WHERE id = meal_plan.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the conversion function
SELECT temp_convert_meal_plans_to_new_structure();

-- Drop the temporary function
DROP FUNCTION temp_convert_meal_plans_to_new_structure();

-- Rename meals column to days
ALTER TABLE meal_plans RENAME COLUMN meals TO days;
