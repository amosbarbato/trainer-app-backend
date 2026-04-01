import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "./env.js";

const adapter = new PrismaNeon({
  connectionString: env.DATABASE_URL,
});

export const db = new PrismaClient({ adapter });
