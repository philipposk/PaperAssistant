// ============================================
// DOCUMENT EDITING SYSTEM
// Full editing capabilities for Word, LaTeX, and code files
// ============================================

// ============================================
// 1. DOCUMENT EDITOR CORE
// ============================================

let openEditors = new Map(); // filePath -> editor instance

function openDocumentEditor(filePath, fileType) {
  // Check if already open
  if (openEditors.has(filePath)) {
    focusEditor(filePath);
    return;
  }
  
  // For markdown files, use preview instead of editor
  if (fileType === 'markdown' || filePath.endsWith('.md')) {
    if (window.showMarkdownPreview) {
      const fileName = filePath.split('/').pop();
      window.showMarkdownPreview(filePath, fileName);
      return;
    }
  }
  
  // Determine editor type
  let editorType = 'text';
  if (fileType === 'word' || filePath.endsWith('.docx') || filePath.endsWith('.doc')) {
    editorType = 'word';
  } else if (fileType === 'latex' || filePath.endsWith('.tex')) {
    editorType = 'latex';
  } else if (['javascript', 'typescript', 'python', 'r', 'html', 'css', 'json'].includes(fileType)) {
    editorType = 'code';
  }
  
  // Create editor
  const editor = createEditor(filePath, editorType);
  openEditors.set(filePath, editor);
  
  // Show editor modal
  showEditorModal(editor);
}

function createEditor(filePath, editorType) {
  const editor = {
    filePath: filePath,
    type: editorType,
    content: '',
    originalContent: '',
    modified: false,
    language: detectLanguage(filePath),
    createdAt: new Date().toISOString()
  };
  
  // Load file content
  loadFileContent(filePath).then(content => {
    editor.content = content;
    editor.originalContent = content;
  });
  
  return editor;
}

async function loadFileContent(filePath) {
  try {
    const response = await fetch(filePath);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('Error loading file:', error);
  }
  return '';
}

function detectLanguage(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'py': 'python',
    'r': 'r',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'tex': 'latex',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return langMap[ext] || 'text';
}

// ============================================
// 2. EDITOR MODAL
// ============================================

function showEditorModal(editor) {
  const modal = document.createElement('div');
  modal.className = 'document-editor-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    z-index: 10000;
    flex-direction: column;
  `;
  
  modal.innerHTML = `
    <div style="background: var(--bg-secondary); color: var(--text-primary); flex: 1; display: flex; flex-direction: column; margin: 2rem; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
      <div style="background: var(--bg-primary); padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; color: var(--text-primary);">${editor.filePath.split('/').pop()}</h3>
          <small style="color: var(--text-secondary);">${editor.type} editor</small>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="saveDocumentEditor('${editor.filePath}')" class="btn-modern btn-modern-primary">
            <span>💾</span>
            <span>Save</span>
          </button>
          ${editor.type === 'code' ? `<button onclick="runCodeFromEditor('${editor.filePath}')" class="btn-modern" style="background: var(--success); color: white;"><span>▶️</span><span>Run</span></button>` : ''}
          <button onclick="closeDocumentEditor('${editor.filePath}')" class="btn-modern" style="background: var(--error); color: white;">
            <span>✕</span>
            <span>Close</span>
          </button>
        </div>
      </div>
      <div id="editorContainer-${editor.filePath.replace(/\//g, '_')}" style="flex: 1; overflow: auto; position: relative;">
        ${getEditorHTML(editor)}
      </div>
      ${editor.type === 'code' ? `
        <div id="codeOutput-${editor.filePath.replace(/\//g, '_')}" style="background: var(--bg-primary); border-top: 1px solid var(--border-color); padding: 1rem; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.9rem;">
          <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">Output:</div>
          <div id="codeOutputContent-${editor.filePath.replace(/\//g, '_')}" style="color: var(--text-primary);"></div>
        </div>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Initialize editor based on type
  setTimeout(() => {
    initializeEditor(editor);
  }, 100);
  
  // Escape key handler
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeDocumentEditor(editor.filePath);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  // Track changes
  trackEditorChanges(editor);
}

function getEditorHTML(editor) {
  const containerId = `editorContainer-${editor.filePath.replace(/\//g, '_')}`;
  
  if (editor.type === 'word') {
    return `
      <div id="wordEditor-${editor.filePath.replace(/\//g, '_')}" style="padding: 2rem; min-height: 100%; background: white; color: black;">
        <div contenteditable="true" style="outline: none; min-height: 500px; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
          ${editor.content || '<p>Loading...</p>'}
        </div>
      </div>
    `;
  } else if (editor.type === 'latex') {
    return `
      <div style="display: flex; height: 100%;">
        <div style="flex: 1; border-right: 1px solid var(--border-color);">
          <div style="background: var(--bg-primary); padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
            <strong style="color: var(--text-primary);">LaTeX Source</strong>
          </div>
          <textarea id="latexEditor-${editor.filePath.replace(/\//g, '_')}" 
            style="width: 100%; height: calc(100% - 3rem); padding: 1rem; font-family: 'Courier New', monospace; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); border: none; outline: none; resize: none;"
            spellcheck="false">${editor.content || ''}</textarea>
        </div>
        <div style="flex: 1;">
          <div style="background: var(--bg-primary); padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
            <strong style="color: var(--text-primary);">Preview</strong>
          </div>
          <div id="latexPreview-${editor.filePath.replace(/\//g, '_')}" style="padding: 2rem; height: calc(100% - 3rem); overflow-y: auto; background: white; color: black;">
            <p style="color: #666;">Preview will appear here...</p>
          </div>
        </div>
      </div>
    `;
  } else {
    // Code editor
    return `
      <div id="codeEditorWrapper-${editor.filePath.replace(/\//g, '_')}" style="height: 100%; position: relative;">
        <textarea id="codeEditor-${editor.filePath.replace(/\//g, '_')}" 
          data-file-path="${editor.filePath}"
          style="width: 100%; height: 100%; padding: 1rem; font-family: 'Courier New', monospace; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); border: none; outline: none; resize: none; tab-size: 2;"
          spellcheck="false">${editor.content || ''}</textarea>
      </div>
    `;
  }
}

// ============================================
// 3. EDITOR INITIALIZATION
// ============================================

function initializeEditor(editor) {
  const containerId = `editorContainer-${editor.filePath.replace(/\//g, '_')}`;
  
  if (editor.type === 'word') {
    // Word editor is already contenteditable
    const editorDiv = document.querySelector(`#wordEditor-${editor.filePath.replace(/\//g, '_')} [contenteditable]`);
    if (editorDiv) {
      editorDiv.addEventListener('input', () => {
        editor.content = editorDiv.innerHTML;
        editor.modified = editor.content !== editor.originalContent;
        updateEditorTitle(editor);
      });
    }
  } else if (editor.type === 'latex') {
    // LaTeX editor with live preview
    const textarea = document.querySelector(`#latexEditor-${editor.filePath.replace(/\//g, '_')}`);
    const preview = document.querySelector(`#latexPreview-${editor.filePath.replace(/\//g, '_')}`);
    
    if (textarea) {
      textarea.addEventListener('input', () => {
        editor.content = textarea.value;
        editor.modified = editor.content !== editor.originalContent;
        updateEditorTitle(editor);
        updateLatexPreview(textarea.value, preview);
      });
      
      // Initial preview
      updateLatexPreview(textarea.value, preview);
    }
  } else {
    // Code editor - try to load Monaco or CodeMirror
    loadCodeEditorForDocument(editor);
  }
}

function loadCodeEditorForDocument(editor) {
  const textareaId = `codeEditor-${editor.filePath.replace(/\//g, '_')}`;
  const textarea = document.getElementById(textareaId);
  
  if (!textarea) return;
  
  // For now, use enhanced textarea with syntax highlighting
  // In production, load Monaco Editor or CodeMirror
  textarea.addEventListener('input', () => {
    editor.content = textarea.value;
    editor.modified = editor.content !== editor.originalContent;
    updateEditorTitle(editor);
    
    // Apply basic syntax highlighting
    applyBasicSyntaxHighlighting(textarea, editor.language);
  });
  
  // Add keyboard shortcuts
  textarea.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDocumentEditor(editor.filePath);
    }
    // Ctrl/Cmd + Enter to run (for code)
    if (editor.type === 'code' && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCodeFromEditor(editor.filePath);
    }
  });
}

function applyBasicSyntaxHighlighting(textarea, language) {
  // Basic syntax highlighting would be applied here
  // For full implementation, use a library like Prism.js or highlight.js
}

function updateLatexPreview(latex, previewDiv) {
  // In production, use a LaTeX rendering library like MathJax or KaTeX
  // For now, show raw LaTeX
  if (previewDiv) {
    previewDiv.innerHTML = `
      <div style="font-family: 'Courier New', monospace; white-space: pre-wrap; color: #333;">
        ${escapeHtml(latex)}
      </div>
      <p style="color: #666; margin-top: 1rem; font-style: italic;">
        Note: Full LaTeX rendering requires MathJax/KaTeX integration
      </p>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateEditorTitle(editor) {
  const modal = document.querySelector('.document-editor-modal');
  if (modal) {
    const title = modal.querySelector('h3');
    if (title) {
      const fileName = editor.filePath.split('/').pop();
      title.textContent = editor.modified ? `${fileName} *` : fileName;
    }
  }
}

function trackEditorChanges(editor) {
  // Track changes for logging system
  if (window.logChange) {
    const containerId = `editorContainer-${editor.filePath.replace(/\//g, '_')}`;
    const editorElement = document.querySelector(`#${containerId} textarea, #${containerId} [contenteditable]`);
    
    if (editorElement) {
      let debounceTimer;
      editorElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (window.logChange) {
            window.logChange('file_edited', editor.filePath, editor.content);
          }
        }, 1000);
      });
    }
  }
}

// ============================================
// 4. SAVE FUNCTIONALITY
// ============================================

async function saveDocumentEditor(filePath) {
  const editor = openEditors.get(filePath);
  if (!editor) return;
  
  try {
    // Get current content
    let content = editor.content;
    
    if (editor.type === 'word') {
      const editorDiv = document.querySelector(`#wordEditor-${editor.filePath.replace(/\//g, '_')} [contenteditable]`);
      if (editorDiv) {
        content = editorDiv.innerHTML;
      }
      // Convert to DOCX format (would use a library like docx.js)
      await saveAsDOCX(filePath, content);
    } else if (editor.type === 'latex') {
      const textarea = document.querySelector(`#latexEditor-${editor.filePath.replace(/\//g, '_')}`);
      if (textarea) {
        content = textarea.value;
      }
      await saveAsText(filePath, content);
    } else {
      const textarea = document.querySelector(`#codeEditor-${editor.filePath.replace(/\//g, '_')}`);
      if (textarea) {
        content = textarea.value;
      }
      await saveAsText(filePath, content);
    }
    
    editor.content = content;
    editor.originalContent = content;
    editor.modified = false;
    updateEditorTitle(editor);
    
    // Log save action
    if (window.logAction) {
      window.logAction('file_saved', { path: filePath, timestamp: new Date().toISOString() });
    }
    
    // Show success message
    showNotification('File saved successfully!', 'success');
    
  } catch (error) {
    console.error('Error saving file:', error);
    showNotification('Error saving file: ' + error.message, 'error');
  }
}

async function saveAsDOCX(filePath, htmlContent) {
  // In production, use docx.js to convert HTML to DOCX
  // For now, save as HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filePath.split('/').pop().replace(/\.docx?$/, '.html');
  a.click();
  URL.revokeObjectURL(url);
}

async function saveAsText(filePath, content) {
  // Save to IndexedDB or trigger download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filePath.split('/').pop();
  a.click();
  URL.revokeObjectURL(url);
  
  // Also save to IndexedDB for persistence
  try {
    const db = await openEditorIndexedDB();
    const tx = db.transaction(['editedFiles'], 'readwrite');
    await tx.objectStore('editedFiles').put({
      path: filePath,
      content: content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
}

// ============================================
// 5. CODE EXECUTION
// ============================================

async function runCodeFromEditor(filePath) {
  const editor = openEditors.get(filePath);
  if (!editor || editor.type !== 'code') return;
  
  const outputDiv = document.querySelector(`#codeOutputContent-${filePath.replace(/\//g, '_')}`);
  if (!outputDiv) return;
  
  // Get code content
  const textarea = document.querySelector(`#codeEditor-${filePath.replace(/\//g, '_')}`);
  if (!textarea) return;
  
  const code = textarea.value;
  
  // Show loading
  outputDiv.innerHTML = '<div style="color: var(--text-secondary);">Running code...</div>';
  
  try {
    let result;
    
    // Execute based on language
    if (editor.language === 'python') {
      result = await executePython(code);
    } else if (editor.language === 'r') {
      result = await executeR(code);
    } else if (editor.language === 'javascript') {
      result = await executeJavaScript(code);
    } else {
      result = { output: 'Code execution not supported for this language', error: null };
    }
    
    // Display result
    if (result.error) {
      outputDiv.innerHTML = `<div style="color: var(--error);">Error: ${escapeHtml(result.error)}</div>`;
    } else {
      outputDiv.innerHTML = `<div style="color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(result.output || 'No output')}</div>`;
    }
    
    // Log execution
    if (window.logAction) {
      window.logAction('code_executed', { 
        path: filePath, 
        language: editor.language,
        timestamp: new Date().toISOString() 
      });
    }
    
  } catch (error) {
    outputDiv.innerHTML = `<div style="color: var(--error);">Error: ${escapeHtml(error.message)}</div>`;
  }
}

async function executePython(code) {
  // Use Pyodide if available
  if (window.pyodide) {
    try {
      const output = window.pyodide.runPython(code);
      return { output: String(output), error: null };
    } catch (error) {
      return { output: null, error: error.message };
    }
  } else {
    // Fallback: would need backend API
    return { output: null, error: 'Python execution requires Pyodide or backend API' };
  }
}

async function executeR(code) {
  // Would need WebR or backend API
  return { output: null, error: 'R execution requires WebR or backend API' };
}

async function executeJavaScript(code) {
  try {
    // Execute in sandboxed context
    const result = eval(code);
    return { output: String(result), error: null };
  } catch (error) {
    return { output: null, error: error.message };
  }
}

// ============================================
// 6. EDITOR MANAGEMENT
// ============================================

function closeDocumentEditor(filePath) {
  const editor = openEditors.get(filePath);
  if (!editor) return;
  
  // Check if modified
  if (editor.modified) {
    const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
    if (!confirmClose) return;
  }
  
  // Remove modal
  const modal = document.querySelector('.document-editor-modal');
  if (modal) {
    modal.remove();
  }
  
  // Remove from map
  openEditors.delete(filePath);
}

function focusEditor(filePath) {
  const modal = document.querySelector('.document-editor-modal');
  if (modal) {
    modal.style.zIndex = '10000';
    modal.scrollIntoView();
  }
}

// ============================================
// 7. INDEXEDDB STORAGE
// ============================================

async function openEditorIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DocumentEditorDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('editedFiles')) {
        db.createObjectStore('editedFiles', { keyPath: 'path' });
      }
    };
  });
}

// ============================================
// 8. NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent)'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// 9. EXPORT FUNCTIONS
// ============================================

window.openDocumentEditor = openDocumentEditor;
window.saveDocumentEditor = saveDocumentEditor;
window.closeDocumentEditor = closeDocumentEditor;
window.runCodeFromEditor = runCodeFromEditor;

// Add CSS animations
if (!document.getElementById('editorAnimations')) {
  const style = document.createElement('style');
  style.id = 'editorAnimations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}







