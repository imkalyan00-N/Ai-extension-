const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/process-task', async (req, res) => {
    try {
        const { pageContext, pageElements, currentTask } = req.body;
        
        const prompt = `Task: ${currentTask}\nPage Context:\n${pageContext}\nInteractive Elements:\n${JSON.stringify(pageElements)}\n\nInstructions:\n1. Find the correct answer for the question or next step.\n2. Match it with the correct 'id' from the Interactive Elements list.\n3. Output ONLY a valid JSON object. No extra text.\nFormat: {"action": "click", "selector": "#id"} OR {"action": "type", "selector": "#id", "value": "text"}`;

        // Latest fast models list. First nunchi try chestundi
        const modelsToTry = [
            "gemini-3.5-flash",
            "gemini-3.1-flash-lite",
            "gemini-3.1-pro", 
            "gemini-3-flash", 
            "gemini-2.5-flash", 
            "gemini-1.5-flash"
        ];

        let actionData = null;

        for (const modelName of modelsToTry) {
            try {
                console.log("Trying model: " + modelName + "...");
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                
                let aiResponse = result.response.text();
                
                // Safe JSON cleaning (No Regex bugs)
                aiResponse = aiResponse.split('```json').join('').split('```').join('').trim();
                actionData = JSON.parse(aiResponse);
                
                console.log("✅ Success with model: " + modelName);
                break; // Work aite loop aagipothundi
                
            } catch (err) {
                console.log("❌ Failed with model: " + modelName + " - Trying next...");
            }
        }

        if (actionData) {
            res.json(actionData);
        } else {
            res.status(500).json({ error: "All models failed" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to process task." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
