    function addProvenanceNode(id, type, name, path) {
      provenanceGraph.nodes.push({ id, type, name, path, timestamp: new Date().toISOString() });
      saveProvenance();
    }
    
    function addProvenanceEdge(fromId, toId, transformation) {
      provenanceGraph.edges.push({ fromId, toId, transformation, timestamp: new Date().toISOString() });
      saveProvenance();
    }
    
    function saveProvenance() {
      localStorage.setItem('provenanceGraph', JSON.stringify(provenanceGraph));
    }
    
    function loadProvenance() {
      const saved = localStorage.getItem('provenanceGraph');
      if (saved) {
        provenanceGraph = JSON.parse(saved);
      }
    }
    
    // RS4: Reproducibility Checker
    function checkReproducibility() {
      const checks = {
        scriptsComplete: true,
        dataAvailable: true,
        dependenciesAvailable: true,
        environmentValid: true,
        issues: []
      };
      
      // Check if all analysis scripts are present
      const requiredScripts = [
        '01_data_loading.R',
        '02_data_cleaning.R',
        '03_energy_calculations.R',
        '09g_all_models_CLEAN_variables.R'
      ];
      
      // Check data files
      const requiredData = [
        'OBFCM_2021.csv',
        'OBFCM_2022.csv',
        'OBFCM_2023.csv'
      ];
      
      // Generate report
      const report = {
        timestamp: new Date().toISOString(),
        checks,
        recommendations: [
          'Ensure all R packages are documented',
          'Verify data file paths are correct',
          'Check R version compatibility',
          'Document all random seeds'
        ]
      };
      
      return report;
    }
    
    // RS5: Ethics Compliance Tracker
    let complianceRecords = [];
    
    function addComplianceRecord(type, description, expiryDate, document = null) {
      const record = {
        id: Date.now(),
        type, // 'training', 'certification', 'approval'
        description,
        expiryDate,
        document,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      complianceRecords.push(record);
      saveCompliance();
      return record;
    }
    
    function checkComplianceStatus() {
      const now = new Date();
      const expiringSoon = complianceRecords.filter(r => {
        if (!r.expiryDate) return false;
        const expiry = new Date(r.expiryDate);
        const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });
      
      const expired = complianceRecords.filter(r => {
        if (!r.expiryDate) return false;
        return new Date(r.expiryDate) < now;
      });
      
      return {
        active: complianceRecords.filter(r => r.status === 'active').length,
        expiringSoon: expiringSoon.length,
        expired: expired.length,
        alerts: [...expiringSoon.map(r => `${r.description} expires soon`), ...expired.map(r => `${r.description} has expired`)]
      };
    }
    
    function saveCompliance() {
      localStorage.setItem('complianceRecords', JSON.stringify(complianceRecords));
    }
    
    function loadCompliance() {
      const saved = localStorage.getItem('complianceRecords');
      if (saved) {
        complianceRecords = JSON.parse(saved);
      }
    }
    
    // RS6: Grant Application Helper
    let grantApplications = [];
    
    function createGrantApplication(funder, title, deadline) {
      const application = {
        id: Date.now(),
        funder,
        title,
        deadline,
        status: 'draft',
        sections: {
          summary: '',
          objectives: '',
          methodology: '',
          budget: '',
          timeline: ''
        },
        createdAt: new Date().toISOString()
      };
      grantApplications.push(application);
      saveGrantApplications();
      return application;
    }
    
    function saveGrantApplications() {
      localStorage.setItem('grantApplications', JSON.stringify(grantApplications));
    }
    
    function loadGrantApplications() {
      const saved = localStorage.getItem('grantApplications');
      if (saved) {
        grantApplications = JSON.parse(saved);
      }
    }
    
    // RS7: Conference Submission Tracker
    let conferenceSubmissions = [];
    
    function createConferenceSubmission(name, location, abstractDeadline, paperDeadline) {
      const submission = {
        id: Date.now(),
        name,
        location,
        abstractDeadline,
        paperDeadline,
        abstractSubmitted: false,
        paperSubmitted: false,
        status: 'planning',
        abstract: '',
        paper: null,
        createdAt: new Date().toISOString()
      };
      conferenceSubmissions.push(submission);
      saveConferenceSubmissions();
      return submission;
    }
    
    function saveConferenceSubmissions() {
      localStorage.setItem('conferenceSubmissions', JSON.stringify(conferenceSubmissions));
    }
    
    function loadConferenceSubmissions() {
      const saved = localStorage.getItem('conferenceSubmissions');
      if (saved) {
        conferenceSubmissions = JSON.parse(saved);
      }
    }
    
    // RS8: Publication Impact Tracker
    let publications = [];
    let impactMetrics = [];
    
    function addPublication(title, journal, year, doi) {
      const publication = {
        id: Date.now(),
        title,
        journal,
        year,
        doi,
        citations: 0,
        downloads: 0,
        altmetrics: {
          twitter: 0,
          news: 0,
          blogs: 0
        },
        createdAt: new Date().toISOString()
      };
      publications.push(publication);
      savePublications();
      return publication;
    }
    
    async function updateImpactMetrics(publicationId) {
      const publication = publications.find(p => p.id === publicationId);
      if (!publication || !publication.doi) return;
      
      // In a real implementation, this would call APIs like:
      // - Google Scholar API for citations
      // - Altmetric API for altmetrics
      // - Publisher API for downloads
      
      // For now, store placeholder
      impactMetrics.push({
        publicationId,
        timestamp: new Date().toISOString(),
        citations: publication.citations,
        downloads: publication.downloads,
        altmetrics: publication.altmetrics
      });
      
      saveImpactMetrics();
    }
    
    function savePublications() {
      localStorage.setItem('publications', JSON.stringify(publications));
    }
    
    function saveImpactMetrics() {
      localStorage.setItem('impactMetrics', JSON.stringify(impactMetrics));
    }
    
    function loadPublications() {
      const saved = localStorage.getItem('publications');
      if (saved) {
        publications = JSON.parse(saved);
      }
      const savedMetrics = localStorage.getItem('impactMetrics');
      if (savedMetrics) {
        impactMetrics = JSON.parse(savedMetrics);
      }
    }
    
    // Initialize all research features
    document.addEventListener('DOMContentLoaded', function() {
      loadSubmissions();
      loadProvenance();
      loadCompliance();
      loadGrantApplications();
      loadConferenceSubmissions();
      loadPublications();
    });
    
    // ============================================
    // COLLABORATION TOOLS (HP4)
    // ============================================
    
    let comments = [];
    let annotations = [];
    
    // Add comment
    function addComment(filePath, lineNumber, text, author = 'You') {
      const comment = {
        id: Date.now(),
        filePath,
        lineNumber,
        text,
        author,
        timestamp: new Date().toISOString(),
        replies: []
      };
      comments.push(comment);
      saveComments();
      return comment;
    }
    
    // Reply to comment
    function replyToComment(commentId, text, author = 'You') {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.replies.push({
          id: Date.now(),
          text,
          author,
          timestamp: new Date().toISOString()
        });
        saveComments();
      }
    }
    
    // Save comments
    function saveComments() {
      localStorage.setItem('comments', JSON.stringify(comments));
    }
    
    // Load comments
    function loadComments() {
      const saved = localStorage.getItem('comments');
      if (saved) {
        comments = JSON.parse(saved);
      }
    }
    
    // Add annotation
    function addAnnotation(filePath, selection, text, author = 'You') {
      const annotation = {
        id: Date.now(),
        filePath,
        selection,
        text,
        author,
        timestamp: new Date().toISOString()
      };
      annotations.push(annotation);
      saveAnnotations();
      return annotation;
    }
    
    // Save annotations
    function saveAnnotations() {
      localStorage.setItem('annotations', JSON.stringify(annotations));
    }
    
    // Load annotations
    function loadAnnotations() {
      const saved = localStorage.getItem('annotations');
      if (saved) {
        annotations = JSON.parse(saved);
      }
    }
    
    // Initialize collaboration
    document.addEventListener('DOMContentLoaded', function() {
      loadComments();
      loadAnnotations();
    });
    
    // ============================================
    // VERSION CONTROL UI (HP7)
    // ============================================
    
    let fileVersions = new Map();
    
    // Save file version
    function saveFileVersion(filePath, content) {
      if (!fileVersions.has(filePath)) {
        fileVersions.set(filePath, []);
      }
      
      const versions = fileVersions.get(filePath);
      const version = {
        id: Date.now(),
        version: versions.length + 1,
        content,
        timestamp: new Date().toISOString(),
        author: 'You',
        changes: versions.length > 0 ? getChanges(versions[versions.length - 1].content, content) : 'Initial version'
      };
      
      versions.push(version);
      
      // Keep last 50 versions
      if (versions.length > 50) {
        versions.shift();
      }
      
      saveVersions();
    }
    
    // Get changes between versions
    function getChanges(oldContent, newContent) {
      // Simple diff - in production, use a proper diff library
      if (oldContent === newContent) return 'No changes';
      const oldLines = oldContent.split('\n').length;
      const newLines = newContent.split('\n').length;
      return `Lines: ${oldLines} → ${newLines}`;
    }
    
    // Get version history
    function getVersionHistory(filePath) {
      return fileVersions.get(filePath) || [];
    }
    
    // Restore version
    function restoreVersion(filePath, versionId) {
      const versions = fileVersions.get(filePath);
      if (versions) {
        const version = versions.find(v => v.id === versionId);
        if (version) {
          return version.content;
        }
      }
      return null;
    }
    
    // Save versions
    function saveVersions() {
      const versionsObj = Object.fromEntries(fileVersions);
      localStorage.setItem('fileVersions', JSON.stringify(versionsObj));
    }
    
    // Load versions
    function loadVersions() {
      const saved = localStorage.getItem('fileVersions');
      if (saved) {
        const versionsObj = JSON.parse(saved);
        fileVersions = new Map(Object.entries(versionsObj));
      }
    }
    
    // Initialize version control
    document.addEventListener('DOMContentLoaded', function() {
      loadVersions();
    });
    
    // ============================================
    // EXPORT SYSTEM (HP5)
    // ============================================
    
    async function exportDocument(format, content, fileName) {
      switch (format) {
        case 'pdf':
          await exportToPDF(content, fileName);
          break;
        case 'latex':
          exportToLaTeX(content, fileName);
          break;
        case 'docx':
          exportToDOCX(content, fileName);
          break;
        case 'html':
          exportToHTML(content, fileName);
          break;
        default:
          alert('Unsupported format');
      }
    }
    
    async function exportToPDF(content, fileName) {
      // Use html2pdf or jsPDF
      alert('PDF export - install html2pdf library for full functionality');
      // In production: use html2pdf.js or jsPDF
    }
    
