// ============================================
// EDITOR SELECTOR
// Quick access to document editors
// ============================================

function showEditorSelector() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 600px; background: var(--bg-secondary); color: var(--text-primary);">
      <div class="about-modal-header" style="border-bottom: 1px solid var(--border-color);">
        <h3 style="color: var(--text-primary);">Open Editor</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()" style="color: var(--text-primary);">&times;</span>
      </div>
      <div class="about-modal-body" style="color: var(--text-primary); padding: 2rem;">
        <p>Choose an editor type or open a file:</p>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
          <button onclick="openEditorByType('word')" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem; text-align: left;">
            <span style="font-size: 1.5rem;">📝</span>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
              <span style="font-weight: 600;">Word Document Editor</span>
              <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">Edit DOCX files with rich text formatting</span>
            </div>
          </button>
          
          <button onclick="openEditorByType('latex')" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem; text-align: left;">
            <span style="font-size: 1.5rem;">📄</span>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
              <span style="font-weight: 600;">LaTeX Editor</span>
              <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">Edit LaTeX files with live preview</span>
            </div>
          </button>
          
          <button onclick="openEditorByType('code')" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem; text-align: left;">
            <span style="font-size: 1.5rem;">💻</span>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
              <span style="font-weight: 600;">Code Editor / IDE</span>
              <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">Edit code files with syntax highlighting and execution</span>
            </div>
          </button>
          
          <button onclick="openFileForEditing()" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem; text-align: left;">
            <span style="font-size: 1.5rem;">📂</span>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
              <span style="font-weight: 600;">Open File...</span>
              <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">Select a file to open in the appropriate editor</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Escape key handler
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function openEditorByType(type) {
  document.querySelector('.about-modal')?.remove();
  
  if (type === 'word') {
    // Create new Word document
    if (window.openDocumentEditor) {
      window.openDocumentEditor('new_document.docx', 'word');
    }
  } else if (type === 'latex') {
    // Create new LaTeX document
    if (window.openDocumentEditor) {
      window.openDocumentEditor('new_document.tex', 'latex');
    }
  } else if (type === 'code') {
    // Open code editor/IDE
    if (window.showCodeEditor) {
      window.showCodeEditor();
    } else if (window.openDocumentEditor) {
      window.openDocumentEditor('new_script.js', 'code');
    }
  }
}

function openFileForEditing() {
  document.querySelector('.about-modal')?.remove();
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.docx,.doc,.tex,.js,.ts,.py,.r,.html,.css,.json,.md,.txt';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const filePath = file.name;
    const fileType = getFileTypeFromName(file.name);
    
    if (window.openDocumentEditor) {
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        // Store content temporarily
        const content = event.target.result;
        
        // Create editor with content
        const editor = {
          filePath: filePath,
          type: fileType,
          content: content,
          originalContent: content,
          modified: false,
          language: detectLanguageFromName(file.name),
          createdAt: new Date().toISOString()
        };
        
        // Open editor
        window.openDocumentEditor(filePath, fileType);
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

function getFileTypeFromName(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['docx', 'doc'].includes(ext)) return 'word';
  if (ext === 'tex') return 'latex';
  if (['js', 'ts', 'py', 'r', 'html', 'css', 'json', 'md'].includes(ext)) return 'code';
  return 'text';
}

function detectLanguageFromName(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'r': 'r',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown'
  };
  return langMap[ext] || 'text';
}

window.showEditorSelector = showEditorSelector;
window.openEditorByType = openEditorByType;
window.openFileForEditing = openFileForEditing;







