// ============================================
// KNOWLEDGE GRAPH SYSTEM
// Visualize relationships: Variables → Models → Results → Figures/Tables
// ============================================

class KnowledgeGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.graph = null;
    this.nodes = new Map();
    this.edges = [];
    this.selectedNode = null;
  }

  // Initialize graph with project data
  async init(projectData) {
    if (!this.container) {
      console.error('Knowledge graph container not found');
      return;
    }

    // Load project manifest to build graph
    const manifest = projectData || await this.loadProjectManifest();
    
    // Build graph structure
    this.buildGraph(manifest);
    
    // Render graph
    this.render();
  }

  // Load project manifest
  async loadProjectManifest() {
    try {
      const response = await fetch('../paper_a_analysis/PROJECT_MANIFEST.json');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Could not load manifest, using fallback data');
    }
    
    // Fallback: use window.projectFileLoader
    if (window.projectFileLoader && window.projectFileLoader.manifest) {
      return window.projectFileLoader.manifest;
    }
    
    return { variables: [], models: [], results: [], figures: [], tables: [] };
  }

  // Build graph from manifest
  buildGraph(manifest) {
    this.nodes.clear();
    this.edges = [];

    // Add Variables nodes
    if (manifest.variables && manifest.variables.length > 0) {
      manifest.variables.forEach((variable, idx) => {
        const nodeId = `var_${idx}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          label: variable.name || `Variable ${idx + 1}`,
          type: 'variable',
          data: variable,
          x: 100,
          y: 100 + (idx * 80),
          color: '#3b82f6'
        });
      });
    }

    // Add Models nodes
    if (manifest.models && manifest.models.length > 0) {
      manifest.models.forEach((model, idx) => {
        const nodeId = `model_${idx}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          label: model.name || `Model ${idx + 1}`,
          type: 'model',
          data: model,
          x: 400,
          y: 100 + (idx * 80),
          color: '#10b981'
        });

        // Connect variables to models
        if (model.variables && manifest.variables) {
          model.variables.forEach((varName, varIdx) => {
            const varNodeId = `var_${varIdx}`;
            if (this.nodes.has(varNodeId)) {
              this.edges.push({
                from: varNodeId,
                to: nodeId,
                label: 'uses',
                type: 'variable_to_model'
              });
            }
          });
        }
      });
    }

    // Add Results nodes
    if (manifest.results && manifest.results.length > 0) {
      manifest.results.forEach((result, idx) => {
        const nodeId = `result_${idx}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          label: result.name || `Result ${idx + 1}`,
          type: 'result',
          data: result,
          x: 700,
          y: 100 + (idx * 80),
          color: '#f59e0b'
        });

        // Connect models to results
        if (result.modelId !== undefined && this.nodes.has(`model_${result.modelId}`)) {
          this.edges.push({
            from: `model_${result.modelId}`,
            to: nodeId,
            label: 'produces',
            type: 'model_to_result'
          });
        }
      });
    }

    // Add Figures nodes
    if (manifest.figures && manifest.figures.length > 0) {
      manifest.figures.forEach((figure, idx) => {
        const nodeId = `figure_${idx}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          label: `Figure ${figure.number || idx + 1}`,
          type: 'figure',
          data: figure,
          x: 1000,
          y: 100 + (idx * 60),
          color: '#8b5cf6'
        });

        // Connect results to figures
        if (figure.resultId !== undefined && this.nodes.has(`result_${figure.resultId}`)) {
          this.edges.push({
            from: `result_${figure.resultId}`,
            to: nodeId,
            label: 'visualized in',
            type: 'result_to_figure'
          });
        }
      });
    }

    // Add Tables nodes
    if (manifest.tables && manifest.tables.length > 0) {
      manifest.tables.forEach((table, idx) => {
        const nodeId = `table_${idx}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          label: `Table ${table.number || idx + 1}`,
          type: 'table',
          data: table,
          x: 1000,
          y: 400 + (idx * 60),
          color: '#ec4899'
        });

        // Connect results to tables
        if (table.resultId !== undefined && this.nodes.has(`result_${table.resultId}`)) {
          this.edges.push({
            from: `result_${table.resultId}`,
            to: nodeId,
            label: 'presented in',
            type: 'result_to_table'
          });
        }
      });
    }
  }

  // Render graph using SVG
  render() {
    if (!this.container) return;

    // Clear container
    this.container.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '600px');
    svg.style.cssText = 'border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary);';
    this.container.appendChild(svg);

    // Add zoom/pan group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'translate(50, 50)');
    svg.appendChild(g);

    // Draw edges first (so they appear behind nodes)
    this.edges.forEach(edge => {
      const fromNode = this.nodes.get(edge.from);
      const toNode = this.nodes.get(edge.to);
      if (!fromNode || !toNode) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromNode.x);
      line.setAttribute('y1', fromNode.y);
      line.setAttribute('x2', toNode.x);
      line.setAttribute('y2', toNode.y);
      line.setAttribute('stroke', '#94a3b8');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      line.style.cursor = 'pointer';
      g.appendChild(line);

      // Add label
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY - 5);
      text.setAttribute('fill', '#64748b');
      text.setAttribute('font-size', '10px');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = edge.label;
      g.appendChild(text);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      group.style.cursor = 'pointer';

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', node.color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');
      circle.addEventListener('click', () => this.selectNode(node));
      group.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', '40');
      text.setAttribute('fill', 'var(--text-primary)');
      text.setAttribute('font-size', '12px');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-weight', '500');
      text.textContent = node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label;
      group.appendChild(text);

      g.appendChild(group);
    });

    // Add arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#94a3b8');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Add controls
    this.addControls();
  }

  // Select node and show details
  selectNode(node) {
    this.selectedNode = node;
    
    // Highlight node
    const svg = this.container.querySelector('svg');
    const circles = svg.querySelectorAll('circle');
    circles.forEach(c => {
      c.setAttribute('stroke-width', '2');
      c.setAttribute('opacity', '0.7');
    });
    
    const nodeGroup = Array.from(svg.querySelectorAll('g')).find(g => {
      const circle = g.querySelector('circle');
      return circle && Math.abs(parseFloat(circle.getAttribute('cx') || 0) - node.x) < 1;
    });
    
    if (nodeGroup) {
      const circle = nodeGroup.querySelector('circle');
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('opacity', '1');
    }

    // Show details modal
    this.showNodeDetails(node);
  }

  // Show node details
  showNodeDetails(node) {
    const details = {
      variable: () => `Variable: ${node.data.name || node.label}\nType: ${node.data.type || 'N/A'}`,
      model: () => `Model: ${node.data.name || node.label}\nType: ${node.data.type || 'N/A'}\nR²: ${node.data.r2 || 'N/A'}`,
      result: () => `Result: ${node.data.name || node.label}\nValue: ${node.data.value || 'N/A'}`,
      figure: () => `Figure ${node.data.number || 'N/A'}\n${node.data.caption || ''}`,
      table: () => `Table ${node.data.number || 'N/A'}\n${node.data.caption || ''}`
    };

    const content = details[node.type] ? details[node.type]() : node.label;
    
    ModalSystem.info(
      node.type.charAt(0).toUpperCase() + node.type.slice(1) + ' Details',
      content,
      () => {
        // Option to open/view the item
        if (node.type === 'figure' && node.data.path) {
          if (typeof window.openModal === 'function') {
            window.openModal(node.data.path, content);
          }
        } else if (node.type === 'table' && node.data.path) {
          window.open(node.data.path, '_blank');
        }
      }
    );
  }

  // Add zoom/pan controls
  addControls() {
    const controls = document.createElement('div');
    controls.style.cssText = 'position: absolute; top: 10px; right: 10px; display: flex; gap: 0.5rem;';
    
    const zoomIn = document.createElement('button');
    zoomIn.textContent = '+';
    zoomIn.onclick = () => this.zoom(1.2);
    
    const zoomOut = document.createElement('button');
    zoomOut.textContent = '-';
    zoomOut.onclick = () => this.zoom(0.8);
    
    const reset = document.createElement('button');
    reset.textContent = '↺';
    reset.onclick = () => this.render();
    
    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);
    controls.appendChild(reset);
    this.container.appendChild(controls);
  }

  zoom(factor) {
    const svg = this.container.querySelector('svg');
    const g = svg.querySelector('g');
    const currentTransform = g.getAttribute('transform') || 'translate(50, 50)';
    // Simple zoom implementation
    // Full implementation would require more complex transform handling
    this.render();
  }
}

// Make globally available
window.KnowledgeGraph = KnowledgeGraph;

