import { db } from "../lib/db.js";
import {
  NotFoundError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  userWorkoutSessionId: string;
}

export class StartWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await db.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Plano de treino não encontrado");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Plano de treino não encontrado");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("O plano de treino não está ativo");
    }

    const workoutDay = await db.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
    });

    if (!workoutDay) {
      throw new NotFoundError("Dia de treino não encontrado");
    }

    const existingSession = await db.workoutSession.findFirst({
      where: { workoutDayId: dto.workoutDayId },
    });

    if (existingSession) {
      throw new SessionAlreadyStartedError(
        "Uma sessão já foi iniciada para este dia"
      );
    }

    const session = await db.workoutSession.create({
      data: {
        workoutDayId: dto.workoutDayId,
        startedAt: new Date(),
      },
    });

    return {
      userWorkoutSessionId: session.id,
    };
  }
}
