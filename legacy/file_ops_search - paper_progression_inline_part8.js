    function chunkText(text, chunkSize = 1000, overlap = 200) {
      // First, try to split by paragraphs (double newlines)
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
      const chunks = [];
      let currentChunk = [];
      let currentSize = 0;
      
      paragraphs.forEach(para => {
        const paraSize = para.length;
        
        // If adding this paragraph would exceed chunk size
        if (currentSize + paraSize > chunkSize && currentChunk.length > 0) {
          // Save current chunk
          chunks.push(currentChunk.join('\n\n'));
          
          // Start new chunk with overlap
          // Take last N characters from previous chunk for overlap
          const lastChunk = currentChunk.join('\n\n');
          const overlapText = lastChunk.slice(-overlap);
          currentChunk = [overlapText, para];
          currentSize = overlapText.length + paraSize;
        } else {
          // Add paragraph to current chunk
          currentChunk.push(para);
          currentSize += paraSize;
        }
      });
      
      // Add remaining chunk
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
      }
      
      // If no paragraphs found, fall back to sentence-based chunking
      if (chunks.length === 0) {
        const sentences = text.split(/([.!?]+\s+)/);
        currentChunk = [];
        currentSize = 0;
        
        sentences.forEach((sentence, index) => {
          const sentenceSize = sentence.length;
          
          if (currentSize + sentenceSize > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.join(''));
            const lastChunk = currentChunk.join('');
            const overlapText = lastChunk.slice(-overlap);
            currentChunk = [overlapText, sentence];
            currentSize = overlapText.length + sentenceSize;
          } else {
            currentChunk.push(sentence);
            currentSize += sentenceSize;
          }
        });
        
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(''));
        }
      }
      
      // Final fallback: character-based with overlap
      if (chunks.length === 0) {
        let start = 0;
        while (start < text.length) {
          const end = Math.min(start + chunkSize, text.length);
          chunks.push(text.substring(start, end));
          start = end - overlap;
        }
      }
      
      return chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
    }
    
    function performSearch(query) {
      // Clear previous debounce
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      
      // Debounce search (300ms)
      searchDebounceTimer = setTimeout(() => {
        if (query.trim().length === 0) {
          hideSearchResults();
          return;
        }
        
        const results = searchFiles(query.trim());
        displaySearchResults(results, query);
      }, 300);
    }
    
    // Make globally accessible
    window.performSearch = performSearch;
    window.showSearchResults = showSearchResults;
    window.hideSearchResults = hideSearchResults;
    window.openSearchResult = openSearchResult;
    
    function searchFiles(query) {
      if (searchIndex.length === 0) {
        // Fallback to simple file name search
        return searchByFileName(query);
      }
      
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      // Score each chunk using TF-IDF
      const scoredResults = searchIndex.map(item => {
        const score = calculateTFIDFScore(queryWords, item, searchIndex);
        return { ...item, score };
      }).filter(item => item.score > 0);
      
      // Sort by score, group by file
      scoredResults.sort((a, b) => b.score - a.score);
      
      // Group by file, take best chunk per file
      const fileMap = new Map();
      scoredResults.forEach(result => {
        if (!fileMap.has(result.filePath) || fileMap.get(result.filePath).score < result.score) {
          fileMap.set(result.filePath, result);
        }
      });
      
      return Array.from(fileMap.values()).slice(0, 10); // Top 10 results
    }
    
    function searchByFileName(query) {
      const queryLower = query.toLowerCase();
      const results = [];
      
      function searchNode(node) {
        if (node.type === 'file' && node.name.toLowerCase().includes(queryLower)) {
          results.push({
            filePath: node.path,
            fileName: node.name,
            content: '',
            score: 100,
            fileType: node.name.split('.').pop().toLowerCase()
          });
        }
        if (node.children) {
          node.children.forEach(child => searchNode(child));
        }
      }
      
      searchNode(fileSystemStructure);
      return results.slice(0, 10);
    }
    
    function displaySearchResults(results, query) {
      const resultsContainer = document.getElementById('searchResults');
      
      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
        resultsContainer.classList.add('show');
        return;
      }
      
      const queryWords = query.toLowerCase().split(/\s+/);
      
      resultsContainer.innerHTML = results.map(result => {
        const snippet = getSnippet(result.content, queryWords, 150);
        const icon = getFileIcon(result.fileName);
        
        return `
          <div class="search-result-item" onclick="openSearchResult('${result.filePath}', '${result.fileName}')">
            <div class="search-result-title">
              <span>${icon}</span>
              <span>${highlightText(result.fileName, queryWords)}</span>
            </div>
            <div class="search-result-path">${result.filePath}</div>
            <div class="search-result-snippet">${snippet}</div>
            <div class="search-result-score">Relevance: ${Math.round(result.score)}%</div>
          </div>
        `;
      }).join('');
      
      resultsContainer.classList.add('show');
    }
    
    function getSnippet(text, queryWords, maxLength) {
      if (!text) return '...';
      
      const textLower = text.toLowerCase();
      let bestIndex = -1;
      let bestScore = 0;
      
      // Find best snippet (most query words)
      for (let i = 0; i < text.length - maxLength; i++) {
        const snippet = text.substring(i, i + maxLength).toLowerCase();
        const score = queryWords.reduce((sum, word) => {
          return sum + (snippet.includes(word) ? 1 : 0);
        }, 0);
        
        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
      
      if (bestIndex === -1) {
        bestIndex = 0;
      }
      
      let snippet = text.substring(bestIndex, bestIndex + maxLength);
      if (bestIndex > 0) snippet = '...' + snippet;
      if (bestIndex + maxLength < text.length) snippet = snippet + '...';
      
      return highlightText(snippet, queryWords);
    }
    
    function highlightText(text, queryWords) {
      let highlighted = text;
      queryWords.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="search-result-highlight">$1</span>');
      });
      return highlighted;
    }
    
    function openSearchResult(filePath, fileName) {
      if (typeof openFile === 'function') {
        openFile(filePath, new Event('click'));
      } else if (typeof window.openFile === 'function') {
        window.openFile(filePath, new Event('click'));
      }
      if (typeof hideSearchResults === 'function') {
        hideSearchResults();
      } else if (typeof window.hideSearchResults === 'function') {
        window.hideSearchResults();
      }
      const searchInput = document.getElementById('universalSearchInput');
      if (searchInput) searchInput.blur();
    }
    
    window.openSearchResult = openSearchResult;
    
    function showSearchResults() {
      const results = document.getElementById('searchResults');
      if (results.innerHTML.trim() !== '<div class="search-no-results">Type to search...</div>') {
        results.classList.add('show');
      }
    }
    
    function hideSearchResults() {
      document.getElementById('searchResults').classList.remove('show');
    }
    
    // Search expand/collapse functions
    function toggleSearch() {
      const searchContainer = document.getElementById('universalSearch');
      const searchInput = document.getElementById('universalSearchInput');
      if (searchContainer.classList.contains('expanded')) {
        collapseSearch();
      } else {
        expandSearch();
      }
    }
    
    function expandSearch() {
      const searchContainer = document.getElementById('universalSearch');
      const searchInput = document.getElementById('universalSearchInput');
      if (searchContainer && searchInput) {
        searchContainer.classList.add('expanded');
        setTimeout(() => {
          searchInput.focus();
        }, 100);
      }
    }
    
    function collapseSearch() {
      const searchContainer = document.getElementById('universalSearch');
      const searchInput = document.getElementById('universalSearchInput');
      if (searchContainer && searchInput) {
        searchContainer.classList.remove('expanded');
        searchInput.value = '';
        hideSearchResults();
        searchInput.blur();
      }
    }
    
    // Keyboard shortcut: Ctrl+K or Cmd+K to toggle search
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      // Escape to close search
      if (e.key === 'Escape') {
        const searchContainer = document.getElementById('universalSearch');
        if (searchContainer && searchContainer.classList.contains('expanded')) {
          collapseSearch();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    // Make functions globally available
    window.toggleSearch = toggleSearch;
    window.expandSearch = expandSearch;
    window.collapseSearch = collapseSearch;
    
    // Make available early
    if (typeof window.toggleSearch === 'undefined') {
      window.toggleSearch = toggleSearch;
      window.expandSearch = expandSearch;
      window.collapseSearch = collapseSearch;
    }
    // Set Google Drive link (use global DRIVE_FOLDER_URL or get from first script block)
    const driveUrl = window.DRIVE_FOLDER_URL || 'https://drive.google.com/drive/folders/1PSRm7LG9QyBRnVgHREzQITe5Bthrniro?usp=sharing';
    if (driveUrl !== 'YOUR_GOOGLE_DRIVE_FOLDER_URL_HERE') {
      const driveLink = document.getElementById('drive-link-progression');
      if (driveLink) {
        driveLink.href = driveUrl;
      }
    } else {
      // Hide section if URL not set
      const driveSection = document.querySelector('.drive-section');
      if (driveSection) {
        driveSection.style.display = 'none';
      }
    }
    // ============================================
    // AI RESEARCH ASSISTANT
    // ============================================
    
    let chatbotMessages = [];
    let aiProvider = 'openai'; // 'openai' or 'groq'
    let aiApiKey = '';
    let aiModel = 'gpt-3.5-turbo';
    let conversationHistory = [];
    
    // AI Provider Configuration
    const aiProviders = {
      openai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-3.5-turbo',
        keyPrefix: 'sk-'
      },
      groq: {
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama-3.1-8b-instant',
        keyPrefix: 'gsk_'
      }
    };
    
    function openChatbot() {
      const modal = document.getElementById('chatbotModal');
      modal.classList.add('show');
      document.getElementById('chatbotInput').focus();
      
      // Load API key from localStorage
      loadAIConfig();
    }
    
    function closeChatbot() {
      const modal = document.getElementById('chatbotModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
      document.body.style.overflow = '';
    }
    
    // Close chatbot on Escape key (only if chatbot is open)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const chatbotModal = document.getElementById('chatbotModal');
        if (chatbotModal && chatbotModal.classList.contains('show')) {
          closeChatbot();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    function loadAIConfig() {
      aiProvider = localStorage.getItem('aiProvider') || 'openai';
      aiApiKey = localStorage.getItem('aiApiKey') || '';
      aiModel = localStorage.getItem('aiModel') || aiProviders[aiProvider].defaultModel;
      
      // Make available globally
      window.aiProvider = aiProvider;
      window.aiApiKey = aiApiKey;
      window.aiModel = aiModel;
    }
    
    function saveAIConfig() {
      localStorage.setItem('aiProvider', aiProvider);
      if (aiApiKey) {
        localStorage.setItem('aiApiKey', aiApiKey);
      }
      localStorage.setItem('aiModel', aiModel);
      
      // Update global variables
      window.aiProvider = aiProvider;
      window.aiApiKey = aiApiKey;
      window.aiModel = aiModel;
    }
    
    function openChatbotSettings() {
      const provider = prompt('AI Provider (openai/groq):', aiProvider);
      if (provider && (provider === 'openai' || provider === 'groq')) {
        aiProvider = provider;
        aiModel = aiProviders[provider].defaultModel;
        saveAIConfig();
      }
      
      const apiKey = prompt('Enter API Key (leave empty to keep current):');
      if (apiKey !== null && apiKey !== '') {
        if (apiKey.startsWith(aiProviders[aiProvider].keyPrefix)) {
          aiApiKey = apiKey;
          saveAIConfig();
          alert('API key saved!');
        } else {
          alert('Invalid API key format. Should start with: ' + aiProviders[aiProvider].keyPrefix);
        }
      }
    }
    
    // Chatbot file upload state
    let chatbotAttachedFiles = [];
    
    function toggleChatbotFileUpload() {
      const uploadArea = document.getElementById('chatbotFileUploadArea');
      const fileInput = document.getElementById('chatbotFileInput');
      
      if (!fileInput) {
        // Create file input if it doesn't exist
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'chatbotFileInput';
        input.multiple = true;
        input.style.display = 'none';
        input.accept = '.pdf,.docx,.txt,.md,.csv,.json,.py,.r,.R,.jpg,.jpeg,.png,.gif';
        input.onchange = handleChatbotFileSelect;
        document.body.appendChild(input);
        input.click();
      } else {
        fileInput.click();
      }
    }
    
