import React, { useState } from 'react';
import { 
  BookOpen, 
  Folder, 
  FolderOpen, 
  FileText, 
  Search, 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

export default function Sidebar({ 
  tree, 
  selectedPath, 
  onSelectFile, 
  theme, 
  onToggleTheme, 
  onOpenSearch 
}) {
  const [openFolders, setOpenFolders] = useState({ 'SRS': true });

  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const renderTree = (items) => {
    return items.map((item) => {
      if (item.type === 'directory') {
        const isOpen = openFolders[item.path] ?? true;
        return (
          <div key={item.path} className="nav-tree-folder">
            <div 
              className="folder-title-row"
              onClick={() => toggleFolder(item.path)}
            >
              {isOpen ? (
                <ChevronDown size={16} className="text-dim" />
              ) : (
                <ChevronRight size={16} className="text-dim" />
              )}
              {isOpen ? (
                <FolderOpen size={18} style={{ color: '#3b82f6' }} />
              ) : (
                <Folder size={18} style={{ color: '#3b82f6' }} />
              )}
              <span>{item.name}</span>
            </div>
            {isOpen && item.children && (
              <div className="folder-children">
                {renderTree(item.children)}
              </div>
            )}
          </div>
        );
      }

      const isActive = selectedPath === item.path;
      return (
        <div
          key={item.path}
          className={`nav-tree-item ${isActive ? 'active' : ''}`}
          onClick={() => onSelectFile(item.path)}
        >
          <FileText size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-dim)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || item.name}
          </span>
        </div>
      );
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={16} />
          </div>
          <span>SEEP Docs</span>
        </div>
        <button 
          className="theme-toggle-btn" 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="sidebar-search-container">
        <button className="search-trigger" onClick={onOpenSearch}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} />
            <span>Search docs...</span>
          </div>
          <span className="kbd-shortcut">⌘K</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Documentation</div>
        {tree && tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            No markdown files found.
          </div>
        )}
      </nav>
    </aside>
  );
}
