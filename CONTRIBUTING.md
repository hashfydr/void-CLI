# Contributing to Void CLI

First off, thanks for taking the time to contribute!

## Development Setup

1. Fork and clone the repository.
2. Run `npm install` to install dependencies.
3. Add your `.env` file as specified in the README.

## Code Style

This project uses `eslint` and `prettier` to enforce code quality and formatting. 
Before submitting a pull request, ensure your code passes the linting checks:

```bash
npm run lint
```
*(Note: You may need to add `"lint": "eslint ."` to `package.json` scripts, or run `npx eslint .` directly).*

## Pull Request Process

1. Create a new branch for your feature or bugfix (`git checkout -b feature/your-feature-name`).
2. Keep your commits atomic and commit messages descriptive.
3. Push to your fork and submit a Pull Request against the `main` branch.
4. Ensure the CI linting action passes on your PR.
