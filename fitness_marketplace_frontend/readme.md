# 🌐 Fitness Marketplace Frontend Setup

This document provides instructions for setting up and running the Fitness Marketplace frontend application on your local machine.

## 🚀 Getting Started

Follow these steps to get the application running locally in development mode.

### Prerequisites

  * **Node.js** (LTS version recommended)
  * **npm** (Node Package Manager) or **yarn**
  * **Git** (for cloning the repository)

## 💻 Local Setup

### 1\. Open the Project

Navigate to the `FITNESS_MARKETPLACE_FRONTEND` directory in your file system. It is highly recommended to use **Visual Studio Code (VS Code)** for this project.

### 2\. Install Dependencies

You must install all necessary Node.js packages defined in the `package.json` file.

Open the **Integrated Terminal** in VS Code (**Terminal \> New Terminal** or `Ctrl` + `` ` ``) and run **one** of the following commands:

  * **Using npm (Node Package Manager):**
    ```bash
    npm install
    ```
  * **Using yarn:**
    ```bash
    yarn install
    ```

### 3\. Start the Development Server

Once the dependencies are installed, you can start the application's local development server.

Run the appropriate command in your terminal:

  * **The script is named `dev` (common for Vite projects):**
    ```bash
    npm run dev
    # OR
    yarn dev
    ```

### 4\. View the Application

The terminal will usually display the local URL once the server is ready (e.g., `http://localhost:3000` or `http://localhost:5173`).

  * Click the URL displayed in the terminal, or manually open it in your web browser to view the application.

### ⚠️ Important Note

Ensure your **[Backend Server](https://www.google.com/search?q=Link_to_Backend_README)** is running before attempting to use the frontend application, as it will likely rely on the backend API for data.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
