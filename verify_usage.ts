import { GET } from "./app/api/user/usage/route";
import { NextRequest } from "next/server";

// Mock getServerSession to bypass auth for testing
jest.mock("next-auth/next", () => ({
    getServerSession: jest.fn(() => Promise.resolve({ user: { id: "test_user", plan: "free" } }))
}));

async function verify() {
    try {
        const req = new NextRequest("http://localhost/api/user/usage");
        const res = await GET(req);
        const data = await res.json();
        console.log("Response data:", data);
    } catch (e) {
        console.error("Verification failed:", e);
    }
}

verify();
