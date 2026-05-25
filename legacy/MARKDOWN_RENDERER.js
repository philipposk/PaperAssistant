// ============================================
// ENHANCED MARKDOWN RENDERER
// Renders markdown with beautiful styling, fonts, colors, and emojis
// ============================================

// Simple markdown parser (or use marked.js if available)
function renderMarkdown(markdownText) {
  if (!markdownText) return '';
  
  // Load CSS if not already loaded
  if (!document.getElementById('markdown-styles')) {
    const link = document.createElement('link');
    link.id = 'markdown-styles';
    link.rel = 'stylesheet';
    link.href = 'MARKDOWN_STYLES.css';
    document.head.appendChild(link);
  }
  
  let html = markdownText;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.match(/^<[h|u|o|p|d|b]/)) {
      return '<p>' + para.trim() + '</p>';
    }
    return para;
  }).join('\n');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^\*\*\*$/gim, '<hr>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Tables (basic)
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && lines[i].trim().startsWith('|')) {
      if (!inTable) {
        tableHtml = '<table>';
        inTable = true;
      }
      const cells = lines[i].split('|').filter(c => c.trim());
      if (i > 0 && lines[i-1].includes('---')) {
        tableHtml += '<tr>' + cells.map(c => '<th>' + c.trim() + '</th>').join('') + '</tr>';
      } else {
        tableHtml += '<tr>' + cells.map(c => '<td>' + c.trim() + '</td>').join('') + '</tr>';
      }
    } else {
      if (inTable) {
        tableHtml += '</table>';
        html = html.replace(lines.slice(i - tableHtml.split('<tr>').length, i).join('\n'), tableHtml);
        inTable = false;
        tableHtml = '';
      }
    }
  }
  
  return '<div class="markdown-content">' + html + '</div>';
}

// Function to display markdown file in modal
function showMarkdownPreview(filePath, fileName) {
  fetch(filePath)
    .then(response => response.text())
    .then(markdownText => {
      const html = renderMarkdown(markdownText);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'markdown-preview-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        overflow-y: auto;
        padding: 2rem;
      `;
      
      modal.innerHTML = `
        <div style="
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: sticky;
            top: 0;
            background: linear-gradient(135deg, #0f4c81 0%, #1a6ba3 100%);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1;
          ">
            <h2 style="margin: 0; font-size: 1.5rem;">${fileName}</h2>
            <button onclick="this.closest('.markdown-preview-modal').remove()" style="
              background: rgba(255,255,255,0.2);
              border: none;
              color: white;
              font-size: 1.5rem;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              cursor: pointer;
              transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
          </div>
          <div style="padding: 0;">
            ${html}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close on escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          document.removeEventListener('keydown', escapeHandler);
        }
      });
    })
    .catch(error => {
      console.error('Error loading markdown:', error);
      alert('Error loading markdown file: ' + error.message);
    });
}

// Make available globally
window.renderMarkdown = renderMarkdown;
window.showMarkdownPreview = showMarkdownPreview;

