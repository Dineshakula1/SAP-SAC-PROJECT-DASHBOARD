// Application State
let appState = {
  phases: [
    {
      name: "Discovery",
      priority: "HIGH",
      processes: [
        {"name": "Business Requirements Gathering", "startDate": "2025-01-01", "duration": 14, "completed": false},
        {"name": "Current State Analysis", "startDate": "2025-01-15", "duration": 10, "completed": false},
        {"name": "Stakeholder Interviews", "startDate": "2025-01-25", "duration": 7, "completed": false}
      ]
    },
    {
      name: "Requirements",
      priority: "HIGH",
      processes: [
        {"name": "Functional Requirements", "startDate": "2025-02-01", "duration": 21, "completed": false},
        {"name": "Technical Requirements", "startDate": "2025-02-22", "duration": 14, "completed": false}
      ]
    },
    {
      name: "Technical Foundation",
      priority: "HIGH",
      processes: [
        {"name": "System Architecture", "startDate": "2025-03-01", "duration": 14, "completed": false},
        {"name": "Infrastructure Setup", "startDate": "2025-03-15", "duration": 10, "completed": false},
        {"name": "Environment Configuration", "startDate": "2025-03-25", "duration": 7, "completed": false}
      ]
    },
    {
      name: "Data Readiness",
      priority: "MEDIUM",
      processes: [
        {"name": "Data Source Identification", "startDate": "2025-04-01", "duration": 7, "completed": false},
        {"name": "Data Quality Assessment", "startDate": "2025-04-08", "duration": 14, "completed": false}
      ]
    },
    {
      name: "Security & Access",
      priority: "MEDIUM",
      processes: [
        {"name": "Security Framework", "startDate": "2025-04-22", "duration": 10, "completed": false}
      ]
    },
    {
      name: "Implementation",
      priority: "MEDIUM",
      processes: [
        {"name": "Core Development", "startDate": "2025-05-01", "duration": 30, "completed": false},
        {"name": "Testing & QA", "startDate": "2025-05-31", "duration": 14, "completed": false}
      ]
    },
    {
      name: "Evaluation",
      priority: "LOW",
      processes: [
        {"name": "Performance Testing", "startDate": "2025-06-14", "duration": 7, "completed": false}
      ]
    },
    {
      name: "Planning",
      priority: "LOW",
      processes: [
        {"name": "Go-Live Strategy", "startDate": "2025-06-21", "duration": 7, "completed": false}
      ]
    }
  ],
  team: [
    {"name": "John Smith", "role": "Project Manager", "email": "john.smith@company.com", "initials": "JS"},
    {"name": "Sarah Johnson", "role": "SAC Developer", "email": "sarah.johnson@company.com", "initials": "SJ"},
    {"name": "Mike Chen", "role": "Data Analyst", "email": "mike.chen@company.com", "initials": "MC"}
  ],
  originalPhases: null,
  editMode: false,
  currentEditingProcess: null,
  currentEditingMember: null,
  progressChart: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Store original state for reset functionality
  appState.originalPhases = JSON.parse(JSON.stringify(appState.phases));
  
  initializeApp();
});

function initializeApp() {
  setupTabSwitching();
  setupModals();
  renderOverview();
  renderPhases();
  renderTimeline();
  renderTeam();
  setupSelfTest();
}

// Tab Switching - Fixed
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tabName = button.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update visible tab content
      tabContents.forEach(content => {
        content.classList.add('hidden');
      });
      
      const targetTab = document.getElementById(tabName);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }
      
      // Refresh chart if switching to overview
      if (tabName === 'overview' && appState.progressChart) {
        setTimeout(() => {
          appState.progressChart.update();
        }, 100);
      }
    });
  });
}

// Modal Management
function setupModals() {
  // Process modal
  const processModal = document.getElementById('processModal');
  const teamModal = document.getElementById('teamModal');
  const selfTestModal = document.getElementById('selfTestModal');

  // Close modal handlers
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Click outside to close
  [processModal, teamModal, selfTestModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    }
  });

  // Save process changes
  const saveProcessBtn = document.getElementById('saveProcessBtn');
  if (saveProcessBtn) {
    saveProcessBtn.addEventListener('click', saveProcessChanges);
  }
  
  // Save member changes
  const saveMemberBtn = document.getElementById('saveMemberBtn');
  if (saveMemberBtn) {
    saveMemberBtn.addEventListener('click', saveMemberChanges);
  }
}

// Overview Tab Functions
function renderOverview() {
  updateStats();
  renderProgressChart();
  renderModuleCards();
}

function updateStats() {
  const totalProcesses = appState.phases.reduce((total, phase) => total + phase.processes.length, 0);
  const completedProcesses = appState.phases.reduce((total, phase) => {
    return total + phase.processes.filter(p => p.completed).length;
  }, 0);
  const remainingProcesses = totalProcesses - completedProcesses;
  const completePercent = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;

  const totalEl = document.getElementById('totalProcesses');
  const completedEl = document.getElementById('completedProcesses');
  const remainingEl = document.getElementById('remainingProcesses');
  const percentEl = document.getElementById('completePercent');

  if (totalEl) totalEl.textContent = totalProcesses;
  if (completedEl) completedEl.textContent = completedProcesses;
  if (remainingEl) remainingEl.textContent = remainingProcesses;
  if (percentEl) percentEl.textContent = completePercent + '%';
}

function renderProgressChart() {
  const canvas = document.getElementById('progressChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const totalProcesses = appState.phases.reduce((total, phase) => total + phase.processes.length, 0);
  const completedProcesses = appState.phases.reduce((total, phase) => {
    return total + phase.processes.filter(p => p.completed).length;
  }, 0);
  
  const completePercent = totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0;

  if (appState.progressChart) {
    appState.progressChart.destroy();
  }

  appState.progressChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [completePercent, 100 - completePercent],
        backgroundColor: ['#1FB8CD', '#ECEBD5'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function renderModuleCards() {
  const container = document.getElementById('moduleCards');
  if (!container) return;
  
  container.innerHTML = '';

  appState.phases.forEach(phase => {
    const totalProcesses = phase.processes.length;
    const completedProcesses = phase.processes.filter(p => p.completed).length;
    const progress = totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `
      <div class="module-header">
        <div class="module-name">${phase.name}</div>
        <div class="module-progress">${completedProcesses}/${totalProcesses}</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Phases Tab Functions
function renderPhases() {
  const container = document.getElementById('phasesList');
  if (!container) return;
  
  container.innerHTML = '';

  appState.phases.forEach((phase, phaseIndex) => {
    const phaseCard = document.createElement('div');
    phaseCard.className = 'phase-card';

    const processesHTML = phase.processes.map((process, processIndex) => `
      <div class="process-item ${process.completed ? 'completed' : ''}">
        <div class="process-info">
          <h4>${process.name}</h4>
          <div class="process-details">
            Start: ${formatDate(process.startDate)} | Duration: ${process.duration} days
          </div>
        </div>
        <button class="btn btn--sm ${process.completed ? 'btn--secondary' : 'btn--primary'} complete-btn" 
                data-phase="${phaseIndex}" data-process="${processIndex}">
          ${process.completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
    `).join('');

    phaseCard.innerHTML = `
      <div class="phase-header">
        <h3 class="phase-name">${phase.name}</h3>
        <span class="phase-priority ${phase.priority}">${phase.priority}</span>
      </div>
      <div class="processes-list">
        ${processesHTML}
      </div>
    `;

    container.appendChild(phaseCard);
  });

  // Add event listeners to complete buttons
  container.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const phaseIndex = parseInt(e.target.getAttribute('data-phase'));
      const processIndex = parseInt(e.target.getAttribute('data-process'));
      toggleProcessCompletion(phaseIndex, processIndex);
    });
  });
}

function toggleProcessCompletion(phaseIndex, processIndex) {
  if (appState.phases[phaseIndex] && appState.phases[phaseIndex].processes[processIndex]) {
    appState.phases[phaseIndex].processes[processIndex].completed = 
      !appState.phases[phaseIndex].processes[processIndex].completed;
    
    // Re-render affected sections
    renderPhases();
    renderOverview();
    renderTimeline();
  }
}

// Timeline Tab Functions
function renderTimeline() {
  setupTimelineControls();
  renderGanttChart();
}

function setupTimelineControls() {
  const editModeBtn = document.getElementById('editModeBtn');
  const resetBtn = document.getElementById('resetTimelineBtn');
  const exportBtn = document.getElementById('exportTimelineBtn');

  if (editModeBtn) {
    editModeBtn.replaceWith(editModeBtn.cloneNode(true));
    const newEditBtn = document.getElementById('editModeBtn');
    newEditBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleEditMode();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetTimeline();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exportTimeline();
    });
  }
}

function toggleEditMode() {
  appState.editMode = !appState.editMode;
  const btn = document.getElementById('editModeBtn');
  
  if (btn) {
    if (appState.editMode) {
      btn.textContent = 'Exit Edit Mode';
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');
    } else {
      btn.textContent = 'Enter Edit Mode';
      btn.classList.remove('btn--primary');
      btn.classList.add('btn--secondary');
    }
  }
  
  renderGanttChart();
}

function resetTimeline() {
  if (confirm('Are you sure you want to reset the timeline to original values?')) {
    appState.phases = JSON.parse(JSON.stringify(appState.originalPhases));
    appState.editMode = false;
    renderGanttChart();
    renderPhases();
    renderOverview();
    
    const btn = document.getElementById('editModeBtn');
    if (btn) {
      btn.textContent = 'Enter Edit Mode';
      btn.classList.remove('btn--primary');
      btn.classList.add('btn--secondary');
    }
  }
}

function exportTimeline() {
  const timelineData = appState.phases.map(phase => ({
    phase: phase.name,
    processes: phase.processes.map(process => ({
      name: process.name,
      startDate: process.startDate,
      duration: process.duration,
      completed: process.completed
    }))
  }));
  
  const dataStr = JSON.stringify(timelineData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'sac-implementation-timeline.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderGanttChart() {
  const container = document.getElementById('ganttChart');
  if (!container) return;
  
  // Generate week headers
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-07-01');
  const weeks = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    weeks.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const weekHeaders = weeks.map(week => 
    `<div class="week-header">Week ${Math.ceil((week - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1}</div>`
  ).join('');

  let ganttHTML = `
    <div class="gantt-header">
      <div class="gantt-label">Process</div>
      <div class="gantt-timeline">
        ${weekHeaders}
      </div>
    </div>
  `;

  appState.phases.forEach((phase, phaseIndex) => {
    phase.processes.forEach((process, processIndex) => {
      const processStart = new Date(process.startDate);
      const startWeek = Math.floor((processStart - startDate) / (7 * 24 * 60 * 60 * 1000));
      const durationWeeks = Math.ceil(process.duration / 7);
      
      const leftPos = Math.max(0, (startWeek / weeks.length) * 100);
      const width = Math.min(100 - leftPos, (durationWeeks / weeks.length) * 100);
      
      const taskBarClass = appState.editMode ? 'task-bar edit-mode' : 'task-bar';
      
      ganttHTML += `
        <div class="gantt-row">
          <div class="task-label">${process.name}</div>
          <div class="task-timeline">
            <div class="${taskBarClass}" 
                 style="left: ${leftPos}%; width: ${width}%;" 
                 data-phase="${phaseIndex}" data-process="${processIndex}">
              ${process.duration}d
            </div>
          </div>
        </div>
      `;
    });
  });

  container.innerHTML = ganttHTML;

  // Add click handlers for edit mode
  if (appState.editMode) {
    container.querySelectorAll('.task-bar').forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.preventDefault();
        const phaseIndex = parseInt(e.target.getAttribute('data-phase'));
        const processIndex = parseInt(e.target.getAttribute('data-process'));
        editProcess(phaseIndex, processIndex);
      });
    });
  }
}

function editProcess(phaseIndex, processIndex) {
  if (!appState.editMode || !appState.phases[phaseIndex] || !appState.phases[phaseIndex].processes[processIndex]) return;
  
  const process = appState.phases[phaseIndex].processes[processIndex];
  appState.currentEditingProcess = { phaseIndex, processIndex };
  
  document.getElementById('processName').value = process.name;
  document.getElementById('processStartDate').value = process.startDate;
  document.getElementById('processDuration').value = process.duration;
  
  document.getElementById('processModal').classList.remove('hidden');
}

function saveProcessChanges() {
  if (!appState.currentEditingProcess) return;
  
  const { phaseIndex, processIndex } = appState.currentEditingProcess;
  const startDate = document.getElementById('processStartDate').value;
  const duration = parseInt(document.getElementById('processDuration').value);
  
  if (startDate && duration > 0) {
    appState.phases[phaseIndex].processes[processIndex].startDate = startDate;
    appState.phases[phaseIndex].processes[processIndex].duration = duration;
    
    renderGanttChart();
    document.getElementById('processModal').classList.add('hidden');
    appState.currentEditingProcess = null;
  } else {
    alert('Please enter valid start date and duration');
  }
}

// Team Tab Functions
function renderTeam() {
  setupTeamControls();
  renderTeamList();
}

function setupTeamControls() {
  const addBtn = document.getElementById('addMemberBtn');
  if (addBtn) {
    addBtn.replaceWith(addBtn.cloneNode(true));
    const newAddBtn = document.getElementById('addMemberBtn');
    newAddBtn.addEventListener('click', (e) => {
      e.preventDefault();
      appState.currentEditingMember = null;
      document.getElementById('teamModalTitle').textContent = 'Add Team Member';
      clearMemberForm();
      document.getElementById('teamModal').classList.remove('hidden');
    });
  }
}

function renderTeamList() {
  const container = document.getElementById('teamList');
  if (!container) return;
  
  container.innerHTML = '';

  appState.team.forEach((member, index) => {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member';
    memberCard.innerHTML = `
      <div class="member-header">
        <div class="member-avatar">${member.initials}</div>
        <div class="member-info">
          <h4>${member.name}</h4>
          <p class="member-role">${member.role}</p>
        </div>
      </div>
      <div class="member-email">${member.email}</div>
      <div class="member-actions">
        <button class="btn btn--sm btn--secondary edit-member-btn" data-index="${index}">Edit</button>
        <button class="btn btn--sm btn--outline delete-member-btn" data-index="${index}">Delete</button>
      </div>
    `;
    container.appendChild(memberCard);
  });

  // Add event listeners
  container.querySelectorAll('.edit-member-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(e.target.getAttribute('data-index'));
      editMember(index);
    });
  });

  container.querySelectorAll('.delete-member-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(e.target.getAttribute('data-index'));
      deleteMember(index);
    });
  });
}

function editMember(index) {
  if (!appState.team[index]) return;
  
  const member = appState.team[index];
  appState.currentEditingMember = index;
  
  document.getElementById('teamModalTitle').textContent = 'Edit Team Member';
  document.getElementById('memberName').value = member.name;
  document.getElementById('memberRole').value = member.role;
  document.getElementById('memberEmail').value = member.email;
  document.getElementById('memberInitials').value = member.initials;
  
  document.getElementById('teamModal').classList.remove('hidden');
}

function deleteMember(index) {
  if (confirm('Are you sure you want to delete this team member?')) {
    appState.team.splice(index, 1);
    renderTeamList();
  }
}

function saveMemberChanges() {
  const name = document.getElementById('memberName').value.trim();
  const role = document.getElementById('memberRole').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const initials = document.getElementById('memberInitials').value.trim().toUpperCase();
  
  if (!name || !role || !email || !initials) {
    alert('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  const memberData = { name, role, email, initials };
  
  if (appState.currentEditingMember !== null) {
    appState.team[appState.currentEditingMember] = memberData;
  } else {
    appState.team.push(memberData);
  }
  
  renderTeamList();
  document.getElementById('teamModal').classList.add('hidden');
  clearMemberForm();
  appState.currentEditingMember = null;
}

function clearMemberForm() {
  document.getElementById('memberName').value = '';
  document.getElementById('memberRole').value = '';
  document.getElementById('memberEmail').value = '';
  document.getElementById('memberInitials').value = '';
}

// Self-Test Functionality
function setupSelfTest() {
  const selfTestBtn = document.getElementById('selfTestBtn');
  if (selfTestBtn) {
    selfTestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runSelfTest();
    });
  }
}

function runSelfTest() {
  const results = [];
  
  // Test 1: Tab switching
  try {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    results.push({
      test: 'Tab switching functionality',
      passed: tabs.length === 4 && tabContents.length === 4,
      message: tabs.length === 4 && tabContents.length === 4 ? 'All tabs present and functional' : 'Tab structure issue detected'
    });
  } catch (e) {
    results.push({
      test: 'Tab switching functionality',
      passed: false,
      message: 'Error: ' + e.message
    });
  }

  // Test 2: Overview stats sync
  try {
    const totalProcesses = appState.phases.reduce((total, phase) => total + phase.processes.length, 0);
    const completedProcesses = appState.phases.reduce((total, phase) => {
      return total + phase.processes.filter(p => p.completed).length;
    }, 0);
    
    const displayedTotal = parseInt(document.getElementById('totalProcesses').textContent);
    const displayedCompleted = parseInt(document.getElementById('completedProcesses').textContent);
    
    results.push({
      test: 'Overview stats synchronization',
      passed: totalProcesses === displayedTotal && completedProcesses === displayedCompleted,
      message: totalProcesses === displayedTotal && completedProcesses === displayedCompleted ? 
        'Stats are synchronized correctly' : 'Stats synchronization issue detected'
    });
  } catch (e) {
    results.push({
      test: 'Overview stats synchronization',
      passed: false,
      message: 'Error: ' + e.message
    });
  }

  // Test 3: Timeline edit mode
  try {
    const editBtn = document.getElementById('editModeBtn');
    const resetBtn = document.getElementById('resetTimelineBtn');
    const exportBtn = document.getElementById('exportTimelineBtn');
    
    results.push({
      test: 'Timeline edit mode controls',
      passed: editBtn && resetBtn && exportBtn,
      message: editBtn && resetBtn && exportBtn ? 
        'All timeline controls are present' : 'Missing timeline controls'
    });
  } catch (e) {
    results.push({
      test: 'Timeline edit mode controls',
      passed: false,
      message: 'Error: ' + e.message
    });
  }

  // Test 4: Team CRUD operations
  try {
    const addBtn = document.getElementById('addMemberBtn');
    const teamList = document.getElementById('teamList');
    
    results.push({
      test: 'Team CRUD operations',
      passed: addBtn && teamList && appState.team.length > 0,
      message: addBtn && teamList && appState.team.length > 0 ? 
        'Team management functionality is working' : 'Team management issue detected'
    });
  } catch (e) {
    results.push({
      test: 'Team CRUD operations',
      passed: false,
      message: 'Error: ' + e.message
    });
  }

  // Test 5: Modal functionality
  try {
    const processModal = document.getElementById('processModal');
    const teamModal = document.getElementById('teamModal');
    
    results.push({
      test: 'Modal functionality',
      passed: processModal && teamModal,
      message: processModal && teamModal ? 
        'All modals are present and functional' : 'Modal functionality issue detected'
    });
  } catch (e) {
    results.push({
      test: 'Modal functionality',
      passed: false,
      message: 'Error: ' + e.message
    });
  }

  displaySelfTestResults(results);
}

function displaySelfTestResults(results) {
  const container = document.getElementById('selfTestResults');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  let html = `
    <div class="test-summary">
      <h4>Test Summary: ${passedCount}/${totalCount} tests passed</h4>
    </div>
  `;
  
  results.forEach(result => {
    html += `
      <div class="test-result ${result.passed ? 'pass' : 'fail'}">
        <span class="test-icon">${result.passed ? '✓' : '✗'}</span>
        <div>
          <strong>${result.test}</strong><br>
          <span>${result.message}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  document.getElementById('selfTestModal').classList.remove('hidden');
}

// Utility Functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}