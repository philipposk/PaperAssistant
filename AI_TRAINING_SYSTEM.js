// ============================================
// AI TRAINING & FILE PROCESSING SYSTEM
// ============================================

// ============================================
// 1. FILE UPLOAD/DUMP SYSTEM
// ============================================

let uploadedFiles = [];
let trainingProgress = 0;
let isTraining = false;

function showFileUploadModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.id = 'fileUploadModal';
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 800px; max-height: 90vh;">
      <div class="about-modal-header">
        <h3>📚 Upload Files for AI Training</h3>
        <span class="about-modal-close" onclick="closeFileUploadModal()">&times;</span>
      </div>
      <div class="about-modal-body" style="overflow-y: auto;">
        <div style="margin-bottom: 1.5rem;">
          <p>Upload files to train the AI on your research. The AI will read and understand all content.</p>
        </div>
        
        <!-- Upload Methods Tabs -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">
          <button onclick="switchUploadTab('local')" class="upload-tab-modern active" data-tab="local">
            <span>📁</span>
            <span>Local Files</span>
          </button>
          <button onclick="switchUploadTab('url')" class="upload-tab-modern" data-tab="url">
            <span>🔗</span>
            <span>From URL</span>
          </button>
          <button onclick="switchUploadTab('ai-grab')" class="upload-tab-modern" data-tab="ai-grab">
            <span>🤖</span>
            <span>AI File Grabber</span>
          </button>
          <button onclick="switchUploadTab('global')" class="upload-tab-modern" data-tab="global">
            <span>👤</span>
            <span>Global Profile</span>
          </button>
        </div>
        
        <!-- Local Files Tab -->
        <div id="upload-local" class="upload-tab-content active">
          <div style="border: 2px dashed var(--border-color); border-radius: var(--border-radius); padding: 3rem 2rem; text-align: center; margin-bottom: 1.5rem; background: var(--bg-tertiary); transition: var(--transition);" 
               onmouseover="this.style.borderColor='var(--accent)'; this.style.background='var(--bg-primary)'" 
               onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-tertiary)'">
            <input type="file" id="fileInput" multiple style="display: none;" onchange="handleFileSelect(event)">
            <button onclick="document.getElementById('fileInput').click()" class="btn-modern btn-modern-primary" style="margin-bottom: 1rem; font-size: 1rem;">
              <span>📁</span>
              <span>Choose Files</span>
            </button>
            <p style="color: var(--text-secondary); margin: 0.5rem 0; font-weight: 500;">Or drag and drop files here</p>
            <p style="color: var(--text-tertiary); font-size: 0.875rem; margin-top: 0.5rem;">Supports: PDF, DOCX, TXT, MD, CSV, images, audio, video</p>
          </div>
          
          <div id="selectedFiles" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto;">
            <!-- Selected files will appear here -->
          </div>
        </div>
        
        <!-- URL Tab -->
        <div id="upload-url" class="upload-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">Enter URL(s) - one per line</label>
            <textarea id="urlInput" rows="5" class="input-modern" style="font-family: monospace; min-height: 120px;" placeholder="https://example.com/paper.pdf&#10;https://example.com/video.mp4&#10;https://arxiv.org/abs/1234.5678"></textarea>
          </div>
          <button onclick="fetchFilesFromURLs()" class="btn-modern btn-modern-primary">Fetch Files</button>
        </div>
        
        <!-- AI File Grabber Tab -->
        <div id="upload-ai-grab" class="upload-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">Describe files or ask AI to find them</label>
            <textarea id="aiGrabInput" rows="4" style="width: 100%; padding: 0.75rem; border: 2px solid var(--bg-primary); border-radius: 8px;" placeholder="Example: 'Find all PDF files in my Documents folder about machine learning' or 'Get the paper I downloaded last week about PHEVs'"></textarea>
          </div>
          <button onclick="aiGrabFiles()" class="btn-modern btn-modern-primary">
            <span>🤖</span>
            <span>Let AI Find Files</span>
          </button>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
            The AI will search your computer (with permission) and suggest files to add.
          </p>
        </div>
        
        <!-- Global Profile Tab -->
        <div id="upload-global" class="upload-tab-content" style="display: none;">
          <div style="margin-bottom: 1.5rem;">
            <h4>Build Your Global AI Profile</h4>
            <p style="color: var(--text-secondary);">Upload information about yourself so the AI can provide personalized help.</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="grid-card-modern" onclick="importFromSource('emails')">
              <div class="grid-card-modern-icon">📧</div>
              <div class="grid-card-modern-title">Email History</div>
              <div class="grid-card-modern-description">Import from Gmail, Outlook, etc.</div>
            </div>
            
            <div class="grid-card-modern" onclick="importFromSource('files')">
              <div class="grid-card-modern-icon">📁</div>
              <div class="grid-card-modern-title">Personal Files</div>
              <div class="grid-card-modern-description">Documents, manuscripts, notes</div>
            </div>
            
            <div class="grid-card-modern" onclick="importFromSource('messages')">
              <div class="grid-card-modern-icon">💬</div>
              <div class="grid-card-modern-title">Messages</div>
              <div class="grid-card-modern-description">Messenger, WhatsApp, etc.</div>
            </div>
            
            <div class="grid-card-modern" onclick="importFromSource('search')">
              <div class="grid-card-modern-icon">🔍</div>
              <div class="grid-card-modern-title">Search History</div>
              <div class="grid-card-modern-description">Browser search history</div>
            </div>
            
            <div class="grid-card-modern" onclick="importFromSource('handwritten')">
              <div class="grid-card-modern-icon">✍️</div>
              <div class="grid-card-modern-title">Handwritten Notes</div>
              <div class="grid-card-modern-description">Upload photos/scans</div>
            </div>
            
            <div class="grid-card-modern" onclick="importFromSource('audio')">
              <div class="grid-card-modern-icon">🎤</div>
              <div class="grid-card-modern-title">Audio/Video</div>
              <div class="grid-card-modern-description">Recordings, interviews</div>
            </div>
          </div>
          
          <div style="margin-top: 1.5rem; padding: 1rem; background: var(--warning); border-radius: 8px;">
            <p style="margin: 0; font-size: 0.9rem;">
              <strong>Privacy:</strong> All data stays local. The AI only accesses what you explicitly allow.
            </p>
          </div>
        </div>
        
        <!-- Training Progress -->
        <div id="trainingProgress" style="display: none; margin-top: 1.5rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong>Training Progress</strong>
            <span id="progressPercent">0%</span>
          </div>
          <div style="width: 100%; height: 20px; background: var(--bg-secondary); border-radius: 10px; overflow: hidden;">
            <div id="progressBar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.3s;"></div>
          </div>
          <p id="progressStatus" style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">Preparing...</p>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 0.75rem;">
          <button onclick="startAITraining()" id="startTrainingBtn" class="btn-modern btn-modern-primary" style="flex: 1;">
            <span>🚀</span>
            <span>Start AI Training</span>
          </button>
          <button onclick="closeFileUploadModal()" class="btn-modern btn-modern-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Drag and drop
  const dropZone = modal.querySelector('#upload-local');
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'var(--bg-primary)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = '';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = '';
    handleFileDrop(e.dataTransfer.files);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeFileUploadModal();
  });
  
  // Add Escape key handler for this modal
  const escapeHandler = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeFileUploadModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function closeFileUploadModal() {
  document.getElementById('fileUploadModal')?.remove();
}

function switchUploadTab(tab) {
  document.querySelectorAll('.upload-tab-modern, .upload-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.upload-tab-content').forEach(c => {
    c.style.display = 'none';
    c.classList.remove('active');
  });
  
  const tabButton = document.querySelector(`.upload-tab-modern[data-tab="${tab}"], .upload-tab[data-tab="${tab}"]`);
  if (tabButton) tabButton.classList.add('active');
  const tabContent = document.getElementById(`upload-${tab}`);
  if (tabContent) {
    tabContent.style.display = 'block';
    tabContent.classList.add('active');
  }
}

function handleFileSelect(event) {
  handleFiles(Array.from(event.target.files));
}

function handleFileDrop(files) {
  handleFiles(Array.from(files));
}

function handleFiles(files) {
  files.forEach(file => {
    uploadedFiles.push({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'pending'
    });
  });
  renderSelectedFiles();
}

function renderSelectedFiles() {
  const container = document.getElementById('selectedFiles');
  if (!container) return;
  
  if (uploadedFiles.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No files selected</p>';
    return;
  }
  
  container.innerHTML = uploadedFiles.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px;">
      <div style="flex: 1;">
        <strong>${item.name}</strong>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          ${formatFileSize(item.size)} • ${item.type || 'Unknown type'}
        </div>
      </div>
      <button onclick="removeFile('${item.id}')" class="btn-modern" style="padding: 0.5rem 1rem; background: var(--error); color: white; font-size: 0.8rem;">Remove</button>
    </div>
  `).join('');
}

function removeFile(id) {
  uploadedFiles = uploadedFiles.filter(f => f.id !== id);
  renderSelectedFiles();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// 2. AI FILE GRABBER
// ============================================

async function aiGrabFiles() {
  const query = document.getElementById('aiGrabInput').value;
  if (!query.trim()) {
    alert('Please describe what files you want to find');
    return;
  }
  
  // Show loading
  const status = document.createElement('div');
  status.id = 'aiGrabStatus';
  status.style.cssText = 'padding: 1rem; background: var(--bg-primary); border-radius: 8px; margin-top: 1rem;';
  status.innerHTML = '<p>🤖 AI is searching for files...</p>';
  document.getElementById('upload-ai-grab').appendChild(status);
  
  try {
    // In production, this would call backend API that uses file system access
    // For now, simulate with file picker API
    if ('showDirectoryPicker' in window) {
      const dirHandle = await window.showDirectoryPicker();
      const files = await searchDirectory(dirHandle, query);
      
      status.innerHTML = `
        <p><strong>Found ${files.length} files:</strong></p>
        <div style="max-height: 200px; overflow-y: auto;">
          ${files.map(f => `
            <div style="padding: 0.5rem; background: var(--bg-secondary); margin: 0.5rem 0; border-radius: 4px;">
              ${f.name}
              <button onclick="addFoundFile('${f.path}')" class="btn-modern btn-modern-primary" style="float: right; padding: 0.5rem 1rem; font-size: 0.8rem;">Add</button>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      // Fallback: Use file input
      alert('File system access not available. Please use "Local Files" tab to select files manually.');
      status.remove();
    }
  } catch (error) {
    status.innerHTML = `<p style="color: var(--error);">Error: ${error.message}</p>`;
  }
}

async function searchDirectory(dirHandle, query) {
  const files = [];
  const queryLower = query.toLowerCase();
  
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file.name.toLowerCase().includes(queryLower) || 
          file.type.includes('pdf') || 
          file.type.includes('document')) {
        files.push({
          name: file.name,
          path: entry.name,
          file: file
        });
      }
    } else if (entry.kind === 'directory') {
      const subDir = await entry.getDirectoryHandle();
      const subFiles = await searchDirectory(subDir, query);
      files.push(...subFiles);
    }
  }
  
  return files;
}

function addFoundFile(path) {
  // Add to uploaded files
  // Implementation depends on file system API
}

// ============================================
// 3. FETCH FILES FROM URLS
// ============================================

async function fetchFilesFromURLs() {
  const urls = document.getElementById('urlInput').value.split('\n').filter(u => u.trim());
  if (urls.length === 0) {
    alert('Please enter at least one URL');
    return;
  }
  
  const status = document.createElement('div');
  status.style.cssText = 'padding: 1rem; background: var(--bg-primary); border-radius: 8px; margin-top: 1rem;';
  status.innerHTML = '<p>📥 Fetching files from URLs...</p>';
  document.getElementById('upload-url').appendChild(status);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'downloaded_file';
      
      const file = new File([blob], fileName, { type: blob.type });
      uploadedFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        name: fileName,
        type: blob.type,
        size: blob.size,
        status: 'pending',
        source: 'url',
        url: url
      });
      
      status.innerHTML += `<p style="color: var(--success);">✅ Fetched: ${fileName}</p>`;
    } catch (error) {
      status.innerHTML += `<p style="color: var(--error);">❌ Failed: ${url} - ${error.message}</p>`;
    }
  }
  
  renderSelectedFiles();
}

// ============================================
// 4. AI TRAINING PROCESS
// ============================================

async function startAITraining() {
  if (uploadedFiles.length === 0) {
    alert('Please add files first');
    return;
  }
  
  if (isTraining) {
    alert('Training already in progress');
    return;
  }
  
  isTraining = true;
  document.getElementById('startTrainingBtn').disabled = true;
  document.getElementById('trainingProgress').style.display = 'block';
  
  let processed = 0;
  const total = uploadedFiles.length;
  
  for (const fileItem of uploadedFiles) {
    try {
      updateProgress((processed / total) * 100, `Processing ${fileItem.name}...`);
      
      // Process file based on type
      const processedContent = await processFile(fileItem);
      
      // Store in IndexedDB
      await storeProcessedFile(fileItem, processedContent);
      
      fileItem.status = 'processed';
      processed++;
      updateProgress((processed / total) * 100, `Processed ${processed}/${total} files...`);
      
    } catch (error) {
      console.error(`Error processing ${fileItem.name}:`, error);
      fileItem.status = 'error';
      fileItem.error = error.message;
    }
  }
  
  // Generate embeddings
  updateProgress(90, 'Generating embeddings...');
  await generateEmbeddingsForFiles();
  
  // Complete
  updateProgress(100, 'Training complete!');
  isTraining = false;
  
  // Show notification
  showTrainingCompleteNotification();
  
  // Show AI suggestions
  setTimeout(() => {
    showAISuggestions();
  }, 1000);
}

async function processFile(fileItem) {
  const file = fileItem.file;
  const type = file.type || file.name.split('.').pop().toLowerCase();
  
  // Text files
  if (type.includes('text') || type.includes('pdf') || ['txt', 'md', 'csv'].includes(type)) {
    return await processTextFile(file);
  }
  
  // Audio files
  if (type.includes('audio')) {
    return await transcribeAudio(file);
  }
  
  // Video files
  if (type.includes('video')) {
    return await transcribeVideo(file);
  }
  
  // Images
  if (type.includes('image')) {
    return await extractTextFromImage(file);
  }
  
  // Default: try to read as text
  return await processTextFile(file);
}

async function processTextFile(file) {
  if (file.type === 'application/pdf') {
    // Use PDF.js or backend API
    return await extractTextFromPDF(file);
  } else {
    return await file.text();
  }
}

async function transcribeAudio(file) {
  // In production, use Whisper API or similar
  // For now, return placeholder
  return `[Audio transcription for ${file.name} - Backend API needed]`;
}

async function transcribeVideo(file) {
  // Extract audio, then transcribe
  return `[Video transcription for ${file.name} - Backend API needed]`;
}

async function extractTextFromImage(file) {
  // Use OCR (Tesseract.js or backend API)
  return `[OCR text from ${file.name} - Backend API needed]`;
}

async function extractTextFromPDF(file) {
  // Use PDF.js
  return `[PDF text from ${file.name} - Backend API needed]`;
}

async function storeProcessedFile(fileItem, content) {
  if (db) {
    const transaction = db.transaction(['aiTraining'], 'readwrite');
    const store = transaction.objectStore('aiTraining');
    await store.put({
      id: fileItem.id,
      fileName: fileItem.name,
      fileType: fileItem.type,
      content: content,
      uploadedAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    });
  } else {
    // Fallback to localStorage
    const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
    trainingData.push({
      id: fileItem.id,
      fileName: fileItem.name,
      content: content,
      uploadedAt: new Date().toISOString()
    });
    localStorage.setItem('aiTrainingData', JSON.stringify(trainingData));
  }
}

async function generateEmbeddingsForFiles() {
  // Generate embeddings for all processed files
  // This would use the embedding model we already have
  const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
  
  for (const item of trainingData) {
    if (embeddingModel) {
      try {
        const embedding = await embeddingModel(item.content, {
          pooling: 'mean',
          normalize: true
        });
        
        // Store embedding
        if (db) {
          const transaction = db.transaction(['aiTraining'], 'readwrite');
          const store = transaction.objectStore('aiTraining');
          const existing = await store.get(item.id);
          if (existing) {
            existing.embedding = Array.from(embedding.data);
            await store.put(existing);
          }
        }
      } catch (error) {
        console.error('Error generating embedding:', error);
      }
    }
  }
}

function updateProgress(percent, status) {
  trainingProgress = percent;
  document.getElementById('progressBar').style.width = percent + '%';
  document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
  document.getElementById('progressStatus').textContent = status;
}

function showTrainingCompleteNotification() {
  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification('AI Training Complete!', {
      body: 'The AI has finished reading your files and is ready to help.',
      icon: '/favicon.ico'
    });
  }
  
  // In-app notification
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 1rem; right: 1rem; background: var(--success); color: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px var(--shadow); z-index: 10000;';
  notification.innerHTML = `
    <strong>✅ AI Training Complete!</strong>
    <p style="margin: 0.5rem 0 0 0;">The AI has finished reading your files.</p>
    <button onclick="showAISuggestions(); this.closest('div').remove();" class="btn-modern" style="margin-top: 0.5rem; background: var(--success); color: white;">View Suggestions</button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 10000);
}

// ============================================
// 5. AI SUGGESTIONS AFTER TRAINING
// ============================================

async function showAISuggestions() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 900px; max-height: 90vh;">
      <div class="about-modal-header">
        <h3>💡 AI Suggestions</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body" style="overflow-y: auto;">
        <div id="aiSuggestionsContent">
          <p>🤖 AI is analyzing your files and generating suggestions...</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Generate suggestions using AI
  const suggestions = await generateAISuggestions();
  
  document.getElementById('aiSuggestionsContent').innerHTML = suggestions.map(s => `
    <div style="padding: 1.5rem; background: var(--bg-primary); border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid var(--accent);">
      <h4 style="margin: 0 0 0.5rem 0; color: var(--accent);">${s.type}: ${s.title}</h4>
      <p style="margin: 0 0 1rem 0;">${s.description}</p>
      ${s.action ? `<button onclick="${s.action}" class="btn-modern btn-modern-primary">${s.actionText || 'Apply'}</button>` : ''}
    </div>
  `).join('');
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function generateAISuggestions() {
  // Analyze uploaded files and generate suggestions
  // This would use the AI API with context from uploaded files
  
  const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
  if (trainingData.length === 0) {
    return [{
      type: 'Info',
      title: 'No files processed',
      description: 'Please upload files first to get AI suggestions.'
    }];
  }
  
  // In production, this would call AI API with file context
  // For now, return sample suggestions
  return [
    {
      type: 'Improvement',
      title: 'Add methodology section',
      description: 'Based on your uploaded papers, consider adding a detailed methodology section explaining your approach.',
      action: 'openAIAssistant()',
      actionText: 'Ask AI to help'
    },
    {
      type: 'Enhancement',
      title: 'Include recent research',
      description: 'Your uploaded files reference recent work that could strengthen your paper.',
      action: 'openAIAssistant()',
      actionText: 'Get details'
    },
    {
      type: 'Fix',
      title: 'Check citation format',
      description: 'Some citations may need formatting updates based on your target journal.',
      action: 'openAIAssistant()',
      actionText: 'Review citations'
    }
  ];
}

// ============================================
// 6. GLOBAL USER PROFILE
// ============================================

function importFromSource(source) {
  switch(source) {
    case 'emails':
      importEmails();
      break;
    case 'files':
      importPersonalFiles();
      break;
    case 'messages':
      importMessages();
      break;
    case 'search':
      importSearchHistory();
      break;
    case 'handwritten':
      importHandwritten();
      break;
    case 'audio':
      importAudioVideo();
      break;
  }
}

async function importEmails() {
  // In production, use OAuth to access Gmail/Outlook API
  alert('Email import - Backend OAuth integration needed for Gmail/Outlook API');
}

async function importPersonalFiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.onchange = (e) => {
    handleFiles(Array.from(e.target.files));
    // Mark as global profile files
    uploadedFiles.forEach(f => f.isGlobalProfile = true);
  };
  input.click();
}

async function importMessages() {
  alert('Message import - Backend integration needed for Messenger/WhatsApp APIs');
}

async function importSearchHistory() {
  // Request browser history access
  if (chrome && chrome.history) {
    chrome.history.search({ text: '', maxResults: 1000 }, (results) => {
      // Process search history
      console.log('Search history:', results);
    });
  } else {
    alert('Browser history access - Extension permissions needed');
  }
}

async function importHandwritten() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async (e) => {
    for (const file of Array.from(e.target.files)) {
      // Use OCR to extract text
      const text = await extractTextFromImage(file);
      uploadedFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        type: 'handwritten',
        content: text,
        isGlobalProfile: true
      });
    }
    renderSelectedFiles();
  };
  input.click();
}

async function importAudioVideo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*,video/*';
  input.multiple = true;
  input.onchange = async (e) => {
    for (const file of Array.from(e.target.files)) {
      // Transcribe
      const text = file.type.includes('audio') 
        ? await transcribeAudio(file)
        : await transcribeVideo(file);
      
      uploadedFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        type: file.type,
        content: text,
        isGlobalProfile: true
      });
    }
    renderSelectedFiles();
  };
  input.click();
}

// Make functions globally available
window.showFileUploadModal = showFileUploadModal;
window.closeFileUploadModal = closeFileUploadModal;
window.switchUploadTab = switchUploadTab;
window.handleFileSelect = handleFileSelect;
window.removeFile = removeFile;
window.fetchFilesFromURLs = fetchFilesFromURLs;
window.aiGrabFiles = aiGrabFiles;
window.startAITraining = startAITraining;
window.importFromSource = importFromSource;
window.showAISuggestions = showAISuggestions;







