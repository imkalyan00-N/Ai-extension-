// Floating "Start AI" button create chestunnam
const startBtn = document.createElement('button');
startBtn.innerText = "🤫 Start AI Task";
startBtn.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:99999; padding:15px; background:#007BFF; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;";
document.body.appendChild(startBtn);

startBtn.addEventListener('click', async () => {
    startBtn.innerText = "⏳ AI Thinking...";
    
    // Page loni unna buttons, links, inputs ni capture chestundi
    const elements = Array.from(document.querySelectorAll('button, a, input, textarea')).map(el => {
        return {
            tag: el.tagName,
            id: el.id,
            className: el.className,
            text: el.innerText || el.placeholder || el.value,
            type: el.type
        };
    }).filter(el => el.text || el.id); // Khaali elements ni filter chestunnam

    // Background script ki data pampistundi
    chrome.runtime.sendMessage({
        type: "PROCESS_PAGE",
        data: {
            pageElements: elements,
            currentTask: "Login to the portal and complete the first assignment" // Nee task ikkada change cheskovachu
        }
    });
});

// AI nunchi vachina command ni execute chese logic
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "EXECUTE_ACTION") {
        const { action, selector, value } = message.data;
        
        const targetElement = document.querySelector(selector);
        
        if (targetElement) {
            if (action === "click") {
                targetElement.click();
            } else if (action === "type") {
                targetElement.value = value;
                // Dispatch event to trigger React/Angular state changes if any
                targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
            }
            startBtn.innerText = "✅ Action Done! Click again for next step.";
        } else {
            startBtn.innerText = "❌ Element not found. Try again.";
        }
    }
});
