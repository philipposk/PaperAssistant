// ============================================
// WELCOME CARD - First Time Visitor Introduction
// Shows ProjectHub introduction on first visit
// ============================================

function showWelcomeCard() {
  // Check if user has seen the welcome card before
  const hasSeenWelcome = localStorage.getItem('projecthub_welcome_seen');
  
  if (hasSeenWelcome === 'true') {
    return; // Don't show if already seen
  }
  
  // Create welcome card modal
  const welcomeCard = document.createElement('div');
  welcomeCard.id = 'welcome-card';
  welcomeCard.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100001;
    animation: fadeIn 0.3s ease;
    backdrop-filter: blur(4px);
  `;

  welcomeCard.innerHTML = `
    <div class="welcome-card-content" style="
      background: var(--bg-secondary);
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 600px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.4s ease;
      position: relative;
      border: 2px solid var(--accent);
    ">
      <button id="welcome-close-btn" style="
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
      " onmouseover="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)'" 
         onmouseout="this.style.background='transparent'; this.style.color='var(--text-secondary)'">
        ×
      </button>
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔬</div>
        <h1 style="
          margin: 0;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">Welcome to ProjectHub</h1>
      </div>
      
      <div style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 2rem;">
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 500;">
          Your comprehensive research management and analysis portal
        </p>
        
        <p style="margin-bottom: 1rem;">
          ProjectHub is a web-based platform designed for managing research projects, tracking paper development, 
          analyzing data, and organizing documentation—all in one centralized workspace.
        </p>
        
        <div style="margin: 1.5rem 0;">
          <h3 style="color: var(--text-primary); font-size: 1.1rem; margin-bottom: 0.75rem; font-weight: 600;">
            ✨ Key Features:
          </h3>
          <ul style="margin-left: 1.5rem; padding-left: 0.5rem;">
            <li style="margin-bottom: 0.5rem;"><strong>Project Organization</strong> — Organize and manage research projects, documents, and files</li>
            <li style="margin-bottom: 0.5rem;"><strong>Paper Development Tracking</strong> — Monitor paper progression with timelines, dashboards, and build guides</li>
            <li style="margin-bottom: 0.5rem;"><strong>Research Hub</strong> — Cross-referenced view of documents, papers, and research ideas</li>
            <li style="margin-bottom: 0.5rem;"><strong>Data Analysis Tools</strong> — Interactive tools for data quality checking, flagging analysis, and statistical exploration</li>
            <li style="margin-bottom: 0.5rem;"><strong>Document Management</strong> — File explorer, markdown support, and document editing</li>
            <li style="margin-bottom: 0.5rem;"><strong>AI Integration</strong> — AI assistant for research support and collaboration</li>
          </ul>
        </div>
        
        <p style="margin-top: 1.5rem; font-style: italic; color: var(--text-tertiary);">
          Perfect for academic researchers working with large datasets, multiple papers, and collaborative workflows.
        </p>
      </div>
      
      <div style="
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
      ">
        <button id="welcome-got-it-btn" style="
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px -2px rgba(59, 130, 246, 0.4)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(59, 130, 246, 0.3)'">
          Get Started →
        </button>
      </div>
    </div>
  `;

  // Add animations if not already in head
  if (!document.getElementById('welcome-card-styles')) {
    const style = document.createElement('style');
    style.id = 'welcome-card-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .welcome-card-content {
        scrollbar-width: thin;
        scrollbar-color: var(--text-tertiary) var(--bg-primary);
      }
      
      .welcome-card-content::-webkit-scrollbar {
        width: 8px;
      }
      
      .welcome-card-content::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 4px;
      }
      
      .welcome-card-content::-webkit-scrollbar-thumb {
        background: var(--text-tertiary);
        border-radius: 4px;
      }
      
      .welcome-card-content::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(welcomeCard);

  // Close handlers
  function closeWelcomeCard() {
    localStorage.setItem('projecthub_welcome_seen', 'true');
    welcomeCard.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      welcomeCard.remove();
    }, 300);
  }

  document.getElementById('welcome-close-btn').addEventListener('click', closeWelcomeCard);
  document.getElementById('welcome-got-it-btn').addEventListener('click', closeWelcomeCard);

  // Close on backdrop click
  welcomeCard.addEventListener('click', (e) => {
    if (e.target === welcomeCard) {
      closeWelcomeCard();
    }
  });

  // Add fadeOut animation
  if (!document.getElementById('welcome-card-fadeout')) {
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.id = 'welcome-card-fadeout';
    fadeOutStyle.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(fadeOutStyle);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showWelcomeCard);
} else {
  // DOM already loaded
  setTimeout(showWelcomeCard, 500); // Small delay to ensure styles are loaded
}

// Make function globally accessible for manual trigger if needed
window.showWelcomeCard = showWelcomeCard;

