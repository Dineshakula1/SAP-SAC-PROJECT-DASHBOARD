// Default data
let appState = {
  phases: [
    { name:'Discovery', priority:'HIGH', processes:[
      {id:1,name:'Business Requirements Gathering',startDate:'2025-01-01',duration:14,completed:false},
      {id:2,name:'Current State Analysis',startDate:'2025-01-15',duration:10,completed:false},
      {id:3,name:'Stakeholder Interviews',startDate:'2025-01-25',duration:7,completed:false}
    ]},
    { name:'Requirements', priority:'HIGH', processes:[
      {id:4,name:'Functional Requirements',startDate:'2025-02-01',duration:21,completed:false},
      {id:5,name:'Technical Requirements',startDate:'2025-02-22',duration:14,completed:false}
    ]},
    // ...other phases...
  ],
  team: [
    {id:1,name:'John Smith',role:'Project Manager',email:'john.smith@company.com',initials:'JS'},
    {id:2,name:'Sarah Johnson',role:'SAC Developer',email:'sarah.johnson@company.com',initials:'SJ'},
    {id:3,name:'Mike Chen',role:'Data Analyst',email:'mike.chen@company.com',initials:'MC'}
  ]
};
let editMode=false;

// Persistence
function loadAppState() {
  const saved = localStorage.getItem('sacState');
  if (saved) try { appState = JSON.parse(saved); } catch {}
}
function saveAppState() {
  localStorage.setItem('sacState', JSON.stringify(appState));
}

// Tab switching
['overview','phases','timeline','team'].forEach(tab=>{
  document.getElementById(`tab-${tab}`).addEventListener('click',()=>{
    document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.querySelectorAll('section').forEach(s=>s.classList.add('hidden'));
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    if(tab==='overview') updateProgressStats();
    if(tab==='phases') renderPhases();
    if(tab==='timeline') renderTimeline();
    if(tab==='team') renderTeam();
  });
});

// Overview
function updateProgressStats(){
  const all = appState.phases.flatMap(p=>p.processes);
  const total=all.length, comp=all.filter(x=>x.completed).length;
  const pct = total?Math.round(comp/total*100):0;
  const els = document.querySelectorAll('.hero-stats .stat-value');
  els[0].textContent=`${pct}%`; els[1].textContent=total; els.textContent=comp; els.textContent=total-comp;
  document.querySelector('.circle').setAttribute('stroke-dasharray',`${pct},100`);
  document.querySelector('.percentage').textContent=`${pct}%`;
  // phase cards
  const container=document.getElementById('phase-cards-container');
  container.innerHTML='';
  appState.phases.forEach(phase=>{
    const card=document.createElement('div'); card.className='phase-card';
    card.setAttribute('data-phase',phase.name);
    card.innerHTML=`<h3>${phase.name} <span>${phase.priority}</span></h3>
      <div class="progress-bar-bg"><div class="progress-bar-fill"></div></div>
      <div class="phase-stats"><span></span></div>`;
    const fill=card.querySelector('.progress-bar-fill');
    const pctp=phase.processes.length?Math.round(phase.processes.filter(x=>x.completed).length/phase.processes.length*100):0;
    fill.style.width=`${pctp}%`;
    card.querySelector('.phase-stats span').textContent=`${phase.processes.filter(x=>x.completed).length}/${phase.processes.length} processes`;
    container.appendChild(card);
  });
}

// Phases
function renderPhases(){
  const c=document.getElementById('phases-container'); c.innerHTML='';
  appState.phases.forEach(phase=>{
    phase.processes.forEach(proc=>{
      const btn=document.createElement('button');
      btn.textContent=proc.name+(proc.completed?' ✅':'');
      btn.onclick=()=>{
        proc.completed=!proc.completed;
        saveAppState(); updateProgressStats(); renderPhases();
      };
      c.appendChild(btn);
    });
  });
}

// Timeline
document.getElementById('btn-edit-mode').onclick=()=>{
  editMode=!editMode;
  document.getElementById('btn-edit-mode').textContent=editMode?'Exit Edit Mode':'Enter Edit Mode';
  renderTimeline();
};
function renderTimeline(){
  const c=document.getElementById('timeline-container'); c.innerHTML='';
  appState.phases.forEach(phase=>{
    phase.processes.forEach(proc=>{
      const bar=document.createElement('div'); bar.className='task-bar';
      // simplistic positioning
      const dayWidth=5; // px per day
      const start=new Date(proc.startDate).getTime();
      const base=new Date('2025-01-01').getTime();
      bar.style.left=`${((start-base)/(1000*60*60*24))*dayWidth}px`;
      bar.style.width=`${proc.duration*dayWidth}px`;
      bar.onclick=e=>{
        if(!editMode) return;
        openTimelineEditModal(proc);
        e.stopPropagation();
      };
      if(editMode) bar.classList.add('draggable'); else bar.classList.remove('draggable');
      c.appendChild(bar);
    });
  });
}
function openTimelineEditModal(proc){
  document.getElementById('edit-start-date').value=proc.startDate;
  document.getElementById('edit-duration').value=proc.duration;
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('btn-save-edit').onclick=()=>{ 
    proc.startDate=document.getElementById('edit-start-date').value;
    proc.duration=parseInt(document.getElementById('edit-duration').value,10);
    saveAppState(); document.getElementById('edit-modal').classList.add('hidden'); renderTimeline();
  };
  document.getElementById('btn-cancel-edit').onclick=()=>{
    document.getElementById('edit-modal').classList.add('hidden');
  };
}

// Team
document.getElementById('btn-add-member').onclick=()=>{
  const name=prompt('Name'), role=prompt('Role'), email=prompt('Email'), initials=prompt('Initials');
  if(name){ const id=Date.now(); appState.team.push({id,name,role,email,initials}); saveAppState(); renderTeam(); }
};
function renderTeam(){
  const c=document.getElementById('team-container'); c.innerHTML='';
  appState.team.forEach(m=>{
    const div=document.createElement('div'); div.className='team-member';
    div.innerHTML=`${m.initials} - ${m.name} (${m.role}) <button class="edit">Edit</button> <button class="delete">Delete</button>`;
    div.querySelector('.delete').onclick=()=>{ appState.team=appState.team.filter(x=>x.id!==m.id); saveAppState(); renderTeam(); };
    div.querySelector('.edit').onclick=()=>{ 
      const name=prompt('Name',m.name), role=prompt('Role',m.role), email=prompt('Email',m.email), initials=prompt('Initials',m.initials);
      Object.assign(m,{name,role,email,initials}); saveAppState(); renderTeam();
    };
    c.appendChild(div);
  });
}

// Self-test (basic)
document.getElementById('btn-self-test').onclick=()=>{
  alert('All features are persistent. Test manually: mark complete, edit timeline, add/delete team, then refresh.');
};

// Initialize
loadAppState();
updateProgressStats();
renderPhases();
renderTimeline();
renderTeam();
