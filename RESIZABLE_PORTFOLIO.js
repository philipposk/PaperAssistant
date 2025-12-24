// ============================================
// GLOBAL RESIZABLE PORTFOLIO SYSTEM
// Global controls to resize ALL figures or ALL tables together
// ============================================

class GlobalResizablePortfolio {
  constructor() {
    this.minWidth = 80; // 2cm ≈ 80px at 96dpi
    this.maxWidth = null; // Full size
    this.figureWidth = 600; // Default figure width
    this.tableWidth = 800; // Default table width
    this.initialFigureWidth = 600;
    this.initialTableWidth = 800;
  }

  init() {
    // Only initialize on portfolio pages
    const isPortfolioPage = window.location.pathname.includes('figures_portfolio') || 
                           window.location.pathname.includes('tables_portfolio');
    
    if (!isPortfolioPage) {
      return; // Don't initialize on other pages
    }
    
    // Wrap all figures and tables
    this.wrapAllItems();
    // Create global controls
    this.createGlobalControls();
    // Load saved settings
    this.loadSettings();
  }

  wrapAllItems() {
    // Find all figure containers - target the figure-wrapper divs that contain images
    const figureWrappers = document.querySelectorAll('.figure-wrapper, .figure-card .figure-wrapper');
    figureWrappers.forEach((wrapper) => {
      if (!wrapper.closest('.resizable-container')) {
        // Wrap the entire figure-wrapper div
        this.wrapElement(wrapper, 'figure');
      }
    });
    
    // Also handle standalone images
    const figures = document.querySelectorAll('.figure-card .figure-image:not(.resizable-container img), .figure-item img, .portfolio-item img, figure img, .figure-container img, img[src*="figure"]:not(.resizable-container img)');
    figures.forEach((img) => {
      if (!img.closest('.resizable-container') && !img.closest('.figure-wrapper.resizable-container')) {
        this.wrapElement(img, 'figure');
      }
    });

    // Find all table containers - target table-preview divs (which contain the tables)
    const tablePreviews = document.querySelectorAll('.table-preview');
    tablePreviews.forEach((preview) => {
      if (!preview.closest('.resizable-container')) {
        // Wrap the table-preview div
        this.wrapElement(preview, 'table');
      }
    });
    
    // Also handle standalone tables
    const standaloneTables = document.querySelectorAll('.table-card table:not(.resizable-container table), .table-item, .portfolio-table, table.portfolio-table, .table-container table:not(.resizable-container table)');
    standaloneTables.forEach((table) => {
      if (!table.closest('.resizable-container') && !table.closest('.table-preview.resizable-container')) {
        if (table.tagName === 'TABLE') {
          this.wrapElement(table, 'table');
        }
      }
    });
  }

  wrapElement(element, type) {
    // Create container
    const container = document.createElement('div');
    container.className = `resizable-container resizable-${type}`;
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.maxWidth = '100%';
    container.dataset.type = type;
    
    // Wrap element
    element.parentNode.insertBefore(container, element);
    container.appendChild(element);

    // DON'T move captions - they're already in the HTML structure
    // The caption adjustment will work on existing captions without moving them

    // Set initial width
    const defaultWidth = type === 'figure' ? this.figureWidth : this.tableWidth;
    container.style.width = defaultWidth + 'px';
    if (element.tagName === 'IMG') {
      element.style.width = '100%';
      element.style.height = 'auto';
    } else {
      element.style.width = '100%';
    }
  }

  createGlobalControls() {
    // Check if controls already exist
    if (document.getElementById('global-resize-controls')) {
      return;
    }

    // Find the search box
    const searchBox = document.querySelector('.search-box, #searchBox, input[type="text"][placeholder*="Search"]');
    
    // Create controls container - inline with page flow, right after search box
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'global-resize-controls';
    controlsContainer.style.cssText = `
      display: flex;
      gap: 2rem;
      align-items: center;
      padding: 1.5rem;
      background: #ffffff;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      margin: 1.5rem 0 2rem 0;
      flex-wrap: wrap;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    `;

    // Only show controls for the current page type
    const isTablesPage = window.location.pathname.includes('tables_portfolio');
    const isFiguresPage = window.location.pathname.includes('figures_portfolio');
    
    if (isTablesPage) {
      // Only show tables controls on tables page
      const tablesSection = this.createSliderControl('', 'table', () => this.tableWidth);
      controlsContainer.appendChild(tablesSection);
    } else if (isFiguresPage) {
      // Only show figures controls on figures page
      const figuresSection = this.createSliderControl('', 'figure', () => this.figureWidth);
      controlsContainer.appendChild(figuresSection);
    } else {
      // Show both on other pages (if they exist)
      if (document.querySelector('.figure-card, .figure-wrapper')) {
        const figuresSection = this.createSliderControl('', 'figure', () => this.figureWidth);
        controlsContainer.appendChild(figuresSection);
      }
      if (document.querySelector('.table-card, .table-preview')) {
        const tablesSection = this.createSliderControl('', 'table', () => this.tableWidth);
        controlsContainer.appendChild(tablesSection);
      }
    }

    // Insert right after search box
    if (searchBox && searchBox.parentElement) {
      searchBox.parentElement.insertBefore(controlsContainer, searchBox.nextSibling);
    } else {
      // Fallback: insert at beginning of body
      const firstChild = document.body.firstChild;
      if (firstChild) {
        document.body.insertBefore(controlsContainer, firstChild);
      } else {
        document.body.appendChild(controlsContainer);
      }
    }
  }

  createSliderControl(label, type, getCurrentWidth) {
    const section = document.createElement('div');
    section.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    `;

    // Only add title if label is provided
    if (label) {
      const title = document.createElement('div');
      title.textContent = label;
      title.style.cssText = `
        font-weight: 700;
        color: #1e293b;
        font-size: 1rem;
        margin-bottom: 0.75rem;
        text-align: center;
      `;
      section.appendChild(title);
    }

    // Slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    `;

    // Minus button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    minusBtn.addEventListener('click', () => {
      this.resizeAll(type, -50);
      this.updateSlider(type);
    });
    minusBtn.addEventListener('mouseenter', () => {
      minusBtn.style.background = 'var(--accent-dark)';
      minusBtn.style.transform = 'scale(1.1)';
    });
    minusBtn.addEventListener('mouseleave', () => {
      minusBtn.style.background = 'var(--accent)';
      minusBtn.style.transform = 'scale(1)';
    });
    sliderContainer.appendChild(minusBtn);

    // Slider
    const sliderWrapper = document.createElement('div');
    sliderWrapper.style.cssText = `
      flex: 1;
      position: relative;
      height: 24px;
      display: flex;
      align-items: center;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `${type}-slider`;
    slider.min = '80';
    slider.max = Math.min(window.innerWidth - 80, 1600).toString();
    slider.value = type === 'figure' ? this.figureWidth : this.tableWidth;
    slider.style.cssText = `
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: #e2e8f0;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    `;
    
    // Custom slider styling
    slider.style.setProperty('--slider-bg', 'var(--bg-tertiary)');
    slider.style.setProperty('--slider-fill', 'var(--accent)');
    
    // Webkit slider thumb
    const style = document.createElement('style');
    style.textContent += `
      #${type}-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: all 0.2s;
      }
      #${type}-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        background: var(--accent-dark);
      }
      #${type}-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s;
      }
      #${type}-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
        background: var(--accent-dark);
      }
      #${type}-slider::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--bg-tertiary);
      }
    `;
    document.head.appendChild(style);

    slider.addEventListener('input', (e) => {
      const newWidth = parseInt(e.target.value);
      if (type === 'figure') {
        this.figureWidth = newWidth;
      } else {
        this.tableWidth = newWidth;
      }
      this.applyWidth(type, newWidth);
      this.updateSizeDisplay(document.getElementById(`${type}-size-display`), type);
      this.saveSettings();
    });
    
    // Update max on window resize
    window.addEventListener('resize', () => {
      const maxWidth = Math.min(window.innerWidth - 80, 1600);
      slider.max = maxWidth.toString();
      if (parseInt(slider.value) > maxWidth) {
        slider.value = maxWidth.toString();
        if (type === 'figure') {
          this.figureWidth = maxWidth;
        } else {
          this.tableWidth = maxWidth;
        }
        this.applyWidth(type, maxWidth);
        this.updateSizeDisplay(document.getElementById(`${type}-size-display`), type);
      }
    });

    sliderWrapper.appendChild(slider);
    sliderContainer.appendChild(sliderWrapper);

    // Plus button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    plusBtn.addEventListener('click', () => {
      this.resizeAll(type, 50);
      this.updateSlider(type);
    });
    plusBtn.addEventListener('mouseenter', () => {
      plusBtn.style.background = 'var(--accent-dark)';
      plusBtn.style.transform = 'scale(1.1)';
    });
    plusBtn.addEventListener('mouseleave', () => {
      plusBtn.style.background = 'var(--accent)';
      plusBtn.style.transform = 'scale(1)';
    });
    sliderContainer.appendChild(plusBtn);

    section.appendChild(sliderContainer);

    // Size display
    const sizeDisplay = document.createElement('div');
    sizeDisplay.id = `${type}-size-display`;
    sizeDisplay.style.cssText = `
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 0.25rem;
    `;
    this.updateSizeDisplay(sizeDisplay, type);
    section.appendChild(sizeDisplay);

    return section;
  }

  updateSlider(type) {
    const slider = document.getElementById(`${type}-slider`);
    if (slider) {
      const currentWidth = type === 'figure' ? this.figureWidth : this.tableWidth;
      slider.value = currentWidth;
    }
  }

  createControlButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: bold;
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--accent-dark)';
      btn.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--accent)';
      btn.style.transform = 'scale(1)';
    });
    return btn;
  }

  resizeAll(type, delta) {
    const containers = document.querySelectorAll(`.resizable-container.resizable-${type}`);
    const currentWidth = type === 'figure' ? this.figureWidth : this.tableWidth;
    const newWidth = Math.max(this.minWidth, Math.min(window.innerWidth - 80, currentWidth + delta));
    
    containers.forEach(container => {
      container.style.width = newWidth + 'px';
      const element = container.querySelector('img, table');
      if (element) {
        element.style.width = '100%';
        if (element.tagName === 'IMG') {
          element.style.height = 'auto';
        }
      }
      
      // Adjust caption - find caption in figure-info or table-info
      const caption = container.closest('.figure-card')?.querySelector('.figure-caption') ||
                      container.closest('.table-card')?.querySelector('.table-caption') ||
                      container.querySelector('figcaption, .caption');
      if (caption) {
        this.adjustCaption(caption, newWidth);
      }
    });

    if (type === 'figure') {
      this.figureWidth = newWidth;
      this.updateGridLayout(newWidth, 'figure');
    } else {
      this.tableWidth = newWidth;
      this.updateGridLayout(newWidth, 'table');
    }

    this.updateSizeDisplay(document.getElementById(`${type}-size-display`), type);
    this.saveSettings();
  }
  
  updateGridLayout(width, type) {
    // Find the appropriate grid based on type
    let grid;
    if (type === 'figure') {
      grid = document.querySelector('.figures-grid, #figuresGrid');
    } else if (type === 'table') {
      grid = document.querySelector('.tables-grid, #tablesGrid');
    } else {
      // Try both
      grid = document.querySelector('.figures-grid, #figuresGrid, .tables-grid, #tablesGrid');
    }
    
    if (!grid) return;
    
    // Remove all size classes
    grid.classList.remove('small-figures', 'medium-figures', 'large-figures', 'full-figures',
                          'small-tables', 'medium-tables', 'large-tables', 'full-tables');
    
    // Determine grid layout based on width
    const screenWidth = window.innerWidth;
    const itemsPerRow = Math.floor(screenWidth / (width + 32)); // 32px for gap
    
    if (width >= screenWidth - 100) {
      // Full width - 1 per row
      const sizeClass = type === 'table' ? 'full-tables' : 'full-figures';
      grid.classList.add(sizeClass);
      grid.style.gridTemplateColumns = '1fr';
    } else if (itemsPerRow <= 1) {
      // Large - 1 per row
      const sizeClass = type === 'table' ? 'large-tables' : 'large-figures';
      grid.classList.add(sizeClass);
      grid.style.gridTemplateColumns = '1fr';
    } else if (itemsPerRow <= 3) {
      // Medium - 2-3 per row
      const sizeClass = type === 'table' ? 'medium-tables' : 'medium-figures';
      grid.classList.add(sizeClass);
      const minWidth = Math.max(300, width);
      grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;
    } else {
      // Small - 4-6 per row
      const sizeClass = type === 'table' ? 'small-tables' : 'small-figures';
      grid.classList.add(sizeClass);
      const minWidth = Math.max(180, width);
      grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;
    }
  }

  resetAll(type) {
    const defaultWidth = type === 'figure' ? this.initialFigureWidth : this.initialTableWidth;
    const containers = document.querySelectorAll(`.resizable-container.resizable-${type}`);
    
    containers.forEach(container => {
      container.style.width = defaultWidth + 'px';
      const element = container.querySelector('img, table');
      if (element) {
        element.style.width = '100%';
        if (element.tagName === 'IMG') {
          element.style.height = 'auto';
        }
      }
      
      // Adjust caption - find caption in figure-info or table-info
      const caption = container.closest('.figure-card')?.querySelector('.figure-caption') ||
                      container.closest('.table-card')?.querySelector('.table-caption') ||
                      container.querySelector('figcaption, .caption');
      if (caption) {
        this.adjustCaption(caption, defaultWidth);
      }
    });

    if (type === 'figure') {
      this.figureWidth = defaultWidth;
      this.updateGridLayout(defaultWidth, 'figure');
    } else {
      this.tableWidth = defaultWidth;
      this.updateGridLayout(defaultWidth, 'table');
    }

    this.updateSizeDisplay(document.getElementById(`${type}-size-display`), type);
    this.saveSettings();
  }

  fullSizeAll(type) {
    const maxWidth = window.innerWidth - 80;
    const containers = document.querySelectorAll(`.resizable-container.resizable-${type}`);
    
    containers.forEach(container => {
      container.style.width = maxWidth + 'px';
      const element = container.querySelector('img, table');
      if (element) {
        element.style.width = '100%';
        if (element.tagName === 'IMG') {
          element.style.height = 'auto';
        }
      }
      
      // Adjust caption
      const caption = container.querySelector('figcaption, .caption');
      if (caption) {
        this.adjustCaption(caption, maxWidth);
      }
    });

    if (type === 'figure') {
      this.figureWidth = maxWidth;
      this.updateGridLayout(maxWidth, 'figure');
    } else {
      this.tableWidth = maxWidth;
      this.updateGridLayout(maxWidth, 'table');
    }

    this.updateSizeDisplay(document.getElementById(`${type}-size-display`), type);
    this.saveSettings();
  }

  updateSizeDisplay(display, type) {
    if (!display) return;
    const width = type === 'figure' ? this.figureWidth : this.tableWidth;
    const cm = (width / 96 * 2.54).toFixed(1); // Convert px to cm
    display.textContent = `${width}px (${cm}cm)`;
    // Also update slider if it exists
    this.updateSlider(type);
  }

  adjustCaption(caption, width) {
    if (!caption) return;
    
    const originalText = caption.getAttribute('data-original') || caption.textContent;
    if (!caption.getAttribute('data-original')) {
      caption.setAttribute('data-original', originalText);
    }
    
    // Calculate optimal font size and truncation (max 3 lines)
    const maxLines = 3;
    const lineHeight = 1.4;
    const baseFontSize = 14;
    const padding = 20;
    const availableWidth = width - padding;
    const charsPerLine = Math.floor(availableWidth / (baseFontSize * 0.6)); // Approximate chars per line
    const maxChars = charsPerLine * maxLines;
    
    // Intelligently truncate caption
    let displayText = originalText;
    if (originalText.length > maxChars) {
      // Try to truncate at sentence boundaries first
      const sentences = originalText.split(/[.!?]\s+/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= maxChars - 10) {
          truncated += (truncated ? '. ' : '') + sentence;
        } else {
          break;
        }
      }
      
      // If still too long, truncate at word boundaries
      if (!truncated || truncated.length > maxChars) {
        const words = originalText.split(' ');
        truncated = '';
        for (const word of words) {
          if ((truncated + ' ' + word).length <= maxChars - 3) {
            truncated += (truncated ? ' ' : '') + word;
          } else {
            break;
          }
        }
        truncated += '...';
      } else {
        truncated += '.';
      }
      displayText = truncated;
    }
    
    caption.textContent = displayText;
    
    // Adjust font size to fit
    const estimatedWidth = displayText.length * (baseFontSize * 0.6);
    if (estimatedWidth > availableWidth) {
      const scale = availableWidth / estimatedWidth;
      const fontSize = Math.max(10, Math.min(16, baseFontSize * scale));
      caption.style.fontSize = fontSize + 'px';
    } else {
      caption.style.fontSize = baseFontSize + 'px';
    }
    
    caption.style.lineHeight = lineHeight;
    caption.style.maxWidth = width + 'px';
    caption.style.maxHeight = (maxLines * lineHeight * parseFloat(caption.style.fontSize)) + 'px';
    caption.style.overflow = 'hidden';
    caption.style.textOverflow = 'ellipsis';
    caption.style.width = '100%';
    caption.style.marginTop = '0.5rem';
    caption.style.textAlign = 'center';
    caption.style.display = '-webkit-box';
    caption.style.webkitLineClamp = maxLines;
    caption.style.webkitBoxOrient = 'vertical';
  }

  saveSettings() {
    localStorage.setItem('portfolio-figure-width', this.figureWidth.toString());
    localStorage.setItem('portfolio-table-width', this.tableWidth.toString());
  }

  loadSettings() {
    const savedFigureWidth = localStorage.getItem('portfolio-figure-width');
    const savedTableWidth = localStorage.getItem('portfolio-table-width');
    
    if (savedFigureWidth) {
      this.figureWidth = parseInt(savedFigureWidth);
      this.applyWidth('figure', this.figureWidth);
    }
    
    if (savedTableWidth) {
      this.tableWidth = parseInt(savedTableWidth);
      this.applyWidth('table', this.tableWidth);
    }
  }

  applyWidth(type, width) {
    const containers = document.querySelectorAll(`.resizable-container.resizable-${type}`);
    
    if (containers.length === 0) {
      // If no containers found, try to wrap items first
      this.wrapAllItems();
      // Try again
      const newContainers = document.querySelectorAll(`.resizable-container.resizable-${type}`);
      newContainers.forEach(container => {
        this.setContainerWidth(container, width, type);
      });
    } else {
      containers.forEach(container => {
        this.setContainerWidth(container, width, type);
      });
    }
    
    // Update grid layout for figures and tables
    this.updateGridLayout(width, type);
    
    const display = document.getElementById(`${type}-size-display`);
    if (display) {
      this.updateSizeDisplay(display, type);
    }
  }
  
  setContainerWidth(container, width, type) {
    container.style.width = width + 'px';
    container.style.maxWidth = width + 'px';
    
    // Handle figure-wrapper divs
    if (container.classList.contains('figure-wrapper') || container.querySelector('.figure-wrapper')) {
      const wrapper = container.classList.contains('figure-wrapper') ? container : container.querySelector('.figure-wrapper');
      if (wrapper) {
        wrapper.style.width = width + 'px';
        wrapper.style.maxWidth = width + 'px';
      }
    }
    
    // Handle table-preview divs
    if (container.classList.contains('table-preview') || container.querySelector('.table-preview')) {
      const preview = container.classList.contains('table-preview') ? container : container.querySelector('.table-preview');
      if (preview) {
        preview.style.width = width + 'px';
        preview.style.maxWidth = width + 'px';
        // Make table inside fit
        const table = preview.querySelector('table');
        if (table) {
          table.style.width = '100%';
          table.style.maxWidth = '100%';
          table.style.fontSize = Math.max(0.7, Math.min(0.9, width / 1000)) + 'rem';
        }
      }
    }
    
    const element = container.querySelector('img, table, .figure-image');
    if (element) {
      element.style.width = '100%';
      element.style.maxWidth = '100%';
      if (element.tagName === 'IMG') {
        element.style.height = 'auto';
      } else if (element.tagName === 'TABLE') {
        // Adjust table font size based on width
        element.style.fontSize = Math.max(0.7, Math.min(0.9, width / 1000)) + 'rem';
      }
    }
    
    // Adjust caption - find caption in figure-info or table-info
    const caption = container.closest('.figure-card')?.querySelector('.figure-caption') ||
                    container.closest('.table-card')?.querySelector('.table-caption') ||
                    container.querySelector('figcaption, .caption');
    if (caption) {
      this.adjustCaption(caption, width);
    }
  }
}

// Initialize on load
function initResizablePortfolio() {
  window.globalResizablePortfolio = new GlobalResizablePortfolio();
  window.globalResizablePortfolio.init();
  
  // Also re-initialize after a delay to catch dynamically loaded content
  setTimeout(() => {
    if (window.globalResizablePortfolio) {
      window.globalResizablePortfolio.wrapAllItems();
      window.globalResizablePortfolio.loadSettings();
    }
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResizablePortfolio);
} else {
  initResizablePortfolio();
}
