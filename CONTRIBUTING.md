# Contributing to MoodSync

Thank you for your interest in contributing to MoodSync! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/moodsync-app.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure your environment variables
5. Start the development server: `npm run dev`

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- React Native CLI
- MongoDB (local or cloud)
- Spotify Developer Account
- Android Studio / Xcode (for mobile development)

### Project Structure
```
moodsync-app/
├── src/
│   ├── components/     # React Native components
│   ├── services/       # API and external service integrations
│   ├── screens/        # App screens
│   ├── utils/          # Utility functions
│   └── styles/         # Styling and themes
├── server/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── utils/          # Server utilities
└── docs/               # Documentation
```

## 📝 Contribution Guidelines

### Code Style
- Use ESLint and Prettier configurations provided
- Follow React Native best practices
- Write meaningful commit messages
- Add comments for complex logic

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Update documentation if needed
4. Submit a pull request with a clear description

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 Testing

- Run tests: `npm test`
- Add tests for new features
- Ensure all tests pass before submitting PR

## 🐛 Bug Reports

When reporting bugs, please include:
- Device/OS information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Relevant logs

## 💡 Feature Requests

- Check existing issues first
- Provide detailed use case
- Explain why the feature would be valuable
- Consider implementation complexity

## 🔒 Security

- Report security vulnerabilities privately
- Don't include sensitive data in issues/PRs
- Follow secure coding practices

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Follow our Code of Conduct

## 🎯 Priority Areas

We're especially looking for contributions in:
- AI model optimization
- Smart home device integrations
- UI/UX improvements
- Performance optimizations
- Documentation and tutorials

Thank you for making MoodSync better! 🎵