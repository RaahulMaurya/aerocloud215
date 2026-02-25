const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function listModels() {
    try {
        // Read .env.local to get the key
        const envPath = path.join(__dirname, '..', '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);

        if (!match || !match[1]) {
            console.error("Could not find GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
            return;
        }

        const apiKey = match[1].trim();
        console.log(`Using API Key: ${apiKey.substring(0, 10)}...`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // There isn't a direct "listModels" on the SDK instance easily accessible in all versions, 
        // but we can try a direct fetch to the API endpoint which is what the SDK does under the hood for some things,
        // or we can test a generation with a few known candidates.

        // Actually, let's just try to generate content with a few common model names and see which one doesn't 404.
        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-flash"
        ];

        console.log("\nTesting models...");

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                await m.generateContent("Hello");
                console.log("✅ SUCCESS");
            } catch (error) {
                if (error.message.includes("404") || error.message.includes("not found")) {
                    console.log("❌ NOT FOUND (404)");
                } else {
                    console.log(`❌ ERROR: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error("\nCRITICAL ERROR:", error.message);
    }
}

listModels();
