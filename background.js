chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSuggestion') {
        handleSuggestionRequest(request.history)
            .then(suggestion => {
                if (chrome.runtime.lastError) {
                    sendResponse({ error: chrome.runtime.lastError.message });
                    return;
                }
                sendResponse({ suggestion });
            })
            .catch(error => {
                console.error('Error in handleSuggestionRequest:', error);
                sendResponse({ error: error.message });
            });
        return true; // Required for async response
    }
});

async function handleSuggestionRequest(messageHistory) {
    const settings = await getSettings();
    if (!settings.api_key) {
        throw new Error('API key not found. Please set it in the extension popup.');
    }

    // Format conversation history
    const formattedHistory = messageHistory.map(msg =>
        `${msg.role.toUpperCase()}: ${msg.text}`
    ).join('\n');

    switch (settings.provider) {
        case 'openai':
            return await handleOpenAIRequest(formattedHistory, settings);
        case 'anthropic':
            return await handleClaudeRequest(formattedHistory, settings);
        case 'deepseek':
            return await handleDeepSeekRequest(formattedHistory, settings);
        default:
            throw new Error('Invalid AI provider selected');
    }
}

async function handleOpenAIRequest(formattedHistory, settings) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.api_key}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an Etsy seller assistant. Generate appropriate responses to customer messages based on the conversation history. Be professional, helpful, and concise. Focus on addressing the customer\'s specific questions or concerns.'
                    },
                    {
                        role: 'user',
                        content: `Here is the conversation history between a customer and seller:\n\n${formattedHistory}\n\nPlease suggest a professional and concise response as the seller.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}

async function handleClaudeRequest(formattedHistory, settings) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.api_key,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model,
                max_tokens: 150,
                messages: [{
                    role: 'user',
                    content: `You are an Etsy seller assistant. Here is the conversation history between a customer and seller:\n\n${formattedHistory}\n\nPlease suggest a professional and concise response as the seller.`
                }],
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}

async function handleDeepSeekRequest(formattedHistory, settings) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.api_key}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an Etsy seller assistant. Generate appropriate responses to customer messages based on the conversation history. Be professional, helpful, and concise.'
                    },
                    {
                        role: 'user',
                        content: `Here is the conversation history between a customer and seller:\n\n${formattedHistory}\n\nPlease suggest a professional and concise response as the seller.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}

async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['provider', 'model'], async function (result) {
            if (chrome.runtime.lastError) {
                console.error('Error getting settings:', chrome.runtime.lastError);
                resolve({
                    provider: 'openai',
                    model: 'gpt-3.5-turbo',
                    api_key: null
                });
                return;
            }

            const provider = result.provider || 'openai';
            const model = result.model || 'gpt-3.5-turbo';

            // Get the API key for the specific provider
            const apiKeyResult = await chrome.storage.local.get(`${provider}_api_key`);
            const api_key = apiKeyResult[`${provider}_api_key`];

            resolve({
                provider,
                model,
                api_key
            });
        });
    });
} 