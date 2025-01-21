# Etsy Seller Message Assistant

A Chrome extension that helps Etsy sellers respond to customer messages quickly and professionally using AI-generated suggestions.

## Features

- AI-powered response suggestions based on conversation history
- Support for multiple AI providers (OpenAI, Claude, DeepSeek)
- Easy-to-use interface integrated into Etsy's messaging system
- Customizable AI models and settings
- Secure API key management

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/etsy-seller-assistant.git
cd etsy-seller-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Generate extension icons:
```bash
node generate_icons.js
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Usage

1. Click the extension icon to open settings
2. Select your preferred AI provider
3. Enter your API key
4. Navigate to any Etsy conversation
5. Click "Get AI Suggestion" below the message input box
6. Edit and send the suggested response

## Development

### Project Structure
```
├── manifest.json        # Extension manifest
├── popup.html          # Settings popup interface
├── popup.js            # Settings popup logic
├── content.js          # Content script for Etsy integration
├── background.js       # Background service worker
├── generate_icons.js   # Icon generation script
└── images/            # Extension icons
```

### Building
To create a distribution package:
```bash
zip -r etsy-seller-assistant.zip manifest.json popup.html popup.js content.js background.js images/
```

## Privacy

- Message content is only processed when generating suggestions
- API keys are stored securely in Chrome's local storage
- No data is stored on external servers
- All communication with AI services uses secure HTTPS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Chrome Extensions Manifest V3
- Uses various AI providers' APIs for message suggestions
- Icon design inspired by Etsy's design system 