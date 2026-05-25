    // Parse CSV with better handling
    function parseCSV(csvText) {
      const lines = csvText.split('\n').filter(l => l.trim());
      if (lines.length === 0) return [];
      
      // Simple CSV parser - handles basic cases
      const rows = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        // Split by comma, but handle quoted fields
        const cells = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim()); // Last cell
        rows.push(cells);
      }
      return rows;
    }
    
    // Generate mini table preview HTML
    function generateTablePreview(data, maxRows = 4, maxCols = 5) {
      if (!data || data.length === 0) {
        return '<div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.75rem;">No data</div>';
      }
      
      const rows = Math.min(data.length, maxRows);
      const cols = Math.min(data[0]?.length || 0, maxCols);
      
      if (rows === 0 || cols === 0) {
        return '<div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.75rem;">Empty table</div>';
      }
      
      let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.65rem; line-height: 1.2;">';
      
      // Header row (if exists)
      if (data[0]) {
        html += '<thead><tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">';
        for (let j = 0; j < cols; j++) {
          const cell = (data[0][j] || '').toString().substring(0, 12);
          html += `<th style="padding: 0.25rem 0.35rem; text-align: left; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-color);">${cell}${cell.length >= 12 ? '...' : ''}</th>`;
        }
        if (data[0].length > maxCols) {
          html += '<th style="padding: 0.25rem; color: var(--text-tertiary);">...</th>';
        }
        html += '</tr></thead>';
      }
      
      // Data rows
      html += '<tbody>';
      const startRow = data[0] ? 1 : 0; // Skip header if first row looks like header
      for (let i = startRow; i < Math.min(data.length, startRow + maxRows); i++) {
        html += '<tr style="border-bottom: 1px solid var(--border-color);">';
        for (let j = 0; j < cols; j++) {
          const cell = (data[i]?.[j] || '').toString().substring(0, 12);
          html += `<td style="padding: 0.25rem 0.35rem; color: var(--text-secondary); border-right: 1px solid var(--border-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cell}${cell.length >= 12 ? '...' : ''}</td>`;
        }
        if (data[i] && data[i].length > maxCols) {
          html += '<td style="padding: 0.25rem; color: var(--text-tertiary);">...</td>';
        }
        html += '</tr>';
      }
      html += '</tbody>';
      
      // Show more indicator
      if (data.length > maxRows) {
        html += `<tfoot><tr><td colspan="${cols + 1}" style="padding: 0.25rem; text-align: center; color: var(--text-tertiary); font-size: 0.6rem; border-top: 1px solid var(--border-color);">+${data.length - maxRows} more rows</td></tr></tfoot>`;
      }
      
      html += '</table>';
      return html;
    }
    
    // Load table data and create preview
    async function loadTablePreview(tablePath) {
      try {
        const response = await fetch(tablePath);
        if (!response.ok) throw new Error('Failed to load table');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        return generateTablePreview(data, 4, 5);
      } catch (error) {
        console.warn('Could not load table preview:', tablePath, error);
        return '<div style="padding: 1rem; text-align: center; color: var(--text-tertiary); font-size: 0.75rem;">Preview unavailable</div>';
      }
    }
    
    async function loadTablesCarousel() {
      const track = document.getElementById('tablesCarouselTrack');
      if (!track) {
        console.warn('tablesCarouselTrack not found');
        return;
      }
      
      // Show loading state
      track.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Loading tables...</div>';
      
      // Use PROJECT_FILE_LOADER if available, otherwise use hardcoded list
      let tables = [];
      
      if (window.projectFileLoader && window.projectFileLoader.manifest) {
        // Get tables from manifest
        const manifestTables = window.projectFileLoader.manifest.tables || [];
        tables = manifestTables.slice(0, 10).map(tbl => {
          // Extract table number from filename
          const match = tbl.name.match(/table(\d+)/i);
          const number = match ? match[1] : tbl.name.replace(/\.(csv|xlsx)$/i, '');
          return {
            number: number,
            file: tbl.name,
            path: tbl.path,
            caption: tbl.caption || `Table ${number}`
          };
        });
      } else {
        // Fallback to hardcoded list
        tables = [
        { number: 1, file: "table1_dataset_overview.csv", caption: "Dataset overview" },
        { number: 2, file: "table2_summary_statistics.csv", caption: "Summary statistics" },
          { number: 3, file: "table3_variable_importance_lmg.csv", caption: "Variable importance" }
        ];
      }
      
      if (tables.length === 0) {
        track.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No tables found</div>';
        return;
      }
      
      const basePath = '../paper_a_analysis/tables/';
      
      // Create carousel items with placeholders first
      track.innerHTML = tables.map(tbl => {
        const tablePath = tbl.path || (basePath + tbl.file);
        return `
        <div class="carousel-item" onclick="window.open('${tablePath}', '_blank')" title="Table ${tbl.number}: ${tbl.caption}" data-table-path="${tablePath}">
          <div style="width: 100%; height: 150px; background: var(--bg-primary); border-radius: 8px; padding: 0.5rem; overflow: hidden; display: flex; flex-direction: column;">
            <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Table ${tbl.number}</div>
            <div style="flex: 1; overflow: hidden; display: flex; align-items: center; justify-content: center;" class="table-preview-container">
              <div style="padding: 0.5rem; text-align: center; color: var(--text-tertiary); font-size: 0.7rem;">Loading...</div>
            </div>
          </div>
          <div class="carousel-label">${tbl.caption.substring(0, 30)}${tbl.caption.length > 30 ? '...' : ''}</div>
        </div>
      `;
      }).join('');
      
      // Load previews asynchronously
      const items = track.querySelectorAll('.carousel-item');
      items.forEach((item, index) => {
        const tablePath = item.getAttribute('data-table-path');
        const previewContainer = item.querySelector('.table-preview-container');
        
        if (tablePath && previewContainer) {
          loadTablePreview(tablePath).then(previewHtml => {
            previewContainer.innerHTML = previewHtml;
          }).catch(error => {
            previewContainer.innerHTML = '<div style="padding: 0.5rem; text-align: center; color: var(--text-tertiary); font-size: 0.7rem;">Preview unavailable</div>';
          });
        }
      });
      
      console.log(`Loaded ${tables.length} tables into carousel`);
    }
    
    // Helper function to get correct path based on environment
    function getLocalPath(relativePath) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // If it's a figures or tables path, point to paper_a_analysis
      if (relativePath.startsWith('figures/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      if (relativePath.startsWith('tables/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      if (relativePath.startsWith('docs/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      if (relativePath.startsWith('logs/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      if (relativePath.startsWith('data_cleaning_docs/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      
      // For other files, check if they're MD files in paper_a_analysis
      if (relativePath.endsWith('.md') && !relativePath.includes('/')) {
        return isLocalhost ? `../paper_a_analysis/${relativePath}` : relativePath;
      }
      
      return relativePath;
    }
    
    // Make functions globally available
    window.scrollCarousel = scrollCarousel;
    window.loadFiguresCarousel = loadFiguresCarousel;
    window.loadTablesCarousel = loadTablesCarousel;
    window.getLocalPath = getLocalPath;
    
    // Load carousels on page load - wait for PROJECT_FILE_LOADER
    function initCarousels() {
      console.log('Initializing carousels...');
      const track1 = document.getElementById('figuresCarouselTrack');
      const track2 = document.getElementById('tablesCarouselTrack');
      console.log('Tracks found:', { track1: !!track1, track2: !!track2 });
      
      // Wait for project file loader to be ready
      if (window.projectFileLoader) {
        console.log('ProjectFileLoader found');
        if (window.projectFileLoader.manifest) {
          // Manifest already loaded
          console.log('Manifest already loaded, loading carousels...');
          if (typeof loadFiguresCarousel === 'function') loadFiguresCarousel();
          if (typeof loadTablesCarousel === 'function') loadTablesCarousel();
        } else {
          // Wait for manifest to load
          console.log('Loading manifest...');
          window.projectFileLoader.loadManifest().then(() => {
            console.log('Manifest loaded, loading carousels...');
            if (typeof loadFiguresCarousel === 'function') loadFiguresCarousel();
            if (typeof loadTablesCarousel === 'function') loadTablesCarousel();
          }).catch((err) => {
            console.warn('Manifest load failed, using fallback:', err);
            // If manifest fails, try loading anyway
            if (typeof loadFiguresCarousel === 'function') loadFiguresCarousel();
            if (typeof loadTablesCarousel === 'function') loadTablesCarousel();
          });
        }
      } else {
        // PROJECT_FILE_LOADER not available, try loading anyway
        console.log('ProjectFileLoader not found, using fallback');
        setTimeout(() => {
          if (typeof loadFiguresCarousel === 'function') loadFiguresCarousel();
          if (typeof loadTablesCarousel === 'function') loadTablesCarousel();
        }, 1000);
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initCarousels, 500);
      });
    } else {
      setTimeout(initCarousels, 500);
    }
    
    // Also try loading after a longer delay in case scripts load late
    setTimeout(initCarousels, 2000);
    
    // Force load carousels after all scripts are loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('Window loaded, attempting to load carousels...');
        if (typeof loadFiguresCarousel === 'function') {
          loadFiguresCarousel();
        } else {
          console.warn('loadFiguresCarousel not available');
        }
        if (typeof loadTablesCarousel === 'function') {
          loadTablesCarousel();
        } else {
          console.warn('loadTablesCarousel not available');
        }
      }, 1000);
    });
    
    // ============================================
    // SEMANTIC SEARCH WITH EMBEDDINGS (Transformers.js)
    // ============================================
    
    async function initializeEmbeddingsModel() {
      try {
        // Use a lightweight model that works in browser
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
        embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true // Use quantized model for faster loading
        });
        console.log('Embeddings model loaded');
        
        // Generate embeddings for existing search index (in background)
        generateEmbeddingsForIndex();
      } catch (error) {
        console.warn('Could not load embeddings model:', error);
        console.log('Falling back to TF-IDF search');
      }
    }
    
    // Generate embeddings for search index
    async function generateEmbeddingsForIndex() {
      if (!embeddingModel) return;
      
      console.log('Generating embeddings for search index...');
      const batchSize = 10;
      
      for (let i = 0; i < searchIndex.length; i += batchSize) {
        const batch = searchIndex.slice(i, i + batchSize);
        
        try {
          const embeddings = await Promise.all(
            batch.map(async (item) => {
              if (embeddingsCache.has(item.filePath + '_' + item.chunkIndex)) {
                return embeddingsCache.get(item.filePath + '_' + item.chunkIndex);
              }
              
              const embedding = await embeddingModel(item.content, {
                pooling: 'mean',
                normalize: true
              });
              
              const embeddingArray = Array.from(embedding.data);
              embeddingsCache.set(item.filePath + '_' + item.chunkIndex, embeddingArray);
              item.embedding = embeddingArray;
              
              // Store in IndexedDB
              if (db) {
                const transaction = db.transaction(['searchIndex'], 'readwrite');
                const store = transaction.objectStore('searchIndex');
                await store.put({
                  id: item.filePath + '_' + item.chunkIndex,
                  ...item,
                  embedding: embeddingArray
                });
              }
              
              return embeddingArray;
            })
          );
          
          // Small delay to avoid blocking
          if (i + batchSize < searchIndex.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error('Error generating embeddings for batch:', error);
        }
      }
      
      console.log('Embeddings generation complete');
    }
    
    // Semantic search using cosine similarity
    async function semanticSearch(query, topK = 5) {
      if (!embeddingModel) {
        throw new Error('Embeddings model not loaded');
      }
      
      // Generate query embedding
      const queryEmbedding = await embeddingModel(query, {
        pooling: 'mean',
        normalize: true
      });
      const queryVector = Array.from(queryEmbedding.data);
      
      // Calculate cosine similarity with all indexed documents
      const similarities = [];
      
      for (const item of searchIndex) {
        let itemEmbedding = item.embedding;
        
        // Load from cache if available
        if (!itemEmbedding) {
          const cacheKey = item.filePath + '_' + item.chunkIndex;
          itemEmbedding = embeddingsCache.get(cacheKey);
        }
        
        // Generate embedding if not cached
        if (!itemEmbedding) {
          try {
            const embedding = await embeddingModel(item.content, {
              pooling: 'mean',
              normalize: true
            });
            itemEmbedding = Array.from(embedding.data);
            embeddingsCache.set(item.filePath + '_' + item.chunkIndex, itemEmbedding);
            item.embedding = itemEmbedding;
          } catch (error) {
            console.error('Error generating embedding:', error);
            continue;
          }
        }
        
        // Calculate cosine similarity
        const similarity = cosineSimilarity(queryVector, itemEmbedding);
        
        if (similarity > 0.3) { // Threshold for relevance
          similarities.push({
            ...item,
            score: similarity,
            semanticScore: similarity
          });
        }
      }
      
      // Sort by similarity and return top K
      similarities.sort((a, b) => b.score - a.score);
      return similarities.slice(0, topK);
    }
    
    // Calculate cosine similarity between two vectors
    function cosineSimilarity(vecA, vecB) {
      if (vecA.length !== vecB.length) {
        return 0;
      }
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      
      const denominator = Math.sqrt(normA) * Math.sqrt(normB);
      if (denominator === 0) return 0;
      
      return dotProduct / denominator;
    }
    
    // Hybrid search: Combine semantic and TF-IDF scores
    async function hybridSearch(query, topK = 5) {
      const queryWords = extractKeywords(query);
      
      // Get semantic results
      let semanticResults = [];
      try {
        if (embeddingModel) {
          semanticResults = await semanticSearch(query, topK * 2);
        }
      } catch (error) {
        console.log('Semantic search failed, using TF-IDF only');
      }
      
      // Get TF-IDF results
      const tfidfResults = searchIndex.map(item => {
        const score = calculateTFIDFScore(queryWords, item, searchIndex);
        return { ...item, score, tfidfScore: score };
      }).filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK * 2);
      
      // Combine results
      const combinedResults = new Map();
      
      // Add semantic results with weight
      semanticResults.forEach(result => {
        const key = result.filePath + '_' + result.chunkIndex;
        combinedResults.set(key, {
          ...result,
          combinedScore: (result.semanticScore || 0) * 0.6 // 60% weight for semantic
        });
      });
      
      // Add TF-IDF results with weight
      tfidfResults.forEach(result => {
        const key = result.filePath + '_' + result.chunkIndex;
        const existing = combinedResults.get(key);
        if (existing) {
          existing.combinedScore += (result.tfidfScore || 0) * 0.4; // 40% weight for TF-IDF
        } else {
          combinedResults.set(key, {
            ...result,
            combinedScore: (result.tfidfScore || 0) * 0.4
          });
        }
      });
      
      // Sort by combined score and return top K
      return Array.from(combinedResults.values())
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, topK);
    }
    
    // ============================================
    // UNIVERSAL SEARCH SYSTEM
    // ============================================
    
    let searchIndex = [];
    let searchDebounceTimer = null;
    let embeddingModel = null;
    let embeddingsCache = new Map(); // Cache for embeddings
    let documentFrequencies = new Map(); // For TF-IDF
    let totalDocuments = 0;
    
    // Initialize search index from file system
    async function initializeSearchIndex() {
      // Build search index from file system structure
      searchIndex = [];
      await indexFiles(fileSystemStructure);
    }
    
    async function indexFiles(node, path = '') {
      if (node.type === 'file') {
        try {
          // Fetch file content
          const response = await fetch(node.path);
          if (response.ok) {
            const content = await response.text();
            // Improved chunking: 1000 char chunks with 200 char overlap
            const chunks = chunkText(content, 1000, 200);
            chunks.forEach((chunk, index) => {
              const chunkData = {
                filePath: node.path,
                fileName: node.name,
                chunkIndex: index,
                content: chunk,
                fileType: node.name.split('.').pop().toLowerCase(),
                wordCount: chunk.split(/\s+/).length,
                embedding: null, // Will be populated when embeddings are generated
                tfidfScores: null // Will be populated for TF-IDF
              };
              searchIndex.push(chunkData);
              
              // Calculate document frequencies for TF-IDF
              const words = extractWords(chunk);
              words.forEach(word => {
                documentFrequencies.set(word, (documentFrequencies.get(word) || 0) + 1);
              });
            });
            totalDocuments++;
          }
        } catch (e) {
          // File not accessible, skip
          console.log('Could not index file:', node.path);
        }
      } else if (node.children) {
        node.children.forEach(child => {
          indexFiles(child, path + '/' + node.name);
        });
      }
    }
    
    // ============================================
    // IMPROVED CHUNKING WITH OVERLAP & CONTEXT PRESERVATION
    // ============================================
    
