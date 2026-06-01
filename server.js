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
        
        const prompt = `
        Task: ${currentTask}
        
        Page Context:
        ${pageContext}

        Interactive Elements:
        ${JSON.stringify(pageElements)}

        Instructions:
        1. Find the correct answer for the question or the next logical step.
        2. Match it with the correct 'id' from the Interactive Elements list.
        3. Output ONLY a valid JSON object. No extra text, no markdown.
        Format: {"action": "click", "selector": "#id"} OR {"action": "type", "selector": "#id", "value": "text"}
        `;

        // Nuvvu icchina models list. First nunchi try chestundi.
        const modelsToTry = [
            "gemini-3.1-pro", 
            "gemini-3-flash", 
            "gemini-3.1-flash-lite", 
            "gemini-2.5-flash", 
            "gemini-1.5-flash"
        ];

        let actionData = null;

        // Okkoka model ni try chestundi
        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                
                let aiResponse = result.response.text();
                
                // Clean JSON instantly
                aiResponse = aiResponse.replace(/```json/g, '').replace(/
```/g, '').trim();
                actionData = JSON.parse(aiResponse);
                
                console.log(`✅ Success with model: ${modelName}`);
                break; // Model work ayithe loop aapesi bayataki vachhestundi
                
            } catch (err) {
                console.log(`❌ Failed with model: ${modelName}. Trying next...`);
                // Fail ayithe emi aagadu, next model ki vellipothundi
            }
        }

        // Anni try chesaka data vasthe frontend ki pampistundi
        if (actionData) {
            res.json(actionData);
        } else {
            throw new Error("All models failed to generate a response.");
        }

    } catch (error) {
        console.error("Final AI Error:", error);
        res.status(500).json({ error: "Failed to process task. Check Render logs." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
