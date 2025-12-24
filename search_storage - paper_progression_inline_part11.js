    function toggleSetting(element) {
      element.classList.toggle('active');
    }
    
    // ============================================
    // TASK MANAGEMENT
    // ============================================
    
    let tasks = [];
    let taskIdCounter = 0;
    
    // Load tasks from localStorage
    function loadTasks() {
      const saved = localStorage.getItem('tasks');
      if (saved) {
        tasks = JSON.parse(saved);
        taskIdCounter = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 0;
      }
      renderTasks();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Create task
    function createTask(title, description = '', priority = 'medium', dueDate = null, tags = []) {
      const task = {
        id: taskIdCounter++,
        title,
        description,
        priority,
        dueDate,
        tags,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasks.push(task);
      saveTasks();
      renderTasks();
      return task;
    }
    
    // Update task
    function updateTask(taskId, updates) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
        task.updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
      }
    }
    
    // Delete task
    function deleteTask(taskId) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
    }
    
    // Toggle task completion
    function toggleTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
      }
    }
    
    // Render tasks (will be integrated into UI)
    function renderTasks() {
      // Tasks will be displayed in a task panel or integrated into the dashboard
      // For now, just save to localStorage
    }
    
    // Initialize tasks on page load
    document.addEventListener('DOMContentLoaded', function() {
      loadTasks();
    });
    
    // ============================================
    // TIME TRACKING
    // ============================================
    
    let timeEntries = [];
    let currentTimer = null;
    let taskTimerStartTime = null;
    
    // Start timer
    function startTaskTimer(taskId, category = 'research') {
      if (currentTimer) {
        stopTaskTimer();
      }
      taskTimerStartTime = Date.now();
      currentTimer = {
        taskId,
        category,
        startTime: taskTimerStartTime
      };
      updateTimerDisplay();
    }
    
    // Stop timer
    function stopTimer() {
      if (currentTimer && taskTimerStartTime) {
        const duration = Date.now() - taskTimerStartTime;
        const entry = {
          id: Date.now(),
          taskId: currentTimer.taskId,
          category: currentTimer.category,
          startTime: new Date(taskTimerStartTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: Math.round(duration / 1000 / 60) // minutes
        };
        timeEntries.push(entry);
        saveTimeEntries();
        currentTimer = null;
        taskTimerStartTime = null;
        updateTimerDisplay();
      }
    }
    
    // Update timer display
    function updateTimerDisplay() {
      // Timer display will be integrated into UI
    }
    
    // Save time entries
    function saveTimeEntries() {
      localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    }
    
    // Load time entries
    function loadTimeEntries() {
      const saved = localStorage.getItem('timeEntries');
      if (saved) {
        timeEntries = JSON.parse(saved);
      }
    }
    
    // Initialize time tracking
    document.addEventListener('DOMContentLoaded', function() {
      loadTimeEntries();
    });
    
    // ============================================
    // ENHANCED WORK TIMER SYSTEM (Multiple Methods)
    // ============================================
    
    // Timer Methods Configuration
    const TIMER_METHODS = {
      pomodoro: {
        name: 'Pomodoro Technique',
        workDuration: 25 * 60, // 25 minutes
        shortBreak: 5 * 60,   // 5 minutes
        longBreak: 15 * 60,   // 15 minutes
        sessionsUntilLongBreak: 4,
        description: '25-minute focused work sessions with short breaks'
      },
      flowtime: {
        name: 'Flow Time',
        workDuration: null, // Flexible, user-defined
        shortBreak: null,
        longBreak: null,
        sessionsUntilLongBreak: null,
        description: 'Work until natural break point, track flow state'
      },
      timeblocking: {
        name: 'Time Blocking',
        workDuration: 60 * 60, // 1 hour blocks
        shortBreak: 10 * 60,   // 10 minutes
        longBreak: 30 * 60,    // 30 minutes
        sessionsUntilLongBreak: 3,
        description: 'Block time for specific tasks, longer focused periods'
      },
      ultradian: {
        name: 'Ultradian Rhythm',
        workDuration: 90 * 60, // 90 minutes
        shortBreak: 20 * 60,   // 20 minutes
        longBreak: null,
        sessionsUntilLongBreak: null,
        description: '90-minute work cycles aligned with natural body rhythms'
      },
      custom: {
        name: 'Custom Timer',
        workDuration: 30 * 60, // 30 minutes default
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
        sessionsUntilLongBreak: 4,
        description: 'Fully customizable timer settings'
      }
    };
    
    let currentTimerMethod = 'pomodoro';
    let timerState = 'stopped'; // stopped, work, break, longBreak
    let timerTimeLeft = TIMER_METHODS[currentTimerMethod].workDuration;
    let timerInterval = null;
    let timerSessions = 0;
    let timerStartTime = null;
    let timerHistory = [];
    
    // Initialize timer with method
    function initTimer(method = 'pomodoro') {
      currentTimerMethod = method;
      const config = TIMER_METHODS[method];
      
      if (config.workDuration) {
        timerTimeLeft = config.workDuration;
      } else {
        // Flow Time - start with 0, count up
        timerTimeLeft = 0;
      }
      
      timerState = 'stopped';
      timerSessions = 0;
    }
    
    // Start timer
    function startTimer(method = null) {
      if (method) {
        initTimer(method);
      }
      
      if (timerState === 'stopped') {
        timerState = 'work';
        timerStartTime = Date.now();
        
        if (TIMER_METHODS[currentTimerMethod].workDuration === null) {
          // Flow Time - count up
          timerTimeLeft = 0;
        }
      }
      
      timerInterval = setInterval(() => {
        const config = TIMER_METHODS[currentTimerMethod];
        
        if (config.workDuration === null) {
          // Flow Time - increment
          timerTimeLeft++;
        } else {
          // Other methods - decrement
          timerTimeLeft--;
        }
        
        updateTimerDisplay();
        
        // Check if timer completed (only for countdown methods)
        if (config.workDuration !== null && timerTimeLeft <= 0) {
          completeTimerSession();
        }
      }, 1000);
      
      // Track timer start
      trackTimerEvent('start', currentTimerMethod);
    }
    
    // Pause timer
    function pauseTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        trackTimerEvent('pause', currentTimerMethod);
      }
    }
    
    // Resume timer
    function resumeTimer() {
      if (timerState !== 'stopped' && !timerInterval) {
        timerInterval = setInterval(() => {
          const config = TIMER_METHODS[currentTimerMethod];
          
          if (config.workDuration === null) {
            timerTimeLeft++;
          } else {
            timerTimeLeft--;
          }
          
          updateTimerDisplay();
          
          if (config.workDuration !== null && timerTimeLeft <= 0) {
            completeTimerSession();
          }
        }, 1000);
        trackTimerEvent('resume', currentTimerMethod);
      }
    }
    
    // Stop timer
    function stopTimer() {
      pauseTimer();
      
      if (timerStartTime) {
        const duration = Date.now() - timerStartTime;
        trackTimerEvent('stop', currentTimerMethod, duration);
        taskTimerStartTime = null;
      }
      
      timerState = 'stopped';
      const config = TIMER_METHODS[currentTimerMethod];
      timerTimeLeft = config.workDuration || 0;
      updateTimerDisplay();
    }
    
    // Reset timer
    function resetTimer() {
      stopTimer();
      timerSessions = 0;
      initTimer(currentTimerMethod);
    }
    
    // Complete timer session
    function completeTimerSession() {
      pauseTimer();
      timerSessions++;
      
      const config = TIMER_METHODS[currentTimerMethod];
      const duration = timerStartTime ? Date.now() - timerStartTime : 0;
      
      // Save session
      timerHistory.push({
        id: Date.now(),
        method: currentTimerMethod,
        type: timerState,
        duration: Math.round(duration / 1000 / 60), // minutes
        timestamp: new Date().toISOString()
      });
      saveTimerHistory();
      
      // Determine next state
      if (timerState === 'work') {
        if (config.sessionsUntilLongBreak && timerSessions % config.sessionsUntilLongBreak === 0) {
          timerState = 'longBreak';
          timerTimeLeft = config.longBreak;
        } else if (config.shortBreak) {
          timerState = 'break';
          timerTimeLeft = config.shortBreak;
        } else {
          // Flow Time - just stop
          stopTimer();
          return;
        }
      } else {
        timerState = 'work';
        timerTimeLeft = config.workDuration || 0;
      }
      
      // Show notification
      if (Notification.permission === 'granted') {
        const message = timerState === 'work' 
          ? `Break complete! Time for ${config.name}` 
          : `${config.name} session complete! Time for a break.`;
        new Notification('Timer Complete!', { body: message });
      }
      
      // Sync with health apps
      syncTimerToHealthApps(timerState, duration);
      
      updateTimerDisplay();
    }
    
    // Update timer display
    function updateTimerDisplay() {
      const minutes = Math.floor(Math.abs(timerTimeLeft) / 60);
      const seconds = Math.abs(timerTimeLeft) % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // Update UI if timer display element exists
      const timerDisplay = document.getElementById('timerDisplay');
      if (timerDisplay) {
        timerDisplay.textContent = formatted;
        timerDisplay.className = `timer-display timer-${timerState} timer-${currentTimerMethod}`;
      }
      
      // Update timer state display
      const timerStateEl = document.getElementById('timerState');
      if (timerStateEl) {
        const stateText = {
          'stopped': 'Ready',
          'work': 'Working',
          'break': 'Break',
          'longBreak': 'Long Break'
        };
        timerStateEl.textContent = stateText[timerState] || 'Ready';
      }
      
      // Update sessions count
      const timerSessionsEl = document.getElementById('timerSessions');
      if (timerSessionsEl) {
        timerSessionsEl.textContent = `Sessions: ${timerSessions}`;
      }
      
      // Update button states
      const startBtn = document.getElementById('timerStartBtn');
      const pauseBtn = document.getElementById('timerPauseBtn');
      if (startBtn && pauseBtn) {
        if (timerState === 'stopped' || !timerInterval) {
          startBtn.style.display = 'block';
          pauseBtn.style.display = 'none';
        } else {
          startBtn.style.display = 'none';
          pauseBtn.style.display = 'block';
        }
      }
    }
    
    // Timer Widget UI
    function toggleTimerWidget() {
      const widget = document.getElementById('timerWidget');
      const toolbar = document.querySelector('.quick-access-toolbar');
      if (widget) {
        const isVisible = widget.style.display !== 'none' && widget.style.display !== '';
        if (isVisible) {
          // Hide widget
          widget.style.animation = 'slideOutDown 0.3s ease-out';
          setTimeout(() => {
            widget.style.display = 'none';
            // Adjust toolbar position back
            if (toolbar) toolbar.style.bottom = '1rem';
          }, 300);
        } else {
          // Show widget
          widget.style.display = 'block';
          updateTimerDisplay();
          // Adjust toolbar position to avoid overlap with timer widget
          if (toolbar) {
            const timerHeight = 400; // Approximate timer widget height
            const timerBottom = 32; // 2rem in pixels
            toolbar.style.bottom = `${timerBottom + timerHeight + 16}px`; // 16px gap
          }
          // Set current method in select
          const select = document.getElementById('timerMethodSelect');
          if (select) {
            select.value = currentTimerMethod;
          }
          // Animate in
          setTimeout(() => {
            widget.style.animation = 'slideInUp 0.3s ease-out';
          }, 10);
        }
      }
    }
    
