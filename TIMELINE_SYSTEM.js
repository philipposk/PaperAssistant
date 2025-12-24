// ============================================
// TIMELINE SYSTEM
// Research timeline with visual progression and methodology change tracking
// ============================================

class TimelineSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.events = [];
    this.methodologyChanges = [];
  }

  // Initialize timeline
  async init() {
    if (!this.container) {
      console.error('Timeline container not found');
      return;
    }

    // Load timeline data
    await this.loadTimelineData();
    
    // Render timeline
    this.render();
  }

  // Load timeline data
  async loadTimelineData() {
    try {
      // Try to load from TIMELINE_DATA.json
      const response = await fetch('../paper_a_analysis/TIMELINE_DATA.json');
      if (response.ok) {
        const data = await response.json();
        this.events = data.events || [];
        this.methodologyChanges = data.methodology_changes || [];
        return;
      }
    } catch (e) {
      console.warn('Could not load timeline data, using fallback');
    }

    // Fallback: generate from project manifest
    if (window.projectFileLoader && window.projectFileLoader.manifest) {
      this.generateFromManifest(window.projectFileLoader.manifest);
    }
  }

  // Generate timeline from manifest
  generateFromManifest(manifest) {
    this.events = [];
    this.methodologyChanges = [];

    // Add methodology changes
    if (manifest.methodology) {
      manifest.methodology.forEach((change, idx) => {
        this.methodologyChanges.push({
          id: `method_${idx}`,
          date: change.date || new Date().toISOString(),
          title: change.title || 'Methodology Update',
          description: change.description || '',
          type: 'methodology',
          impact: change.impact || 'medium'
        });
      });
    }

    // Add model creation events
    if (manifest.models) {
      manifest.models.forEach((model, idx) => {
        this.events.push({
          id: `model_${idx}`,
          date: model.created || new Date().toISOString(),
          title: `Model Created: ${model.name || `Model ${idx + 1}`}`,
          description: `R²: ${model.r2 || 'N/A'}`,
          type: 'model',
          linkedModel: model
        });
      });
    }

    // Add figure creation events
    if (manifest.figures) {
      manifest.figures.forEach((figure, idx) => {
        this.events.push({
          id: `figure_${idx}`,
          date: figure.created || new Date().toISOString(),
          title: `Figure ${figure.number || idx + 1} Created`,
          description: figure.caption || '',
          type: 'figure',
          linkedFigure: figure
        });
      });
    }

    // Sort by date
    this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.methodologyChanges.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Render timeline
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Combine and sort all events
    const allEvents = [
      ...this.events.map(e => ({ ...e, isMethodology: false })),
      ...this.methodologyChanges.map(m => ({ ...m, isMethodology: true }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create timeline structure
    const timeline = document.createElement('div');
    timeline.className = 'research-timeline';
    timeline.style.cssText = `
      position: relative;
      padding: 2rem 0;
    `;

    // Timeline line
    const line = document.createElement('div');
    line.className = 'timeline-line';
    line.style.cssText = `
      position: absolute;
      left: 50px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--accent);
      border-radius: 2px;
    `;
    timeline.appendChild(line);

    // Add events
    allEvents.forEach((event, idx) => {
      const eventElement = this.createEventElement(event, idx);
      timeline.appendChild(eventElement);
    });

    this.container.appendChild(timeline);

    // Add filters
    this.addFilters();
  }

  // Create event element
  createEventElement(event, index) {
    const eventDiv = document.createElement('div');
    eventDiv.className = `timeline-event ${event.isMethodology ? 'methodology-event' : 'regular-event'}`;
    eventDiv.style.cssText = `
      position: relative;
      margin-bottom: 2rem;
      padding-left: 100px;
      animation: slideIn 0.3s ease ${index * 0.1}s both;
    `;

    // Event marker
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    marker.style.cssText = `
      position: absolute;
      left: 38px;
      top: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${event.isMethodology ? '#f59e0b' : this.getEventColor(event.type)};
      border: 3px solid var(--bg-secondary);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 10;
    `;
    marker.addEventListener('click', () => this.showEventDetails(event));
    marker.addEventListener('mouseenter', () => {
      marker.style.transform = 'scale(1.3)';
      marker.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    });
    marker.addEventListener('mouseleave', () => {
      marker.style.transform = 'scale(1)';
      marker.style.boxShadow = 'none';
    });
    eventDiv.appendChild(marker);

    // Event content
    const content = document.createElement('div');
    content.className = 'timeline-content';
    content.style.cssText = `
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
      cursor: pointer;
    `;
    content.addEventListener('click', () => this.showEventDetails(event));
    content.addEventListener('mouseenter', () => {
      content.style.transform = 'translateX(5px)';
      content.style.boxShadow = 'var(--shadow-md)';
    });
    content.addEventListener('mouseleave', () => {
      content.style.transform = 'translateX(0)';
      content.style.boxShadow = 'var(--shadow-sm)';
    });

    // Date
    const date = document.createElement('div');
    date.className = 'timeline-date';
    date.style.cssText = `
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    `;
    date.textContent = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    content.appendChild(date);

    // Title
    const title = document.createElement('div');
    title.className = 'timeline-title';
    title.style.cssText = `
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1rem;
    `;
    title.textContent = event.title;
    content.appendChild(title);

    // Description
    if (event.description) {
      const desc = document.createElement('div');
      desc.className = 'timeline-description';
      desc.style.cssText = `
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
      `;
      desc.textContent = event.description.length > 100 
        ? event.description.substring(0, 100) + '...' 
        : event.description;
      content.appendChild(desc);
    }

    // Methodology badge
    if (event.isMethodology) {
      const badge = document.createElement('div');
      badge.style.cssText = `
        display: inline-block;
        background: #f59e0b;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-top: 0.5rem;
        font-weight: 500;
      `;
      badge.textContent = 'Methodology Change';
      content.appendChild(badge);
    }

    eventDiv.appendChild(content);

    return eventDiv;
  }

  // Get event color by type
  getEventColor(type) {
    const colors = {
      model: '#10b981',
      figure: '#8b5cf6',
      table: '#ec4899',
      result: '#f59e0b',
      variable: '#3b82f6',
      default: '#64748b'
    };
    return colors[type] || colors.default;
  }

  // Show event details
  showEventDetails(event) {
    let content = `<strong>Date:</strong> ${new Date(event.date).toLocaleString()}<br><br>`;
    content += `<strong>Description:</strong> ${event.description || 'No description'}<br><br>`;

    if (event.isMethodology) {
      content += `<strong>Impact:</strong> ${event.impact || 'medium'}<br><br>`;
    }

    if (event.linkedModel) {
      content += `<strong>Model Details:</strong><br>`;
      content += `R²: ${event.linkedModel.r2 || 'N/A'}<br>`;
    }

    if (event.linkedFigure) {
      content += `<strong>Figure:</strong> ${event.linkedFigure.number || 'N/A'}<br>`;
    }

    const buttons = [
      { text: 'Close', action: 'close', primary: true }
    ];

    if (event.linkedFigure && event.linkedFigure.path) {
      buttons.push({
        text: 'View Figure',
        action: () => {
          if (typeof window.openModal === 'function') {
            window.openModal(event.linkedFigure.path, event.title);
          }
        },
        primary: false
      });
    }

    ModalSystem.showModal({
      title: event.title,
      message: content,
      type: event.isMethodology ? 'warning' : 'info',
      buttons
    });
  }

  // Add filters
  addFilters() {
    const filters = document.createElement('div');
    filters.className = 'timeline-filters';
    filters.style.cssText = `
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    `;

    const filterTypes = [
      { label: 'All', value: 'all' },
      { label: 'Methodology', value: 'methodology' },
      { label: 'Models', value: 'model' },
      { label: 'Figures', value: 'figure' },
      { label: 'Tables', value: 'table' }
    ];

    filterTypes.forEach(filter => {
      const btn = document.createElement('button');
      btn.textContent = filter.label;
      btn.className = 'timeline-filter-btn';
      btn.style.cssText = `
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      btn.addEventListener('click', () => this.filterEvents(filter.value));
      filters.appendChild(btn);
    });

    this.container.insertBefore(filters, this.container.firstChild);
  }

  // Filter events
  filterEvents(type) {
    const events = this.container.querySelectorAll('.timeline-event');
    events.forEach(event => {
      if (type === 'all') {
        event.style.display = 'block';
      } else {
        const isMethodology = event.classList.contains('methodology-event');
        const eventType = event.dataset.type;
        
        if (type === 'methodology' && isMethodology) {
          event.style.display = 'block';
        } else if (type !== 'methodology' && eventType === type) {
          event.style.display = 'block';
        } else {
          event.style.display = 'none';
        }
      }
    });
  }
}

// Make globally available
window.TimelineSystem = TimelineSystem;

