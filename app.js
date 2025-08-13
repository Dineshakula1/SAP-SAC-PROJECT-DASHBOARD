document.addEventListener('DOMContentLoaded', function() {
  class SACTracker {
    constructor() {
      this.data = { phases: [], team: [] };
      this.editMode = false;
      this.currentEditingTask = null;
      this.currentEditingMember = null;
      this.init();
    }

    init() {
      this.loadData();
      this.setupEventListeners();
      this.renderAll();
      console.log('Initialized');
    }

    loadData() {
      const saved = localStorage.getItem('sacTrackerData');
      if (saved) {
        try {
          this.data = JSON.parse(saved);
        } catch {
          this.loadDefaultData();
        }
      } else {
        this.loadDefaultData();
      }
    }

    loadDefaultData() {
      this.data = {
        phases: [
          { name:"Discovery", priority:"HIGH", processes:[
            {id:1,name:"Business Requirements Gathering",startDate:"2025-01-01",duration:14,completed:false},
            {id:2,name:"Current State Analysis",startDate:"2025-01-15",duration:10,completed:false},
            {id:3,name:"Stakeholder Interviews",startDate:"2025-01-25",duration:7,completed:false}
          ]},
          { name:"Requirements", priority:"HIGH", processes:[
            {id:4,name:"Functional Requirements",startDate:"2025-02-01",duration:21,completed:false},
            {id:5,name:"Technical Requirements",startDate:"2025-02-22",duration:14,completed:false}
          ]},
          // ... other phases ...
        ],
        team: [
          {id:1,name:"John Smith",role:"Project Manager",email:"john.smith@company.com",initials:"JS"},
          {id:2,name:"Sarah Johnson",role:"SAC Developer",email:"sarah.johnson@company.com",initials:"SJ"},
          {id:3,name:"Mike Chen",role:"Data Analyst",email:"mike.chen@company.com",initials:"MC"}
        ]
      };
      // Store defaults for timeline reset
      localStorage.setItem('sacTrackerDefaults', JSON.stringify({ phases: this.data.phases }));
    }

    saveData() {
      localStorage.setItem('sacTrackerData', JSON.stringify(this.data));
    }

    setupEventListeners() {
      document.querySelectorAll('.nav__btn').forEach(btn => {
        btn.addEventListener('click', e => this.switchTab(e.target.dataset.tab));
      });
      document.getElementById('editModeBtn').addEventListener('click', () => this.toggleEditMode());
      document.getElementById('resetBtn').addEventListener('click', () => this.resetTimeline());
      document.getElementById('exportBtn').addEventListener('click', () => this.exportTimeline());
      document.getElementById('addMemberBtn').addEventListener('click', () => this.showMemberModal());
      document.getElementById('selfTestBtn').addEventListener('click', () => this.runSelfTest());
      // Modal buttons...
      document.getElementById('taskModalClose').onclick = () => this.hideTaskModal();
      document.getElementById('taskModalCancel').onclick = () => this.hideTaskModal();
      document.getElementById('taskModalSave').onclick = () => this.saveTaskEdit();
      document.getElementById('memberModalClose').onclick = () => this.hideMemberModal();
      document.getElementById('memberModalCancel').onclick = () => this.hideMemberModal();
      document.getElementById('memberModalSave').onclick = () => this.saveMemberEdit();
      document.querySelector('#taskEditModal .modal__backdrop').onclick = () => this.hideTaskModal();
      document.querySelector('#memberModal .modal__backdrop').onclick = () => this.hideMemberModal();
    }

    switchTab(tab) {
      document.querySelectorAll('.nav__btn').forEach(b => b.classList.remove('nav__btn--active'));
      document.querySelector(`[data-tab="${tab}"]`).classList.add('nav__btn--active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('tab-content--hidden'));
      document.getElementById(`${tab}-tab`).classList.remove('tab-content--hidden');
      if (tab === 'overview') this.renderOverview();
      if (tab === 'phases')  this.renderPhases();
      if (tab === 'timeline') this.renderTimeline();
      if (tab === 'team')    this.renderTeam();
    }

    renderAll() {
      this.renderOverview();
      this.renderPhases();
      this.renderTimeline();
      this.renderTeam();
    }

    renderOverview() { /* Unchanged */ }
    renderPhases()   { /* Unchanged */ }

    renderTimeline() {
      const container = document.getElementById('timelineContainer');
      container.innerHTML = '';
      const all = this.data.phases.flatMap(p => p.processes);
      const dates = all.map(p => new Date(p.startDate));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...all.map(p => {
        const s = new Date(p.startDate);
        return s.getTime() + p.duration * 86400000;
      })));
      const totalDays = Math.ceil((maxDate - minDate)/86400000) + 7;
      
      const grid = document.createElement('div');
      grid.className = 'timeline-grid';
      grid.style.position = 'relative';
      grid.style.minWidth = `${totalDays * 10}px`;

      // Calendar grid lines every 7 days
      for (let d = 0; d < totalDays; d += 7) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.left = `${(d/totalDays)*100}%`;
        line.style.top = '0';
        line.style.height = '100%';
        line.style.width = '1px';
        line.style.backgroundColor = 'rgba(255,255,255,0.1)';
        grid.appendChild(line);
      }

      this.data.phases.forEach(phase => {
        phase.processes.forEach(proc => {
          const row = document.createElement('div');
          row.className = 'timeline-row';
          const label = document.createElement('div');
          label.className = 'timeline-label';
          label.textContent = proc.name;
          const track = document.createElement('div');
          track.className = 'timeline-track';
          const bar = document.createElement('div');
          bar.className = `timeline-bar${this.editMode?' timeline-bar--editable':''}`;
          const startOffset = Math.ceil((new Date(proc.startDate) - minDate)/86400000);
          bar.style.left  = `${(startOffset/totalDays)*100}%`;
          bar.style.width = `${(proc.duration/totalDays)*100}%`;
          bar.textContent = `${proc.duration}d`;
          if (this.editMode) bar.onclick = () => this.showTaskModal(proc);
          track.appendChild(bar);
          grid.appendChild(row);
          row.appendChild(label);
          row.appendChild(track);
        });
      });

      container.appendChild(grid);
    }

    toggleEditMode() {
      this.editMode = !this.editMode;
      const btn = document.getElementById('editModeBtn');
      btn.textContent = this.editMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
      this.renderTimeline();
    }

    showTaskModal(proc) {
      this.currentEditingTask = proc;
      document.getElementById('taskStartDate').value = proc.startDate;
      document.getElementById('taskDuration').value = proc.duration;
      document.getElementById('taskEditModal').classList.remove('modal--hidden');
    }

    hideTaskModal() {
      this.currentEditingTask = null;
      document.getElementById('taskEditModal').classList.add('modal--hidden');
    }

    saveTaskEdit() {
      const t = this.currentEditingTask;
      const sd = document.getElementById('taskStartDate').value;
      const du = parseInt(document.getElementById('taskDuration').value,10);
      if (t && sd && du>0) {
        t.startDate = sd;
        t.duration  = du;
        this.saveData();
        this.hideTaskModal();
        this.renderTimeline();
        this.showToast('Task updated', 'success');
      } else {
        this.showToast('Invalid inputs', 'error');
      }
    }

    renderTeam() { /* Unchanged */ }
    showMemberModal() { /* Unchanged */ }
    hideMemberModal() { /* Unchanged */ }
    saveMemberEdit() { /* Unchanged */ }
    toggleProcessCompletion() { /* Unchanged */ }
    exportTimeline()   { /* Unchanged */ }
    showToast()        { /* Unchanged */ }
    runSelfTest()      { /* Unchanged */ }

    resetTimeline() {
      if (!confirm('Reset timeline to default schedule?')) return;
      const defaults = localStorage.getItem('sacTrackerDefaults');
      if (defaults) {
        this.data.phases = JSON.parse(defaults).phases.map(p =>
          ({ name:p.name, priority:p.priority, processes:p.processes.map(x=>({ ...x })) })
        );
        this.saveData();
        this.renderAll();
        this.showToast('Timeline reset', 'success');
      } else {
        this.showToast('No defaults found', 'error');
      }
    }
  }

  window.app = new SACTracker();
});
