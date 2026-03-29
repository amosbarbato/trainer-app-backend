import { db } from "../lib/db.js";
import { NotFoundError } from "../errors/index.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

interface OutputDto {
  id: string;
  startedAt: string;
  completedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await db.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("WPlano de treino não encontrado");
    }

    const workoutDay = await db.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
    });

    if (!workoutDay) {
      throw new NotFoundError("Plano de treino não encontrado");
    }

    const session = await db.workoutSession.findUnique({
      where: { id: dto.sessionId, workoutDayId: dto.workoutDayId },
    });

    if (!session) {
      throw new NotFoundError("Sessão de treino não encontrada");
    }

    const updatedSession = await db.workoutSession.update({
      where: { id: dto.sessionId },
      data: { completedAt: new Date(dto.completedAt) },
    });

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt.toISOString(),
      completedAt: updatedSession.completedAt!.toISOString(),
    };
  }
}
