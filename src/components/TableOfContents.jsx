import React, { useMemo } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content }) {
  const headings = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const items = [];
    let idCounter = 0;

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        const cleanText = rawText.replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || `heading-${++idCounter}`;

        items.push({
          level,
          text: cleanText,
          id,
        });
      }
    });

    return items;
  }, [content]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="toc-sidebar">
      <div className="toc-title">
        <List size={14} />
        <span>On This Page</span>
      </div>
      <ul className="toc-list">
        {headings.map((item, index) => (
          <li
            key={`${item.id}-${index}`}
            className={`toc-item level-${item.level}`}
            onClick={() => scrollToHeading(item.id)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
