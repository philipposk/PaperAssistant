    // Initialize IndexedDB for health data
    let db = null;
    function initHealthDatabase() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          console.warn('IndexedDB not available, using localStorage fallback');
          resolve(null);
          return;
        }
        
        const request = indexedDB.open('HealthDataDB', 1);
        
        request.onerror = () => {
          console.warn('Failed to open IndexedDB, using localStorage fallback');
          resolve(null);
        };
        
        request.onsuccess = () => {
          db = request.result;
          resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
          const database = event.target.result;
          if (!database.objectStoreNames.contains('healthData')) {
            database.createObjectStore('healthData', { keyPath: 'id' });
          }
        };
      });
    }
    
    // Initialize database on load
    if (typeof window !== 'undefined') {
      initHealthDatabase().then(() => {
        if (db) {
          loadHealthData();
        }
      });
    }
    
    function syncWorkActivityToHealthApps(event, method, duration) {
      // Create work activity entry
      const workActivity = {
        id: Date.now(),
        type: 'work',
        method: method,
        duration: duration ? Math.round(duration / 1000 / 60) : null,
        timestamp: new Date().toISOString(),
        event: event
      };
      
      // Store in health data
      INTEGRATION_FRAMEWORK.healthData.exercise.push(workActivity);
      
      // Sync to connected apps
      INTEGRATION_FRAMEWORK.connectedApps.forEach((integration, providerId) => {
        if (integration.provider.scopes.includes('activity')) {
          sendDataToProvider(providerId, 'activity', workActivity);
        }
      });
      
      saveHealthData();
    }
    
    // Send data to provider
    async function sendDataToProvider(providerId, dataType, data) {
      const integration = INTEGRATION_FRAMEWORK.connectedApps.get(providerId);
      if (!integration) return;
      
      const token = getIntegrationToken(providerId);
      if (!token) return;
      
      try {
        const endpoint = `${integration.provider.apiEndpoint}/${dataType}`;
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      } catch (error) {
        console.error(`Failed to send data to ${integration.provider.name}:`, error);
      }
    }
    
    // Save health data to IndexedDB
    function saveHealthData() {
      if (db) {
        const transaction = db.transaction(['healthData'], 'readwrite');
        const store = transaction.objectStore('healthData');
        
        Object.keys(INTEGRATION_FRAMEWORK.healthData).forEach(key => {
          INTEGRATION_FRAMEWORK.healthData[key].forEach(entry => {
            store.put({ ...entry, category: key });
          });
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem('healthData', JSON.stringify(INTEGRATION_FRAMEWORK.healthData));
      }
    }
    
    // Load health data
    function loadHealthData() {
      if (db) {
        const transaction = db.transaction(['healthData'], 'readonly');
        const store = transaction.objectStore('healthData');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const allData = request.result;
          allData.forEach(entry => {
            const category = entry.category;
            if (INTEGRATION_FRAMEWORK.healthData[category]) {
              INTEGRATION_FRAMEWORK.healthData[category].push(entry);
            }
          });
        };
      } else {
        const saved = localStorage.getItem('healthData');
        if (saved) {
          INTEGRATION_FRAMEWORK.healthData = JSON.parse(saved);
        }
      }
    }
    
    // Get health insights
    function getHealthInsights(days = 7) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      const recentSleep = INTEGRATION_FRAMEWORK.healthData.sleep.filter(s => 
        new Date(s.date) >= cutoff
      );
      const recentActivity = INTEGRATION_FRAMEWORK.healthData.exercise.filter(a => 
        new Date(a.timestamp || a.date) >= cutoff
      );
      const recentSteps = INTEGRATION_FRAMEWORK.healthData.steps.filter(s => 
        new Date(s.date) >= cutoff
      );
      
      const avgSleep = recentSleep.length > 0
        ? recentSleep.reduce((sum, s) => sum + s.duration, 0) / recentSleep.length
        : 0;
      
      const avgSteps = recentSteps.length > 0
        ? recentSteps.reduce((sum, s) => sum + s.steps, 0) / recentSteps.length
        : 0;
      
      const totalWorkMinutes = recentActivity
        .filter(a => a.type === 'work')
        .reduce((sum, a) => sum + (a.duration || 0), 0);
      
      return {
        sleep: {
          average: Math.round(avgSleep * 10) / 10,
          quality: recentSleep.length > 0 
            ? Math.round(recentSleep.reduce((sum, s) => sum + (s.sleepQuality || 0), 0) / recentSleep.length)
            : 0,
          days: recentSleep.length
        },
        activity: {
          totalMinutes: totalWorkMinutes,
          totalHours: Math.round(totalWorkMinutes / 60 * 10) / 10,
          sessions: recentActivity.filter(a => a.type === 'work').length
        },
        steps: {
          average: Math.round(avgSteps),
          total: recentSteps.reduce((sum, s) => sum + s.steps, 0)
        },
        recommendations: generateHealthRecommendations(avgSleep, avgSteps, totalWorkMinutes)
      };
    }
    
    // Generate health recommendations
    function generateHealthRecommendations(avgSleep, avgSteps, workMinutes) {
      const recommendations = [];
      
      if (avgSleep < 7) {
        recommendations.push({
          type: 'sleep',
          priority: 'high',
          message: 'You\'re getting less than 7 hours of sleep on average. Consider going to bed earlier.',
          action: 'Set bedtime reminder'
        });
      }
      
      if (avgSteps < 5000) {
        recommendations.push({
          type: 'activity',
          priority: 'medium',
          message: 'You\'re below the recommended 10,000 steps per day. Try taking short walks during breaks.',
          action: 'Schedule walking breaks'
        });
      }
      
      if (workMinutes > 8 * 60) {
        recommendations.push({
          type: 'work',
          priority: 'high',
          message: 'You\'re working more than 8 hours per day. Remember to take breaks and maintain work-life balance.',
          action: 'Schedule mandatory breaks'
        });
      }
      
      return recommendations;
    }
    
    // Auto-sync health data
    function startAutoSync() {
      if (INTEGRATION_FRAMEWORK.syncSettings.autoSync) {
        setInterval(() => {
          syncHealthData();
        }, INTEGRATION_FRAMEWORK.syncSettings.syncInterval);
      }
    }
    
    // Initialize integration framework
    document.addEventListener('DOMContentLoaded', function() {
      loadHealthData();
      
      // Load connected apps
      const savedApps = localStorage.getItem('connectedApps');
      if (savedApps) {
        const apps = JSON.parse(savedApps);
        apps.forEach(([id, data]) => {
          INTEGRATION_FRAMEWORK.connectedApps.set(id, data);
        });
      }
      
      // Start auto-sync if enabled
      if (INTEGRATION_FRAMEWORK.syncSettings.autoSync) {
        startAutoSync();
      }
    });
    
    // Helper function to generate random string
    function generateRandomString(length) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    // Integrate additional features
    document.addEventListener('DOMContentLoaded', function() {
      // Add Keyboard Shortcuts tab
      const settingsTabs = document.querySelector('.settings-tabs');
      if (settingsTabs) {
        const shortcutsTab = document.createElement('button');
        shortcutsTab.className = 'settings-tab';
        shortcutsTab.setAttribute('data-tab', 'shortcuts');
        shortcutsTab.textContent = 'Shortcuts';
        shortcutsTab.onclick = () => {
          switchSettingsTab('shortcuts');
          renderShortcutsList();
        };
        settingsTabs.appendChild(shortcutsTab);
      }
      
      // Render shortcuts list
      function renderShortcutsList() {
        const container = document.getElementById('shortcutsList');
        if (!container) return;
        
        // Get shortcuts from ADDITIONAL_FEATURES.js or use default
        const shortcuts = window.customShortcuts || {};
        
        container.innerHTML = Object.entries(shortcuts).map(([action, config]) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-primary); border-radius: var(--border-radius); margin-bottom: 0.75rem; border: 1px solid var(--border-color);">
            <div style="flex: 1;">
              <strong style="display: block; margin-bottom: 0.25rem; color: var(--text-primary);">${config.description}</strong>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                Current: <code style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${config.ctrl ? 'Ctrl+' : ''}${config.key.toUpperCase()}</code>
              </div>
            </div>
            <button onclick="editShortcut('${action}')" class="btn-modern btn-modern-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Edit</button>
          </div>
        `).join('');
      }
      
      window.renderShortcutsList = renderShortcutsList;
      window.editShortcut = function(action) {
        const shortcuts = window.customShortcuts || {};
        const config = shortcuts[action];
        if (!config) return;
        
        const modal = document.createElement('div');
        modal.className = 'about-modal';
        modal.style.display = 'flex';
        modal.style.zIndex = '10004'; // Ensure modal is above everything
        modal.innerHTML = `
          <div class="about-modal-content" style="max-width: 500px;">
            <div class="about-modal-header">
              <h3>Edit Shortcut: ${config.description}</h3>
              <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
            </div>
            <div class="about-modal-body">
              <div class="settings-field" style="margin-bottom: 1rem;">
                <label>Key (single letter or number)</label>
                <input type="text" id="shortcutKey" class="input-modern" value="${config.key}" maxlength="1" style="text-transform: uppercase;">
              </div>
              <div class="settings-toggle">
                <label>Require Ctrl/Cmd key</label>
                <div class="toggle-switch ${config.ctrl ? 'active' : ''}" id="shortcutCtrl" onclick="toggleSetting(this)"></div>
              </div>
              <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                <button onclick="saveShortcut('${action}')" class="btn-modern btn-modern-primary" style="flex: 1;">Save</button>
                <button onclick="this.closest('.about-modal').remove()" class="btn-modern btn-modern-secondary" style="flex: 1;">Cancel</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Focus input
        setTimeout(() => {
          const input = document.getElementById('shortcutKey');
          if (input) {
            input.focus();
            input.select();
          }
        }, 100);
        
        // Close on Escape
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);
      };
      
      window.saveShortcut = function(action) {
        const shortcuts = window.customShortcuts || {};
        const config = shortcuts[action];
        if (!config) return;
        
        const newKey = document.getElementById('shortcutKey')?.value?.toLowerCase();
        const useCtrl = document.getElementById('shortcutCtrl')?.classList.contains('active');
        
        if (newKey && newKey.length === 1) {
          config.key = newKey;
          config.ctrl = useCtrl;
          
          if (window.saveCustomShortcuts) {
            window.saveCustomShortcuts();
          }
          if (window.applyCustomShortcuts) {
            window.applyCustomShortcuts();
          }
          renderShortcutsList();
          
          document.querySelector('.about-modal')?.remove();
        } else {
          alert('Please enter a single letter or number');
        }
      };
      
      // Initialize AI config on page load
      if (typeof loadAIConfig === 'function') {
        loadAIConfig();
      }
      
      // Initialize user display (will be created by ADDITIONAL_FEATURES.js)
      if (window.loadUser) {
        loadUser();
      } else {
        // Fallback: create basic user display
        const userDisplay = document.createElement('div');
        userDisplay.id = 'userDisplay';
        userDisplay.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 1000;';
        // Login button is already in the top banner, just ensure it's visible
        const loginBtn = document.getElementById('loginButton');
        if (loginBtn) {
          loginBtn.style.display = 'flex';
          loginBtn.innerHTML = '🔐 Login';
          loginBtn.onclick = () => showLoginModal();
        }
        document.body.appendChild(userDisplay);
      }
      
      // Show commit button if user is editor/admin
      if (currentUser && (currentUser.role === 'editor' || currentUser.role === 'admin')) {
        const commitBtn = document.querySelector('.commit-btn');
        if (commitBtn) {
          commitBtn.style.display = 'flex';
        }
      }
      
      // Add commits panel button for admins (add to quick access toolbar)
      if (currentUser && currentUser.role === 'admin') {
        const toolbar = document.querySelector('.quick-access-toolbar');
        if (toolbar) {
          // Check if commits button already exists
          const existingCommitsBtn = toolbar.querySelector('.commits-panel-btn');
          if (!existingCommitsBtn) {
            const commitsBtn = document.createElement('button');
            commitsBtn.className = 'quick-tool-btn commits-panel-btn';
            commitsBtn.innerHTML = '<span style="font-size: 1.25rem;">📋</span>';
            commitsBtn.onclick = showCommitsPanel;
            commitsBtn.title = 'Review pending commits';
            // Insert before commit button
            const commitBtn = toolbar.querySelector('.commit-btn');
            if (commitBtn) {
              toolbar.insertBefore(commitsBtn, commitBtn);
            } else {
              toolbar.appendChild(commitsBtn);
            }
          }
        }
      }
      
      // Code editor is already accessible via Editor button in quick access toolbar
      // No need to add separately
    });
    
    // Make AI assistant able to edit files
    async function aiEditFile(filePath, changes) {
      // In production, this would use backend API
      // For now, show edit preview
      const modal = document.createElement('div');
      modal.className = 'about-modal';
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="about-modal-content" style="max-width: 800px;">
          <div class="about-modal-header">
            <h3>✏️ AI File Edit Preview</h3>
            <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
          </div>
          <div class="about-modal-body">
            <p><strong>File:</strong> ${filePath}</p>
            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.9rem;">${changes}</pre>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
              <button onclick="applyFileEdit('${filePath}', \`${changes.replace(/`/g, '\\`')}\`)" class="btn-modern" style="background: var(--success); color: white;">✅ Apply Changes</button>
              <button onclick="this.closest('.about-modal').remove()" class="btn-modern btn-modern-secondary">Cancel</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
    }
    
