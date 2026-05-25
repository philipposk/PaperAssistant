// ============================================
// BREADCRUMBS SYSTEM
// Adds breadcrumb navigation to all pages
// ============================================

function createBreadcrumbs() {
  // Check if breadcrumbs already exist
  if (document.getElementById('breadcrumbs')) {
    return;
  }
  
  const path = window.location.pathname;
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.id = 'breadcrumbs';
  breadcrumbs.className = 'breadcrumbs';
  
  let crumbs = [];
  
  // Home
  crumbs.push({ name: '🏠 Home', url: 'index.html' });
  
  // Current page
  if (path.includes('paper_progression.html')) {
    crumbs.push({ name: '📄 Paper A: Development Progression', url: null });
  } else if (path.includes('research_hub.html')) {
    crumbs.push({ name: '📚 Research Hub', url: null });
  } else if (path.includes('index.html') || path.endsWith('/')) {
    crumbs.push({ name: '📁 Project Organizer', url: null });
  }
  
  breadcrumbs.innerHTML = crumbs.map((crumb, index) => {
    if (crumb.url && index < crumbs.length - 1) {
      return `<a href="${crumb.url}" class="breadcrumb-link">${crumb.name}</a><span class="breadcrumb-separator">›</span>`;
    } else {
      return `<span class="breadcrumb-current">${crumb.name}</span>`;
    }
  }).join('');
  
  // Add styles if not already added
  if (!document.getElementById('breadcrumbs-styles')) {
    const style = document.createElement('style');
    style.id = 'breadcrumbs-styles';
    style.textContent = `
      .breadcrumbs {
        padding: 0.75rem 2rem;
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-color);
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .breadcrumb-link {
        color: var(--accent);
        text-decoration: none;
        transition: var(--transition);
      }
      
      .breadcrumb-link:hover {
        text-decoration: underline;
      }
      
      .breadcrumb-separator {
        color: var(--text-tertiary);
        margin: 0 0.25rem;
      }
      
      .breadcrumb-current {
        color: var(--text-primary);
        font-weight: 500;
      }
      
      @media (max-width: 768px) {
        .breadcrumbs {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Insert after unified header if it exists, otherwise at the beginning of body
  const header = document.getElementById('unified-header');
  if (header) {
    header.insertAdjacentElement('afterend', breadcrumbs);
  } else {
    document.body.insertBefore(breadcrumbs, document.body.firstChild);
  }
}

// Make function globally accessible
window.createBreadcrumbs = createBreadcrumbs;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(createBreadcrumbs, 100); // Wait for unified header
  });
} else {
  setTimeout(createBreadcrumbs, 100);
}






