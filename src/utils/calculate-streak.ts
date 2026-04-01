import dayjs from "dayjs";

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

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
