const API_KEY = "357ff9a3125ee46f99546d84604817a2";

async function testApi() {
    const endpoints = [
        "https://api.onlinecompiler.io/api/v1/run-code",
        "https://api.onlinecompiler.io/v2/run-code",
        "https://api.onlinecompiler.io/api/run-code/"
    ];

    for (const url of endpoints) {
        console.log(`Testing ${url}...`);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "X-API-Key": API_KEY, // Some APIs use X-API-Key
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    compiler: "nodejs",
                    code: "console.log('hello world');",
                    input: "",
                }),
            });

            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response: ${text.substring(0, 200)}...`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        console.log("-------------------");
    }
}

testApi();
