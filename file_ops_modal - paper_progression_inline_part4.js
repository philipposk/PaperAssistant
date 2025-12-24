    function getFileIcon(type) {
      const icons = {
        figure: '🖼️',
        table: '📊',
        markdown: '📝',
        document: '📄',
        log: '📋'
      };
      return icons[type] || '📁';
    }
    
    // Override shared function with page-specific implementation
    window.toggleDocumentExplorer = toggleDocumentExplorer;
    window.toggleDocumentExplorerView = toggleDocumentExplorerView;
    window.filterDocumentsByCategory = filterDocumentsByCategory;
    window.loadProjectFiles = loadProjectFiles;
    
    // File preview modal
    function showFilePreview(filePath, fileName) {
      const modal = document.getElementById('filePreviewModal');
      if (!modal) {
        console.warn('filePreviewModal element not found');
        return;
      }
      const modalTitle = document.getElementById('filePreviewTitle');
      const modalContent = document.getElementById('filePreviewContent');
      const modalDownload = document.getElementById('filePreviewDownload');
      const content = document.querySelector('.file-preview-content');
      
      // Reset to normal size when opening new file
      if (content) {
        content.classList.remove('fullscreen');
        modal.classList.remove('fullscreen');
        updateResizeButton(false);
      }
      
      modalTitle.textContent = fileName;
      modalContent.innerHTML = '<p>Loading preview...</p>';
      modal.style.display = 'block';
      // Ensure modal appears on top
      modal.style.zIndex = '10004';
      
      // Set file name in footer
      const fileNameElement = document.getElementById('filePreviewFileName');
      if (fileNameElement) {
        fileNameElement.textContent = fileName;
      }
      
      // Determine file type
      const ext = filePath.split('.').pop().toLowerCase();
      const isTextFile = ['md', 'txt', 'log', 'csv', 'r', 'rdata'].includes(ext);
      const isDocx = ext === 'docx';
      
      // Set download link
      modalDownload.href = filePath;
      modalDownload.download = fileName;
      modalDownload.style.display = 'inline-block';
      
      if (isTextFile) {
        // Fetch and display text content
        fetch(filePath)
          .then(response => {
            if (!response.ok) {
              // If file not found, try Google Drive
              if (response.status === 404) {
                modalContent.innerHTML = `
                  <div style="padding: 2rem; text-align: center;">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                      This file is stored in Google Drive. Click the download button to access it.
                    </p>
                    <a href="${DRIVE_FOLDER_URL}" class="drive-button" target="_blank" style="margin-top: 1rem;">
                      <span>📁</span>
                      <span>Open Google Drive</span>
                    </a>
                  </div>
                `;
                modalDownload.href = DRIVE_FOLDER_URL;
                modalDownload.textContent = 'Open in Google Drive';
                modalDownload.download = '';
                return;
              }
              throw new Error('File not found');
            }
            return response.text();
          })
          .then(text => {
            if (text) {
              // Format text based on file type
              if (ext === 'md') {
                // Simple markdown rendering (basic)
                const html = text
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/\n/g, '<br>');
                modalContent.innerHTML = `<div style="max-height: 60vh; overflow-y: auto; padding: 1rem; background: var(--bg-primary); border-radius: 8px; font-family: monospace; font-size: 0.9rem; line-height: 1.6;">${html}</div>`;
              } else if (ext === 'csv') {
                // Show CSV as table
                const lines = text.split('\n').filter(l => l.trim());
                const rows = lines.slice(0, 100).map(line => {
                  const cells = line.split(',').map(cell => `<td>${cell.trim()}</td>`).join('');
                  return `<tr>${cells}</tr>`;
                }).join('');
                modalContent.innerHTML = `
                  <div style="max-height: 60vh; overflow: auto; padding: 1rem;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                      Showing first 100 rows. Download for full file.
                    </p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                      ${rows}
                    </table>
                  </div>
                `;
              } else {
                // Plain text with syntax highlighting for code files
                const isCode = ['r', 'rdata'].includes(ext);
                const className = isCode ? 'language-r' : '';
                modalContent.innerHTML = `
                  <pre style="max-height: 60vh; overflow-y: auto; padding: 1rem; background: var(--bg-primary); border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(text)}</pre>
                `;
              }
            }
          })
          .catch(error => {
            modalContent.innerHTML = `
              <div style="padding: 2rem; text-align: center;">
                <p style="color: #d32f2f; margin-bottom: 1rem;">⚠️ Could not load preview</p>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${error.message}</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  This file may be in Google Drive. Click download to access it.
                </p>
                <a href="${DRIVE_FOLDER_URL}" class="drive-button" target="_blank" style="margin-top: 1rem;">
                  <span>📁</span>
                  <span>Open Google Drive</span>
                </a>
              </div>
            `;
            modalDownload.href = DRIVE_FOLDER_URL;
            modalDownload.textContent = 'Open in Google Drive';
            modalDownload.download = '';
          });
      } else if (isDocx) {
        // DOCX files - try to preview using Google Docs Viewer
        modalContent.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading DOCX preview...</p>';
        
        // First, try to fetch from repo
        fetch(filePath)
          .then(response => {
            if (response.ok) {
              // File is in repo, convert with mammoth.js
              return response.blob();
            } else {
              // File not in repo, it's in Google Drive
              // Use Google Docs Viewer with Google Drive link
              throw new Error('File in Google Drive');
            }
          })
          .then(blob => {
            // File is in repo, convert with mammoth.js
            const reader = new FileReader();
            reader.onload = function(e) {
              const arrayBuffer = e.target.result;
              
              if (typeof mammoth !== 'undefined') {
                mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                  .then(function(result) {
                    // Process HTML to constrain image sizes
                    let html = result.value;
                    // Add style to all images to constrain their size
                    html = html.replace(/<img([^>]*)>/gi, function(match, attrs) {
                      // Check if style already exists
                      if (attrs.includes('style=')) {
                        return match.replace(/style="([^"]*)"/gi, function(styleMatch, styleContent) {
                          return `style="${styleContent}; max-width: 100%; max-height: 60vh; height: auto; display: block; margin: 1rem auto;"`;
                        });
                      } else {
                        return `<img${attrs} style="max-width: 100%; max-height: 60vh; height: auto; display: block; margin: 1rem auto;">`;
                      }
                    });
                    // Also handle figures
                    html = html.replace(/<figure([^>]*)>/gi, '<figure$1 style="max-width: 100%; margin: 1rem auto; text-align: center;">');
                    
                    modalContent.innerHTML = `
                      <div style="max-height: 60vh; overflow-y: auto; padding: 2rem; background: var(--bg-secondary); border-radius: 8px;">
                        <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: var(--text-primary); max-width: 800px; margin: 0 auto;">
                          ${html}
                        </div>
                        ${result.messages.length > 0 ? '<p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; text-align: center;">Note: Some formatting may not be preserved.</p>' : ''}
                      </div>
                    `;
                  })
                  .catch(function(error) {
                    console.error('Mammoth error:', error);
                    showDocxGoogleDriveViewer(modalContent, modalDownload, fileName);
                  });
              } else {
                showDocxGoogleDriveViewer(modalContent, modalDownload, fileName);
              }
            };
            reader.readAsArrayBuffer(blob);
          })
          .catch(error => {
            // File is in Google Drive - use Google Docs Viewer
            showDocxGoogleDriveViewer(modalContent, modalDownload, fileName);
          });
      } else {
        // Other file types
        modalContent.innerHTML = `
          <div style="padding: 2rem; text-align: center;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
              Preview unavailable for this file type. Please download the file to view its contents.
            </p>
          </div>
        `;
      }
    }
    
    // Make showFilePreview globally accessible
    window.showFilePreview = showFilePreview;
    
    function showDocxGoogleDriveViewer(modalContent, modalDownload, fileName) {
        // For Google Drive files, we need to construct a viewer URL
        // Since files are in Google Drive, we'll embed the Google Drive viewer
        // The user needs to open the file in Google Drive first to get the file ID
        // For now, show instructions and Google Drive link
        
        modalContent.innerHTML = `
          <div style="padding: 2rem;">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; text-align: center;">
              This DOCX file is in Google Drive. To preview it:
            </p>
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
              <p style="color: var(--text-primary); margin-bottom: 1rem; font-weight: 600;">Option 1: Preview in Google Drive</p>
              <ol style="color: var(--text-secondary); margin-left: 1.5rem; line-height: 1.8;">
                <li>Click "Open in Google Drive" below</li>
                <li>Find and open the file: <strong>${fileName}</strong></li>
                <li>Google Drive will show a preview automatically</li>
              </ol>
            </div>
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px;">
              <p style="color: var(--text-primary); margin-bottom: 1rem; font-weight: 600;">Option 2: Download and Open</p>
              <p style="color: var(--text-secondary);">
                Use the download button below to download the file, then open it with Microsoft Word, Google Docs, or another DOCX viewer.
              </p>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
              <a href="${DRIVE_FOLDER_URL}" class="drive-button" target="_blank">
                <span>📁</span>
                <span>Open in Google Drive</span>
              </a>
            </div>
          </div>
        `;
        modalDownload.href = DRIVE_FOLDER_URL;
        modalDownload.textContent = 'Open in Google Drive';
        modalDownload.download = '';
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function closeFilePreview() {
      const modal = document.getElementById('filePreviewModal');
      const content = document.querySelector('.file-preview-content');
      if (modal) {
        modal.style.display = 'none';
      }
      // Reset to normal size when closing
      if (content) {
        content.classList.remove('fullscreen');
        if (modal) {
          modal.classList.remove('fullscreen');
        }
        updateResizeButton(false);
      }
    }
    
    // Close file preview on Escape key (only if preview is open)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const filePreviewModal = document.getElementById('filePreviewModal');
        if (filePreviewModal && filePreviewModal.style.display !== 'none' && filePreviewModal.style.display !== '') {
          closeFilePreview();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    function togglePreviewSize() {
      const modal = document.getElementById('filePreviewModal');
      const content = document.querySelector('.file-preview-content');
      const isFullscreen = content.classList.contains('fullscreen');
      
      if (isFullscreen) {
        // Switch to normal size
        content.classList.remove('fullscreen');
        modal.classList.remove('fullscreen');
        updateResizeButton(false);
      } else {
        // Switch to fullscreen
        content.classList.add('fullscreen');
        modal.classList.add('fullscreen');
        updateResizeButton(true);
      }
    }
    
    function updateResizeButton(isFullscreen) {
      const icon = document.getElementById('resizeIcon');
      const text = document.getElementById('resizeText');
      if (icon && text) {
        if (isFullscreen) {
          icon.textContent = '⛶';
          text.textContent = 'Normal';
        } else {
          icon.textContent = '⛶';
          text.textContent = 'Fullscreen';
        }
      }
    }
    
    // About Modal Functions
    function openAboutModal() {
      const modal = document.getElementById('aboutModal');
      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
      }
    }
    
