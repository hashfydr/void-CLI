# void-CLI
This is a fun interactive cli tool for thapar students to interact and post blogs about going in their life, a command-line interface for interacting with the Void social platform.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (which includes npm)
- [Git](https://git-scm.com/)

## Installation

To install and run the Void CLI, follow these steps. This process works on Windows, macOS, and Linux.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hashfydr/void-CLI.git
    ```

2.  **Navigate into the project directory:**
    ```bash
    cd void-cli
    ```

3.  **Install the necessary dependencies:**
    ```bash
    npm install
    ```

4.  **Create the global `void` command:**
    This command creates a symbolic link from your system's command path to the application, allowing you to run it from anywhere.
    ```bash
    npm link
    ```

## Usage

Once the installation is complete, you can start the application from anywhere in your terminal by simply typing:

```bash
void
```

This will launch the application and present you with the main menu.
