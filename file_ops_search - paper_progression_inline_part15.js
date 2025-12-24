          window.saveTable = function() {
            if (tableEditor) {
              const csv = tableEditor.getPlugin('exportFile').exportAsString('csv');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'edited_table.csv';
              a.click();
              URL.revokeObjectURL(url);
            }
          };
        })
        .catch(error => {
          alert('Error loading table: ' + error.message);
        });
    }
    
    // Make function globally available
    if (typeof window !== 'undefined') {
      window.loadTableForEditing = loadTableForEditing;
    }
    
    // Integrate with file preview - add edit buttons for figures and tables
    function addEditButtonsToPreview(filePath, fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      const footer = document.querySelector('.file-preview-footer');
      
      if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') {
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️ Edit Figure';
        editBtn.className = 'file-preview-download';
        editBtn.style.marginRight = '0.5rem';
        editBtn.onclick = () => openFigureEditor(filePath);
        footer.insertBefore(editBtn, footer.firstChild);
      } else if (ext === 'csv') {
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️ Edit Table';
        editBtn.className = 'file-preview-download';
        editBtn.style.marginRight = '0.5rem';
        editBtn.onclick = () => openTableEditor(filePath);
        footer.insertBefore(editBtn, footer.firstChild);
      }
    }
    
    // Modify showFilePreview to add edit buttons
    const originalShowFilePreview = window.showFilePreview;
    window.showFilePreview = function(filePath, fileName) {
      originalShowFilePreview(filePath, fileName);
      setTimeout(() => addEditButtonsToPreview(filePath, fileName), 100);
    };
    
    // ============================================
    // INDEXEDDB SETUP (Core Infrastructure)
    // ============================================
    
    let db = null;
    const DB_NAME = 'PHEVResearchPortal';
    const DB_VERSION = 1;
    
    // Initialize IndexedDB
    function initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          db = request.result;
          resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Object stores
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'path' });
          }
          if (!db.objectStoreNames.contains('searchIndex')) {
            const searchStore = db.createObjectStore('searchIndex', { keyPath: 'id' });
            searchStore.createIndex('filePath', 'filePath', { unique: false });
            searchStore.createIndex('fileType', 'fileType', { unique: false });
            // Index for embeddings (stored as array)
            searchStore.createIndex('hasEmbedding', 'hasEmbedding', { unique: false });
          }
          if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('timeEntries')) {
            const timeStore = db.createObjectStore('timeEntries', { keyPath: 'id' });
            timeStore.createIndex('taskId', 'taskId', { unique: false });
            timeStore.createIndex('date', 'startTime', { unique: false });
          }
          if (!db.objectStoreNames.contains('goals')) {
            db.createObjectStore('goals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('habits')) {
            db.createObjectStore('habits', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('journalEntries')) {
            const journalStore = db.createObjectStore('journalEntries', { keyPath: 'id' });
            journalStore.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('comments')) {
            const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
            commentStore.createIndex('filePath', 'filePath', { unique: false });
          }
          if (!db.objectStoreNames.contains('annotations')) {
            const annotationStore = db.createObjectStore('annotations', { keyPath: 'id' });
            annotationStore.createIndex('filePath', 'filePath', { unique: false });
          }
          if (!db.objectStoreNames.contains('fileVersions')) {
            const versionStore = db.createObjectStore('fileVersions', { keyPath: 'id' });
            versionStore.createIndex('filePath', 'filePath', { unique: false });
          }
          if (!db.objectStoreNames.contains('references')) {
            db.createObjectStore('references', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('submissions')) {
            db.createObjectStore('submissions', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('conferenceSubmissions')) {
            db.createObjectStore('conferenceSubmissions', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('publications')) {
            db.createObjectStore('publications', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('healthData')) {
            const healthStore = db.createObjectStore('healthData', { keyPath: 'id' });
            healthStore.createIndex('category', 'category', { unique: false });
            healthStore.createIndex('date', 'date', { unique: false });
            healthStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains('integrations')) {
            db.createObjectStore('integrations', { keyPath: 'providerId' });
          }
          if (!db.objectStoreNames.contains('aiTraining')) {
            const trainingStore = db.createObjectStore('aiTraining', { keyPath: 'id' });
            trainingStore.createIndex('fileName', 'fileName', { unique: false });
            trainingStore.createIndex('fileType', 'fileType', { unique: false });
            trainingStore.createIndex('isGlobalProfile', 'isGlobalProfile', { unique: false });
          }
          if (!db.objectStoreNames.contains('userProfile')) {
            const profileStore = db.createObjectStore('userProfile', { keyPath: 'id' });
            profileStore.createIndex('category', 'category', { unique: false });
          }
        };
      });
    }
    
    // Initialize IndexedDB on page load
    document.addEventListener('DOMContentLoaded', function() {
      initIndexedDB().then(() => {
        console.log('IndexedDB initialized');
        // Migrate data from localStorage to IndexedDB
        migrateToIndexedDB();
      }).catch(err => {
        console.error('IndexedDB initialization failed:', err);
      });
    });
    
    // Migrate localStorage data to IndexedDB
    function migrateToIndexedDB() {
      if (!db) return;
      
      // Migrate tasks
      if (tasks.length > 0) {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        tasks.forEach(task => {
          store.put(task);
        });
      }
      
      // Migrate other data similarly
      // (This is a simplified migration - in production, do proper migration)
    }
    
    // ============================================
    // MEDIUM PRIORITY FEATURES
    // ============================================
    
    // MP1: Code Execution Environment (basic structure)
    let codeExecutionHistory = [];
    
    async function executeRCode(code) {
      // In production: integrate WebR or R server
      return new Promise((resolve, reject) => {
        // Placeholder - would use WebR or server-side R execution
        setTimeout(() => {
          resolve({
            output: 'R code execution - install WebR for full functionality',
            plots: [],
            errors: []
          });
        }, 1000);
      });
    }
    
    // MP2: Interactive Data Explorer (basic structure)
    let dataCache = new Map();
    
    async function loadDataFile(filePath) {
      if (dataCache.has(filePath)) {
        return dataCache.get(filePath);
      }
      
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        const data = parseCSV(text);
        dataCache.set(filePath, data);
        return data;
      } catch (error) {
        console.error('Error loading data:', error);
        return null;
      }
    }
    
    function parseCSV(csvText) {
      const lines = csvText.split('\n').filter(l => l.trim());
      return lines.map(line => line.split(','));
    }
    
    // MP3: Model Comparison Dashboard (basic structure)
    function loadModelResults() {
      // Load from model comparison CSV
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const csvPath = isLocalhost ? '../paper_a_analysis/tables/model_comparison_CLEAN_variables.csv' : 'tables/model_comparison_CLEAN_variables.csv';
      return fetch(csvPath)
        .then(response => response.text())
        .then(csv => {
          const data = parseCSV(csv);
          return data;
        });
    }
    
    // MP5: Notification System (enhanced)
    let notifications = [];
    
    function addNotification(type, title, message, action = null) {
      const notification = {
        id: Date.now(),
        type,
        title,
        message,
        action,
        read: false,
        timestamp: new Date().toISOString()
      };
      notifications.push(notification);
      saveNotifications();
      showBrowserNotification(title, message);
      return notification;
    }
    
    function showBrowserNotification(title, message) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
      }
    }
    
    function markNotificationRead(notificationId) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        saveNotifications();
      }
    }
    
    function saveNotifications() {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
    
