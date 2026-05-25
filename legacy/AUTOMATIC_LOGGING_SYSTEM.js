// ============================================
// AUTOMATIC LOGGING SYSTEM
// Tracks user actions, commits, changes, and generates timelines
// ============================================

// ============================================
// 1. LOGGING CORE
// ============================================

let projectLogs = {
  actions: [],      // All user actions
  commits: [],      // Git-like commits
  changes: [],      // File changes
  timeline: [],     // Generated timeline entries
  metadata: {
    projectName: '',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
};

// Initialize logging system
function initLoggingSystem() {
  // Load existing logs from IndexedDB
  loadProjectLogs();
  
  // Set up automatic tracking
  setupActionTracking();
  setupChangeTracking();
  setupCommitTracking();
  
  // Generate timeline periodically
  setInterval(generateTimelineFromLogs, 60000); // Every minute
}

// ============================================
// 2. ACTION TRACKING
// ============================================

function setupActionTracking() {
  // Track file operations
  const originalOpenFile = window.openFile;
  if (originalOpenFile) {
    window.openFile = function(path, event) {
      logAction('file_opened', { path, timestamp: new Date().toISOString() });
      return originalOpenFile(path, event);
    };
  }
  
  // Track AI interactions
  const originalSendChatbotMessage = window.sendChatbotMessage;
  if (originalSendChatbotMessage) {
    window.sendChatbotMessage = function() {
      // Get message from input (original function doesn't take parameters)
      const input = document.getElementById('chatbotInput') || document.querySelector('#chatbotInput');
      const message = input ? (input.value || '').trim() : '';
      
      if (message) {
        logAction('ai_interaction', { 
          message: message.substring(0, 100), // First 100 chars
          timestamp: new Date().toISOString() 
        });
      }
      
      // Call original function (it gets message from input itself)
      return originalSendChatbotMessage();
    };
  }
  
  // Track settings changes
  const originalSaveSettings = window.saveSettings;
  if (originalSaveSettings) {
    window.saveSettings = function() {
      logAction('settings_changed', { timestamp: new Date().toISOString() });
      return originalSaveSettings();
    };
  }
  
  // Track timer sessions
  const originalCompleteTimerSession = window.completeTimerSession;
  if (originalCompleteTimerSession) {
    window.completeTimerSession = function() {
      logAction('timer_completed', { timestamp: new Date().toISOString() });
      return originalCompleteTimerSession();
    };
  }
}

function logAction(type, data) {
  const action = {
    id: Date.now() + Math.random(),
    type,
    data,
    timestamp: new Date().toISOString(),
    user: getCurrentUser() || 'anonymous'
  };
  
  projectLogs.actions.push(action);
  projectLogs.metadata.lastUpdated = new Date().toISOString();
  
  // Save to IndexedDB
  saveProjectLogs();
  
  // Auto-generate timeline entry for important actions
  if (['file_created', 'file_deleted', 'commit_created', 'milestone_reached'].includes(type)) {
    generateTimelineEntry(action);
  }
}

// ============================================
// 3. CHANGE TRACKING
// ============================================

let fileChangeTracker = new Map(); // path -> { content, lastModified }

function setupChangeTracking() {
  // Track file edits
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('code-editor') || 
        e.target.classList.contains('document-editor') ||
        e.target.tagName === 'TEXTAREA') {
      trackFileChange(e.target);
    }
  }, true);
  
  // Track file saves
  const originalSaveCode = window.saveCode;
  if (originalSaveCode) {
    window.saveCode = function(filePath, content) {
      logChange('file_saved', filePath, content);
      return originalSaveCode(filePath, content);
    };
  }
}

function trackFileChange(element) {
  const filePath = element.dataset.filePath || 'unknown';
  const content = element.value;
  
  if (!fileChangeTracker.has(filePath)) {
    fileChangeTracker.set(filePath, {
      content: content,
      lastModified: new Date().toISOString()
    });
    return;
  }
  
  const previous = fileChangeTracker.get(filePath);
  if (previous.content !== content) {
    previous.content = content;
    previous.lastModified = new Date().toISOString();
    
    // Log change after debounce (1 second)
    clearTimeout(previous.debounceTimer);
    previous.debounceTimer = setTimeout(() => {
      logChange('file_edited', filePath, content);
    }, 1000);
  }
}

function logChange(type, filePath, content) {
  const change = {
    id: Date.now() + Math.random(),
    type,
    filePath,
    contentLength: content ? content.length : 0,
    timestamp: new Date().toISOString(),
    user: getCurrentUser() || 'anonymous'
  };
  
  projectLogs.changes.push(change);
  projectLogs.metadata.lastUpdated = new Date().toISOString();
  
  saveProjectLogs();
}

// ============================================
// 4. COMMIT SYSTEM
// ============================================

function setupCommitTracking() {
  // Intercept commit submissions
  const originalSubmitCommit = window.submitCommit;
  if (originalSubmitCommit) {
    window.submitCommit = function(commitData) {
      createCommit(commitData);
      return originalSubmitCommit(commitData);
    };
  }
}

function createCommit(commitData) {
  const commit = {
    id: Date.now() + Math.random(),
    message: commitData.message || 'No message',
    files: commitData.files || [],
    timestamp: new Date().toISOString(),
    user: getCurrentUser() || 'anonymous',
    status: 'pending', // pending, approved, rejected
    changes: getRecentChanges(commitData.files || [])
  };
  
  projectLogs.commits.push(commit);
  projectLogs.metadata.lastUpdated = new Date().toISOString();
  
  saveProjectLogs();
  generateTimelineEntry({ type: 'commit_created', data: commit });
}

function getRecentChanges(filePaths) {
  return projectLogs.changes.filter(change => 
    filePaths.includes(change.filePath) &&
    new Date(change.timestamp) > new Date(Date.now() - 3600000) // Last hour
  );
}

// ============================================
// 5. TIMELINE GENERATION
// ============================================

function generateTimelineFromLogs() {
  const timeline = [];
  
  // Group actions by day
  const actionsByDay = groupByDay(projectLogs.actions);
  
  // Generate timeline entries
  Object.keys(actionsByDay).forEach(day => {
    const dayActions = actionsByDay[day];
    const importantActions = dayActions.filter(a => 
      ['file_created', 'file_deleted', 'commit_created', 'milestone_reached'].includes(a.type)
    );
    
    if (importantActions.length > 0) {
      timeline.push({
        date: day,
        title: getTimelineTitle(importantActions),
        content: getTimelineContent(importantActions),
        type: 'milestone',
        files: getTimelineFiles(importantActions),
        tags: getTimelineTags(importantActions)
      });
    }
  });
  
  // Merge with existing timeline
  projectLogs.timeline = mergeTimelines(projectLogs.timeline, timeline);
  saveProjectLogs();
  
  // Update UI if timeline is visible
  if (window.renderTimeline && typeof window.renderTimeline === 'function') {
    window.renderTimeline(projectLogs.timeline);
  }
}

function generateTimelineEntry(action) {
  const entry = {
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    title: getActionTitle(action),
    content: getActionContent(action),
    type: getActionType(action.type),
    files: getActionFiles(action),
    tags: [action.type],
    importance: getActionImportance(action.type)
  };
  
  projectLogs.timeline.push(entry);
  saveProjectLogs();
}

function getActionTitle(action) {
  const titles = {
    'file_opened': 'File Opened',
    'file_created': 'File Created',
    'file_deleted': 'File Deleted',
    'file_saved': 'File Saved',
    'commit_created': 'Commit Created',
    'ai_interaction': 'AI Interaction',
    'settings_changed': 'Settings Changed',
    'timer_completed': 'Timer Session Completed',
    'milestone_reached': 'Milestone Reached'
  };
  return titles[action.type] || 'Action';
}

function getActionContent(action) {
  if (action.type === 'file_opened' || action.type === 'file_created') {
    return `File: ${action.data.path || 'unknown'}`;
  }
  if (action.type === 'commit_created') {
    return `Commit: ${action.data.message || 'No message'}`;
  }
  if (action.type === 'ai_interaction') {
    return `AI: ${action.data.message || 'Interaction'}`;
  }
  return 'Activity logged';
}

function getActionType(actionType) {
  const types = {
    'file_created': 'milestone',
    'file_deleted': 'correction',
    'commit_created': 'milestone',
    'milestone_reached': 'milestone',
    'file_opened': 'activity',
    'file_saved': 'activity',
    'ai_interaction': 'activity',
    'settings_changed': 'activity',
    'timer_completed': 'activity'
  };
  return types[actionType] || 'activity';
}

function getActionFiles(action) {
  if (action.data && action.data.path) {
    return [action.data.path.split('/').pop()];
  }
  if (action.data && action.data.files) {
    return action.data.files;
  }
  return [];
}

function getActionImportance(actionType) {
  const importance = {
    'file_created': 100,
    'file_deleted': 100,
    'commit_created': 100,
    'milestone_reached': 10,
    'file_opened': 1000,
    'file_saved': 1000,
    'ai_interaction': 1000,
    'settings_changed': 1000,
    'timer_completed': 1000
  };
  return importance[actionType] || 1000;
}

function groupByDay(actions) {
  const grouped = {};
  actions.forEach(action => {
    const day = new Date(action.timestamp).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(action);
  });
  return grouped;
}

function getTimelineTitle(actions) {
  if (actions.length === 1) {
    return getActionTitle(actions[0]);
  }
  return `${actions.length} Activities`;
}

function getTimelineContent(actions) {
  return actions.map(a => getActionContent(a)).join('. ');
}

function getTimelineFiles(actions) {
  const files = new Set();
  actions.forEach(a => {
    getActionFiles(a).forEach(f => files.add(f));
  });
  return Array.from(files);
}

function getTimelineTags(actions) {
  return [...new Set(actions.map(a => a.type))];
}

function mergeTimelines(existing, newEntries) {
  const merged = [...existing];
  newEntries.forEach(entry => {
    // Check if similar entry exists
    const exists = merged.some(e => 
      e.date === entry.date && 
      e.title === entry.title
    );
    if (!exists) {
      merged.push(entry);
    }
  });
  return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============================================
// 6. DOCX PROGRESS SAVING
// ============================================

async function saveProgressToDOCX() {
  // This would use a library like docx.js or similar
  // For now, we'll create a summary document structure
  
  const progressData = {
    projectName: projectLogs.metadata.projectName || 'Untitled Project',
    createdAt: projectLogs.metadata.createdAt,
    lastUpdated: projectLogs.metadata.lastUpdated,
    summary: generateProgressSummary(),
    timeline: projectLogs.timeline.slice(0, 50), // Last 50 entries
    stats: {
      totalActions: projectLogs.actions.length,
      totalCommits: projectLogs.commits.length,
      totalChanges: projectLogs.changes.length,
      totalFiles: new Set(projectLogs.changes.map(c => c.filePath)).size
    }
  };
  
  // Save to IndexedDB
  const db = await openIndexedDB();
  const tx = db.transaction(['projectProgress'], 'readwrite');
  await tx.objectStore('projectProgress').put({
    id: 'current',
    data: progressData,
    timestamp: new Date().toISOString()
  });
  
  // Trigger download or save
  downloadProgressDOCX(progressData);
}

function generateProgressSummary() {
  const recentActions = projectLogs.actions.slice(-20);
  const summary = {
    recentWork: recentActions.map(a => ({
      type: a.type,
      timestamp: a.timestamp,
      description: getActionContent({ type: a.type, data: a.data })
    })),
    milestones: projectLogs.timeline.filter(t => t.type === 'milestone').slice(-10),
    activeFiles: getActiveFiles()
  };
  return summary;
}

function getActiveFiles() {
  const fileCounts = {};
  projectLogs.changes.slice(-100).forEach(change => {
    fileCounts[change.filePath] = (fileCounts[change.filePath] || 0) + 1;
  });
  return Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, editCount: count }));
}

function downloadProgressDOCX(data) {
  // Create a simple text representation (in production, use docx library)
  const content = `
PROJECT PROGRESS REPORT
${data.projectName}
Created: ${data.createdAt}
Last Updated: ${data.lastUpdated}

STATISTICS
- Total Actions: ${data.stats.totalActions}
- Total Commits: ${data.stats.totalCommits}
- Total Changes: ${data.stats.totalChanges}
- Files Modified: ${data.stats.totalFiles}

RECENT WORK
${data.summary.recentWork.map(w => `- ${w.type}: ${w.description}`).join('\n')}

MILESTONES
${data.summary.milestones.map(m => `- ${m.date}: ${m.title}`).join('\n')}

ACTIVE FILES
${data.summary.activeFiles.map(f => `- ${f.path} (${f.editCount} edits)`).join('\n')}
  `;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.projectName}_Progress_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 7. INDEXEDDB STORAGE
// ============================================

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ProjectLogsDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('projectLogs')) {
        db.createObjectStore('projectLogs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projectProgress')) {
        db.createObjectStore('projectProgress', { keyPath: 'id' });
      }
    };
  });
}

async function saveProjectLogs() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['projectLogs'], 'readwrite');
    await tx.objectStore('projectLogs').put({
      id: 'current',
      data: projectLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving project logs:', error);
  }
}

async function loadProjectLogs() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['projectLogs'], 'readonly');
    const request = tx.objectStore('projectLogs').get('current');
    
    request.onsuccess = () => {
      if (request.result && request.result.data) {
        projectLogs = request.result.data;
      }
    };
  } catch (error) {
    console.error('Error loading project logs:', error);
  }
}

// ============================================
// 8. HELPER FUNCTIONS
// ============================================

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user).name || 'anonymous' : 'anonymous';
}

// ============================================
// 9. EXPORT FUNCTIONS
// ============================================

window.initLoggingSystem = initLoggingSystem;
window.logAction = logAction;
window.logChange = logChange;
window.createCommit = createCommit;
window.saveProgressToDOCX = saveProgressToDOCX;
window.generateTimelineFromLogs = generateTimelineFromLogs;

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoggingSystem);
} else {
  initLoggingSystem();
}








