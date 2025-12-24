// ============================================
// FILE LISTING API
// Backend endpoint for listing project files
// For production: This would be a server endpoint
// For localhost: Uses hardcoded structure or fetches from manifest
// ============================================

/**
 * Fetch file structure from backend API
 * In production, this would call: /api/files/list or similar
 */
async function fetchFileStructureFromAPI() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // For localhost, try to load from a manifest file or use hardcoded structure
    try {
      const response = await fetch('../file_manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        return manifest;
      }
    } catch (e) {
      console.log('No file_manifest.json found, using hardcoded structure');
    }
    // Return null to use hardcoded structure
    return null;
  } else {
    // For production, call backend API
    try {
      const response = await fetch('/api/files/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.fileStructure;
      } else {
        console.error('Failed to fetch file structure:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching file structure from API:', error);
      return null;
    }
  }
}

/**
 * Generate file manifest from directory structure
 * This would be run server-side to create file_manifest.json
 */
function generateFileManifest(structure) {
  return {
    version: '1.0',
    generated: new Date().toISOString(),
    structure: structure
  };
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.fetchFileStructureFromAPI = fetchFileStructureFromAPI;
  window.generateFileManifest = generateFileManifest;
}

