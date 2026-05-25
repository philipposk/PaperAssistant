// ============================================
// GITHUB INTEGRATION SYSTEM
// GitHub OAuth and repository management with fallback for non-GitHub users
// ============================================

class GitHubIntegration {
  constructor() {
    this.clientId = null; // Set via environment or config
    this.redirectUri = window.location.origin + '/site/github-callback.html';
    this.scope = 'repo,read:user';
    this.accessToken = localStorage.getItem('github_access_token');
    this.user = JSON.parse(localStorage.getItem('github_user') || 'null');
    this.currentRepo = JSON.parse(localStorage.getItem('github_current_repo') || 'null');
    this.storageMode = localStorage.getItem('storage_mode') || 'local'; // 'github', 'local', 'backend', 'cloud'
  }

  // Initialize GitHub integration (optional)
  async init() {
    if (this.accessToken) {
      try {
        await this.verifyToken();
      } catch (e) {
        console.log('GitHub token invalid, clearing...');
        this.logout();
      }
    }
  }

  // OAuth flow
  async authenticate() {
    if (!this.clientId) {
      // Fallback: show message that GitHub is optional
      ModalSystem.info(
        'GitHub Integration',
        'GitHub integration is optional. You can use the platform without GitHub authentication. Your work will be saved locally or to your configured cloud storage.',
        () => {
          this.showStorageOptions();
        }
      );
      return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${this.scope}`;
    window.location.href = authUrl;
  }

  // Handle OAuth callback
  async handleCallback(code) {
    try {
      // Exchange code for token (requires backend)
      const response = await fetch('/api/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: this.redirectUri })
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem('github_access_token', this.accessToken);

      // Get user info
      await this.getUserInfo();
      
      ModalSystem.success('GitHub Connected', `Successfully connected to GitHub as ${this.user?.login}`);
    } catch (error) {
      console.error('GitHub authentication failed:', error);
      ModalSystem.error('Authentication Failed', 'Could not connect to GitHub. You can continue using local storage or cloud storage.');
    }
  }

  // Get authenticated user info
  async getUserInfo() {
    if (!this.accessToken) return null;

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${this.accessToken}` }
      });

      if (response.ok) {
        this.user = await response.json();
        localStorage.setItem('github_user', JSON.stringify(this.user));
        return this.user;
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
    return null;
  }

  // Verify token is still valid
  async verifyToken() {
    if (!this.accessToken) return false;
    const user = await this.getUserInfo();
    return !!user;
  }

  // List user repositories
  async listRepositories() {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { 'Authorization': `token ${this.accessToken}` }
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch repositories');
    } catch (error) {
      console.error('Failed to list repositories:', error);
      throw error;
    }
  }

  // Create new repository
  async createRepository(name, description = '', isPrivate = false) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
          license_template: 'mit'
        })
      });

      if (response.ok) {
        const repo = await response.json();
        this.setCurrentRepository(repo);
        return repo;
      }
      throw new Error('Failed to create repository');
    } catch (error) {
      console.error('Failed to create repository:', error);
      throw error;
    }
  }

  // Set current repository
  setCurrentRepository(repo) {
    this.currentRepo = repo;
    localStorage.setItem('github_current_repo', JSON.stringify(repo));
    this.storageMode = 'github';
    localStorage.setItem('storage_mode', 'github');
  }

  // Commit file to repository
  async commitFile(path, content, message, branch = 'main') {
    if (!this.accessToken || !this.currentRepo) {
      // Fallback to local storage
      return this.saveToLocalStorage(path, content);
    }

    try {
      // Get file SHA if exists
      let sha = null;
      try {
        const getResponse = await fetch(
          `https://api.github.com/repos/${this.currentRepo.full_name}/contents/${path}?ref=${branch}`,
          { headers: { 'Authorization': `token ${this.accessToken}` } }
        );
        if (getResponse.ok) {
          const fileData = await getResponse.json();
          sha = fileData.sha;
        }
      } catch (e) {
        // File doesn't exist, that's OK
      }

      // Create or update file
      const response = await fetch(
        `https://api.github.com/repos/${this.currentRepo.full_name}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch,
            ...(sha && { sha })
          })
        }
      );

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to commit file');
    } catch (error) {
      console.error('GitHub commit failed, using fallback:', error);
      // Fallback to local storage
      return this.saveToLocalStorage(path, content);
    }
  }

  // Save to local storage (fallback)
  saveToLocalStorage(path, content) {
    const key = `local_file_${path}`;
    localStorage.setItem(key, content);
    const files = JSON.parse(localStorage.getItem('local_files') || '[]');
    if (!files.includes(path)) {
      files.push(path);
      localStorage.setItem('local_files', JSON.stringify(files));
    }
    return { success: true, storage: 'local' };
  }

  // Logout
  logout() {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    // Don't clear current repo - user might want to reconnect
  }

  // Show storage options modal
  showStorageOptions() {
    const modal = ModalSystem.showModal({
      title: 'Storage Options',
      message: 'Choose how to store your project files:',
      type: 'info',
      buttons: [
        { text: 'Local Storage', action: () => { this.setStorageMode('local'); }, primary: false },
        { text: 'Cloud Storage', action: () => { this.setStorageMode('cloud'); }, primary: false },
        { text: 'Backend Storage', action: () => { this.setStorageMode('backend'); }, primary: false },
        { text: 'Connect GitHub', action: () => { this.authenticate(); }, primary: true }
      ]
    });
  }

  setStorageMode(mode) {
    this.storageMode = mode;
    localStorage.setItem('storage_mode', mode);
    ModalSystem.success('Storage Mode Updated', `Files will now be saved to ${mode} storage.`);
  }

  // Get file from storage (tries GitHub first, then fallback)
  async getFile(path) {
    if (this.storageMode === 'github' && this.accessToken && this.currentRepo) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${this.currentRepo.full_name}/contents/${path}`,
          { headers: { 'Authorization': `token ${this.accessToken}` } }
        );
        if (response.ok) {
          const data = await response.json();
          return atob(data.content);
        }
      } catch (e) {
        // Fall through to fallback
      }
    }

    // Fallback: try local storage
    const localKey = `local_file_${path}`;
    const localContent = localStorage.getItem(localKey);
    if (localContent) {
      return localContent;
    }

    // Fallback: try backend
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(path)}`);
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      // Fall through
    }

    throw new Error('File not found');
  }
}

// Initialize
window.githubIntegration = new GitHubIntegration();
window.githubIntegration.init();

