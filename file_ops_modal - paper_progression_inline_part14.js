    function exportToLaTeX(content, fileName) {
      // Convert markdown to LaTeX
      let latex = content
        .replace(/^# (.*$)/gim, '\\section{$1}')
        .replace(/^## (.*$)/gim, '\\subsection{$1}')
        .replace(/^### (.*$)/gim, '\\subsubsection{$1}')
        .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
        .replace(/\*(.*?)\*/g, '\\textit{$1}');
      
      const blob = new Blob([latex], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + '.tex';
      a.click();
      URL.revokeObjectURL(url);
    }
    
    function exportToDOCX(content, fileName) {
      alert('DOCX export - install docx library for full functionality');
      // In production: use docx library
    }
    
    function exportToHTML(content, fileName) {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + '.html';
      a.click();
      URL.revokeObjectURL(url);
    }
    
    // ============================================
    // CITATION MANAGER (HP8)
    // ============================================
    
    let references = [];
    
    function addReference(title, authors, year, journal, doi, citationKey) {
      const reference = {
        id: Date.now(),
        title,
        authors,
        year,
        journal,
        doi,
        citationKey: citationKey || generateCitationKey(authors, year),
        createdAt: new Date().toISOString()
      };
      references.push(reference);
      saveReferences();
      return reference;
    }
    
    function generateCitationKey(authors, year) {
      const firstAuthor = authors.split(',')[0].trim().split(' ').pop();
      return `${firstAuthor}${year}`.toLowerCase();
    }
    
    function formatCitation(reference, style = 'apa') {
      // Basic APA format
      if (style === 'apa') {
        return `${reference.authors} (${reference.year}). ${reference.title}. ${reference.journal}.`;
      }
      return `${reference.authors}, ${reference.title}, ${reference.journal}, ${reference.year}`;
    }
    
    function generateBibliography(style = 'apa') {
      return references.map(ref => formatCitation(ref, style)).join('\n\n');
    }
    
    function saveReferences() {
      localStorage.setItem('references', JSON.stringify(references));
    }
    
    function loadReferences() {
      const saved = localStorage.getItem('references');
      if (saved) {
        references = JSON.parse(saved);
      }
    }
    
    // Initialize citation manager
    document.addEventListener('DOMContentLoaded', function() {
      loadReferences();
    });
    
    // ============================================
    // METHODOLOGY TRACKER (HP9)
    // ============================================
    
    let methodologyDecisions = [];
    
    function addMethodologyDecision(step, decision, rationale, alternatives = []) {
      const decisionRecord = {
        id: Date.now(),
        step,
        decision,
        rationale,
        alternatives,
        timestamp: new Date().toISOString()
      };
      methodologyDecisions.push(decisionRecord);
      saveMethodology();
      return decisionRecord;
    }
    
    function saveMethodology() {
      localStorage.setItem('methodologyDecisions', JSON.stringify(methodologyDecisions));
    }
    
    function loadMethodology() {
      const saved = localStorage.getItem('methodologyDecisions');
      if (saved) {
        methodologyDecisions = JSON.parse(saved);
      }
    }
    
    // Initialize methodology tracker
    document.addEventListener('DOMContentLoaded', function() {
      loadMethodology();
    });
    
    // ============================================
    // FIGURE/TABLE EDITOR (HP10)
    // ============================================
    
    let figureCanvas = null;
    let tableEditor = null;
    
    // Open figure editor
    function openFigureEditor(imagePath) {
      const modal = document.createElement('div');
      modal.className = 'file-preview-modal';
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="file-preview-content" style="width: 90%; max-width: 1200px; height: 90vh;">
          <div class="file-preview-header">
            <h3>🖼️ Figure Editor</h3>
            <div>
              <button onclick="saveFigure()" class="btn-modern btn-modern-primary" style="margin-right: 0.5rem;">Save</button>
              <span class="file-preview-close" onclick="closeFigureEditor()">×</span>
            </div>
          </div>
          <div class="file-preview-body" style="padding: 1rem;">
            <canvas id="figureCanvas" style="border: 1px solid var(--bg-primary); max-width: 100%;"></canvas>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
              <button onclick="addTextToFigure()" class="btn-modern btn-modern-secondary">Add Text</button>
              <button onclick="addShapeToFigure()" class="btn-modern btn-modern-secondary">Add Shape</button>
              <button onclick="cropFigure()" class="btn-modern btn-modern-secondary">Crop</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Initialize Fabric.js canvas
      figureCanvas = new fabric.Canvas('figureCanvas', {
        width: 800,
        height: 600
      });
      
      // Load image
      fabric.Image.fromURL(imagePath, function(img) {
        img.scaleToWidth(figureCanvas.width);
        figureCanvas.add(img);
        figureCanvas.renderAll();
      });
      
      window.closeFigureEditor = function() {
        document.body.removeChild(modal);
        if (figureCanvas) {
          figureCanvas.dispose();
          figureCanvas = null;
        }
      };
      
      window.saveFigure = function() {
        if (figureCanvas) {
          const dataURL = figureCanvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataURL;
          a.download = 'edited_figure.png';
          a.click();
        }
      };
      
      window.addTextToFigure = function() {
        if (figureCanvas) {
          const text = new fabric.Text('New Text', {
            left: 100,
            top: 100,
            fontSize: 20,
            fill: '#000000'
          });
          figureCanvas.add(text);
          figureCanvas.setActiveObject(text);
        }
      };
      
      window.addShapeToFigure = function() {
        if (figureCanvas) {
          const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
          });
          figureCanvas.add(rect);
          figureCanvas.setActiveObject(rect);
        }
      };
      
      window.cropFigure = function() {
        alert('Crop functionality - select area and crop');
        // In production: implement crop selection
      };
    }
    
    // Open table editor
    function openTableEditor(csvPath) {
      fetch(csvPath)
        .then(response => response.text())
        .then(csvText => {
          // Parse CSV
          const lines = csvText.split('\n').filter(l => l.trim());
          const data = lines.map(line => line.split(','));
          
          const modal = document.createElement('div');
          modal.className = 'file-preview-modal';
          modal.style.display = 'flex';
          modal.innerHTML = `
            <div class="file-preview-content" style="width: 90%; max-width: 1200px; height: 90vh;">
              <div class="file-preview-header">
                <h3>📊 Table Editor</h3>
                <div>
                  <button onclick="saveTable()" class="btn-modern btn-modern-primary" style="margin-right: 0.5rem;">Save CSV</button>
                  <span class="file-preview-close" onclick="closeTableEditor()">×</span>
                </div>
              </div>
              <div class="file-preview-body" style="padding: 1rem;">
                <div id="tableEditor" style="width: 100%; height: 70vh;"></div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          
          // Initialize Handsontable
          tableEditor = new Handsontable(document.getElementById('tableEditor'), {
            data: data,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true,
            filters: true,
            dropdownMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
          });
          
          window.closeTableEditor = function() {
            document.body.removeChild(modal);
            if (tableEditor) {
              tableEditor.destroy();
              tableEditor = null;
            }
          };
        }
      }
    }
