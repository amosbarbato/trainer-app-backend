import "dotenv/config";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "../lib/auth.js";
import { GetUserTrainData } from "../services/get-user-train-data.service.js";
import { UpsertUserTrainData } from "../services/upsert-user-train-data.service.js";
import { ListWorkoutPlans } from "../services/list-workout-plans.service.js";
import { CreateWorkoutPlan } from "../services/create-workout-plan.service.js";
import { WorkoutPlanSchema } from "../schemas/index.js";
import { SYSTEM_PROMPT } from "../prompt/ai.js";

export const aiRoutes = async (app: FastifyInstance) => {
  // Rota para chat com personal trainer AI
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["AI"],
      summary: "Chat with AI personal trainer",
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      const userId = session.user.id;
      const { messages } = request.body as { messages: UIMessage[] };

      const result = streamText({
        model: google("gemini-3-flash-preview"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5),

        tools: {
          getUserTrainData: tool({
            description: "Busca os dados de treino do usuário",
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData();
              return getUserTrainData.execute({ userId });
            },
          }),

          updateUserTrainData: tool({
            description: "Atualiza os dados de treino do usuário",
            inputSchema: z.object({
              weightInGrams: z.number(),
              heightInCentimeters: z.number(),
              age: z.number(),
              bodyFatPercentage: z.number().int().min(0).max(100),
            }),
            execute: async (params) => {
              const upsertUserTrainData = new UpsertUserTrainData();
              return upsertUserTrainData.execute({ userId, ...params });
            },
          }),

          getWorkoutPlan: tool({
            description: "Lista os planos de treino do usuário",
            inputSchema: z.object({}),
            execute: async () => {
              const listWorkoutPlans = new ListWorkoutPlans();
              return listWorkoutPlans.execute({ userId });
            },
          }),

          createWorkoutPlan: tool({
            description: "Cria um novo plano de treino para o usuário",
            inputSchema: WorkoutPlanSchema.omit({ id: true }),
            execute: async (input) => {
              const createWorkoutPlan = new CreateWorkoutPlan();
              return createWorkoutPlan.execute({
                userId,
                name: input.name,
                workoutDays: input.workoutDays,
              });
            },
          }),
        },
      });

      const response = result.toUIMessageStreamResponse();

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));

      return reply.send(response.body);
    },
  });
};
