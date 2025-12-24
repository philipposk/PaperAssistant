    function toggleDocxDropdown() {
      const dropdown = document.getElementById('docxDropdown');
      const arrow = document.getElementById('docxArrow');
      if (dropdown && arrow) {
        dropdown.classList.toggle('show');
        arrow.textContent = dropdown.classList.contains('show') ? '▲' : '▼';
        // Ensure dropdown is above other elements
        if (dropdown.classList.contains('show')) {
          dropdown.style.zIndex = '10000';
          dropdown.style.position = 'relative';
        }
      }
    }
    
    // Make globally accessible immediately
    window.toggleDocxDropdown = toggleDocxDropdown;
    
    // Open latest paper in preview (markdown preview for DOCX converted to MD)
    function openLatestPaper() {
      // Use globally accessible docxFiles - with retry if not immediately available
      let docxFiles = window.docxFiles;
      
      // If not available, try to get it directly from part2's scope (if accessible)
      // or wait a bit for scripts to load
      if (!docxFiles || docxFiles.length === 0) {
        // Fallback: define it directly here if part2 hasn't loaded yet
        if (!window.docxFiles || window.docxFiles.length === 0) {
          window.docxFiles = [
            { name: "LATEST_PAPER_DRAFT.docx", path: "LATEST_PAPER_DRAFT.docx", desc: "🎯 LATEST - Always the most recent paper draft (auto-updated)" },
            { name: "PAPER_DRAFT_34.docx", path: "../paper_a_analysis/PAPER_DRAFT_34.docx", desc: "🎯 NEWEST - Updated author: Markos A. Ktistakis, ... (Dec 2025)" },
          ];
        }
        docxFiles = window.docxFiles;
      }
      
      if (!docxFiles || docxFiles.length === 0) {
        console.warn('docxFiles not available. Please refresh the page.');
        return;
      }
      
      // LATEST_PAPER_DRAFT.docx is always the first item and is the most recent
      const latestPaper = docxFiles.find(f => f.name === 'LATEST_PAPER_DRAFT.docx') || docxFiles[0];
      
      // Try to show markdown preview if available (for PAPER_DRAFT.md)
      const mdPath = '../paper_a_analysis/PAPER_DRAFT.md';
      if (window.showMarkdownPreview) {
        window.showMarkdownPreview(mdPath, 'PAPER_DRAFT.md');
      } else if (latestPaper && typeof window.openFile === 'function') {
        // Fallback to regular file opening
        window.openFile(latestPaper.path, new Event('click'));
      } else {
        console.warn('Preview function not available or latest paper not found');
      }
    }
    window.openLatestPaper = openLatestPaper;
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('docxDropdown');
      const dropdownContainer = document.querySelector('.docx-dropdown');
      const arrowButton = document.querySelector('.docx-arrow-button');
      if (dropdown && dropdownContainer && !dropdownContainer.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
        const arrow = document.getElementById('docxArrow');
        if (arrow) arrow.textContent = '▼';
      }
    });
    
    // Theme toggle - comprehensive update
    function toggleTheme() {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      
      // Update all CSS variables for theme
      if (newTheme === 'dark') {
        document.documentElement.style.setProperty('--bg-primary', '#0f172a');
        document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
        document.documentElement.style.setProperty('--bg-tertiary', '#334155');
        document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e1');
        document.documentElement.style.setProperty('--text-tertiary', '#94a3b8');
        document.documentElement.style.setProperty('--border-color', '#334155');
      } else {
        document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
        document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
        document.documentElement.style.setProperty('--bg-tertiary', '#f1f5f9');
        document.documentElement.style.setProperty('--text-primary', '#0f172a');
        document.documentElement.style.setProperty('--text-secondary', '#64748b');
        document.documentElement.style.setProperty('--text-tertiary', '#94a3b8');
        document.documentElement.style.setProperty('--border-color', '#e2e8f0');
      }
      
      // Force re-render of unified header if it exists
      if (typeof window.updateUnifiedHeaderTheme === 'function') {
        window.updateUnifiedHeaderTheme(newTheme);
      }
    }
    
    // Make globally accessible
    window.toggleTheme = toggleTheme;
    
    // Make available early
    if (typeof window.toggleTheme === 'undefined') {
      window.toggleTheme = toggleTheme;
    }
    
    // Load saved theme and apply immediately - run on DOM ready
    function initTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
      }
      
    // Apply theme CSS variables immediately
    if (savedTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-primary', '#0f172a');
      document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
      document.documentElement.style.setProperty('--bg-tertiary', '#334155');
      document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
      document.documentElement.style.setProperty('--text-secondary', '#cbd5e1');
      document.documentElement.style.setProperty('--text-tertiary', '#94a3b8');
      document.documentElement.style.setProperty('--border-color', '#334155');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
      document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
      document.documentElement.style.setProperty('--bg-tertiary', '#f1f5f9');
      document.documentElement.style.setProperty('--text-primary', '#0f172a');
      document.documentElement.style.setProperty('--text-secondary', '#64748b');
      document.documentElement.style.setProperty('--text-tertiary', '#94a3b8');
      document.documentElement.style.setProperty('--border-color', '#e2e8f0');
      }
    }
    
    // Run immediately and on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }
    
    // Dashboard file rendering
    function renderFiles(category, files) {
      const container = document.getElementById(category);
      container.innerHTML = files.map(file => `
        <li>
          <a href="${file.path}" onclick="openFile('${file.path}', event); return false;">${file.name}</a>
          <span class="file-type">${file.type}</span>
          <div class="file-meta">${file.desc}</div>
        </li>
      `).join('');
    }
    
    // File search - enhanced
    function searchFiles(query) {
      if (!query || query.trim() === '') {
        // Show all files if search is empty
        document.querySelectorAll('.file-list li').forEach(item => {
          item.style.display = 'block';
        });
        return;
      }
      
      const searchTerm = query.toLowerCase().trim();
      const lists = document.querySelectorAll('.file-list');
      let foundCount = 0;
      
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          const matches = text.includes(searchTerm);
          item.style.display = matches ? 'block' : 'none';
          if (matches) foundCount++;
        });
      });
      
      // Also search in timeline if visible
      if (document.getElementById('timeline-content')) {
        const timelineItems = document.getElementById('timeline-content').querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
      }
    }
    
    // Make search globally accessible
    window.searchFiles = searchFiles;
    
    // Document Explorer
    function toggleDocumentExplorer() {
      const modal = document.getElementById('documentExplorerModal');
      if (!modal) {
        createDocumentExplorer();
        return;
      }
      modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
      if (modal.style.display === 'flex') {
        loadProjectFiles();
      }
    }
    
    function createDocumentExplorer() {
      const modal = document.createElement('div');
      modal.id = 'documentExplorerModal';
      modal.className = 'document-explorer-modal';
      modal.innerHTML = `
        <div class="document-explorer-content">
          <div class="document-explorer-header">
            <h2>📁 Document Explorer</h2>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button onclick="toggleDocumentExplorerView('icons')" class="view-toggle-btn active" id="viewIconsBtn">🖼️ Icons</button>
              <button onclick="toggleDocumentExplorerView('list')" class="view-toggle-btn" id="viewListBtn">📋 List</button>
              <select id="documentCategoryFilter" onchange="filterDocumentsByCategory(this.value)" class="input-modern" style="margin-left: 1rem;">
                <option value="all">All Categories</option>
                <option value="figures">Figures</option>
                <option value="tables">Tables</option>
                <option value="markdown">Markdown</option>
                <option value="documents">Documents</option>
                <option value="logs">Logs</option>
              </select>
              <button onclick="toggleDocumentExplorer()" class="close-btn" style="margin-left: auto; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 50%; width: 32px; height: 32px; cursor: pointer;">✕</button>
            </div>
          </div>
          <div class="document-explorer-body" id="documentExplorerBody">
            <p>Loading project files...</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add styles if not present
      if (!document.getElementById('document-explorer-styles')) {
        const style = document.createElement('style');
        style.id = 'document-explorer-styles';
        style.textContent = `
          .document-explorer-modal {
            display: none;
            position: fixed;
            z-index: 3000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            align-items: center;
            justify-content: center;
          }
          .document-explorer-content {
            background: var(--bg-secondary);
            border-radius: var(--border-radius-lg);
            width: 90%;
            max-width: 1200px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
          }
          .document-explorer-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--accent-gradient);
            color: white;
            border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
          }
          .document-explorer-header h2 {
            margin: 0;
            font-size: 1.5rem;
          }
          .document-explorer-body {
            padding: 2rem;
            overflow-y: auto;
            flex: 1;
          }
          .document-explorer-icons {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1.5rem;
          }
          .document-explorer-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .document-item-icon {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 1rem;
            text-align: center;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          .document-item-icon:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
            border-color: var(--accent);
          }
          .document-item-list {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: var(--transition);
          }
          .document-item-list:hover {
            background: var(--bg-tertiary);
            border-color: var(--accent);
          }
          .view-toggle-btn {
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            transition: var(--transition);
          }
          .view-toggle-btn:hover, .view-toggle-btn.active {
            background: rgba(255,255,255,0.3);
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    function toggleDocumentExplorerView(view) {
      const body = document.getElementById('documentExplorerBody');
      const iconsBtn = document.getElementById('viewIconsBtn');
      const listBtn = document.getElementById('viewListBtn');
      
      if (view === 'icons') {
        body.className = 'document-explorer-icons';
        iconsBtn.classList.add('active');
        listBtn.classList.remove('active');
      } else {
        body.className = 'document-explorer-list';
        listBtn.classList.add('active');
        iconsBtn.classList.remove('active');
      }
      loadProjectFiles(); // Reload with new view
    }
    
    function filterDocumentsByCategory(category) {
      loadProjectFiles(category);
    }
    
    async function loadProjectFiles(category = 'all') {
      const body = document.getElementById('documentExplorerBody');
      if (!body) return;
      
      body.innerHTML = '<p>Loading project files...</p>';
      
      try {
        // Load files using project file loader
        if (window.projectFileLoader) {
          await window.projectFileLoader.loadManifest();
          const allFiles = window.projectFileLoader.getAllFiles();
          
          let filesToShow = [];
          if (category === 'all') {
            filesToShow = [
              ...allFiles.figures.map(f => ({...f, type: 'figure'})),
              ...allFiles.tables.map(t => ({...t, type: 'table'})),
              ...allFiles.markdown.map(m => ({...m, type: 'markdown'})),
              ...allFiles.documents.map(d => ({...d, type: 'document'})),
              ...allFiles.logs.map(l => ({...l, type: 'log'}))
            ];
          } else {
            filesToShow = allFiles[category]?.map(f => ({...f, type: category})) || [];
          }
          
          const isList = body.classList.contains('document-explorer-list');
          
          if (isList) {
            body.innerHTML = filesToShow.map(file => `
              <div class="document-item-list" onclick="openFile('${file.path}', event)">
                <span style="font-size: 1.5rem;">${getFileIcon(file.type)}</span>
                <div style="flex: 1;">
                  <strong>${file.name}</strong>
                  <div style="font-size: 0.875rem; color: var(--text-secondary);">${file.category || 'Other'}</div>
                </div>
              </div>
            `).join('');
          } else {
            body.innerHTML = filesToShow.map(file => `
              <div class="document-item-icon" onclick="openFile('${file.path}', event)">
                <span style="font-size: 2.5rem;">${getFileIcon(file.type)}</span>
                <div style="font-size: 0.875rem; text-align: center; word-break: break-word;">${file.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${file.category || 'Other'}</div>
              </div>
            `).join('');
          }
        } else {
          body.innerHTML = '<p>Project file loader not available. Please refresh the page.</p>';
        }
      } catch (error) {
        body.innerHTML = `<p>Error loading files: ${error.message}</p>`;
      }
    }
    
