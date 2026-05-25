// ============================================
// SHARED FEATURES - Common functionality for all pages
// ============================================

(function() {
  'use strict';
  
  // Add About Modal styles if not already added
  if (!document.getElementById('about-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'about-modal-styles';
    style.textContent = `
      #aboutModal {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #aboutModal.show {
        opacity: 1;
      }
      #aboutModal .modal-content {
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      #aboutModal.show .modal-content {
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // THEME MANAGEMENT
  // ============================================
  
  function initTheme() {
    // Load theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    applyTheme(theme);
  }
  
  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.style.setProperty('--bg-primary', '#0f172a');
      html.style.setProperty('--bg-secondary', '#1e293b');
      html.style.setProperty('--bg-tertiary', '#334155');
      html.style.setProperty('--text-primary', '#f1f5f9');
      html.style.setProperty('--text-secondary', '#cbd5e1');
      html.style.setProperty('--text-tertiary', '#94a3b8');
      html.style.setProperty('--border-color', '#334155');
    } else {
      html.style.setProperty('--bg-primary', '#f8fafc');
      html.style.setProperty('--bg-secondary', '#ffffff');
      html.style.setProperty('--bg-tertiary', '#f1f5f9');
      html.style.setProperty('--text-primary', '#0f172a');
      html.style.setProperty('--text-secondary', '#64748b');
      html.style.setProperty('--text-tertiary', '#94a3b8');
      html.style.setProperty('--border-color', '#e2e8f0');
    }
  }
  
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Update icon if exists
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  // ============================================
  // ABOUT MODAL
  // ============================================
  
  function openAboutModal() {
    let modal = document.getElementById('aboutModal');
    
    // Create modal if it doesn't exist
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aboutModal';
      modal.className = 'modal';
      modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;';
      modal.innerHTML = `
        <div class="modal-content" style="background: var(--bg-secondary, #1e293b); border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); position: relative;">
          <button onclick="if(typeof window.closeAboutModal === 'function') window.closeAboutModal();" style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; color: var(--text-primary, #f1f5f9); font-size: 1.5rem; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">×</button>
          <h2 style="margin: 0 0 1.5rem 0; color: var(--text-primary, #f1f5f9); font-size: 1.75rem;">ℹ️ About PHEV Research Portal</h2>
          <div style="color: var(--text-secondary, #cbd5e1); line-height: 1.6;">
            <p style="margin-bottom: 1rem;">
              <strong style="color: var(--text-primary, #f1f5f9);">PHEV Research Portal</strong> is a comprehensive research management system for analyzing Plug-in Hybrid Electric Vehicle (PHEV) data and research.
            </p>
            <h3 style="color: var(--text-primary, #f1f5f9); margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.25rem;">Features:</h3>
            <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
              <li>📁 File Explorer - Browse project files and documentation</li>
              <li>📊 Paper Progression - Track paper development and analysis</li>
              <li>📈 Figures & Tables Portfolio - View all research outputs</li>
              <li>🔍 Search - Find files and content quickly</li>
              <li>🤖 AI Assistant - Get help with research tasks</li>
              <li>📚 Research Hub - Cross-referenced documents and papers</li>
            </ul>
            <h3 style="color: var(--text-primary, #f1f5f9); margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.25rem;">Project:</h3>
            <p style="margin-bottom: 1rem;">
              This portal manages research for <strong style="color: var(--text-primary, #f1f5f9);">Paper A: Energy Consumption and Electric Driving Share (EDS) Analysis</strong>.
            </p>
            <p style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color, #334155); font-size: 0.9rem; color: var(--text-tertiary, #94a3b8);">
              Built for Markos Project - PHEV Research
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close on background click
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeAboutModal();
        }
      });
    }
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  // ============================================
  // DOCUMENT FUNCTIONS
  // ============================================
  
  function openLatestPaper() {
    // This will be implemented by paper_progression.html specific code
    // For now, just log that it was called
    if (typeof window.docxFiles !== 'undefined' && window.docxFiles && window.docxFiles.length > 0) {
      const latestPaper = window.docxFiles.find(f => f.name === 'PAPER_DRAFT_34.docx') || 
                         window.docxFiles.find(f => f.name.startsWith('PAPER_DRAFT_') && !f.name.includes('LATEST')) || 
                         window.docxFiles[1] || 
                         window.docxFiles[0];
      if (latestPaper && typeof window.openFile === 'function') {
        window.openFile(latestPaper.path, new Event('click'));
      } else {
        console.warn('openFile function not available or latest paper not found');
      }
    } else {
      console.warn('No DOCX files available');
    }
  }
  
  function toggleDocumentExplorer() {
    // This will be implemented by paper_progression.html specific code
    console.warn('toggleDocumentExplorer called but not implemented in shared features');
  }

  // ============================================
  // EXPORT TO WINDOW
  // ============================================
  
  // Initialize theme on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        // Only auto-update if user hasn't set a preference
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        applyTheme(newTheme);
      }
    });
  }
  
  // Export functions
  window.toggleTheme = toggleTheme;
  window.getCurrentTheme = getCurrentTheme;
  window.openAboutModal = openAboutModal;
  window.closeAboutModal = closeAboutModal;
  window.openLatestPaper = openLatestPaper;
  window.toggleDocumentExplorer = toggleDocumentExplorer;
  
  // Make available early
  window.toggleTheme = window.toggleTheme || toggleTheme;
  window.openAboutModal = window.openAboutModal || openAboutModal;
  window.closeAboutModal = window.closeAboutModal || closeAboutModal;
  
})();

