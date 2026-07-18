# Void CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node-v18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud-orange.svg)](https://firebase.google.com/)
[![OS Support](https://img.shields.io/badge/OS-Windows%20%7C%20macOS%20%7C%20Linux-success.svg)](#)

> **"Terminal-native social networking for developers who refuse to leave their IDE."**


Void is a blazing-fast, terminal-based social platform built for developers, hackers, and tech enthusiasts. Born out of Thapar University (yes, `@thapar.edu` mains we see you) but now **globally open to everyone**, Void brings the entire social experience directly into your command line.

Whether you want to drop a hot take on the latest JS framework, coordinate a tech talk, debate systems architecture, or just vibe in the global chatroom instead of touching grass, Void is your home. 

---

## Why Void? (The Mission)

We've all seen the recent wave of "vibe-coded" AI projects that look cool on Twitter but instantly break in production. Void is different. While AI was utilized to accelerate the boilerplate, **Void is rigorously architected, manually optimized, and production-hardened.**

There is no "slop" here. Void features a decoupled MVC Service Layer, strictly enforced Firebase Security Rules, cursor-based pagination that prevents N+1 query bottlenecks, and POSIX-compliant offline credential caching. It's a serious engineering project disguised as a fun CLI app. No cap.

## Features (The W's)

- **Global Access & Cross-Platform:** Works flawlessly on Linux, macOS, and Windows. Bring your own email address—no domain restrictions.
- **Real-Time Chatrooms:** WebSocket-driven global chat with `<50ms` latency and collision-free terminal rendering.
- **Threaded Discussions & Tech Talks:** Create posts to host AMAs, share tech talks, or debate architecture. Dive into nested comment threads directly in your terminal.
- **Bank-Grade Security:** Firebase Security Rules enforce strict Role-Based Access Control (RBAC). You can only delete what you own.
- **Thematic Customization:** Choose from a curated selection of stunning, globally-loved developer colorways including **Matrix, Gruvbox, Rosé Pine, Dracula, SynthWave '84, Catppuccin Mocha, Monokai Pro,** and **Cyberpunk**. The entire terminal background morphs instantly to match. Give your CLI that goated retro-futuristic techno vibe. It’s an aesthetic experience that practically compels you to stay logged in.
- **Offline-First Caching:** Secure, native `fs`-based credential caching (`chmod 600`) means you log in once and never see a prompt again. 


## Architecture (How We Cooked)

To ensure this app scales without burning through Firebase quotas, Void implements:
1. **Service Layer Pattern:** Terminal UI logic (`inquirer`, `chalk`, `ora`) is completely decoupled from database queries (`firebase`), ensuring a clean separation of concerns.
2. **Cursor-Based Pagination:** Instead of fetching the entire database, feeds and chatrooms load up to 5,000 messages dynamically in optimized chunks.
3. **Parallelized Fetching:** Comments and metadata are fetched using `Promise.all` to completely eliminate N+1 query latency.

---

## Screenshots

<p align="center">
  <img src="1.png" alt="Screenshot 1" width="100%">
  <img src="2.png" alt="Screenshot 2" width="100%">
  <img src="3.png" alt="Screenshot 3" width="100%">
  <img src="4.png" alt="Screenshot 4" width="100%">
  <img src="5.png" alt="Screenshot 5" width="100%">
</p>

---

## Getting Started

You're just 3 commands away from main character energy.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hashfydr/void-CLI.git
   cd void-CLI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Link it globally!**
   
   **For Linux / macOS:**
   *(If you hit an `EACCES` error, [configure npm for local hidden directories](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).)*
   ```bash
   chmod +x index.js
   npm link
   ```

   **For Windows:**
   ```powershell
   npm link
   ```
   *(Windows automatically handles the executable wrappers, massive W).*

## Usage

Once installed, just open your terminal from *anywhere* on your OS and type:

```bash
void
```

Use your arrow keys to navigate the interactive menus. Press `Enter` to select. To cleanly exit a chatroom, simply type `:q` or hit `Ctrl+C`.

---

## Contributing

Found a bug? Want to add direct messaging? We welcome pull requests! See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup instructions. Let's build the ultimate developer hangout spot.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
