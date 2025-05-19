import { UserRole } from "@/lib/auth-advanced";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      provider: string;
    } & DefaultSession["user"];
    lastActive?: Date;
    sessionCount?: number;
  }

  interface User {
    id: string;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    provider: string;
    refreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
  }
}