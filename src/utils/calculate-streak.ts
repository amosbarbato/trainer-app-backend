import dayjs from "dayjs";
import { WEEKDAY_MAP } from "./weekday-map.js";

interface WorkoutDay {
  weekDay: string;
  isRest: boolean;
}

export function calculateWorkoutStreak(
  workoutDays: WorkoutDay[],
  completedDates: Set<string>,
  currentDate: dayjs.Dayjs
) {
  const planWeekDays = new Set(workoutDays.map((d) => d.weekDay));

  const restWeekDays = new Set(
    workoutDays.filter((d) => d.isRest).map((d) => d.weekDay)
  );

  let streak = 0;
  let day = currentDate;

  for (let i = 0; i < 365; i++) {
    const weekDay = WEEKDAY_MAP[day.day()];

    if (!weekDay || !planWeekDays.has(weekDay)) {
      day = day.subtract(1, "day");
      continue;
    }

    if (restWeekDays.has(weekDay)) {
      streak++;
      day = day.subtract(1, "day");
      continue;
    }

    const dateKey = day.format("YYYY-MM-DD");

    if (completedDates.has(dateKey)) {
      streak++;
      day = day.subtract(1, "day");
      continue;
    }

    break;
  }

  return streak;
}
