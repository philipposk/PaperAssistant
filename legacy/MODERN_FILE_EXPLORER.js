// ============================================
// MODERN VS CODE-STYLE FILE EXPLORER
// Enhanced file explorer with better styling and icons
// ============================================

// Enhanced file tree rendering with VS Code-like appearance
function renderFileTreeModern(node, level = 0, isExpanded = false) {
  if (node.type === 'file') {
    const icon = getFileIconModern(node.name);
    const safePath = (node.path || '').replace(/'/g, "\\'");
    const safeName = (node.name || '').replace(/'/g, "\\'");
    const indent = level * 16;
    return `<li class="file-tree-item file-tree-file" 
                 onclick="if(typeof window.openFileFromExplorer === 'function') window.openFileFromExplorer('${safePath}', '${safeName}', event); else openFileFromExplorer('${safePath}', '${safeName}', event);" 
                 title="${safeName}"
                 style="padding-left: ${indent + 20}px;">
          <span class="file-tree-icon">${icon}</span>
          <span class="file-tree-name">${safeName}</span>
        </li>`;
  } else {
    const folderId = 'folder-' + node.name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const indent = level * 16;
    const hasChildren = node.children && node.children.length > 0;
    const expandedClass = isExpanded ? 'open' : '';
    const caretIcon = hasChildren ? (isExpanded ? '▼' : '▶') : '•';
    
    let html = `<li class="file-tree-item file-tree-folder ${expandedClass}" 
                    onclick="toggleFolder('${folderId}')" 
                    style="padding-left: ${indent + 4}px;">
          <span class="file-tree-caret" id="caret-${folderId}">${caretIcon}</span>
          <span class="file-tree-icon">${getFolderIcon(node.name)}</span>
          <span class="file-tree-name">${node.name}</span>
        </li>`;
    
    if (hasChildren) {
      html += `<ul class="file-tree-children ${expandedClass}" id="${folderId}" style="display: ${isExpanded ? 'block' : 'none'}; padding-left: ${indent + 16}px;">`;
      node.children.forEach(child => {
        html += renderFileTreeModern(child, level + 1, false);
      });
      html += '</ul>';
    }
    return html;
  }
}

// Enhanced file icon mapping with better icons
function getFileIconModern(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'md': '📝',
    'log': '📋',
    'txt': '📄',
    'csv': '📊',
    'json': '📋',
    'html': '🌐',
    'docx': '📄',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'pdf': '📕',
    'r': '📊',
    'py': '🐍',
    'js': '📜',
    'css': '🎨',
    'sh': '⚙️'
  };
  return iconMap[ext] || '📄';
}

// Folder icon based on folder name
function getFolderIcon(folderName) {
  const folderMap = {
    'docs': '📚',
    'logs': '📋',
    'data_cleaning_docs': '🧹',
    'tables': '📊',
    'figures': '🖼️',
    'Root Files': '🌐'
  };
  return folderMap[folderName] || '📁';
}

// Enhanced toggle folder function
function toggleFolderModern(folderId) {
  const folder = document.getElementById(folderId);
  const caret = document.getElementById('caret-' + folderId);
  const folderItem = caret ? caret.closest('.file-tree-folder') : null;
  
  if (folder) {
    const isOpen = folder.classList.contains('open');
    folder.classList.toggle('open');
    folder.style.display = isOpen ? 'none' : 'block';
    
    if (caret) {
      caret.classList.toggle('open');
      caret.textContent = isOpen ? '▶' : '▼';
    }
    
    if (folderItem) {
      folderItem.classList.toggle('open');
    }
  }
}

// Add modern file explorer styles
function addModernFileExplorerStyles() {
  if (document.getElementById('modern-file-explorer-styles')) {
    return; // Styles already added
  }
  
  const style = document.createElement('style');
  style.id = 'modern-file-explorer-styles';
  style.textContent = `
    /* Modern File Explorer Styles - VS Code Inspired */
    .file-explorer-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 300px;
      height: 100vh;
      background: var(--bg-secondary, #1e1e1e) !important;
      border-right: 1px solid var(--border-color, #3e3e3e) !important;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 10000 !important;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      display: block !important;
    }
    
    .file-explorer-sidebar.open {
      transform: translateX(0) !important;
    }
    
    .file-explorer-header {
      padding: 12px 16px;
      background: var(--bg-secondary, #1e1e1e);
      border-bottom: 1px solid var(--border-color, #3e3e3e);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
    }
    
    .file-explorer-header h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #cccccc);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .file-explorer-close {
      background: transparent;
      border: none;
      color: var(--text-secondary, #858585);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .file-explorer-close:hover {
      background: var(--bg-primary, #2d2d2d);
      color: var(--text-primary, #ffffff);
    }
    
    .file-explorer-search {
      padding: 8px;
      border-bottom: 1px solid var(--border-color, #3e3e3e);
    }
    
    .file-explorer-search input {
      width: 100%;
      padding: 6px 8px;
      background: var(--bg-primary, #252526);
      border: 1px solid var(--border-color, #3e3e3e);
      border-radius: 4px;
      color: var(--text-primary, #cccccc);
      font-size: 12px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .file-explorer-search input:focus {
      border-color: var(--accent, #007acc);
    }
    
    .file-explorer-nav {
      padding: 8px;
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border-color, #3e3e3e);
    }
    
    .file-explorer-nav button {
      flex: 1;
      padding: 6px 8px;
      background: var(--bg-primary, #252526);
      border: 1px solid var(--border-color, #3e3e3e);
      border-radius: 4px;
      color: var(--text-primary, #cccccc);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .file-explorer-nav button:hover:not(:disabled) {
      background: var(--bg-tertiary, #2d2d2d);
      border-color: var(--accent, #007acc);
    }
    
    .file-explorer-nav button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .file-tree {
      list-style: none;
      padding: 4px 0;
      margin: 0;
    }
    
    .file-tree-item {
      padding: 2px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
      transition: background-color 0.15s;
      min-height: 22px;
      position: relative;
    }
    
    .file-tree-item:hover {
      background: var(--bg-primary, #2a2d2e);
    }
    
    .file-tree-item.selected {
      background: var(--accent, #094771);
      color: var(--text-primary, #ffffff);
    }
    
    .file-tree-item.selected .file-tree-icon,
    .file-tree-item.selected .file-tree-name {
      color: var(--text-primary, #ffffff);
    }
    
    .file-tree-folder {
      font-weight: 500;
    }
    
    .file-tree-file {
      font-weight: 400;
    }
    
    .file-tree-caret {
      width: 16px;
      text-align: center;
      font-size: 10px;
      color: var(--text-secondary, #858585);
      transition: transform 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .file-tree-caret.open {
      transform: rotate(0deg);
    }
    
    .file-tree-icon {
      font-size: 16px;
      width: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .file-tree-name {
      flex: 1;
      color: var(--text-primary, #cccccc);
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .file-tree-children {
      list-style: none;
      margin: 0;
      padding: 0;
      display: none;
    }
    
    .file-tree-children.open {
      display: block;
    }
    
    /* Scrollbar styling */
    .file-explorer-sidebar::-webkit-scrollbar {
      width: 10px;
    }
    
    .file-explorer-sidebar::-webkit-scrollbar-track {
      background: var(--bg-secondary, #1e1e1e);
    }
    
    .file-explorer-sidebar::-webkit-scrollbar-thumb {
      background: var(--bg-primary, #424242);
      border-radius: 5px;
    }
    
    .file-explorer-sidebar::-webkit-scrollbar-thumb:hover {
      background: var(--text-tertiary, #4e4e4e);
    }
    
    /* Adjust container when sidebar is open */
    body.sidebar-open .container {
      margin-left: 300px;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize modern file explorer styles
(function() {
  function initStyles() {
    addModernFileExplorerStyles();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStyles);
  } else {
    initStyles();
  }
})();

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.renderFileTreeModern = renderFileTreeModern;
  window.getFileIconModern = getFileIconModern;
  window.getFolderIcon = getFolderIcon;
  window.toggleFolderModern = toggleFolderModern;
  window.addModernFileExplorerStyles = addModernFileExplorerStyles;
}

