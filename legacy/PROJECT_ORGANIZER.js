// ============================================
// PROJECT ORGANIZER SYSTEM
// ============================================

// Project data structure
let projects = [];
let currentViewMode = 'list'; // 'list', 'icons', 'folders', 'grid'
let currentProject = null;
let currentFolder = null;

// Initialize projects from localStorage
function loadProjects() {
  const saved = localStorage.getItem('projects');
  if (saved) {
    projects = JSON.parse(saved);
  } else {
    // Default project: Paper A
    projects = [{
      id: 'paper-a',
      name: 'Paper A: PHEV Research',
      description: 'Energy consumption and EDS analysis',
      icon: '📄',
      color: '#0f4c81',
      createdAt: new Date().toISOString(),
      folders: [
        {
          id: 'paper-a-docs',
          name: 'Documents',
          type: 'folder',
          items: [
            { id: 'paper-a-draft', name: 'Paper Drafts', type: 'link', url: 'paper_progression.html', icon: '📝' },
            { id: 'paper-a-figures', name: 'Figures Portfolio', type: 'link', url: 'figures_portfolio.html', icon: '📊' },
            { id: 'paper-a-tables', name: 'Tables Portfolio', type: 'link', url: 'tables_portfolio.html', icon: '📋' }
          ]
        },
        {
          id: 'paper-a-analysis',
          name: 'Analysis',
          type: 'folder',
          items: [
            { id: 'paper-a-scripts', name: 'R Scripts', type: 'link', url: 'paper_progression.html#status', icon: '📜' },
            { id: 'paper-a-data', name: 'Data Files', type: 'link', url: 'paper_progression.html#dashboard', icon: '💾' }
          ]
        }
      ],
      images: [],
      links: [],
      tags: ['research', 'phev', 'energy']
    }];
    saveProjects();
  }
  renderProjects();
}

function saveProjects() {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// View modes
function setViewMode(mode) {
  currentViewMode = mode;
  localStorage.setItem('projectViewMode', mode);
  renderProjects();
}

function loadViewMode() {
  const saved = localStorage.getItem('projectViewMode');
  if (saved) {
    currentViewMode = saved;
  }
}

// Render projects based on current view mode
function renderProjects() {
  const container = document.getElementById('projectsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (currentViewMode === 'list') {
    renderListView(container);
  } else if (currentViewMode === 'icons') {
    renderIconsView(container);
  } else if (currentViewMode === 'folders') {
    renderFoldersView(container);
  } else if (currentViewMode === 'grid') {
    renderGridView(container);
  }
}

function renderListView(container) {
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-item project-item-list';
    projectEl.innerHTML = `
      <div class="project-item-header" onclick="openProject('${project.id}')">
        <div class="project-icon" style="background: ${project.color || '#0f4c81'}20; color: ${project.color || '#0f4c81'}">
          ${project.icon || '📁'}
        </div>
        <div class="project-info">
          <h3>${project.name}</h3>
          <p>${project.description || ''}</p>
          <div class="project-meta">
            <span>${project.folders?.length || 0} folders</span>
            <span>•</span>
            <span>${getProjectItemCount(project)} items</span>
          </div>
        </div>
        <div class="project-actions">
          <button onclick="event.stopPropagation(); editProject('${project.id}')" class="btn-modern btn-modern-ghost" title="Edit">
            ✏️
          </button>
          <button onclick="event.stopPropagation(); deleteProject('${project.id}')" class="btn-modern btn-modern-ghost" title="Delete">
            🗑️
          </button>
        </div>
      </div>
      <div class="project-folders-preview">
        ${renderFoldersPreview(project)}
      </div>
    `;
    container.appendChild(projectEl);
  });
}

function renderIconsView(container) {
  const grid = document.createElement('div');
  grid.className = 'projects-grid';
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-item project-item-icon';
    projectEl.onclick = () => openProject(project.id);
    projectEl.innerHTML = `
      <div class="project-icon-large" style="background: ${project.color || '#0f4c81'}20; color: ${project.color || '#0f4c81'}">
        ${project.icon || '📁'}
      </div>
      <h3>${project.name}</h3>
      <p>${project.description || ''}</p>
      <div class="project-meta">
        <span>${project.folders?.length || 0} folders</span>
      </div>
    `;
    grid.appendChild(projectEl);
  });
  container.appendChild(grid);
}

function renderFoldersView(container) {
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-folder-view';
    projectEl.innerHTML = `
      <div class="project-folder-header" onclick="openProject('${project.id}')">
        <div class="project-icon" style="background: ${project.color || '#0f4c81'}20; color: ${project.color || '#0f4c81'}">
          ${project.icon || '📁'}
        </div>
        <h3>${project.name}</h3>
      </div>
      <div class="project-folder-content">
        ${renderFolderTree(project)}
      </div>
    `;
    container.appendChild(projectEl);
  });
}

function renderGridView(container) {
  const grid = document.createElement('div');
  grid.className = 'projects-grid projects-grid-large';
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-item project-item-grid';
    projectEl.onclick = () => openProject(project.id);
    projectEl.innerHTML = `
      <div class="project-icon-large" style="background: ${project.color || '#0f4c81'}20; color: ${project.color || '#0f4c81'}">
        ${project.icon || '📁'}
      </div>
      <h3>${project.name}</h3>
      <p>${project.description || ''}</p>
      <div class="project-meta">
        <span>${project.folders?.length || 0} folders</span>
        <span>•</span>
        <span>${getProjectItemCount(project)} items</span>
      </div>
    `;
    grid.appendChild(projectEl);
  });
  container.appendChild(grid);
}

function renderFoldersPreview(project) {
  if (!project.folders || project.folders.length === 0) return '<p class="no-folders">No folders yet</p>';
  
  return project.folders.slice(0, 3).map(folder => `
    <div class="folder-preview-item" onclick="event.stopPropagation(); openFolder('${project.id}', '${folder.id}')">
      <span class="folder-icon">📁</span>
      <span>${folder.name}</span>
      <span class="folder-count">${folder.items?.length || 0}</span>
    </div>
  `).join('') + (project.folders.length > 3 ? `<div class="folder-preview-more">+${project.folders.length - 3} more</div>` : '');
}

function renderFolderTree(project) {
  if (!project.folders || project.folders.length === 0) return '<p class="no-folders">No folders yet</p>';
  
  return project.folders.map(folder => `
    <div class="folder-tree-item" onclick="event.stopPropagation(); openFolder('${project.id}', '${folder.id}')">
      <span class="folder-icon">📁</span>
      <span class="folder-name">${folder.name}</span>
      <span class="folder-count">${folder.items?.length || 0} items</span>
    </div>
  `).join('');
}

function getProjectItemCount(project) {
  if (!project.folders) return 0;
  return project.folders.reduce((count, folder) => count + (folder.items?.length || 0), 0);
}

// Project operations
function createProject() {
  const name = prompt('Project name:');
  if (!name) return;
  
  const project = {
    id: 'project-' + Date.now(),
    name: name,
    description: '',
    icon: '📁',
    color: '#0f4c81',
    createdAt: new Date().toISOString(),
    folders: [],
    images: [],
    links: [],
    tags: []
  };
  
  projects.push(project);
  saveProjects();
  renderProjects();
}

function editProject(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  showProjectEditor(project);
}

function deleteProject(projectId) {
  if (!confirm('Delete this project?')) return;
  
  projects = projects.filter(p => p.id !== projectId);
  saveProjects();
  renderProjects();
}

function openProject(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  currentProject = project;
  showProjectView(project);
}

function openFolder(projectId, folderId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  const folder = project.folders?.find(f => f.id === folderId);
  if (!folder) return;
  
  currentProject = project;
  currentFolder = folder;
  showFolderView(project, folder);
}

function showProjectView(project) {
  // Remove any existing modals first
  document.querySelectorAll('.project-view-modal, .folder-view-modal, .ai-layout-modal').forEach(m => m.remove());
  
  const modal = document.createElement('div');
  modal.className = 'project-view-modal about-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 900px; max-height: 90vh;">
      <div class="about-modal-header">
        <h3>${project.icon || '📁'} ${project.name}</h3>
        <span class="about-modal-close" onclick="this.closest('.project-view-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body" style="overflow-y: auto;">
        <div class="project-view-tabs">
          <button class="project-tab active" onclick="switchProjectTab('folders')">📁 Folders</button>
          <button class="project-tab" onclick="switchProjectTab('images')">🖼️ Images</button>
          <button class="project-tab" onclick="switchProjectTab('links')">🔗 Links</button>
          <button class="project-tab" onclick="switchProjectTab('settings')">⚙️ Settings</button>
        </div>
        <div id="projectTabContent" class="project-tab-content">
          ${renderProjectFolders(project)}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Close on Escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    }
  };
}

function renderProjectFolders(project) {
  // Determine portal URL based on project
  // Paper A project opens with its data, others open blank template
  const isPaperA = project.id === 'paper-a';
  const portalUrl = isPaperA 
    ? 'paper_progression.html' 
    : `paper_progression.html?project=${encodeURIComponent(project.id)}`;
  
  const portalButton = `
    <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: var(--border-radius); text-align: center;">
      <h4 style="margin-bottom: 1rem;">Quick Access</h4>
      <a href="${portalUrl}" class="btn-modern btn-modern-primary" style="text-decoration: none; display: inline-block;">
        📄 Open Paper Progression Portal →
      </a>
    </div>
  `;
  
  if (!project.folders || project.folders.length === 0) {
    return `
      <div style="padding: 2rem; text-align: center;">
        <p>No folders yet. <button onclick="addFolderToProject('${project.id}')" class="btn-modern btn-modern-primary">Create Folder</button></p>
        ${portalButton}
      </div>
    `;
  }
  
  return `
    <div class="project-folders-list">
      ${project.folders.map(folder => `
        <div class="project-folder-card" onclick="openFolder('${project.id}', '${folder.id}')">
          <div class="folder-icon-large">📁</div>
          <h4>${folder.name}</h4>
          <p>${folder.items?.length || 0} items</p>
        </div>
      `).join('')}
      <div class="project-folder-card add-folder" onclick="addFolderToProject('${project.id}')">
        <div class="folder-icon-large">➕</div>
        <h4>Add Folder</h4>
      </div>
    </div>
    ${portalButton}
  `;
}

function addFolderToProject(projectId) {
  const name = prompt('Folder name:');
  if (!name) return;
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  if (!project.folders) project.folders = [];
  
  project.folders.push({
    id: 'folder-' + Date.now(),
    name: name,
    type: 'folder',
    items: []
  });
  
  saveProjects();
  
  // Update modal if open
  const modal = document.querySelector('.project-view-modal');
  if (modal) {
    const content = document.getElementById('projectTabContent');
    if (content) {
      content.innerHTML = renderProjectFolders(project);
    }
  } else {
    renderProjects();
  }
}

function switchProjectTab(tab) {
  const tabs = document.querySelectorAll('.project-tab');
  tabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  const content = document.getElementById('projectTabContent');
  if (!content) return;
  
  const project = currentProject;
  if (!project) return;
  
  if (tab === 'folders') {
    content.innerHTML = renderProjectFolders(project);
  } else if (tab === 'images') {
    content.innerHTML = `<p>Images tab - coming soon</p>`;
  } else if (tab === 'links') {
    content.innerHTML = `<p>Links tab - coming soon</p>`;
  } else if (tab === 'settings') {
    content.innerHTML = renderProjectSettings(project);
  }
}

function renderProjectSettings(project) {
  return `
    <div class="project-settings">
      <div class="settings-field">
        <label>Project Name</label>
        <input type="text" class="input-modern" value="${project.name}" onchange="updateProjectField('${project.id}', 'name', this.value)">
      </div>
      <div class="settings-field">
        <label>Description</label>
        <textarea class="input-modern" onchange="updateProjectField('${project.id}', 'description', this.value)">${project.description || ''}</textarea>
      </div>
      <div class="settings-field">
        <label>Icon</label>
        <input type="text" class="input-modern" value="${project.icon || '📁'}" onchange="updateProjectField('${project.id}', 'icon', this.value)">
      </div>
      <div class="settings-field">
        <label>Color</label>
        <input type="color" class="input-modern" value="${project.color || '#0f4c81'}" onchange="updateProjectField('${project.id}', 'color', this.value)">
      </div>
    </div>
  `;
}

function updateProjectField(projectId, field, value) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  project[field] = value;
  saveProjects();
  renderProjects();
}

function showFolderView(project, folder) {
  // Remove any existing modals first
  document.querySelectorAll('.project-view-modal, .folder-view-modal, .ai-layout-modal').forEach(m => m.remove());
  
  const modal = document.createElement('div');
  modal.className = 'folder-view-modal about-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 800px;">
      <div class="about-modal-header">
        <h3>📁 ${folder.name}</h3>
        <span class="about-modal-close" onclick="this.closest('.folder-view-modal').remove()">×</span>
      </div>
      <div class="about-modal-body" style="overflow-y: auto; max-height: 70vh;">
        <div class="folder-items">
          ${folder.items && folder.items.length > 0 
            ? folder.items.map(item => `
                <div class="folder-item" onclick="${item.type === 'link' ? `window.location.href='${item.url}'` : 'void(0)'}">
                  <span class="item-icon">${item.icon || '📄'}</span>
                  <span class="item-name">${item.name}</span>
                  ${item.type === 'link' ? '<span class="item-arrow">→</span>' : ''}
                </div>
              `).join('')
            : '<p>No items in this folder</p>'
          }
        </div>
        <div style="margin-top: 1rem;">
          <button onclick="addItemToFolder('${project.id}', '${folder.id}')" class="btn-modern btn-modern-primary">Add Item</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function addItemToFolder(projectId, folderId) {
  const name = prompt('Item name:');
  if (!name) return;
  
  const url = prompt('URL or path:');
  if (!url) return;
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  const folder = project.folders?.find(f => f.id === folderId);
  if (!folder) return;
  
  if (!folder.items) folder.items = [];
  
  folder.items.push({
    id: 'item-' + Date.now(),
    name: name,
    type: 'link',
    url: url,
    icon: '🔗'
  });
  
  saveProjects();
  
  // Update modal
  const modal = document.querySelector('.folder-view-modal');
  if (modal) {
    modal.remove();
    showFolderView(project, folder);
  }
}

// AI Layout Selection
function showAILayoutSelection() {
  // Remove any existing modals first
  document.querySelectorAll('.project-view-modal, .folder-view-modal, .ai-layout-modal').forEach(m => m.remove());
  
  const modal = document.createElement('div');
  modal.className = 'ai-layout-modal about-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 600px;">
      <div class="about-modal-header">
        <h3>🤖 AI Layout & Theme Selection</h3>
        <span class="about-modal-close" onclick="this.closest('.ai-layout-modal').remove()">×</span>
      </div>
      <div class="about-modal-body">
        <p>AI will analyze your projects and suggest the best layout and theme.</p>
        <button onclick="applyAILayout()" class="btn-modern btn-modern-primary" style="width: 100%; margin-top: 1rem;">
          🤖 Let AI Choose Best Layout
        </button>
        <div id="aiLayoutResult" style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; display: none;">
          <h4>AI Recommendation:</h4>
          <p id="aiLayoutText"></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function applyAILayout() {
  // Simple AI logic - in production, this would call an AI API
  const projectCount = projects.length;
  let recommendation = '';
  let viewMode = 'list';
  
  if (projectCount <= 3) {
    recommendation = 'Icons view works best for a few projects. It provides a clean, visual overview.';
    viewMode = 'icons';
  } else if (projectCount <= 10) {
    recommendation = 'List view is optimal for medium-sized project collections. It shows more details.';
    viewMode = 'list';
  } else {
    recommendation = 'Grid view is best for many projects. It maximizes space efficiency.';
    viewMode = 'grid';
  }
  
  setViewMode(viewMode);
  
  const resultDiv = document.getElementById('aiLayoutResult');
  const textDiv = document.getElementById('aiLayoutText');
  if (resultDiv && textDiv) {
    textDiv.textContent = recommendation;
    resultDiv.style.display = 'block';
  }
  
  setTimeout(() => {
    const modalEl = document.querySelector('.ai-layout-modal');
    if (modalEl) {
      modalEl.classList.remove('show');
      setTimeout(() => modalEl.remove(), 200);
    }
  }, 2000);
}

// Make functions globally accessible
window.loadProjects = loadProjects;
window.saveProjects = saveProjects;
window.setViewMode = setViewMode;
window.createProject = createProject;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.openProject = openProject;
window.openFolder = openFolder;
window.addFolderToProject = addFolderToProject;
window.addItemToFolder = addItemToFolder;
window.switchProjectTab = switchProjectTab;
window.updateProjectField = updateProjectField;
window.showAILayoutSelection = showAILayoutSelection;
window.applyAILayout = applyAILayout;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadViewMode();
    if (document.getElementById('projectsContainer')) {
      loadProjects();
    }
  });
} else {
  loadViewMode();
  if (document.getElementById('projectsContainer')) {
    loadProjects();
  }
}







