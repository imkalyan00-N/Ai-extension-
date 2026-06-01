chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "PROCESS_PAGE") {
        
        // Ikkada nee Render Live URL replace cheyyi
        const RENDER_BACKEND_URL = "https://your-app-name.onrender.com/process-task"; 
        
        fetch(RENDER_BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.data)
        })
        .then(response => response.json())
        .then(aiInstruction => {
            console.log("AI Command:", aiInstruction);
            // Action execute cheyyamani content.js ki message pampistundi
            chrome.tabs.sendMessage(sender.tab.id, {
                type: "EXECUTE_ACTION",
                data: aiInstruction
            });
        })
        .catch(error => console.error("Error connecting to backend:", error));
    }
});
