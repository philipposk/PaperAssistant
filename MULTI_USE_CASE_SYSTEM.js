// ============================================
// MULTI-USE CASE SYSTEM
// ============================================

const useCases = {
  research: {
    name: 'Research & Academic',
    icon: '🔬',
    description: 'Academic papers, research projects, data analysis',
    features: ['File management', 'AI assistant', 'Citation manager', 'Methodology tracker'],
    color: '#0f4c81'
  },
  music: {
    name: 'Music Production',
    icon: '🎵',
    description: 'Music projects, compositions, audio production',
    features: ['Audio editor', 'MIDI support', 'AI music generation', 'Project organization'],
    color: '#9b59b6'
  },
  coding: {
    name: 'Software Development',
    icon: '💻',
    description: 'Code projects, software development, programming',
    features: ['Online IDE', 'Code execution', 'Version control', 'AI code assistant'],
    color: '#27ae60'
  },
  writing: {
    name: 'Writing & Content',
    icon: '✍️',
    description: 'Blogs, books, articles, content creation',
    features: ['Rich text editor', 'AI writing assistant', 'Publishing tools', 'SEO analysis'],
    color: '#e67e22'
  },
  design: {
    name: 'Design & Creative',
    icon: '🎨',
    description: 'Graphic design, UI/UX, creative projects',
    features: ['Design tools', 'Asset management', 'AI image generation', 'Prototyping'],
    color: '#e74c3c'
  },
  business: {
    name: 'Business & Management',
    icon: '📊',
    description: 'Business plans, analytics, project management',
    features: ['Analytics dashboard', 'Task management', 'Financial tracking', 'Reports'],
    color: '#3498db'
  }
};

let currentUseCase = localStorage.getItem('currentUseCase') || 'research';
let useCaseCustomizations = JSON.parse(localStorage.getItem('useCaseCustomizations') || '{}');

function showUseCaseSelector() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 900px;">
      <div class="about-modal-header">
        <h3>🎯 Choose Your Use Case</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <p>Select the primary use case for this project. You can change this later.</p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
          ${Object.entries(useCases).map(([id, uc]) => `
            <div onclick="selectUseCase('${id}')" class="grid-card-modern" style="border: 2px solid ${currentUseCase === id ? uc.color : 'var(--border-color)'}; ${currentUseCase === id ? 'box-shadow: var(--shadow-md);' : ''}" onmouseover="this.style.borderColor='${uc.color}'; this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.borderColor='${currentUseCase === id ? uc.color : 'var(--border-color)'}'; this.style.boxShadow='${currentUseCase === id ? 'var(--shadow-md)' : 'var(--shadow-sm)'}'">
              <div class="grid-card-modern-icon" style="color: ${uc.color};">${uc.icon}</div>
              <div class="grid-card-modern-title" style="color: ${uc.color};">${uc.name}</div>
              <div class="grid-card-modern-description" style="margin-bottom: 1rem;">${uc.description}</div>
              <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.8;">
                ${uc.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Add Escape key handler for this modal
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function selectUseCase(useCaseId) {
  currentUseCase = useCaseId;
  localStorage.setItem('currentUseCase', useCaseId);
  localStorage.setItem('useCaseSelected', 'true'); // Mark as selected to prevent auto-show
  applyUseCase(useCaseId);
  document.querySelector('.about-modal')?.remove();
  
  // Redirect to main page
  window.location.href = 'index.html';
}

function applyUseCase(useCaseId) {
  const uc = useCases[useCaseId];
  if (!uc) return;
  
  // Apply use case specific styling
  document.documentElement.style.setProperty('--accent', uc.color);
  
  // Show/hide features based on use case
  updateUIForUseCase(useCaseId);
  
  // Update page title
  document.title = `${uc.name} - PHEV Research Portal`;
}

function updateUIForUseCase(useCaseId) {
  // Hide/show features based on use case
  const researchFeatures = document.querySelectorAll('[data-use-case="research"]');
  const musicFeatures = document.querySelectorAll('[data-use-case="music"]');
  const codingFeatures = document.querySelectorAll('[data-use-case="coding"]');
  
  // Show relevant features, hide others
  // Implementation depends on what features are marked with data-use-case attributes
}

// ============================================
// CODE EXECUTION SYSTEM
// ============================================

let codeExecutionEnvironment = null;

async function initCodeExecution() {
  // Initialize code execution environment
  // For R: Would use WebR or R server
  // For Python: Would use Pyodide or Python server
  // For JavaScript: Native execution
  
  try {
    // Try to load Pyodide for Python
    let pyodideInstance = window.pyodide || (typeof pyodide !== 'undefined' ? pyodide : null);
    
    if (!pyodideInstance) {
      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="pyodide"]');
      if (existingScript) {
        // Wait for it to load
        await new Promise((resolve) => {
          const checkPyodide = setInterval(() => {
            if (window.pyodide || typeof pyodide !== 'undefined') {
              clearInterval(checkPyodide);
              resolve();
            }
          }, 100);
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkPyodide);
            resolve();
          }, 10000);
        });
        pyodideInstance = window.pyodide || (typeof pyodide !== 'undefined' ? pyodide : null);
      } else {
        // Load Pyodide dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        await new Promise((resolve, reject) => {
          script.onload = () => {
            // Wait a bit for pyodide to initialize
            setTimeout(() => {
              pyodideInstance = window.pyodide || (typeof pyodide !== 'undefined' ? pyodide : null);
              resolve();
            }, 1000);
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    }
    
    if (!pyodideInstance) {
      throw new Error('Pyodide failed to load');
    }
    
    codeExecutionEnvironment = {
      python: await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib']),
      r: null, // Would need WebR
      javascript: true
    };
    
    console.log('Code execution environment ready');
  } catch (error) {
    // Silently fail - code execution is optional
    console.log('Code execution environment not available (optional feature):', error.message);
  }
}

async function executeCode(code, language) {
  if (!codeExecutionEnvironment) {
    await initCodeExecution();
  }
  
  switch(language) {
    case 'python':
      return await executePython(code);
    case 'r':
      return await executeR(code);
    case 'javascript':
      return await executeJavaScript(code);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

async function executePython(code) {
  try {
    if (typeof window.pyodide !== 'undefined' || typeof pyodide !== 'undefined') {
      const pyodideInstance = window.pyodide || (typeof pyodide !== 'undefined' ? pyodide : null);
      const result = pyodideInstance.runPython(code);
      return {
        output: String(result),
        error: null,
        plots: [] // Would capture matplotlib plots
      };
    } else {
      // Fallback: Send to backend
      const response = await fetch('/api/execute/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      return await response.json();
    }
  } catch (error) {
    return {
      output: null,
      error: error.message,
      plots: []
    };
  }
}

async function executeR(code) {
  // Would use WebR or R server
  try {
    const response = await fetch('/api/execute/r', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await response.json();
  } catch (error) {
    return {
      output: null,
      error: error.message,
      plots: []
    };
  }
}

function executeJavaScript(code) {
  try {
    const result = eval(code);
    return {
      output: String(result),
      error: null,
      plots: []
    };
  } catch (error) {
    return {
      output: null,
      error: error.message,
      plots: []
    };
  }
}

// ============================================
// ONLINE IDE
// ============================================

function showCodeEditor(filePath, language) {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '3000';
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 95vw; height: 90vh; display: flex; flex-direction: column;">
      <div class="about-modal-header">
        <h3>💻 Code Editor - ${filePath}</h3>
        <div style="display: flex; gap: 0.5rem;">
          <select id="codeLanguage" style="padding: 0.5rem; border: 1px solid var(--bg-primary); border-radius: 4px;">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="r">R</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <button onclick="runCode()" class="btn-modern" style="background: var(--success); color: white;">
            <span>▶️</span>
            <span>Run</span>
          </button>
          <button onclick="saveCode()" class="btn-modern btn-modern-primary">
            <span>💾</span>
            <span>Save</span>
          </button>
          <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
        </div>
      </div>
      <div style="flex: 1; display: flex; gap: 1rem; padding: 1rem;">
        <div style="flex: 1; display: flex; flex-direction: column;">
          <div id="codeEditor" style="flex: 1; border: 2px solid var(--bg-primary); border-radius: 8px; overflow: hidden;"></div>
          <div id="codeOutput" style="height: 200px; background: var(--bg-primary); padding: 1rem; overflow-y: auto; margin-top: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
            <strong>Output:</strong>
            <div id="codeOutputContent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Load Monaco Editor or CodeMirror
  loadCodeEditor('codeEditor', filePath, language);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Add Escape key handler for this modal
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function loadCodeEditor(containerId, filePath, language) {
  // Use CodeMirror (lighter than Monaco)
  const container = document.getElementById(containerId);
  
  // Simple textarea for now (would use CodeMirror in production)
  const textarea = document.createElement('textarea');
  textarea.id = 'codeEditorTextarea';
  textarea.style.cssText = 'width: 100%; height: 100%; padding: 1rem; font-family: monospace; font-size: 14px; border: none; background: var(--bg-secondary); color: var(--text-primary); resize: none;';
  textarea.placeholder = '// Start coding...';
  
  // Load file content
  if (filePath) {
    fetch(filePath)
      .then(r => r.text())
      .then(text => {
        textarea.value = text;
      });
  }
  
  container.appendChild(textarea);
}

async function runCode() {
  const code = document.getElementById('codeEditorTextarea').value;
  const language = document.getElementById('codeLanguage').value;
  const outputDiv = document.getElementById('codeOutputContent');
  
  outputDiv.innerHTML = '<p>Running...</p>';
  
  try {
    const result = await executeCode(code, language);
    
    if (result.error) {
      outputDiv.innerHTML = `<p style="color: var(--error);">Error: ${result.error}</p>`;
    } else {
      outputDiv.innerHTML = `<pre style="margin: 0; white-space: pre-wrap;">${result.output || 'No output'}</pre>`;
    }
    
    if (result.plots && result.plots.length > 0) {
      result.plots.forEach(plot => {
        const img = document.createElement('img');
        img.src = plot;
        img.style.maxWidth = '100%';
        outputDiv.appendChild(img);
      });
    }
  } catch (error) {
    outputDiv.innerHTML = `<p style="color: var(--error);">Error: ${error.message}</p>`;
  }
}

function saveCode() {
  const code = document.getElementById('codeEditorTextarea').value;
  const filePath = document.querySelector('.about-modal-header h3').textContent.split(' - ')[1];
  
  // In production, save to backend
  alert('Code saved! (Backend integration needed for actual file saving)');
  trackEvent('code', 'save', filePath);
}

// ============================================
// AI UI CUSTOMIZATION
// ============================================

function showUICustomizationModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 800px;">
      <div class="about-modal-header">
        <h3>🎨 Customize Your Interface</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <p>Tell the AI how you want your interface customized, or use the options below.</p>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Describe your customization:</label>
          <textarea id="customizationPrompt" rows="3" class="input-modern" style="min-height: 80px;" placeholder="Example: 'Make the sidebar wider, move the search to the top, use a darker theme'"></textarea>
          <button onclick="applyAICustomization()" class="btn-modern btn-modern-primary" style="margin-top: 0.5rem;">
            <span>🤖</span>
            <span>Apply AI Customization</span>
          </button>
        </div>
        
        <hr style="margin: 1.5rem 0;">
        
        <h4>Manual Customization</h4>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Theme Color</label>
            <input type="color" id="themeColor" value="${getComputedStyle(document.documentElement).getPropertyValue('--accent')}" onchange="updateThemeColor(this.value)">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Font Size</label>
            <select id="fontSize" onchange="updateFontSize(this.value)">
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Sidebar Position</label>
            <select id="sidebarPosition" onchange="updateSidebarPosition(this.value)">
              <option value="left" selected>Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Button Size</label>
            <select id="buttonSize" onchange="updateButtonSize(this.value)">
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
        
        <div style="margin-top: 1.5rem;">
          <button onclick="resetCustomization()" class="btn-modern" style="background: var(--error); color: white;">Reset to Default</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Add Escape key handler for this modal
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

async function applyAICustomization() {
  const prompt = document.getElementById('customizationPrompt').value;
  if (!prompt.trim()) {
    alert('Please describe your customization');
    return;
  }
  
  // Use AI to interpret customization request
  const response = await callAIAPI(`Customize the UI based on this request: ${prompt}. Return JSON with CSS variables and layout changes.`, '');
  
  try {
    // Parse AI response and apply
    const customization = JSON.parse(response);
    applyCustomization(customization);
    alert('Customization applied!');
  } catch (error) {
    // If not JSON, try to extract customization from text
    applyCustomizationFromText(response);
  }
}

function applyCustomization(customization) {
  // Apply CSS variables
  if (customization.colors) {
    Object.entries(customization.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
  
  // Apply layout changes
  if (customization.layout) {
    // Update layout based on customization
  }
  
  // Save customization
  localStorage.setItem('uiCustomization', JSON.stringify(customization));
}

function updateThemeColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem('themeColor', color);
}

function updateFontSize(size) {
  const sizes = { small: '0.9rem', medium: '1rem', large: '1.1rem' };
  document.body.style.fontSize = sizes[size];
  localStorage.setItem('fontSize', size);
}

function updateSidebarPosition(position) {
  const sidebar = document.querySelector('.file-explorer-sidebar');
  if (sidebar) {
    sidebar.style.left = position === 'left' ? '0' : 'auto';
    sidebar.style.right = position === 'right' ? '0' : 'auto';
    localStorage.setItem('sidebarPosition', position);
  }
}

function updateButtonSize(size) {
  const sizes = { small: '0.75rem', medium: '1rem', large: '1.25rem' };
  document.querySelectorAll('.about-button').forEach(btn => {
    btn.style.padding = sizes[size];
  });
  localStorage.setItem('buttonSize', size);
}

function resetCustomization() {
  localStorage.removeItem('uiCustomization');
  localStorage.removeItem('themeColor');
  localStorage.removeItem('fontSize');
  localStorage.removeItem('sidebarPosition');
  localStorage.removeItem('buttonSize');
  location.reload();
}

// ============================================
// VOICE/FACE CLONING (Structure)
// ============================================

let voiceCloneModel = null;
let faceCloneModel = null;

async function initVoiceCloning() {
  // In production, would load voice cloning model
  // For now, structure ready
  console.log('Voice cloning structure ready - Backend API needed');
}

async function cloneVoice(audioSample) {
  // Would use backend API for voice cloning
  // Returns voice model ID
  return 'voice_model_123';
}

async function synthesizeSpeech(text, voiceModelId) {
  // Synthesize speech with cloned voice
  // Would use backend API
  return new Blob(); // Audio blob
}

async function initFaceCloning() {
  // In production, would load face cloning model
  console.log('Face cloning structure ready - Backend API needed');
}

async function cloneFace(imageSample) {
  // Would use backend API for face cloning
  return 'face_model_123';
}

async function generateVideoWithFace(text, faceModelId) {
  // Generate video with cloned face speaking text
  // Would use backend API
  return new Blob(); // Video blob
}

function showVoiceFaceCloningModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 600px;">
      <div class="about-modal-header">
        <h3>🎭 Voice & Face Cloning</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <p>Create AI clones of your voice and face for video calls and presentations.</p>
        
        <div style="margin-bottom: 1.5rem;">
          <h4>Voice Cloning</h4>
          <input type="file" id="voiceSample" accept="audio/*" style="margin-bottom: 0.5rem;">
          <button onclick="trainVoiceClone()" class="btn-modern btn-modern-primary">Train Voice Clone</button>
        </div>
        
        <div>
          <h4>Face Cloning</h4>
          <input type="file" id="faceSample" accept="image/*" style="margin-bottom: 0.5rem;">
          <button onclick="trainFaceClone()" class="btn-modern btn-modern-primary">Train Face Clone</button>
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--warning); border-radius: 8px;">
          <p style="margin: 0; font-size: 0.9rem;">
            <strong>Note:</strong> Voice and face cloning require backend API integration. This feature is structure-ready.
          </p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Add Escape key handler for this modal
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

async function trainVoiceClone() {
  const file = document.getElementById('voiceSample').files[0];
  if (!file) {
    alert('Please select an audio file');
    return;
  }
  
  alert('Voice cloning training - Backend API needed');
  // Would upload to backend and train model
}

async function trainFaceClone() {
  const file = document.getElementById('faceSample').files[0];
  if (!file) {
    alert('Please select an image file');
    return;
  }
  
  alert('Face cloning training - Backend API needed');
  // Would upload to backend and train model
}

// Make functions globally available
window.showUseCaseSelector = showUseCaseSelector;
window.selectUseCase = selectUseCase;
window.showCodeEditor = showCodeEditor;
window.runCode = runCode;
window.saveCode = saveCode;
window.showUICustomizationModal = showUICustomizationModal;
window.applyAICustomization = applyAICustomization;
window.updateThemeColor = updateThemeColor;
window.updateFontSize = updateFontSize;
window.updateSidebarPosition = updateSidebarPosition;
window.updateButtonSize = updateButtonSize;
window.resetCustomization = resetCustomization;
window.showVoiceFaceCloningModal = showVoiceFaceCloningModal;
window.trainVoiceClone = trainVoiceClone;
window.trainFaceClone = trainFaceClone;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  // Show use case selector on first visit only (removed auto-show after selection)
  const useCaseSelected = localStorage.getItem('useCaseSelected');
  if (!useCaseSelected) {
    // Only show on first visit, not after selection
    setTimeout(() => {
      if (!localStorage.getItem('useCaseSelected')) {
        showUseCaseSelector();
      }
    }, 1000);
  } else {
    applyUseCase(currentUseCase);
  }
  
  // Initialize code execution
  initCodeExecution();
});







