import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db.js";

export const auth = betterAuth({
  baseURL: process.env.API_BASE_URL,
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
});
