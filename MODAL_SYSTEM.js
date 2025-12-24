// ============================================
// MODAL SYSTEM
// Professional modal system to replace alert() calls
// ============================================

class ModalSystem {
  static showModal(options) {
    const {
      title = 'Information',
      message = '',
      type = 'info', // info, warning, error, success
      buttons = [{ text: 'OK', action: 'close', primary: true }],
      onClose = null
    } = options;

    // Remove existing modal if any
    const existing = document.getElementById('system-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'system-modal';
    modal.className = 'system-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      animation: fadeIn 0.2s ease;
    `;

    const iconMap = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };

    const colorMap = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981'
    };

    modal.innerHTML = `
      <div class="system-modal-content" style="
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: slideUp 0.3s ease;
      ">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2rem;">${iconMap[type] || iconMap.info}</div>
          <h3 style="margin: 0; color: var(--text-primary); font-size: 1.25rem; font-weight: 600;">${title}</h3>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">${message}</p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          ${buttons.map((btn, idx) => `
            <button class="modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}" 
                    onclick="window.modalSystem.handleButtonClick(${idx})" 
                    style="
                      padding: 0.625rem 1.25rem;
                      border: none;
                      border-radius: 8px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s;
                      ${btn.primary ? `background: ${colorMap[type] || colorMap.info}; color: white;` : 'background: var(--bg-tertiary); color: var(--text-primary);'}
                    ">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Store button actions
    modal._buttonActions = buttons;
    modal._onClose = onClose;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Add animation styles if not present
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .modal-btn:active {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }

    return modal;
  }

  static handleButtonClick(index) {
    const modal = document.getElementById('system-modal');
    if (!modal || !modal._buttonActions) return;

    const button = modal._buttonActions[index];
    if (button.action === 'close') {
      this.closeModal(modal);
    } else if (typeof button.action === 'function') {
      button.action();
      if (button.closeAfter !== false) {
        this.closeModal(modal);
      }
    }
  }

  static closeModal(modal) {
    if (!modal) {
      modal = document.getElementById('system-modal');
    }
    if (modal) {
      if (modal._onClose) {
        modal._onClose();
      }
      modal.remove();
    }
  }

  // Convenience methods
  static info(title, message, onClose = null) {
    return this.showModal({ title, message, type: 'info', onClose });
  }

  static warning(title, message, onClose = null) {
    return this.showModal({ title, message, type: 'warning', onClose });
  }

  static error(title, message, onClose = null) {
    return this.showModal({ title, message, type: 'error', onClose });
  }

  static success(title, message, onClose = null) {
    return this.showModal({ title, message, type: 'success', onClose });
  }

  static confirm(title, message, onConfirm, onCancel = null) {
    return this.showModal({
      title,
      message,
      type: 'warning',
      buttons: [
        { text: 'Cancel', action: () => { if (onCancel) onCancel(); }, primary: false },
        { text: 'Confirm', action: () => { if (onConfirm) onConfirm(); }, primary: true }
      ]
    });
  }
}

// Make globally available
window.ModalSystem = ModalSystem;
window.modalSystem = ModalSystem;

// Replace alert() globally (optional, can be disabled)
if (typeof window.replaceAlerts !== 'undefined' && window.replaceAlerts) {
  window.alert = function(message) {
    ModalSystem.info('Information', message);
  };
}

