    // Define functions early so they're available when HTML calls them
    // These will be replaced by actual implementations later
    
    // Define scrollCarousel immediately to prevent errors
    window.scrollCarousel = function(carouselId, direction) {
      const track = document.getElementById(carouselId + 'Track');
      if (track) {
        const scrollAmount = 220; // width of item + gap
        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      } else {
        console.warn('Carousel track not found:', carouselId + 'Track');
      }
    };
    
    // Define placeholder carousel loaders
    window.loadFiguresCarousel = window.loadFiguresCarousel || function() {
      console.log('loadFiguresCarousel will be initialized...');
    };
    window.loadTablesCarousel = window.loadTablesCarousel || function() {
      console.log('loadTablesCarousel will be initialized...');
    };
    
    // File opening functions (early definitions)
    window.openFile = window.openFile || function(path, event) {
      if (!path) return;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      // Will be replaced by actual implementation
      console.log('openFile will be initialized, path:', path);
    };
    
    window.openFileFromDrive = window.openFileFromDrive || function(fileName, event) {
      if (event) {
        event.preventDefault();
      }
      // Will be replaced by actual implementation
      console.log('openFileFromDrive will be initialized, file:', fileName);
    };
    
    // Settings function (early definition)
    window.openSettings = window.openSettings || function() {
      console.log('Settings will be initialized...');
      if(typeof window.ModalSystem !== 'undefined') {
        window.ModalSystem.info('Settings', 'Settings panel is loading...');
      }
    };
    
    // Search functions (early definitions)
    window.toggleSearch = window.toggleSearch || function() {
      console.log('Search toggled...');
      const searchContainer = document.getElementById('universalSearch');
      if (searchContainer) {
        const isExpanded = searchContainer.classList.contains('expanded');
        if (isExpanded) {
          searchContainer.classList.remove('expanded');
          const input = searchContainer.querySelector('input');
          if (input) input.blur();
        } else {
          searchContainer.classList.add('expanded');
          const input = searchContainer.querySelector('input');
          if (input) {
            input.focus();
          }
        }
      }
    };
    window.expandSearch = window.expandSearch || function() {
      console.log('Expand search...');
      const searchContainer = document.getElementById('universalSearch');
      if (searchContainer) {
        searchContainer.classList.add('expanded');
        const input = searchContainer.querySelector('input');
        if (input) input.focus();
      }
    };
    window.collapseSearch = window.collapseSearch || function() {
      console.log('Collapse search...');
      const searchContainer = document.getElementById('universalSearch');
      if (searchContainer) {
        searchContainer.classList.remove('expanded');
        const input = searchContainer.querySelector('input');
        if (input) input.blur();
      }
    };
    
    // AI Assistant functions (early definitions)
    window.handleAIAssistantClick = window.handleAIAssistantClick || function() {
      console.log('AI Assistant clicked, opening...');
      // Try to open chatbot modal directly
      const modal = document.getElementById('chatbotModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        const input = document.getElementById('chatbotInput');
        if (input) {
          setTimeout(() => input.focus(), 100);
        }
      } else if(typeof window.openChatbot === 'function') {
        window.openChatbot();
      } else {
        console.log('openChatbot not yet available, will retry...');
        setTimeout(() => {
          const modal = document.getElementById('chatbotModal');
          if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            const input = document.getElementById('chatbotInput');
            if (input) {
              setTimeout(() => input.focus(), 100);
            }
          } else if(typeof window.openChatbot === 'function') {
            window.openChatbot();
          } else if(typeof window.ModalSystem !== 'undefined') {
            window.ModalSystem.info('AI Assistant', 'AI Assistant is loading, please wait...');
          }
        }, 500);
      }
    };
    window.openChatbot = window.openChatbot || function() {
      console.log('openChatbot called, opening modal...');
      const modal = document.getElementById('chatbotModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        const input = document.getElementById('chatbotInput');
        if (input) {
          setTimeout(() => input.focus(), 100);
        }
      }
    };
    
    // More menu functions (early definitions)
    window.toggleToolsDropdown = window.toggleToolsDropdown || function() {
      console.log('Tools dropdown will be initialized...');
    };
    window.togglePapersDropdown = window.togglePapersDropdown || function() {
      console.log('Papers dropdown will be initialized...');
    };
    
    // More menu item functions (early definitions)
    window.openAboutModal = window.openAboutModal || function() {
      console.log('About modal will be initialized...');
    };
    window.showFileUploadModal = window.showFileUploadModal || function() {
      console.log('File upload modal will be initialized...');
    };
    window.showUseCaseSelector = window.showUseCaseSelector || function() {
      console.log('Use case selector will be initialized...');
    };
    window.showUICustomizationModal = window.showUICustomizationModal || function() {
      console.log('UI customization modal will be initialized...');
    };
    window.showVoiceFaceCloningModal = window.showVoiceFaceCloningModal || function() {
      console.log('Voice/Face cloning modal will be initialized...');
    };
    window.toggleTimerWidget = window.toggleTimerWidget || function() {
      console.log('Timer widget will be initialized...');
    };
    window.showProjectImportModal = window.showProjectImportModal || function() {
      console.log('Project import modal will be initialized...');
    };
    window.showEditorSelector = window.showEditorSelector || function() {
      console.log('Editor selector will be initialized...');
    };
    window.showMessagingPanel = window.showMessagingPanel || function() {
      console.log('Messaging panel will be initialized...');
    };
    
    // File Explorer
    window.toggleFileExplorer = window.toggleFileExplorer || function() {
      console.warn('File explorer loading...');
    };
    window.openFileFromExplorer = window.openFileFromExplorer || function() {
      console.warn('File explorer functions loading...');
    };
    window.filterFileTree = window.filterFileTree || function() {};
    window.navigateFile = window.navigateFile || function() {};
    window.toggleFolder = window.toggleFolder || function() {};
    
    // Tab and UI functions
    window.showTab = window.showTab || function(tabName, eventElement) {
      // Hide all tab contents
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
      });
      
      // Remove active class from all tabs
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => tab.classList.remove('active'));
      
      // Show selected tab content
      const selectedTab = document.getElementById(tabName);
      if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
      }
      
      // Add active class to clicked tab
      if (eventElement) {
        eventElement.classList.add('active');
      }
      
      // Initialize special tabs
      if (tabName === 'knowledge-graph') {
        setTimeout(() => {
          if (typeof window.KnowledgeGraph !== 'undefined' && !window.knowledgeGraphInstance) {
            window.knowledgeGraphInstance = new window.KnowledgeGraph('knowledgeGraphContainer');
            if (window.projectFileLoader && window.projectFileLoader.manifest) {
              window.knowledgeGraphInstance.init(window.projectFileLoader.manifest);
            } else {
              window.knowledgeGraphInstance.init();
            }
          }
        }, 100);
      } else if (tabName === 'timeline') {
        setTimeout(() => {
          if (typeof window.TimelineSystem !== 'undefined' && !window.timelineSystemInstance) {
            window.timelineSystemInstance = new window.TimelineSystem('timelineContainer');
            window.timelineSystemInstance.init();
          }
        }, 100);
      }
    };
    window.toggleSortOrder = window.toggleSortOrder || function() {
      console.warn('toggleSortOrder loading...');
    };
    window.toggleDocxDropdown = window.toggleDocxDropdown || function() {
      console.warn('toggleDocxDropdown loading...');
    };
    
    // Search functions
    window.toggleSearch = window.toggleSearch || function() {
      console.warn('Search functions loading...');
    };
    window.expandSearch = window.expandSearch || function() {};
    window.collapseSearch = window.collapseSearch || function() {};
    // Google Drive link configuration (defined at top for all functions)
    const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1PSRm7LG9QyBRnVgHREzQITe5Bthrniro?usp=sharing';
    // Make globally accessible
    window.DRIVE_FOLDER_URL = DRIVE_FOLDER_URL;
    
    // Function to open files (local or Google Drive)
    function openFileFromDrive(fileName, event) {
      if (event) {
        event.preventDefault();
      }
      
      // Detect if running on localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Determine if file is MD or LOG and use local path
      const ext = fileName.split('.').pop().toLowerCase();
      let filePath = '';
      
      if (ext === 'md') {
        filePath = isLocalhost ? `../paper_a_analysis/${fileName}` : `docs/${fileName}`;
      } else if (ext === 'log') {
        filePath = isLocalhost ? `../paper_a_analysis/${fileName}` : `logs/${fileName}`;
      } else if (ext === 'r' || ext === 'R') {
        // R scripts in paper_a_analysis
        filePath = isLocalhost ? `../paper_a_analysis/${fileName}` : DRIVE_FOLDER_URL;
      } else {
        // For other files, use Google Drive
        showFilePreview(DRIVE_FOLDER_URL, fileName);
        return;
      }
      
      // Try to open local file first
      showFilePreview(filePath, fileName);
    }
    
    // Make globally available
    window.openFileFromDrive = openFileFromDrive;
    
    // Load timeline data from JSON
    let timelineData = [];
    let allTimelineData = [];
    
    // Load JSON data - try multiple paths
    function loadTimelineData() {
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.protocol === 'file:';
      
      const paths = isLocalhost 
        ? ['../paper_a_analysis/TIMELINE_DATA.json', 'paper_a_analysis/TIMELINE_DATA.json', '../../paper_a_analysis/TIMELINE_DATA.json', 'TIMELINE_DATA.json']
        : ['TIMELINE_DATA.json', 'docs/TIMELINE_DATA.json', '../paper_a_analysis/TIMELINE_DATA.json'];
      
      let pathIndex = 0;
      const tryNextPath = () => {
        if (pathIndex >= paths.length) {
          console.warn('Timeline data not found in any expected location');
          timelineData = [];
          allTimelineData = [];
          return;
        }
        
        fetch(paths[pathIndex])
          .then(response => {
            if (!response.ok) throw new Error('Not found');
            return response.json();
          })
          .then(data => {
            allTimelineData = data.timeline || data || [];
            timelineData = allTimelineData;
            window.timelineData = timelineData;
            window.allTimelineData = allTimelineData;
            // Render timeline if function is available
            if (typeof window.renderTimeline === 'function') {
              window.renderTimeline(timelineData);
            } else {
              // Fallback: try to render directly
              const container = document.getElementById('timeline-content');
              if (container) {
                if (timelineData.length > 0) {
                  container.innerHTML = '<p>Timeline data loaded. Rendering...</p>';
                } else {
                  container.innerHTML = '<p>No timeline data available</p>';
                }
              }
            }
            console.log('Timeline data loaded from:', paths[pathIndex], 'Items:', timelineData.length);
          })
          .catch(error => {
            pathIndex++;
            tryNextPath();
          });
      };
      
      tryNextPath();
    }
    
    // Make loadTimelineData globally accessible
    window.loadTimelineData = loadTimelineData;
    
    // Load timeline data on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadTimelineData);
    } else {
      loadTimelineData();
    }
    
    // Legacy data structure for compatibility
    const legacyTimelineData = [
      {
        date: "December 2024",
        title: "Baseline Established",
        type: "milestone",
        content: "Created initial data loading and cleaning scripts. Established baseline with simple linear model (3 variables: mass, AER, region).",
        result: "44.65% R²",
        files: ["01_data_loading.R", "02_data_cleaning.R", "03_energy_calculations.R", "05_variable_importance.R"],
        tags: ["Baseline", "Initial Analysis"]
      },
      {
        date: "January 2025",
        title: "Feature Engineering",
        type: "milestone",
        content: "Added EDS as critical predictor. Created engineered features (ratios, interactions). Expanded to 12 variables.",
        result: "59.44% R² (Random Forest)",
        files: ["05_variable_importance_FINAL.R"],
        tags: ["Feature Engineering", "EDS Added"]
      },
      {
        date: "February-March 2025",
        title: "Hyperparameter Tuning",
        type: "milestone",
        content: "Systematic hyperparameter tuning. Expanded to 18 variables. Added engine displacement, vehicle length, registration year.",
        result: "71.56% R² (Random Forest, intermediate phase)",
        files: ["Updated 05_variable_importance_FINAL.R"],
        tags: ["Tuning", "Intermediate Phase"]
      },
      {
        date: "April-May 2025",
        title: "Comprehensive Analysis",
        type: "milestone",
        content: "Expanded to 44 variables. Implemented 7 models (RF, XGBoost, LightGBM, CatBoost, GAM, NN, Ensemble). Extensive hyperparameter tuning.",
        result: "91.88% R² (Random Forest) - later identified as inflated",
        files: ["09_comprehensive_model_comparison_ALL.R", "10_create_comprehensive_figures_ALL.R"],
        tags: ["Comprehensive", "All Models"]
      },
      {
        date: "June 2025",
        title: "Circular Variables Identified",
        type: "correction",
        content: "Identified 25 circular variables (derived from outcome). Created script to identify and document them.",
        result: "26 clean variables selected",
        files: ["09d_identify_circular_variables.R", "VARIABLE_SELECTION_DOCUMENTATION.md"],
        tags: ["Correction", "Variable Selection"]
      },
      {
        date: "July 2025",
        title: "Clean Variable Selection",
        type: "milestone",
        content: "Applied VIF-based multicollinearity reduction. Selected final 26 clean variables.",
        result: "26 clean variables finalized",
        files: ["09f_final_variable_selection_CLEAN.R", "tables/final_selected_variables_CLEAN.csv"],
        tags: ["Variable Selection", "Clean Variables"]
      },
      {
        date: "August-September 2025",
        title: "Clean Variable Analysis",
        type: "milestone",
        content: "Re-ran all models with 26 clean variables. Used parameter transfer approach (best hyperparameters from 44-variable runs).",
        result: "71.63% R² (RF), 73.71% (XGBoost), 73.22% (NN), 64.31% (GAM)",
        files: ["09g_all_models_CLEAN_variables.R", "tables/model_comparison_CLEAN_variables.csv"],
        tags: ["Clean Variables", "Realistic Results"]
      },
      {
        date: "October 2025",
        title: "EDS Comprehensive Analysis",
        type: "milestone",
        content: "Created comprehensive country-level EDS analysis. Fixed temperature data merging (explicitly use MS column).",
        result: "10 analysis types, 16 tables, 19 figures",
        files: ["11_eds_comprehensive_analysis.R", "12_create_eds_comprehensive_figures.R"],
        tags: ["EDS Analysis", "Country-Level"]
      },
      {
        date: "November 2025",
        title: "Future Work Analyses",
        type: "milestone",
        content: "Created individual vehicle EDS prediction, temporal analysis, charging infrastructure analysis. Fixed circularity in EDS prediction.",
        result: "3 new analysis types, 3 figures",
        files: ["13_individual_vehicle_eds_analysis.R", "14_temporal_analysis.R", "15_charging_infrastructure_analysis.R"],
        tags: ["Future Work", "Additional Analyses"]
      },
      {
        date: "December 2025",
        title: "Consistency Fixes",
        type: "correction",
        content: "Fixed all consistency issues: 71.56% vs 71.63%, variable sets (26 vs 44), section updates. Updated Section 1.4 and 5.3. Fixed abstract.",
        result: "All sections consistent",
        files: ["PAPER_DRAFT.md", "PAPER_DRAFT_20_CONSISTENCY_FIXED.docx"],
        tags: ["Correction", "Finalization"]
      },
      {
        date: "17 Dec 2025 05:00",
        title: "✅ Ensemble Model Completed",
        type: "milestone",
        content: "Ensemble model successfully completed. Fixed skip logic for GAM, fixed saving section to use all_results. Ensemble combines RF, XGBoost, GAM, and Neural Network using weighted average based on test R².",
        result: "Ensemble: 73.54% test R², 2.98 kWh/100 km RMSE, 2.07 kWh/100 km MAE, 9.56% MAPE",
        files: ["09g_all_models_CLEAN_variables.R", "tables/model_comparison_CLEAN_variables.csv"],
        tags: ["Models", "Ensemble", "Complete"]
      },
      {
        date: "17 Dec 2025 05:10",
        title: "✅ Final Comparison Figures Created",
        type: "milestone",
        content: "Created 3 new comparison figures: figure6_model_comparison_final.png (R² comparison with Ensemble), figure6b_comprehensive_metrics_comparison.png (all metrics), figure6c_train_test_comparison.png (generalization).",
        result: "3 new figures added",
        files: ["create_final_comparison_figures.R", "figures/figure6_model_comparison_final.png", "figures/figure6b_comprehensive_metrics_comparison.png", "figures/figure6c_train_test_comparison.png"],
        tags: ["Figures", "Visualization", "Complete"]
      },
      {
        date: "17 Dec 2025 05:15",
        title: "✅ Final Paper DOCX Generated",
        type: "milestone",
        content: "Generated PAPER_DRAFT_27_FINAL_COMPLETE.docx with all updates: Ensemble results, updated figure captions, all model comparisons, comprehensive metrics. Paper ready for Markos review.",
        result: "Final DOCX with all models including Ensemble",
        files: ["PAPER_DRAFT_27_FINAL_COMPLETE.docx", "PAPER_DRAFT.md"],
        tags: ["Document", "Final", "Complete"]
      }
    ];
    
    // File data for dashboard
    const fileData = {
      paper: [
        { name: "PAPER_DRAFT.md", path: "docs/PAPER_DRAFT.md", type: "MD", desc: "Main paper source (single source of truth)" },
        { name: "LATEST_PAPER_DRAFT.docx", path: "LATEST_PAPER_DRAFT.docx", type: "DOCX", desc: "🎯 LATEST - Always the most recent paper draft (auto-updated)" },
        { name: "PAPER_DRAFT_34.docx", path: "../paper_a_analysis/PAPER_DRAFT_34.docx", type: "DOCX", desc: "🎯 NEWEST - Updated author: Markos A. Ktistakis, ... (Dec 2025)" }
      ]
    };
