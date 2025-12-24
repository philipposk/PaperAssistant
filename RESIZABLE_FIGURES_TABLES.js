// ============================================
// RESIZABLE FIGURES AND TABLES
// Allows users to resize figures/tables from 2cm to full size
// ============================================

class ResizableFigureTable {
  constructor(element, type = 'figure') {
    this.element = element;
    this.type = type; // 'figure' or 'table'
    this.minWidth = '2cm';
    this.maxWidth = '100%';
    this.currentWidth = null;
    this.caption = null;
    this.init();
  }

  init() {
    // Find caption element
    this.caption = this.element.querySelector('.figure-caption, .table-caption, .caption');
    if (!this.caption) {
      // Try to find next sibling that might be caption
      const next = this.element.nextElementSibling;
      if (next && (next.classList.contains('caption') || next.tagName === 'P')) {
        this.caption = next;
      }
    }

    // Create resize controls
    this.createResizeControls();
    
    // Set initial width
    if (!this.element.style.width) {
      this.element.style.width = '100%';
    }
    this.currentWidth = this.element.style.width || '100%';
  }

  createResizeControls() {
    // Create resize slider container
    const controls = document.createElement('div');
    controls.className = 'resize-controls';
    controls.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: var(--bg-tertiary, #f1f5f9);
      border-radius: var(--border-radius-sm, 8px);
      flex-wrap: wrap;
    `;

    // Size buttons
    const sizeButtons = document.createElement('div');
    sizeButtons.style.cssText = 'display: flex; gap: 0.25rem;';
    
    const sizes = [
      { label: 'XS', width: '2cm', icon: '⊟' },
      { label: 'S', width: '5cm', icon: '⊞' },
      { label: 'M', width: '50%', icon: '⊠' },
      { label: 'L', width: '75%', icon: '⊡' },
      { label: 'XL', width: '100%', icon: '⊠' }
    ];

    sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.textContent = size.icon;
      btn.title = `${size.label} (${size.width})`;
      btn.className = 'resize-btn';
      btn.style.cssText = `
        padding: 0.375rem 0.75rem;
        background: var(--bg-secondary, white);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      `;
      btn.onclick = () => this.setWidth(size.width);
      btn.onmouseover = () => btn.style.background = 'var(--accent-light, #60a5fa)';
      btn.onmouseout = () => btn.style.background = 'var(--bg-secondary, white)';
      sizeButtons.appendChild(btn);
    });

    // Slider for fine control
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '2';
    slider.max = '100';
    slider.value = '100';
    slider.className = 'resize-slider';
    slider.style.cssText = `
      flex: 1;
      min-width: 150px;
      height: 6px;
      border-radius: 3px;
      background: var(--border-color, #e2e8f0);
      outline: none;
      cursor: pointer;
    `;
    slider.oninput = (e) => {
      const percent = e.target.value;
      this.setWidth(`${percent}%`);
    };

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '↺ Reset';
    resetBtn.title = 'Reset to default size';
    resetBtn.style.cssText = `
      padding: 0.375rem 0.75rem;
      background: var(--accent, #3b82f6);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    `;
    resetBtn.onclick = () => this.setWidth('100%');
    resetBtn.onmouseover = () => resetBtn.style.background = 'var(--accent-dark, #2563eb)';
    resetBtn.onmouseout = () => resetBtn.style.background = 'var(--accent, #3b82f6)';

    controls.appendChild(sizeButtons);
    controls.appendChild(slider);
    controls.appendChild(resetBtn);

    // Insert controls before the element
    this.element.parentNode.insertBefore(controls, this.element);
    this.controls = controls;
    this.slider = slider;
  }

  setWidth(width) {
    this.currentWidth = width;
    this.element.style.width = width;
    this.element.style.maxWidth = width;
    this.element.style.margin = '0 auto';
    this.element.style.display = 'block';
    
    // Update slider value if it's a percentage
    if (width.includes('%')) {
      const percent = parseInt(width);
      if (this.slider) {
        this.slider.value = percent;
      }
    }

    // Adjust caption
    this.adjustCaption(width);
  }

  adjustCaption(width) {
    if (!this.caption) return;

    // Parse width to get numeric value
    let numericWidth = 100;
    if (width.includes('%')) {
      numericWidth = parseInt(width);
    } else if (width.includes('cm')) {
      // Approximate: 2cm ≈ 5%, 5cm ≈ 12%, etc.
      const cm = parseFloat(width);
      numericWidth = Math.min(100, (cm / 2) * 5);
    } else if (width.includes('px')) {
      // Convert px to approximate percentage
      const px = parseFloat(width);
      const containerWidth = this.element.parentElement.offsetWidth || 800;
      numericWidth = Math.min(100, (px / containerWidth) * 100);
    }

    // Adjust caption font size and max width
    const caption = this.caption;
    caption.style.maxWidth = width;
    caption.style.margin = '0.5rem auto 0';
    caption.style.textAlign = 'center';
    
    // Adjust font size based on width
    if (numericWidth < 10) {
      caption.style.fontSize = '0.7rem';
      caption.style.lineHeight = '1.2';
      caption.style.maxHeight = '3em';
      caption.style.overflow = 'hidden';
      caption.style.textOverflow = 'ellipsis';
    } else if (numericWidth < 30) {
      caption.style.fontSize = '0.8rem';
      caption.style.lineHeight = '1.3';
    } else if (numericWidth < 50) {
      caption.style.fontSize = '0.9rem';
      caption.style.lineHeight = '1.4';
    } else {
      caption.style.fontSize = '1rem';
      caption.style.lineHeight = '1.5';
    }

    // Ensure caption doesn't exceed 3 lines at minimum
    if (numericWidth < 10) {
      caption.style.display = '-webkit-box';
      caption.style.webkitLineClamp = '3';
      caption.style.webkitBoxOrient = 'vertical';
      caption.style.overflow = 'hidden';
    } else {
      caption.style.display = 'block';
      caption.style.webkitLineClamp = 'none';
    }
  }
}

// Initialize resizable elements on page load
function initResizableFiguresTables() {
  // Find all figures
  const figures = document.querySelectorAll('.figure-card img, .figure-image, img[class*="figure"]');
  figures.forEach(figure => {
    new ResizableFigureTable(figure, 'figure');
  });

  // Find all tables
  const tables = document.querySelectorAll('table, .table-card, .table-container');
  tables.forEach(table => {
    new ResizableFigureTable(table, 'table');
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResizableFiguresTables);
} else {
  initResizableFiguresTables();
}

// Export for manual initialization
window.ResizableFigureTable = ResizableFigureTable;
window.initResizableFiguresTables = initResizableFiguresTables;
