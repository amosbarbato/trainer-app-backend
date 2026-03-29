import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { GetUserTrainData } from "../services/get-user-train-data.service.js";
import { UpsertUserTrainData } from "../services/upsert-user-train-data.service.js";
import {
  ErrorSchema,
  UpsertUserTrainDataBodySchema,
  UpsertUserTrainDataSchema,
  UserTrainDataSchema,
} from "../schemas/index.js";

export const meRoutes = async (app: FastifyInstance) => {
  // Carrega os dados do usuário
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Me"],
      summary: "Get user train data",
      response: {
        200: UserTrainDataSchema.nullable(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const getUserTrainData = new GetUserTrainData();

        const result = await getUserTrainData.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // Atualiza os dados do usuário
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/",
    schema: {
      tags: ["Me"],
      summary: "Upsert user train data",
      body: UpsertUserTrainDataBodySchema,
      response: {
        200: UpsertUserTrainDataSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const upsertUserTrainData = new UpsertUserTrainData();

        const result = await upsertUserTrainData.execute({
          userId: session.user.id,
          weightInGrams: request.body.weightInGrams,
          heightInCentimeters: request.body.heightInCentimeters,
          age: request.body.age,
          bodyFatPercentage: request.body.bodyFatPercentage,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
