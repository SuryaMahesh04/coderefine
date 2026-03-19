import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { analysisLimiters } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userPlan = (session.user as any).plan || "free";
    const limiter = (analysisLimiters as any)[userPlan] || analysisLimiters.free;

    try {
        let remaining = 0;
        if (limiter.limit) {
            const res = await limiter.limit(userId, { count: 0 });
            remaining = res.remaining;
        }
        
        const limits = {
            free: 10,
            pro: 100,
            team: 1000
        };
        const limit = (limits as any)[userPlan] || 10;

        return NextResponse.json({
            plan: userPlan,
            limit: limit,
            remaining: remaining,
            used: Math.max(0, limit - remaining)
        });
    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ 
            plan: userPlan, 
            limit: 10, 
            remaining: 0, 
            used: 10,
            error: "Failed to fetch real-time usage" 
        });
    }
}
