    function renderFileTree(node, level = 0, isExpanded = false) {
      // Use modern renderer if available, otherwise fallback to original
      if (typeof window.renderFileTreeModern === 'function') {
        return window.renderFileTreeModern(node, level, isExpanded);
      }
      
      // Fallback to original implementation
      if (node.type === 'file') {
        const icon = getFileIcon(node.name);
        const safePath = (node.path || '').replace(/'/g, "\\'");
        const safeName = (node.name || '').replace(/'/g, "\\'");
        const indent = level * 16;
        return `<li class="file-tree-item file-tree-file" onclick="if(typeof window.openFileFromExplorer === 'function') window.openFileFromExplorer('${safePath}', '${safeName}', event); else openFileFromExplorer('${safePath}', '${safeName}', event);" title="${safeName}" style="padding-left: ${indent + 20}px;">
          <span class="file-tree-icon">${icon}</span>
          <span class="file-tree-name">${safeName}</span>
        </li>`;
      } else {
        const folderId = 'folder-' + node.name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
        const indent = level * 16;
        const hasChildren = node.children && node.children.length > 0;
        const expandedClass = isExpanded ? 'open' : '';
        const caretIcon = hasChildren ? (isExpanded ? '▼' : '▶') : '•';
        
        let html = `<li class="file-tree-item file-tree-folder ${expandedClass}" onclick="toggleFolder('${folderId}')" style="padding-left: ${indent + 4}px;">
          <span class="file-tree-caret" id="caret-${folderId}">${caretIcon}</span>
          <span class="file-tree-icon">${getFolderIcon ? getFolderIcon(node.name) : '📁'}</span>
          <span class="file-tree-name">${node.name}</span>
        </li>`;
        if (hasChildren) {
          html += `<ul class="file-tree-children ${expandedClass}" id="${folderId}" style="display: ${isExpanded ? 'block' : 'none'}; padding-left: ${indent + 16}px;">`;
          node.children.forEach(child => {
            html += renderFileTree(child, level + 1, false);
          });
          html += '</ul>';
        }
        return html;
      }
    }
    
    function getFileIcon(fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      const icons = {
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
        'r': '📊'
      };
      return icons[ext] || '📄';
    }
    
    function toggleFolder(folderId) {
      // Use modern toggle if available
      if (typeof window.toggleFolderModern === 'function') {
        window.toggleFolderModern(folderId);
        return;
      }
      
      // Fallback to original implementation
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
    
    function openFileFromExplorer(filePath, fileName, event) {
      // Find the folder containing this file and set up navigation
      const pathParts = filePath.split('/');
      const folderPath = pathParts.slice(0, -1).join('/');
      
      // Get all files in the same folder
      currentFolderFiles = fileTreeData.filter(f => {
        const fPath = f.fullPath || f.path || '';
        const fFolder = fPath.split('/').slice(0, -1).join('/');
        return fFolder === folderPath && f.type === 'file';
      });
      
      // Find current file index
      currentFileIndex = currentFolderFiles.findIndex(f => {
        const fPath = f.fullPath || f.path || '';
        return fPath === filePath || fPath.endsWith('/' + fileName) || fPath === fileName;
      });
      if (currentFileIndex === -1) currentFileIndex = 0;
      
      // Update navigation buttons
      updateNavigationButtons();
      
      // Open file
      const clickEvent = event || new Event('click');
      openFile(filePath, clickEvent);
      
      // Highlight selected file
      document.querySelectorAll('.file-tree-item').forEach(item => {
        item.classList.remove('selected');
      });
      if (event && event.target) {
        const clickedItem = event.target.closest('.file-tree-item');
        if (clickedItem) clickedItem.classList.add('selected');
      }
    }
    
    function navigateFile(direction) {
      if (!currentFolderFiles || currentFolderFiles.length === 0) {
        if(typeof window.ModalSystem !== 'undefined') {
          window.ModalSystem.info('No File Selected', 'Please open a file to enable navigation features.');
        } else {
        alert('Please open a file first to enable navigation');
        }
        return;
      }
      
      if (direction === 'next') {
        currentFileIndex = (currentFileIndex + 1) % currentFolderFiles.length;
      } else {
        currentFileIndex = (currentFileIndex - 1 + currentFolderFiles.length) % currentFolderFiles.length;
      }
      
      const file = currentFolderFiles[currentFileIndex];
      if (file) {
        openFileFromExplorer(file.path, file.name);
      }
    }
    
    function updateNavigationButtons() {
      const prevBtn = document.getElementById('fileExplorerPrev');
      const nextBtn = document.getElementById('fileExplorerNext');
      if (prevBtn && nextBtn) {
        const hasFiles = currentFolderFiles && currentFolderFiles.length > 1;
        prevBtn.disabled = !hasFiles;
        nextBtn.disabled = !hasFiles;
        if (!hasFiles) {
          prevBtn.title = 'Open a file first to enable navigation';
          nextBtn.title = 'Open a file first to enable navigation';
          prevBtn.textContent = '◀ Prev (Not Loaded)';
          nextBtn.textContent = 'Next (Not Loaded) ▶';
        } else {
          prevBtn.title = 'Previous file';
          nextBtn.title = 'Next file';
          prevBtn.textContent = '◀ Prev';
          nextBtn.textContent = 'Next ▶';
        }
      }
    }
    
    window.updateNavigationButtons = updateNavigationButtons;
    
    function filterFileTree(query) {
      const items = document.querySelectorAll('.file-tree-item');
      const searchTerm = query.toLowerCase();
      
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          item.style.display = 'flex';
          // Expand parent folders
          let parent = item.parentElement;
          while (parent && parent.classList.contains('file-tree-children')) {
            parent.classList.add('open');
            const folderId = parent.id;
            const caret = document.getElementById('caret-' + folderId);
            if (caret) caret.classList.add('open');
            parent = parent.parentElement;
          }
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    // Make file explorer functions globally accessible
    window.toggleFileExplorer = toggleFileExplorer;
    window.toggleFolder = toggleFolder;
    window.openFileFromExplorer = openFileFromExplorer;
    window.navigateFile = navigateFile;
    window.filterFileTree = filterFileTree;
    
    // Make available early
    if (typeof window.toggleFileExplorer === 'undefined') {
      window.toggleFileExplorer = toggleFileExplorer;
      window.toggleFolder = toggleFolder;
      window.openFileFromExplorer = openFileFromExplorer;
      window.navigateFile = navigateFile;
      window.filterFileTree = filterFileTree;
    }
    
    // Keyboard shortcut: Ctrl+B or Cmd+B to toggle file explorer
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleFileExplorer();
      }
    });
    
    // Get context from uploaded training files
    async function getTrainingFilesContext() {
      const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
      if (trainingData.length === 0) return '';
      
      // Get most relevant training files (semantic search if embeddings available)
      const relevantFiles = trainingData.slice(0, 5).map(item => 
        `From uploaded file "${item.fileName}":\n${item.content.substring(0, 500)}...`
      ).join('\n\n');
      
      return `Additional context from user's uploaded files:\n${relevantFiles}`;
    }
    
    // Make file explorer functions available immediately (before DOMContentLoaded)
    // This ensures they're available when buttons are clicked
    // Define a placeholder that will be replaced by the actual function
    window.toggleFileExplorer = window.toggleFileExplorer || function() {
      console.warn('File explorer functions loading...');
      // Will be replaced by actual function when script loads
    };
    
    // Initialize file tree on page load
    document.addEventListener('DOMContentLoaded', async function() {
      // File tree will be built when sidebar is first opened
      await initializeSearchIndex();
      
      // Initialize embeddings model (lazy load)
      initializeEmbeddingsModel();
      
      // Load use case customizations
      if (localStorage.getItem('useCaseSelected')) {
        const useCase = localStorage.getItem('currentUseCase') || 'research';
        if (window.applyUseCase) {
          applyUseCase(useCase);
        }
      }
      
      // Load carousels
      loadFiguresCarousel();
      loadTablesCarousel();
    });
    
    // Carousel Functions
    function scrollCarousel(carouselId, direction) {
      const track = document.getElementById(carouselId + 'Track');
      if (track) {
        const scrollAmount = 220; // width of item + gap
        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      }
    }
    
    // Make globally accessible
    window.scrollCarousel = scrollCarousel;
    
    function loadFiguresCarousel() {
      const track = document.getElementById('figuresCarouselTrack');
      if (!track) {
        console.warn('figuresCarouselTrack not found');
        return;
      }
      
      // Use PROJECT_FILE_LOADER if available, otherwise use hardcoded list
      let figures = [];
      
      if (window.projectFileLoader && window.projectFileLoader.manifest) {
        // Get figures from manifest
        const manifestFigures = window.projectFileLoader.manifest.figures || [];
        figures = manifestFigures.slice(0, 10).map(fig => {
          // Extract figure number from filename
          const match = fig.name.match(/figure(\d+[a-z]?)/i);
          const number = match ? match[1] : fig.name.replace(/\.(png|jpg|jpeg|svg)$/i, '');
          return {
            number: number,
            file: fig.name,
            path: fig.path,
            caption: fig.caption || `Figure ${number}`
          };
        });
      } else {
        // Fallback to hardcoded list
        figures = [
        { number: 1, file: "figure1_energy_distribution.png", caption: "Distribution of total energy consumption" },
        { number: 2, file: "figure2_eds_distribution.png", caption: "Distribution of Electric Driving Share (EDS)" },
        { number: 3, file: "figure3_energy_vs_eds.png", caption: "Relationship between energy and EDS" },
        { number: 4, file: "figure4_fleet_vs_campaign.png", caption: "Fleet vs campaign comparison" },
          { number: 5, file: "figure5_variable_importance_lmg.png", caption: "Variable importance (LMG)" }
        ];
      }
      
      if (figures.length === 0) {
        track.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary); width: 100%;">No figures found. Loading from project files...</div>';
        // Try to load manifest if not loaded
        if (window.projectFileLoader && !window.projectFileLoader.manifest) {
          window.projectFileLoader.loadManifest().then(() => {
            loadFiguresCarousel(); // Retry after manifest loads
          });
        }
        return;
      }
      
      const basePath = '../paper_a_analysis/figures/';
      const items = figures.map(fig => {
        const imgPath = fig.path || (basePath + fig.file);
        // Escape quotes in caption for onclick
        const safeCaption = (fig.caption || '').replace(/'/g, "\\'");
        return `
        <div class="carousel-item" onclick="if(typeof window.openModal === 'function') { window.openModal('${imgPath}', 'Figure ${fig.number}: ${safeCaption}'); } else if(typeof openModal === 'function') { openModal('${imgPath}', 'Figure ${fig.number}: ${safeCaption}'); } else { window.open('${imgPath}', '_blank'); }" title="Figure ${fig.number}: ${safeCaption}">
          <img src="${imgPath}" 
               alt="Figure ${fig.number}" 
               style="width: 100%; height: 150px; object-fit: contain; background: var(--bg-primary); border-radius: 8px; display: block;"
               onerror="this.onerror=null; this.style.display='none'; const parent = this.parentElement; if(parent && !parent.querySelector('.error-msg')) { parent.innerHTML='<div class=\\'error-msg\\' style=\\'padding: 2rem; text-align: center; color: var(--text-secondary); background: var(--bg-primary); border-radius: 8px; height: 150px; display: flex; align-items: center; justify-content: center; flex-direction: column;\\'><div>Figure ${fig.number}</div><small>Image not found</small></div>'; }">
          <div class="carousel-label">Figure ${fig.number}</div>
        </div>
      `;
      }).join('');
      
      track.innerHTML = items;
      console.log(`Loaded ${figures.length} figures into carousel`, figures);
      
      // Verify items were added
      const itemsAdded = track.querySelectorAll('.carousel-item');
      if (itemsAdded.length === 0) {
        console.error('No carousel items were added to track');
                } else {
        console.log(`Successfully added ${itemsAdded.length} carousel items`);
      }
    }
    
