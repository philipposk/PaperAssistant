    function closeTimerWidget() {
      const widget = document.getElementById('timerWidget');
      const toolbar = document.querySelector('.quick-access-toolbar');
      if (widget) {
        widget.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => {
          widget.style.display = 'none';
          // Adjust toolbar position back
          if (toolbar) toolbar.style.bottom = '1rem';
        }, 300);
      }
    }
    
    
    function openTimerStats() {
      const stats = getTimerStats(null, 7);
      alert(`Timer Statistics (Last 7 Days):\n\nTotal Time: ${stats.totalHours} hours\nSessions: ${stats.sessions}\nAverage Session: ${stats.avgSession} minutes\n\nMethod Breakdown:\n${Object.entries(stats.methodBreakdown).map(([method, minutes]) => `  ${method}: ${Math.round(minutes / 60 * 10) / 10} hours`).join('\n')}`);
    }
    
    // Keyboard shortcut for timer
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTimerWidget();
      }
      // Close timer widget on Escape (only if timer is open)
      if (e.key === 'Escape' || e.keyCode === 27) {
        const timerWidget = document.getElementById('timerWidget');
        if (timerWidget && timerWidget.style.display !== 'none' && timerWidget.style.display !== '') {
          closeTimerWidget();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    // Track timer events
    function trackTimerEvent(event, method, duration = null) {
      const eventData = {
        id: Date.now(),
        event,
        method,
        duration: duration ? Math.round(duration / 1000 / 60) : null,
        timestamp: new Date().toISOString()
      };
      
      // Store in IndexedDB
      if (db) {
        const transaction = db.transaction(['timeEntries'], 'readwrite');
        const store = transaction.objectStore('timeEntries');
        store.add(eventData);
      }
      
      // Also sync to health tracking
      if (event === 'start' || event === 'stop') {
        syncWorkActivityToHealthApps(event, method, duration);
      }
    }
    
    // Save timer history
    function saveTimerHistory() {
      localStorage.setItem('timerHistory', JSON.stringify(timerHistory));
    }
    
    // Load timer history
    function loadTimerHistory() {
      const saved = localStorage.getItem('timerHistory');
      if (saved) {
        timerHistory = JSON.parse(saved);
      }
    }
    
    // Get timer statistics
    function getTimerStats(method = null, days = 7) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      const filtered = timerHistory.filter(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= cutoff && (!method || session.method === method);
      });
      
      const totalMinutes = filtered.reduce((sum, s) => sum + s.duration, 0);
      const sessions = filtered.length;
      const avgSession = sessions > 0 ? Math.round(totalMinutes / sessions) : 0;
      
      return {
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions,
        avgSession,
        methodBreakdown: filtered.reduce((acc, s) => {
          acc[s.method] = (acc[s.method] || 0) + s.duration;
          return acc;
        }, {})
      };
    }
    
    // Make timer functions globally accessible
    window.toggleTimerWidget = toggleTimerWidget;
    window.closeTimerWidget = closeTimerWidget;
    window.startTimer = startTimer;
    window.pauseTimer = pauseTimer;
    window.stopTimer = stopTimer;
    window.initTimer = initTimer;
    window.openTimerStats = openTimerStats;
    
    // Initialize timer
    document.addEventListener('DOMContentLoaded', function() {
      loadTimerHistory();
      initTimer('pomodoro');
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });
    
    // ============================================
    // RESEARCH JOURNAL
    // ============================================
    
    let journalEntries = [];
    
    // Create journal entry
    function createJournalEntry(title, content, tags = [], mood = 'neutral') {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        title,
        content,
        tags,
        mood,
        achievements: [],
        challenges: [],
        reflections: ''
      };
      journalEntries.push(entry);
      saveJournalEntries();
      return entry;
    }
    
    // Save journal entries
    function saveJournalEntries() {
      localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    }
    
    // Load journal entries
    function loadJournalEntries() {
      const saved = localStorage.getItem('journalEntries');
      if (saved) {
        journalEntries = JSON.parse(saved);
      }
    }
    
    // Initialize journal
    document.addEventListener('DOMContentLoaded', function() {
      loadJournalEntries();
    });
    
    // ============================================
    // GOAL TRACKER
    // ============================================
    
    let goals = [];
    
    // Create goal
    function createGoal(title, description, target, unit, deadline, milestones = []) {
      const goal = {
        id: Date.now(),
        title,
        description,
        target,
        current: 0,
        unit,
        deadline,
        milestones,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      goals.push(goal);
      saveGoals();
      return goal;
    }
    
    // Update goal progress
    function updateGoalProgress(goalId, current) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        goal.current = current;
        goal.progress = (current / goal.target) * 100;
        
        // Check milestones
        goal.milestones.forEach(milestone => {
          if (goal.progress >= milestone.percentage && !milestone.completed) {
            milestone.completed = true;
            milestone.completedAt = new Date().toISOString();
          }
        });
        
        // Check if goal is complete
        if (goal.progress >= 100) {
          goal.status = 'completed';
        }
        
        saveGoals();
      }
    }
    
    // Save goals
    function saveGoals() {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
    
    // Load goals
    function loadGoals() {
      const saved = localStorage.getItem('goals');
      if (saved) {
        goals = JSON.parse(saved);
      }
    }
    
    // Initialize goals
    document.addEventListener('DOMContentLoaded', function() {
      loadGoals();
    });
    
    // ============================================
    // HABIT TRACKER
    // ============================================
    
    let habits = [];
    let habitCompletions = [];
    
    // Create habit
    function createHabit(name, description, frequency = 'daily') {
      const habit = {
        id: Date.now(),
        name,
        description,
        frequency,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        createdAt: new Date().toISOString()
      };
      habits.push(habit);
      saveHabits();
      return habit;
    }
    
    // Complete habit
    function completeHabit(habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const today = new Date().toDateString();
        const lastCompletion = habitCompletions
          .filter(c => c.habitId === habitId)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        // Check if already completed today
        if (lastCompletion && new Date(lastCompletion.date).toDateString() === today) {
          return; // Already completed
        }
        
        // Add completion
        habitCompletions.push({
          id: Date.now(),
          habitId,
          date: new Date().toISOString()
        });
        
        // Update streak
        if (lastCompletion) {
          const lastDate = new Date(lastCompletion.date);
          const todayDate = new Date();
          const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            habit.streak++;
          } else {
            habit.streak = 1;
          }
        } else {
          habit.streak = 1;
        }
        
        habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
        habit.totalCompletions++;
        
        saveHabits();
        saveHabitCompletions();
      }
    }
    
    // Save habits
    function saveHabits() {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
    
    // Save habit completions
    function saveHabitCompletions() {
      localStorage.setItem('habitCompletions', JSON.stringify(habitCompletions));
    }
    
    // Load habits
    function loadHabits() {
      const saved = localStorage.getItem('habits');
      if (saved) {
        habits = JSON.parse(saved);
      }
      const savedCompletions = localStorage.getItem('habitCompletions');
      if (savedCompletions) {
        habitCompletions = JSON.parse(savedCompletions);
      }
    }
    
    // Initialize habits
    document.addEventListener('DOMContentLoaded', function() {
      loadHabits();
    });
    
    // ============================================
    // PROGRESS VISUALIZATIONS
    // ============================================
    
    // Get progress data
    function getProgressData() {
      const taskCompletion = tasks.length > 0 
        ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
        : 0;
      
      const goalProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
        : 0;
      
      const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0);
      
      return {
        taskCompletion,
        goalProgress,
        totalTime,
        pomodoroSessions,
        habitsCompleted: habitCompletions.length
      };
    }
    
    // ============================================
    // RESEARCH-SPECIFIC FEATURES
    // ============================================
    
    // RS1: Supervisor Meeting Prep
    function generateMeetingAgenda() {
      const pendingTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high');
      const agenda = {
        date: new Date().toISOString(),
        introduction: 'Progress update and decision points',
        topics: [],
        actionItems: [],
        questions: []
      };
      
      // Categorize tasks by topic
      const topics = {
        methodology: [],
        results: [],
        writing: [],
        other: []
      };
      
      pendingTasks.forEach(task => {
        const category = task.tags.includes('methodology') ? 'methodology' :
                        task.tags.includes('results') ? 'results' :
                        task.tags.includes('writing') ? 'writing' : 'other';
        topics[category].push(task);
      });
      
      // Generate agenda structure
      Object.keys(topics).forEach(category => {
        if (topics[category].length > 0) {
          agenda.topics.push({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            items: topics[category].map(t => t.title),
            timeEstimate: topics[category].length * 5 // 5 min per item
          });
        }
      });
      
      // Add supervisor questions
      agenda.questions = [
        'Variable selection approach (26 clean variables confirmed)',
        'Policy messaging tone (Utility Factor critique strength)',
        'Target journal selection',
        'Co-authorship decisions'
      ];
      
      return agenda;
    }
    
    // RS2: Paper Submission Tracker
    let submissions = [];
    
    function createSubmission(journal, title, date, version = 1) {
      const submission = {
        id: Date.now(),
        journal,
        title,
        date,
        version,
        status: 'submitted',
        reviewStatus: 'awaiting',
        decision: null,
        notes: '',
        createdAt: new Date().toISOString()
      };
      submissions.push(submission);
      saveSubmissions();
      return submission;
    }
    
    function updateSubmissionStatus(submissionId, status, reviewStatus = null, decision = null) {
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        submission.status = status;
        if (reviewStatus) submission.reviewStatus = reviewStatus;
        if (decision) submission.decision = decision;
        submission.updatedAt = new Date().toISOString();
        saveSubmissions();
      }
    }
    
    function saveSubmissions() {
      localStorage.setItem('submissions', JSON.stringify(submissions));
    }
    
    function loadSubmissions() {
      const saved = localStorage.getItem('submissions');
      if (saved) {
        submissions = JSON.parse(saved);
      }
    }
    
    // RS3: Data Provenance Tracker
    let provenanceGraph = {
      nodes: [],
      edges: []
    };
    
