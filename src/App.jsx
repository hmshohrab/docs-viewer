import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import TableOfContents from './components/TableOfContents';
import SearchModal from './components/SearchModal';
import { 
  FileText, 
  Clock, 
  AlignLeft, 
  Calendar, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react';

export default function App() {
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Apply theme to html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global shortcut for Search Modal (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch File Tree on initial mount
  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch('/api/files');
        const data = await res.json();
        if (data.success && data.tree) {
          setTree(data.tree);
          // Find first markdown file to load automatically
          const firstFile = findFirstFile(data.tree);
          if (firstFile) {
            setSelectedPath(firstFile.path);
          }
        }
      } catch (err) {
        console.error('Error fetching file tree:', err);
      }
    }
    fetchTree();
  }, []);

  // Helper to find first file in tree
  const findFirstFile = (items) => {
    for (const item of items) {
      if (item.type === 'file') return item;
      if (item.type === 'directory' && item.children) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Fetch Selected File Content
  useEffect(() => {
    if (!selectedPath) return;

    async function fetchFileContent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/file?path=${encodeURIComponent(selectedPath)}`);
        const data = await res.json();
        if (data.success) {
          setCurrentFile(data);
        }
      } catch (err) {
        console.error('Error reading file:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFileContent();
  }, [selectedPath]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    if (!selectedPath) return [];
    return selectedPath.split('/');
  };

  return (
    <div className="app-container">
      <Sidebar
        tree={tree}
        selectedPath={selectedPath}
        onSelectFile={setSelectedPath}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="breadcrumbs">
            <BookOpen size={16} className="text-dim" />
            <span>docs</span>
            {getBreadcrumbs().map((part, index, array) => (
              <React.Fragment key={index}>
                <ChevronRight size={14} className="text-dim" />
                <span className={index === array.length - 1 ? 'breadcrumb-active' : ''}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          {currentFile && currentFile.stats && (
            <div className="doc-actions">
              <div className="action-badge" title="Estimated Reading Time">
                <Clock size={14} />
                <span>{currentFile.stats.readTimeMinutes} min read</span>
              </div>
              <div className="action-badge" title="Word Count">
                <AlignLeft size={14} />
                <span>{currentFile.stats.words.toLocaleString()} words</span>
              </div>
              <div className="action-badge" title="Last Modified Date">
                <Calendar size={14} />
                <span>{new Date(currentFile.stats.mtime).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </header>

        {/* Document Reader Area */}
        <div className="reader-wrapper">
          <div className="document-scroll-container">
            <article className="document-article">
              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner"></div>
                  <p>Loading document...</p>
                </div>
              ) : currentFile ? (
                <MarkdownRenderer content={currentFile.content} />
              ) : (
                <div className="empty-state">
                  <FileText size={48} className="text-dim" />
                  <h3>Select a document to read</h3>
                  <p>Choose any chapter from the sidebar on the left.</p>
                </div>
              )}
            </article>
          </div>

          {/* Right Sidebar Table of Contents */}
          {currentFile && (
            <TableOfContents content={currentFile.content} />
          )}
        </div>
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectFile={setSelectedPath}
      />
    </div>
  );
}
