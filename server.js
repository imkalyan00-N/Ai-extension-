const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/process-task', async (req, res) => {
    try {
        const { pageElements, currentTask } = req.body;
        
        // Gemini model initialization
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-Lite" });

        const prompt = `
        You are an autonomous web agent completing a task: "${currentTask}".
        Here are the interactive elements on the current webpage:
        ${JSON.stringify(pageElements)}

        Based on the task, what should be the exact next action? 
        Respond STRICTLY in JSON format without any markdown blocks or extra text:
        {"action": "click" | "type" | "done", "selector": "CSS selector to target the element", "value": "text to type if action is type"}
        `;

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text();
        
        // Clean JSON response
        aiResponse = aiResponse.replace(/```json/g, '').replace(/
```/g, '').trim();
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
