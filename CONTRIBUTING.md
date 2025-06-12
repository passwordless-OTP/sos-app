# Contributing to SOS Store Manager

First off, thank you for considering contributing to SOS! It's people like you that make SOS such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Include screenshots if relevant
* Include your environment details

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a detailed description of the suggested enhancement
* Provide specific examples to demonstrate the enhancement
* Describe the current behavior and expected behavior

### Pull Requests

1. Fork the repo and create your branch from `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Clone the repository
```bash
git clone https://github.com/passwordless-OTP/SOS.git
cd SOS
```

2. Install dependencies
```bash
npm install
```

3. Run the setup script
```bash
npm run setup
```

4. Start development environment
```bash
npm run dev
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).

### Documentation Styleguide

* Use [Markdown](https://daringfireball.net/projects/markdown)
* Reference functions and classes in backticks: \`functionName()\`