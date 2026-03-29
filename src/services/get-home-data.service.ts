import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { db } from "../lib/db.js";
import { calculateConsistencyByDay } from "../utils/calculate-consistency.js";
import { WEEKDAY_MAP } from "../utils/weekday-map.js";
import { NotFoundError } from "../errors/index.js";
import { calculateWorkoutStreak } from "../utils/calculate-streak.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId: string;
  todayWorkoutDay: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: string;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const currentDate = dayjs.utc(dto.date);

    const workoutPlan = await db.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: {
        workoutDays: {
          include: {
            exercises: true,
            sessions: true,
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new Error("Plano de treino ativo não encontrado");
    }

    const todayWeekDay = WEEKDAY_MAP[currentDate.day()];
    const todayWorkoutDay = workoutPlan.workoutDays.find(
      (day) => day.weekDay === todayWeekDay
    );

    if (!todayWorkoutDay) {
      throw new NotFoundError("Nenhum treino foi encontrado para hoje");
    }

    const weekStart = currentDate.day(0).startOf("day");
    const weekEnd = currentDate.day(6).endOf("day");

    const weekSessions = await db.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId: workoutPlan.id },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate(),
        },
      },
    });

    const consistencyByDay = calculateConsistencyByDay(weekSessions, weekStart);

    const completedSessions = await db.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId: workoutPlan.id },
        completedAt: { not: null },
      },
      select: { startedAt: true },
    });

    const completedDates = new Set(
      completedSessions.map((s) => dayjs.utc(s.startedAt).format("YYYY-MM-DD"))
    );

    const workoutStreak = calculateWorkoutStreak(
      workoutPlan.workoutDays,
      completedDates,
      currentDate
    );

    return {
      activeWorkoutPlanId: workoutPlan.id,
      todayWorkoutDay: {
        workoutPlanId: workoutPlan.id,
        id: todayWorkoutDay.id,
        name: todayWorkoutDay.name,
        isRest: todayWorkoutDay.isRest,
        weekDay: todayWorkoutDay.weekDay,
        estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
        coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todayWorkoutDay.exercises.length,
      },
      workoutStreak,
      consistencyByDay,
    };
  }
}
