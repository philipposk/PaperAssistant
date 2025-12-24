    function autoResizeTextarea(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
    
    // Handle AI Assistant button click based on user preference
    function handleAIAssistantClick() {
      const location = localStorage.getItem('aiAssistantLocation') || 'chat';
      if (location === 'settings') {
        openSettings();
        // Switch to AI tab
        setTimeout(() => {
          switchSettingsTab('ai');
        }, 100);
      } else {
        openChatbot();
      }
    }
    
    // Make chatbot functions globally accessible
    window.openChatbot = openChatbot;
    window.closeChatbot = closeChatbot;
    window.sendChatbotMessage = sendChatbotMessage;
    
    // Make available early
    if (typeof window.sendChatbotMessage === 'undefined') {
      window.sendChatbotMessage = sendChatbotMessage;
    }
    
    // Ensure sendChatbotMessage is available for button onclick
    document.addEventListener('DOMContentLoaded', function() {
      const sendBtn = document.getElementById('chatbotSend');
      if (sendBtn) {
        sendBtn.onclick = function() {
          if (typeof window.sendChatbotMessage === 'function') {
            window.sendChatbotMessage();
          } else {
            console.error('sendChatbotMessage not available');
            alert('AI assistant is loading, please wait...');
          }
        };
      }
    });
    window.handleChatbotKeydown = handleChatbotKeydown;
    window.openChatbotSettings = openChatbotSettings;
    window.toggleChatbotFileUpload = toggleChatbotFileUpload;
    window.removeChatbotFile = removeChatbotFile;
    window.clearChatbotFiles = clearChatbotFiles;
    window.handleAIAssistantClick = handleAIAssistantClick;
    window.openChatbot = openChatbot;
    
    // Make available early
    if (typeof window.handleAIAssistantClick === 'undefined') {
      window.handleAIAssistantClick = handleAIAssistantClick;
      window.openChatbot = openChatbot;
    }
    
    // Toggle quick access toolbar
    function toggleQuickAccessToolbar() {
      const toolbar = document.getElementById('quickAccessToolbar');
      if (toolbar) {
        const isVisible = toolbar.style.display !== 'none' && window.getComputedStyle(toolbar).display !== 'none';
        if (isVisible) {
          toolbar.style.display = 'none';
          toolbar.classList.remove('show');
        } else {
          toolbar.style.display = 'flex';
          toolbar.classList.add('show');
        }
      }
    }
    window.toggleQuickAccessToolbar = toggleQuickAccessToolbar;
    
    // Make available early
    if (typeof window.toggleQuickAccessToolbar === 'undefined') {
      window.toggleQuickAccessToolbar = toggleQuickAccessToolbar;
    }
    
    // Keyboard shortcut: Ctrl+J or Cmd+J to open chatbot
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        handleAIAssistantClick();
      }
      // Ctrl+, or Cmd+, to open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        openSettings();
      }
    });
    
    // ============================================
    // SETTINGS DASHBOARD
    // ============================================
    
    let currentSettingsTab = 'general';
    
    function openSettings() {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
        loadSettings();
        // Load AI config when opening settings
        if (typeof loadAIConfig === 'function') {
          loadAIConfig();
        }
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }
    }
    
    // Make openSettings globally accessible
    window.openSettings = openSettings;
    
    // Make available early
    if (typeof window.openSettings === 'undefined') {
      window.openSettings = openSettings;
    }
    
    function closeSettings() {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
      // Restore body scroll
      document.body.style.overflow = '';
    }
    
    // Close settings on Escape key (only if settings is open)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display !== 'none' && settingsModal.classList.contains('show')) {
          closeSettings();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    function switchSettingsTab(tabName) {
      currentSettingsTab = tabName;
      document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.settings-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelector(`.settings-tab[data-tab="${tabName}"]`).classList.add('active');
      const tabContent = document.getElementById(`settings-${tabName}`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
      
      // Load dynamic content for specific tabs
      if (tabName === 'integrations') {
        renderIntegrationsList();
      } else if (tabName === 'timer') {
        renderTimerMethodsList();
      } else if (tabName === 'shortcuts') {
        if (window.renderShortcutsList) {
          window.renderShortcutsList();
        }
      } else if (tabName === 'ai') {
        // Load AI settings when AI tab is opened
        if (typeof loadAIConfig === 'function') {
          loadAIConfig();
        }
      }
    }
    
    // Make settings functions globally accessible
    window.switchSettingsTab = switchSettingsTab;
    window.closeSettings = closeSettings;
    
    // Render integrations list
    function renderIntegrationsList() {
      const container = document.getElementById('integrationsList');
      if (!container) return;
      
      container.innerHTML = '';
      
      Object.keys(INTEGRATION_PROVIDERS).forEach(providerId => {
        const provider = INTEGRATION_PROVIDERS[providerId];
        const isConnected = INTEGRATION_FRAMEWORK.connectedApps.has(providerId);
        const integration = INTEGRATION_FRAMEWORK.connectedApps.get(providerId);
        
        const card = document.createElement('div');
        card.style.cssText = 'background: var(--bg-primary); padding: 1.25rem; border-radius: 12px; border: 2px solid var(--bg-primary); display: flex; justify-content: space-between; align-items: center; transition: all 0.3s;';
        card.style.borderColor = isConnected ? 'var(--accent)' : 'var(--bg-primary)';
        
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <div style="font-size: 2rem;">${provider.icon}</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 0.25rem 0; color: var(--text-primary);">${provider.name}</h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${provider.description}</p>
              ${isConnected && integration.lastSync ? `
                <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">
                  Last synced: ${new Date(integration.lastSync).toLocaleString()}
                </p>
              ` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            ${isConnected ? `
              <button onclick="disconnectApp('${providerId}')" class="btn-modern" style="background: var(--error); color: white; font-size: 0.9rem;">
                Disconnect
              </button>
              <button onclick="syncHealthData('${providerId}')" class="btn-modern btn-modern-primary" style="font-size: 0.9rem;">
                Sync Now
              </button>
            ` : `
              <button onclick="connectToApp('${providerId}')" class="btn-modern btn-modern-primary" style="font-size: 0.9rem;">
                Connect
              </button>
            `}
          </div>
        `;
        
        container.appendChild(card);
      });
    }
    
    // Render timer methods list
    function renderTimerMethodsList() {
      const container = document.getElementById('timerMethodsList');
      if (!container) return;
      
      container.innerHTML = '';
      
      Object.keys(TIMER_METHODS).forEach(methodId => {
        const method = TIMER_METHODS[methodId];
        const isActive = currentTimerMethod === methodId;
        
        const card = document.createElement('div');
        card.style.cssText = `background: var(--bg-primary); padding: 1.25rem; border-radius: 12px; border: 2px solid ${isActive ? 'var(--accent)' : 'var(--bg-primary)'}; cursor: pointer; transition: all 0.3s;`;
        
        card.onclick = () => {
          initTimer(methodId);
          renderTimerMethodsList();
        };
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                ${method.name}
                ${isActive ? '<span style="color: var(--accent); font-size: 0.9rem;">(Active)</span>' : ''}
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${method.description}</p>
              ${method.workDuration ? `
                <div style="margin-top: 0.75rem; display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                  <span>Work: ${method.workDuration / 60} min</span>
                  ${method.shortBreak ? `<span>Break: ${method.shortBreak / 60} min</span>` : ''}
                  ${method.longBreak ? `<span>Long Break: ${method.longBreak / 60} min</span>` : ''}
                </div>
              ` : '<p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">Flexible duration - work until natural break</p>'}
            </div>
            ${isActive ? '<div style="color: var(--accent); font-size: 1.5rem;">✓</div>' : ''}
          </div>
        `;
        
        container.appendChild(card);
      });
    }
    
    // Disconnect app
    async function disconnectApp(providerId) {
      if (confirm(`Disconnect from ${INTEGRATION_PROVIDERS[providerId].name}?`)) {
        INTEGRATION_FRAMEWORK.connectedApps.delete(providerId);
        localStorage.removeItem(`integration_token_${providerId}`);
        
        // Save connected apps
        const apps = Array.from(INTEGRATION_FRAMEWORK.connectedApps.entries());
        localStorage.setItem('connectedApps', JSON.stringify(apps));
        
        renderIntegrationsList();
      }
    }
    
    // Make connectToApp and syncHealthData available globally
    // Note: These functions are defined in file_ops_storage - paper_progression_inline_part16.js
    // Add placeholders to prevent errors if called before part16 loads
    if (typeof window.connectToApp === 'undefined') {
      window.connectToApp = function(providerId) {
        console.warn('connectToApp not yet loaded from file_ops_storage, please wait...');
        // Will be replaced when part16 loads
      };
    }
    if (typeof window.disconnectApp === 'undefined') {
      window.disconnectApp = function(providerId) {
        console.warn('disconnectApp not yet loaded from file_ops_storage, please wait...');
      };
    }
    if (typeof window.syncHealthData === 'undefined') {
      window.syncHealthData = function(providerId) {
        console.warn('syncHealthData not yet loaded from file_ops_storage, please wait...');
      };
    }
    
    function updateSettingsThemeSelect() {
      const themeEl = document.getElementById('settings-theme');
      if (themeEl && typeof window.getCurrentTheme === 'function') {
        themeEl.value = window.getCurrentTheme();
      }
    }
    
    function loadSettings() {
      // Load from localStorage
      const theme = localStorage.getItem('theme') || (typeof window.getCurrentTheme === 'function' ? window.getCurrentTheme() : 'light');
      const fontSize = localStorage.getItem('fontSize') || 'medium';
      const sidebarOpen = localStorage.getItem('sidebarOpen') === 'true';
      
      // Load AI settings
      const aiProvider = localStorage.getItem('aiProvider') || 'openai';
      const aiModel = localStorage.getItem('aiModel') || 'gpt-3.5-turbo';
      const aiApiKey = localStorage.getItem('aiApiKey') || '';
      const aiAssistantLocation = localStorage.getItem('aiAssistantLocation') || 'chat';
      
      // Update UI
      const themeEl = document.getElementById('settings-theme');
      const fontSizeEl = document.getElementById('settings-fontSize');
      const sidebarOpenEl = document.getElementById('settings-sidebarOpen');
      if (themeEl) {
        themeEl.value = theme;
        // Update on theme change
        themeEl.onchange = function() {
          const current = typeof window.getCurrentTheme === 'function' ? window.getCurrentTheme() : 'light';
          if (current !== this.value && typeof window.toggleTheme === 'function') {
            window.toggleTheme();
          }
        };
      }
      if (fontSizeEl) fontSizeEl.value = fontSize;
      if (sidebarOpenEl) sidebarOpenEl.classList.toggle('active', sidebarOpen);
      
      // Update AI settings UI
      const aiProviderEl = document.getElementById('settings-aiProvider');
      const aiModelEl = document.getElementById('settings-aiModel');
      const aiApiKeyEl = document.getElementById('settings-apiKey');
      const aiLocationEl = document.getElementById('settings-aiAssistantLocation');
      if (aiProviderEl) aiProviderEl.value = aiProvider;
      if (aiModelEl) aiModelEl.value = aiModel;
      if (aiApiKeyEl) aiApiKeyEl.value = aiApiKey;
      if (aiLocationEl) aiLocationEl.value = aiAssistantLocation;
      
      // Update global AI config
      window.aiProvider = aiProvider;
      window.aiModel = aiModel;
      window.aiApiKey = aiApiKey;
      if (typeof loadAIConfig === 'function') {
        loadAIConfig();
      }
    }
    
    function saveSettings() {
      const theme = document.getElementById('settings-theme')?.value || 'light';
      const fontSize = document.getElementById('settings-fontSize')?.value || 'medium';
      const sidebarOpen = document.getElementById('settings-sidebarOpen')?.classList.contains('active') || false;
      
      // Get AI settings
      const aiProvider = document.getElementById('settings-aiProvider')?.value || 'openai';
      const aiModel = document.getElementById('settings-aiModel')?.value || 'gpt-3.5-turbo';
      const aiApiKey = document.getElementById('settings-apiKey')?.value || '';
      const aiAssistantLocation = document.getElementById('settings-aiAssistantLocation')?.value || 'chat';
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('fontSize', fontSize);
      localStorage.setItem('sidebarOpen', sidebarOpen);
      localStorage.setItem('aiProvider', aiProvider);
      localStorage.setItem('aiModel', aiModel);
      if (aiApiKey) {
        localStorage.setItem('aiApiKey', aiApiKey);
      }
      localStorage.setItem('aiAssistantLocation', aiAssistantLocation);
      
      // Update global AI config
      window.aiProvider = aiProvider;
      window.aiModel = aiModel;
      if (aiApiKey) {
        window.aiApiKey = aiApiKey;
      }
      if (typeof saveAIConfig === 'function') {
        saveAIConfig();
      }
      
      // Apply settings
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      document.body.style.fontSize = fontSize === 'small' ? '0.9rem' : fontSize === 'large' ? '1.1rem' : '1rem';
      
      if (sidebarOpen) {
        const sidebar = document.getElementById('fileExplorerSidebar');
        if (sidebar) {
          sidebar.classList.add('open');
        }
        document.body.classList.add('sidebar-open');
      }
      
      alert('Settings saved!');
    }
    
