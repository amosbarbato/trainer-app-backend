import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  baseURL: env.API_BASE_URL,
  trustedOrigins: [env.WEB_APP_BASE_URL],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
  advanced: {
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      secure: true,
      sameSite: "none",
    },
  },
  cookies: {
    secure: true,
    sameSite: "none",
  },
});
