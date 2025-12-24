// ============================================
// MODERN UI SYSTEM
// Modern button styles and UI components
// ============================================

// Add modern button styles to document
if (!document.getElementById('modern-ui-styles')) {
  const style = document.createElement('style');
  style.id = 'modern-ui-styles';
  style.textContent = `
    /* Modern Button System */
    .btn-modern {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5;
      border: none;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow);
      text-decoration: none;
      white-space: nowrap;
    }
    
    .btn-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: var(--accent-gradient);
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }
    
    .btn-modern > * {
      position: relative;
      z-index: 1;
    }
    
    .btn-modern-primary {
      background: var(--accent-gradient);
      color: white;
      box-shadow: var(--shadow-md);
    }
    
    .btn-modern-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-modern-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1.5px solid var(--border-color);
    }
    
    .btn-modern-secondary:hover {
      border-color: var(--accent);
      background: var(--bg-tertiary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .btn-modern-secondary:hover::before {
      left: 0;
    }
    
    .btn-modern-ghost {
      background: transparent;
      color: var(--text-primary);
      border: 1.5px solid transparent;
      box-shadow: none;
    }
    
    .btn-modern-ghost:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-modern:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-modern:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }
    
    /* Modern Tab System */
    .tab-modern {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: var(--transition);
      position: relative;
    }
    
    .tab-modern::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--accent-gradient);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .tab-modern:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }
    
    .tab-modern.active {
      color: var(--accent);
      font-weight: 600;
    }
    
    .tab-modern.active::after {
      width: 100%;
    }
    
    /* Modern Card System */
    .card-modern {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: var(--transition);
    }
    
    .card-modern:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .card-modern-interactive {
      cursor: pointer;
    }
    
    .card-modern-interactive:hover {
      border-color: var(--accent);
    }
    
    /* Modern Input System */
    .input-modern {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      background: var(--bg-secondary);
      border: 1.5px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      transition: var(--transition);
      outline: none;
      font-family: inherit;
      resize: vertical;
    }
    
    .input-modern:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .input-modern::placeholder {
      color: var(--text-tertiary);
    }
    
    textarea.input-modern {
      min-height: 100px;
      line-height: 1.5;
    }
    
    /* Modern Badge System */
    .badge-modern {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }
    
    .badge-modern-primary {
      background: var(--accent-gradient);
      color: white;
    }
    
    .badge-modern-success {
      background: var(--success);
      color: white;
    }
    
    .badge-modern-warning {
      background: var(--warning);
      color: white;
    }
    
    .badge-modern-error {
      background: var(--error);
      color: white;
    }
    
    /* Glassmorphism Effect */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    [data-theme="dark"] .glass {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Smooth Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out;
    }
    
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
    
    /* Modern Upload Tab Styles */
    .upload-tab-modern {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: var(--transition);
      position: relative;
    }
    
    .upload-tab-modern::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 0;
      height: 3px;
      background: var(--accent-gradient);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .upload-tab-modern:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }
    
    .upload-tab-modern.active {
      color: var(--accent);
      font-weight: 600;
    }
    
    .upload-tab-modern.active::after {
      width: 100%;
    }
    
    /* Modern Grid Cards */
    .grid-card-modern {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }
    
    .grid-card-modern:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      transform: translateY(-4px);
    }
    
    .grid-card-modern-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      filter: grayscale(0.2);
      transition: var(--transition);
    }
    
    .grid-card-modern:hover .grid-card-modern-icon {
      filter: grayscale(0);
      transform: scale(1.1);
    }
    
    .grid-card-modern-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    .grid-card-modern-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);
}

// Helper function to create modern buttons
function createModernButton(text, options = {}) {
  const {
    type = 'primary',
    icon = '',
    onclick = null,
    className = '',
    id = '',
    disabled = false
  } = options;
  
  const button = document.createElement('button');
  button.className = `btn-modern btn-modern-${type} ${className}`;
  if (id) button.id = id;
  if (disabled) button.disabled = true;
  if (onclick) button.onclick = onclick;
  
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    button.appendChild(iconSpan);
  }
  
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  button.appendChild(textSpan);
  
  return button;
}

// Export function
window.createModernButton = createModernButton;







