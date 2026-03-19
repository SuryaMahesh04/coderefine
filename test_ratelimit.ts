import { analysisLimiters } from "./lib/rateLimit";

async function test() {
    try {
        const limiter = analysisLimiters.free;
        console.log("Limiter:", limiter);
        if (limiter.getRemaining) {
            const res = await limiter.getRemaining("test_user");
            console.log("getRemaining result:", res, "Type:", typeof res);
        } else {
            console.log("getRemaining is NOT defined on limiter");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
