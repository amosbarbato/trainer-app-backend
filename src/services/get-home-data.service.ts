import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { db } from "../lib/db.js";
import type { WeekDay } from "../generated/prisma/enums.js";
import { calculateConsistencyByDay } from "../utils/calculate-consistency.js";
import { calculateWorkoutStreak } from "../utils/calculate-streak.js";
import { NotFoundError } from "../errors/index.js";

dayjs.extend(utc);

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

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
    weekDay: WeekDay;
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
      throw new Error("Nenhum treino ativo foi encontrado.");
    }

    const todayWeekDay = WEEKDAY_MAP[currentDate.day()];
    const todayWorkoutDay = workoutPlan.workoutDays.find(
      (day) => day.weekDay === todayWeekDay
    );

    if (!todayWorkoutDay) {
      throw new NotFoundError("Nenhum treino ativo foi encontrado.");
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
