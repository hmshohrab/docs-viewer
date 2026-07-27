import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';

export default function MarkdownRenderer({ content }) {
  const containerRef = useRef(null);

  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  // Parse custom callout alerts (e.g. > [!NOTE])
  const processCallouts = (markdownText) => {
    if (!markdownText) return '';
    return markdownText.replace(
      />\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
      (match, type, body) => {
        const cleanBody = body.replace(/^>\s?/gm, '');
        const typeLower = type.toLowerCase();
        return `<div class="callout-block callout-${typeLower}">
          <strong style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">${type}</strong>
          <div>${cleanBody}</div>
        </div>\n`;
      }
    );
  };

  // Convert raw markdown to HTML string with IDs for headings
  const getParsedHtml = () => {
    if (!content) return '';
    
    const calloutProcessed = processCallouts(content);
    let rawHtml = marked.parse(calloutProcessed);

    // Add anchor IDs to H1, H2, H3 for TOC scrolling
    let idCounter = 0;
    rawHtml = rawHtml.replace(/<h([1-3])([^>]*)>(.*?)<\/h[1-3]>/gi, (match, level, attrs, titleText) => {
      const cleanTitle = titleText.replace(/<[^>]+>/g, '').trim();
      const slug = cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || `heading-${++idCounter}`;
      return `<h${level}${attrs} id="${slug}">${titleText}</h${level}>`;
    });

    return rawHtml;
  };

  // Post-process rendered DOM to add syntax highlighting & copy buttons to code blocks
  useEffect(() => {
    if (!containerRef.current) return;

    const preElements = containerRef.current.querySelectorAll('pre');
    preElements.forEach((pre) => {
      // Avoid duplicate processing
      if (pre.parentElement.classList.contains('code-block-wrapper')) return;

      const code = pre.querySelector('code');
      if (code) {
        // Syntax Highlight
        hljs.highlightElement(code);

        // Detect language
        const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'));
        const langName = langClass ? langClass.replace('language-', '') : 'text';

        // Wrap in code-block-wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
          <span>${langName}</span>
          <button class="copy-code-btn" title="Copy code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
            <span>Copy</span>
          </button>
        `;

        const copyBtn = header.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(code.innerText);
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span style="color:#10b981">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              <span>Copy</span>
            `;
          }, 2000);
        });

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
      }
    });
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: getParsedHtml() }}
    />
  );
}
