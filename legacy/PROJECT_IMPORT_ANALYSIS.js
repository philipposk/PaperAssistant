// ============================================
// PROJECT IMPORT & ANALYSIS SYSTEM
// Scans imported projects, documents them, and proposes continuations
// ============================================

// ============================================
// 1. PROJECT IMPORT
// ============================================

let importedProjects = [];
// Avoid clashing with currentProject from PROJECT_ORGANIZER.js
let currentImportedProject = null;

function showProjectImportModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 800px; background: var(--bg-secondary); color: var(--text-primary);">
      <div class="about-modal-header" style="border-bottom: 1px solid var(--border-color);">
        <h3 style="color: var(--text-primary);">Import Project</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()" style="color: var(--text-primary);">&times;</span>
      </div>
      <div class="about-modal-body" style="color: var(--text-primary); padding: 2rem;">
        <p>Import an existing project by selecting a folder or uploading files.</p>
        
        <div style="margin-top: 2rem;">
          <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Import Options:</h4>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button onclick="importProjectFromFolder()" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem;">
              <span style="font-size: 1.5rem;">📁</span>
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                <span style="font-weight: 600;">Select Folder</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal;">Choose a folder from your computer</span>
              </div>
            </button>
            
            <button onclick="importProjectFromFiles()" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem;">
              <span style="font-size: 1.5rem;">📄</span>
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                <span style="font-weight: 600;">Upload Files</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal;">Select multiple files to import</span>
              </div>
            </button>
            
            <button onclick="importProjectFromGitHub()" class="btn-modern btn-modern-secondary" style="justify-content: flex-start; padding: 1.25rem 1.5rem;">
              <span style="font-size: 1.5rem;">🔗</span>
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                <span style="font-weight: 600;">Import from GitHub</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal;">Connect to a GitHub repository</span>
              </div>
            </button>
          </div>
        </div>
        
        <div id="importProgress" style="margin-top: 2rem; display: none;">
          <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
            <p id="importStatus" style="color: var(--text-primary);">Scanning project...</p>
            <div style="background: var(--bg-secondary); height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
              <div id="importProgressBar" style="background: var(--accent); height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
          </div>
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

// ============================================
// 2. FOLDER IMPORT
// ============================================

async function importProjectFromFolder() {
  if (!window.showDirectoryPicker) {
    alert('Folder selection is not supported in your browser. Please use the "Upload Files" option instead.');
    return;
  }
  
  try {
    const dirHandle = await window.showDirectoryPicker();
    const progressDiv = document.getElementById('importProgress');
    const statusDiv = document.getElementById('importStatus');
    const progressBar = document.getElementById('importProgressBar');
    
    if (progressDiv) progressDiv.style.display = 'block';
    if (statusDiv) statusDiv.textContent = 'Scanning folder structure...';
    if (progressBar) progressBar.style.width = '10%';
    
    // Scan directory
    const projectStructure = await scanDirectory(dirHandle);
    if (progressBar) progressBar.style.width = '40%';
    if (statusDiv) statusDiv.textContent = 'Analyzing files...';
    
    // Analyze project
    const analysis = await analyzeProject(projectStructure);
    if (progressBar) progressBar.style.width = '70%';
    if (statusDiv) statusDiv.textContent = 'Documenting project...';
    
    // Document project
    const documentation = await documentProject(analysis);
    if (progressBar) progressBar.style.width = '90%';
    if (statusDiv) statusDiv.textContent = 'Generating proposals...';
    
    // Generate continuation proposals
    const proposals = await generateContinuationProposals(analysis, documentation);
    if (progressBar) progressBar.style.width = '100%';
    if (statusDiv) statusDiv.textContent = 'Project imported successfully!';
    
    // Create project object
    const project = {
      id: Date.now(),
      name: dirHandle.name || 'Imported Project',
      structure: projectStructure,
      analysis: analysis,
      documentation: documentation,
      proposals: proposals,
      importedAt: new Date().toISOString(),
      dirHandle: dirHandle // Keep reference for future access
    };
    
    importedProjects.push(project);
    currentImportedProject = project;
    
    // Save to IndexedDB
    await saveImportedProject(project);
    
    // Show analysis results
    setTimeout(() => {
      showProjectAnalysis(project);
    }, 500);
    
  } catch (error) {
    console.error('Error importing project:', error);
    alert('Error importing project: ' + error.message);
  }
}

async function scanDirectory(dirHandle, path = '') {
  const structure = {
    name: dirHandle.name,
    path: path,
    type: 'directory',
    children: [],
    files: []
  };
  
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      const subDir = await scanDirectory(entry, path + '/' + entry.name);
      structure.children.push(subDir);
    } else {
      const file = await entry.getFile();
      structure.files.push({
        name: entry.name,
        path: path + '/' + entry.name,
        type: getFileType(entry.name),
        size: file.size,
        lastModified: file.lastModified
      });
    }
  }
  
  return structure;
}

function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'md': 'markdown',
    'txt': 'text',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'r': 'r',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'docx': 'word',
    'doc': 'word',
    'pdf': 'pdf',
    'tex': 'latex',
    'csv': 'csv',
    'xlsx': 'excel',
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'gif': 'image',
    'svg': 'image'
  };
  return types[ext] || 'unknown';
}

// ============================================
// 3. FILE UPLOAD IMPORT
// ============================================

async function importProjectFromFiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.webkitdirectory = true; // Allow directory selection
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    const progressDiv = document.getElementById('importProgress');
    const statusDiv = document.getElementById('importStatus');
    const progressBar = document.getElementById('importProgressBar');
    
    if (progressDiv) progressDiv.style.display = 'block';
    if (statusDiv) statusDiv.textContent = 'Processing files...';
    
    // Build structure from files
    const projectStructure = buildStructureFromFiles(files);
    if (progressBar) progressBar.style.width = '40%';
    if (statusDiv) statusDiv.textContent = 'Analyzing files...';
    
    // Analyze project
    const analysis = await analyzeProject(projectStructure);
    if (progressBar) progressBar.style.width = '70%';
    if (statusDiv) statusDiv.textContent = 'Documenting project...';
    
    // Document project
    const documentation = await documentProject(analysis);
    if (progressBar) progressBar.style.width = '90%';
    if (statusDiv) statusDiv.textContent = 'Generating proposals...';
    
    // Generate continuation proposals
    const proposals = await generateContinuationProposals(analysis, documentation);
    if (progressBar) progressBar.style.width = '100%';
    if (statusDiv) statusDiv.textContent = 'Project imported successfully!';
    
    // Create project object
    const project = {
      id: Date.now(),
      name: 'Imported Project',
      structure: projectStructure,
      analysis: analysis,
      documentation: documentation,
      proposals: proposals,
      importedAt: new Date().toISOString(),
      files: files // Store file references
    };
    
    importedProjects.push(project);
    currentImportedProject = project;
    
    // Save to IndexedDB
    await saveImportedProject(project);
    
    // Show analysis results
    setTimeout(() => {
      showProjectAnalysis(project);
    }, 500);
  };
  
  input.click();
}

function buildStructureFromFiles(files) {
  const structure = {
    name: 'Root',
    path: '',
    type: 'directory',
    children: [],
    files: []
  };
  
  const pathMap = {};
  
  files.forEach(file => {
    const pathParts = file.webkitRelativePath.split('/');
    let current = structure;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current.children.find(c => c.name === part)) {
        const dir = {
          name: part,
          path: pathParts.slice(0, i + 1).join('/'),
          type: 'directory',
          children: [],
          files: []
        };
        current.children.push(dir);
        current = dir;
      } else {
        current = current.children.find(c => c.name === part);
      }
    }
    
    current.files.push({
      name: pathParts[pathParts.length - 1],
      path: file.webkitRelativePath,
      type: getFileType(file.name),
      size: file.size,
      lastModified: file.lastModified,
      file: file // Store file reference
    });
  });
  
  return structure;
}

// ============================================
// 4. GITHUB IMPORT
// ============================================

async function importProjectFromGitHub() {
  const repoUrl = prompt('Enter GitHub repository URL:');
  if (!repoUrl) return;
  
  // Extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    alert('Invalid GitHub URL');
    return;
  }
  
  const [, owner, repo] = match;
  const progressDiv = document.getElementById('importProgress');
  const statusDiv = document.getElementById('importStatus');
  const progressBar = document.getElementById('importProgressBar');
  
  if (progressDiv) progressDiv.style.display = 'block';
  if (statusDiv) statusDiv.textContent = 'Fetching from GitHub...';
  
  try {
    // Fetch repository contents (using GitHub API)
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
    const contents = await response.json();
    
    if (progressBar) progressBar.style.width = '30%';
    if (statusDiv) statusDiv.textContent = 'Processing repository...';
    
    // Build structure from GitHub contents
    const projectStructure = await buildStructureFromGitHub(contents, owner, repo);
    if (progressBar) progressBar.style.width = '50%';
    if (statusDiv) statusDiv.textContent = 'Analyzing files...';
    
    // Analyze project
    const analysis = await analyzeProject(projectStructure);
    if (progressBar) progressBar.style.width = '70%';
    if (statusDiv) statusDiv.textContent = 'Documenting project...';
    
    // Document project
    const documentation = await documentProject(analysis);
    if (progressBar) progressBar.style.width = '90%';
    if (statusDiv) statusDiv.textContent = 'Generating proposals...';
    
    // Generate continuation proposals
    const proposals = await generateContinuationProposals(analysis, documentation);
    if (progressBar) progressBar.style.width = '100%';
    if (statusDiv) statusDiv.textContent = 'Project imported successfully!';
    
    // Create project object
    const project = {
      id: Date.now(),
      name: repo,
      structure: projectStructure,
      analysis: analysis,
      documentation: documentation,
      proposals: proposals,
      importedAt: new Date().toISOString(),
      githubUrl: repoUrl
    };
    
    importedProjects.push(project);
    currentImportedProject = project;
    
    // Save to IndexedDB
    await saveImportedProject(project);
    
    // Show analysis results
    setTimeout(() => {
      showProjectAnalysis(project);
    }, 500);
    
  } catch (error) {
    console.error('Error importing from GitHub:', error);
    alert('Error importing from GitHub: ' + error.message);
  }
}

async function buildStructureFromGitHub(contents, owner, repo, path = '') {
  const structure = {
    name: path || repo,
    path: path,
    type: 'directory',
    children: [],
    files: []
  };
  
  for (const item of contents) {
    if (item.type === 'dir') {
      const dirContents = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`).then(r => r.json());
      const subDir = await buildStructureFromGitHub(dirContents, owner, repo, item.path);
      structure.children.push(subDir);
    } else {
      structure.files.push({
        name: item.name,
        path: item.path,
        type: getFileType(item.name),
        size: item.size,
        url: item.download_url,
        sha: item.sha
      });
    }
  }
  
  return structure;
}

// ============================================
// 5. PROJECT ANALYSIS
// ============================================

async function analyzeProject(structure) {
  const analysis = {
    projectType: detectProjectType(structure),
    technologies: detectTechnologies(structure),
    structure: analyzeStructure(structure),
    files: analyzeFiles(structure),
    dependencies: detectDependencies(structure),
    patterns: detectPatterns(structure),
    status: assessProjectStatus(structure)
  };
  
  return analysis;
}

function detectProjectType(structure) {
  const indicators = {
    'research': ['paper', 'analysis', 'data', 'figures', 'tables', '.md', '.R', '.py'],
    'web': ['index.html', 'package.json', 'src/', 'public/', '.js', '.ts', '.jsx', '.tsx'],
    'mobile': ['android/', 'ios/', 'App.js', 'package.json'],
    'data-science': ['.ipynb', 'data/', 'notebooks/', '.py', 'requirements.txt'],
    'documentation': ['.md', 'docs/', 'README'],
    'code': ['.js', '.py', '.java', '.cpp', '.c']
  };
  
  const allFiles = getAllFiles(structure);
  const fileNames = allFiles.map(f => f.name.toLowerCase()).join(' ');
  const filePaths = allFiles.map(f => f.path.toLowerCase()).join(' ');
  const combined = fileNames + ' ' + filePaths;
  
  const scores = {};
  Object.keys(indicators).forEach(type => {
    scores[type] = indicators[type].filter(indicator => 
      combined.includes(indicator.toLowerCase())
    ).length;
  });
  
  const maxScore = Math.max(...Object.values(scores));
  return Object.keys(scores).find(key => scores[key] === maxScore) || 'unknown';
}

function detectTechnologies(structure) {
  const allFiles = getAllFiles(structure);
  const technologies = new Set();
  
  allFiles.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    const techMap = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'jsx': 'React',
      'tsx': 'React',
      'py': 'Python',
      'r': 'R',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'html': 'HTML',
      'css': 'CSS',
      'md': 'Markdown',
      'tex': 'LaTeX',
      'docx': 'Word',
      'json': 'JSON',
      'xml': 'XML'
    };
    if (techMap[ext]) technologies.add(techMap[ext]);
  });
  
  // Check for specific files
  if (allFiles.find(f => f.name === 'package.json')) technologies.add('Node.js');
  if (allFiles.find(f => f.name === 'requirements.txt')) technologies.add('Python');
  if (allFiles.find(f => f.name === 'Cargo.toml')) technologies.add('Rust');
  if (allFiles.find(f => f.name === 'pom.xml')) technologies.add('Maven');
  
  return Array.from(technologies);
}

function analyzeStructure(structure) {
  const allFiles = getAllFiles(structure);
  const allDirs = getAllDirectories(structure);
  
  return {
    totalFiles: allFiles.length,
    totalDirectories: allDirs.length,
    maxDepth: getMaxDepth(structure),
    fileTypes: countFileTypes(allFiles),
    largestFiles: getLargestFiles(allFiles, 10)
  };
}

function analyzeFiles(structure) {
  const allFiles = getAllFiles(structure);
  
  return {
    codeFiles: allFiles.filter(f => ['javascript', 'typescript', 'python', 'r', 'html', 'css'].includes(f.type)),
    documentFiles: allFiles.filter(f => ['markdown', 'word', 'latex', 'text'].includes(f.type)),
    dataFiles: allFiles.filter(f => ['csv', 'json', 'excel'].includes(f.type)),
    imageFiles: allFiles.filter(f => f.type === 'image'),
    configFiles: allFiles.filter(f => f.name.match(/^(package|requirements|Cargo|pom|\.gitignore|\.env)/))
  };
}

function detectDependencies(structure) {
  const allFiles = getAllFiles(structure);
  const dependencies = [];
  
  // Check package.json
  const packageJson = allFiles.find(f => f.name === 'package.json');
  if (packageJson && packageJson.file) {
    packageJson.file.text().then(text => {
      try {
        const pkg = JSON.parse(text);
        if (pkg.dependencies) {
          dependencies.push(...Object.keys(pkg.dependencies));
        }
      } catch (e) {}
    });
  }
  
  // Check requirements.txt
  const requirements = allFiles.find(f => f.name === 'requirements.txt');
  if (requirements && requirements.file) {
    requirements.file.text().then(text => {
      dependencies.push(...text.split('\n').filter(l => l.trim() && !l.startsWith('#')));
    });
  }
  
  return dependencies;
}

function detectPatterns(structure) {
  const patterns = [];
  const allFiles = getAllFiles(structure);
  
  // Check for common patterns
  if (allFiles.find(f => f.name === 'README.md')) patterns.push('Has README');
  if (allFiles.find(f => f.name === '.gitignore')) patterns.push('Uses Git');
  if (allFiles.find(f => f.name.match(/test|spec/i))) patterns.push('Has Tests');
  if (allFiles.find(f => f.name === 'Dockerfile')) patterns.push('Uses Docker');
  if (allFiles.find(f => f.name === 'docker-compose.yml')) patterns.push('Uses Docker Compose');
  
  return patterns;
}

function assessProjectStatus(structure) {
  const allFiles = getAllFiles(structure);
  const status = {
    completeness: 'unknown',
    documentation: 'unknown',
    organization: 'unknown'
  };
  
  // Assess completeness
  if (allFiles.length > 100) status.completeness = 'extensive';
  else if (allFiles.length > 20) status.completeness = 'moderate';
  else status.completeness = 'basic';
  
  // Assess documentation
  const docFiles = allFiles.filter(f => f.type === 'markdown' || f.name.match(/README|DOC|GUIDE/i));
  if (docFiles.length > 5) status.documentation = 'well-documented';
  else if (docFiles.length > 0) status.documentation = 'partially-documented';
  else status.documentation = 'undocumented';
  
  // Assess organization
  const maxDepth = getMaxDepth(structure);
  if (maxDepth > 3) status.organization = 'well-organized';
  else if (maxDepth > 1) status.organization = 'moderately-organized';
  else status.organization = 'flat';
  
  return status;
}

// ============================================
// 6. PROJECT DOCUMENTATION
// ============================================

async function documentProject(analysis) {
  const documentation = {
    overview: generateOverview(analysis),
    structure: documentStructure(analysis.structure),
    technologies: documentTechnologies(analysis.technologies),
    files: documentFiles(analysis.files),
    dependencies: documentDependencies(analysis.dependencies),
    patterns: documentPatterns(analysis.patterns),
    status: documentStatus(analysis.status)
  };
  
  return documentation;
}

function generateOverview(analysis) {
  return `
    This is a ${analysis.projectType} project using ${analysis.technologies.join(', ')}.
    It contains ${analysis.structure.totalFiles} files across ${analysis.structure.totalDirectories} directories.
    The project appears to be ${analysis.status.completeness} in scope and ${analysis.status.documentation}.
  `;
}

function documentStructure(structure) {
  return `The project has a ${structure.maxDepth}-level directory structure with ${structure.totalFiles} files.`;
}

function documentTechnologies(technologies) {
  return `Technologies used: ${technologies.join(', ')}.`;
}

function documentFiles(files) {
  return `
    Code files: ${files.codeFiles.length}
    Document files: ${files.documentFiles.length}
    Data files: ${files.dataFiles.length}
    Image files: ${files.imageFiles.length}
    Config files: ${files.configFiles.length}
  `;
}

function documentDependencies(dependencies) {
  if (dependencies.length === 0) return 'No dependencies detected.';
  return `Dependencies: ${dependencies.join(', ')}.`;
}

function documentPatterns(patterns) {
  if (patterns.length === 0) return 'No specific patterns detected.';
  return `Patterns: ${patterns.join(', ')}.`;
}

function documentStatus(status) {
  return `
    Completeness: ${status.completeness}
    Documentation: ${status.documentation}
    Organization: ${status.organization}
  `;
}

// ============================================
// 7. CONTINUATION PROPOSALS
// ============================================

async function generateContinuationProposals(analysis, documentation) {
  const proposals = [];
  
  // Generate proposals based on project type
  if (analysis.projectType === 'research') {
    proposals.push({
      title: 'Continue Analysis',
      description: 'Run additional analyses or extend existing ones.',
      action: 'analyze',
      priority: 'high'
    });
    proposals.push({
      title: 'Update Documentation',
      description: 'Update README and documentation files.',
      action: 'document',
      priority: 'medium'
    });
  } else if (analysis.projectType === 'web') {
    proposals.push({
      title: 'Add Features',
      description: 'Implement new features or improve existing ones.',
      action: 'develop',
      priority: 'high'
    });
    proposals.push({
      title: 'Fix Issues',
      description: 'Address any bugs or issues in the codebase.',
      action: 'fix',
      priority: 'high'
    });
  }
  
  // Add general proposals
  proposals.push({
    title: 'Organize Files',
    description: 'Reorganize project structure for better maintainability.',
    action: 'organize',
    priority: 'medium'
  });
  
  proposals.push({
    title: 'Add Tests',
    description: 'Add unit tests and integration tests.',
    action: 'test',
    priority: 'low'
  });
  
  return proposals;
}

// ============================================
// 8. ANALYSIS DISPLAY
// ============================================

function showProjectAnalysis(project) {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 900px; background: var(--bg-secondary); color: var(--text-primary); max-height: 90vh; overflow-y: auto;">
      <div class="about-modal-header" style="border-bottom: 1px solid var(--border-color);">
        <h3 style="color: var(--text-primary);">Project Analysis: ${project.name}</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()" style="color: var(--text-primary);">&times;</span>
      </div>
      <div class="about-modal-body" style="color: var(--text-primary); padding: 2rem;">
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary);">Overview</h4>
          <p style="color: var(--text-secondary);">${project.documentation.overview}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary);">Technologies</h4>
          <p style="color: var(--text-secondary);">${project.analysis.technologies.join(', ')}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary);">Project Status</h4>
          <p style="color: var(--text-secondary);">${project.documentation.status}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary);">Suggested Next Steps</h4>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
            ${project.proposals.map(p => `
              <div class="card-modern" style="border-left: 4px solid var(--accent);">
                <h5 style="color: var(--text-primary); margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">${p.title}</h5>
                <p style="color: var(--text-secondary); margin: 0 0 1rem 0; line-height: 1.6;">${p.description}</p>
                <button onclick="executeProposal('${p.action}', ${project.id})" class="btn-modern btn-modern-primary" style="font-size: 0.875rem; padding: 0.625rem 1.25rem;">Continue</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-top: 2rem;">
          <button onclick="askUserForDirection(${project.id})" class="btn-modern btn-modern-primary" style="width: 100%; padding: 1rem 1.5rem; font-size: 1rem;">
            <span>💡</span>
            <span>Ask AI for Custom Direction</span>
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

async function askUserForDirection(projectId) {
  const project = importedProjects.find(p => p.id === projectId);
  if (!project) return;
  
  const userQuestion = prompt('What would you like to do with this project? Describe your goals or ask questions:');
  if (!userQuestion) return;
  
  // Use AI to generate response
  if (window.sendChatbotMessage) {
    const context = `
      Project: ${project.name}
      Type: ${project.analysis.projectType}
      Technologies: ${project.analysis.technologies.join(', ')}
      Status: ${JSON.stringify(project.analysis.status)}
      User Question: ${userQuestion}
    `;
    
    // Open chatbot with context
    if (window.openChatbot) {
      window.openChatbot();
      setTimeout(() => {
        const chatInput = document.querySelector('#chatbotInput');
        if (chatInput) {
          chatInput.value = `Based on this project analysis:\n${context}\n\n${userQuestion}`;
        }
      }, 500);
    }
  }
}

function executeProposal(action, projectId) {
  const project = importedProjects.find(p => p.id === projectId);
  if (!project) return;
  
  // Execute based on action type
  switch (action) {
    case 'analyze':
      // Open analysis tools
      alert('Opening analysis tools...');
      break;
    case 'document':
      // Open documentation editor
      alert('Opening documentation editor...');
      break;
    case 'develop':
      // Open code editor
      if (window.showCodeEditor) window.showCodeEditor();
      break;
    case 'fix':
      // Show issues
      alert('Scanning for issues...');
      break;
    case 'organize':
      // Show organization tools
      alert('Opening organization tools...');
      break;
    case 'test':
      // Open test framework
      alert('Opening test framework...');
      break;
  }
}

// ============================================
// 9. HELPER FUNCTIONS
// ============================================

function getAllFiles(structure) {
  let files = [...(structure.files || [])];
  (structure.children || []).forEach(child => {
    files = files.concat(getAllFiles(child));
  });
  return files;
}

function getAllDirectories(structure) {
  let dirs = [structure];
  (structure.children || []).forEach(child => {
    dirs = dirs.concat(getAllDirectories(child));
  });
  return dirs;
}

function getMaxDepth(structure, current = 0) {
  if (!structure.children || structure.children.length === 0) {
    return current;
  }
  return Math.max(...structure.children.map(child => getMaxDepth(child, current + 1)));
}

function countFileTypes(files) {
  const counts = {};
  files.forEach(file => {
    counts[file.type] = (counts[file.type] || 0) + 1;
  });
  return counts;
}

function getLargestFiles(files, count) {
  return files
    .sort((a, b) => b.size - a.size)
    .slice(0, count);
}

// ============================================
// 10. INDEXEDDB STORAGE
// ============================================

async function saveImportedProject(project) {
  try {
    const db = await openProjectIndexedDB();
    const tx = db.transaction(['importedProjects'], 'readwrite');
    await tx.objectStore('importedProjects').put({
      id: project.id,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving imported project:', error);
  }
}

async function loadImportedProjects() {
  try {
    const db = await openProjectIndexedDB();
    const tx = db.transaction(['importedProjects'], 'readonly');
    const request = tx.objectStore('importedProjects').getAll();
    
    request.onsuccess = () => {
      if (request.result) {
        importedProjects = request.result.map(r => r.data);
      }
    };
  } catch (error) {
    console.error('Error loading imported projects:', error);
  }
}

async function openProjectIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ProjectImportDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('importedProjects')) {
        db.createObjectStore('importedProjects', { keyPath: 'id' });
      }
    };
  });
}

// ============================================
// 11. EXPORT FUNCTIONS
// ============================================

window.showProjectImportModal = showProjectImportModal;
window.importProjectFromFolder = importProjectFromFolder;
window.importProjectFromFiles = importProjectFromFiles;
window.importProjectFromGitHub = importProjectFromGitHub;
window.showProjectAnalysis = showProjectAnalysis;
window.askUserForDirection = askUserForDirection;
window.executeProposal = executeProposal;

// Load projects on init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadImportedProjects);
} else {
  loadImportedProjects();
}







