    // File data for dashboard (continued from part1)
    const fileData = window.fileData || {};
    if (!fileData.scripts) {
      fileData.scripts = [
        { name: "PAPER_DRAFT_27_FINAL_COMPLETE.docx", path: "../paper_a_analysis/PAPER_DRAFT_27_FINAL_COMPLETE.docx", type: "DOCX", desc: "FINAL - All models complete including Ensemble" },
        { name: "PAPER_OUTLINE.md", path: "docs/PAPER_OUTLINE.md", type: "MD", desc: "Paper structure outline" }
      ];
    }
    if (!fileData.scripts_all) {
      fileData.scripts_all = [
        { name: "09g_all_models_CLEAN_variables.R", path: "../paper_a_analysis/09g_all_models_CLEAN_variables.R", type: "R", desc: "✅ Main analysis script (all models + Ensemble, 26 clean vars)" },
        { name: "create_final_comparison_figures.R", path: "../paper_a_analysis/create_final_comparison_figures.R", type: "R", desc: "Creates final comparison figures (6, 6b, 6c)" },
        { name: "11_eds_comprehensive_analysis.R", path: "../paper_a_analysis/11_eds_comprehensive_analysis.R", type: "R", desc: "EDS country-level analysis" },
        { name: "12_create_eds_comprehensive_figures.R", path: "../paper_a_analysis/12_create_eds_comprehensive_figures.R", type: "R", desc: "Create EDS figures" },
        { name: "13_individual_vehicle_eds_analysis.R", path: "../paper_a_analysis/13_individual_vehicle_eds_analysis.R", type: "R", desc: "Individual vehicle EDS prediction" },
        { name: "14_temporal_analysis.R", path: "../paper_a_analysis/14_temporal_analysis.R", type: "R", desc: "Temporal trends analysis" },
        { name: "15_charging_infrastructure_analysis.R", path: "../paper_a_analysis/15_charging_infrastructure_analysis.R", type: "R", desc: "Charging infrastructure analysis" },
        { name: "99_run_future_work_analyses.R", path: "../paper_a_analysis/99_run_future_work_analyses.R", type: "R", desc: "Master script for future work" }
      ];
    }
    if (!fileData.results) {
      fileData.results = [
        { name: "model_comparison_CLEAN_variables.csv", path: "../paper_a_analysis/tables/model_comparison_CLEAN_variables.csv", type: "CSV", desc: "✅ Final model results (RF, XGBoost, GAM, NN, Ensemble - 26 clean vars)" },
        { name: "final_selected_variables_CLEAN.csv", path: "../paper_a_analysis/tables/final_selected_variables_CLEAN.csv", type: "CSV", desc: "26 clean variables list" },
        { name: "linear_model_baseline_results.csv", path: "../paper_a_analysis/tables/linear_model_baseline_results.csv", type: "CSV", desc: "Linear model baseline results" }
      ];
    }
    if (!fileData.docs) {
      fileData.docs = [
        { name: "PAPER_BUILD_GUIDE.md", path: "docs/PAPER_BUILD_GUIDE.md", type: "MD", desc: "Complete build guide" },
        { name: "METHODOLOGY_EVOLUTION_DOCUMENTATION.md", path: "docs/METHODOLOGY_EVOLUTION_DOCUMENTATION.md", type: "MD", desc: "Methodology evolution" },
        { name: "VARIABLE_SELECTION_DOCUMENTATION.md", path: "docs/VARIABLE_SELECTION_DOCUMENTATION.md", type: "MD", desc: "Variable selection rationale" },
        { name: "DEVELOPMENT_LOG_COMPLETE.md", path: "docs/DEVELOPMENT_LOG_COMPLETE.md", type: "MD", desc: "Complete development log" },
        { name: "DEVELOPMENT_LOG_SUMMARY.md", path: "docs/DEVELOPMENT_LOG_SUMMARY.md", type: "MD", desc: "Summary log (important only)" },
        { name: "TODO_PAPER_COMPLETION.md", path: "docs/TODO_PAPER_COMPLETION.md", type: "MD", desc: "Completion checklist" },
        { name: "MARKOS_REVIEW_NEEDED.md", path: "docs/MARKOS_REVIEW_NEEDED.md", type: "MD", desc: "Items for review" },
        { name: "FUTURE_WORK_PROPOSAL.md", path: "docs/FUTURE_WORK_PROPOSAL.md", type: "MD", desc: "Future work proposals" },
        { name: "ALL_MODELS_COMPLETE_SUMMARY.md", path: "docs/ALL_MODELS_COMPLETE_SUMMARY.md", type: "MD", desc: "All models summary" },
        { name: "COMPLETE_UPDATE_SUMMARY.md", path: "docs/COMPLETE_UPDATE_SUMMARY.md", type: "MD", desc: "Complete update summary" }
      ];
    }
    if (!fileData.logs) {
      fileData.logs = [
        { name: "all_models_CLEAN.log", path: "logs/all_models_CLEAN.log", type: "LOG", desc: "All models script log (26 clean vars)" },
        { name: "comprehensive_analysis_ALL.log", path: "logs/comprehensive_analysis_ALL.log", type: "LOG", desc: "Comprehensive analysis (all models) log" },
        { name: "comprehensive_analysis.log", path: "logs/comprehensive_analysis.log", type: "LOG", desc: "Comprehensive analysis log" },
        { name: "eds_comprehensive_analysis.log", path: "logs/eds_comprehensive_analysis.log", type: "LOG", desc: "EDS comprehensive analysis log" },
        { name: "eds_analysis.log", path: "logs/eds_analysis.log", type: "LOG", desc: "EDS analysis log" },
        { name: "future_work_analyses.log", path: "logs/future_work_analyses.log", type: "LOG", desc: "Future work analyses log" },
        { name: "monitor.log", path: "logs/monitor.log", type: "LOG", desc: "Monitor script log" }
      ];
    }
    if (!fileData.scripts_all) {
      fileData.scripts_all = [
        { name: "01_data_loading.R", path: "../paper_a_analysis/01_data_loading.R", type: "R", desc: "Data loading script" },
        { name: "02_data_cleaning.R", path: "../paper_a_analysis/02_data_cleaning.R", type: "R", desc: "Data cleaning script" },
        { name: "03_energy_calculations.R", path: "../paper_a_analysis/03_energy_calculations.R", type: "R", desc: "Energy calculations" },
        { name: "05_variable_importance_FINAL.R", path: "../paper_a_analysis/05_variable_importance_FINAL.R", type: "R", desc: "Variable importance analysis" },
        { name: "09g_all_models_CLEAN_variables.R", path: "../paper_a_analysis/09g_all_models_CLEAN_variables.R", type: "R", desc: "✅ All models + Ensemble (26 clean vars)" },
        { name: "create_final_comparison_figures.R", path: "../paper_a_analysis/create_final_comparison_figures.R", type: "R", desc: "Creates comparison figures 6, 6b, 6c" },
        { name: "11_eds_comprehensive_analysis.R", path: "../paper_a_analysis/11_eds_comprehensive_analysis.R", type: "R", desc: "EDS comprehensive analysis" },
        { name: "12_create_eds_comprehensive_figures.R", path: "../paper_a_analysis/12_create_eds_comprehensive_figures.R", type: "R", desc: "Create EDS figures" },
        { name: "13_individual_vehicle_eds_analysis.R", path: "../paper_a_analysis/13_individual_vehicle_eds_analysis.R", type: "R", desc: "Individual vehicle EDS" },
        { name: "14_temporal_analysis.R", path: "../paper_a_analysis/14_temporal_analysis.R", type: "R", desc: "Temporal analysis" },
        { name: "15_charging_infrastructure_analysis.R", path: "../paper_a_analysis/15_charging_infrastructure_analysis.R", type: "R", desc: "Charging infrastructure" },
        { name: "99_run_future_work_analyses.R", path: "../paper_a_analysis/99_run_future_work_analyses.R", type: "R", desc: "Master script for future work" }
      ];
    }
    if (!fileData.utilities) {
      fileData.utilities = [
        { name: "monitor_script_status.sh", path: "../paper_a_analysis/monitor_script_status.sh", type: "SH", desc: "Monitor script status and send notifications" },
        { name: "check_and_notify_when_done.sh", path: "../paper_a_analysis/check_and_notify_when_done.sh", type: "SH", desc: "Check analysis status and notify" },
        { name: "monitor_and_notify.py", path: "../paper_a_analysis/monitor_and_notify.py", type: "PY", desc: "Python monitor script" }
      ];
    }
    window.fileData = fileData;
    
    // Tab switching
    function showTab(tabName, eventElement) {
      // Hide all tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });
      
      // Activate the clicked tab button
      if (eventElement) {
        eventElement.classList.add('active');
      } else {
        // Find the tab button by onclick attribute
        document.querySelectorAll('.tab').forEach(t => {
          const onclick = t.getAttribute('onclick');
          if (onclick && onclick.includes(tabName)) {
            t.classList.add('active');
          }
        });
      }
      
      // Show the corresponding tab content
      const tabContent = document.getElementById(tabName);
      if (tabContent) {
        tabContent.classList.add('active');
        tabContent.style.display = 'block';
        
        // Initialize special tabs
        if (tabName === 'knowledge-graph') {
          setTimeout(() => {
            if (typeof window.KnowledgeGraph !== 'undefined' && !window.knowledgeGraphInstance) {
              window.knowledgeGraphInstance = new window.KnowledgeGraph('knowledgeGraphContainer');
            } else if (window.knowledgeGraphInstance) {
              window.knowledgeGraphInstance.render();
            }
          }, 100);
        } else if (tabName === 'dashboard') {
          setTimeout(renderDashboardStats, 100);
        } else if (tabName === 'timeline') {
          // Ensure timeline is rendered
          if (timelineData && timelineData.length > 0) {
            renderTimeline();
          } else if (window.timelineData && window.timelineData.length > 0) {
            renderTimeline(window.timelineData);
          } else {
            // Load timeline data if available
            if (typeof window.loadTimelineData === 'function') {
              window.loadTimelineData();
            }
          }
        }
      } else {
        console.warn('Tab content not found:', tabName);
      }
    }
    
    // Render dashboard stats when dashboard tab is shown
    function renderDashboardStats() {
      const dashboardContent = document.getElementById('dashboard');
      if (!dashboardContent) return;
      
      // Check if stats already rendered
      if (dashboardContent.querySelector('.stats')) return;
      
      // Create stats section at the top of dashboard
      const statsHTML = `
        <div class="stats" style="margin-bottom: 2rem;">
          <div class="stat-card clickable" onclick="openFile(getLocalPath('tables/final_selected_variables_CLEAN.csv'), event)" style="cursor: pointer; transition: var(--transition);" title="Click to view variable selection table" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
            <div class="stat-value">26</div>
            <div class="stat-label">Clean Variables</div>
          </div>
          <div class="stat-card clickable" onclick="openFile(getLocalPath('tables/model_comparison_CLEAN_variables.csv'), event)" style="cursor: pointer; transition: var(--transition);" title="Click to view model comparison table" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
            <div class="stat-value">7</div>
            <div class="stat-label">Models</div>
          </div>
          <div class="stat-card clickable" onclick="window.open('tables_portfolio.html#table5', '_blank')" style="cursor: pointer; transition: var(--transition);" title="Click to view model comparison table (Table 5)" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
            <div class="stat-value">73.71%</div>
            <div class="stat-label">Best R² (XGBoost)</div>
          </div>
          <div class="stat-card clickable" onclick="window.location.href='figures_portfolio.html'" style="cursor: pointer; transition: var(--transition);" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
            <div class="stat-value">34</div>
            <div class="stat-label">Figures</div>
          </div>
          <div class="stat-card clickable" onclick="window.location.href='tables_portfolio.html'" style="cursor: pointer; transition: var(--transition);" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
            <div class="stat-value">16</div>
            <div class="stat-label">Tables</div>
          </div>
        </div>
      `;
      
      // Insert stats at the beginning of dashboard content (after search box if it exists)
      const searchBox = dashboardContent.querySelector('.search-box');
      if (searchBox) {
        searchBox.insertAdjacentHTML('afterend', statsHTML);
      } else {
        dashboardContent.insertAdjacentHTML('afterbegin', statsHTML);
      }
    }
    
    // Make functions globally accessible
    window.showTab = showTab;
    window.renderTimeline = renderTimeline;
    window.renderDashboardStats = renderDashboardStats;
    if (typeof loadTimelineData !== 'undefined') {
      window.loadTimelineData = loadTimelineData;
    }
    window.timelineData = timelineData;
    
    // Timeline rendering
    function renderTimeline(data = window.timelineData || timelineData) {
      const container = document.getElementById('timeline-content');
      if (!data || data.length === 0) {
        container.innerHTML = '<p>Loading timeline data...</p>';
        return;
      }
      
      container.innerHTML = data.map((item, index) => {
        const importance = item.importance || 100;
        const importanceClass = importance === 10 ? 'most-important' : importance === 100 ? 'important' : 'all-items';
          const fileLinks = (item.files || []).map(file => {
          // Determine file path based on extension
          // Detect if running on localhost
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          let filePath = '';
          if (file.endsWith('.png')) {
            // Figures are in repo
            filePath = isLocalhost ? `../paper_a_analysis/figures/${file}` : `figures/${file}`;
          } else if (file.endsWith('.csv')) {
            // Tables are in repo
            filePath = isLocalhost ? `../paper_a_analysis/tables/${file}` : `tables/${file}`;
          } else if (file.includes('PAPER_DRAFT') && file.endsWith('.docx')) {
            // Check if it's the latest (always available as LATEST_PAPER_DRAFT.docx)
            if (file.includes('LATEST') || file === 'PAPER_DRAFT_34.docx' || file === 'PAPER_DRAFT_33_COMPLETE_WITH_ALL_FIGURES.docx') {
              filePath = isLocalhost ? `../paper_a_analysis/LATEST_PAPER_DRAFT.docx` : 'LATEST_PAPER_DRAFT.docx';
            } else {
              // Other DOCX files are in Google Drive
              filePath = DRIVE_FOLDER_URL;
            }
          } else if (file.endsWith('.md')) {
            // MD files in paper_a_analysis
            filePath = isLocalhost ? `../paper_a_analysis/${file}` : `docs/${file}`;
          } else if (file.endsWith('.log')) {
            // LOG files in paper_a_analysis
            filePath = isLocalhost ? `../paper_a_analysis/${file}` : `logs/${file}`;
          } else if (file.endsWith('.R')) {
            // R scripts in paper_a_analysis
            filePath = isLocalhost ? `../paper_a_analysis/${file}` : DRIVE_FOLDER_URL;
          } else {
            // All other files point to Google Drive
            filePath = DRIVE_FOLDER_URL;
          }
          return `<li><a href="#" target="_blank" onclick="event.stopPropagation(); openFile('${filePath}', event); return false;">${file}</a></li>`;
        }).join('');
        
        // Format date for display (already includes time from JSON)
        const displayDate = item.date; // Format: "16 Dec 2025 14:30"
        
        return `
        <div class="timeline-item ${item.type} ${importanceClass}" data-type="${item.type}" data-importance="${importance}">
          <div class="timeline-date">${displayDate}</div>
          <div class="timeline-content">
            <div class="timeline-title">${item.title}</div>
            <p>${item.content}</p>
            ${item.result ? `<p><strong>Result:</strong> ${item.result}</p>` : ''}
            ${fileLinks ? `
              <div style="margin-top: 1rem;">
                <strong>Files:</strong>
                <ul style="margin-top: 0.5rem; margin-left: 1.5rem; list-style: none; padding-left: 0;">
                  ${fileLinks}
                </ul>
              </div>
            ` : ''}
            <div class="timeline-tags">
              ${(item.tags || []).map(tag => `<span class="tag ${item.type === 'milestone' ? 'milestone' : ''}">${tag}</span>`).join('')}
              <span class="tag" style="background: #e8f4f8; color: #0f4c81;">Importance: ${importance}</span>
            </div>
          </div>
        </div>
      `;
      }).join('');
    }
    
    // Timeline filtering
    function filterTimeline(filter) {
      document.querySelectorAll('.timeline-controls button').forEach(b => {
        if (b.textContent.includes(filter) || (filter === 'all' && b.textContent.includes('All'))) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => {
        const importance = parseInt(item.dataset.importance) || 100;
        const type = item.dataset.type;
        
        if (filter === 'all') {
          item.classList.remove('filtered', 'hidden');
        } else if (filter === 'important') {
          if (importance === 100 || importance === 10) {
            item.classList.remove('filtered', 'hidden');
          } else {
            item.classList.add('hidden');
          }
        } else if (filter === 'most_important') {
          if (importance === 10) {
            item.classList.remove('filtered', 'hidden');
          } else {
            item.classList.add('hidden');
          }
        } else if (filter === 'milestone') {
          if (type === 'milestone') {
            item.classList.remove('filtered', 'hidden');
          } else {
            item.classList.add('hidden');
          }
        } else if (filter === 'correction') {
          if (type === 'correction') {
            item.classList.remove('filtered', 'hidden');
          } else {
            item.classList.add('hidden');
          }
        }
      });
    }
    
    // Make globally accessible
    window.filterTimeline = filterTimeline;
    window.filterTimelineByType = filterTimelineByType;
    
    // Filter by type
    function filterTimelineByType(type) {
      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
          item.classList.remove('filtered', 'hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }
    
    let sortOrder = 'chronological';
    
    // Timeline sorting
    function toggleSortOrder() {
      sortOrder = sortOrder === 'chronological' ? 'reverse' : 'chronological';
      const container = document.getElementById('timeline-content');
      const items = Array.from(container.children).filter(item => !item.classList.contains('hidden'));
      
      // Parse dates in format "16 Dec 2025 14:30"
      const parseDate = (dateStr) => {
        const parts = dateStr.trim().split(' ');
        if (parts.length >= 4) {
          const day = parseInt(parts[0]);
          const month = parts[1];
          const year = parseInt(parts[2]);
          const time = parts[3] || '00:00';
          const [hour, minute] = time.split(':').map(Number);
          const monthMap = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
          return new Date(year, monthMap[month] - 1, day, hour, minute);
        }
        return new Date(0);
      };
      
      if (sortOrder === 'reverse') {
        items.sort((a, b) => {
          const dateA = a.querySelector('.timeline-date').textContent;
          const dateB = b.querySelector('.timeline-date').textContent;
          return parseDate(dateB) - parseDate(dateA);
        });
        document.getElementById('sortIcon').textContent = '⇅';
        document.getElementById('sortLabel').textContent = 'Reverse (New → Old)';
      } else {
        items.sort((a, b) => {
          const dateA = a.querySelector('.timeline-date').textContent;
          const dateB = b.querySelector('.timeline-date').textContent;
          return parseDate(dateA) - parseDate(dateB);
        });
        document.getElementById('sortIcon').textContent = '⇅';
        document.getElementById('sortLabel').textContent = 'Chronological (Old → New)';
      }
      items.forEach(item => container.appendChild(item));
    }
    
    // Make globally accessible
    window.toggleSortOrder = toggleSortOrder;
    
    // DOCX Dropdown - sorted by version number (newest first)
    // Latest DOCX is always available as LATEST_PAPER_DRAFT.docx in the repo
    const docxFiles = [
      { name: "PAPER_DRAFT_FINAL.docx", path: "../paper_a_analysis/PAPER_DRAFT_FINAL.docx", desc: "🎯 FINAL - Updated with all filtering stats, references, and fixes (Dec 24, 2024)" },
      { name: "LATEST_PAPER_DRAFT.docx", path: "LATEST_PAPER_DRAFT.docx", desc: "🎯 LATEST - Always the most recent paper draft (auto-updated)" },
      { name: "PAPER_DRAFT_34.docx", path: "../paper_a_analysis/PAPER_DRAFT_34.docx", desc: "🎯 NEWEST - Updated author: Markos A. Ktistakis, ... (Dec 2025)" },
      { name: "PAPER_DRAFT_33_COMPLETE_WITH_ALL_FIGURES.docx", path: "../paper_a_analysis/PAPER_DRAFT_33_COMPLETE_WITH_ALL_FIGURES.docx", desc: "Complete with all figures (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_32_TABLES_FIXED.docx", path: "../paper_a_analysis/PAPER_DRAFT_32_TABLES_FIXED.docx", desc: "All tables expanded to full width with readable columns (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_30_WITH_IMAGES_PANDOC.docx", path: "../paper_a_analysis/PAPER_DRAFT_30_WITH_IMAGES_PANDOC.docx", desc: "With images included using pandoc rebase_relative_paths (4.8MB)" },
      { name: "PAPER_DRAFT_29_WITH_IMAGES.docx", path: "../paper_a_analysis/PAPER_DRAFT_29_WITH_IMAGES.docx", desc: "With images included (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_28_WITH_FIGURES_TABLES.docx", path: "../paper_a_analysis/PAPER_DRAFT_28_WITH_FIGURES_TABLES.docx", desc: "With markdown figure references (no images in DOCX)" },
      { name: "PAPER_DRAFT_27_FINAL_COMPLETE.docx", path: "../paper_a_analysis/PAPER_DRAFT_27_FINAL_COMPLETE.docx", desc: "FINAL - All models complete including Ensemble (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_26_FINAL.docx", path: "../paper_a_analysis/PAPER_DRAFT_26_FINAL.docx", desc: "FINAL - All updates complete (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_25_FORMATTED.docx", path: "../paper_a_analysis/PAPER_DRAFT_25_FORMATTED.docx", desc: "Formatted with author template (Dec 17, 2025)" },
      { name: "PAPER_DRAFT_24_FINAL_COMPLETE.docx", path: "../paper_a_analysis/PAPER_DRAFT_24_FINAL_COMPLETE.docx", desc: "Final Complete (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_23_COMPLETE_WITH_TESTS.docx", path: "../paper_a_analysis/PAPER_DRAFT_23_COMPLETE_WITH_TESTS.docx", desc: "With Statistical Tests (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_22_COMPLETE.docx", path: "../paper_a_analysis/PAPER_DRAFT_22_COMPLETE.docx", desc: "Complete Version (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_21_FINAL_UPDATES.docx", path: "../paper_a_analysis/PAPER_DRAFT_21_FINAL_UPDATES.docx", desc: "Final Updates (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_20_CONSISTENCY_FIXED.docx", path: "../paper_a_analysis/PAPER_DRAFT_20_CONSISTENCY_FIXED.docx", desc: "Consistency Fixes (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_19.docx", path: "../paper_a_analysis/PAPER_DRAFT_19.docx", desc: "Version 19 (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_18.docx", path: "../paper_a_analysis/PAPER_DRAFT_18.docx", desc: "Version 18 (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_17.docx", path: "../paper_a_analysis/PAPER_DRAFT_17.docx", desc: "Version 17 (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_16.docx", path: "../paper_a_analysis/PAPER_DRAFT_16.docx", desc: "Version 16 (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_15.docx", path: "../paper_a_analysis/PAPER_DRAFT_15.docx", desc: "Version 15 (Dec 16, 2025)" },
      { name: "PAPER_DRAFT_14.docx", path: "../paper_a_analysis/PAPER_DRAFT_14.docx", desc: "Version 14 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_13.docx", path: "../paper_a_analysis/PAPER_DRAFT_13.docx", desc: "Version 13 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_12.docx", path: "../paper_a_analysis/PAPER_DRAFT_12.docx", desc: "Version 12 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_11.docx", path: "../paper_a_analysis/PAPER_DRAFT_11.docx", desc: "Version 11 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_10.docx", path: "../paper_a_analysis/PAPER_DRAFT_10.docx", desc: "Version 10 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_9.docx", path: "../paper_a_analysis/PAPER_DRAFT_9.docx", desc: "Version 9 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT_8.docx", path: "../paper_a_analysis/PAPER_DRAFT_8.docx", desc: "Version 8 (Dec 15, 2025)" },
      { name: "PAPER_DRAFT.docx", path: "../paper_a_analysis/PAPER_DRAFT.docx", desc: "Initial Version (Dec 15, 2025)" },
    ];
    
    // Make docxFiles globally accessible
    window.docxFiles = docxFiles;
    
    function renderDocxDropdown() {
      const dropdown = document.getElementById('docxDropdown');
      if (!dropdown) {
        console.warn('docxDropdown element not found');
        return;
      }
      // Ensure dropdown has high z-index and proper positioning
      dropdown.style.zIndex = '10000';
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100%';
      dropdown.style.left = '0';
      dropdown.style.marginTop = '0.25rem';
      
      dropdown.innerHTML = docxFiles.map((file, index) => `
        <a href="${file.path}" target="_blank" onclick="event.stopPropagation(); openFile('${file.path}', event); return false;" style="display: block; padding: 0.75rem; border-bottom: 1px solid var(--border-color); text-decoration: none; color: var(--text-primary); background: var(--bg-secondary); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
          <strong>${file.name}</strong><br>
          <small style="color: var(--text-secondary);">${file.desc}</small>
        </a>
      `).join('');
    }
    
    // Initialize dropdown on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderDocxDropdown);
    } else {
      renderDocxDropdown();
    }
    
