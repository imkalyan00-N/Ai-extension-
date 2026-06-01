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
        
        // Nuvvu test chesina super fast model
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

        // Prompt ni chala short chesam, appude fast ga answer isthundi
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

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text();
        
        // Clean JSON instantly
        aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const actionData = JSON.parse(aiResponse);

        res.json(actionData);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to process task" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
