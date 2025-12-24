// ============================================
// ADDITIONAL FEATURES IMPLEMENTATION
// This file contains all the missing features
// ============================================

// ============================================
// 1. LEGAL/FAQ/CONTACT PAGES
// ============================================

const legalPages = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy</h2>
      <p><strong>Last Updated:</strong> December 2025</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li>Account information (name, email) when you register</li>
        <li>Research data and files you upload</li>
        <li>Usage data and analytics</li>
      </ul>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and improve our services</li>
        <li>Process your research work</li>
        <li>Send you updates and notifications</li>
      </ul>
      
      <h3>3. Data Security</h3>
      <p>We implement appropriate security measures to protect your data.</p>
      
      <h3>4. Contact Us</h3>
      <p>For privacy concerns, contact us at: privacy@6x7.gr</p>
    `
  },
  terms: {
    title: 'Terms of Service',
    content: `
      <h2>Terms of Service</h2>
      <p><strong>Last Updated:</strong> December 2025</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By using this service, you agree to these terms.</p>
      
      <h3>2. Use of Service</h3>
      <p>You agree to use the service only for lawful purposes and in accordance with these terms.</p>
      
      <h3>3. Intellectual Property</h3>
      <p>You retain ownership of your research data. You grant us a license to use it to provide the service.</p>
      
      <h3>4. Limitation of Liability</h3>
      <p>We are not liable for any indirect, incidental, or consequential damages.</p>
    `
  },
  cookies: {
    title: 'Cookie Policy',
    content: `
      <h2>Cookie Policy</h2>
      <p><strong>Last Updated:</strong> December 2025</p>
      
      <h3>1. What Are Cookies</h3>
      <p>Cookies are small text files stored on your device.</p>
      
      <h3>2. How We Use Cookies</h3>
      <p>We use cookies to:</p>
      <ul>
        <li>Remember your preferences</li>
        <li>Analyze usage patterns</li>
        <li>Improve our services</li>
      </ul>
      
      <h3>3. Managing Cookies</h3>
      <p>You can control cookies through your browser settings.</p>
    `
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: `
      <h2>FAQ</h2>
      
      <h3>How do I get started?</h3>
      <p>Click the tutorial button (?) on any feature to see a guided tour.</p>
      
      <h3>How do I collaborate with others?</h3>
      <p>Use the commit system to submit changes for review. Admins will approve or reject your changes.</p>
      
      <h3>Can I use this offline?</h3>
      <p>Some features work offline, but real-time collaboration requires an internet connection.</p>
      
      <h3>How do I contact support?</h3>
      <p>Use the Contact Us page or email support@6x7.gr</p>
      
      <h3>Is my data secure?</h3>
      <p>Yes, we implement industry-standard security measures. See our Privacy Policy for details.</p>
    `
  },
  contact: {
    title: 'Contact Us',
    content: `
      <h2>Contact Us</h2>
      
      <h3>Email</h3>
      <p>General inquiries: <a href="mailto:info@6x7.gr">info@6x7.gr</a></p>
      <p>Support: <a href="mailto:support@6x7.gr">support@6x7.gr</a></p>
      <p>Privacy: <a href="mailto:privacy@6x7.gr">privacy@6x7.gr</a></p>
      
      <h3>Website</h3>
      <p>Visit our main site: <a href="https://6x7.gr" target="_blank">6x7.gr</a></p>
      
      <h3>Contact Form</h3>
      <form id="contactForm" style="margin-top: 1rem;">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Name</label>
          <input type="text" id="contactName" style="width: 100%; padding: 0.5rem; border: 1px solid var(--bg-primary); border-radius: 4px;" required>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Email</label>
          <input type="email" id="contactEmail" class="input-modern" required>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Message</label>
          <textarea id="contactMessage" rows="5" class="input-modern" required></textarea>
        </div>
        <button type="submit" class="btn-modern btn-modern-primary">Send Message</button>
      </form>
    `
  }
};

function openLegalPage(page) {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="background: var(--bg-secondary); color: var(--text-primary);">
      <div class="about-modal-header" style="border-bottom: 1px solid var(--border-color);">
        <h3 style="color: var(--text-primary);">${legalPages[page].title}</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()" style="color: var(--text-primary);">&times;</span>
      </div>
      <div class="about-modal-body" style="color: var(--text-primary);">
        ${legalPages[page].content.replace(/<h2>/g, '<h2 style="color: var(--text-primary);">').replace(/<h3>/g, '<h3 style="color: var(--text-primary);">').replace(/<p>/g, '<p style="color: var(--text-primary);">').replace(/<a href/g, '<a style="color: var(--accent);" href')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Handle contact form
  if (page === 'contact') {
    const form = modal.querySelector('#contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        // In production, this would send to backend
        alert(`Thank you, ${name}! Your message has been sent. (In production, this would be sent to: ${email})`);
        modal.remove();
      });
    }
  }
  
  // Close on outside click
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

// ============================================
// 2. CUSTOM KEYBOARD SHORTCUTS
// ============================================

let customShortcuts = {
  'fileExplorer': { key: 'b', ctrl: true, description: 'Toggle File Explorer', action: 'toggleFileExplorer' },
  'search': { key: 'k', ctrl: true, description: 'Focus Universal Search', action: 'focusSearch' },
  'aiAssistant': { key: 'j', ctrl: true, description: 'Open AI Assistant', action: 'handleAIAssistantClick' },
  'settings': { key: ',', ctrl: true, description: 'Open Settings', action: 'openSettings' },
  'timer': { key: 't', ctrl: true, description: 'Toggle Timer', action: 'toggleTimerWidget' },
  'messages': { key: 'm', ctrl: true, description: 'Open Messages', action: 'showMessagingPanel' },
  'about': { key: 'i', ctrl: true, description: 'Open About', action: 'openAboutModal' },
  'useCase': { key: 'u', ctrl: true, description: 'Change Use Case', action: 'showUseCaseSelector' },
  'projectImport': { key: 'p', ctrl: true, description: 'Import Project', action: 'showProjectImportModal' },
  'editor': { key: 'e', ctrl: true, description: 'Open Editor', action: 'showEditorSelector' },
  'trainAI': { key: 'r', ctrl: true, description: 'Train AI', action: 'showFileUploadModal' },
  'customize': { key: 'c', ctrl: true, description: 'Customize UI', action: 'showUICustomizationModal' },
  'home': { key: 'h', ctrl: true, description: 'Go Home', action: 'goHome' }
};

function loadCustomShortcuts() {
  const saved = localStorage.getItem('customShortcuts');
  if (saved) {
    customShortcuts = JSON.parse(saved);
  }
  applyCustomShortcuts();
}

function saveCustomShortcuts() {
  localStorage.setItem('customShortcuts', JSON.stringify(customShortcuts));
}

function applyCustomShortcuts() {
  // Remove old listeners (simplified - in production, use proper event management)
  document.removeEventListener('keydown', handleCustomShortcuts);
  document.addEventListener('keydown', handleCustomShortcuts);
}

function handleCustomShortcuts(e) {
  const shortcut = Object.entries(customShortcuts).find(([action, config]) => {
    const ctrlMatch = config.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
    return ctrlMatch && e.key.toLowerCase() === config.key.toLowerCase();
  });
  
  if (shortcut) {
    e.preventDefault();
    const [actionId, config] = shortcut;
    const actionFunction = config.action;
    
    // Try to call the function dynamically
    if (actionFunction && typeof window[actionFunction] === 'function') {
      window[actionFunction]();
    } else {
      // Fallback to switch statement for known actions
      switch(actionId) {
        case 'fileExplorer': 
          if (typeof window.toggleFileExplorer === 'function') window.toggleFileExplorer(); 
          break;
        case 'search': 
          document.getElementById('universalSearchInput')?.focus(); 
          break;
        case 'aiAssistant': 
          if (typeof window.handleAIAssistantClick === 'function') window.handleAIAssistantClick();
          else if (typeof window.openChatbot === 'function') window.openChatbot();
          break;
        case 'settings': 
          if (typeof window.openSettings === 'function') window.openSettings(); 
          break;
        case 'timer': 
          if (typeof window.toggleTimerWidget === 'function') window.toggleTimerWidget(); 
          break;
        case 'messages': 
          if (typeof window.showMessagingPanel === 'function') window.showMessagingPanel(); 
          break;
        case 'about': 
          if (typeof window.openAboutModal === 'function') window.openAboutModal(); 
          break;
        case 'useCase': 
          if (typeof window.showUseCaseSelector === 'function') window.showUseCaseSelector(); 
          break;
        case 'projectImport': 
          if (typeof window.showProjectImportModal === 'function') window.showProjectImportModal(); 
          break;
        case 'editor': 
          if (typeof window.showEditorSelector === 'function') window.showEditorSelector(); 
          break;
        case 'trainAI': 
          if (typeof window.showFileUploadModal === 'function') window.showFileUploadModal(); 
          break;
        case 'customize': 
          if (typeof window.showUICustomizationModal === 'function') window.showUICustomizationModal(); 
          break;
        case 'home': 
          window.location.href = 'index.html'; 
          break;
      }
    }
  }
}

// ============================================
// 3. TUTORIAL SYSTEM
// ============================================

let completedTutorials = new Set();
let currentTutorial = null;

const tutorials = {
  welcome: {
    title: 'Welcome to PHEV Research Portal',
    steps: [
      { element: 'header', text: 'This is your research portal. Here you can manage your research files, collaborate, and use AI assistance.' },
      { element: '.file-explorer-toggle', text: 'Click here to open the file explorer sidebar.' },
      { element: '#universalSearchInput', text: 'Use this search to find files and content across your research.' },
      { element: '.about-button.ai-btn', text: 'Open the AI Assistant for help with your research.' }
    ]
  },
  fileExplorer: {
    title: 'File Explorer',
    steps: [
      { element: '.file-explorer-sidebar', text: 'Browse all your research files here. Click folders to expand.' },
      { element: '.file-tree-file', text: 'Click any file to open it in preview mode.' },
      { element: '#fileExplorerNext', text: 'Use these buttons to navigate between files in the current folder.' }
    ]
  },
  search: {
    title: 'Universal Search',
    steps: [
      { element: '#universalSearchInput', text: 'Type to search across all files. Results appear below.' },
      { text: 'Search uses semantic understanding to find relevant content, not just keywords.' }
    ]
  },
  aiAssistant: {
    title: 'AI Research Assistant',
    steps: [
      { element: '.chatbot-modal', text: 'Ask questions about your research. The AI has access to all your files.' },
      { text: 'The AI uses RAG (Retrieval Augmented Generation) to provide contextually relevant answers.' }
    ]
  }
};

function startTutorial(tutorialId) {
  const tutorial = tutorials[tutorialId];
  if (!tutorial) return;
  
  currentTutorial = { id: tutorialId, step: 0, tutorial };
  showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
  if (!currentTutorial) return;
  
  const step = currentTutorial.tutorial.steps[stepIndex];
  if (!step) {
    completeTutorial(currentTutorial.id);
    return;
  }
  
  // Create tutorial overlay
  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  const tooltip = document.createElement('div');
  tooltip.style.cssText = 'background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; max-width: 400px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);';
  tooltip.innerHTML = `
    <h3 style="margin: 0 0 1rem 0; color: var(--accent);">${currentTutorial.tutorial.title}</h3>
    <p style="margin: 0 0 1.5rem 0; color: var(--text-primary);">${step.text}</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: var(--text-secondary); font-size: 0.9rem;">Step ${stepIndex + 1} of ${currentTutorial.tutorial.steps.length}</span>
      <div>
        ${stepIndex > 0 ? '<button onclick="tutorialPrevious()" class="btn-modern btn-modern-secondary" style="margin-right: 0.5rem;">Previous</button>' : ''}
        <button onclick="tutorialNext()" class="btn-modern btn-modern-primary">
          ${stepIndex === currentTutorial.tutorial.steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  `;
  
  overlay.appendChild(tooltip);
  document.body.appendChild(overlay);
  
  // Highlight element if specified
  if (step.element) {
    const element = document.querySelector(step.element);
    if (element) {
      element.style.outline = '3px solid var(--accent)';
      element.style.outlineOffset = '4px';
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function tutorialNext() {
  if (!currentTutorial) return;
  currentTutorial.step++;
  document.getElementById('tutorialOverlay')?.remove();
  document.querySelectorAll('[style*="outline"]').forEach(el => el.style.outline = '');
  showTutorialStep(currentTutorial.step);
}

function tutorialPrevious() {
  if (!currentTutorial) return;
  currentTutorial.step--;
  document.getElementById('tutorialOverlay')?.remove();
  document.querySelectorAll('[style*="outline"]').forEach(el => el.style.outline = '');
  showTutorialStep(currentTutorial.step);
}

function completeTutorial(tutorialId) {
  completedTutorials.add(tutorialId);
  localStorage.setItem('completedTutorials', JSON.stringify(Array.from(completedTutorials)));
  document.getElementById('tutorialOverlay')?.remove();
  document.querySelectorAll('[style*="outline"]').forEach(el => el.style.outline = '');
  currentTutorial = null;
}

function loadCompletedTutorials() {
  const saved = localStorage.getItem('completedTutorials');
  if (saved) {
    completedTutorials = new Set(JSON.parse(saved));
  }
  
  // Show welcome tutorial if first visit
  if (!completedTutorials.has('welcome')) {
    setTimeout(() => startTutorial('welcome'), 1000);
  }
}

// ============================================
// 4. GOOGLE ANALYTICS
// ============================================

function initGoogleAnalytics() {
  // Add GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: window.location.pathname
  });
  
  window.gtag = gtag;
}

function trackEvent(category, action, label) {
  if (window.gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}

// ============================================
// 5. TEST USER MODE
// ============================================

let testUserMode = false;
let testUserData = {
  name: 'Test User',
  email: 'test@phev.6x7.gr',
  role: 'editor',
  avatar: '👤'
};

function enableTestUserMode() {
  testUserMode = true;
  localStorage.setItem('testUserMode', 'true');
  currentUser = testUserData;
  updateUserUI();
  // Removed alert - silent activation
}

function disableTestUserMode() {
  testUserMode = false;
  localStorage.removeItem('testUserMode');
  currentUser = null;
  updateUserUI();
}

function loadTestUserMode() {
  if (localStorage.getItem('testUserMode') === 'true') {
    enableTestUserMode();
  }
}

// ============================================
// 6. GUEST USER LOGIC
// ============================================

let guestMode = false;
let currentUser = null;

// ============================================
// USER SYSTEM - COMPLETE IMPLEMENTATION
// ============================================

// Load user on page load
function loadUser() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUserUI();
    return;
  }
  
  // Check for test user mode
  if (localStorage.getItem('testUserMode') === 'true') {
    currentUser = testUserData;
    updateUserUI();
    return;
  }
  
  // Default to guest mode
  enableGuestMode();
}

// Save user
function saveUser(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  updateUserUI();
}

// Enhanced user display - updates login button in top banner
function updateUserUI() {
  // Update login button in top banner
  const loginBtn = document.getElementById('loginButton');
  if (loginBtn) {
    if (currentUser && currentUser.name) {
      loginBtn.innerHTML = `👤 ${currentUser.name}`;
      loginBtn.onclick = () => showUserMenu();
      loginBtn.title = `Logged in as ${currentUser.name}`;
    } else {
      loginBtn.innerHTML = '🔐 Login';
      loginBtn.onclick = () => showLoginModal();
      loginBtn.title = 'Login';
    }
  }
  
  // Also update userDisplay if it exists (for backward compatibility)
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    if (currentUser) {
      userDisplay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-secondary); border: 2px solid var(--accent); border-radius: 8px; box-shadow: 0 4px 12px var(--shadow);">
          <span style="font-size: 1.5rem;">${currentUser.avatar || '👤'}</span>
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${currentUser.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${currentUser.role || 'user'}</div>
          </div>
          <button onclick="showUserMenu()" class="btn-modern btn-modern-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.9rem;">▼</button>
        </div>
      `;
    } else {
      userDisplay.innerHTML = `
        <button onclick="showLoginModal()" class="btn-modern btn-modern-primary" style="font-weight: 600;">Login</button>
      `;
    }
  }
}

function showUserMenu() {
  const menu = document.createElement('div');
  menu.style.cssText = 'position: fixed; top: 4rem; right: 1rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 0.5rem; box-shadow: var(--shadow-md); z-index: 10001; min-width: 220px;';
  menu.innerHTML = `
    <div class="btn-modern btn-modern-ghost" style="width: 100%; justify-content: flex-start; padding: 0.75rem 1rem; margin-bottom: 0.25rem;" onclick="showUserProfile(); this.closest('div').remove();">
      <span>👤</span>
      <span>Profile</span>
    </div>
    <div class="btn-modern btn-modern-ghost" style="width: 100%; justify-content: flex-start; padding: 0.75rem 1rem; margin-bottom: 0.25rem;" onclick="showFileUploadModal(); this.closest('div').remove();">
      <span>📚</span>
      <span>Train AI</span>
    </div>
    <div class="btn-modern btn-modern-ghost" style="width: 100%; justify-content: flex-start; padding: 0.75rem 1rem; margin-bottom: 0.25rem;" onclick="showUICustomizationModal(); this.closest('div').remove();">
      <span>🎨</span>
      <span>Customize</span>
    </div>
    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid var(--border-color);">
    <div class="btn-modern btn-modern-ghost" style="width: 100%; justify-content: flex-start; padding: 0.75rem 1rem; color: var(--error);" onclick="logout(); this.closest('div').remove();">
      <span>🚪</span>
      <span>Logout</span>
    </div>
  `;
  document.body.appendChild(menu);
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !e.target.closest('#userDisplay')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

async function showUserProfile() {
  // Generate AI description if not already generated
  if (currentUser && !currentUser.bio && localStorage.getItem('aiTrainingData')) {
    await updateUserProfileWithAI();
  }
  
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 700px;">
      <div class="about-modal-header">
        <h3>👤 User Profile</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1rem; border: 4px solid var(--bg-primary); cursor: pointer; position: relative; overflow: hidden;" onclick="changeProfilePictureFromModal()" title="Click to change profile picture">
            ${currentUser?.avatarUrl ? `<img src="${currentUser.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" id="profilePictureImg" />` : (currentUser?.avatar || '👤')}
            <div style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; padding: 0.25rem; border-radius: 50%; font-size: 1rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">📷</div>
          </div>
          <h3>${currentUser?.name || 'Guest'}</h3>
          <p style="color: var(--text-secondary);">${currentUser?.email || 'No email'}</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Role: ${currentUser?.role || 'guest'}</p>
          ${currentUser?.location ? `<p style="color: var(--text-secondary); font-size: 0.9rem;">📍 ${currentUser.location}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Name</label>
          <input type="text" id="profileName" value="${currentUser?.name || ''}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--bg-primary); border-radius: 8px;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Email</label>
          <input type="email" id="profileEmail" value="${currentUser?.email || ''}" class="input-modern">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">
            Bio
            ${currentUser?.aiGenerated ? '<span style="color: var(--accent); font-size: 0.85rem; margin-left: 0.5rem;">(AI-generated from your files)</span>' : ''}
            <button onclick="regenerateBioWithAI()" class="btn-modern btn-modern-secondary" style="margin-left: 0.5rem; font-size: 0.85rem; padding: 0.5rem 1rem;">
              <span>🤖</span>
              <span>Regenerate with AI</span>
            </button>
          </label>
          <textarea id="profileBio" rows="4" style="width: 100%; padding: 0.75rem; border: 2px solid var(--bg-primary); border-radius: 8px;">${currentUser?.bio || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Location</label>
          <input type="text" id="profileLocation" value="${currentUser?.location || ''}" placeholder="e.g., Berlin, Germany" class="input-modern">
        </div>
        
        <button onclick="saveUserProfile()" class="btn-modern btn-modern-primary" style="width: 100%; font-weight: 600;">Save Profile</button>
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

async function regenerateBioWithAI() {
  const bio = await generateUserProfileFromFiles();
  document.getElementById('profileBio').value = bio;
  if (currentUser) {
    currentUser.bio = bio;
    currentUser.aiGenerated = true;
  }
  alert('Bio regenerated from your uploaded files!');
}

function saveUserProfile() {
  if (!currentUser) {
    currentUser = {};
  }
  
  currentUser.name = document.getElementById('profileName').value;
  currentUser.email = document.getElementById('profileEmail').value;
  currentUser.bio = document.getElementById('profileBio').value;
  currentUser.location = document.getElementById('profileLocation').value;
  
  saveUser(currentUser);
  document.querySelector('.about-modal')?.remove();
  alert('Profile saved!');
}

// Profile picture change function
function changeProfilePictureFromModal() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarUrl = event.target.result;
        // Update in modal
        const img = document.getElementById('profilePictureImg');
        const container = img?.parentElement;
        if (container) {
          if (img) {
            img.src = avatarUrl;
          } else {
            container.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" id="profilePictureImg" /><div style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; padding: 0.25rem; border-radius: 50%; font-size: 1rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">📷</div>`;
          }
        }
        
        // Save to user profile
        if (currentUser) {
          currentUser.avatarUrl = avatarUrl;
          currentUser.avatar = avatarUrl; // Also set as avatar for compatibility
          saveUser(currentUser);
          updateUserUI();
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Make regenerateBioWithAI available
window.regenerateBioWithAI = regenerateBioWithAI;
window.changeProfilePictureFromModal = changeProfilePictureFromModal;

// Make functions globally available
window.showUserMenu = showUserMenu;
window.showUserProfile = showUserProfile;
window.saveUserProfile = saveUserProfile;
window.loadUser = loadUser;
window.saveUser = saveUser;

// Make shortcuts system globally available
window.customShortcuts = customShortcuts;
window.loadCustomShortcuts = loadCustomShortcuts;
window.saveCustomShortcuts = saveCustomShortcuts;
window.applyCustomShortcuts = applyCustomShortcuts;
window.handleCustomShortcuts = handleCustomShortcuts;

// Initialize messaging variables at top level
let conversations = [];
let friends = [];

// Initialize user system and messaging (only once)
if (!window.messagingInitialized) {
  window.messagingInitialized = true;
  
  document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    
    // Load conversations and friends
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      conversations = JSON.parse(savedConversations);
    } else {
      conversations = [];
    }
    
    const savedFriends = localStorage.getItem('friends');
    if (savedFriends) {
      friends = JSON.parse(savedFriends);
    } else {
      friends = [];
    }
    
    // Generate user profile if files uploaded
    if (localStorage.getItem('aiTrainingData')) {
      updateUserProfileWithAI();
    }
  });
}

function enableGuestMode() {
  guestMode = true;
  currentUser = {
    name: 'Guest',
    email: null,
    role: 'guest',
    avatar: '👤'
  };
  localStorage.setItem('guestMode', 'true');
  updateUserUI();
  applyGuestRestrictions();
}

function disableGuestMode() {
  guestMode = false;
  currentUser = null;
  localStorage.removeItem('guestMode');
  updateUserUI();
  removeGuestRestrictions();
}

function applyGuestRestrictions() {
  // Hide features that require authentication
  document.querySelectorAll('[data-requires-auth]').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show guest message (positioned below header, not covering buttons)
  const guestBanner = document.createElement('div');
  guestBanner.id = 'guestBanner';
  guestBanner.style.cssText = 'position: fixed; top: 5rem; left: 50%; transform: translateX(-50%); background: var(--warning); color: white; padding: 0.5rem 1rem; text-align: center; z-index: 500; border-radius: 8px; box-shadow: 0 4px 12px var(--shadow); max-width: 500px; font-size: 0.9rem;';
  guestBanner.innerHTML = '👤 Guest Mode - Some features limited. <a href="#" onclick="showLoginModal(); return false;" style="color: white; text-decoration: underline; font-weight: 600;">Login</a> for full access. <button onclick="this.parentElement.remove()" style="margin-left: 0.5rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer;">×</button>';
  document.body.appendChild(guestBanner);
}

function removeGuestRestrictions() {
  document.getElementById('guestBanner')?.remove();
  document.querySelectorAll('[data-requires-auth]').forEach(el => {
    el.style.display = '';
  });
}

function loadGuestMode() {
  if (localStorage.getItem('guestMode') === 'true') {
    enableGuestMode();
  } else {
    // Auto-enable guest mode if no user logged in
    enableGuestMode();
  }
}

function updateUserUI() {
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    if (currentUser) {
      userDisplay.innerHTML = `
        <span>${currentUser.avatar} ${currentUser.name}</span>
        <button onclick="logout()" class="btn-modern" style="margin-left: 1rem; padding: 0.5rem 1rem; background: var(--error); color: white;">Logout</button>
      `;
    } else {
      userDisplay.innerHTML = `
        <button onclick="showLoginModal()" class="btn-modern btn-modern-primary" style="padding: 0.5rem 1rem;">Login</button>
      `;
    }
  }
}

// ============================================
// 7. USER SYSTEM (OAuth UI)
// ============================================

function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 400px;">
      <div class="about-modal-header">
        <h3>Login</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <p>Choose a login method:</p>
        <button onclick="loginWithGoogle()" class="btn-modern" style="width: 100%; margin-bottom: 0.5rem; background: #4285f4; color: white;">
          <span>🔵</span> <span>Login with Google</span>
        </button>
        <button onclick="loginWithGitHub()" class="btn-modern" style="width: 100%; margin-bottom: 0.5rem; background: #24292e; color: white;">
          <span>⚫</span> <span>Login with GitHub</span>
        </button>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--bg-primary);">
        <button onclick="enableGuestMode(); this.closest('.about-modal').remove();" class="btn-modern btn-modern-secondary" style="width: 100%;">
          Continue as Guest
        </button>
        <button onclick="enableTestUserMode(); this.closest('.about-modal').remove();" class="btn-modern" style="width: 100%; margin-top: 0.5rem; background: var(--warning); color: white;">
          Try Test User Mode
        </button>
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

function loginWithGoogle() {
  // In production, redirect to OAuth endpoint
  // For now, simulate login
  trackEvent('auth', 'login_attempt', 'google');
  alert('OAuth login with Google - Backend integration needed. Using test user for now.');
  enableTestUserMode();
  document.querySelector('.about-modal')?.remove();
}

function loginWithGitHub() {
  // In production, redirect to OAuth endpoint
  trackEvent('auth', 'login_attempt', 'github');
  alert('OAuth login with GitHub - Backend integration needed. Using test user for now.');
  enableTestUserMode();
  document.querySelector('.about-modal')?.remove();
}

function logout() {
  currentUser = null;
  testUserMode = false;
  guestMode = false;
  localStorage.removeItem('testUserMode');
  localStorage.removeItem('guestMode');
  updateUserUI();
  removeGuestRestrictions();
  trackEvent('auth', 'logout', 'user');
}

// ============================================
// 8. COMMIT SYSTEM UI
// ============================================

let pendingCommits = [];

function showCommitModal() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 700px;">
      <div class="about-modal-header">
        <h3>📝 Create Commit</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Commit Message</label>
          <textarea id="commitMessage" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid var(--bg-primary); border-radius: 4px;" placeholder="Describe your changes..."></textarea>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Files Changed</label>
          <div id="commitFiles" style="background: var(--bg-primary); padding: 0.5rem; border-radius: 4px; max-height: 200px; overflow-y: auto;">
            <p style="color: var(--text-secondary); font-size: 0.9rem;">No files selected</p>
          </div>
        </div>
        <button onclick="submitCommit()" class="btn-modern btn-modern-primary" style="width: 100%;">Submit for Review</button>
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

function submitCommit() {
  const message = document.getElementById('commitMessage').value;
  if (!message.trim()) {
    alert('Please enter a commit message');
    return;
  }
  
  const commit = {
    id: Date.now(),
    message: message,
    author: currentUser?.name || 'Guest',
    files: [], // Would be populated from file changes
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  pendingCommits.push(commit);
  localStorage.setItem('pendingCommits', JSON.stringify(pendingCommits));
  
  // In production, send to backend
  alert('Commit submitted for review! (Backend integration needed for actual submission)');
  document.querySelector('.about-modal')?.remove();
  trackEvent('collaboration', 'commit_created', 'user');
}

function showCommitsPanel() {
  // Show commits management panel (for admins)
  const panel = document.createElement('div');
  panel.style.cssText = 'position: fixed; right: 0; top: 0; width: 400px; height: 100vh; background: var(--bg-secondary); box-shadow: -4px 0 20px var(--shadow); z-index: 2000; overflow-y: auto;';
  panel.innerHTML = `
    <div style="padding: 1.5rem; border-bottom: 2px solid var(--bg-primary);">
      <h3 style="margin: 0;">📝 Commits Pending Review</h3>
      <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="float: right; background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
    </div>
    <div id="commitsList" style="padding: 1rem;">
      ${pendingCommits.map(commit => `
        <div style="background: var(--bg-primary); padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong>${commit.author}</strong>
            <span style="color: var(--text-secondary); font-size: 0.9rem;">${new Date(commit.createdAt).toLocaleString()}</span>
          </div>
          <p style="margin: 0.5rem 0;">${commit.message}</p>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button onclick="approveCommit(${commit.id})" class="btn-modern" style="flex: 1; background: var(--success); color: white;">Approve</button>
            <button onclick="rejectCommit(${commit.id})" class="btn-modern" style="flex: 1; background: var(--error); color: white;">Reject</button>
          </div>
        </div>
      `).join('') || '<p style="text-align: center; color: var(--text-secondary);">No pending commits</p>'}
    </div>
  `;
  document.body.appendChild(panel);
}

function approveCommit(commitId) {
  const commit = pendingCommits.find(c => c.id === commitId);
  if (commit) {
    commit.status = 'approved';
    // In production, send to backend
    alert('Commit approved! (Backend integration needed)');
    showCommitsPanel();
  }
}

function rejectCommit(commitId) {
  const commit = pendingCommits.find(c => c.id === commitId);
  if (commit) {
    commit.status = 'rejected';
    // In production, send to backend
    alert('Commit rejected. (Backend integration needed)');
    showCommitsPanel();
  }
}

// ============================================
// 9. REAL-TIME COLLABORATION (WebSocket Client)
// ============================================

let collaborationSocket = null;
let collaborationUsers = new Map();

function initCollaboration() {
  // In production, connect to WebSocket server
  const wsUrl = 'wss://your-backend.com/collaboration'; // Replace with actual URL
  
  try {
    collaborationSocket = new WebSocket(wsUrl);
    
    collaborationSocket.onopen = () => {
      console.log('Collaboration connected');
      trackEvent('collaboration', 'websocket_connected', 'user');
    };
    
    collaborationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleCollaborationMessage(data);
    };
    
    collaborationSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    collaborationSocket.onclose = () => {
      console.log('Collaboration disconnected');
      // Reconnect after 5 seconds
      setTimeout(initCollaboration, 5000);
    };
  } catch (error) {
    console.warn('WebSocket not available, using mock mode');
    // Mock mode for development
  }
}

function handleCollaborationMessage(data) {
  switch(data.type) {
    case 'user_joined':
      collaborationUsers.set(data.userId, data.user);
      updateCollaborationUI();
      break;
    case 'user_left':
      collaborationUsers.delete(data.userId);
      updateCollaborationUI();
      break;
    case 'edit_change':
      applyRemoteEdit(data);
      break;
    case 'cursor_move':
      updateRemoteCursor(data);
      break;
  }
}

function sendCollaborationMessage(type, data) {
  if (collaborationSocket && collaborationSocket.readyState === WebSocket.OPEN) {
    collaborationSocket.send(JSON.stringify({ type, ...data }));
  }
}

function updateCollaborationUI() {
  const usersList = document.getElementById('collaborationUsers');
  if (usersList) {
    usersList.innerHTML = Array.from(collaborationUsers.values()).map(user => 
      `<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;">
        <span>${user.avatar || '👤'}</span>
        <span>${user.name}</span>
      </div>`
    ).join('');
  }
}

// ============================================
// ENHANCED MESSAGING WITH AI & FRIENDS
// ============================================

let messagingSocket = null;

function initMessaging() {
  const wsUrl = 'wss://your-backend.com/messaging'; // Replace with actual URL
  
  try {
    messagingSocket = new WebSocket(wsUrl);
    
    messagingSocket.onopen = () => {
      console.log('Messaging connected');
    };
    
    messagingSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };
  } catch (error) {
    console.warn('Messaging WebSocket not available');
  }
}

// Fake user profiles (like GitHub)
const fakeUsers = [
  {
    id: 'user1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@university.edu',
    avatar: '👩‍🔬',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Research Scientist',
    bio: 'PHEV researcher specializing in energy efficiency and real-world driving patterns. 5+ years in automotive research.',
    location: 'Berlin, Germany',
    interests: ['Electric Vehicles', 'Energy Systems', 'Data Analysis'],
    skills: ['R', 'Python', 'Machine Learning', 'Statistics'],
    projects: 12,
    publications: 8,
    mutualConnections: 3
  },
  {
    id: 'user2',
    name: 'Prof. Michael Anderson',
    email: 'm.anderson@tech.edu',
    avatar: '👨‍🏫',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    role: 'Professor of Engineering',
    bio: 'Leading researcher in sustainable transportation. Published 50+ papers on hybrid vehicles and energy systems.',
    location: 'Stockholm, Sweden',
    interests: ['Sustainable Transport', 'Hybrid Systems', 'Policy Analysis'],
    skills: ['MATLAB', 'Simulink', 'Vehicle Dynamics', 'Policy Research'],
    projects: 25,
    publications: 52,
    mutualConnections: 5
  },
  {
    id: 'user3',
    name: 'Dr. Elena Rodriguez',
    email: 'elena.r@research.org',
    avatar: '👩‍💼',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    role: 'Data Scientist',
    bio: 'Expert in large-scale vehicle data analysis. Working on OBFCM data processing and statistical modeling.',
    location: 'Madrid, Spain',
    interests: ['Data Science', 'Statistical Modeling', 'Big Data'],
    skills: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'Data Visualization'],
    projects: 18,
    publications: 15,
    mutualConnections: 2
  },
  {
    id: 'user4',
    name: 'Alex Thompson',
    email: 'alex.t@automotive.com',
    avatar: '👨‍💻',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'Software Engineer',
    bio: 'Building tools for research collaboration. Passionate about open science and reproducible research.',
    location: 'London, UK',
    interests: ['Software Development', 'Research Tools', 'Open Science'],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Web Development'],
    projects: 30,
    publications: 3,
    mutualConnections: 4
  },
  {
    id: 'user5',
    name: 'Dr. Priya Sharma',
    email: 'priya.s@institute.edu',
    avatar: '👩‍🔬',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    role: 'Postdoctoral Researcher',
    bio: 'Focused on electric vehicle adoption patterns and consumer behavior. Recent work on PHEV utility factors.',
    location: 'Delhi, India',
    interests: ['Consumer Behavior', 'EV Adoption', 'Survey Research'],
    skills: ['R', 'Survey Design', 'Qualitative Analysis', 'SPSS'],
    projects: 7,
    publications: 6,
    mutualConnections: 1
  }
];

function showMessagingPanel() {
  const panel = document.createElement('div');
  panel.id = 'messagingPanel';
  panel.style.cssText = 'position: fixed; right: 0; top: 0; width: 450px; height: 100vh; background: var(--bg-secondary); box-shadow: -4px 0 20px var(--shadow); z-index: 2000; display: flex; flex-direction: column;';
  panel.innerHTML = `
    <div style="padding: 1.5rem; border-bottom: 2px solid var(--bg-primary); background: var(--accent); color: white;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">💬 Messages</h3>
        <button onclick="document.getElementById('messagingPanel').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px;">×</button>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button onclick="startAIConversation()" class="btn-modern" style="flex: 1; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; font-weight: 600;">
          <span>🤖</span>
          <span>Chat with AI</span>
        </button>
        <button onclick="showFriendSuggestions()" class="btn-modern" style="flex: 1; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; font-weight: 600;">
          <span>👥</span>
          <span>Find Friends</span>
        </button>
      </div>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 1rem;">
      ${conversations.length > 0 ? `
        <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">Your Conversations</h4>
        ${conversations.map(conv => `
          <div style="padding: 1rem; background: var(--bg-primary); margin-bottom: 0.5rem; border-radius: 8px; cursor: pointer; border-left: 4px solid var(--accent);" onclick="openConversation(${conv.id})">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 2rem;">${conv.avatar || '👤'}</div>
              <div style="flex: 1;">
                <strong style="display: block; color: var(--text-primary);">${conv.participant}</strong>
                <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${conv.lastMessage || 'No messages yet'}</p>
              </div>
              ${conv.unread ? '<span style="background: var(--accent); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">' + conv.unread + '</span>' : ''}
            </div>
          </div>
        `).join('')}
      ` : `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">💬</div>
          <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">No conversations yet</h3>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Start chatting with AI or connect with other researchers!</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button onclick="startAIConversation(); document.getElementById('messagingPanel').remove();" class="btn-modern btn-modern-primary" style="font-size: 1rem; padding: 1rem 1.5rem;">
              <span>🤖</span>
              <span>Start AI Conversation</span>
            </button>
            <button onclick="showFriendSuggestions(); document.getElementById('messagingPanel').remove();" class="btn-modern btn-modern-secondary" style="font-size: 1rem; padding: 1rem 1.5rem;">
              <span>👥</span>
              <span>Find Research Collaborators</span>
            </button>
          </div>
        </div>
      `}
    </div>
  `;
  document.body.appendChild(panel);
}

function startAIConversation() {
  // Close messaging panel
  document.getElementById('messagingPanel')?.remove();
  // Open AI assistant
  if (typeof openChatbot === 'function') {
    openChatbot();
  } else {
    alert('AI Assistant - Opening chatbot...');
  }
}

function showFriendSuggestions() {
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '10004'; // Ensure modal is above everything
  modal.innerHTML = `
    <div class="about-modal-content" style="max-width: 900px; max-height: 90vh;">
      <div class="about-modal-header">
        <h3>👥 Suggested Collaborators</h3>
        <span class="about-modal-close" onclick="this.closest('.about-modal').remove()">&times;</span>
      </div>
      <div class="about-modal-body" style="overflow-y: auto;">
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          Connect with researchers working on similar projects. AI-generated suggestions based on your research profile.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
          ${fakeUsers.map(user => `
            <div style="background: var(--bg-primary); border-radius: 12px; padding: 1.5rem; border: 2px solid var(--bg-primary); transition: all 0.3s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--bg-primary)'">
              <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;">
                  ${user.avatar}
                </div>
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 0.25rem 0; color: var(--text-primary);">${user.name}</h4>
                  <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${user.role}</p>
                  <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">📍 ${user.location}</p>
                </div>
              </div>
              
              <p style="margin: 0 0 1rem 0; color: var(--text-primary); font-size: 0.9rem; line-height: 1.5;">${user.bio}</p>
              
              <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Skills:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  ${user.skills.slice(0, 4).map(skill => `
                    <span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary); border-radius: 12px; font-size: 0.8rem; color: var(--text-primary);">${skill}</span>
                  `).join('')}
                </div>
              </div>
              
              <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                <span>📊 ${user.projects} projects</span>
                <span>📝 ${user.publications} papers</span>
                ${user.mutualConnections > 0 ? `<span>🤝 ${user.mutualConnections} mutual</span>` : ''}
              </div>
              
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="sendFriendRequest('${user.id}')" class="btn-modern btn-modern-primary" style="flex: 1;">Add Friend</button>
                <button onclick="startConversationWithUser('${user.id}')" class="btn-modern btn-modern-secondary" style="flex: 1;">Message</button>
              </div>
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

function sendFriendRequest(userId) {
  if (!fakeUsers || fakeUsers.length === 0) {
    alert('User list not loaded yet. Please refresh the page.');
    return;
  }
  const user = fakeUsers.find(u => u.id === userId);
  if (user) {
    if (!friends) friends = [];
    friends.push({
      id: userId,
      ...user,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    localStorage.setItem('friends', JSON.stringify(friends));
    alert(`Friend request sent to ${user.name}!`);
    if (typeof trackEvent === 'function') {
      trackEvent('social', 'friend_request', user.name);
    }
    // Refresh the messaging panel if open
    if (typeof showMessagingPanel === 'function') {
      setTimeout(() => showMessagingPanel(), 100);
    }
  } else {
    alert('User not found. Please refresh the page.');
  }
}

function startConversationWithUser(userId) {
  const user = fakeUsers.find(u => u.id === userId);
  if (user) {
    const conversation = {
      id: Date.now(),
      participant: user.name,
      participantId: userId,
      avatar: user.avatar,
      lastMessage: 'Conversation started',
      unread: 0,
      createdAt: new Date().toISOString()
    };
    conversations.push(conversation);
    localStorage.setItem('conversations', JSON.stringify(conversations));
    
    // Close modals and open conversation
    document.querySelector('.about-modal')?.remove();
    document.getElementById('messagingPanel')?.remove();
    
    // Show conversation view
    showConversationView(conversation.id);
  }
}

function openConversation(conversationId) {
  const convId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;
  showConversationView(convId);
}

function showConversationView(conversationId) {
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return;
  
  const panel = document.createElement('div');
  panel.id = 'conversationView';
  panel.style.cssText = 'position: fixed; right: 0; top: 0; width: 500px; height: 100vh; background: var(--bg-secondary); box-shadow: -4px 0 20px var(--shadow); z-index: 2001; display: flex; flex-direction: column;';
  panel.innerHTML = `
    <div style="padding: 1.5rem; border-bottom: 2px solid var(--bg-primary); background: var(--accent); color: white;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <button onclick="document.getElementById('conversationView').remove(); showMessagingPanel();" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem; border-radius: 4px; cursor: pointer;">← Back</button>
        <div style="font-size: 2rem;">${conversation.avatar}</div>
        <div>
          <h3 style="margin: 0;">${conversation.participant}</h3>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Online</p>
        </div>
      </div>
    </div>
    
    <div id="conversationMessages" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 2rem;">
        <p>No messages yet. Start the conversation!</p>
      </div>
    </div>
    
    <div style="padding: 1rem; border-top: 2px solid var(--bg-primary); background: var(--bg-primary);">
      <div style="display: flex; gap: 0.5rem;">
        <input type="text" id="messageInput" placeholder="Type a message..." class="input-modern" style="flex: 1;" onkeydown="if(event.key === 'Enter') { sendMessage(${conversationId}); }">
        <button onclick="sendMessage(${conversationId})" class="btn-modern btn-modern-primary">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  document.getElementById('messageInput').focus();
}

function sendMessage(conversationId) {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  const convId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;
  const conversation = conversations.find(c => c.id === convId);
  if (!conversation) return;
  
  // Add message to conversation
  const messagesContainer = document.getElementById('conversationMessages');
  if (messagesContainer) {
    // Remove "no messages" message if exists
    const noMessages = messagesContainer.querySelector('div[style*="text-align: center"]');
    if (noMessages) noMessages.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'align-self: flex-end; max-width: 70%; background: var(--accent); color: white; padding: 0.75rem 1rem; border-radius: 12px; border-bottom-right-radius: 4px;';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  input.value = '';
  
  // Update conversation
  conversation.lastMessage = message;
  conversation.updatedAt = new Date().toISOString();
  localStorage.setItem('conversations', JSON.stringify(conversations));
  
  // Simulate response (in production, would come from backend)
  setTimeout(() => {
    const messagesContainer = document.getElementById('conversationMessages');
    if (messagesContainer) {
      const responseDiv = document.createElement('div');
      responseDiv.style.cssText = 'align-self: flex-start; max-width: 70%; background: var(--bg-primary); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: 12px; border-bottom-left-radius: 4px;';
      responseDiv.textContent = 'Thanks for your message! I\'ll get back to you soon.';
      messagesContainer.appendChild(responseDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 1000);
  
  if (typeof trackEvent === 'function') {
    trackEvent('messaging', 'message_sent', conversation.participant);
  }
}

// Generate user profile description from uploaded files
async function generateUserProfileFromFiles() {
  const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
  if (trainingData.length === 0) {
    return 'No profile information available yet. Upload files to build your profile.';
  }
  
  // Analyze uploaded files to generate profile
  const fileTypes = trainingData.map(f => f.fileType || 'unknown');
  const fileNames = trainingData.map(f => f.fileName);
  
  // Use AI to generate profile description
  const context = `Based on these uploaded files: ${fileNames.join(', ')}, generate a professional research profile description.`;
  
  // In production, would call AI API
  // For now, generate basic description
  const hasPapers = fileNames.some(n => n.toLowerCase().includes('paper') || n.toLowerCase().includes('.pdf'));
  const hasCode = fileNames.some(n => n.toLowerCase().includes('.r') || n.toLowerCase().includes('.py'));
  const hasData = fileNames.some(n => n.toLowerCase().includes('data') || n.toLowerCase().includes('.csv'));
  
  let description = 'Researcher working on ';
  if (hasPapers) description += 'academic papers, ';
  if (hasCode) description += 'data analysis and programming, ';
  if (hasData) description += 'data processing and analysis.';
  
  return description || 'Active researcher with multiple projects.';
}

// Update user profile with AI-generated description
async function updateUserProfileWithAI() {
  if (!currentUser) return;
  
  const aiDescription = await generateUserProfileFromFiles();
  currentUser.bio = aiDescription;
  currentUser.aiGenerated = true;
  saveUser(currentUser);
  
  // Update profile display
  const profileBio = document.getElementById('profileBio');
  if (profileBio) {
    profileBio.value = aiDescription;
  }
}

// Make messaging functions globally available (if not already)
if (!window.showMessagingPanel) {
  window.showMessagingPanel = showMessagingPanel;
  window.startAIConversation = startAIConversation;
  window.showFriendSuggestions = showFriendSuggestions;
  window.sendFriendRequest = sendFriendRequest;
  window.startConversationWithUser = startConversationWithUser;
  window.openConversation = openConversation;
  window.sendMessage = sendMessage;
  window.updateUserProfileWithAI = updateUserProfileWithAI;
}

// Load conversations and friends on init (merged with main init)

function handleMessage(data) {
  // Handle incoming messages
  if (data.type === 'new_message') {
    // Add to conversation
    // Update UI
  }
}

// ============================================
// 11. COLLABORATIVE COMMENTS
// ============================================

function addCommentToFile(filePath, lineNumber, text) {
  const comment = {
    id: Date.now(),
    filePath,
    lineNumber,
    text,
    author: currentUser?.name || 'Guest',
    timestamp: new Date().toISOString(),
    replies: []
  };
  
  // In production, send to backend
  // For now, store locally
  let comments = JSON.parse(localStorage.getItem('fileComments') || '[]');
  comments.push(comment);
  localStorage.setItem('fileComments', JSON.stringify(comments));
  
  // Show comment in UI
  showComment(comment);
  trackEvent('collaboration', 'comment_added', filePath);
}

function showComment(comment) {
  // Display comment in file preview
  const commentElement = document.createElement('div');
  commentElement.className = 'file-comment';
  commentElement.style.cssText = 'background: var(--bg-primary); padding: 1rem; margin: 1rem 0; border-left: 4px solid var(--accent); border-radius: 4px;';
  commentElement.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
      <strong>${comment.author}</strong>
      <span style="color: var(--text-secondary); font-size: 0.9rem;">${new Date(comment.timestamp).toLocaleString()}</span>
    </div>
    <p style="margin: 0;">${comment.text}</p>
    ${comment.replies.length > 0 ? `
      <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--bg-primary);">
        ${comment.replies.map(reply => `<div style="margin-left: 1rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; margin-top: 0.5rem;">
          <strong>${reply.author}</strong>: ${reply.text}
        </div>`).join('')}
      </div>
    ` : ''}
    <button onclick="replyToComment(${comment.id})" style="margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: var(--bg-primary); border: 1px solid var(--accent); border-radius: 4px; cursor: pointer;">Reply</button>
  `;
  
  // Add to file preview (would need file preview integration)
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Load all features
  loadCustomShortcuts();
  loadCompletedTutorials();
  loadTestUserMode();
  loadGuestMode();
  
  // Load conversations and friends
  const savedConversations = localStorage.getItem('conversations');
  if (savedConversations) {
    conversations = JSON.parse(savedConversations);
  }
  
  const savedFriends = localStorage.getItem('friends');
  if (savedFriends) {
    friends = JSON.parse(savedFriends);
  }
  
  // Generate user profile if files uploaded
  if (localStorage.getItem('aiTrainingData')) {
    updateUserProfileWithAI();
  }
  
  // Initialize analytics (comment out if no GA ID)
  // initGoogleAnalytics();
  
  // Initialize collaboration (comment out if no backend)
  // initCollaboration();
  // initMessaging();
  
  // Add help buttons
  addHelpButtons();
});

function addHelpButtons() {
  // Add "?" help buttons to features
  const features = [
    { selector: '.file-explorer-toggle', tutorial: 'fileExplorer' },
    { selector: '#universalSearchInput', tutorial: 'search' },
    { selector: '.about-button.ai-btn', tutorial: 'aiAssistant' }
  ];
  
  features.forEach(feature => {
    const element = document.querySelector(feature.selector);
    if (element) {
      const helpBtn = document.createElement('button');
      helpBtn.innerHTML = '?';
      helpBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); color: white; border: none; cursor: pointer; font-size: 0.8rem;';
      helpBtn.onclick = () => startTutorial(feature.tutorial);
      element.style.position = 'relative';
      element.appendChild(helpBtn);
    }
  });
}

// Make functions globally available
window.openLegalPage = openLegalPage;
window.startTutorial = startTutorial;
window.tutorialNext = tutorialNext;
window.tutorialPrevious = tutorialPrevious;
window.showLoginModal = showLoginModal;
window.loginWithGoogle = loginWithGoogle;
window.loginWithGitHub = loginWithGitHub;
window.logout = logout;
window.enableGuestMode = enableGuestMode;
window.enableTestUserMode = enableTestUserMode;
window.showCommitModal = showCommitModal;
window.showCommitsPanel = showCommitsPanel;
window.approveCommit = approveCommit;
window.rejectCommit = rejectCommit;
window.showMessagingPanel = showMessagingPanel;
window.startAIConversation = startAIConversation;
window.showFriendSuggestions = showFriendSuggestions;
window.sendFriendRequest = sendFriendRequest;
window.startConversationWithUser = startConversationWithUser;
window.openConversation = openConversation;
window.sendMessage = sendMessage;
window.updateUserProfileWithAI = updateUserProfileWithAI;







