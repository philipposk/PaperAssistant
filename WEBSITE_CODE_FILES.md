# Website Code Files

This document lists all JavaScript files currently used by the website.

## External Libraries (CDN)

- `mammoth@1.6.0` - DOCX preview
- `fabric@5.3.0` - Figure editing
- `handsontable@14.1.0` - Table editing
- `pyodide@0.24.1` - Python execution (loaded defer)

## Core Application Files (Loaded in Order)

### 1. Shared Features
- **SHARED_FEATURES.js** - Common functionality (theme, modals, document functions)

### 2. Navigation & UI
- **UNIFIED_NAVIGATION.js** - Unified navigation system
- **MODAL_SYSTEM.js** - Modal system (replaces alerts)
- **BREADCRUMBS_SYSTEM.js** - Breadcrumb navigation
- **MODERN_UI_SYSTEM.js** - Modern UI components

### 3. Integration & Storage
- **GITHUB_INTEGRATION.js** - GitHub API integration
- **STORAGE_MANAGER.js** - Local storage management
- **CLOUD_STORAGE_INTEGRATION.js** - Cloud storage integration

### 4. Features & Systems
- **KNOWLEDGE_GRAPH.js** - Knowledge graph visualization
- **TIMELINE_SYSTEM.js** - Timeline system
- **ADDITIONAL_FEATURES.js** - Additional features
- **AI_TRAINING_SYSTEM.js** - AI training system
- **MULTI_USE_CASE_SYSTEM.js** - Multi-use case system
- **AUTOMATIC_LOGGING_SYSTEM.js** - Automatic logging

### 5. Project Management
- **PROJECT_IMPORT_ANALYSIS.js** - Project import and analysis
- **PROJECT_FILE_LOADER.js** - Project file loader

### 6. Editing & Display
- **RESIZABLE_FIGURES_TABLES.js** - Resizable figures/tables
- **DOCUMENT_EDITING_SYSTEM.js** - Document editing
- **EDITOR_SELECTOR.js** - Editor selector

### 7. Paper Progression (Split into Parts)
- **PAPER_PROGRESSION_INLINE_part1.js** - Part 1 (early functions, file operations)
- **PAPER_PROGRESSION_INLINE_part2.js** - Part 2 (timeline, tabs, search)
- **PAPER_PROGRESSION_INLINE_part3.js** - Part 3 (file explorer, carousels)
- **PAPER_PROGRESSION_INLINE_part4.js** - Part 4 (remaining functionality)

### 8. Utilities
- **QUICK_FIX_DEBUG.js** - Quick fix debug utilities
- **RESIZABLE_PORTFOLIO.js** - Resizable portfolio (if used)

## File Loading Order

Files are loaded in the order listed above. The split PAPER_PROGRESSION_INLINE parts maintain the original execution order and are loaded sequentially (part1 → part2 → part3 → part4).

## Notes

- All files are in the `site/` directory
- HTML files (index.html, paper_progression.html, etc.) load these scripts
- Total JavaScript files: ~25-30 files (including parts)
- Original PAPER_PROGRESSION_INLINE.js has been split into 4 parts for better maintainability
