# Gitzin: AI-Powered Git Commit Message Generator

![Gitzin Logo](media/icons/icon.png)

Gitzin is a powerful VS Code extension that revolutionizes your Git workflow by generating intelligent, context-aware commit messages using advanced AI. Say goodbye to writer's block and hello to meaningful, consistent commit histories!

## Features

- 🤖 AI-powered commit message generation
- 🎨 Multiple commit message styles (Basic, Karma, Dotted, Emoji)
- 🔄 Seamless integration with VS Code's built-in Git features
- 🌐 Support for multiple AI providers (OpenRouter, StackSpot)
- 🛠️ Highly customizable settings

### AI-Powered Commit Messages

Gitzin analyzes your code changes and generates appropriate commit messages with a single click:

![Gitzin Demo](media/gitzin-demo.gif)

### Multiple Commit Styles

Choose from various commit message styles to match your project's conventions:

- Basic: `<type>: <title>`
- Karma: `<type>(<scope>): <subject>`
- Dotted: Detailed messages with bullet points
- Emoji: Commits prefixed with descriptive emojis

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Gitzin"
4. Click Install

## Usage

1. Make changes to your code
2. Open the Gitzin sidebar in the Explorer view
3. (Optional) Enter a brief description of your changes
4. Click "Generate Message"
5. Review and adjust the generated commit message
6. Commit your changes using VS Code's Git integration

## Configuration

Gitzin offers extensive customization options. Access them via File > Preferences > Settings > Extensions > Gitzin.

Key settings include:

- `gitzin.apiKey`: Your API key for OpenRouter or StackSpot
- `gitzin.apiProvider`: Choose between "openrouter" and "stackspot"
- `gitzin.commitNorm`: Select your preferred commit message style
- `gitzin.openRouter.model`: Specify the AI model for OpenRouter
- `gitzin.stackspot.quickCommand`: Set the quick command for StackSpot

## Requirements

- VS Code version 1.90.0 or higher
- Active internet connection for AI API calls

## Privacy and Security

Gitzin sends only the git diff of your changes to the AI provider. No other project information or personal data is transmitted. Always review generated commit messages before finalizing them.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/felipepimentel/gitzin/issues) on our GitHub repository.

---

Developed with ❤️ by [Felipe Pimentel](https://github.com/felipepimentel)
