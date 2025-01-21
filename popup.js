// Model configurations for different providers
const providerModels = {
    openai: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
        { id: 'gpt-4', name: 'GPT-4' }
    ],
    anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
    deepseek: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    const providerSelect = document.getElementById('provider');
    const modelSelect = document.getElementById('model');
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save-settings');
    const statusDiv = document.getElementById('status');
    const toggleVisibilityButton = document.querySelector('.toggle-visibility');

    // Function to update model options based on selected provider
    function updateModelOptions(provider) {
        modelSelect.innerHTML = '';
        providerModels[provider].forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
    }

    // Function to get the storage key for the current provider's API key
    function getApiKeyStorageKey(provider) {
        return `${provider}_api_key`;
    }

    // Function to load API key for the current provider
    async function loadApiKey(provider) {
        const result = await chrome.storage.local.get(getApiKeyStorageKey(provider));
        const apiKey = result[getApiKeyStorageKey(provider)];
        if (apiKey) {
            apiKeyInput.value = apiKey;
        } else {
            apiKeyInput.value = '';
        }
    }

    // Initialize model options and load saved settings
    async function initializeSettings() {
        // Load saved provider and model
        const result = await chrome.storage.local.get(['provider', 'model']);

        // Set provider
        if (result.provider) {
            providerSelect.value = result.provider;
        }

        // Update model options for the current provider
        updateModelOptions(providerSelect.value);

        // Set model if saved
        if (result.model) {
            modelSelect.value = result.model;
        }

        // Load API key for the current provider
        await loadApiKey(providerSelect.value);
    }

    // Initialize settings
    initializeSettings();

    // Handle provider change
    providerSelect.addEventListener('change', async function () {
        updateModelOptions(this.value);
        await loadApiKey(this.value);
    });

    // Save settings
    saveButton.addEventListener('click', async function () {
        const provider = providerSelect.value;
        const model = modelSelect.value;
        const apiKey = apiKeyInput.value;

        if (!apiKey) {
            statusDiv.textContent = 'Please enter an API key';
            statusDiv.className = 'status error';
            return;
        }

        try {
            // Save provider and model selection
            await chrome.storage.local.set({
                provider: provider,
                model: model,
                [getApiKeyStorageKey(provider)]: apiKey // Save API key with provider-specific key
            });

            // Close the popup immediately
            window.close();

        } catch (error) {
            statusDiv.textContent = 'Error saving settings';
            statusDiv.className = 'status error';
        }
    });
}); 