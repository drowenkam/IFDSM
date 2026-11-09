/* IFDSM Question Bank • Standalone, offline-capable website • No external libraries, analytics or account required. */
(function () {
  'use strict';
  const Q = Array.isArray(window.IFDSM_QUESTIONS) ? window.IFDSM_QUESTIONS : [];
  const TOPICS = Array.isArray(window.IFDSM_TOPICS) ? window.IFDSM_TOPICS : [];
  const KEYPOINTS = Array.isArray(window.IFDSM_KEYPOINTS) ? window.IFDSM_KEYPOINTS : [];
  const BY_ID = new Map(Q.map(x => [Number(x.number), x]));
  const NOTEBOOK_PDF = './resources/IFDSM_Integrated_Revision_Notebook.pdf';
  const readPDF = (page,from='notebook',doc='volume1',topic=null) => `./reader.html?doc=${doc}&page=${page}&from=${from}${topic ? `&topic=${topic}` : ''}`;
  const NOTEBOOK_MAP = [{"id":1,"key":[7,8],"quick":[7,8],"detail":[9,27]},{"id":2,"key":[28,29],"quick":[28,29],"detail":[30,46]},{"id":3,"key":[47,48],"quick":[47,48],"detail":[49,65]},{"id":4,"key":[66,67],"quick":[66,67],"detail":[68,81]},{"id":5,"key":[82,83],"quick":[82,83],"detail":[84,100]},{"id":6,"key":[101,102],"quick":[101,102],"detail":[103,112]},{"id":7,"key":[113,114],"quick":[113,114],"detail":[115,121]},{"id":8,"key":[122,123],"quick":[122,123],"detail":[124,143]},{"id":9,"key":[144,145],"quick":[144,145],"detail":[146,153]},{"id":10,"key":[154,155],"quick":[154,155],"detail":[156,177]}];

  const KINDS = [
    ['all', 'All question types'],
    ['case', 'Clinical decision-making'],
    ['application', 'Applied clinical reasoning'],
    ['interpretation', 'Clinical interpretation'],
    ['knowledge', 'Focused knowledge']
  ];
  const KEY = 'ifdsm-sba-examstyle-v2';
  const LEGACY_KEY = 'ifdsm-sba-web-v1';
  let legacyAvailable = false;
  try { legacyAvailable = !!localStorage.getItem(LEGACY_KEY); } catch (e) {}
  const root = document.getElementById('main-app');
  if (!Q.length || !root) {
    if (root) root.innerHTML = '<div class="empty">Question data could not be loaded. Ensure the entire website folder was uploaded, including <strong>data/questions.js</strong>.</div>';
    return;
  }
  const safe = str => String(str == null ? '' : str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rich = str => safe(str).replace(/&lt;b&gt;/gi, '<strong>').replace(/&lt;\/b&gt;/gi, '</strong>').replace(/&lt;i&gt;/gi, '<em>').replace(/&lt;\/i&gt;/gi, '</em>');
  const letters = ['A','B','C','D','E'];
  const topicTitle = id => (TOPICS.find(t => t.id === Number(id)) || {}).title || 'Unknown topic';
  const sectionTitle = id => { const t = TOPICS.find(t => t.id === Number(String(id).split('.')[0])); return t?.sections.find(s => s.id === String(id))?.title || ''; };
  const isClinical = q => q.kind === 'Integrated clinical vignette' || q.kind === 'Clinical-context application';
  const fmtDate = ts => {try {return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});} catch(e) {return '—';}};
  const fmtTime = ms => { const n = Math.floor(Math.max(0,ms)/1000); return `${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; };
  const validChoice = n => Number.isInteger(n) && n >= 0 && n <= 4;
  const answerCount = sess => sess ? Object.values(sess.answers).filter(validChoice).length : 0;
  function scoreSession(sess){
    if(!sess)return {total:0,answered:0,correct:0,incorrect:0,revealed:0,unanswered:0};
    let answered=0,correct=0,revealed=0;
    for(const id of sess.order){
      const given=sess.answers[id],q=BY_ID.get(id);
      if(validChoice(given)) {answered++; if(q && given===q.key) correct++;}
      else if(given===-1) revealed++;
    }
    return {total:sess.order.length,answered,correct,incorrect:answered-correct,revealed,
      unanswered:sess.order.length-answered-revealed};
  }
  const storage = {
    read() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){return null;} },
    write(value) { try {localStorage.setItem(KEY,JSON.stringify(value));return true;}catch(e){return false;} }
  };
  const stored = storage.read() || {};
  // Use a new progress record because revised question wording, answer options and keys are not compatible with the first bank. Legacy records remain untouched.
  const cleanProgress = {};
  if(stored.progress && typeof stored.progress === 'object' && !Array.isArray(stored.progress)){
    for(const [id,p] of Object.entries(stored.progress)){
      const q=BY_ID.get(Number(id));
      if(!q || !p || !validChoice(p.answer))continue;
      cleanProgress[q.number]={answer:p.answer,correct:p.answer===q.key,
        tries:Number.isInteger(p.tries)&&p.tries>0?Math.min(p.tries,100000):1,
        updated:Number.isFinite(p.updated)?p.updated:Date.now()};
    }
  }
  function cleanSession(s){
    if(!s || !['study','exam'].includes(s.mode) || !Array.isArray(s.order) || !s.order.length)return null;
    const order=s.order.map(Number);
    if(order.some(id=>!BY_ID.has(id)) || new Set(order).size!==order.length || order.length>Q.length)return null;
    const answers={};
    if(s.answers && typeof s.answers === 'object')for(const id of order){
      const v=s.answers[id];if(validChoice(v) || (s.mode==='study' && v===-1))answers[id]=v;
    }
    const startedAt=Number(s.startedAt);
    return {mode:s.mode,order,answers,
      current:Number.isInteger(s.current)?Math.max(0,Math.min(order.length-1,s.current)):0,
      startedAt:Number.isFinite(startedAt)&&startedAt>0?startedAt:Date.now(),
      submitted:s.submitted===true,topic:String(s.topic||'all'),kind:String(s.kind||'all'),
      finishedAt:Number.isFinite(s.finishedAt)?s.finishedAt:null};
  }
  const cleanHistory=Array.isArray(stored.history)?stored.history.filter(h=>h && ['study','exam'].includes(h.mode) && Number.isInteger(h.correct) && Number.isInteger(h.total) && h.total>0 && h.correct>=0 && h.correct<=h.total && Number.isInteger(h.answered) && h.answered>=h.correct && h.answered<=h.total).slice(0,35):[];
  const db = {progress:cleanProgress,
    bookmarks:Array.isArray(stored.bookmarks)?[...new Set(stored.bookmarks.filter(Number.isInteger).filter(n=>BY_ID.has(n)))]:[],
    history:cleanHistory,session:cleanSession(stored.session),theme:stored.theme==='dark'?'dark':'light'};
  const ui = {
    view: (location.hash || '#home').replace('#','').split('?')[0],
    setupTopic: 'all', setupKind: 'all', setupCount: '20', setupPool:'unseen', examPool:'all',
    browseTopic:'all',browseKind:'all',browseSection:'all',browseSearch:'',browseBookmarks:false,browsePage:1,
    browseDetail:null,browseReveal:false,reviewId:null,missedPage:1
  };
  const VIEWS = new Set(['home','practice','exam','browse','browse-detail','session','progress','results','review','notebook','keypoints','about']);
  function routeFromHash(){
    const hash=(location.hash||'#home').slice(1),[v,query='']=hash.split('?');
    if(v==='main-app')return ui.view||'home'; // Accessibility skip-to-content anchor is not a screen route.
    let view=VIEWS.has(v)?v:'home';
    const id=Number(new URLSearchParams(query).get('question'));
    if(view==='browse'){
      const sec=new URLSearchParams(query).get('section');
      const validSection=TOPICS.some(t=>t.sections.some(s=>s.id===sec));
      if(validSection){ui.browseTopic=sec.split('.')[0];ui.browseSection=sec;ui.browsePage=1;}
    }
    if(view==='browse-detail'){
      if(BY_ID.has(id))ui.browseDetail=id;
      else view='browse';
    }
    if(view==='review'){
      if(!db.session?.submitted)view='home';
      else if(BY_ID.has(id) && db.session.order.includes(id))ui.reviewId=id;
      else view='results';
    }
    if(view==='session' && (!db.session||db.session.submitted))view=db.session?.submitted?'results':'home';
    if(view==='results' && (!db.session||!db.session.submitted))view=db.session?'session':'home';
    return view;
  }
  ui.view=routeFromHash();
  document.documentElement.dataset.theme=db.theme==='dark'?'dark':'light';
  let toastTimeout = 0;
  const toast = message => {
    const el=document.getElementById('toast'); if(!el)return;
    el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);
    toastTimeout=setTimeout(()=>el.classList.remove('show'),3000);
  };
  let storageWarningShown=false;
  const persist=()=>{const ok=storage.write(db);
    if(!ok && !storageWarningShown){storageWarningShown=true;toast('Browser storage is unavailable: progress will not survive closing this tab.');}
    return ok;
  };
  const percent=(a,b)=>b ? Math.round(100*a/b):0;
  function setView(view){
    if(!VIEWS.has(view))view='home';
    if(view==='review' && (!db.session?.submitted || !db.session.order.includes(ui.reviewId)))view='results';
    if(view==='browse-detail' && !BY_ID.has(ui.browseDetail))view='browse';
    ui.view=view;
    const detail=view==='browse-detail'?`?question=${ui.browseDetail}`:view==='review'?`?question=${ui.reviewId}`:'';
    const target='#'+view+detail;
    if(location.hash!==target)history.pushState(null,'',target);
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function setActiveNav(){
    document.querySelectorAll('[data-action="nav"]').forEach(el=>{
      const v=el.dataset.view;
      const group=ui.view==='session'||ui.view==='results'||ui.view==='review'?(db.session?.mode==='exam'?'exam':'practice'):(ui.view==='browse-detail'?'browse':ui.view);
      el.classList.toggle('active',v===group);
      if(v===group)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
  }
  const topicOptions=(current='all') => '<option value="all"'+(String(current)==='all'?' selected':'')+'>All ten competencies</option>'+TOPICS.map(t=>`<option value="${t.id}" ${String(current)===String(t.id)?'selected':''}>${t.id}. ${safe(t.title)}</option>`).join('');
  const kindOptions=(current='all')=>KINDS.map(([id,label])=>`<option value="${id}" ${id===current?'selected':''}>${safe(label)}</option>`).join('');
  const pageHeading=(label,title,description)=>`<div class="eyebrow">${safe(label)}</div><h1 class="page-heading">${title}</h1><p class="page-intro">${description}</p>`;
  const topicCount=(id)=>Q.filter(q=>q.topic===id).length;
  const seenCount=(id)=>Q.filter(q=>q.topic===id && db.progress[q.number]).length;
  const accuracy=(id)=>{const arr=Q.filter(q=>q.topic===id&&db.progress[q.number]);return arr.length?percent(arr.filter(q=>db.progress[q.number].correct).length,arr.length):null};
  function renderHome(){
    const attempted=Object.keys(db.progress).length;
    const isActive=db.session&&!db.session.submitted;
    return `<section class="hero">
      <div><div class="eyebrow">Volume II · Examination revision</div>
        <h1>The Question Bank<br/><em>Dental Sleep Medicine</em></h1>
        <p class="lede">1,000 reworked clinical-style SBAs with answer justifications, and syllabus section references across all ten IFDSM competencies.</p>
        <div class="hero-actions">
          ${isActive?'<button data-action="continue" class="btn btn-teal" type="button">▶ Continue your session</button>':'<button data-action="nav" data-view="practice" class="btn btn-primary" type="button">▶ Start practising</button>'}
          <button data-action="nav" data-view="exam" class="btn btn-outline" type="button">Start a mock exam</button>
        </div>
        <div style="margin-top:26px;color:var(--muted);font-size:12px">Prepared by <strong style="color:var(--ink)">Dr. Kam O Man, Owen</strong> · Independent study resource</div>
      </div>
      <div class="book-panel" aria-label="Question bank cover">
        <div class="book-top">IFDSM · Dental sleep medicine<br/>The examination revision series</div>
        <div><div class="book-title">The<br/>Question<br/>Bank</div><div class="book-subtitle">A complete revision companion · Author edition</div><div class="book-rule"></div>
          <div style="font-size:12px;line-height:1.9">1,000 single-best-answer questions<br/>Clinical scenarios and examiner-style reasoning<br/>Detailed justifications with learning codes<br/>Ten competencies · Trackable progress</div></div>
        <div class="book-credits"><strong>Dr. Kam O Man, Owen</strong><br/>BDS (HK) · MFDS RCSEd · MFDS RCPS (Glasg)<br/>MClinDent (Fixed and Removable Prosthodontics) (KCL)<br/>MImpDent (RCSEd) · MGDS RCSI</div>
      </div></section>
      <section class="stats-strip" aria-label="Question bank statistics">
        <div class="stat"><b>1,000</b><small>QUESTIONS</small></div>
        <div class="stat"><b>10</b><small>COMPETENCIES</small></div>
        <div class="stat"><b>78</b><small>SYLLABUS SECTIONS</small></div>
        <div class="stat"><b>${attempted}</b><small>QUESTIONS ATTEMPTED</small></div>
      </section>
      <section class="notebook-promo" aria-label="Companion revision notebook">
        <img src="./assets/notebook-cover.webp" width="90" height="128" loading="lazy" alt="Cover of Notes in Dental Sleep Medicine — integrated final edition" />
        <div class="notebook-promo-text"><div class="eyebrow">Volume I · Final integrated notebook</div><h2>Study the full revision notes alongside the questions</h2><p>Volume I now contains 177 carefully consolidated pages with ten teaching chapters and no duplicated condensed layer. All 78 outcomes map to the 1,000 SBA questions.</p>
          <div class="notebook-promo-actions"><button data-action="nav" data-view="notebook" class="btn btn-primary" type="button">Explore notebook →</button><a href="./notes.html#contents" class="btn btn-outline">Volume I chapters →</a><a href="./reader.html?doc=volume1&from=home" class="btn btn-outline">Open full PDF ↗</a></div>
        </div>
      </section>
      <section><div class="section-head"><div><div class="eyebrow">Complete syllabus coverage</div><h2>Explore the ten topics</h2></div><button class="btn btn-small btn-outline" data-action="nav" data-view="browse" type="button">Browse all questions</button></div>
      <div class="topics-grid">${TOPICS.map(t=>{const attempted=seenCount(t.id),total=topicCount(t.id);return `<article class="topic-card"><div class="topic-num">${String(t.id).padStart(2,'0')}</div><div class="topic-card-content"><h3>${safe(t.title)}</h3><div class="topic-meta">${total} questions · ${t.sections.length} learning sections · ${attempted} attempted</div><div class="mini-progress" role="progressbar" aria-valuenow="${attempted}" aria-valuemax="${total}" aria-label="Topic ${t.id} progress"><span style="width:${percent(attempted,total)}%"></span></div><button data-action="topic-quick" data-id="${t.id}" type="button">Practise this topic →</button></div></article>`}).join('')}</div></section>
      <div class="simple-ribbon"><strong>How this edition works:</strong> Read the case, choose the single best option (A–E), then use the explanation and syllabus reference to revise. In <strong>practice mode</strong> answers appear immediately; in <strong>mock exam mode</strong> they remain hidden until submission. Your progress and bookmarks are stored locally on this device.</div>`;
  }
  function renderSetup(mode){
    const exam=mode==='exam',chosenPool=exam?ui.examPool:ui.setupPool;
    return `${pageHeading(exam?'Timed simulation · No feedback until submission':'Learning mode · Immediate explanations',exam?'Mock examination':'Practice and revision',exam?'Complete an examination-length set without seeing answers. Check the complete marking and justifications after submission.':'Build a targeted question set from any of the ten competencies. Immediate feedback helps you learn from each answer.')}
      <div class="setup-layout"><section class="card"><h3>Configure your ${exam?'exam':'practice'} session</h3>
        <div class="setup-grid">
          <div class="field"><label for="setup-topic">Topic / competency</label><select id="setup-topic">${topicOptions(ui.setupTopic)}</select></div>
          <div class="field"><label for="setup-count">Number of questions</label><select id="setup-count">${(exam?[25,50,100,200,1000]:[10,20,25,50,100,1000]).map(n=>`<option value="${n}" ${String(n)===ui.setupCount?'selected':''}>${n===1000?'All 1,000':n+' questions'}</option>`).join('')}</select></div>
          <div class="field"><label for="setup-kind">Question style</label><select id="setup-kind">${kindOptions(ui.setupKind)}</select></div>
          <div class="field"><label for="setup-pool">Question selection</label><select id="setup-pool"><option value="unseen" ${chosenPool==='unseen'?'selected':''}>Unanswered questions first (new questions only)</option><option value="all" ${chosenPool==='all'?'selected':''}>All questions (including repeats)</option><option value="incorrect" ${chosenPool==='incorrect'?'selected':''}>Previously incorrect only</option><option value="bookmarked" ${chosenPool==='bookmarked'?'selected':''}>Bookmarked questions only</option></select></div>
          <div class="field"><label for="setup-order">Order</label><select id="setup-order"><option value="random">Shuffle questions</option><option value="sequential">Question-bank order</option></select></div>
        </div>
        <button data-action="start-session" data-mode="${mode}" class="btn btn-primary" type="button">${exam?'Begin mock examination':'Begin practice'} →</button>
        ${db.session&&!db.session.submitted?'<button data-action="continue" class="btn btn-outline" type="button" style="margin-left:8px">Resume previous session</button>':''}
      </section><aside class="card card-muted"><h3>${exam?'Examination rules':'Revision method'}</h3>
        <div class="mode-note">${exam?'<p><strong>One best answer per question.</strong> Choose the SINGLE most appropriate answer from A–E. Do not select multiple options.</p><p>You may change answers or revisit questions before submitting. A running clock is shown, but the test does not auto-submit.</p><p>The score, missed questions and individual explanations appear only after you finish.</p>':'<p><strong>Read → answer → explain → move on.</strong> Each response reveals the correct option, the teaching rationale and the section in your integrated notebook.</p><p>You can also reveal an answer without choosing an option. Bookmark difficult questions for later review.</p><p>Progress is saved on your browser automatically.</p>'}</div>
        <p style="font-size:12px;color:var(--muted);margin-top:18px">For a comprehensive revision set, select <strong>All ten competencies</strong> and mix clinical and knowledge questions.</p></aside></div>`;
  }
  function kindMatches(q,kind){
    if(kind==='all')return true;
    if(kind==='case')return q.kind==='Clinical decision-making SBA';
    if(kind==='application')return q.kind==='Applied clinical SBA';
    if(kind==='interpretation')return q.kind==='Clinical interpretation SBA';
    if(kind==='knowledge')return q.kind==='Focused knowledge SBA';
    return true;
  }
  function startSession(mode){
    if(db.session&&!db.session.submitted && !window.confirm('Start a new session? Your unfinished session will be replaced.'))return;
    const topic=document.getElementById('setup-topic')?.value||'all';
    const requested=Number(document.getElementById('setup-count')?.value||20);
    const count=Number.isInteger(requested)&&requested>0?Math.min(Q.length,requested):20;
    const kind=document.getElementById('setup-kind')?.value||'all';
    const order=document.getElementById('setup-order')?.value||'random';
    const pick=document.getElementById('setup-pool')?.value||'all';
    ui.setupTopic=topic;ui.setupCount=String(count);ui.setupKind=kind;
    if(mode==='exam')ui.examPool=pick;else ui.setupPool=pick;
    let pool=Q.filter(q=>(topic==='all'||String(q.topic)===topic)&&kindMatches(q,kind)
      && (pick==='all' || (pick==='unseen'&&!db.progress[q.number]) ||
          (pick==='incorrect'&&db.progress[q.number]&&!db.progress[q.number].correct) ||
          (pick==='bookmarked'&&db.bookmarks.includes(q.number)))).map(q=>q.number);
    if(!pool.length){toast('No matching questions remain. Change “Question selection” to All questions or adjust the filters.');return;}
    if(order==='random')for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    pool=pool.slice(0,Math.min(count,pool.length));
    db.session={mode:mode==='exam'?'exam':'study',order:pool,answers:{},current:0,startedAt:Date.now(),submitted:false,topic,kind,finishedAt:null};
    persist();setView('session');
    if(pool.length<count)toast('This filter has '+pool.length+' questions; all matching questions have been included.');
  }
  function record(num,value){
    const q=BY_ID.get(Number(num));if(!q)return;
    const old=db.progress[num];
    db.progress[num]={answer:value,correct:value===q.key,tries:(old?.tries||0)+1,updated:Date.now()};
  }
  function optionButtons(q,selected,reveal,enable,kind){
    return `<div class="q-options" role="group" aria-label="Answer options for question ${q.number}">${q.options.map((value,i)=>{
      let cls='option';
      if(reveal){if(i===q.key)cls+=' correct';else if(i===selected)cls+=' wrong';}
      else if(i===selected)cls+=' selected';
      const glyph=i===selected?'●':'○';
      return `<button type="button" class="${cls}" ${!enable?'disabled':''} data-action="${kind==='browse'?'noop':'answer'}" data-choice="${i}" aria-pressed="${selected===i?'true':'false'}"><span class="letter">${letters[i]}</span><span class="option-body">${rich(value)}</span></button>`;
    }).join('')}</div>`;
  }
  function explanation(q,selected,context='session'){
    const good=selected===q.key;
    const label=selected===null?'Unanswered question':selected===-1?'Answer revealed':good?'Correct answer':'Answer and explanation';
    return `<div class="answer-panel ${!good&&selected!==-1?'incorrect':''}"><h3>${label}: ${letters[q.key]} — ${rich(q.options[q.key])}</h3>${selected===-1&&context!=='browse'?'<p><strong>Revealed without an attempt — this question earns zero marks in the session.</strong></p>':selected===null?'<p><strong>Unanswered — this question earned zero marks in the session.</strong></p>':''}<p>${rich(q.rationale)}</p>
      <div class="source"><a href="./notes.html?from=${ui.view==='session'?'session':ui.view==='review'?'results':'question-'+q.number}#section-${encodeURIComponent(q.section)}" class="keypoints-inline-link">↗ Volume I §${safe(q.section)} — ${safe(sectionTitle(q.section))}</a><br/><strong>Notebook reference:</strong> ${safe(q.source||('Topic '+q.topic+' · §'+q.section))} · <strong>Learning outcome:</strong> §${safe(q.section)} (${safe(sectionTitle(q.section))})</div>
    </div>`;
  }
  function renderSession(){
    const s=db.session;if(!s)return '<div class="empty">No active session. Begin from the Practice or Mock exam page.</div>';
    if(s.submitted)return renderResults();
    s.current=Math.max(0,Math.min(s.current,s.order.length-1));
    const id=s.order[s.current],q=BY_ID.get(id);
    const has=Object.prototype.hasOwnProperty.call(s.answers,String(id));
    const selected=has?Number(s.answers[id]):null;
    const reveal=s.mode==='study'&&has;
    const done=answerCount(s),revealCount=Object.values(s.answers).filter(v=>v===-1).length;
    const isLast=s.current===s.order.length-1;
    const mark=db.bookmarks.includes(id)?'★ Bookmarked':'☆ Bookmark';
    return `<div class="page-toolbar"><div class="eyebrow">${s.mode==='exam'?'Mock examination':'Practice session'} · ${s.order.length} questions</div><button data-action="pause" class="btn btn-small btn-outline" type="button">Save & exit</button></div>
      <div class="session-top"><div class="session-meta"><span>QUESTION ${s.current+1} OF ${s.order.length} · ${done} answered${revealCount?' · '+revealCount+' revealed':''}</span><span>${s.mode==='exam'?'Exam timer':'Elapsed time'} <strong id="session-clock">${fmtTime(Date.now()-s.startedAt)}</strong></span></div><div class="session-progressbar" role="progressbar" aria-valuenow="${done}" aria-valuemax="${s.order.length}" aria-label="Answered questions"><span style="width:${percent(done,s.order.length)}%"></span></div></div>
      <article class="question card">
      <div class="question-head"><span class="question-number">QUESTION ${q.number} · TOPIC ${q.topic} / §${safe(q.section)}</span><span class="tag">${safe(q.kind)}</span></div>
      <p style="color:var(--muted);font-size:12px;margin:0">${safe(topicTitle(q.topic))}</p>
      <div class="q-stem">${rich(q.stem)}</div>
      ${optionButtons(q,selected,reveal,s.mode==='exam'||!has,'session')}
      ${reveal?explanation(q,selected):''}
      <div class="question-actions"><div class="right"><button data-action="bookmark" data-id="${id}" class="btn btn-small btn-outline" type="button">${mark}</button>${s.mode==='study'&&!has?'<button data-action="reveal" class="btn btn-small btn-soft" type="button">Reveal answer</button>':''}</div><div class="right">
        <button data-action="previous" class="btn btn-outline" type="button" ${s.current===0?'disabled':''}>← Previous</button>
        ${isLast?'<button data-action="finish" class="btn btn-teal" type="button">Finish & review →</button>':'<button data-action="next" class="btn btn-primary" type="button">Next →</button>'}
      </div></div>
      </article><div class="page-toolbar"><div class="jump"><label for="jump-input">Go to question</label><input id="jump-input" type="number" inputmode="numeric" min="1" max="${s.order.length}" value="${s.current+1}"/><button data-action="jump" class="btn btn-small btn-outline" type="button">Go</button></div><button data-action="finish" class="btn btn-small btn-soft" type="button">${s.mode==='exam'?'Submit exam':'End session'}</button></div>
      <p class="notice">${s.mode==='exam'?'Answer explanations are hidden until you submit. Your selections are saved locally.':'After you answer, read the reasoning—even when your choice is correct. Only one A–E response is marked correct.'}</p>`;
  }
  function answer(choice){
    const s=db.session;if(!s||s.submitted)return;
    const id=s.order[s.current];
    if(!validChoice(choice))return;
    if(s.mode==='study'&&Object.prototype.hasOwnProperty.call(s.answers,String(id)))return;
    s.answers[id]=choice;
    if(s.mode==='study')record(id,choice);
    persist();render();
  }
  function finish(){
    const s=db.session;if(!s||s.submitted)return;
    const stats=scoreSession(s);
    const omitted=stats.unanswered+stats.revealed;
    if(omitted && !window.confirm(`Finish now? ${stats.unanswered} unanswered and ${stats.revealed} answer-revealed question(s) will each score zero. Your score will be out of all ${stats.total} questions.`))return;
    if(s.mode==='exam')for(const id of s.order){if(validChoice(s.answers[id]))record(id,s.answers[id]);}
    s.submitted=true;s.finishedAt=Date.now();ui.missedPage=1;
    db.history.unshift({date:s.finishedAt,mode:s.mode,total:stats.total,answered:stats.answered,correct:stats.correct,topic:s.topic,revealed:stats.revealed,unanswered:stats.unanswered});
    db.history=db.history.slice(0,35);
    persist();setView('results');
  }
  function renderResults(){
    const s=db.session;if(!s||!s.submitted)return `<div class="empty">No completed session. <button data-action="nav" data-view="practice" class="btn btn-small btn-outline">Start practice</button></div>`;
    const stats=scoreSession(s),{correct,total,answered,revealed,unanswered}=stats;
    const missed=s.order.filter(id=>s.answers[id]!==BY_ID.get(id).key);
    const limit=25,pages=Math.max(1,Math.ceil(missed.length/limit));
    ui.missedPage=Math.min(Math.max(ui.missedPage,1),pages);
    const offset=(ui.missedPage-1)*limit;
    return `${pageHeading('Session complete',s.mode==='exam'?'Examination results':'Practice results','Scoring is based on the revised examination-style answer key; every question counts once. Unanswered and revealed-only questions receive zero marks.')}
      <div class="score-hero"><div><div class="eyebrow">Final score</div><div class="score">${percent(correct,total)}% <small>${correct} / ${total} correct</small></div>
        <p style="margin:12px 0 0;color:var(--muted)">${answered} answered (${stats.incorrect} incorrect) · ${revealed} revealed · ${unanswered} unanswered · ${fmtTime((s.finishedAt||Date.now())-s.startedAt)} elapsed</p></div>
      <div style="display:flex;gap:9px;flex-wrap:wrap"><button data-action="nav" data-view="practice" class="btn btn-primary" type="button">New practice set</button><button data-action="nav" data-view="progress" class="btn btn-outline" type="button">Review progress</button></div></div>
      <section class="card" style="margin-bottom:21px"><h3>Review incorrect, revealed and unanswered questions (${missed.length})</h3>
        ${missed.length?`<div class="review-list">${missed.slice(offset,offset+limit).map(id=>{const q=BY_ID.get(id);const status=s.answers[id]===-1?'Revealed only':validChoice(s.answers[id])?'Incorrect answer':'Unanswered';return `<div class="review-item"><span class="question-number">Q${id} · ${status}</span><p>${rich(q.stem)}</p><button data-action="review" data-id="${id}" type="button">View explanation</button></div>`}).join('')}</div>
          <div class="pagination"><button class="btn btn-small btn-outline" data-action="missed-prev" type="button" ${ui.missedPage===1?'disabled':''}>← Previous</button><span>Page ${ui.missedPage} / ${pages}</span><button class="btn btn-small btn-outline" data-action="missed-next" type="button" ${ui.missedPage===pages?'disabled':''}>Next →</button></div>`:'<p style="color:var(--green)">Excellent — no incorrect or unanswered responses in this session.</p>'}</section>
      <section class="card"><h3>Review any question from this session</h3><div class="jump"><label for="review-jump">Session question</label><input id="review-jump" type="number" inputmode="numeric" min="1" max="${s.order.length}" placeholder="1"/><button data-action="review-jump" class="btn btn-small btn-outline" type="button">Review</button></div></section>`;
  }
  function renderReview(){
    const q=BY_ID.get(Number(ui.reviewId)),s=db.session;
    if(!q||!s||!s.submitted||!s.order.includes(q.number))return '<div class="empty">Review question unavailable. <button data-action="nav" data-view="results" class="btn btn-small btn-outline">Back to results</button></div>';
    const value=Object.prototype.hasOwnProperty.call(s.answers,String(q.number))?s.answers[q.number]:null;
    return `<button data-action="nav" data-view="results" class="btn btn-small btn-outline" type="button">← Back to results</button>
      <article class="question card"><div class="question-head"><span class="question-number">REVIEW · QUESTION ${q.number}</span><span class="tag">Topic ${q.topic} · §${safe(q.section)}</span></div>
      <div class="q-stem">${rich(q.stem)}</div>${optionButtons(q,value,true,false,'browse')}${explanation(q,value)}</article>`;
  }
  function filteredBrowse(){
    const search=ui.browseSearch.trim().toLowerCase();
    return Q.filter(q=>{
      if(ui.browseTopic!=='all'&&String(q.topic)!==ui.browseTopic)return false;
      if(!kindMatches(q,ui.browseKind))return false;
      if(ui.browseSection!=='all'&&q.section!==ui.browseSection)return false;
      if(ui.browseBookmarks&&!db.bookmarks.includes(q.number))return false;
      if(search && !(String(q.number)+' '+q.stem+' '+q.options.join(' ')+' '+q.rationale+' '+q.section).toLowerCase().includes(search))return false;
      return true;
    });
  }
  function sectionOptions(){
    let sections=ui.browseTopic==='all'?TOPICS.flatMap(t=>t.sections):TOPICS.find(t=>String(t.id)===ui.browseTopic)?.sections||[];
    return '<option value="all">Every syllabus section</option>'+sections.map(s=>`<option value="${s.id}" ${s.id===ui.browseSection?'selected':''}>§${safe(s.id)} · ${safe(s.title)}</option>`).join('');
  }
  function renderBrowse(){
    return `${pageHeading('Search and targeted revision','Browse all questions','Explore the full 1,000-question bank, find a topic or learning code, and bookmark difficult items for further revision.')}
    <section class="card" style="box-shadow:none;margin-bottom:17px"><div class="browse-filters"><div class="field"><label for="browse-search">Search questions and explanations</label><input id="browse-search" type="search" placeholder="e.g. bruxism, AHI, titration, consent" value="${safe(ui.browseSearch)}" autocomplete="off" /></div>
    <div class="field"><label for="browse-topic">Competency</label><select id="browse-topic">${topicOptions(ui.browseTopic)}</select></div><div class="field"><label for="browse-kind">Question type</label><select id="browse-kind">${kindOptions(ui.browseKind)}</select></div></div>
    <div class="browse-secondary"><div class="field" style="flex:1"><label for="browse-section">Learning outcome section</label><select id="browse-section">${sectionOptions()}</select></div><label class="checkbox-row" style="min-height:45px"><input id="browse-bookmarks" type="checkbox" ${ui.browseBookmarks?'checked':''}/> Bookmarked only (${db.bookmarks.length})</label></div></section>
    <div id="browse-results"></div>`;
  }
  function renderBrowseResults(){
    const box=document.getElementById('browse-results');if(!box)return;
    const matches=filteredBrowse(),limit=20,pages=Math.max(1,Math.ceil(matches.length/limit));
    ui.browsePage=Math.max(1,Math.min(ui.browsePage,pages));
    const start=(ui.browsePage-1)*limit;
    box.innerHTML=`<div class="results-meta"><span><strong>${matches.length}</strong> matching questions</span><span>Page ${ui.browsePage} of ${pages}</span></div>
      ${matches.length?`<div class="browse-list">${matches.slice(start,start+limit).map(q=>`<article class="browse-item"><div class="browse-num">Q${q.number}</div><div class="content"><p>${rich(q.stem)}</p><small>Topic ${q.topic} · §${safe(q.section)} · ${safe(q.kind)} ${db.bookmarks.includes(q.number)?' · ★':''}</small></div><button type="button" data-action="browse-open" data-id="${q.number}">Open →</button></article>`).join('')}</div>`:'<div class="empty">No questions match these filters. Try a different topic or search term.</div>'}
      ${matches.length?`<div class="pagination"><button class="btn btn-small btn-outline" type="button" data-action="browse-prev" ${ui.browsePage===1?'disabled':''}>← Previous</button><span style="font-size:12px;color:var(--muted)">${start+1}–${Math.min(start+limit,matches.length)} of ${matches.length}</span><button class="btn btn-small btn-outline" type="button" data-action="browse-next" ${ui.browsePage===pages?'disabled':''}>Next →</button></div>`:''}`;
  }
  function renderBrowseDetail(){
    const q=BY_ID.get(Number(ui.browseDetail));
    if(!q)return '<div class="empty">Question not found. <button data-action="nav" data-view="browse" class="btn btn-small btn-outline">Back to all questions</button></div>';
    return `<button data-action="nav" data-view="browse" class="btn btn-small btn-outline" type="button">← Back to question list</button>
      <article class="question card"><div class="question-head"><span class="question-number">QUESTION ${q.number} · TOPIC ${q.topic} / §${safe(q.section)}</span><span class="tag">${safe(q.kind)}</span></div>
      <p style="color:var(--muted);font-size:12px">${safe(topicTitle(q.topic))}</p><div class="q-stem">${rich(q.stem)}</div>
      ${optionButtons(q,-1,ui.browseReveal,false,'browse')}
      ${ui.browseReveal?explanation(q,-1,'browse'):''}
      <div class="question-actions"><button data-action="practice-one" data-id="${q.number}" type="button" class="btn btn-small btn-primary">Answer this SBA · scored</button><button data-action="bookmark" data-id="${q.number}" type="button" class="btn btn-small btn-outline">${db.bookmarks.includes(q.number)?'★ Bookmarked':'☆ Bookmark'}</button>${!ui.browseReveal?'<button data-action="browse-reveal" type="button" class="btn btn-teal">Reveal answer and justification</button>':''}</div></article>`;
  }
  function renderProgress(){
    const seen=Object.keys(db.progress).length;
    const correct=Object.values(db.progress).filter(x=>x.correct).length;
    return `${pageHeading('Personal revision record','Your progress','Your answers, bookmarked questions and recent sessions are saved in your browser on this device. They are not transmitted to a server.')}
      <div class="progress-grid"><div class="stat"><b>${seen} / ${Q.length}</b><small>UNIQUE QUESTIONS ANSWERED · ${percent(seen,Q.length)}% COMPLETE</small></div><div class="stat"><b>${seen?percent(correct,seen)+'%':'—'}</b><small>ACCURACY OF MOST RECENT ANSWER PER QUESTION</small></div><div class="stat"><b>${db.bookmarks.length}</b><small>BOOKMARKED QUESTIONS</small></div></div>
      ${db.session&&!db.session.submitted?`<div class="callout" style="margin-bottom:19px"><strong>Unfinished ${db.session.mode==='exam'?'mock exam':'practice set'}:</strong> ${answerCount(db.session)} of ${db.session.order.length} answered. <button data-action="continue" class="btn btn-small btn-primary" type="button">Resume session →</button></div>`:''}
      <div class="card" style="margin-bottom:20px"><h3>Competency coverage</h3><div style="overflow-x:auto"><table class="smalltable"><thead><tr><th>Learning topic</th><th>Attempted</th><th>Correct</th><th>Progress</th></tr></thead><tbody>${TOPICS.map(t=>{const n=seenCount(t.id),total=topicCount(t.id),a=accuracy(t.id);return `<tr><td><strong>${t.id}.</strong> ${safe(t.title)}</td><td>${n}/${total}</td><td class="accuracy">${a===null?'—':a+'%'}</td><td style="min-width:100px"><div class="mini-progress" aria-label="${percent(n,total)} percent attempted"><span style="width:${percent(n,total)}%"></span></div></td></tr>`}).join('')}</tbody></table></div></div>
      <div class="card" style="margin-bottom:20px"><h3>Recent sessions</h3>${db.history.length?db.history.slice(0,10).map(h=>`<div class="history"><div><strong>${h.mode==='exam'?'Mock examination':'Practice'}</strong> · ${h.topic==='all'?'All topics':'Topic '+h.topic}<br/><span>${fmtDate(h.date)} · ${h.answered}/${h.total} answered</span></div><div class="accuracy">${h.correct}/${h.total} · ${percent(h.correct,h.total)}%</div></div>`).join(''):'<p style="color:var(--muted);font-size:13px">No finished sessions yet. Start a practice set to track your results.</p>'}</div>
      ${legacyAvailable?`<div class="notice" role="note" style="margin-bottom:18px"><strong>Previous question-bank edition detected.</strong> Your earlier progress is preserved separately and is not counted toward this revised bank (its answer choices have changed). <button data-action="legacy-export" class="btn btn-small btn-outline" type="button">Export original progress</button></div>`:''}
      <div class="card"><h3>Manage your revision history</h3><p style="font-size:13px;color:var(--muted)">Export your local data before changing devices. Progress does not automatically sync between an iPhone, iPad and computer.</p><div style="display:flex;flex-wrap:wrap;gap:10px"><button data-action="export" type="button" class="btn btn-outline">↓ Export progress JSON</button><label for="import-progress" class="btn btn-outline" style="cursor:pointer">↑ Import progress JSON</label><input id="import-progress" type="file" accept=".json,application/json" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none" aria-label="Import progress file"/>${db.bookmarks.length?'<button data-action="browse-bookmarked" type="button" class="btn btn-outline">★ Review bookmarks</button>':''}<button data-action="reset" type="button" class="btn btn-danger">Clear saved progress</button></div></div>`;
  }
  function renderKeypoints(){
    const query=String(location.hash||'').split('?')[1]||'';
    const desired=Number(new URLSearchParams(query).get('topic'))||1;
    const data=KEYPOINTS.find(k=>k.id===desired)||KEYPOINTS[0];
    if(!data)return '<div class="empty">Keypoint data unavailable. Re-upload the entire website folder, including data/keypoints.js.</div>';
    const m=NOTEBOOK_MAP.find(x=>x.id===data.id),pdfAt=(page)=>readPDF(page,'keypoints','volume1',data.id);
    return `${pageHeading('Volume I · Clinical revision','SBA clinical keypoints','The revision layer for 78 syllabus learning outcomes: decisions first, details second. Select a competency; links below can take you to the full illustrated PDF or matching SBA items.')}
      <div class="notice"><strong>Volume I is now organised by chapters.</strong> <a href="./notes.html?from=keypoints&topic=${data.id}#chapter-${data.id}">Open Chapter ${data.id} with all exact SBA links →</a></div>
      <section class="keypoints-toolbar card"><div><div class="eyebrow">Select your competency</div><div class="keypoints-tabs">${KEYPOINTS.map(t=>`<a class="keypoint-tab ${t.id===data.id?'active':''}" href="#keypoints?topic=${t.id}" aria-label="Topic ${t.id}">${String(t.id).padStart(2,'0')}</a>`).join('')}</div></div>
      <div class="keypoints-buttons"><a class="btn btn-small btn-outline" href="${pdfAt(m.key[0])}">Open updated keypoints in PDF ↗</a><a class="btn btn-small btn-outline" href="${pdfAt(m.detail[0])}">Detailed source chapter ↗</a></div></section>
      <section class="keypoints-heading"><div class="eyebrow">TOPIC ${String(data.id).padStart(2,'0')}</div><h2>${safe(data.title)}</h2><p>${safe(data.lens)}</p></section>
      <section class="card keypoint-section"><h3>Exam-ready keypoints <span class="quiet">${data.points.length} syllabus sections</span></h3>
      ${data.points.map(p=>`<article class="keypoint-line"><span class="keypoint-code">§${safe(p.section)}</span><div><strong>${safe(sectionTitle(p.section))}</strong><p>${safe(p.text)}</p></div></article>`).join('')}</section>
      <section class="keypoint-case-section"><h3>Clinical SBA decisions</h3><div class="keypoint-cases">${data.cases.map((c,i)=>`<article class="keypoint-case"><div class="eyebrow">CASE ${String(i+1).padStart(2,'0')}</div><h4>${safe(c.situation)}</h4><p><strong>Preferred action:</strong> ${safe(c.decision)}</p><p><strong>Why this is best:</strong> ${safe(c.why)}</p></article>`).join('')}</div></section>
      <section class="card keypoint-traps"><h3>Examiner traps and decision rule</h3>${data.pitfalls.map(t=>`<p><strong>Watch out:</strong> ${safe(t)}</p>`).join('')}<div class="keypoint-cue"><strong>EXAMINER CUE</strong> ${safe(data.cue)}</div></section>
      <section class="card keypoint-practice"><h3>Practise this competency</h3><div class="keypoint-practice-links">${data.practice.map(id=>`<a href="#browse-detail?question=${id}" class="btn btn-small btn-outline">Review Q${id} →</a>`).join('')}<button data-action="topic-quick" data-id="${data.id}" class="btn btn-small btn-primary" type="button">Start Topic ${data.id} practice</button></div></section>
      <section class="card keypoint-evidence"><h3>Evidence and limits</h3><p>The keypoints are an editorial aid based on the supplied integrated notebook, with selected guidance-sensitive statements checked against published standards. They do not replace the full chapters or the professional guidelines. The 2025 AADSM standards note that a qualified dentist may order/administer an HSAT where lawful, while diagnosis remains with an authorised medical provider.</p>
      <ul><li><a href="https://www.aadsm.org/journal/special_article_1_issue_122.php" target="_blank" rel="noopener">AADSM Dental Sleep Medicine Standards (2025)</a></li>
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4481062/" target="_blank" rel="noopener">AASM/AADSM oral appliance guideline (2015)</a></li>
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5337595/" target="_blank" rel="noopener">AASM adult diagnostic testing guideline (2017)</a></li>
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10840779/" target="_blank" rel="noopener">ATS persistent paediatric OSA guideline (2024)</a></li></ul></section>`;
  }
  function renderNotebook(){
    const pages=(a)=>`${a[0]}–${a[1]}`;
    const pdfAt=(page)=>readPDF(page,'notebook');
    return `${pageHeading('Volume I · Clinical keypoints updated','Notes in Dental Sleep Medicine','The chaptered Volume I reader maps 78 learning outcomes to all 1,000 exact SBA questions; the original notes and full explanations remain available in the PDF.')}
      <section class="notebook-overview card">
        <img src="./assets/notebook-cover.webp" width="200" height="285" alt="Cover of Notes in Dental Sleep Medicine" />
        <div class="notebook-overview-text"><div class="eyebrow">November 2026 · Clinical SBA keypoint revision</div><h2>Updated integrated revision notebook</h2>
          <p>78 revised learning-outcome takeaways, 30 clinical mini-cases and examiner traps, with the original comprehensive teaching content preserved.</p>
          <div class="notebook-promo-actions"><a href="./notes.html#contents" class="btn btn-primary">Open Volume I · Chapter reader →</a><a href="./reader.html?doc=volume1&from=notebook" class="btn btn-primary">Open updated PDF ↗</a><a class="btn btn-outline" href="./notes.html#chapter-1">Study chapter 1 in HTML →</a></div>
          <p class="notebook-fineprint">The consolidated 177-page Volume I notebook includes a clickable chapter contents page and an SBA concordance at each chapter opening. Download it into Files if your iPhone/iPad PDF viewer does not retain it offline.</p>
        </div>
      </section>
      <section class="notebook-guide"><div class="section-head"><div><div class="eyebrow">Choose what to revise</div><h2>Ten competencies, three layers</h2></div></div>
        <div class="notebook-topic-list">${NOTEBOOK_MAP.map(t=>{
          const title=topicTitle(t.id);
          return `<article class="notebook-topic"><div class="notebook-topic-number">${String(t.id).padStart(2,'0')}</div>
            <div class="notebook-topic-content"><h3>${safe(title)}</h3><p>Clinical guide: pp. ${pages(t.key)} · Full explanations: pp. ${pages(t.detail)}</p>
            <div class="notebook-topic-links"><a href="./notes.html#chapter-${t.id}">Read chapter in HTML →</a><a href="${pdfAt(t.key[0])}">Keypoints PDF ↗</a><a href="./notes.html#chapter-${t.id}">Clinical SBA links →</a><a href="${pdfAt(t.detail[0])}">Full explanation ↗</a></div></div></article>`}).join('')}</div>
      </section>
      <section class="notebook-extras"><h2>Examination quick links</h2><div class="notebook-extra-grid">
        <a href="${pdfAt(4)}" class="notebook-extra"><strong>Master number tables</strong><span>Pages 4–6 · Interpret values in clinical context ↗</span></a>
        <a href="${pdfAt(168)}" class="notebook-extra"><strong>Original 60-question mock</strong><span>Pages 168–173 · Original self-assessment ↗</span></a>
        <a href="${pdfAt(174)}" class="notebook-extra"><strong>Abbreviations & source references</strong><span>Pages 174–177 ↗</span></a>
      </div></section>
      <div class="notice" role="note">PDF page-jump links depend on the viewer. Some iOS PDF viewers start at page one; use the page numbers above or PDF bookmarks. The HTML keypoint pages work without a PDF viewer after the website is installed offline.</div>`;
  }
  function renderAbout(){
    return `${pageHeading('About this edition','About, downloads & installation','A complete standalone web version of the Dental Sleep Medicine (IFDSM) examination revision question bank.')}
      <div class="about-grid"><section class="card"><h3>What is included</h3><ul><li>1,000 five-option single-best-answer questions.</li><li>160 clinician-oriented decision cases, 424 applied clinical SBAs, 369 interpretation questions and 47 focused knowledge questions; all with one best option.</li><li>Answer justification and reference to one of 78 syllabus sections.</li><li>Study mode, mock examinations, searchable bank, bookmarks and personal progress.</li><li>Automatic local saving, resume after closing the browser, score breakdown and offline access after the first successful online visit.</li></ul></section>
      <section class="card"><h3>Reference PDF books</h3><p>The consolidated 177-page notebook supplied for this website is available with its original cover, tables and illustrations. Use the dedicated notebook page for topic-level page references.</p>
      <button data-action="nav" data-view="notebook" type="button" class="btn btn-small btn-outline">Browse notebook chapters →</button><p></p>
      <a href="./reader.html?doc=volume1&from=about">↗ Dental Sleep Medicine IFDSM — Consolidated Volume I (177 pages)</a><p></p>
      <a href="./reader.html?doc=questions&from=about">↗ The Question Bank — Author Edition (PDF)</a>
      <p style="margin-top:17px;color:var(--muted)">The website and question data work without a PDF viewer; these files are additional reference material.</p></section>
      <section class="card"><h3>Add the website to your iPhone / iPad</h3><ol style="padding-left:19px;color:var(--ink-soft);font-size:13px;line-height:1.9"><li>Open your published GitHub Pages website in <strong>Safari</strong>.</li><li>Tap <strong>Share</strong> and choose <strong>Add to Home Screen</strong>.</li><li>Open the new IFDSM icon and begin studying.</li><li>Visit online once after updates to ensure the latest questions are available offline.</li></ol></section>
      <section class="card"><h3>Author and academic note</h3><p><strong>Dr. Kam O Man, Owen</strong><br/>BDS (HK) · MFDS RCSEd · MFDS RCPS (Glasg)<br/>MClinDent (Fixed and Removable Prosthodontics) (KCL)<br/>MImpDent (RCSEd) · MGDS RCSI</p>
      <p>This educational website is an independently prepared revision resource based on the accompanying notebook. It is not an official IFDSM publication, not endorsed by the examining body, and not a substitute for an individual patient assessment or current professional guidance.</p></section></div>
      <div class="callout" style="margin-top:24px"><strong>Privacy and public hosting:</strong> No sign-in, remote database, tracking or analytics are included. Answers and bookmarks are stored on your device through browser storage. GitHub Pages publishes site content publicly; do not add patient-identifiable information or other confidential material to this repository.</div>`;
  }
  function revisionReturnNav(){
    const chapter = ui.view==='keypoints' ? Number(new URLSearchParams((location.hash.split('?')[1]||'')).get('topic'))||1 : 1;
    return `<nav class="revision-return" aria-label="Revision navigation"><a href="#home">← Home</a><a href="#notebook">Notebook overview</a><a href="./notes.html#contents">All chapters</a>${ui.view==='keypoints'?`<a href="./notes.html#chapter-${chapter}">Chapter ${chapter}</a>`:''}</nav>`;
  }
  function render(){
    setActiveNav();
    switch(ui.view){
      case 'home':root.innerHTML=renderHome();break;
      case 'practice':root.innerHTML=renderSetup('study');break;
      case 'exam':root.innerHTML=renderSetup('exam');break;
      case 'session':root.innerHTML=renderSession();break;
      case 'results':root.innerHTML=renderResults();break;
      case 'review':root.innerHTML=renderReview();break;
      case 'browse':root.innerHTML=renderBrowse();renderBrowseResults();break;
      case 'browse-detail':root.innerHTML=renderBrowseDetail();break;
      case 'progress':root.innerHTML=renderProgress();break;
      case 'notebook':root.innerHTML=renderNotebook();break;
      case 'keypoints':root.innerHTML=renderKeypoints();break;
      case 'about':root.innerHTML=renderAbout();break;
      default:root.innerHTML=renderHome();
    }
    if(ui.view==='notebook'||ui.view==='keypoints')root.innerHTML=revisionReturnNav()+root.innerHTML;
  }
  function downloadProgress(){
    const data={type:'IFDSM revision progress',version:3,bank:'ifdsm-examstyle-v2',exported_at:new Date().toISOString(),bookmarks:db.bookmarks,progress:db.progress,history:db.history,session:db.session};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='IFDSM_Revision_Progress_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-action]');if(!btn||btn.disabled)return;
    const a=btn.dataset.action;
    event.preventDefault();
    if(a==='nav'){setView(btn.dataset.view);return;}
    if(a==='theme'){db.theme=db.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=db.theme;persist();return;}
    if(a==='topic-quick'){ui.setupTopic=btn.dataset.id;ui.setupKind='all';ui.setupCount='20';ui.setupPool='unseen';setView('practice');return;}
    if(a==='start-session'){startSession(btn.dataset.mode);return;}
    if(a==='continue'){setView(db.session?.submitted?'results':db.session?'session':'practice');return;}
    if(a==='pause'){setView('home');toast('Session saved on this device.');return;}
    if(a==='answer'){answer(Number(btn.dataset.choice));return;}
    if(a==='reveal'){const s=db.session,id=s?.order[s.current];if(s && s.mode==='study' && !Object.prototype.hasOwnProperty.call(s.answers,String(id))){s.answers[id]=-1;persist();render();}return;}
    if(a==='previous'||a==='next'){const s=db.session;if(s){s.current=Math.max(0,Math.min(s.order.length-1,s.current+(a==='next'?1:-1)));persist();render();window.scrollTo({top:0,behavior:'instant'});}return;}
    if(a==='jump'){const s=db.session;let target=Number(document.getElementById('jump-input')?.value||0);if(s&&target>=1&&target<=s.order.length){s.current=target-1;persist();render();window.scrollTo({top:0,behavior:'instant'});}else toast('Enter a valid session question number.');return;}
    if(a==='finish'){finish();return;}
    if(a==='review'){ui.reviewId=Number(btn.dataset.id);setView('review');return;}
    if(a==='review-jump'){const s=db.session,v=Number(document.getElementById('review-jump')?.value||0);if(s&&v>=1&&v<=s.order.length){ui.reviewId=s.order[v-1];setView('review');}else toast('Enter a valid session question number.');return;}
    if(a==='browse-prev'||a==='browse-next'){ui.browsePage+=a==='browse-next'?1:-1;renderBrowseResults();window.scrollTo({top:0,behavior:'instant'});return;}
    if(a==='missed-prev'||a==='missed-next'){ui.missedPage+=a==='missed-next'?1:-1;render();window.scrollTo({top:0,behavior:'instant'});return;}
    if(a==='browse-open'){ui.browseDetail=Number(btn.dataset.id);ui.browseReveal=false;setView('browse-detail');return;}
    if(a==='practice-one'){const id=Number(btn.dataset.id),q=BY_ID.get(id);if(!q)return;
      if(db.session && !db.session.submitted && !window.confirm('Start a single-question practice? Your unfinished session will be replaced.'))return;
      db.session={mode:'study',order:[id],answers:{},current:0,startedAt:Date.now(),submitted:false,topic:String(q.topic),kind:'all',finishedAt:null};
      persist();setView('session');return;}
    if(a==='browse-reveal'){ui.browseReveal=true;render();return;}
    if(a==='bookmark'){const id=Number(btn.dataset.id);const k=db.bookmarks.indexOf(id);if(k<0)db.bookmarks.push(id);else db.bookmarks.splice(k,1);persist();render();toast(k<0?'Question bookmarked.':'Bookmark removed.');return;}
    if(a==='browse-bookmarked'){ui.browseBookmarks=true;ui.browseTopic='all';ui.browseSection='all';ui.browseKind='all';ui.browsePage=1;setView('browse');return;}
    if(a==='legacy-export'){
      try { const content=localStorage.getItem(LEGACY_KEY); if(!content){toast('No earlier progress was found.');return;}
        const blob=new Blob([content],{type:'application/json'});const url=URL.createObjectURL(blob);
        const anchor=document.createElement('a');anchor.href=url;anchor.download='IFDSM_Previous_Edition_Progress.json';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      } catch(e){toast('Could not export previous progress.');}return;
    }
    if(a==='export'){downloadProgress();return;}
    if(a==='reset'&&window.confirm('Delete all local answers, bookmarks and exam history from this browser? This cannot be undone.')){db.progress={};db.bookmarks=[];db.history=[];db.session=null;persist();render();toast('Local progress cleared.');return;}
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='browse-search'){ui.browseSearch=event.target.value;ui.browsePage=1;renderBrowseResults();}
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='import-progress'){
      const file=el.files?.[0];if(!file)return;
      file.text().then(content=>{
        let parsed;try{parsed=JSON.parse(content);}catch(e){toast('This is not a valid JSON file.');return;}
        if(parsed.type!=='IFDSM revision progress'||parsed.bank!=='ifdsm-examstyle-v2'||parsed.version!==3||!parsed.progress||!Array.isArray(parsed.bookmarks)||!Array.isArray(parsed.history)){
          toast('This file belongs to a different question-bank edition or is invalid. Import a backup from this Exam-Style edition.');return;
        }
        if(!window.confirm('Replace the local question progress, bookmarks and history on this device with the imported file?'))return;
        const imported={};
        for(const [id,value] of Object.entries(parsed.progress)){
          const q=BY_ID.get(Number(id));if(!q||!value||typeof value!=='object')continue;
          const a=value.answer;
          if(!validChoice(a))continue;
          imported[q.number]={answer:a,correct:a===q.key,tries:Math.max(1,Math.min(10000,Number(value.tries)||1)),updated:Number(value.updated)||Date.now()};
        }
        db.progress=imported;
        db.bookmarks=[...new Set(parsed.bookmarks.map(Number).filter(n=>BY_ID.has(n)))];
        db.history=parsed.history.filter(h=>h && ['study','exam'].includes(h.mode) &&
          Number.isInteger(h.total) && h.total>0 && h.total<=Q.length &&
          Number.isInteger(h.correct) && h.correct>=0 && h.correct<=h.total &&
          Number.isInteger(h.answered) && h.answered>=h.correct && h.answered<=h.total &&
          (h.topic==='all'||TOPICS.some(t=>String(t.id)===String(h.topic))) && Number.isFinite(h.date)).slice(0,35);
        db.session=cleanSession(parsed.session);
        persist();render();toast('Revision progress imported successfully.');
      }).catch(()=>toast('Could not read the selected file.'));
      return;
    }
    if(el.id==='browse-topic'){ui.browseTopic=el.value;ui.browsePage=1;ui.browseSection='all';render();}
    if(el.id==='browse-kind'){ui.browseKind=el.value;ui.browsePage=1;renderBrowseResults();}
    if(el.id==='browse-section'){ui.browseSection=el.value;ui.browsePage=1;renderBrowseResults();}
    if(el.id==='browse-bookmarks'){ui.browseBookmarks=el.checked;ui.browsePage=1;renderBrowseResults();}
    if(el.id==='setup-topic'){ui.setupTopic=el.value;}
    if(el.id==='setup-kind'){ui.setupKind=el.value;}
    if(el.id==='setup-count'){ui.setupCount=el.value;}
    if(el.id==='setup-pool'){if(ui.view==='exam')ui.examPool=el.value;else ui.setupPool=el.value;}
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&event.target.id==='jump-input'){event.preventDefault();document.querySelector('[data-action="jump"]')?.click();}
    if(event.key==='Enter'&&event.target.id==='review-jump'){event.preventDefault();document.querySelector('[data-action="review-jump"]')?.click();}
    if(ui.view!=='session'||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(event.key==='ArrowRight'){document.querySelector('[data-action="next"]')?.click();}
    if(event.key==='ArrowLeft'){document.querySelector('[data-action="previous"]')?.click();}
    if(/^[1-5]$/.test(event.key)){const el=document.querySelector(`[data-action="answer"][data-choice="${Number(event.key)-1}"]`);if(el&&!el.disabled)el.click();}
  });
  function followUrl(){
    const view=routeFromHash();
    if(view!==ui.view || view==='review' || view==='browse-detail' || view==='keypoints'){
      ui.view=view;render();
    }
  }
  window.addEventListener('hashchange',followUrl);
  window.addEventListener('popstate',followUrl);
  setInterval(()=>{const el=document.getElementById('session-clock');if(el&&db.session&&!db.session.submitted)el.textContent=fmtTime(Date.now()-db.session.startedAt);},1000);
  render();
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
