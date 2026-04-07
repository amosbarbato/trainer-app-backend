import "dotenv/config";

import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { z } from "zod";
import { auth } from "./lib/auth.js";
import { env } from "./lib/env.js";
import { workoutPlanRoutes } from "./routes/workout-plan.js";
import { homeRoutes } from "./routes/home.js";
import { statsRoutes } from "./routes/stats.js";
import { meRoutes } from "./routes/me.js";
import { aiRoutes } from "./routes/ai.js";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const app = Fastify({ logger: envToLogger[env.NODE_ENV] });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Bootcamp Treinos API",
      description: "API para o bootcamp de treinos do FSC",
      version: "1.0.0",
    },
    servers: [
      {
        description: "API Base URL",
        url: env.API_BASE_URL,
      },
    ],
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifyCors, {
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // permite qualquer deploy da Vercel
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // localhost
    if (origin === "http://localhost:3000") {
      return callback(null, true);
    }

    // produção customizada (se tiver)
    if (origin === env.WEB_APP_BASE_URL) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
});

// Docs
await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      { title: "Trainer AI API", slug: "trainer-ai-api", url: "/swagger.json" },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

// Routes
await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });
await app.register(homeRoutes, { prefix: "/home" });
await app.register(statsRoutes, { prefix: "/stats" });
await app.register(meRoutes, { prefix: "/me" });
await app.register(aiRoutes, { prefix: "/ai" });

// Swagger
app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",
  schema: {
    description: "Hello World",
    tags: ["Hello World"],
    response: {
      200: z.object({ message: z.string() }),
    },
  },
  handler: () => {
    return { message: "Hello World" };
  },
});

app.route({
  method: ["GET", "POST", "OPTIONS"],
  url: "/api/auth/*",
  schema: { hide: true },
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      // Process authentication request
      const response = await auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

try {
  await app.listen({ port: env.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
