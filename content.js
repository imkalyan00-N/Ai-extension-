const startBtn = document.createElement('button');
startBtn.innerText = "💪😉 Start kalyan AI Task";
startBtn.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:99999; padding:15px; background:#007BFF; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s;";
document.body.appendChild(startBtn);

startBtn.addEventListener('click', async () => {
    startBtn.innerText = "⚡ Thinking Fast...";
    startBtn.style.background = "#FF9800"; // Orange color while thinking
    
    // Fast ga page text read cheyadam (up to 4000 characters)
    const pageText = document.body.innerText.substring(0, 4000); 

    // Elements filter cheyadam (IDs unte ok, lekapothe kotha ID assign cheyadam)
    const elements = Array.from(document.querySelectorAll('button, a, input, textarea, select, label, [role="button"], [role="radio"]')).map((el, index) => {
        if (!el.id) el.id = 'ai-btn-' + index; 
        return {
            id: el.id,
            tag: el.tagName,
            text: (el.innerText || el.value || el.placeholder || '').trim().substring(0, 100),
            type: el.type
        };
    }).filter(el => el.text !== ""); // Khaali elements vadilestham

    chrome.runtime.sendMessage({
        type: "PROCESS_PAGE",
        data: {
            pageContext: pageText,
            pageElements: elements,
            currentTask: "Analyze the question context, find the correct answer, and click its option/radio button."
        }
    });
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "EXECUTE_ACTION") {
        const { action, selector, value } = message.data;
        const targetElement = document.querySelector(selector);
        
        if (targetElement) {
            if (action === "click") {
                targetElement.click();
            } else if (action === "type") {
                targetElement.value = value;
                targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                targetElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            startBtn.innerText = "✅ Done! Next?";
            startBtn.style.background = "#4CAF50"; // Green color on success
        } else {
            startBtn.innerText = "❌ Element Missed";
            startBtn.style.background = "#F44336"; // Red color on fail
        }
    }
});
