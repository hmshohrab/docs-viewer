# Docs Viewer 📚

**Docs Viewer** is a modern, responsive, and lightweight Markdown documentation portal built with **React**, **Vite**, and **Express**. It scans local Markdown (`.md`) documentation files, builds an interactive file tree hierarchy, renders high-performance Markdown with code syntax highlighting, and provides full-text search capabilities across your documentation.

---

## ✨ Features

- 📁 **Interactive Sidebar Navigation**: Automatically scans and displays a nested directory tree of all Markdown (`.md`) files.
- 🔍 **Full-Text Search Modal**: Instant real-time search across all documentation files with snippet extraction and match highlights.
- 📝 **Rich Markdown Rendering**: Renders Markdown with support for code blocks, tables, blockquotes, and lists using `marked`.
- 🎨 **Code Syntax Highlighting**: Automatic syntax highlighting for code blocks using `highlight.js`.
- ⏱️ **Reading Time & Stats**: Displays reading time estimates, word counts, line counts, and last modified timestamps for each document.
- 📑 **Table of Contents**: Automatic table of contents generation for quick section navigation inside lengthy documents.
- ⚡ **Concurrent Execution**: Run both the Express backend API and Vite frontend dev server with a single command.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Modern CSS with flexbox/grid and glassmorphism UI tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Parsing**: [Marked](https://marked.js.org/)
- **Syntax Highlighting**: [Highlight.js](https://highlightjs.org/)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Utilities**: CORS, `fs`, `path`

---

## 📁 Project Structure

```text
docs-viewer/
├── server/
│   └── server.js          # Express API server for reading local docs & full-text search
├── src/
│   ├── components/
│   │   ├── MarkdownRenderer.jsx   # Markdown viewer & syntax highlighter
│   │   ├── SearchModal.jsx        # Full-text search dialog overlay
│   │   ├── Sidebar.jsx            # Document directory tree navigation
│   │   └── TableOfContents.jsx    # In-page heading links navigator
│   ├── App.jsx            # Main app container & routing logic
│   ├── index.css          # Styling & theme variables
│   └── main.jsx           # React entrypoint
├── index.html             # Vite HTML template
├── package.json           # Node scripts and dependencies
└── vite.config.js         # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/hmshohrab/docs-viewer.git
cd docs-viewer
npm install
```

### 2. Configure Documentation Folder

The Express backend serves `.md` files from a designated directory. By default, `server/server.js` points to `../../docs`. 

You can update `server/server.js` to point to your documentation directory:

```javascript
const DOCS_DIR = path.resolve(__dirname, '../path-to-your-docs');
```

### 3. Running Development Server

Start both the backend server (Port `3001`) and frontend Vite dev server (Port `5173`) concurrently:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs Express backend and Vite frontend concurrently |
| `npm run server` | Starts only the Express backend server (`localhost:3001`) |
| `npm run vite` | Starts only the Vite frontend dev server |
| `npm run build` | Builds the Vite frontend app for production |
| `npm run preview` | Previews the production build locally |

---

## 🔌 API Endpoints (Backend)

The Express backend provides the following REST API endpoints:

- `GET /api/files`
  - Returns the complete tree structure of `.md` files in the documentation folder.
- `GET /api/file?path=<relative-path>`
  - Returns raw content and calculated metadata (word count, lines, read time) for a specific `.md` file.
- `GET /api/search?q=<query>`
  - Performs a full-text search across all `.md` files and returns line snippet matches.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
