-- Profile
insert into profiles (name, daily_protein_target, weight_unit) values ('User', 150, 'kg');

-- 5-day workout plan
insert into workout_plans (id, day_of_week, day_label, "order", is_rest_day) values
  ('11111111-1111-1111-1111-111111111101', 0, 'Chest & Triceps', 1, false),
  ('11111111-1111-1111-1111-111111111102', 1, 'Back & Biceps', 2, false),
  ('11111111-1111-1111-1111-111111111103', 2, 'Rest Day', 3, true),
  ('11111111-1111-1111-1111-111111111104', 3, 'Shoulders & Abs', 4, false),
  ('11111111-1111-1111-1111-111111111105', 4, 'Legs', 5, false),
  ('11111111-1111-1111-1111-111111111106', 5, 'Arms & Abs', 6, false),
  ('11111111-1111-1111-1111-111111111107', 6, 'Rest Day', 7, true);

-- Monday: Chest & Triceps
insert into plan_exercises (workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, "order") values
  ('11111111-1111-1111-1111-111111111101', 'Flat Bench Press', 4, 10, 12, 1),
  ('11111111-1111-1111-1111-111111111101', 'Incline Dumbbell Press', 3, 12, 12, 2),
  ('11111111-1111-1111-1111-111111111101', 'Cable Flyes', 3, 15, 15, 3),
  ('11111111-1111-1111-1111-111111111101', 'Tricep Pushdowns', 3, 12, 15, 4),
  ('11111111-1111-1111-1111-111111111101', 'Overhead Tricep Extension', 3, 12, 12, 5),
  ('11111111-1111-1111-1111-111111111101', 'Dips', 3, 8, 15, 6);

-- Tuesday: Back & Biceps
insert into plan_exercises (workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, "order") values
  ('11111111-1111-1111-1111-111111111102', 'Barbell Rows', 4, 10, 12, 1),
  ('11111111-1111-1111-1111-111111111102', 'Lat Pulldowns', 3, 12, 12, 2),
  ('11111111-1111-1111-1111-111111111102', 'Seated Cable Row', 3, 12, 12, 3),
  ('11111111-1111-1111-1111-111111111102', 'Face Pulls', 3, 15, 15, 4),
  ('11111111-1111-1111-1111-111111111102', 'Barbell Curls', 3, 10, 12, 5),
  ('11111111-1111-1111-1111-111111111102', 'Hammer Curls', 3, 12, 12, 6);

-- Thursday: Shoulders & Abs
insert into plan_exercises (workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, "order") values
  ('11111111-1111-1111-1111-111111111104', 'Overhead Press', 4, 8, 10, 1),
  ('11111111-1111-1111-1111-111111111104', 'Lateral Raises', 4, 12, 15, 2),
  ('11111111-1111-1111-1111-111111111104', 'Rear Delt Flyes', 3, 15, 15, 3),
  ('11111111-1111-1111-1111-111111111104', 'Shrugs', 3, 12, 15, 4),
  ('11111111-1111-1111-1111-111111111104', 'Cable Crunches', 3, 15, 20, 5),
  ('11111111-1111-1111-1111-111111111104', 'Hanging Leg Raises', 3, 10, 15, 6);

-- Friday: Legs
insert into plan_exercises (workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, "order") values
  ('11111111-1111-1111-1111-111111111105', 'Barbell Squats', 4, 8, 10, 1),
  ('11111111-1111-1111-1111-111111111105', 'Romanian Deadlifts', 3, 10, 12, 2),
  ('11111111-1111-1111-1111-111111111105', 'Leg Press', 3, 12, 15, 3),
  ('11111111-1111-1111-1111-111111111105', 'Leg Curls', 3, 12, 12, 4),
  ('11111111-1111-1111-1111-111111111105', 'Leg Extensions', 3, 12, 15, 5),
  ('11111111-1111-1111-1111-111111111105', 'Calf Raises', 4, 15, 20, 6);

-- Saturday: Arms & Abs
insert into plan_exercises (workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, "order") values
  ('11111111-1111-1111-1111-111111111106', 'Close Grip Bench Press', 3, 10, 12, 1),
  ('11111111-1111-1111-1111-111111111106', 'EZ Bar Curls', 3, 10, 12, 2),
  ('11111111-1111-1111-1111-111111111106', 'Skull Crushers', 3, 10, 12, 3),
  ('11111111-1111-1111-1111-111111111106', 'Incline Dumbbell Curls', 3, 12, 12, 4),
  ('11111111-1111-1111-1111-111111111106', 'Plank', 3, 30, 60, 5),
  ('11111111-1111-1111-1111-111111111106', 'Russian Twists', 3, 15, 20, 6);

-- Streaks
insert into streaks (streak_type, current_count, longest_count) values
  ('workout', 0, 0),
  ('photo', 0, 0);

-- Notification settings
insert into notification_settings (morning_checkin_time, missed_workout_time, photo_checkin_day, push_enabled) values
  ('07:00', '19:00', 0, false);
