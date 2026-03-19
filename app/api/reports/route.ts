import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import connectDB from "../../../lib/mongoose";
import { AnalysisReport } from "../../../lib/models/AnalysisReport";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    await connectDB();
    
    // Construct query dependent on whether a workspace filter is provided
    const query: any = { userId: (session.user as any).id };
    if (workspaceId) {
        query.workspaceId = workspaceId;
    }

    const reports = await AnalysisReport.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
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
    
    // ── RATE LIMIT: Analysis Quota ──
    const { analysisLimiters } = require("../../../lib/rateLimit");
    const userId = (session.user as any).id;
    const userPlan = (session.user as any).plan || "free";
    const limiter = analysisLimiters[userPlan as keyof typeof analysisLimiters] || analysisLimiters.free;

    const { success, limit, remaining } = await limiter.limit(userId);

    if (!success) {
      return NextResponse.json({ 
        error: `Analysis limit reached. Your plan allows ${limit} analyses per day. Upgrade to increase your limit.`,
        limit,
        remaining: 0
      }, { status: 429 });
    }
    
    // Validate required fields based on our Mongoose model
    const { scores, bugs, filesAnalyzed, appliedEdits = [], workspaceId } = body;

    if (!scores || !bugs) {
      return NextResponse.json({ error: "Scores and bugs are required" }, { status: 400 });
    }

    await connectDB();
    const report = await AnalysisReport.create({
      userId: (session.user as any).id,
      workspaceId: workspaceId || undefined,
      scores,
      bugs,
      filesAnalyzed: filesAnalyzed || [],
      appliedEdits,
      timestamp: new Date()
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId, edit } = await req.json();
    if (!reportId || !edit) {
      return NextResponse.json({ error: "Report ID and edit details are required" }, { status: 400 });
    }

    await connectDB();
    const report = await AnalysisReport.findOneAndUpdate(
      { _id: reportId, userId: (session.user as any).id },
      { $push: { appliedEdits: edit } },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
