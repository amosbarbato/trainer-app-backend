import { z } from "zod";
import { WeekDay } from "../generated/prisma/enums.js";

const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.uuid(),
  todayWorkoutDay: z.object({
    workoutPlanId: z.uuid(),
    id: z.uuid(),
    name: z.string(),
    isRest: z.boolean(),
    weekDay: z.string(),
    estimatedDurationInSeconds: z.number(),
    coverImageUrl: z.url().optional(),
    exercisesCount: z.number(),
  }),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    })
  ),
});

const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      coverImageUrl: z.url().optional().nullable(),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          restTimeInSeconds: z.number().min(1),
        })
      ),
    })
  ),
});

const GetWorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.url().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    })
  ),
});

const StartWorkoutSessionSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

const UpdateWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

const UpdateWorkoutSessionSchema = z.object({
  id: z.uuid(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
});

const GetWorkoutDaySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
    })
  ),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      workoutDayId: z.uuid(),
      startedAt: z.iso.date().optional(),
      completedAt: z.iso.date().optional(),
    })
  ),
});

const StatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

const StatsSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    })
  ),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

const ListWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const ListWorkoutPlansSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        coverImageUrl: z.url().optional(),
        exercises: z.array(
          z.object({
            id: z.uuid(),
            order: z.number(),
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number(),
          })
        ),
      })
    ),
  })
);

const UpsertUserTrainDataBodySchema = z.object({
  weightInGrams: z.number().min(0),
  heightInCentimeters: z.number().min(0),
  age: z.number().min(0),
  bodyFatPercentage: z.number().min(0).max(100),
});

const UserTrainDataSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number().min(0).max(100),
});

const UpsertUserTrainDataSchema = z.object({
  userId: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number(),
});

export {
  ErrorSchema,
  HomeDataSchema,
  WorkoutPlanSchema,
  GetWorkoutPlanSchema,
  StartWorkoutSessionSchema,
  UpdateWorkoutSessionBodySchema,
  UpdateWorkoutSessionSchema,
  GetWorkoutDaySchema,
  StatsQuerySchema,
  StatsSchema,
  ListWorkoutPlansQuerySchema,
  ListWorkoutPlansSchema,
  UpsertUserTrainDataBodySchema,
  UserTrainDataSchema,
  UpsertUserTrainDataSchema,
};
