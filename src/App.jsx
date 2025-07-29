import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Trash2, Calendar, AlertCircle, Sparkles, Zap, Star, Moon, Sun, Mail, Bell, Settings } from 'lucide-react';

const TaskReminderApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [particles, setParticles] = useState([]);
  
  // Notification settings
  const [userEmail, setUserEmail] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: false,
    browserNotifications: false,
    reminderMinutes: 15 // remind 15 minutes before task time
  });
  const [showSettings, setShowSettings] = useState(false);

  // Initialize particles
  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)]
      });
    }
    setParticles(particleArray);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update clock every second and check for task reminders
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkTaskReminders();
    }, 1000);
    return () => clearInterval(timer);
  }, [tasks, notificationSettings]);

  // Initialize data from memory on component mount
  useEffect(() => {
    const savedTasks = JSON.parse(sessionStorage.getItem('taskReminder') || '[]');
    const savedEmail = sessionStorage.getItem('userEmail') || '';
    const savedSettings = JSON.parse(sessionStorage.getItem('notificationSettings') || '{"emailEnabled": false, "browserNotifications": false, "reminderMinutes": 15}');
    
    setTasks(savedTasks);
    setUserEmail(savedEmail);
    setNotificationSettings(savedSettings);
    checkTodayTasks(savedTasks);
  }, []);

  // Save data to memory whenever it changes
  useEffect(() => {
    sessionStorage.setItem('taskReminder', JSON.stringify(tasks));
    checkTodayTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    sessionStorage.setItem('userEmail', userEmail);
  }, [userEmail]);

  useEffect(() => {
    sessionStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Check for task reminders
  const checkTaskReminders = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    tasks.forEach(task => {
      if (!task.completed && task.date === currentDate) {
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskTime = hours * 60 + minutes;
        const timeDiff = taskTime - currentTime;

        // Check if it's time for reminder (within the reminder window)
        if (timeDiff <= notificationSettings.reminderMinutes && timeDiff > 0) {
          if (!task.reminderSent) {
            sendTaskReminder(task);
            // Mark reminder as sent to avoid duplicate notifications
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id ? { ...t, reminderSent: true } : t
              )
            );
          }
        }
      }
    });
  };

  // Send task reminder via email and/or browser notification
  const sendTaskReminder = async (task) => {
    const reminderMessage = `⚡ URGENT REMINDER: Your task "${task.title}" is scheduled for ${task.time} today!`;

    // Browser notification
    if (notificationSettings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🔥 ChronoTasks Reminder', {
        body: reminderMessage,
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRkQ3MDAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+Cjxwb2x5bGluZSBwb2ludHM9IjEyLDYgMTIsMTIgMTYsMTQiLz4KPC9zdmc+Cjwvc3ZnPg==',
        tag: `task-${task.id}`,
        requireInteraction: true
      });
    }

    // Email notification (simulated - in real app, you'd use EmailJS or similar service)
    if (notificationSettings.emailEnabled && userEmail) {
      try {
        // Simulate email sending
        console.log(`📧 Email sent to ${userEmail}:`, reminderMessage);
        
        // Show success message
        showTemporaryMessage('📧 Reminder email sent successfully!', 'success');
        
        // In a real implementation, you would use EmailJS like this:
        /*
        await emailjs.send(
          'YOUR_SERVICE_ID',
          'YOUR_TEMPLATE_ID',
          {
            to_email: userEmail,
            subject: '🔥 ChronoTasks Reminder',
            message: reminderMessage,
            task_title: task.title,
            task_time: task.time,
            task_date: task.date
          },
          'YOUR_PUBLIC_KEY'
        );
        */
      } catch (error) {
        console.error('Failed to send email:', error);
        showTemporaryMessage('❌ Failed to send email reminder', 'error');
      }
    }
  };

  // Show temporary message
  const showTemporaryMessage = (message, type = 'info') => {
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 left-4 z-50 p-4 rounded-lg text-white font-bold ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } shadow-lg animate-bounce`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 3000);
  };

  // Send immediate email for incomplete tasks
  const sendTaskSummaryEmail = () => {
    if (!userEmail) {
      alert('Please set your email address in settings first!');
      setShowSettings(true);
      return;
    }

    const incompleteTasks = tasks.filter(task => !task.completed);
    if (incompleteTasks.length === 0) {
      showTemporaryMessage('🎉 All tasks completed! No reminders needed.', 'success');
      return;
    }

    const emailContent = `
🔥 URGENT: You have ${incompleteTasks.length} incomplete task(s)!

${incompleteTasks.map(task => 
  `⚡ ${task.title}\n📅 ${new Date(task.date).toLocaleDateString()} at ${task.time}\n`
).join('\n')}

Don't let your dreams slip away! Complete these tasks and achieve greatness! 🌟
    `;

    // Simulate email sending
    console.log(`📧 Summary email sent to ${userEmail}:`, emailContent);
    showTemporaryMessage('📧 Task summary email sent!', 'success');
  };

  // Check for today's tasks and show notification
  const checkTodayTasks = (taskList) => {
    const today = new Date().toISOString().split('T')[0];
    const tasksForToday = taskList.filter(task => 
      task.date === today && !task.completed
    );
    setTodayTasks(tasksForToday);
    
    if (tasksForToday.length > 0) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 15000);
    }
  };

  // Add new task
  const addTask = () => {
    if (newTask.title.trim() && newTaskDate && newTaskTime) {
      const task = {
        id: Date.now(),
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        date: newTaskDate,
        time: newTaskTime,
        completed: false,
        createdAt: new Date().toISOString(),
        reminderSent: false
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '' });
      setNewTaskDate('');
      setNewTaskTime('');
    }
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed, reminderSent: false } : task
    ));
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Get tasks by date
  const getTasksByDate = () => {
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    return grouped;
  };

  // Clock calculations
  const getClockRotation = () => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    return {
      hour: (hours * 30) + (minutes * 0.5),
      minute: minutes * 6,
      second: seconds * 6
    };
  };

  const rotation = getClockRotation();
  const tasksByDate = getTasksByDate();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden relative">
      {/* Animated Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              animation: `float ${particle.speed + 3}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-yellow-400/30 rounded-full animate-spin-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-pink-400/30 transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 border-4 border-cyan-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 border-4 border-green-400/30 transform rotate-12 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
      </div>

      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-cyan-400/10 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/5 to-transparent animate-pulse delay-1000"></div>
      </div>

      {/* Notification Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          title="Notification Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
        
        <button
          onClick={sendTaskSummaryEmail}
          className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg"
          title="Send Task Summary Email"
        >
          <Mail className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-20 left-4 z-50 w-80 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-500/30 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" />
            Notification Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">Email Address:</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-300 border border-purple-400/30 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Email Notifications</span>
              <button
                onClick={() => setNotificationSettings({...notificationSettings, emailEnabled: !notificationSettings.emailEnabled})}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  notificationSettings.emailEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                  notificationSettings.emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Browser Notifications</span>
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                      setNotificationSettings({...notificationSettings, browserNotifications: !notificationSettings.browserNotifications});
                    } else {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          setNotificationSettings({...notificationSettings, browserNotifications: true});
                        }
                      });
                    }
                  }
                }}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  notificationSettings.browserNotifications ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                  notificationSettings.browserNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold">Remind me (minutes before):</label>
              <select
                value={notificationSettings.reminderMinutes}
                onChange={(e) => setNotificationSettings({...notificationSettings, reminderMinutes: parseInt(e.target.value)})}
                className="w-full p-3 rounded-xl bg-white/10 text-white border border-purple-400/30 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-6 p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Today's Tasks Notification */}
      {showNotification && todayTasks.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-gradient-to-br from-orange-500/90 to-pink-600/90 text-white p-6 rounded-3xl shadow-2xl border-2 border-gold/30 backdrop-blur-xl animate-bounce">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <AlertCircle className="w-8 h-8 text-yellow-300 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="font-bold text-xl">⚡ URGENT MISSIONS! ⚡</h3>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-auto text-white/80 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-3 font-semibold">🎯 {todayTasks.length} critical task{todayTasks.length > 1 ? 's' : ''} awaiting completion:</p>
            {todayTasks.slice(0, 3).map(task => (
              <div key={task.id} className="text-sm bg-white/20 rounded-2xl p-3 mb-2 border border-white/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="font-medium">{task.title}</span>
                </div>
                <div className="text-xs text-yellow-100 mt-1">📅 {task.time}</div>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <p className="text-sm text-yellow-200 font-semibold">🔥 Plus {todayTasks.length - 3} more burning tasks!</p>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Vintage Clock Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            {/* Vintage Clock */}
            <div className="relative w-80 h-80 mx-auto">
              {/* Clock Outer Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 shadow-2xl border-8 border-yellow-500/50">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100 shadow-inner">
                  {/* Clock Numbers */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i + 1) * 30;
                    const radian = (angle - 90) * (Math.PI / 180);
                    const x = Math.cos(radian) * 120;
                    const y = Math.sin(radian) * 120;
                    return (
                      <div
                        key={i}
                        className="absolute w-8 h-8 flex items-center justify-center text-2xl font-bold text-amber-900"
                        style={{
                          left: `calc(50% + ${x}px - 16px)`,
                          top: `calc(50% + ${y}px - 16px)`,
                        }}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                  
                  {/* Hour Markers */}
                  {[...Array(12)].map((_, i) => {
                    const angle = i * 30;
                    return (
                      <div
                        key={i}
                        className="absolute w-1 h-6 bg-amber-800 rounded-full origin-bottom"
                        style={{
                          left: '50%',
                          top: '12px',
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                        }}
                      />
                    );
                  })}
                  
                  {/* Minute Markers */}
                  {[...Array(60)].map((_, i) => {
                    if (i % 5 !== 0) {
                      const angle = i * 6;
                      return (
                        <div
                          key={i}
                          className="absolute w-0.5 h-3 bg-amber-600 rounded-full origin-bottom"
                          style={{
                            left: '50%',
                            top: '16px',
                            transform: `translateX(-50%) rotate(${angle}deg)`,
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {/* Clock Hands */}
                  {/* Hour Hand */}
                  <div
                    className="absolute w-1.5 bg-amber-900 rounded-full origin-bottom shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      height: '80px',
                      transform: `translateX(-50%) translateY(-100%) rotate(${rotation.hour}deg)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  />
                  
                  {/* Minute Hand */}
                  <div
                    className="absolute w-1 bg-amber-800 rounded-full origin-bottom shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      height: '100px',
                      transform: `translateX(-50%) translateY(-100%) rotate(${rotation.minute}deg)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  />
                  
                  {/* Second Hand */}
                  <div
                    className="absolute w-0.5 bg-red-600 rounded-full origin-bottom shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      height: '110px',
                      transform: `translateX(-50%) translateY(-100%) rotate(${rotation.second}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />
                  
                  {/* Center Dot */}
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-amber-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                </div>
              </div>
              
              {/* Glowing Ring Effect */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 blur-xl animate-pulse"></div>
            </div>
            
            {/* Digital Time Display */}
            <div className="mt-6 bg-gradient-to-r from-amber-900/80 to-yellow-900/80 backdrop-blur-xl rounded-3xl px-8 py-4 border-2 border-yellow-500/30">
              <div className="text-4xl font-mono font-bold text-yellow-100 tracking-wider">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-lg text-yellow-200/80 font-semibold">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          {/* Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Moon className="w-12 h-12 text-blue-400 animate-pulse" />
            <h1 className="text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              ChronoTasks
            </h1>
            <Sun className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-2xl text-gray-300 font-light italic">
            ✨ Where Time Meets Purpose ✨
          </p>
        </div>

        {/* Add Task Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-blue-900/60 backdrop-blur-2xl rounded-3xl p-10 border-2 border-purple-500/30 shadow-2xl relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="relative">
                  <Plus className="w-10 h-10 text-green-400 animate-bounce" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                Forge New Destiny
              </h2>
              
              <div className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && newTaskDate && newTaskTime && addTask()}
                    placeholder="🎯 Enter your task title here..."
                    className="w-full p-6 rounded-2xl bg-white/20 text-white placeholder-gray-400 border-2 border-purple-400/30 focus:border-pink-400 focus:bg-white/30 focus:ring-4 focus:ring-pink-400/20 outline-none transition-all duration-300 text-lg backdrop-blur-sm relative z-10"
                    style={{ WebkitAppearance: 'none' }}
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="📝 Add task description (optional)..."
                    rows={3}
                    className="w-full p-6 rounded-2xl bg-white/20 text-white placeholder-gray-400 border-2 border-blue-400/30 focus:border-cyan-400 focus:bg-white/30 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 text-base backdrop-blur-sm resize-none relative z-10"
                    style={{ WebkitAppearance: 'none' }}
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full p-6 pl-14 rounded-2xl bg-white/10 text-white border-2 border-blue-400/30 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-500 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-400" />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full p-6 pl-14 rounded-2xl bg-white/10 text-white border-2 border-orange-400/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all duration-500 backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <button
                  onClick={addTask}
                  className="w-full p-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold rounded-2xl hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 text-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Sparkles className="w-8 h-8 animate-spin" />
                  Manifest Task Into Reality! 
                  <Zap className="w-8 h-8 animate-pulse" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="max-w-5xl mx-auto">
          {Object.keys(tasksByDate).length === 0 ? (
            <div className="text-center text-gray-300 py-20">
              <div className="relative mb-8">
                <Clock className="w-40 h-40 mx-auto opacity-30 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="w-16 h-16 text-yellow-400 animate-spin" />
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Your Canvas Awaits!
              </h3>
              <p className="text-xl italic">Begin your journey by creating your first masterpiece above 🎨</p>
            </div>
          ) : (
            Object.entries(tasksByDate)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([date, dateTasks]) => (
                <div key={date} className="mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <Calendar className="w-8 h-8 text-purple-400" />
                      {date === today && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">
                      {date === today ? '🔥 TODAY\'S QUEST' : new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex-1 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent rounded-full"></div>
                  </div>
                  
                  <div className="grid gap-6">
                    {dateTasks
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(task => (
                        <div
                          key={task.id}
                          className={`p-8 rounded-3xl border-2 transition-all duration-500 transform hover:scale-102 relative overflow-hidden group ${
                            task.completed
                              ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-400/50 backdrop-blur-xl'
                              : date === today
                              ? 'bg-gradient-to-r from-orange-900/40 via-red-900/40 to-pink-900/40 border-orange-400/50 backdrop-blur-xl shadow-2xl'
                              : 'bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border-purple-400/30 backdrop-blur-xl'
                          }`}
                        >
                          {/* Animated Background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-6 flex-1">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative ${
                                  task.completed
                                    ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50'
                                    : 'border-gray-400 hover:border-green-400 hover:bg-green-400/20 hover:shadow-lg hover:shadow-green-400/30'
                                }`}
                              >
                                {task.completed && <CheckCircle className="w-7 h-7" />}
                                {!task.completed && (
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <h4 className={`text-2xl font-bold transition-all duration-500 ${
                                  task.completed 
                                    ? 'text-gray-400 line-through' 
                                    : 'text-white drop-shadow-lg'
                                }`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className={`text-base mt-1 transition-all duration-500 ${
                                    task.completed 
                                      ? 'text-gray-500 line-through' 
                                      : 'text-gray-300'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-lg text-gray-300 mt-2">
                                  <Clock className="w-5 h-5 text-blue-400" />
                                  <span className="font-semibold">{task.time}</span>
                                  {date === today && !task.completed && (
                                    <div className="flex items-center gap-2">
                                      <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                                        ⚡ ACTIVE MISSION
                                      </span>
                                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                    </div>
                                  )}
                                  {task.reminderSent && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Bell className="w-4 h-4 text-yellow-400" />
                                      <span className="text-yellow-400">Reminded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-4 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-2xl transition-all duration-500 hover:shadow-lg hover:shadow-red-400/30"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Mystical Stats Footer */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-2xl rounded-3xl p-8 border-2 border-purple-500/30 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">{tasks.length}</div>
                <div className="text-lg text-gray-300">Total Quests</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{tasks.filter(t => t.completed).length}</div>
                <div className="text-lg text-gray-300">Conquered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">{tasks.filter(t => !t.completed).length}</div>
                <div className="text-lg text-gray-300">Awaiting Glory</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{todayTasks.length}</div>
                <div className="text-lg text-gray-300">Today's Focus</div>
              </div>
            </div>
            <div className="mt-6 text-xl text-gray-300 italic flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              Time is the canvas, tasks are your masterpiece!
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            
            {/* Notification Status */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                notificationSettings.emailEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                <Mail className="w-4 h-4" />
                <span>Email {notificationSettings.emailEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                notificationSettings.browserNotifications ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                <Bell className="w-4 h-4" />
                <span>Browser {notificationSettings.browserNotifications ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TaskReminderApp;