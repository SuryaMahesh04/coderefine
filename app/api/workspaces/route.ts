import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import connectDB from "../../../lib/mongoose";
import { Workspace } from "../../../lib/models/Workspace";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const workspaces = await Workspace.find({ userId: (session.user as any).id })
      .sort({ updatedAt: -1 })
      .select("-files"); // Don't send huge file payloads on listing

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, files } = body;

    if (!name || !files) {
        return NextResponse.json({ error: "Name and files are required" }, { status: 400 });
    }

    await connectDB();
    const workspace = await Workspace.create({
      userId: (session.user as any).id,
      name,
      files,
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
