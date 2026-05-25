// ============================================
// PROJECT FILE LOADER
// Loads files from Markos project (figures, tables, MDs, docs, etc.)
// ============================================

class ProjectFileLoader {
  constructor() {
    this.projectRoot = '../paper_a_analysis/';
    this.figuresPath = this.projectRoot + 'figures/';
    this.tablesPath = this.projectRoot + 'tables/';
    this.docsPath = this.projectRoot;
    this.manifest = null;
    this.files = {
      figures: [],
      tables: [],
      documents: [],
      markdown: [],
      logs: []
    };
  }

  async loadManifest() {
    const manifestPaths = [
      '../paper_a_analysis/PROJECT_MANIFEST.json',
      'paper_a_analysis/PROJECT_MANIFEST.json',
      '../../paper_a_analysis/PROJECT_MANIFEST.json',
      'PROJECT_MANIFEST.json'
    ];
    
    for (const path of manifestPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          this.manifest = await response.json();
          this.files = this.manifest;
          console.log('Loaded manifest from:', path);
          return this.manifest;
        }
      } catch (e) {
        console.log('Tried', path, 'not found, trying next...');
      }
    }
    
    // Fallback: scan known directories
    console.log('Manifest not found, using fallback file list...');
    await this.scanProjectFiles();
    return this.files;
  }

  async scanProjectFiles() {
    // Known figure files
    const figureFiles = [
      // Data cleaning and filtering figures
      'filtering_oem_by_step.png', 'filtering_step_totals.png',
      'filtering_flag_combinations.png', 'filtering_flag_combinations_flagged_only.png', 'filtering_flag_combinations_detailed.png',
      'filtering_clean_vs_flagged.png',
      'filtering_step1_characteristics.png', 'filtering_step4_oem_breakdown.png',
      'filtering_step1_top_models.png',
      // Analysis figures
      'figure1_energy_distribution.png', 'figure1_energy_distribution_stratified.png',
      'figure2_eds_distribution.png', 'figure2_eds_distribution_stratified.png',
      'figure3_energy_vs_eds.png', 'figure3_energy_vs_eds_colored.png',
      'figure4_fleet_vs_campaign.png', 'figure5_variable_importance_lmg.png',
      'figure5a_variable_importance_gam.png', 'figure5b_variable_importance_rf.png',
      'figure5c_variable_importance_combined.png', 'figure6_model_comparison.png',
      'figure6_model_comparison_final.png', 'figure6b_comprehensive_metrics_comparison.png',
      'figure6c_train_test_comparison.png', 'figure7a_residuals_vs_predicted.png',
      'figure7b_residuals_vs_eds.png', 'figure7c_residuals_vs_mass.png',
      'figure7d_residuals_qq.png', 'figure7e_residuals_distribution.png',
      'figure7f_residuals_by_eds_quartile.png', 'figure18_eds_by_country.png',
      'figure19_eds_by_region.png', 'figure20_energy_vs_eds_country.png',
      'figure21_eds_categories_region.png', 'figure23_regional_summary.png',
      'figure25_eds_map_choropleth.png', 'figure26_regional_map.png',
      'figure27_eds_threshold_analysis.png', 'figure28_battery_vs_eds.png',
      'figure29_segment_analysis.png', 'figure30_model_specific_eds.png',
      'figure31_charging_behavior.png', 'figure32_north_south_divide.png',
      'figure33_regression_results.png', 'figure34_eds_prediction_performance.png',
      'figure35_temporal_trends.png', 'figure36_infrastructure_vs_eds.png'
    ];

    // Known table files
    const tableFiles = [
      // Data cleaning and filtering tables
      'filtering_oem_breakdown.csv', 'filtering_model_breakdown.csv',
      'filtering_oem_model_breakdown.csv', 'flagged_numeric_patterns.csv',
      'flagged_oem_patterns.csv',
      // Analysis tables
      'table1_dataset_overview.csv', 'table2_summary_statistics.csv',
      'table3_variable_importance_lmg.csv', 'table4_fleet_vs_campaign.csv',
      'model_comparison_CLEAN_variables.csv', 'model_comparison_final.csv',
      'variable_importance_lmg.csv', 'variable_importance_gam.csv',
      'variable_importance_rf.csv', 'eds_country_analysis_descriptive.csv',
      'eds_regional_summary.csv', 'eds_threshold_analysis.csv',
      'eds_battery_analysis.csv', 'eds_segment_analysis.csv',
      'country_level_eds_analysis.csv', 'final_selected_variables_CLEAN.csv'
    ];

    // Known document files
    const docFiles = [
      'PAPER_DRAFT.md', 'METHODOLOGY_EVOLUTION_DOCUMENTATION.md',
      'PAPER_OUTLINE.md', 'RESULTS_SUMMARY.md',
      'data_cleaning_docs/FLAGGED_VEHICLES_PATTERN_ANALYSIS.md'
    ];

    // Known log files
    const logFiles = [
      'comprehensive_analysis.log', 'eds_comprehensive_analysis.log',
      'future_work_analyses.log'
    ];

    this.files.figures = figureFiles.map(f => ({
      name: f,
      path: this.figuresPath + f,
      type: 'image/png',
      category: this.categorizeFigure(f)
    }));

    this.files.tables = tableFiles.map(f => ({
      name: f,
      path: this.tablesPath + f,
      type: 'text/csv',
      category: this.categorizeTable(f)
    }));

    this.files.markdown = docFiles.map(f => ({
      name: f,
      path: this.docsPath + f,
      type: 'text/markdown',
      category: 'Documentation'
    }));

    this.files.logs = logFiles.map(f => ({
      name: f,
      path: this.docsPath + f,
      type: 'text/plain',
      category: 'Logs'
    }));

    // Load DOCX files
    const docxFiles = await this.scanDocxFiles();
    this.files.documents = docxFiles;
  }

  categorizeFigure(filename) {
    if (filename.includes('filtering')) return 'Data Cleaning & Filtering';
    if (filename.includes('energy')) return 'Energy Analysis';
    if (filename.includes('eds')) return 'EDS Analysis';
    if (filename.includes('variable') || filename.includes('importance')) return 'Variable Importance';
    if (filename.includes('residual')) return 'Model Diagnostics';
    if (filename.includes('model') || filename.includes('comparison')) return 'Model Comparison';
    if (filename.includes('regional') || filename.includes('country') || filename.includes('map')) return 'Regional Analysis';
    if (filename.includes('temporal') || filename.includes('trend')) return 'Temporal Analysis';
    if (filename.includes('infrastructure') || filename.includes('charging')) return 'Infrastructure';
    return 'Other';
  }

  categorizeTable(filename) {
    if (filename.includes('filtering')) return 'Data Cleaning & Filtering';
    if (filename.includes('model_comparison') || filename.includes('variable_importance')) return 'Model Results';
    if (filename.includes('eds') || filename.includes('country')) return 'EDS Analysis';
    if (filename.includes('dataset') || filename.includes('summary')) return 'Dataset Overview';
    return 'Other';
  }

  async scanDocxFiles() {
    // DOCX files are already defined in paper_progression.html
    // We'll use that list
    return [];
  }

  getFigures(category = null) {
    if (category) {
      return this.files.figures.filter(f => f.category === category);
    }
    return this.files.figures;
  }

  getTables(category = null) {
    if (category) {
      return this.files.tables.filter(t => t.category === category);
    }
    return this.files.tables;
  }

  getDocuments() {
    return this.files.documents;
  }

  getMarkdown() {
    return this.files.markdown;
  }

  getLogs() {
    return this.files.logs;
  }

  getAllFiles() {
    return {
      figures: this.files.figures,
      tables: this.files.tables,
      documents: this.files.documents,
      markdown: this.files.markdown,
      logs: this.files.logs
    };
  }
}

// Global instance
window.projectFileLoader = new ProjectFileLoader();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.projectFileLoader.loadManifest();
  });
} else {
  window.projectFileLoader.loadManifest();
}
