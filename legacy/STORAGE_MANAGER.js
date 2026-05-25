// ============================================
// STORAGE MANAGER
// Unified storage system with GitHub, backend, cloud, and local fallbacks
// Handles file size limits and automatic fallback
// ============================================

class StorageManager {
  constructor() {
    this.githubLimit = 100 * 1024 * 1024; // 100MB per file (GitHub limit)
    this.githubRepoLimit = 1 * 1024 * 1024 * 1024; // 1GB total (soft limit)
    this.currentStorage = localStorage.getItem('storage_preference') || 'auto';
    this.storageStats = JSON.parse(localStorage.getItem('storage_stats') || '{}');
  }

  // Determine best storage for file
  async determineStorage(filePath, fileSize, fileType) {
    // Large files (>100MB) go to cloud/backend
    if (fileSize > this.githubLimit) {
      return this.currentStorage === 'github' ? 'cloud' : this.currentStorage;
    }

    // Images/figures: prefer GitHub if available, else cloud
    if (fileType.match(/\.(png|jpg|jpeg|svg|gif)$/i)) {
      if (this.currentStorage === 'github' && await this.checkGitHubSpace(fileSize)) {
        return 'github';
      }
      return 'cloud';
    }

    // Tables/CSV: prefer GitHub if available
    if (fileType.match(/\.(csv|xlsx)$/i)) {
      if (this.currentStorage === 'github' && await this.checkGitHubSpace(fileSize)) {
        return 'github';
      }
      return 'local'; // CSV files are usually small
    }

    // Datasets: always cloud/backend
    if (fileType.match(/\.(db|sqlite|parquet|feather)$/i)) {
      return 'cloud';
    }

    // Documents: prefer GitHub
    if (fileType.match(/\.(md|txt|docx)$/i)) {
      if (this.currentStorage === 'github' && await this.checkGitHubSpace(fileSize)) {
        return 'github';
      }
      return 'local';
    }

    // Default: use current preference
    return this.currentStorage === 'github' && await this.checkGitHubSpace(fileSize) 
      ? 'github' 
      : this.currentStorage;
  }

  // Check if GitHub has space
  async checkGitHubSpace(requiredSize) {
    if (!window.githubIntegration || !window.githubIntegration.currentRepo) {
      return false;
    }

    const currentUsage = this.storageStats.githubUsage || 0;
    return (currentUsage + requiredSize) < this.githubRepoLimit;
  }

  // Save file with automatic fallback
  async saveFile(filePath, content, metadata = {}) {
    const fileSize = new Blob([content]).size;
    const fileType = filePath.split('.').pop() || '';
    const storageType = await this.determineStorage(filePath, fileSize, fileType);

    try {
      switch (storageType) {
        case 'github':
          return await this.saveToGitHub(filePath, content, metadata);
        case 'cloud':
          return await this.saveToCloud(filePath, content, metadata);
        case 'backend':
          return await this.saveToBackend(filePath, content, metadata);
        case 'local':
        default:
          return await this.saveToLocal(filePath, content, metadata);
      }
    } catch (error) {
      console.error(`Failed to save to ${storageType}, trying fallback:`, error);
      // Automatic fallback
      return await this.saveWithFallback(filePath, content, metadata, storageType);
    }
  }

  // Save to GitHub
  async saveToGitHub(filePath, content, metadata) {
    if (!window.githubIntegration || !window.githubIntegration.currentRepo) {
      throw new Error('GitHub not configured');
    }

    const message = metadata.message || `Update ${filePath}`;
    const result = await window.githubIntegration.commitFile(filePath, content, message);
    
    // Update stats
    const fileSize = new Blob([content]).size;
    this.storageStats.githubUsage = (this.storageStats.githubUsage || 0) + fileSize;
    localStorage.setItem('storage_stats', JSON.stringify(this.storageStats));

    return { success: true, storage: 'github', ...result };
  }

  // Save to cloud storage
  async saveToCloud(filePath, content, metadata) {
    const provider = localStorage.getItem('cloud_provider') || 'google';
    
    if (provider === 'google' && window.googleDriveIntegration) {
      return await window.googleDriveIntegration.uploadFile(filePath, content, metadata);
    }
    
    if (provider === 'dropbox' && window.dropboxIntegration) {
      return await window.dropboxIntegration.uploadFile(filePath, content, metadata);
    }

    // Fallback to backend
    return await this.saveToBackend(filePath, content, metadata);
  }

  // Save to backend
  async saveToBackend(filePath, content, metadata) {
    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content: btoa(unescape(encodeURIComponent(content))),
          metadata
        })
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Backend upload failed');
    } catch (error) {
      // Fallback to local
      return await this.saveToLocal(filePath, content, metadata);
    }
  }

  // Save to local storage
  async saveToLocal(filePath, content, metadata) {
    const key = `file_${filePath}`;
    
    // Check localStorage size limit (usually 5-10MB)
    const fileSize = new Blob([content]).size;
    if (fileSize > 5 * 1024 * 1024) {
      // Too large for localStorage, use IndexedDB
      return await this.saveToIndexedDB(filePath, content, metadata);
    }

    try {
      localStorage.setItem(key, content);
      const files = JSON.parse(localStorage.getItem('local_files') || '[]');
      if (!files.find(f => f.path === filePath)) {
        files.push({ path: filePath, size: fileSize, ...metadata });
        localStorage.setItem('local_files', JSON.stringify(files));
      }
      return { success: true, storage: 'local' };
    } catch (e) {
      // localStorage full, use IndexedDB
      return await this.saveToIndexedDB(filePath, content, metadata);
    }
  }

  // Save to IndexedDB (for larger files)
  async saveToIndexedDB(filePath, content, metadata) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ProjectFiles', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        
        const fileData = {
          path: filePath,
          content: content,
          metadata: metadata,
          timestamp: Date.now()
        };
        
        const putRequest = store.put(fileData);
        putRequest.onsuccess = () => resolve({ success: true, storage: 'indexeddb' });
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'path' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Fallback chain
  async saveWithFallback(filePath, content, metadata, failedStorage) {
    const fallbackChain = {
      github: ['cloud', 'backend', 'local'],
      cloud: ['backend', 'local'],
      backend: ['local'],
      local: []
    };

    const fallbacks = fallbackChain[failedStorage] || ['local'];
    
    for (const fallback of fallbacks) {
      try {
        switch (fallback) {
          case 'cloud':
            return await this.saveToCloud(filePath, content, metadata);
          case 'backend':
            return await this.saveToBackend(filePath, content, metadata);
          case 'local':
            return await this.saveToLocal(filePath, content, metadata);
        }
      } catch (e) {
        console.warn(`Fallback to ${fallback} failed:`, e);
        continue;
      }
    }

    throw new Error('All storage options failed');
  }

  // Get file from any storage
  async getFile(filePath) {
    // Try GitHub first if configured
    if (window.githubIntegration && window.githubIntegration.currentRepo) {
      try {
        return await window.githubIntegration.getFile(filePath);
      } catch (e) {
        // Continue to next storage
      }
    }

    // Try cloud
    try {
      return await this.getFromCloud(filePath);
    } catch (e) {
      // Continue
    }

    // Try backend
    try {
      return await this.getFromBackend(filePath);
    } catch (e) {
      // Continue
    }

    // Try local
    try {
      return await this.getFromLocal(filePath);
    } catch (e) {
      // Continue
    }

    throw new Error('File not found in any storage');
  }

  async getFromLocal(filePath) {
    const key = `file_${filePath}`;
    const content = localStorage.getItem(key);
    if (content) return content;

    // Try IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ProjectFiles', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getRequest = store.get(filePath);
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(getRequest.result.content);
          } else {
            reject(new Error('File not found'));
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFromCloud(filePath) {
    // Implementation depends on cloud provider
    throw new Error('Not implemented');
  }

  async getFromBackend(filePath) {
    const response = await fetch(`/api/files/${encodeURIComponent(filePath)}`);
    if (response.ok) {
      return await response.text();
    }
    throw new Error('File not found');
  }
}

// Initialize
window.storageManager = new StorageManager();

