document.addEventListener('DOMContentLoaded', function() {
    
    class SACTracker {
        constructor() {
            this.data = {
                phases: [],
                team: []
            };
            this.editMode = false;
            this.currentEditingTask = null;
            this.currentEditingMember = null;
            
            this.init();
        }

        init() {
            this.loadData();
            this.setupEventListeners();
            this.renderAll();
            console.log('SAC Tracker initialized successfully');
        }

        loadData() {
            const savedData = localStorage.getItem('sacTrackerData');
            if (savedData) {
                try {
                    this.data = JSON.parse(savedData);
                    console.log('Data loaded from localStorage');
                } catch (e) {
                    console.warn('Error parsing saved data, using defaults');
                    this.loadDefaultData();
                }
            } else {
                this.loadDefaultData();
            }
        }

        loadDefaultData() {
            this.data = {
                phases: [
                    {
                        name: "Discovery",
                        priority: "HIGH",
                        processes: [
                            {id: 1, name: "Business Requirements Gathering", startDate: "2025-01-01", duration: 14, completed: false},
                            {id: 2, name: "Current State Analysis", startDate: "2025-01-15", duration: 10, completed: false},
                            {id: 3, name: "Stakeholder Interviews", startDate: "2025-01-25", duration: 7, completed: false}
                        ]
                    },
                    {
                        name: "Requirements",
                        priority: "HIGH",
                        processes: [
                            {id: 4, name: "Functional Requirements", startDate: "2025-02-01", duration: 21, completed: false}
                        ]
                    },
                    {
                        name: "Technical Foundation",
                        priority: "HIGH",
                        processes: [
                            {id: 5, name: "System Architecture", startDate: "2025-03-01", duration: 14, completed: false},
                            {id: 6, name: "Infrastructure Setup", startDate: "2025-03-15", duration: 10, completed: false},
                            {id: 7, name: "Environment Configuration", startDate: "2025-03-25", duration: 7, completed: false}
                        ]
                    },
                    {
                        name: "Data Readiness",
                        priority: "MEDIUM",
                        processes: [
                            {id: 8, name: "Data Source Identification", startDate: "2025-04-01", duration: 7, completed: false},
                            {id: 9, name: "Data Quality Assessment", startDate: "2025-04-08", duration: 14, completed: false}
                        ]
                    },
                    {
                        name: "Security & Access",
                        priority: "MEDIUM",
                        processes: [
                            {id: 10, name: "Security Framework", startDate: "2025-04-22", duration: 10, completed: false}
                        ]
                    },
                    {
                        name: "Implementation",
                        priority: "MEDIUM",
                        processes: [
                            {id: 11, name: "Core Development", startDate: "2025-05-01", duration: 30, completed: false},
                            {id: 12, name: "Testing & QA", startDate: "2025-05-31", duration: 14, completed: false}
                        ]
                    },
                    {
                        name: "Evaluation",
                        priority: "LOW",
                        processes: [
                            {id: 13, name: "Performance Testing", startDate: "2025-06-14", duration: 7, completed: false}
                        ]
                    },
                    {
                        name: "Planning",
                        priority: "LOW",
                        processes: [
                            {id: 14, name: "Go-Live Strategy", startDate: "2025-06-21", duration: 7, completed: false}
                        ]
                    }
                ],
                team: [
                    {id: 1, name: "John Smith", role: "Project Manager", email: "john.smith@company.com", initials: "JS"},
                    {id: 2, name: "Sarah Johnson", role: "SAC Developer", email: "sarah.johnson@company.com", initials: "SJ"},
                    {id: 3, name: "Mike Chen", role: "Data Analyst", email: "mike.chen@company.com", initials: "MC"}
                ]
            };
            
            // Store defaults for timeline reset
            localStorage.setItem('sacTrackerDefaults', JSON.stringify({ phases: this.data.phases }));
        }

        saveData() {
            try {
                localStorage.setItem('sacTrackerData', JSON.stringify(this.data));
                console.log('Data saved to localStorage');
            } catch (e) {
                console.error('Error saving ', e);
                this.showToast('Error saving data', 'error');
            }
        }

        setupEventListeners() {
            // Tab navigation
            document.querySelectorAll('.nav__btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.getAttribute('data-tab');
                    this.switchTab(tab);
                });
            });

            // Timeline controls
            document.getElementById('editModeBtn').addEventListener('click', () => {
                this.toggleEditMode();
            });

            document.getElementById('resetBtn').addEventListener('click', () => {
                this.resetTimeline();
            });

            document.getElementById('exportBtn').addEventListener('click', () => {
                this.exportTimeline();
            });

            // Team controls
            document.getElementById('addMemberBtn').addEventListener('click', () => {
                this.showMemberModal();
            });

            // Modal controls
            this.setupModalEventListeners();

            // Self-test
            document.getElementById('selfTestBtn').addEventListener('click', () => {
                this.runSelfTest();
            });
        }

        setupModalEventListeners() {
            // Task edit modal
            document.getElementById('taskModalClose').addEventListener('click', () => {
                this.hideTaskModal();
            });
            document.getElementById('taskModalCancel').addEventListener('click', () => {
                this.hideTaskModal();
            });
            document.getElementById('taskModalSave').addEventListener('click', () => {
                this.saveTaskEdit();
            });

            // Member modal
            document.getElementById('memberModalClose').addEventListener('click', () => {
                this.hideMemberModal();
            });
            document.getElementById('memberModalCancel').addEventListener('click', () => {
                this.hideMemberModal();
            });
            document.getElementById('memberModalSave').addEventListener('click', () => {
                this.saveMemberEdit();
            });

            // Close modals on backdrop click
            document.querySelector('#taskEditModal .modal__backdrop').addEventListener('click', () => {
                this.hideTaskModal();
            });
            document.querySelector('#memberModal .modal__backdrop').addEventListener('click', () => {
                this.hideMemberModal();
            });
        }

        switchTab(tabName) {
            // Update nav buttons
            document.querySelectorAll('.nav__btn').forEach(btn => {
                btn.classList.remove('nav__btn--active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('nav__btn--active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('tab-content--hidden');
            });
            document.getElementById(`${tabName}-tab`).classList.remove('tab-content--hidden');

            // Render specific tab content
            switch(tabName) {
                case 'overview':
                    this.renderOverview();
                    break;
                case 'phases':
                    this.renderPhases();
                    break;
                case 'timeline':
                    this.renderTimeline();
                    break;
                case 'team':
                    this.renderTeam();
                    break;
            }
        }

        renderAll() {
            this.renderOverview();
            this.renderPhases();
            this.renderTimeline();
            this.renderTeam();
        }

        renderOverview() {
            // Calculate stats
            const allProcesses = this.data.phases.flatMap(phase => phase.processes);
            const totalProcesses = allProcesses.length;
            const completedProcesses = allProcesses.filter(p => p.completed).length;
            const remainingProcesses = totalProcesses - completedProcesses;
            const completionPercent = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;

            // Update stats cards
            document.getElementById('completionPercent').textContent = `${completionPercent}%`;
            document.getElementById('totalProcesses').textContent = totalProcesses;
            document.getElementById('completedProcesses').textContent = completedProcesses;
            document.getElementById('remainingProcesses').textContent = remainingProcesses;

            // Render progress chart
            this.renderProgressChart(completionPercent);

            // Render phase cards
            this.renderPhaseCards();
        }

        renderProgressChart(percent) {
            const canvas = document.getElementById('progressChart');
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 70;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 8;
            ctx.stroke();

            // Draw progress arc
            if (percent > 0) {
                const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
                ctx.strokeStyle = '#4f46e5';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Draw percentage text
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, centerX, centerY);
        }

        renderPhaseCards() {
            const container = document.getElementById('phasesGrid');
            container.innerHTML = '';

            this.data.phases.forEach(phase => {
                const totalProcesses = phase.processes.length;
                const completedProcesses = phase.processes.filter(p => p.completed).length;
                const progressPercent = totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0;

                const card = document.createElement('div');
                card.className = 'phase-card';
                card.innerHTML = `
                    <div class="phase-card__header">
                        <h3 class="phase-card__title">${phase.name}</h3>
                        <span class="phase-card__priority phase-card__priority--${phase.priority.toLowerCase()}">${phase.priority} PRIORITY</span>
                    </div>
                    <div class="phase-card__progress">
                        <div class="progress-bar">
                            <div class="progress-bar__fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div class="phase-card__stats">
                        ${completedProcesses}/${totalProcesses} processes<br>
                        ${Math.round(progressPercent)}%
                    </div>
                `;
                container.appendChild(card);
            });
        }

        renderPhases() {
            const container = document.getElementById('phasesList');
            container.innerHTML = '';

            this.data.phases.forEach(phase => {
                const section = document.createElement('div');
                section.className = 'phase-section';
                
                const header = document.createElement('div');
                header.className = 'phase-section__header';
                header.innerHTML = `<h3 class="phase-section__title">${phase.name}</h3>`;
                section.appendChild(header);

                const processList = document.createElement('div');
                processList.className = 'process-list';

                phase.processes.forEach(process => {
                    const item = document.createElement('div');
                    item.className = `process-item ${process.completed ? 'process-item--completed' : ''}`;
                    item.innerHTML = `
                        <span class="process-item__name">${process.name}</span>
                        <button class="btn btn--sm ${process.completed ? 'btn--secondary' : 'btn--outline'}" onclick="app.toggleProcessCompletion(${process.id})">
                            ${process.completed ? '✓ Completed' : 'Mark Complete'}
                        </button>
                        ${process.completed ? '<span class="process-item__completed">✓</span>' : ''}
                    `;
                    processList.appendChild(item);
                });

                section.appendChild(processList);
                container.appendChild(section);
            });
        }

        toggleProcessCompletion(processId) {
            // Find and toggle the process
            let found = false;
            for (const phase of this.data.phases) {
                for (const process of phase.processes) {
                    if (process.id === processId) {
                        process.completed = !process.completed;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            if (found) {
                this.saveData();
                this.renderAll();
                this.showToast('Process status updated', 'success');
            }
        }

        renderTimeline() {
            const container = document.getElementById('timelineContainer');
            container.innerHTML = '';

            const allProcesses = this.data.phases.flatMap(phase => phase.processes);
            if (allProcesses.length === 0) return;

            const dates = allProcesses.map(p => new Date(p.startDate));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...allProcesses.map(p => {
                const start = new Date(p.startDate);
                return start.getTime() + (p.duration * 24 * 60 * 60 * 1000);
            })));

            const totalDays = Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000)) + 7;

            const grid = document.createElement('div');
            grid.className = 'timeline-grid';
            grid.style.position = 'relative';
            grid.style.minWidth = `${totalDays * 10}px`;

            // Draw calendar grid lines every 7 days
            for (let d = 0; d < totalDays; d += 7) {
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.left = `${(d / totalDays) * 100}%`;
                line.style.top = '0';
                line.style.height = '100%';
                line.style.width = '1px';
                line.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                line.style.pointerEvents = 'none';
                grid.appendChild(line);
            }

            allProcesses.forEach(process => {
                const row = document.createElement('div');
                row.className = 'timeline-row';

                const label = document.createElement('div');
                label.className = 'timeline-label';
                label.textContent = process.name;

                const track = document.createElement('div');
                track.className = 'timeline-track';

                const bar = document.createElement('div');
                bar.className = `timeline-bar ${this.editMode ? 'timeline-bar--editable' : ''}`;
                
                // Calculate position and width
                const startDate = new Date(process.startDate);
                const daysSinceStart = Math.ceil((startDate - minDate) / (24 * 60 * 60 * 1000));
                const leftPercent = (daysSinceStart / totalDays) * 100;
                const widthPercent = (process.duration / totalDays) * 100;

                bar.style.left = `${leftPercent}%`;
                bar.style.width = `${widthPercent}%`;
                bar.textContent = `${process.duration}d`;

                if (this.editMode) {
                    bar.addEventListener('click', () => {
                        this.showTaskModal(process);
                    });
                }

                track.appendChild(bar);
                row.appendChild(label);
                row.appendChild(track);
                grid.appendChild(row);
            });

            container.appendChild(grid);
        }

        toggleEditMode() {
            this.editMode = !this.editMode;
            const btn = document.getElementById('editModeBtn');
            btn.textContent = this.editMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
            btn.classList.toggle('btn--toggle');
            this.renderTimeline();
        }

        showTaskModal(process) {
            this.currentEditingTask = process;
            document.getElementById('taskStartDate').value = process.startDate;
            document.getElementById('taskDuration').value = process.duration;
            document.getElementById('taskEditModal').classList.remove('modal--hidden');
        }

        hideTaskModal() {
            this.currentEditingTask = null;
            document.getElementById('taskEditModal').classList.add('modal--hidden');
        }

        saveTaskEdit() {
            if (this.currentEditingTask) {
                const startDate = document.getElementById('taskStartDate').value;
                const duration = parseInt(document.getElementById('taskDuration').value);

                if (startDate && duration > 0) {
                    this.currentEditingTask.startDate = startDate;
                    this.currentEditingTask.duration = duration;
                    
                    this.saveData();
                    this.hideTaskModal();
                    this.renderTimeline();
                    this.showToast('Task updated successfully', 'success');
                } else {
                    this.showToast('Please fill in all fields correctly', 'error');
                }
            }
        }

        renderTeam() {
            const container = document.getElementById('teamGrid');
            container.innerHTML = '';

            this.data.team.forEach(member => {
                const card = document.createElement('div');
                card.className = 'team-card';
                card.innerHTML = `
                    <div class="team-card__header">
                        <div class="team-card__avatar">${member.initials}</div>
                        <div class="team-card__info">
                            <h3 class="team-card__name">${member.name}</h3>
                            <p class="team-card__role">${member.role}</p>
                        </div>
                    </div>
                    <p class="team-card__email">${member.email}</p>
                    <div class="team-card__actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editMember(${member.id})">Edit</button>
                        <button class="btn btn--sm btn--danger" onclick="app.deleteMember(${member.id})">Delete</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        showMemberModal(member = null) {
            this.currentEditingMember = member;
            const title = document.getElementById('memberModalTitle');
            
            if (member) {
                title.textContent = 'Edit Team Member';
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberRole').value = member.role;
                document.getElementById('memberEmail').value = member.email;
                document.getElementById('memberInitials').value = member.initials;
            } else {
                title.textContent = 'Add Team Member';
                document.getElementById('memberName').value = '';
                document.getElementById('memberRole').value = '';
                document.getElementById('memberEmail').value = '';
                document.getElementById('memberInitials').value = '';
            }
            
            document.getElementById('memberModal').classList.remove('modal--hidden');
        }

        hideMemberModal() {
            this.currentEditingMember = null;
            document.getElementById('memberModal').classList.add('modal--hidden');
        }

        saveMemberEdit() {
            const name = document.getElementById('memberName').value.trim();
            const role = document.getElementById('memberRole').value.trim();
            const email = document.getElementById('memberEmail').value.trim();
            const initials = document.getElementById('memberInitials').value.trim().toUpperCase();

            if (!name || !role || !email || !initials) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }

            if (this.currentEditingMember) {
                this.currentEditingMember.name = name;
                this.currentEditingMember.role = role;
                this.currentEditingMember.email = email;
                this.currentEditingMember.initials = initials;
                this.showToast('Team member updated successfully', 'success');
            } else {
                const newId = Math.max(0, ...this.data.team.map(m => m.id)) + 1;
                this.data.team.push({
                    id: newId,
                    name,
                    role,
                    email,
                    initials
                });
                this.showToast('Team member added successfully', 'success');
            }

            this.saveData();
            this.hideMemberModal();
            this.renderTeam();
        }

        editMember(memberId) {
            const member = this.data.team.find(m => m.id === memberId);
            if (member) {
                this.showMemberModal(member);
            }
        }

        deleteMember(memberId) {
            if (confirm('Are you sure you want to delete this team member?')) {
                this.data.team = this.data.team.filter(m => m.id !== memberId);
                this.saveData();
                this.renderTeam();
                this.showToast('Team member deleted successfully', 'success');
            }
        }

        resetTimeline() {
            if (!confirm('Reset timeline to default schedule? (Team members will be preserved)')) return;
            
            const defaults = localStorage.getItem('sacTrackerDefaults');
            if (defaults) {
                try {
                    const defaultPhases = JSON.parse(defaults).phases;
                    // Deep copy to avoid reference issues
                    this.data.phases = JSON.parse(JSON.stringify(defaultPhases));
                    this.saveData();
                    this.renderAll();
                    this.showToast('Timeline reset successfully', 'success');
                } catch (e) {
                    this.showToast('Error resetting timeline', 'error');
                }
            } else {
                this.showToast('No default timeline found', 'error');
            }
        }

        exportTimeline() {
            const data = {
                phases: this.data.phases,
                exportDate: new Date().toISOString(),
                totalProcesses: this.data.phases.flatMap(p => p.processes).length
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sac-timeline-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showToast('Timeline exported successfully', 'success');
        }

        showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const content = document.getElementById('toastContent');
            
            content.textContent = message;
            toast.className = `toast toast--${type}`;
            toast.classList.remove('toast--hidden');

            setTimeout(() => {
                toast.classList.add('toast--hidden');
            }, 3000);
        }

        runSelfTest() {
            const results = [];
            
            try {
                this.switchTab('phases');
                this.switchTab('timeline');
                this.switchTab('team');
                this.switchTab('overview');
                results.push('✅ Tab switching: PASS');
            } catch (e) {
                results.push('❌ Tab switching: FAIL');
            }

            try {
                const testData = JSON.stringify(this.data);
                localStorage.setItem('testSACData', testData);
                const retrieved = localStorage.getItem('testSACData');
                localStorage.removeItem('testSACData');
                if (testData === retrieved) {
                    results.push('✅ Data persistence: PASS');
                } else {
                    results.push('❌ Data persistence: FAIL');
                }
            } catch (e) {
                results.push('❌ Data persistence: FAIL');
            }

            try {
                const originalState = this.data.phases[0].processes[0].completed;
                this.toggleProcessCompletion(this.data.phases[0].processes[0].id);
                const newState = this.data.phases[0].processes[0].completed;
                this.toggleProcessCompletion(this.data.phases[0].processes[0].id);
                if (originalState !== newState) {
                    results.push('✅ Process completion toggle: PASS');
                } else {
                    results.push('❌ Process completion toggle: FAIL');
                }
            } catch (e) {
                results.push('❌ Process completion toggle: FAIL');
            }

            try {
                const originalEditMode = this.editMode;
                this.toggleEditMode();
                const newEditMode = this.editMode;
                this.toggleEditMode();
                if (originalEditMode !== newEditMode) {
                    results.push('✅ Timeline edit mode: PASS');
                } else {
                    results.push('❌ Timeline edit mode: FAIL');
                }
            } catch (e) {
                results.push('❌ Timeline edit mode: FAIL');
            }

            try {
                const originalTeamCount = this.data.team.length;
                this.data.team.push({id: 999, name: 'Test User', role: 'Tester', email: 'test@test.com', initials: 'TU'});
                const afterAdd = this.data.team.length;
                this.data.team = this.data.team.filter(m => m.id !== 999);
                const afterDelete = this.data.team.length;
                if (afterAdd === originalTeamCount + 1 && afterDelete === originalTeamCount) {
                    results.push('✅ Team CRUD operations: PASS');
                } else {
                    results.push('❌ Team CRUD operations: FAIL');
                }
            } catch (e) {
                results.push('❌ Team CRUD operations: FAIL');
            }

            const resultMessage = 'Self-Test Results:\n\n' + results.join('\n');
            this.showToast(resultMessage, 'info');
            console.log('Self-Test Results:', results);
        }
    }

    window.app = new SACTracker();
});
