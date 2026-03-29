import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { db } from "../lib/db.js";
import { calculateConsistencyByDay } from "../utils/calculate-consistency.js";
import { calculateWorkoutStreak } from "../utils/calculate-streak.js";
import { NotFoundError } from "../errors/index.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  from: string;
  to: string;
}

interface OutputDto {
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
  completedWorkoutsCount: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const fromDate = dayjs.utc(dto.from).startOf("day");
    const toDate = dayjs.utc(dto.to).endOf("day");

    const workoutPlan = await db.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: { workoutDays: true },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Nenhum treino ativo foi encontrado");
    }

    // Sessão dentro do período
    const sessions = await db.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId: workoutPlan.id },
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate(),
        },
      },
    });

    // Consistencia
    const consistencyByDay = calculateConsistencyByDay(sessions, fromDate);

    // Métricas
    const completedSessions = sessions.filter((s) => s.completedAt !== null);
    const completedWorkoutsCount = completedSessions.length;

    const conclusionRate =
      sessions.length > 0 ? completedWorkoutsCount / sessions.length : 0;

    const totalTimeInSeconds = completedSessions.reduce((total, session) => {
      const start = dayjs.utc(session.startedAt);
      const end = dayjs.utc(session.completedAt!);
      return total + end.diff(start, "second");
    }, 0);

    // Sessões completas
    const allCompletedSessions = await db.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId: workoutPlan.id },
        completedAt: { not: null },
      },
      select: { startedAt: true },
    });

    const completedDates = new Set(
      allCompletedSessions.map((s) =>
        dayjs.utc(s.startedAt).format("YYYY-MM-DD")
      )
    );

    // Streak
    const workoutStreak = calculateWorkoutStreak(
      workoutPlan.workoutDays,
      completedDates,
      toDate
    );

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    };
  }
}
