import dayjs from "dayjs";

interface Session {
  startedAt: Date;
  completedAt: Date | null;
}

export function calculateConsistencyByDay(
  weekSessions: Session[],
  weekStart: dayjs.Dayjs
) {
  const consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  > = {};

  for (let i = 0; i < 7; i++) {
    const day = weekStart.add(i, "day");
    const dateKey = day.format("YYYY-MM-DD");

    const daySessions = weekSessions.filter(
      (s) => dayjs.utc(s.startedAt).format("YYYY-MM-DD") === dateKey
    );

    const workoutDayStarted = daySessions.length > 0;

    const workoutDayCompleted = daySessions.some((s) => s.completedAt !== null);

    consistencyByDay[dateKey] = {
      workoutDayStarted,
      workoutDayCompleted,
    };
  }

  return consistencyByDay;
}
