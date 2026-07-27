import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Path to root docs folder
const DOCS_DIR = path.resolve(__dirname, '../../docs');

app.use(cors());
app.use(express.json());

// Helper function to build folder tree recursively
function buildFileTree(dirPath, relativePath = '') {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    // Ignore hidden files / directories
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = buildFileTree(fullPath, relPath);
      if (children.length > 0) {
        items.push({
          type: 'directory',
          name: entry.name,
          path: relPath,
          children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const stats = fs.statSync(fullPath);
      
      // Clean display title (e.g. Chapter-01-Introduction.md -> Chapter 01: Introduction)
      let title = entry.name.replace(/\.md$/, '');
      if (/^Chapter-\d+/i.test(title)) {
        title = title.replace(/^Chapter-(\d+)-(.*)$/i, (m, p1, p2) => {
          return `Chapter ${p1}: ${p2.replace(/-/g, ' ')}`;
        });
      } else {
        title = title.replace(/-/g, ' ');
      }

      items.push({
        type: 'file',
        name: entry.name,
        title,
        path: relPath,
        size: stats.size,
        mtime: stats.mtime,
      });
    }
  }

  // Sort directories first, then files numerically/alphabetically
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

// Helper to getAllMarkdownFiles flat list
function getAllMarkdownFiles(dirPath, relativePath = '') {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push({ fullPath, relPath, name: entry.name });
    }
  }

  return results;
}

// 1. Get file tree endpoint
app.get('/api/files', (req, res) => {
  try {
    const tree = buildFileTree(DOCS_DIR);
    res.json({ success: true, tree, docsDir: DOCS_DIR });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get specific file content endpoint
app.get('/api/file', (req, res) => {
  try {
    const requestedPath = req.query.path;
    if (!requestedPath) {
      return res.status(400).json({ success: false, error: 'Path query parameter is required' });
    }

    // Security check against directory traversal
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(DOCS_DIR, safePath);

    if (!absolutePath.startsWith(DOCS_DIR)) {
      return res.status(403).json({ success: false, error: 'Access denied: outside docs folder' });
    }

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const stats = fs.statSync(absolutePath);

    // Metadata calculations
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const lines = content.split('\n').length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

    res.json({
      success: true,
      path: safePath,
      name: path.basename(safePath),
      content,
      stats: {
        size: stats.size,
        lines,
        words,
        readTimeMinutes,
        mtime: stats.mtime,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Full text search endpoint
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.json({ success: true, results: [] });
    }

    const searchLower = query.toLowerCase().trim();
    const files = getAllMarkdownFiles(DOCS_DIR);
    const results = [];

    for (const file of files) {
      const content = fs.readFileSync(file.fullPath, 'utf-8');
      const lines = content.split('\n');
      const matches = [];

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchLower)) {
          matches.push({
            lineNumber: index + 1,
            lineText: line.trim(),
          });
        }
      });

      if (matches.length > 0 || file.name.toLowerCase().includes(searchLower)) {
        let title = file.name.replace(/\.md$/, '');
        if (/^Chapter-\d+/i.test(title)) {
          title = title.replace(/^Chapter-(\d+)-(.*)$/i, (m, p1, p2) => `Chapter ${p1}: ${p2.replace(/-/g, ' ')}`);
        } else {
          title = title.replace(/-/g, ' ');
        }

        results.push({
          path: file.relPath,
          name: file.name,
          title,
          matchCount: matches.length,
          matches: matches.slice(0, 5), // return top 5 snippets per file
        });
      }
    }

    // Sort by match count descending
    results.sort((a, b) => b.matchCount - a.matchCount);

    res.json({ success: true, query, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Docs Server] Running on http://localhost:${PORT}`);
  console.log(`[Docs Server] Serving files from: ${DOCS_DIR}`);
});
