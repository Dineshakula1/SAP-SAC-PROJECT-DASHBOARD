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
    { name:'Technical Foundation', priority:'HIGH', processes:[
      {id:6,name:'System Architecture',startDate:'2025-03-01',duration:14,completed:false},
      {id:7,name:'Infrastructure Setup',startDate:'2025-03-15',duration:10,completed:false},
      {id:8,name:'Environment Configuration',startDate:'2025-03-25',duration:7,completed:false}
    ]},
    { name:'Data Readiness', priority:'MEDIUM', processes:[
      {id:9,name:'Data Source Identification',startDate:'2025-04-01',duration:7,completed:false},
      {id:10,name:'Data Quality Assessment',startDate:'2025-04-08',duration:14,completed:false}
    ]},
    { name:'Security & Access', priority:'MEDIUM', processes:[
      {id:11,name:'Security Framework',startDate:'2025-04-22',duration:10,completed:false}
    ]},
    { name:'Implementation', priority:'MEDIUM', processes:[
      {id:12,name:'Core Development',startDate:'2025-05-01',duration:30,completed:false},
      {id:13,name:'Testing & QA',startDate:'2025-05-31',duration:14,completed:false}
    ]},
    { name:'Evaluation', priority:'LOW', processes:[
      {id:14,name:'Performance Testing',startDate:'2025-06-14',duration:7,completed:false}
    ]},
    { name:'Planning', priority:'LOW', processes:[
      {id:15,name:'Go-Live Strategy',startDate:'2025-06-21',duration:7,completed:false}
    ]}
  ],
  team: [
    {id:1,name:'John Smith',role:'Project Manager',email:'john.smith@company.com',initials:'JS'},
    {id:2,name:'Sarah Johnson',role:'SAC Developer',email:'sarah.johnson@company.com',initials:'SJ'},
    {id:3,name:'Mike Chen',role:'Data Analyst',email:'mike.chen@company.com',initials:'MC'}
  ]
};

let editMode = false;

// Persistence
function loadAppState() {
  const saved = localStorage.getItem('sacState');
  if (saved) try { appState = JSON.parse(saved); } catch {}
}
function saveAppState() {
  localStorage.setItem('sacState', JSON.stringify(appState));
}

// Tab handling
['overview','phases','timeline','team'].forEach(t=>{
  document.getElementById(`tab-${t}`).onclick=()=>{
    document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
    document.getElementById(`tab-${t}`).classList.add('active');
    document.querySelectorAll('section').forEach(s=>s.classList.add('hidden'));
    document.getElementById(`${t}-tab`).classList.remove('hidden');
    if(t==='overview') updateProgressStats();
    if(t==='phases') renderPhases();
    if(t==='timeline') renderTimeline();
    if(t==='team') renderTeam();
  };
});

// Overview
function updateProgressStats(){
  const procs = appState.phases.flatMap(p=>p.processes);
  const total=procs.length, comp=procs.filter(p=>p.completed).length;
  const pct=total?Math.round(comp/total*100):0;
  const els=document.querySelectorAll('.hero-stats .stat-value');
  els[0].textContent=`${pct}%`; els[1].textContent=total;
  els.textContent=comp; els.textContent=total-comp;
  document.querySelector('.circle').setAttribute('stroke-dasharray',`${pct},100`);
  document.querySelector('.percentage').textContent=`${pct}%`;

  const pc=document.getElementById('phase-cards-container'); pc.innerHTML='';
  appState.phases.forEach(ph=>{
    const card=document.createElement('div'); card.className='phase-card';
    card.innerHTML=`<h3>${ph.name} <span>${ph.priority}</span></h3>
      <div class='progress-bar-bg'><div class='progress-bar-fill'></div></div>
      <div class='phase-stats'><span></span></div>`;
    const pctp=ph.processes.length?Math.round(ph.processes.filter(x=>x.completed).length/ph.processes.length*100):0;
    card.querySelector('.progress-bar-fill').style.width=`${pctp}%`;
    card.querySelector('.phase-stats span').textContent=`${ph.processes.filter(x=>x.completed).length}/${ph.processes.length}`;
    pc.appendChild(card);
  });
}

// Phases
function renderPhases(){
  const c=document.getElementById('phases-container'); c.innerHTML='';
  appState.phases.forEach(ph=>ph.processes.forEach(proc=>{
    const btn=document.createElement('button');
    btn.textContent=proc.name+(proc.completed?' ✅':'');
    btn.onclick=()=>{ proc.completed=!proc.completed; saveAppState(); updateProgressStats(); renderPhases(); };
    c.appendChild(btn);
  }));
}

// Timeline
document.getElementById('btn-edit-mode').onclick=()=>{ editMode=!editMode; renderTimeline(); };
function renderTimeline(){
  const c=document.getElementById('timeline-container'); c.innerHTML='';
  const base=new Date('2025-01-01').getTime(), pxDay=5;
  appState.phases.forEach(ph=>ph.processes.forEach(proc=>{
    const bar=document.createElement('div'); bar.className='task-bar';
    bar.style.left=`${(new Date(proc.startDate)-base)/(1000*60*60*24)*pxDay}px`;
    bar.style.width=`${proc.duration*pxDay}px`;
    bar.onclick=e=>{
      if(!editMode) return;
      openTimelineEdit(proc);
      e.stopPropagation();
    };
    c.appendChild(bar);
  }));
}
function openTimelineEdit(proc){
  document.getElementById('edit-start-date').value=proc.startDate;
  document.getElementById('edit-duration').value=proc.duration;
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('btn-save-edit').onclick=()=>{
    proc.startDate=document.getElementById('edit-start-date').value;
    proc.duration=parseInt(document.getElementById('edit-duration').value,10);
    saveAppState(); document.getElementById('edit-modal').classList.add('hidden'); renderTimeline();
  };
  document.getElementById('btn-cancel-edit').onclick=()=>{ document.getElementById('edit-modal').classList.add('hidden'); };
}

// Team
document.getElementById('btn-add-member').onclick=()=>{
  const name=prompt('Name'); if(!name) return;
  const role=prompt('Role'), email=prompt('Email'), initials=prompt('Initials');
  appState.team.push({id:Date.now(),name,role,email,initials}); saveAppState(); renderTeam();
};
function renderTeam(){
  const c=document.getElementById('team-container'); c.innerHTML='';
  appState.team.forEach(m=>{
    const row=document.createElement('div');
    row.innerHTML=`${m.initials} - ${m.name} (${m.role}) 
      <button class='edit'>Edit</button> <button class='del'>Delete</button>`;
    row.querySelector('.del').onclick=()=>{ appState.team=appState.team.filter(x=>x.id!==m.id); saveAppState(); renderTeam(); };
    row.querySelector('.edit').onclick=()=>{
      m.name=prompt('Name',m.name)||m.name;
      m.role=prompt('Role',m.role)||m.role;
      m.email=prompt('Email',m.email)||m.email;
      m.initials=prompt('Initials',m.initials)||m.initials;
      saveAppState(); renderTeam();
    };
    c.appendChild(row);
  });
}

// Self-test
document.getElementById('btn-self-test').onclick=()=>alert('Manual test: add/edit/delete, refresh—data persists.');

// Init
loadAppState(); updateProgressStats(); renderPhases(); renderTimeline(); renderTeam();
