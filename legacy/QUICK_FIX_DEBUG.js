// Quick debug script to verify everything loads
console.log('QUICK_FIX_DEBUG: Script loaded');

// Check if key elements exist
document.addEventListener('DOMContentLoaded', function() {
  console.log('QUICK_FIX_DEBUG: DOM loaded');
  
  // Check theme toggle
  const themeBtn = document.querySelector('.theme-toggle');
  const themeIcon = document.getElementById('themeIcon');
  console.log('Theme button:', themeBtn ? 'FOUND' : 'MISSING');
  console.log('Theme icon:', themeIcon ? 'FOUND' : 'MISSING');
  
  // Check Final Paper button
  const finalPaperBtn = document.querySelector('.docx-main-button');
  const arrowBtn = document.querySelector('.docx-arrow-button');
  console.log('Final Paper button:', finalPaperBtn ? 'FOUND' : 'MISSING');
  console.log('Arrow button:', arrowBtn ? 'FOUND' : 'MISSING');
  
  // Check Document Explorer button
  const docExplorerBtn = document.querySelector('[onclick*="toggleDocumentExplorer"]');
  console.log('Document Explorer button:', docExplorerBtn ? 'FOUND' : 'MISSING');
  
  // Check project file loader
  console.log('Project File Loader:', window.projectFileLoader ? 'LOADED' : 'MISSING');
  
  // Check timeline
  const timelineContent = document.getElementById('timeline-content');
  console.log('Timeline content:', timelineContent ? 'FOUND' : 'MISSING');
  
  // Try to load manifest
  if (window.projectFileLoader) {
    window.projectFileLoader.loadManifest().then(() => {
      console.log('Manifest loaded:', window.projectFileLoader.files);
    }).catch(err => {
      console.error('Manifest load error:', err);
    });
  }
});

