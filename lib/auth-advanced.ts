import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define user roles
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR"
}

// In-memory user store (in production, use a database)
const users: any[] = [];

// Session storage for advanced features
const sessions = new Map<string, any>();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = users.find(u => u.email === credentials.email);
        
        if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user"
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === "github" || account?.provider === "google") {
        // Check if user exists, if not create one
        const existingUser = users.find(u => u.email === user.email);
        
        if (!existingUser) {
          users.push({
            id: String(users.length + 1),
            email: user.email!,
            password: "", // OAuth users don't have passwords
            name: user.name!,
            role: UserRole.USER,
            image: user.image,
            emailVerified: new Date(),
            createdAt: new Date(),
          });
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || UserRole.USER;
        token.provider = account?.provider || "credentials";
        
        // Generate refresh token
        if (account?.provider === "credentials") {
          token.refreshToken = jwt.sign(
            { userId: user.id },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: "7d" }
          );
        }
      }
      
      // Update session
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      
      // Add session tracking
      if (token.id) {
        sessions.set(token.id as string, {
          lastActive: new Date(),
          ipAddress: token.ipAddress,
          userAgent: token.userAgent,
        });
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.provider = token.provider as string;
        
        // Add session info
        const sessionInfo = sessions.get(token.id as string);
        if (sessionInfo) {
          session.lastActive = sessionInfo.lastActive;
          session.sessionCount = sessions.size;
        }
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      // Log sign-in events for security
    },
    
    async signOut({ token }) {
      // Clean up session data
      if (token?.id) {
        sessions.delete(token.id as string);
      }
    },
    
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      // Send welcome email
    },
    
    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`);
    },
    
    async session({ session, token }) {
      // Track active sessions
      if (token?.id) {
        const sessionData = sessions.get(token.id as string);
        if (sessionData) {
          sessionData.lastActive = new Date();
        }
      }
    }
  },
  
  debug: process.env.NODE_ENV === "development",
};

// Helper functions for auth
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: any, expiresIn: string = "1h"): string {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, { expiresIn });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.NEXTAUTH_SECRET!);
}

// Get all active sessions for a user
export function getUserSessions(userId: string) {
  const userSessions = [];
  for (const [id, session] of sessions.entries()) {
    if (id === userId) {
      userSessions.push(session);
    }
  }
  return userSessions;
}

// Revoke all sessions for a user
export function revokeUserSessions(userId: string) {
  sessions.delete(userId);
}