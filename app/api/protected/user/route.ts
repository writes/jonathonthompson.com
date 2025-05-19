import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-advanced";
import { getUserSessions, revokeUserSessions } from "@/lib/auth-advanced";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user sessions
  const sessions = getUserSessions(session.user.id);

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      provider: session.user.provider,
    },
    sessions: sessions,
    sessionCount: sessions.length,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "revoke-sessions":
      revokeUserSessions(session.user.id);
      return NextResponse.json({ success: true, message: "All sessions revoked" });

    case "update-profile":
      // In a real app, update user in database
      return NextResponse.json({ 
        success: true, 
        message: "Profile updated",
        user: { ...session.user, ...body.data }
      });

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In a real app, delete user account
  return NextResponse.json({ 
    success: true, 
    message: "Account deletion initiated. This action cannot be undone."
  });
}