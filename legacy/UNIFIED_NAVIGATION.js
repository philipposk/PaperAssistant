// ============================================
// UNIFIED NAVIGATION SYSTEM
// Reusable navigation component for all pages
// ============================================

function createUnifiedHeader() {
  // Check if header already exists
  if (document.getElementById('unified-header')) {
    return;
  }
  
  const header = document.createElement('header');
  header.id = 'unified-header';
  header.className = 'unified-header';
  header.innerHTML = `
    <div class="unified-header-top">
      <div class="unified-header-left">
        <a href="index.html" class="unified-logo" title="Home - Project Organizer">
          <span class="logo-icon">🔬</span>
          <span class="logo-text">PHEV Research Portal</span>
        </a>
      </div>
      <div class="unified-header-right">
        <button class="unified-nav-btn" onclick="if(typeof window.toggleFileExplorer === 'function') window.toggleFileExplorer(); else if(typeof window.initFileExplorerForHomepage === 'function') window.initFileExplorerForHomepage();" title="File Explorer (Ctrl+B)">
          📂 Files
        </button>
        <button class="unified-nav-btn" onclick="if(typeof window.toggleSearch === 'function') window.toggleSearch(); else if(typeof window.expandSearch === 'function') window.expandSearch();" title="Search (Ctrl+K)">
          🔍 Search
        </button>
        <button class="unified-nav-btn" onclick="showProfileMenu()" title="Profile" id="profileMenuBtn" style="position: relative;">
          <span id="profileAvatar" style="font-size: 1.5rem; cursor: pointer;">👤</span>
          <span id="profileName" style="display: none;"></span>
        </button>
        <button class="unified-nav-btn" onclick="if(typeof window.openSettings === 'function') window.openSettings();" title="Settings" id="unifiedSettingsBtn" style="${window.location.pathname.includes('paper_progression') ? 'display: none;' : ''}">
          ⚙️ Settings
        </button>
      </div>
    </div>
    <div class="unified-header-nav">
      <a href="index.html" class="unified-nav-link ${window.location.pathname.includes('index.html') || (window.location.pathname.endsWith('/') && !window.location.pathname.includes('paper_progression') && !window.location.pathname.includes('research_hub')) ? 'active' : ''}" title="Project Organizer">
        📁 Projects
      </a>
      <div class="unified-nav-dropdown">
        <button class="unified-nav-link" onclick="event.stopPropagation(); if(typeof window.togglePapersDropdown === 'function') window.togglePapersDropdown(); else togglePapersDropdown();" title="Papers">
          📄 Papers <span class="dropdown-arrow">▼</span>
        </button>
        <div class="unified-dropdown-menu" id="papersDropdown">
          <a href="paper_progression.html" class="unified-dropdown-item">📄 Paper A: Development Progression</a>
          <a href="#" class="unified-dropdown-item" onclick="alert('Paper B coming soon'); return false;">📄 Paper B (Coming Soon)</a>
          <a href="#" class="unified-dropdown-item" onclick="alert('Paper C coming soon'); return false;">📄 Paper C (Coming Soon)</a>
        </div>
      </div>
      <a href="research_hub.html" class="unified-nav-link ${window.location.pathname.includes('research_hub') ? 'active' : ''}" title="Research Hub">
        📚 Research Hub
      </a>
      <div class="unified-nav-dropdown">
        <button class="unified-nav-link ${window.location.pathname.includes('data-flagging') || window.location.pathname.includes('obfcm-quality-checker') ? 'active' : ''}" onclick="event.stopPropagation(); if(typeof window.toggleDataAnalysisDropdown === 'function') window.toggleDataAnalysisDropdown(); else toggleDataAnalysisDropdown();" title="Data Analysis">
          📊 Data Analysis <span class="dropdown-arrow">▼</span>
        </button>
        <div class="unified-dropdown-menu" id="dataAnalysisDropdown">
          <a href="data-flagging-results.html" class="unified-dropdown-item">📊 Main Results</a>
          <a href="data-flagging-readme.html" class="unified-dropdown-item">📖 Documentation</a>
          <a href="data-flagging-downloads.html" class="unified-dropdown-item">📥 Downloads & Resources</a>
          <a href="obfcm-quality-checker.html" class="unified-dropdown-item">🔍 Quality Checker Tool</a>
        </div>
      </div>
      <button class="unified-nav-link" onclick="if(typeof window.handleAIAssistantClick === 'function') window.handleAIAssistantClick(); else if(typeof window.openChatbot === 'function') window.openChatbot();" title="AI Assistant (Ctrl+J)">
        🤖 AI Assistant
      </button>
      <div class="unified-nav-dropdown">
        <button class="unified-nav-link" onclick="event.stopPropagation(); if(typeof window.toggleToolsDropdown === 'function') window.toggleToolsDropdown(); else toggleToolsDropdown();" title="More Tools">
          🛠️ More <span class="dropdown-arrow">▼</span>
        </button>
        <div class="unified-dropdown-menu" id="toolsDropdown">
          <a href="#" onclick="if(typeof window.openAboutModal === 'function') { window.openAboutModal(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">ℹ️ About</a>
          <a href="#" onclick="if(typeof window.showFileUploadModal === 'function') { window.showFileUploadModal(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">📚 Train AI</a>
          <a href="#" onclick="if(typeof window.showUseCaseSelector === 'function') { window.showUseCaseSelector(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">🎯 Use Case</a>
          <a href="#" onclick="event.preventDefault(); event.stopPropagation(); if(typeof window.showUICustomizationModal === 'function') { window.showUICustomizationModal(); } else { alert('UI Customization will be available soon'); } document.getElementById('toolsDropdown')?.parentElement?.classList.remove('open'); return false;" class="unified-dropdown-item">🎨 Customize</a>
          <a href="#" onclick="event.preventDefault(); event.stopPropagation(); if(typeof window.showVoiceFaceCloningModal === 'function') { window.showVoiceFaceCloningModal(); } else { alert('Voice & Face Cloning will be available soon'); } document.getElementById('toolsDropdown')?.parentElement?.classList.remove('open'); return false;" class="unified-dropdown-item">🎭 Clone</a>
          <a href="#" onclick="event.preventDefault(); event.stopPropagation(); if(typeof window.toggleTimerWidget === 'function') { window.toggleTimerWidget(); } else { alert('Timer widget will be available soon'); } document.getElementById('toolsDropdown')?.parentElement?.classList.remove('open'); return false;" class="unified-dropdown-item">⏱️ Timer</a>
          <a href="#" onclick="if(typeof window.toggleQuickAccessToolbar === 'function') { window.toggleQuickAccessToolbar(); } else { const toolbar = document.getElementById('quickAccessToolbar'); if(toolbar) { toolbar.style.display = toolbar.style.display === 'none' ? 'flex' : 'none'; toolbar.classList.toggle('show'); } } document.getElementById('toolsDropdown')?.parentElement?.classList.remove('open'); return false;" class="unified-dropdown-item">📋 Quick Tools Bar</a>
          <a href="#" onclick="if(typeof window.showProjectImportModal === 'function') { window.showProjectImportModal(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">📥 Import Project</a>
          <a href="#" onclick="if(typeof window.showEditorSelector === 'function') { window.showEditorSelector(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">✏️ Editor</a>
          <a href="#" onclick="if(typeof window.showMessagingPanel === 'function') { window.showMessagingPanel(); document.getElementById('toolsDropdown').parentElement.classList.remove('open'); } return false;" class="unified-dropdown-item">💬 Messages</a>
        </div>
      </div>
    </div>
  `;
  
  // Insert at the beginning of body
  document.body.insertBefore(header, document.body.firstChild);
  
  // Add styles if not already added
  if (!document.getElementById('unified-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'unified-nav-styles';
    style.textContent = `
      .unified-header {
        position: sticky;
        top: 0;
        z-index: 9999;
        background: var(--bg-secondary);
        border-bottom: 2px solid var(--border-color);
        box-shadow: var(--shadow-md);
      }
      
      .unified-nav-dropdown {
        position: relative;
        z-index: 10001;
      }
      
      /* Ensure text is visible in light mode */
      [data-theme="light"] .unified-header,
      body:not([data-theme="dark"]) .unified-header {
        background: #ffffff;
        color: #0f172a;
      }
      
      [data-theme="light"] .unified-header *,
      body:not([data-theme="dark"]) .unified-header * {
        color: #0f172a !important;
      }
      
      [data-theme="light"] .unified-nav-link,
      body:not([data-theme="dark"]) .unified-nav-link {
        color: #64748b !important;
      }
      
      [data-theme="light"] .unified-nav-link:hover,
      body:not([data-theme="dark"]) .unified-nav-link:hover {
        color: #0f172a !important;
      }
      
      [data-theme="light"] .unified-nav-btn,
      body:not([data-theme="dark"]) .unified-nav-btn {
        color: #0f172a !important;
        background: #f8fafc !important;
      }
      
      .unified-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-bottom: 1px solid var(--border-color);
      }
      
      .unified-header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .unified-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--text-primary) !important;
        font-weight: 700;
        font-size: 1.25rem;
        transition: var(--transition);
      }
      
      .unified-logo .logo-text {
        color: var(--text-primary) !important;
      }
      
      [data-theme="light"] .unified-logo,
      body:not([data-theme="dark"]) .unified-logo {
        color: #0f172a !important;
      }
      
      [data-theme="light"] .unified-logo .logo-text,
      body:not([data-theme="dark"]) .unified-logo .logo-text {
        color: #0f172a !important;
      }
      
      .unified-logo:hover {
        opacity: 0.8;
      }
      
      .logo-icon {
        font-size: 1.5rem;
      }
      
      .unified-header-right {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      
      .unified-nav-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-sm);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.875rem;
        transition: var(--transition);
        text-decoration: none;
      }
      
      .unified-nav-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent);
      }
      
      #profileAvatar {
        font-size: 1.25rem;
        cursor: pointer;
      }
      
      .unified-header-nav {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem 2rem;
        background: var(--bg-tertiary);
        overflow-x: auto;
      }
      
      .unified-nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: transparent;
        border: none;
        border-radius: var(--border-radius-sm);
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 0.9rem;
        text-decoration: none;
        transition: var(--transition);
        white-space: nowrap;
      }
      
      .unified-nav-link:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
      }
      
      .unified-nav-link.active {
        background: var(--accent);
        color: white;
      }
      
      .unified-nav-dropdown {
        position: relative;
      }
      
      .dropdown-arrow {
        font-size: 0.75rem;
        transition: transform 0.2s;
      }
      
      .unified-nav-dropdown.open .dropdown-arrow {
        transform: rotate(180deg);
      }
      
      .unified-dropdown-menu {
        position: fixed;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
        min-width: 280px;
        max-width: 400px;
        display: none;
        z-index: 10002 !important;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: calc(100vh - 120px);
        padding: 0.5rem 0;
      }
      
      /* Custom scrollbar for dropdown menu */
      .unified-dropdown-menu::-webkit-scrollbar {
        width: 8px;
      }
      
      .unified-dropdown-menu::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 4px;
      }
      
      .unified-dropdown-menu::-webkit-scrollbar-thumb {
        background: var(--text-tertiary);
        border-radius: 4px;
      }
      
      .unified-dropdown-menu::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
      }
      
      .unified-nav-dropdown.open .unified-dropdown-menu {
        display: block;
        animation: fadeInDown 0.2s ease;
      }
      
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .unified-dropdown-item {
        display: block;
        padding: 0.875rem 1.25rem;
        color: var(--text-primary);
        text-decoration: none;
        transition: var(--transition);
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
        cursor: pointer;
      }
      
      .unified-dropdown-item:last-child {
        border-bottom: none;
      }
      
      .unified-dropdown-item:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      
      .unified-dropdown-item:active {
        background: var(--accent);
        color: white;
      }
      
      @media (max-width: 768px) {
        .unified-header-top {
          padding: 0.75rem 1rem;
        }
        
        .unified-header-nav {
          padding: 0.5rem 1rem;
        }
        
        .logo-text {
          display: none;
        }
        
        .unified-nav-btn span:not(#profileAvatar) {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.unified-nav-dropdown') && !e.target.closest('.unified-dropdown-menu')) {
      document.querySelectorAll('.unified-nav-dropdown').forEach(dd => dd.classList.remove('open'));
    }
  });
  
  // Close dropdowns on scroll
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.unified-nav-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
    });
  }, true);
  
  // Reposition dropdowns on window resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.unified-nav-dropdown.open').forEach(dropdown => {
      const button = dropdown.querySelector('button');
      const menu = dropdown.querySelector('.unified-dropdown-menu');
      if (button && menu) {
        const rect = button.getBoundingClientRect();
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = rect.left + 'px';
        
        // Adjust if menu would go off screen
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
          menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.bottom > window.innerHeight) {
          menu.style.top = (rect.top - menuRect.height - 4) + 'px';
        }
      }
    });
  });
}

function toggleToolsDropdown() {
  // Find the More/Tools dropdown specifically (third dropdown after Papers and Data Analysis)
  const dropdowns = document.querySelectorAll('.unified-nav-dropdown');
  const toolsDropdown = dropdowns[2]; // Third one is More/Tools
  if (toolsDropdown) {
    const isOpening = !toolsDropdown.classList.contains('open');
    
    // Close other dropdowns
    dropdowns.forEach((dd, index) => {
      if (index !== 2) dd.classList.remove('open');
    });
    
    toolsDropdown.classList.toggle('open');
    
    // Position the dropdown menu if opening
    if (isOpening) {
      setTimeout(() => {
        const button = toolsDropdown.querySelector('button');
        const menu = toolsDropdown.querySelector('.unified-dropdown-menu');
        if (button && menu) {
          const rect = button.getBoundingClientRect();
          
          // Set initial position
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.left = rect.left + 'px';
          
          // Get menu dimensions (it should already be visible due to CSS)
          const menuRect = menu.getBoundingClientRect();
          
          // Adjust if menu would go off screen to the right
          if (menuRect.right > window.innerWidth - 10) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
          }
          
          // Adjust if menu would go off screen to the bottom
          if (menuRect.bottom > window.innerHeight - 10) {
            const newTop = rect.top - menuRect.height - 4;
            menu.style.top = (newTop > 10 ? newTop : 10) + 'px';
          }
          
          // Ensure menu doesn't go off screen to the left
          const finalLeft = parseFloat(menu.style.left) || rect.left;
          if (finalLeft < 10) {
            menu.style.left = '10px';
          }
        }
      }, 10);
    }
  }
}

// Make globally accessible IMMEDIATELY (before DOMContentLoaded)
window.toggleToolsDropdown = window.toggleToolsDropdown || toggleToolsDropdown;
window.togglePapersDropdown = window.togglePapersDropdown || togglePapersDropdown;
window.toggleDataAnalysisDropdown = window.toggleDataAnalysisDropdown || toggleDataAnalysisDropdown;

function togglePapersDropdown() {
  // Find the Papers dropdown specifically (first dropdown)
  const dropdowns = document.querySelectorAll('.unified-nav-dropdown');
  const papersDropdown = dropdowns[0]; // First one is Papers
  if (papersDropdown) {
    const isOpening = !papersDropdown.classList.contains('open');
    
    // Close other dropdowns
    dropdowns.forEach((dd, index) => {
      if (index !== 0) dd.classList.remove('open');
    });
    
    papersDropdown.classList.toggle('open');
    
    // Position the dropdown menu if opening
    if (isOpening) {
      setTimeout(() => {
        const button = papersDropdown.querySelector('button');
        const menu = papersDropdown.querySelector('.unified-dropdown-menu');
        if (button && menu) {
          const rect = button.getBoundingClientRect();
          
          // Set initial position
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.left = rect.left + 'px';
          
          // Get menu dimensions (it should already be visible due to CSS)
          const menuRect = menu.getBoundingClientRect();
          
          // Adjust if menu would go off screen to the right
          if (menuRect.right > window.innerWidth - 10) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
          }
          
          // Adjust if menu would go off screen to the bottom
          if (menuRect.bottom > window.innerHeight - 10) {
            const newTop = rect.top - menuRect.height - 4;
            menu.style.top = (newTop > 10 ? newTop : 10) + 'px';
          }
          
          // Ensure menu doesn't go off screen to the left
          const finalLeft = parseFloat(menu.style.left) || rect.left;
          if (finalLeft < 10) {
            menu.style.left = '10px';
          }
        }
      }, 10);
    }
  }
}

function toggleDataAnalysisDropdown() {
  // Find the Data Analysis dropdown specifically (second dropdown after Papers)
  const dropdowns = document.querySelectorAll('.unified-nav-dropdown');
  const dataAnalysisDropdown = dropdowns[1]; // Second one is Data Analysis
  if (dataAnalysisDropdown) {
    const isOpening = !dataAnalysisDropdown.classList.contains('open');
    
    // Close other dropdowns
    dropdowns.forEach((dd, index) => {
      if (index !== 1) dd.classList.remove('open');
    });
    
    dataAnalysisDropdown.classList.toggle('open');
    
    // Position the dropdown menu if opening
    if (isOpening) {
      setTimeout(() => {
        const button = dataAnalysisDropdown.querySelector('button');
        const menu = dataAnalysisDropdown.querySelector('.unified-dropdown-menu');
        if (button && menu) {
          const rect = button.getBoundingClientRect();
          
          // Set initial position
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.left = rect.left + 'px';
          
          // Get menu dimensions (it should already be visible due to CSS)
          const menuRect = menu.getBoundingClientRect();
          
          // Adjust if menu would go off screen to the right
          if (menuRect.right > window.innerWidth - 10) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
          }
          
          // Adjust if menu would go off screen to the bottom
          if (menuRect.bottom > window.innerHeight - 10) {
            const newTop = rect.top - menuRect.height - 4;
            menu.style.top = (newTop > 10 ? newTop : 10) + 'px';
          }
          
          // Ensure menu doesn't go off screen to the left
          const finalLeft = parseFloat(menu.style.left) || rect.left;
          if (finalLeft < 10) {
            menu.style.left = '10px';
          }
        }
      }, 10);
    }
  }
}

function showProfileMenu() {
  // Remove existing menu
  const existing = document.getElementById('profileDropdownMenu');
  if (existing) {
    existing.remove();
    return;
  }
  
  const menu = document.createElement('div');
  menu.id = 'profileDropdownMenu';
  menu.className = 'profile-dropdown-menu';
  menu.style.cssText = `
    position: fixed;
    top: 60px;
    right: 2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    z-index: 10002 !important;
    padding: 0.5rem;
    animation: fadeIn 0.2s ease;
  `;
  
  menu.innerHTML = `
    <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="position: relative; cursor: pointer;" onclick="changeProfilePicture()" title="Click to change profile picture">
          <span id="menuProfileAvatar" style="font-size: 2rem; display: block;">👤</span>
          <div style="position: absolute; bottom: -2px; right: -2px; background: var(--accent); color: white; padding: 0.15rem; border-radius: 50%; font-size: 0.75rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-secondary);">📷</div>
        </div>
        <div>
          <div id="menuProfileName" style="font-weight: 600; color: var(--text-primary);">Guest User</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Click avatar to change</div>
        </div>
      </div>
    </div>
    <a href="#" onclick="if(typeof window.showUserProfile === 'function') { window.showUserProfile(); document.getElementById('profileDropdownMenu')?.remove(); } else if(typeof window.openAboutModal === 'function') { window.openAboutModal(); document.getElementById('profileDropdownMenu')?.remove(); } return false;" style="display: block; padding: 0.75rem; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius-sm); transition: var(--transition);">
      👤 View Profile
    </a>
    <a href="#" onclick="if(typeof window.showFileUploadModal === 'function') { window.showFileUploadModal(); document.getElementById('profileDropdownMenu')?.remove(); } return false;" style="display: block; padding: 0.75rem; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius-sm); transition: var(--transition);">
      📚 Train AI
    </a>
    <a href="#" onclick="if(typeof window.openSettings === 'function') { window.openSettings(); document.getElementById('profileDropdownMenu')?.remove(); } return false;" style="display: block; padding: 0.75rem; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius-sm); transition: var(--transition);">
      ⚙️ Settings
    </a>
    <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem;">
      <a href="#" onclick="if(typeof window.logout === 'function') { window.logout(); } document.getElementById('profileDropdownMenu')?.remove(); return false;" style="display: block; padding: 0.75rem; color: var(--text-danger, #ef4444); text-decoration: none; border-radius: var(--border-radius-sm); transition: var(--transition);">
        🚪 Logout
      </a>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Load user data if available
  if (typeof window.loadUser === 'function') {
    const user = window.loadUser();
    if (user && user.name) {
      document.getElementById('menuProfileName').textContent = user.name;
      const avatarEl = document.getElementById('menuProfileAvatar');
      const headerAvatarEl = document.getElementById('profileAvatar');
      if (user.avatarUrl) {
        avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />`;
        headerAvatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`;
      } else if (user.avatar) {
        avatarEl.textContent = user.avatar;
        headerAvatarEl.textContent = user.avatar;
      }
    }
  }
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !e.target.closest('#profileMenuBtn')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

function changeProfilePicture() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarUrl = event.target.result;
        
        // Update avatar in profile menu
        const menuAvatar = document.getElementById('menuProfileAvatar');
        if (menuAvatar) {
          menuAvatar.innerHTML = `<img src="${avatarUrl}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />`;
        }
        
        // Update avatar in header
        const headerAvatar = document.getElementById('profileAvatar');
        if (headerAvatar) {
          headerAvatar.innerHTML = `<img src="${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`;
        }
        
        // Save to user profile
        if (typeof window.loadUser === 'function') {
          const user = window.loadUser() || {};
          user.avatar = avatarUrl;
          user.avatarUrl = avatarUrl;
          if (typeof window.saveUser === 'function') {
            window.saveUser(user);
          }
        }
        
        // Also save to localStorage directly
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.avatar = avatarUrl;
        currentUser.avatarUrl = avatarUrl;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update user display if it exists
        if (typeof window.updateUserUI === 'function') {
          window.updateUserUI();
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Make functions globally accessible
window.createUnifiedHeader = createUnifiedHeader;
window.togglePapersDropdown = togglePapersDropdown;
window.toggleDataAnalysisDropdown = toggleDataAnalysisDropdown;
window.toggleToolsDropdown = toggleToolsDropdown;
window.showProfileMenu = showProfileMenu;
window.changeProfilePicture = changeProfilePicture;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createUnifiedHeader();
    // Update profile avatar after user loads
    setTimeout(() => {
      if (typeof window.loadUser === 'function') {
        const user = window.loadUser();
        if (user) {
          const avatarEl = document.getElementById('profileAvatar');
          if (avatarEl && user.avatarUrl) {
            avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`;
          } else if (avatarEl && user.avatar) {
            avatarEl.textContent = user.avatar;
          }
        }
      }
    }, 500);
  });
} else {
  createUnifiedHeader();
  // Update profile avatar after user loads
  setTimeout(() => {
    if (typeof window.loadUser === 'function') {
      const user = window.loadUser();
      if (user) {
        const avatarEl = document.getElementById('profileAvatar');
        if (avatarEl && user.avatarUrl) {
          avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`;
        } else if (avatarEl && user.avatar) {
          avatarEl.textContent = user.avatar;
        }
      }
    }
  }, 500);
}







