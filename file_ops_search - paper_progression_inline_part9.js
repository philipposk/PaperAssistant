    function handleChatbotFileSelect(event) {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        if (!chatbotAttachedFiles.find(f => f.name === file.name && f.size === file.size)) {
          chatbotAttachedFiles.push(file);
        }
      });
      updateChatbotFileDisplay();
    }
    
    function updateChatbotFileDisplay() {
      const container = document.getElementById('chatbotAttachedFiles');
      const uploadArea = document.getElementById('chatbotFileUploadArea');
      
      if (chatbotAttachedFiles.length === 0) {
        uploadArea.style.display = 'none';
        container.innerHTML = '';
        return;
      }
      
      uploadArea.style.display = 'block';
      container.innerHTML = chatbotAttachedFiles.map((file, index) => `
        <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); font-size: 0.8rem;">
          <span>${file.name}</span>
          <button onclick="removeChatbotFile(${index})" style="background: none; border: none; color: var(--error); cursor: pointer; font-size: 1rem; padding: 0; margin-left: 0.25rem;">×</button>
        </div>
      `).join('');
    }
    
    function removeChatbotFile(index) {
      chatbotAttachedFiles.splice(index, 1);
      updateChatbotFileDisplay();
    }
    
    function clearChatbotFiles() {
      chatbotAttachedFiles = [];
      updateChatbotFileDisplay();
    }
    
    async function processChatbotFiles() {
      if (chatbotAttachedFiles.length === 0) return '';
      
      let fileContents = [];
      for (const file of chatbotAttachedFiles) {
        try {
          const text = await file.text();
          fileContents.push(`File: ${file.name}\nContent:\n${text.substring(0, 5000)}${text.length > 5000 ? '... (truncated)' : ''}`);
        } catch (error) {
          fileContents.push(`File: ${file.name}\nError: Could not read file (${error.message})`);
        }
      }
      
      return '\n\n--- Uploaded Files ---\n' + fileContents.join('\n\n---\n\n');
    }
    
    function sendChatbotMessage() {
      const input = document.getElementById('chatbotInput');
      const message = input.value.trim();
      if (!message && chatbotAttachedFiles.length === 0) return;
      
      if (!aiApiKey) {
        alert('Please configure your AI API key in settings (⚙️ button)');
        const aiLocation = localStorage.getItem('aiAssistantLocation') || 'chat';
        if (aiLocation === 'settings') {
          openSettings();
          // Switch to AI tab
          setTimeout(() => {
            const aiTab = document.querySelector('[onclick="switchSettingsTab(\'ai\')"]');
            if (aiTab) aiTab.click();
          }, 100);
        } else {
          openChatbotSettings();
        }
        return;
      }
      
      // Add user message
      const messageWithFiles = chatbotAttachedFiles.length > 0 
        ? message + (message ? '\n\n' : '') + `[Attached ${chatbotAttachedFiles.length} file(s): ${chatbotAttachedFiles.map(f => f.name).join(', ')}]`
        : message;
      addChatbotMessage('user', messageWithFiles);
      input.value = '';
      autoResizeTextarea(input);
      
      // Store files to process before clearing
      const filesToProcess = [...chatbotAttachedFiles];
      
      // Show loading
      document.getElementById('chatbotLoading').style.display = 'flex';
      document.getElementById('chatbotSend').disabled = true;
      
      // Process files before clearing
      const processFiles = async () => {
        if (filesToProcess.length === 0) return '';
        let fileContents = [];
        for (const file of filesToProcess) {
          try {
            const text = await file.text();
            fileContents.push(`File: ${file.name}\nContent:\n${text.substring(0, 5000)}${text.length > 5000 ? '... (truncated)' : ''}`);
          } catch (error) {
            fileContents.push(`File: ${file.name}\nError: Could not read file (${error.message})`);
          }
        }
        return '\n\n--- Uploaded Files ---\n' + fileContents.join('\n\n---\n\n');
      };
      
      // Clear attached files after storing
      clearChatbotFiles();
      
      // Process files and get RAG context
      Promise.all([
        getRAGContext(message),
        getTrainingFilesContext(),
        processFiles()
      ]).then(([ragContext, trainingContext, fileContext]) => {
        const fullContext = [ragContext, trainingContext, fileContext].filter(c => c).join('\n\n');
        // Call AI API
        callAIAPI(message, fullContext)
          .then(response => {
            addChatbotMessage('assistant', response);
            document.getElementById('chatbotLoading').style.display = 'none';
            document.getElementById('chatbotSend').disabled = false;
          })
          .catch(error => {
            addChatbotMessage('assistant', 'Error: ' + error.message);
            document.getElementById('chatbotLoading').style.display = 'none';
            document.getElementById('chatbotSend').disabled = false;
          });
      }).catch(error => {
        console.error('RAG context error:', error);
        // Fallback: call AI without context
        processFiles().then(fileContext => {
          const context = fileContext || 'No additional context available.';
          return callAIAPI(message, context);
        }).then(response => {
          addChatbotMessage('assistant', response);
          document.getElementById('chatbotLoading').style.display = 'none';
          document.getElementById('chatbotSend').disabled = false;
        }).catch(err => {
          addChatbotMessage('assistant', 'Error: ' + err.message);
          document.getElementById('chatbotLoading').style.display = 'none';
          document.getElementById('chatbotSend').disabled = false;
        });
      });
    }
    
    function addChatbotMessage(role, content) {
      const messagesContainer = document.getElementById('chatbotMessages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-message ${role}`;
      
      const avatar = role === 'user' ? '👤' : '🤖';
      const formattedContent = formatMessageContent(content);
      
      messageDiv.innerHTML = `
        <div class="chatbot-message-avatar">${avatar}</div>
        <div class="chatbot-message-content">${formattedContent}</div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Store in history
      chatbotMessages.push({ role, content });
      conversationHistory.push({ role, content });
      
      // Keep last 20 messages
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
    }
    
    function formatMessageContent(content) {
      // Convert markdown to HTML
      let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\n/g, '<br>');
      
      return formatted;
    }
    
    // ============================================
    // IMPROVED RAG CONTEXT WITH TF-IDF & SEMANTIC SEARCH
    // ============================================
    
    async function getRAGContext(query) {
      const queryWords = extractKeywords(query);
      
      // Use hybrid search (semantic + TF-IDF) if available
      try {
        if (embeddingModel) {
          const hybridResults = await hybridSearch(query, 5);
          if (hybridResults.length > 0) {
            return formatRAGContext(hybridResults);
          }
        }
      } catch (error) {
        console.log('Hybrid search failed, falling back to TF-IDF:', error);
      }
      
      // Fallback to TF-IDF search
      const relevantChunks = [];
      
      searchIndex.forEach(item => {
        const score = calculateTFIDFScore(queryWords, item, searchIndex);
        if (score > 0) {
          relevantChunks.push({
            file: item.fileName,
            path: item.filePath,
            content: item.content,
            score: score,
            chunkIndex: item.chunkIndex
          });
        }
      });
      
      // Sort by score, take top 5 (improved from 3)
      relevantChunks.sort((a, b) => b.score - a.score);
      return formatRAGContext(relevantChunks.slice(0, 5));
    }
    
    // Format RAG context with better structure
    function formatRAGContext(chunks) {
      if (chunks.length === 0) {
        return 'No additional context available.';
      }
      
      return chunks.map((chunk, index) => {
        const content = chunk.content.length > 800 
          ? chunk.content.substring(0, 800) + '...' 
          : chunk.content;
        return `[Context ${index + 1}] From "${chunk.file}" (${chunk.path}):\n${content}`;
      }).join('\n\n---\n\n');
    }
    
    // Extract keywords (remove stop words)
    function extractKeywords(text) {
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how']);
      
      return text.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .map(word => word.replace(/[^\w]/g, ''));
    }
    
    // Calculate TF-IDF score
    function calculateTFIDFScore(queryWords, document, allDocuments) {
      if (!document.content || document.content.length === 0) return 0;
      
      const docWords = extractWords(document.content);
      const docWordFreq = new Map();
      docWords.forEach(word => {
        docWordFreq.set(word, (docWordFreq.get(word) || 0) + 1);
      });
      
      let score = 0;
      const docLength = docWords.length;
      
      queryWords.forEach(queryWord => {
        // Term Frequency (TF)
        const tf = (docWordFreq.get(queryWord) || 0) / docLength;
        
        // Inverse Document Frequency (IDF)
        const docFreq = documentFrequencies.get(queryWord) || 1;
        const idf = Math.log((totalDocuments + 1) / (docFreq + 1)) + 1;
        
        // TF-IDF score
        score += tf * idf;
        
        // Bonus for exact phrase match
        if (document.content.toLowerCase().includes(queryWords.join(' '))) {
          score += 0.5;
        }
        
        // Bonus for file name match
        if (document.fileName.toLowerCase().includes(queryWord)) {
          score += 0.3;
        }
      });
      
      return score;
    }
    
    // Extract words from text
    function extractWords(text) {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    }
    
    async function callAIAPI(userMessage, ragContext) {
      const provider = aiProviders[aiProvider];
      const messages = [];
      
      // System prompt
      const systemPrompt = `You are an AI Research Assistant helping with a PHEV (Plug-in Hybrid Electric Vehicle) research project. 
You can help with:
- Reading and summarizing research documents
- Answering questions about methodology, results, and analysis
- Suggesting improvements to papers and analysis
- Explaining statistical concepts and results
- Helping with writing and editing

Context from research files:
${ragContext || 'No additional context available.'}

Be helpful, accurate, and cite sources when possible.`;

      messages.push({ role: 'system', content: systemPrompt });
      
      // Add conversation history (last 10 messages)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
      
      // Add current message
      messages.push({ role: 'user', content: userMessage });
      
      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`
        },
        body: JSON.stringify({
          model: aiModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    }
    
    function handleChatbotKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        const input = document.getElementById('chatbotInput');
        const message = input ? input.value.trim() : '';
        if (message && typeof sendChatbotMessage === 'function') {
          sendChatbotMessage();
        } else if (message && typeof window.sendChatbotMessage === 'function') {
          window.sendChatbotMessage();
        }
      }
    }
    
