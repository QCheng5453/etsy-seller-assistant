let messageHistory = [];

function updateMessageHistory() {
    // Collect message history
    const messageElements = document.querySelectorAll('.wt-text-body-01.wt-display-inline-block');
    messageHistory = Array.from(messageElements).map(elem => {
        const spanElement = elem.querySelector('span:not(.screen-reader-only)');
        const messageText = spanElement ? spanElement.textContent.trim() : '';
        const isCustomer = elem.classList.contains('wt-bg-white');
        return {
            text: messageText,
            role: isCustomer ? 'customer' : 'seller'
        };
    }).filter(msg => msg.text); // Filter out empty messages

    console.log('Updated message history:', messageHistory);
    return messageHistory.length > 0;
}

function initMessageAssistant() {
    console.log('Initializing message assistant...');

    // Find the message input field using the correct class selectors
    const messageInput = document.querySelector('textarea.wt-textarea.new-message-textarea-min-height');
    if (!messageInput) {
        console.log('Message input not found, will retry...');
        setTimeout(initMessageAssistant, 500);
        return;
    }

    // Check if button already exists to prevent duplicates
    if (messageInput.parentElement.querySelector('.ai-suggestion-button')) {
        console.log('Button already exists');
        return;
    }

    // Create suggestion button with proper Etsy styling
    const suggestButton = document.createElement('button');
    suggestButton.textContent = 'Get AI Suggestion';
    suggestButton.className = 'wt-btn wt-btn--small wt-btn--secondary wt-mt-xs-2 ai-suggestion-button';
    // Add additional styles
    suggestButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 24px;
        font-size: 13px;
        line-height: 1.4;
        min-height: 36px;
        min-width: 120px;
        transition: all 0.2s ease-in-out;
    `;

    // Create a container for better layout
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'wt-display-flex wt-justify-content-flex-end ai-suggestion-container';
    buttonContainer.style.cssText = `
        width: 100%;
        margin-top: 8px;
    `;

    // Add the button container after the textarea
    const textareaParent = messageInput.parentElement;
    textareaParent.insertBefore(buttonContainer, messageInput.nextSibling);
    buttonContainer.appendChild(suggestButton);

    // Handle suggestion button click with loading state
    suggestButton.addEventListener('click', async () => {
        try {
            // Update message history first
            if (!updateMessageHistory()) {
                messageInput.value = 'Error: No messages found in the conversation.';
                return;
            }

            // Add loading state
            suggestButton.disabled = true;
            suggestButton.innerHTML = `
                <span class="wt-spinner wt-spinner--01"></span>
                <span class="wt-ml-xs-2">Generating...</span>
            `;

            const response = await getSuggestedResponse(messageHistory);

            // Set the value and trigger input event to notify Etsy's handlers
            messageInput.value = response;
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Focus and set selection range to maintain the value
            messageInput.focus();
            messageInput.setSelectionRange(response.length, response.length);
        } catch (error) {
            console.error('Error:', error);
            messageInput.value = 'Error generating suggestion. Please try again.';
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        } finally {
            // Reset button state
            suggestButton.disabled = false;
            suggestButton.textContent = 'Get AI Suggestion';
        }
    });
}

async function getSuggestedResponse(history) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getSuggestion',
            history: history
        });
        return response.suggestion;
    } catch (error) {
        console.error('Error getting suggestion:', error);
        throw error;
    }
}

// Initialize when page loads
initMessageAssistant();

// Watch for changes in the chat content
const chatObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        // Check if the textarea was added or removed
        const textareaAdded = Array.from(mutation.addedNodes).some(node =>
            node.querySelector && node.querySelector('textarea.wt-textarea.new-message-textarea-min-height')
        );

        // Check if our button was removed
        const buttonRemoved = Array.from(mutation.removedNodes).some(node =>
            node.querySelector && node.querySelector('.ai-suggestion-button')
        );

        if (textareaAdded || buttonRemoved) {
            console.log('Chat interface changed, reinitializing...');
            initMessageAssistant();
        }
    }
});

// Start observing the entire document for changes
chatObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

// Also check for URL changes
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        console.log('URL changed, reinitializing...');
        lastUrl = currentUrl;
        setTimeout(initMessageAssistant, 500); // Wait for the new chat to load
    }
}, 1000); 