    function closeAboutModal() {
      const modal = document.getElementById('aboutModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
    }
    
    // Make globally accessible
    window.openAboutModal = openAboutModal;
    window.closeAboutModal = closeAboutModal;
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      const aboutModal = document.getElementById('aboutModal');
      const filePreviewModal = document.getElementById('filePreviewModal');
      if (event.target === aboutModal) {
        closeAboutModal();
      }
      if (event.target === filePreviewModal) {
        closeFilePreview();
      }
    });
    
    // File opening - show preview instead of direct open
    function openFile(path, event) {
      if (!path) return;
      
      // Normalize path for localhost
      if (path && !path.startsWith('http') && !path.startsWith('//') && typeof getLocalPath === 'function') {
        path = getLocalPath(path);
      }
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      const fileName = path.split('/').pop();
      if (typeof showFilePreview === 'function') {
        showFilePreview(path, fileName);
      } else if (typeof window.showFilePreview === 'function') {
        window.showFilePreview(path, fileName);
      } else {
        console.warn('showFilePreview function not available');
        // Fallback: open in new tab
        window.open(path, '_blank');
      }
    }
    
    // Make globally accessible
    window.openFile = openFile;
    
    // Script Status - Multiple Scripts
    async function updateScriptStatus() {
      const statusDiv = document.getElementById('script-status-content');
      
      // Define all scripts to monitor with their log files and descriptions
      const scripts = [
        {
          name: 'All Models (Clean Variables)',
          logFile: 'all_models_CLEAN.log',
          scriptFile: '09g_all_models_CLEAN_variables.R',
          description: 'Runs RF, XGBoost, GAM, NN, LightGBM, CatBoost, Ensemble with 26 clean variables'
        },
        {
          name: 'Comprehensive Analysis (All Models)',
          logFile: 'comprehensive_analysis_ALL.log',
          scriptFile: '09_comprehensive_model_comparison_ALL.R',
          description: 'Full model comparison with all 7 models (44 variables)'
        },
        {
          name: 'Comprehensive Analysis',
          logFile: 'comprehensive_analysis.log',
          scriptFile: '09_comprehensive_model_comparison.R',
          description: 'Model comparison analysis'
        },
        {
          name: 'EDS Comprehensive Analysis',
          logFile: 'eds_comprehensive_analysis.log',
          scriptFile: '11_eds_comprehensive_analysis.R',
          description: 'Country-level EDS analysis with regression, ANOVA, regional comparisons'
        },
        {
          name: 'EDS Analysis',
          logFile: 'eds_analysis.log',
          scriptFile: '11_eds_focused_analysis.R',
          description: 'EDS-focused country-level analysis'
        },
        {
          name: 'Future Work Analyses',
          logFile: 'future_work_analyses.log',
          scriptFile: '99_run_future_work_analyses.R',
          description: 'Individual vehicle EDS, temporal, and charging infrastructure analyses'
        }
      ];
      
      let allStatusHTML = '<div style="display: grid; gap: 1.5rem;">';
      
      // Detect if running on localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const logsBasePath = isLocalhost ? '../paper_a_analysis/' : 'logs/';
      
      // Fetch status for each script
      const statusPromises = scripts.map(async (script) => {
        try {
          const logPath = isLocalhost ? `${logsBasePath}${script.logFile}` : `${logsBasePath}${script.logFile}`;
          const response = await fetch(logPath);
          if (!response.ok) {
            return {
              script: script,
              status: 'not_found',
              content: null
            };
          }
          const logText = await response.text();
          const lines = logText.split('\n').filter(l => l.trim());
          const lastLines = lines.slice(-5);
          
          // Determine status
          const hasError = logText.toLowerCase().includes('error') || 
                          logText.toLowerCase().includes('halted') ||
                          logText.toLowerCase().includes('execution halted');
          const isComplete = logText.toLowerCase().includes('complete') || 
                            logText.toLowerCase().includes('finished') ||
                            logText.toLowerCase().includes('saved to:') ||
                            (logText.toLowerCase().includes('ensemble') && !hasError);
          
          let statusType = 'unknown';
          let statusIcon = '⏳';
          let statusColor = 'orange';
          
          if (isComplete && !hasError) {
            statusType = 'complete';
            statusIcon = '✅';
            statusColor = 'green';
          } else if (hasError) {
            statusType = 'error';
            statusIcon = '❌';
            statusColor = 'red';
          } else if (lines.length > 10) {
            statusType = 'running';
            statusIcon = '⏳';
            statusColor = 'blue';
          }
          
          return {
            script: script,
            status: statusType,
            statusIcon: statusIcon,
            statusColor: statusColor,
            lastLines: lastLines,
            logText: logText,
            lineCount: lines.length
          };
        } catch (err) {
          return {
            script: script,
            status: 'error',
            statusIcon: '❌',
            statusColor: 'red',
            error: err.message,
            content: null
          };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      
      // Render each script's status
      statuses.forEach((statusInfo) => {
        const { script, status, statusIcon, statusColor, lastLines, logText, lineCount, error } = statusInfo;
        
        allStatusHTML += `
          <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--${statusColor === 'green' ? 'accent' : statusColor === 'red' ? 'error' : 'warning'}); box-shadow: 0 2px 8px var(--shadow);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; color: var(--text-primary);">${statusIcon} ${script.name}</h4>
              <span style="font-size: 0.85rem; color: var(--text-secondary);">${lineCount || 0} lines</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${script.description}</p>
            <div style="margin-bottom: 0.75rem;">
              <strong style="color: ${statusColor};">Status:</strong> 
              <span style="color: ${statusColor};">${status === 'complete' ? 'Completed' : status === 'error' ? 'Error/Crashed' : status === 'running' ? 'Running/In Progress' : 'Unknown'}</span>
            </div>
        `;
        
        if (error) {
          allStatusHTML += `<p style="color: red; font-size: 0.85rem;">Error loading log: ${error}</p>`;
        } else if (lastLines && lastLines.length > 0) {
          allStatusHTML += `
            <details style="margin-top: 0.5rem;">
              <summary style="cursor: pointer; color: var(--accent); font-size: 0.9rem;">Last 5 lines of log</summary>
              <pre style="background: var(--bg-primary); padding: 0.75rem; border-radius: 6px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem; max-height: 150px; overflow-y: auto;">${lastLines.join('\n')}</pre>
            </details>
          `;
        }
        
        // Extract specific information based on script type
        if (logText) {
          if (script.name.includes('All Models')) {
            const modelsCompleted = [];
            if (logText.includes('Random Forest already completed') || logText.includes('Random Forest complete')) modelsCompleted.push('RF');
            if (logText.includes('XGBoost already completed') || logText.includes('XGBoost complete')) modelsCompleted.push('XGBoost');
            if (logText.includes('GAM already completed') || logText.includes('GAM complete')) modelsCompleted.push('GAM');
            if (logText.includes('Neural Network already completed') || logText.includes('Neural Network complete')) modelsCompleted.push('NN');
            if (logText.includes('LightGBM complete')) modelsCompleted.push('LightGBM');
            if (logText.includes('CatBoost complete')) modelsCompleted.push('CatBoost');
            if (logText.includes('Ensemble complete') || logText.includes('All models complete')) modelsCompleted.push('Ensemble');
            if (modelsCompleted.length > 0) {
              allStatusHTML += `<div style="margin-top: 0.5rem; font-size: 0.85rem;"><strong>Models:</strong> ${modelsCompleted.join(', ')}</div>`;
            }
          } else if (script.name.includes('EDS')) {
            const r2Match = logText.match(/R²:\s*([\d.]+)/);
            if (r2Match) {
              allStatusHTML += `<div style="margin-top: 0.5rem; font-size: 0.85rem;"><strong>Best R²:</strong> ${r2Match[1]}</div>`;
            }
            if (logText.includes('Temperature data merged for')) {
              const countriesMatch = logText.match(/Temperature data merged for (\d+) countries/);
              if (countriesMatch) {
                allStatusHTML += `<div style="margin-top: 0.5rem; font-size: 0.85rem;"><strong>Countries analyzed:</strong> ${countriesMatch[1]}</div>`;
              }
            }
          }
        }
        
        allStatusHTML += `</div>`;
      });
      
      allStatusHTML += '</div>';
      statusDiv.innerHTML = allStatusHTML;
      document.getElementById('script-status-explanation').innerHTML = explainScriptStatus();
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      // Timeline will be rendered when JSON loads
      // If JSON fails, show message
      setTimeout(() => {
        if (timelineData.length === 0 && allTimelineData.length === 0) {
          document.getElementById('timeline-content').innerHTML = 
            '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Timeline data loading... If this persists, check that TIMELINE_DATA.json exists.</p>';
        }
      }, 1000);
      
      renderFiles('paper-files', fileData.paper);
      renderFiles('script-files', fileData.scripts);
      renderFiles('result-files', fileData.results);
      renderFiles('doc-files', fileData.docs);
      if (fileData.logs) renderFiles('log-files', fileData.logs);
      if (fileData.scripts_all) renderFiles('scripts-all-files', fileData.scripts_all);
      if (fileData.utilities) renderFiles('utilities-files', fileData.utilities);
      renderDocxDropdown();
      updateScriptStatus();
      
      // Initialize timeline on page load
      setTimeout(() => {
        if (typeof window.TimelineSystem !== 'undefined' && !window.timelineSystemInstance) {
          const timelineContainer = document.getElementById('timelineContainer');
          if (timelineContainer) {
            window.timelineSystemInstance = new window.TimelineSystem('timelineContainer');
            window.timelineSystemInstance.init();
          }
        }
      }, 500);
      
      // Update script status every 30 seconds
      setInterval(updateScriptStatus, 30000);
    });
    
    // Explanation of script status
    function explainScriptStatus() {
      const explanation = `
        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
          <h4>📝 Script Status Monitoring</h4>
          <p style="margin-top: 0.5rem; color: var(--text-secondary);">
            This section monitors <strong>6 different analysis scripts</strong> and their log files:
          </p>
          <ul style="margin-left: 1.5rem; margin-top: 0.5rem; color: var(--text-secondary);">
            <li><strong>All Models (Clean Variables):</strong> Runs RF, XGBoost, GAM, NN, LightGBM, CatBoost, Ensemble with 26 clean variables</li>
            <li><strong>Comprehensive Analysis (All Models):</strong> Full model comparison with all 7 models using 44 variables</li>
            <li><strong>Comprehensive Analysis:</strong> Standard model comparison analysis</li>
            <li><strong>EDS Comprehensive Analysis:</strong> Country-level EDS analysis with regression, ANOVA, regional comparisons</li>
            <li><strong>EDS Analysis:</strong> EDS-focused country-level analysis</li>
            <li><strong>Future Work Analyses:</strong> Individual vehicle EDS, temporal, and charging infrastructure analyses</li>
          </ul>
          <p style="margin-top: 1rem; color: var(--text-secondary);">
            <strong>Status Indicators:</strong>
          </p>
          <ul style="margin-left: 1.5rem; margin-top: 0.5rem; color: var(--text-secondary);">
            <li>✅ <strong>Green:</strong> Script completed successfully</li>
            <li>❌ <strong>Red:</strong> Script crashed or encountered an error</li>
            <li>⏳ <strong>Blue/Orange:</strong> Script is running or status is unknown</li>
          </ul>
          <p style="margin-top: 1rem; color: var(--text-secondary);">
            <strong>Auto-refresh:</strong> Status updates every 30 seconds. Click "Last 5 lines of log" to see recent output from each script.
          </p>
        </div>
      `;
      return explanation;
    }
    
    // Google Drive link configuration (defined at top level for all functions)
    // This is already defined above, keeping for reference
    
    // ============================================
    // FILE EXPLORER SIDEBAR
    // ============================================
    
    let fileTreeData = [];
    let currentFileIndex = -1;
    let currentFolderFiles = [];
    
    // Initialize navigation buttons on load
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        if (typeof updateNavigationButtons === 'function') {
          updateNavigationButtons();
        }
      }, 100);
    });
    
    // File system structure (based on deployed site structure, adjusted for localhost)
    function getFileSystemStructure() {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const basePath = isLocalhost ? '../paper_a_analysis/' : '';
      
      return {
        name: 'Root',
        type: 'folder',
        children: [
          {
            name: 'docs',
            type: 'folder',
            children: [
              { name: 'PAPER_BUILD_GUIDE.md', type: 'file', path: basePath + 'PAPER_BUILD_GUIDE.md' },
              { name: 'METHODOLOGY_EVOLUTION_DOCUMENTATION.md', type: 'file', path: basePath + 'METHODOLOGY_EVOLUTION_DOCUMENTATION.md' },
              { name: 'VARIABLE_SELECTION_DOCUMENTATION.md', type: 'file', path: basePath + 'VARIABLE_SELECTION_DOCUMENTATION.md' },
              { name: 'TODO_PAPER_COMPLETION.md', type: 'file', path: basePath + 'TODO_PAPER_COMPLETION.md' },
              { name: 'MARKOS_REVIEW_NEEDED.md', type: 'file', path: basePath + 'MARKOS_REVIEW_NEEDED.md' },
              { name: 'DEVELOPMENT_LOG_COMPLETE.md', type: 'file', path: basePath + 'DEVELOPMENT_LOG_COMPLETE.md' },
              { name: 'DEVELOPMENT_LOG_SUMMARY.md', type: 'file', path: basePath + 'DEVELOPMENT_LOG_SUMMARY.md' },
              { name: 'FUTURE_WORK_PROPOSAL.md', type: 'file', path: basePath + 'FUTURE_WORK_PROPOSAL.md' },
              { name: 'ALL_MODELS_COMPLETE_SUMMARY.md', type: 'file', path: basePath + 'ALL_MODELS_COMPLETE_SUMMARY.md' },
              { name: 'COMPLETE_UPDATE_SUMMARY.md', type: 'file', path: basePath + 'COMPLETE_UPDATE_SUMMARY.md' },
              { name: 'PAPER_DRAFT.md', type: 'file', path: basePath + 'PAPER_DRAFT.md' },
              { name: 'APPENDIX_A.md', type: 'file', path: basePath + 'APPENDIX_A.md' },
              { name: 'PAPER_OUTLINE.md', type: 'file', path: basePath + 'PAPER_OUTLINE.md' },
              { name: 'SUPERVISOR_MEETING_QUESTIONS.md', type: 'file', path: basePath + 'SUPERVISOR_MEETING_QUESTIONS.md' },
              { name: 'SUPERVISOR_MEETING_QUICK_REFERENCE.md', type: 'file', path: basePath + 'SUPERVISOR_MEETING_QUICK_REFERENCE.md' }
            ]
          },
          {
            name: 'logs',
            type: 'folder',
            children: [
              { name: 'all_models_CLEAN.log', type: 'file', path: basePath + 'all_models_CLEAN.log' },
              { name: 'comprehensive_analysis_ALL.log', type: 'file', path: basePath + 'comprehensive_analysis_ALL.log' },
              { name: 'comprehensive_analysis.log', type: 'file', path: basePath + 'comprehensive_analysis.log' },
              { name: 'eds_comprehensive_analysis.log', type: 'file', path: basePath + 'eds_comprehensive_analysis.log' },
              { name: 'eds_analysis.log', type: 'file', path: basePath + 'eds_analysis.log' },
              { name: 'future_work_analyses.log', type: 'file', path: basePath + 'future_work_analyses.log' },
              { name: 'monitor.log', type: 'file', path: basePath + 'monitor.log' }
            ]
          },
          {
            name: 'data_cleaning_docs',
            type: 'folder',
            children: [
              { name: 'README.md', type: 'file', path: basePath + 'data_cleaning_docs/README.md' },
              { name: 'DATA_CLEANING_DOCUMENTATION.md', type: 'file', path: basePath + 'data_cleaning_docs/DATA_CLEANING_DOCUMENTATION.md' },
              { name: 'FLAGGING_STATISTICS_TABLE.md', type: 'file', path: basePath + 'data_cleaning_docs/FLAGGING_STATISTICS_TABLE.md' },
              { name: 'FLAGGING_APPROACH_EXPLANATION.md', type: 'file', path: basePath + 'data_cleaning_docs/FLAGGING_APPROACH_EXPLANATION.md' },
              { name: 'CLEANING_EXECUTION_SUMMARY.md', type: 'file', path: basePath + 'data_cleaning_docs/CLEANING_EXECUTION_SUMMARY.md' },
              { name: 'CLEANING_SCRIPT_README.md', type: 'file', path: basePath + 'data_cleaning_docs/CLEANING_SCRIPT_README.md' },
              { name: 'DATA_CLEANING_DETAILED_LOG.txt', type: 'file', path: basePath + 'data_cleaning_docs/DATA_CLEANING_DETAILED_LOG.txt' }
            ]
          },
          {
            name: 'tables',
            type: 'folder',
            children: [
              { name: 'final_selected_variables_CLEAN.csv', type: 'file', path: basePath + 'tables/final_selected_variables_CLEAN.csv' },
              { name: 'model_comparison_CLEAN_variables.csv', type: 'file', path: basePath + 'tables/model_comparison_CLEAN_variables.csv' },
              { name: 'all_tables.md', type: 'file', path: basePath + 'tables/all_tables.md' }
            ]
          },
          {
            name: 'figures',
            type: 'folder',
            children: [] // Will be populated dynamically or from file list
          },
        {
          name: 'Root Files',
          type: 'folder',
          children: [
            { name: 'index.html', type: 'file', path: 'index.html' },
            { name: 'paper_progression.html', type: 'file', path: 'paper_progression.html' },
            { name: 'figures_portfolio.html', type: 'file', path: 'figures_portfolio.html' },
            { name: 'tables_portfolio.html', type: 'file', path: 'tables_portfolio.html' },
            { name: 'TIMELINE_DATA.json', type: 'file', path: 'TIMELINE_DATA.json' }
          ]
        }
      ]
    };
    
    function toggleFileExplorer() {
      const sidebar = document.getElementById('fileExplorerSidebar');
      const body = document.body;
      if (sidebar) {
        sidebar.classList.toggle('open');
        body.classList.toggle('sidebar-open');
        
        // Load file tree on first open
        if (sidebar.classList.contains('open') && fileTreeData.length === 0) {
          if (typeof buildFileTree === 'function') {
            buildFileTree();
          } else {
            console.warn('buildFileTree function not available yet');
          }
        }
      } else {
        console.error('File explorer sidebar element not found');
      }
    }
    
    // Make globally accessible immediately - override placeholder
    window.toggleFileExplorer = toggleFileExplorer;
    
    function buildFileTree() {
      const treeContainer = document.getElementById('fileTree');
      const fileSystemStructure = getFileSystemStructure();
      fileTreeData = flattenFileTree(fileSystemStructure);
      treeContainer.innerHTML = renderFileTree(fileSystemStructure);
    }
    
    function flattenFileTree(node, path = '', result = []) {
      if (node.type === 'file') {
        result.push({ ...node, fullPath: path + '/' + node.name });
      } else if (node.children) {
        node.children.forEach(child => {
          flattenFileTree(child, path + '/' + node.name, result);
        });
      }
      return result;
    }
    
    // Make functions globally available
    if (typeof window !== 'undefined') {
      window.flattenFileTree = flattenFileTree;
    }
