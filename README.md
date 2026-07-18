# Void CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node-v18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud-orange.svg)](https://firebase.google.com/)

A terminal-based social platform built exclusively for Thapar University students. Void allows you to post updates, read global feeds, and participate in real-time chatrooms directly from your command line.

## Features
- **Global Feed**: View and post public updates.
- **Threaded Discussions**: Enter dedicated chat sessions for specific posts.
- **Real-time Chatroom**: WebSocket-based global chatroom with collision-free rendering.
- **Secure Authentication**: Restricted to `@thapar.edu` email addresses with mandatory verification.
- **Persistent Sessions**: Login once and skip authentication on subsequent launches.
- **Offline Detection**: Live connection state monitoring with automatic user alerts.
- **Network Timeouts**: All database operations timeout after 5 seconds with clear error messages.

## Architecture
The application uses a Service Layer architecture. Terminal UI and prompts (`inquirer`, `ora`) are decoupled from database queries (`firebase`), ensuring a maintainable and testable codebase.

## Prerequisites
- Node.js (v18 or higher)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hashfydr/void-CLI.git
   cd void-CLI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_DATABASE_URL=your_database_url
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Make the script executable and link it globally:

   **For Linux:**
   ```bash
   chmod +x index.js
   npm link
   ```

   **For macOS:**
   ```bash
   chmod +x index.js
   npm link
   ```

   **For Windows:**
   ```powershell
   npm link
   ```
   *(Note: Windows does not require `chmod`. The `npm link` command will automatically create the necessary executable wrappers.)*

## Usage

Start the application from anywhere in your terminal by running:
```bash
void
```

Use the arrow keys to navigate the interactive menus and hit Enter to select an option. To cleanly exit a chatroom, hit `Ctrl+C`.

## Security

This project ships with strict Firestore Security Rules (`firestore.rules`). Key protections include:
- **Domain Lock**: Only `@thapar.edu` email addresses can read or write any data.
- **Email Verification**: Unverified accounts are blocked at the database level.
- **Ownership Enforcement**: Users can only edit or delete their own messages, posts, and comments.
- **Field Validation**: All writes are validated for required fields, data types, and max length (1000 chars for messages/comments, 2000 chars for posts).

To deploy the rules to your Firebase project:
```bash
npx -y firebase-tools deploy --only firestore:rules
```

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to run the project locally and submit pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
