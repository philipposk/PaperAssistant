// ============================================
// UNIVERSAL FILE EXPLORER
// Works on all pages (index.html, paper_progression.html, etc.)
// ============================================

let fileTreeData = [];
let currentFileIndex = -1;
let currentFolderFiles = [];

// Get file system structure for Markos project
async function getFileSystemStructureAsync() {
  // Try to fetch from API first
  if (typeof window.fetchFileStructureFromAPI === 'function') {
    const apiStructure = await window.fetchFileStructureFromAPI();
    if (apiStructure) {
      console.log('Using file structure from API');
      return apiStructure;
    }
  }
  
  // Fallback to hardcoded structure
  console.log('Using hardcoded file structure');
  return getFileSystemStructure();
}

// Get file system structure for Markos project (hardcoded fallback)
function getFileSystemStructure() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const basePath = isLocalhost ? '../paper_a_analysis/' : '';
  const rootPath = isLocalhost ? '../' : '';
  
  const structure = {
    name: 'MARKOS PROJECT',
    type: 'folder',
    children: [
      {
        name: 'paper_a_analysis',
        type: 'folder',
        children: [
          {
            name: 'Documentation',
            type: 'folder',
            children: [
              { name: 'PAPER_DRAFT.md', type: 'file', path: basePath + 'PAPER_DRAFT.md' },
              { name: 'APPENDIX_A.md', type: 'file', path: basePath + 'APPENDIX_A.md' },
              { name: 'METHODOLOGY_EVOLUTION_DOCUMENTATION.md', type: 'file', path: basePath + 'METHODOLOGY_EVOLUTION_DOCUMENTATION.md' },
              { name: 'ALL_MODELS_COMPLETE_SUMMARY.md', type: 'file', path: basePath + 'ALL_MODELS_COMPLETE_SUMMARY.md' },
              { name: 'COMPLETE_UPDATE_SUMMARY.md', type: 'file', path: basePath + 'COMPLETE_UPDATE_SUMMARY.md' },
              { name: 'SUPERVISOR_MEETING_QUESTIONS.md', type: 'file', path: basePath + 'SUPERVISOR_MEETING_QUESTIONS.md' },
              { name: 'COMPREHENSIVE_ANALYSIS_README.md', type: 'file', path: basePath + 'COMPREHENSIVE_ANALYSIS_README.md' }
            ]
          },
          {
            name: 'logs',
            type: 'folder',
            children: [
              { name: 'all_models_CLEAN.log', type: 'file', path: basePath + 'logs/all_models_CLEAN.log' },
              { name: 'comprehensive_analysis_ALL.log', type: 'file', path: basePath + 'logs/comprehensive_analysis_ALL.log' },
              { name: 'comprehensive_analysis.log', type: 'file', path: basePath + 'logs/comprehensive_analysis.log' },
              { name: 'eds_comprehensive_analysis.log', type: 'file', path: basePath + 'logs/eds_comprehensive_analysis.log' },
              { name: 'eds_analysis.log', type: 'file', path: basePath + 'logs/eds_analysis.log' },
              { name: 'future_work_analyses.log', type: 'file', path: basePath + 'logs/future_work_analyses.log' },
              { name: 'monitor.log', type: 'file', path: basePath + 'logs/monitor.log' }
            ]
          },
          {
            name: 'data_cleaning_docs',
            type: 'folder',
            children: [
              { name: 'README.md', type: 'file', path: basePath + 'data_cleaning_docs/README.md' },
              { name: 'DATA_CLEANING_DOCUMENTATION.md', type: 'file', path: basePath + 'data_cleaning_docs/DATA_CLEANING_DOCUMENTATION.md' },
              { name: 'FLAGGING_STATISTICS_TABLE.md', type: 'file', path: basePath + 'data_cleaning_docs/FLAGGING_STATISTICS_TABLE.md' },
              { name: 'FLAGGING_APPROACH_EXPLANATION.md', type: 'file', path: basePath + 'data_cleaning_docs/FLAGGING_APPROACH_EXPLANATION.md' },
              { name: 'CLEANING_EXECUTION_SUMMARY.md', type: 'file', path: basePath + 'data_cleaning_docs/CLEANING_EXECUTION_SUMMARY.md' },
              { name: 'CLEANING_SCRIPT_README.md', type: 'file', path: basePath + 'data_cleaning_docs/CLEANING_SCRIPT_README.md' },
              { name: 'DATA_CLEANING_DETAILED_LOG.txt', type: 'file', path: basePath + 'data_cleaning_docs/DATA_CLEANING_DETAILED_LOG.txt' }
            ]
          },
          {
            name: 'tables',
            type: 'folder',
            children: [
              { name: 'final_selected_variables_CLEAN.csv', type: 'file', path: basePath + 'tables/final_selected_variables_CLEAN.csv' },
              { name: 'model_comparison_CLEAN_variables.csv', type: 'file', path: basePath + 'tables/model_comparison_CLEAN_variables.csv' },
              { name: 'all_tables.md', type: 'file', path: basePath + 'tables/all_tables.md' }
            ]
          },
          {
            name: 'Scripts',
            type: 'folder',
            children: [
              { name: 'README.md', type: 'file', path: basePath + 'README.md' },
              { name: 'TIMELINE_DATA.json', type: 'file', path: basePath + 'TIMELINE_DATA.json' }
            ]
          },
          {
            name: 'figures',
            type: 'folder',
            children: [] // Will be populated dynamically
          }
        ]
      },
      {
        name: 'site',
        type: 'folder',
        children: [
          { name: 'index.html', type: 'file', path: 'index.html' },
          { name: 'paper_progression.html', type: 'file', path: 'paper_progression.html' },
          { name: 'figures_portfolio.html', type: 'file', path: 'figures_portfolio.html' },
          { name: 'tables_portfolio.html', type: 'file', path: 'tables_portfolio.html' },
          { name: 'research_hub.html', type: 'file', path: 'research_hub.html' }
        ]
      },
      {
        name: '01_documents',
        type: 'folder',
        children: [
          {
            name: 'existing_work',
            type: 'folder',
            children: [
              { name: 'PHEV_draft_2.0.txt', type: 'file', path: rootPath + '01_documents/existing_work/PHEV_draft_2.0.txt' },
              { name: 'PHEV_draft_2.0_docx.txt', type: 'file', path: rootPath + '01_documents/existing_work/PHEV_draft_2.0_docx.txt' }
            ]
          },
          {
            name: 'literature',
            type: 'folder',
            children: [
              { name: 'TNO-2025-R10815.txt', type: 'file', path: rootPath + '01_documents/literature/TNO-2025-R10815.txt' }
            ]
          }
        ]
      },
          {
            name: '02_data',
            type: 'folder',
            children: [
              {
                name: 'OBFCM_2021-2023',
                type: 'folder',
                children: [
                  { name: 'Dataset', type: 'folder', children: [] }
                ]
              }
            ]
          },
          {
            name: '03_analysis',
            type: 'folder',
            children: [
              { name: 'R', type: 'folder', children: [] },
              { name: 'notebooks', type: 'folder', children: [] },
              { name: 'python', type: 'folder', children: [] }
            ]
          },
          {
            name: '04_results',
            type: 'folder',
            children: [
              { name: 'figures', type: 'folder', children: [] },
              { name: 'reports', type: 'folder', children: [] },
              { name: 'tables', type: 'folder', children: [] }
            ]
          },
          {
            name: '05_papers',
            type: 'folder',
            children: [
              { name: 'paper_A_energy_EDS', type: 'folder', children: [] },
              { name: 'paper_B_CO2_gap', type: 'folder', children: [] },
              { name: 'paper_C_variable_importance', type: 'folder', children: [] }
            ]
          },
      {
        name: '06_documentation',
        type: 'folder',
        children: [
          { name: 'GLOBAL_LOG.md', type: 'file', path: rootPath + '06_documentation/GLOBAL_LOG.md' },
          { name: 'DOCUMENT_INDEX.md', type: 'file', path: rootPath + '06_documentation/DOCUMENT_INDEX.md' },
          { name: 'FINAL_SUMMARY_AND_ACTION_PLAN.md', type: 'file', path: rootPath + '06_documentation/FINAL_SUMMARY_AND_ACTION_PLAN.md' }
        ]
      },
      {
        name: 'Root Files',
        type: 'folder',
        children: [
          { name: 'README.md', type: 'file', path: rootPath + 'README.md' },
          { name: 'package.json', type: 'file', path: rootPath + 'package.json' }
        ]
      }
    ]
  };
  
  console.log('Generated file structure:', structure);
  return structure;
}

// Create file explorer sidebar HTML if it doesn't exist
function ensureFileExplorerSidebar() {
  let sidebar = document.getElementById('fileExplorerSidebar');
  
  if (!sidebar) {
    console.log('Creating file explorer sidebar...');
    sidebar = document.createElement('div');
    sidebar.id = 'fileExplorerSidebar';
    sidebar.className = 'file-explorer-sidebar';
    sidebar.style.cssText = 'position: fixed; left: 0; top: 0; width: 300px; height: 100vh; z-index: 10000; background: #1e1e1e; transform: translateX(-100%); transition: transform 0.3s;';
    sidebar.innerHTML = `
      <div class="file-explorer-header">
        <h3>📁 EXPLORER</h3>
        <button class="file-explorer-close" onclick="if(typeof window.toggleFileExplorer === 'function') window.toggleFileExplorer();" title="Close (Esc)">×</button>
      </div>
      <div class="file-explorer-search">
        <input type="text" id="fileExplorerSearch" placeholder="Search files..." oninput="if(typeof window.filterFileTree === 'function') window.filterFileTree(this.value);">
      </div>
      <div class="file-explorer-nav">
        <button id="fileExplorerPrev" onclick="if(typeof window.navigateFile === 'function') window.navigateFile('prev');" title="Previous file" disabled>◀ Prev</button>
        <button id="fileExplorerNext" onclick="if(typeof window.navigateFile === 'function') window.navigateFile('next');" title="Next file" disabled>Next ▶</button>
      </div>
      <ul class="file-tree" id="fileTree">
        <!-- File tree will be populated here -->
      </ul>
    `;
    document.body.appendChild(sidebar);
    console.log('File explorer sidebar created:', sidebar);
  }
  
  return sidebar;
}

// Render file tree
function renderFileTree(node, level = 0, isExpanded = false) {
  // Use modern renderer if available
  if (typeof window.renderFileTreeModern === 'function') {
    try {
      return window.renderFileTreeModern(node, level, isExpanded);
    } catch (e) {
      console.warn('Error in renderFileTreeModern, using fallback:', e);
    }
  }
  
  // Fallback renderer
  if (node.type === 'file') {
    const icon = getFileIcon(node.name);
    const safePath = (node.path || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeName = (node.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const indent = level * 16;
    return `<li class="file-tree-item file-tree-file" 
                 onclick="if(typeof window.openFileFromExplorer === 'function') window.openFileFromExplorer('${safePath}', '${safeName}', event);" 
                 title="${safeName}"
                 style="padding-left: ${indent + 20}px;">
          <span class="file-tree-icon">${icon}</span>
          <span class="file-tree-name">${safeName}</span>
        </li>`;
  } else {
    const folderId = 'folder-' + node.name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const indent = level * 16;
    const hasChildren = node.children && node.children.length > 0;
    const caretIcon = hasChildren ? (isExpanded ? '▼' : '▶') : '•';
    const folderIcon = getFolderIcon(node.name);
    
    let html = `<li class="file-tree-item file-tree-folder" 
                    onclick="if(typeof window.toggleFolder === 'function') window.toggleFolder('${folderId}');" 
                    style="padding-left: ${indent + 4}px;">
          <span class="file-tree-caret" id="caret-${folderId}">${caretIcon}</span>
          <span class="file-tree-icon">${folderIcon}</span>
          <span class="file-tree-name">${node.name}</span>
        </li>`;
    
    if (hasChildren) {
      html += `<ul class="file-tree-children" id="${folderId}" style="display: ${isExpanded ? 'block' : 'none'}; padding-left: ${indent + 16}px;">`;
      node.children.forEach(child => {
        html += renderFileTree(child, level + 1, false);
      });
      html += '</ul>';
    } else {
      // Empty folder - still create the children container so it can be toggled
      html += `<ul class="file-tree-children" id="${folderId}" style="display: none; padding-left: ${indent + 16}px;">
        <li style="padding: 0.5rem 1rem; color: var(--text-secondary, #858585); font-style: italic; font-size: 0.85rem;">(empty)</li>
      </ul>`;
    }
    return html;
  }
}

function getFileIcon(fileName) {
  // Check if there's a different getFileIconModern function (from MODERN_FILE_EXPLORER.js)
  // but avoid infinite recursion
  if (typeof window.getFileIconModern === 'function') {
    try {
      return window.getFileIconModern(fileName);
    } catch (e) {
      console.warn('Error calling window.getFileIconModern, using fallback:', e);
    }
  }
  
  const ext = fileName.split('.').pop().toLowerCase();
  const icons = {
    'md': '📝', 'log': '📋', 'txt': '📄', 'csv': '📊', 'json': '📋',
    'html': '🌐', 'docx': '📄', 'png': '🖼️', 'jpg': '🖼️', 'pdf': '📕', 'r': '📊',
    'py': '🐍', 'js': '📜', 'css': '🎨', 'sh': '⚙️'
  };
  return icons[ext] || '📄';
}

function getFolderIcon(folderName) {
  // Check if there's a different getFolderIcon function (from MODERN_FILE_EXPLORER.js)
  // but avoid infinite recursion by checking if it's a different function
  if (typeof window.getFolderIcon === 'function' && window.getFolderIcon !== getFolderIcon) {
    try {
      return window.getFolderIcon(folderName);
    } catch (e) {
      console.warn('Error calling window.getFolderIcon, using fallback:', e);
    }
  }
  
  const folderMap = {
    'docs': '📚', 
    'logs': '📋', 
    'data_cleaning_docs': '🧹',
    'tables': '📊', 
    'figures': '🖼️', 
    'paper_a_analysis': '📁',
    'site': '🌐', 
    '01_documents': '📄',
    '02_data': '💾',
    '03_analysis': '🔬',
    '04_results': '📈',
    '05_papers': '📑',
    '06_documentation': '📖',
    'existing_work': '📝',
    'literature': '📚',
    'notebooks': '📓',
    'python': '🐍',
    'R': '📊',
    'reports': '📋',
    'OBFCM_2021-2023': '📦',
    'Dataset': '🗂️',
    'Root Files': '📄',
    'MARKOS PROJECT': '📁'
  };
  return folderMap[folderName] || '📁';
}

function flattenFileTree(node, path = '', result = []) {
  if (node.type === 'file') {
    result.push({ ...node, fullPath: path + '/' + node.name });
  } else if (node.children) {
    node.children.forEach(child => {
      flattenFileTree(child, path + '/' + node.name, result);
    });
  }
  return result;
}

async function buildFileTree() {
  const treeContainer = document.getElementById('fileTree');
  if (!treeContainer) {
    console.error('fileTree container not found');
    return;
  }
  
  // Show loading state
  treeContainer.innerHTML = '<li style="padding: 1rem; color: #ccc;">Loading files...</li>';
  
  console.log('Building file tree...');
  
  let fileSystemStructure;
  try {
    if (typeof getFileSystemStructureAsync === 'function') {
      fileSystemStructure = await getFileSystemStructureAsync();
    } else {
      fileSystemStructure = getFileSystemStructure();
    }
  } catch (error) {
    console.error('Error getting file structure:', error);
    fileSystemStructure = getFileSystemStructure(); // Fallback to hardcoded
  }
  
  console.log('File system structure:', fileSystemStructure);
  
  if (!fileSystemStructure) {
    treeContainer.innerHTML = '<li style="padding: 1rem; color: #ff6b6b;">⚠️ Failed to load file structure</li>';
    return;
  }
  
  fileTreeData = flattenFileTree(fileSystemStructure);
  console.log('Flattened file tree data:', fileTreeData.length, 'items');
  
  // Render the tree, starting with root expanded
  const treeHTML = renderFileTree(fileSystemStructure, 0, true);
  console.log('Rendered tree HTML length:', treeHTML.length);
  
  treeContainer.innerHTML = treeHTML;
  
  // Expand root folder by default
  const rootFolder = treeContainer.querySelector('.file-tree-folder');
  if (rootFolder) {
    const rootFolderId = rootFolder.querySelector('.file-tree-caret')?.id?.replace('caret-', '');
    if (rootFolderId) {
      const rootChildren = document.getElementById(rootFolderId);
      if (rootChildren) {
        rootChildren.classList.add('open');
        rootChildren.style.display = 'block';
        const caret = document.getElementById('caret-' + rootFolderId);
        if (caret) {
          caret.textContent = '▼';
        }
      }
    }
  }
  
  // Verify files were added
  const items = treeContainer.querySelectorAll('.file-tree-item');
  console.log('File tree items created:', items.length);
  
  if (items.length === 0) {
    console.error('No file tree items were created!');
    treeContainer.innerHTML = '<li style="padding: 1rem; color: #ff6b6b;">⚠️ No files found. Check console for errors.</li>';
  } else {
    console.log('✅ File tree built successfully with', items.length, 'items');
  }
}

function toggleFileExplorer() {
  console.log('toggleFileExplorer called');
  const sidebar = ensureFileExplorerSidebar();
  const body = document.body;
  
  if (!sidebar) {
    console.error('Failed to create file explorer sidebar');
    return;
  }
  
  // Ensure styles are loaded first
  if (typeof window.addModernFileExplorerStyles === 'function') {
    window.addModernFileExplorerStyles();
  } else if (typeof addModernFileExplorerStyles === 'function') {
    addModernFileExplorerStyles();
  }
  
  console.log('Sidebar found, toggling...', sidebar);
  const isOpen = sidebar.classList.contains('open');
  
  if (isOpen) {
    // Close
    sidebar.classList.remove('open');
    sidebar.style.transform = 'translateX(-100%)';
    body.classList.remove('sidebar-open');
  } else {
    // Open
    sidebar.classList.add('open');
    sidebar.style.transform = 'translateX(0)';
    body.classList.add('sidebar-open');
    
    // Load file tree on first open
    if (fileTreeData.length === 0) {
      console.log('Building file tree...');
      buildFileTree();
    }
  }
  
  console.log('Sidebar classes:', sidebar.className);
  console.log('Sidebar transform:', sidebar.style.transform);
  console.log('Body classes:', body.className);
}

function toggleFolder(folderId) {
  if (typeof window.toggleFolderModern === 'function') {
    window.toggleFolderModern(folderId);
    return;
  }
  
  const folder = document.getElementById(folderId);
  const caret = document.getElementById('caret-' + folderId);
  const folderItem = caret ? caret.closest('.file-tree-folder') : null;
  
  if (!folder) {
    console.warn('Folder not found:', folderId);
    return;
  }
  
  const isOpen = folder.classList.contains('open') || folder.style.display === 'block';
  
  if (isOpen) {
    // Close
    folder.classList.remove('open');
    folder.style.display = 'none';
    if (caret) {
      caret.classList.remove('open');
      caret.textContent = '▶';
    }
    if (folderItem) {
      folderItem.classList.remove('open');
    }
  } else {
    // Open
    folder.classList.add('open');
    folder.style.display = 'block';
    if (caret) {
      caret.classList.add('open');
      caret.textContent = '▼';
    }
    if (folderItem) {
      folderItem.classList.add('open');
    }
  }
  
  console.log('Toggled folder:', folderId, 'isOpen:', !isOpen);
}

function openFileFromExplorer(filePath, fileName, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Find the folder containing this file
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
  
  // Normalize path for localhost
  let normalizedPath = filePath;
  if (typeof window.getLocalPath === 'function') {
    normalizedPath = window.getLocalPath(filePath);
  } else if (filePath && !filePath.startsWith('http') && !filePath.startsWith('//') && !filePath.startsWith('/')) {
    // If path is relative and doesn't start with ../, make it relative to site
    if (!filePath.startsWith('../')) {
      normalizedPath = '../' + filePath;
    }
  }
  
  console.log('Opening file:', { original: filePath, normalized: normalizedPath, fileName });
  
  // Open file (use existing openFile function if available)
  if (typeof window.openFile === 'function') {
    window.openFile(normalizedPath, event);
  } else if (typeof window.showFilePreview === 'function') {
    window.showFilePreview(normalizedPath, fileName);
  } else {
    // Fallback: try to open directly
    try {
      window.open(normalizedPath, '_blank');
    } catch (e) {
      console.error('Failed to open file:', e);
      alert('Could not open file: ' + fileName + '\nPath: ' + normalizedPath);
    }
  }
  
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
    if (typeof window.ModalSystem !== 'undefined') {
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
        parent.style.display = 'block';
        const folderId = parent.id;
        const caret = document.getElementById('caret-' + folderId);
        if (caret) {
          caret.classList.add('open');
          caret.textContent = '▼';
        }
        parent = parent.parentElement;
      }
    } else {
      item.style.display = 'none';
    }
  });
}

// Initialize for homepage (same as toggleFileExplorer but with explicit name)
function initFileExplorerForHomepage() {
  toggleFileExplorer();
}

// Make all functions globally accessible
// Note: Don't export getFolderIcon/getFileIcon to window to avoid recursion
// They're used internally and can call window.getFolderIcon/getFileIconModern if available
window.toggleFileExplorer = toggleFileExplorer;
window.initFileExplorerForHomepage = initFileExplorerForHomepage;
window.toggleFolder = toggleFolder;
window.openFileFromExplorer = openFileFromExplorer;
window.navigateFile = navigateFile;
window.filterFileTree = filterFileTree;
window.buildFileTree = buildFileTree;
window.getFileSystemStructure = getFileSystemStructure;
window.getFileSystemStructureAsync = getFileSystemStructureAsync;
// Don't export getFolderIcon/getFileIcon to avoid recursion issues

// Keyboard shortcut: Ctrl+B or Cmd+B
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    toggleFileExplorer();
  }
});

// Initialize on page load
(function() {
  function init() {
    console.log('UNIVERSAL_FILE_EXPLORER: Initializing...');
    // Ensure styles are loaded
    if (typeof addModernFileExplorerStyles === 'function') {
      console.log('UNIVERSAL_FILE_EXPLORER: Adding modern styles...');
      addModernFileExplorerStyles();
    } else {
      console.warn('UNIVERSAL_FILE_EXPLORER: addModernFileExplorerStyles not found');
    }
    
    // Make sure functions are available
    console.log('UNIVERSAL_FILE_EXPLORER: Functions available:', {
      toggleFileExplorer: typeof window.toggleFileExplorer,
      initFileExplorerForHomepage: typeof window.initFileExplorerForHomepage
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

