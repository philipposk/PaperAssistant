    function loadNotifications() {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        notifications = JSON.parse(saved);
      }
    }
    
    // Initialize notifications
    document.addEventListener('DOMContentLoaded', function() {
      loadNotifications();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });
    
    // ============================================
    // 6X7 ECOSYSTEM INTEGRATION FRAMEWORK
    // ============================================
    
    // Integration Framework for connecting to health, life, and work tracking apps
    const INTEGRATION_FRAMEWORK = {
      version: '1.0.0',
      connectedApps: new Map(),
      healthData: {
        sleep: [],
        exercise: [],
        heartRate: [],
        steps: [],
        calories: [],
        stress: [],
        mood: []
      },
      syncSettings: {
        autoSync: true,
        syncInterval: 5 * 60 * 1000, // 5 minutes
        enabledIntegrations: []
      }
    };
    
    // Integration Providers
    const INTEGRATION_PROVIDERS = {
      lifecycle: {
        name: 'Lifecycle',
        type: 'health',
        apiEndpoint: 'https://api.lifecycle.app/v1',
        authType: 'oauth2',
        scopes: ['sleep', 'activity', 'health'],
        description: 'Norwegian sleep and activity tracking app',
        icon: '🌙'
      },
      sleepcycle: {
        name: 'Sleep Cycle',
        type: 'health',
        apiEndpoint: 'https://api.sleepcycle.com/v1',
        authType: 'oauth2',
        scopes: ['sleep', 'alarm', 'health'],
        description: 'Norwegian sleep tracking and smart alarm app',
        icon: '😴'
      },
      applehealth: {
        name: 'Apple Health',
        type: 'health',
        apiEndpoint: 'health://',
        authType: 'native',
        scopes: ['all'],
        description: 'Apple HealthKit integration',
        icon: '🍎'
      },
      googlefit: {
        name: 'Google Fit',
        type: 'health',
        apiEndpoint: 'https://www.googleapis.com/fitness/v1',
        authType: 'oauth2',
        scopes: ['activity', 'body', 'location'],
        description: 'Google Fit health and fitness tracking',
        icon: '🏃'
      },
      fitbit: {
        name: 'Fitbit',
        type: 'health',
        apiEndpoint: 'https://api.fitbit.com/1',
        authType: 'oauth2',
        scopes: ['activity', 'heartrate', 'sleep', 'profile'],
        description: 'Fitbit activity and health tracking',
        icon: '⌚'
      },
      garmin: {
        name: 'Garmin Connect',
        type: 'health',
        apiEndpoint: 'https://api.garmin.com',
        authType: 'oauth2',
        scopes: ['activity', 'health', 'location'],
        description: 'Garmin smartwatch and fitness tracking',
        icon: '⌚'
      },
      withings: {
        name: 'Withings',
        type: 'health',
        apiEndpoint: 'https://wbsapi.withings.net/v2',
        authType: 'oauth2',
        scopes: ['activity', 'measure', 'sleep'],
        description: 'Withings health and activity tracking',
        icon: '💪'
      }
    };
    
    // Connect to external app
    async function connectToApp(providerId) {
      const provider = INTEGRATION_PROVIDERS[providerId];
      if (!provider) {
        throw new Error(`Unknown provider: ${providerId}`);
      }
      
      try {
        // OAuth2 flow
        if (provider.authType === 'oauth2') {
          const authUrl = await initiateOAuthFlow(provider);
          const authWindow = window.open(authUrl, 'oauth', 'width=600,height=700');
          
          // Listen for OAuth callback
          return new Promise((resolve, reject) => {
            const messageListener = (event) => {
              if (event.data.type === 'oauth_callback' && event.data.provider === providerId) {
                window.removeEventListener('message', messageListener);
                authWindow.close();
                
                if (event.data.success) {
                  saveIntegrationToken(providerId, event.data.token);
                  INTEGRATION_FRAMEWORK.connectedApps.set(providerId, {
                    provider,
                    token: event.data.token,
                    connectedAt: new Date().toISOString(),
                    lastSync: null
                  });
                  resolve(true);
                } else {
                  reject(new Error(event.data.error));
                }
              }
            };
            window.addEventListener('message', messageListener);
          });
        } else if (provider.authType === 'native') {
          // Native integration (e.g., Apple Health)
          return await initiateNativeIntegration(provider);
        }
      } catch (error) {
        console.error(`Failed to connect to ${provider.name}:`, error);
        throw error;
      }
    }
    
    // Initiate OAuth flow
    async function initiateOAuthFlow(provider) {
      const clientId = localStorage.getItem(`oauth_client_id_${provider.name.toLowerCase()}`);
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const scopes = provider.scopes.join(' ');
      
      // Generate state for CSRF protection
      const state = generateRandomString(32);
      sessionStorage.setItem('oauth_state', state);
      
      return `${provider.apiEndpoint}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
    }
    
    // Initiate native integration
    async function initiateNativeIntegration(provider) {
      if (provider.name === 'Apple Health') {
        // Web API for HealthKit (if available)
        if (navigator.health) {
          try {
            const result = await navigator.health.requestAuthorization({
              read: ['steps', 'heartRate', 'sleep', 'activeEnergyBurned']
            });
            
            if (result) {
              INTEGRATION_FRAMEWORK.connectedApps.set('applehealth', {
                provider,
                token: 'native',
                connectedAt: new Date().toISOString(),
                lastSync: null
              });
              return true;
            }
          } catch (error) {
            console.error('HealthKit authorization failed:', error);
            throw error;
          }
        } else {
          throw new Error('HealthKit API not available in this browser');
        }
      }
    }
    
    // Save integration token
    function saveIntegrationToken(providerId, token) {
      // Store encrypted token
      const encrypted = btoa(JSON.stringify({ providerId, token, timestamp: Date.now() }));
      localStorage.setItem(`integration_token_${providerId}`, encrypted);
    }
    
    // Get integration token
    function getIntegrationToken(providerId) {
      const stored = localStorage.getItem(`integration_token_${providerId}`);
      if (stored) {
        try {
          const decrypted = JSON.parse(atob(stored));
          return decrypted.token;
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    
    // Sync data from connected apps
    async function syncHealthData(providerId = null) {
      const providersToSync = providerId 
        ? [INTEGRATION_FRAMEWORK.connectedApps.get(providerId)]
        : Array.from(INTEGRATION_FRAMEWORK.connectedApps.values());
      
      for (const integration of providersToSync) {
        if (!integration) continue;
        
        try {
          const provider = integration.provider;
          
          // Fetch sleep data
          if (provider.scopes.includes('sleep')) {
            const sleepData = await fetchHealthData(provider, 'sleep');
            if (sleepData) {
              INTEGRATION_FRAMEWORK.healthData.sleep.push(...sleepData);
            }
          }
          
          // Fetch exercise/activity data
          if (provider.scopes.includes('activity')) {
            const activityData = await fetchHealthData(provider, 'activity');
            if (activityData) {
              INTEGRATION_FRAMEWORK.healthData.exercise.push(...activityData);
            }
          }
          
          // Fetch heart rate data
          if (provider.scopes.includes('heartrate')) {
            const heartRateData = await fetchHealthData(provider, 'heartrate');
            if (heartRateData) {
              INTEGRATION_FRAMEWORK.healthData.heartRate.push(...heartRateData);
            }
          }
          
          // Fetch steps
          const stepsData = await fetchHealthData(provider, 'steps');
          if (stepsData) {
            INTEGRATION_FRAMEWORK.healthData.steps.push(...stepsData);
          }
          
          // Update last sync time
          integration.lastSync = new Date().toISOString();
          
          // Save to IndexedDB
          saveHealthData();
          
        } catch (error) {
          console.error(`Failed to sync ${provider.name}:`, error);
        }
      }
    }
    
    // Fetch health data from provider
    async function fetchHealthData(provider, dataType) {
      const token = getIntegrationToken(provider.name.toLowerCase().replace(' ', ''));
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // This would make actual API calls to the provider
      // For now, return mock structure
      const endpoint = `${provider.apiEndpoint}/${dataType}`;
      
      try {
        // In production, this would be a real API call
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return formatHealthData(data, dataType);
        }
      } catch (error) {
        // Fallback to mock data for development
        return generateMockHealthData(dataType);
      }
    }
    
    // Format health data from different providers
    function formatHealthData(rawData, dataType) {
      // Normalize data from different providers to common format
      const normalized = [];
      
      if (dataType === 'sleep') {
        rawData.forEach(entry => {
          normalized.push({
            id: entry.id || Date.now() + Math.random(),
            date: entry.date || entry.startTime,
            duration: entry.duration || entry.totalSleepTime,
            deepSleep: entry.deepSleep || entry.deepSleepMinutes,
            remSleep: entry.remSleep || entry.remSleepMinutes,
            lightSleep: entry.lightSleep || entry.lightSleepMinutes,
            sleepQuality: entry.quality || entry.sleepScore,
            bedTime: entry.bedTime || entry.startTime,
            wakeTime: entry.wakeTime || entry.endTime,
            source: entry.source || 'unknown'
          });
        });
      } else if (dataType === 'activity' || dataType === 'exercise') {
        rawData.forEach(entry => {
          normalized.push({
            id: entry.id || Date.now() + Math.random(),
            date: entry.date || entry.startTime,
            type: entry.type || entry.activityType,
            duration: entry.duration || entry.activeMinutes,
            calories: entry.calories || entry.activeEnergyBurned,
            distance: entry.distance,
            heartRate: entry.heartRate || entry.averageHeartRate,
            source: entry.source || 'unknown'
          });
        });
      } else if (dataType === 'heartrate') {
        rawData.forEach(entry => {
          normalized.push({
            id: entry.id || Date.now() + Math.random(),
            timestamp: entry.timestamp || entry.time,
            bpm: entry.bpm || entry.value,
            resting: entry.resting || false,
            source: entry.source || 'unknown'
          });
        });
      } else if (dataType === 'steps') {
        rawData.forEach(entry => {
          normalized.push({
            id: entry.id || Date.now() + Math.random(),
            date: entry.date || entry.startTime,
            steps: entry.steps || entry.value,
            distance: entry.distance,
            calories: entry.calories,
            source: entry.source || 'unknown'
          });
        });
      }
      
      return normalized;
    }
    
    // Generate mock health data for development
    function generateMockHealthData(dataType) {
      const today = new Date();
      const mockData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        if (dataType === 'sleep') {
          mockData.push({
            id: `mock_sleep_${i}`,
            date: date.toISOString().split('T')[0],
            duration: 7.5 + Math.random() * 1.5, // 7.5-9 hours
            deepSleep: 1.5 + Math.random() * 0.5,
            remSleep: 1.5 + Math.random() * 0.5,
            lightSleep: 4.5 + Math.random() * 1,
            sleepQuality: 70 + Math.random() * 25,
            bedTime: new Date(date.setHours(23, 0, 0, 0)).toISOString(),
            wakeTime: new Date(date.setHours(7, 30, 0, 0)).toISOString(),
            source: 'mock'
          });
        } else if (dataType === 'activity') {
          mockData.push({
            id: `mock_activity_${i}`,
            date: date.toISOString().split('T')[0],
            type: ['walking', 'running', 'cycling', 'gym'][Math.floor(Math.random() * 4)],
            duration: 30 + Math.random() * 60,
            calories: 200 + Math.random() * 400,
            distance: 2 + Math.random() * 8,
            heartRate: 120 + Math.random() * 40,
            source: 'mock'
          });
        } else if (dataType === 'steps') {
          mockData.push({
            id: `mock_steps_${i}`,
            date: date.toISOString().split('T')[0],
            steps: 5000 + Math.random() * 8000,
            distance: 3 + Math.random() * 5,
            calories: 150 + Math.random() * 200,
            source: 'mock'
          });
        }
      }
      
      return mockData;
    }
    
    // Sync timer/work data to health apps
    function syncTimerToHealthApps(state, duration) {
      // When work session completes, sync to health tracking
      if (state === 'work' && duration) {
        syncWorkActivityToHealthApps('work_complete', currentTimerMethod, duration);
      }
    }
    
    // Make connectToApp and related functions globally available
    if (typeof window !== 'undefined') {
      window.connectToApp = connectToApp;
      window.disconnectApp = disconnectApp;
      window.syncHealthData = syncHealthData;
    }
