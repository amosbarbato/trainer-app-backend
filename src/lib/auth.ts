import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db.js";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: { enabled: true },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
});
