import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

async function test_count_zero() {
    console.log("Testing .limit(id, { count: 0 })");
    // We don't even need real redis, we can just inspect the Ratelimit source or typescript definition if we can.
    const r = new Ratelimit({
        redis: {} as any,
        limiter: Ratelimit.slidingWindow(10, "1 d"),
    });

    console.log("Ratelimit methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(r)));
}

test_count_zero();
