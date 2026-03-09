"use server";

const API_KEY = process.env.ONLINE_COMPILER_API_KEY || "";

export async function executeCode(code: string, language: string) {
    try {
        // Map internal language selection to API expected formats if needed
        let safeLang = language.toLowerCase();
        if (safeLang === "javascript" || safeLang === "js") safeLang = "nodejs";
        if (safeLang === "ts") safeLang = "typescript";
        if (safeLang === "c++") safeLang = "cpp";

        const response = await fetch("https://api.onlinecompiler.io/v1/compile", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: safeLang,
                code: code,
                stdin: "",
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { output: "Unauthorized: Missing or invalid ONLINE_COMPILER_API_KEY.", exitCode: 1 };
            }
            return { output: "Error communicating with OnlineCompiler API.", exitCode: 1 };
        }

        const data = await response.json();
        return {
            output: data.output || "Execution finished with no output.",
            exitCode: data.exitCode,
        };
    } catch (e: any) {
        console.error("Execution Error:", e);
        return { output: "Failed to connect to execution engine.", exitCode: 1 };
    }
}
