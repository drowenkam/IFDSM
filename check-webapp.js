'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=require('path').resolve(__dirname,'..')+'/';
const data=fs.readFileSync(base+'data/questions.js','utf8');
const keydata=fs.readFileSync(base+'data/keypoints.js','utf8');
const app=fs.readFileSync(base+'assets/app.js','utf8');
let results=[];
function test(label, f){try{f();results.push(['PASS',label]);}catch(e){results.push(['FAIL',label, e.stack||e.message]);}}
function newApp(saved={},hash='#home'){
 let mem=saved;
 const root={innerHTML:''},browse={innerHTML:''};
 const toast={textContent:'',classList:{add(){},remove(){}}};
 const elements={'main-app':root,'toast':toast,'browse-results':browse};
 const listeners={},winListeners={};
 const doc={documentElement:{dataset:{}},
   getElementById(id){return elements[id]||null;},
   querySelectorAll(selector){return [];},
   querySelector(selector){return null;},
   addEventListener(name,cb){listeners[name]=cb;},
   createElement(){return {href:'',download:'',click(){},remove(){}};},
   body:{appendChild(){}},activeElement:{tagName:'BODY'}};
 const loc={hash,protocol:'file:'};
 const hist={pushState(_state,_unused,href){loc.hash=href;},replaceState(_state,_unused,href){loc.hash=href;}};
 const localStorage={getItem(key){return mem[key]||null;},setItem(key,val){mem[key]=val;},removeItem(key){delete mem[key];}};
 const windows={location:loc,confirm:()=>true,scrollTo(){},addEventListener(name,cb){winListeners[name]=cb;}};
 const context={window:windows,document:doc,location:loc,history:hist,localStorage,navigator:{},
   setTimeout(){return 0;},clearTimeout(){},setInterval(){},console,Date,Math,Number,JSON,URL,URLSearchParams,
   Blob,Array,Object,Map,Set,String,RegExp};
 vm.runInNewContext(data,context,{filename:'questions.js'});
 vm.runInNewContext(keydata,context,{filename:'keypoints.js'});
 vm.runInNewContext(app,context,{filename:'app.js'});
 function click(a,dataset={}){if(!listeners.click)throw Error('No click handler');
   listeners.click({target:{closest(){return {dataset:{action:a,...dataset},disabled:false};}},preventDefault(){}});
 }
 function change(id,value){elements[id]={value};listeners.change({target:{id,value}});}
 function setInput(id,value){elements[id]={value};}
 function load(reHash){return newApp(mem,reHash||loc.hash);}
 function state(){return JSON.parse(mem['ifdsm-sba-examstyle-v2']||'null');}
 return {root,browse,toast,elements,loc,winListeners,mem,ctx:context,click,change,setInput,load,state};
}
let a=newApp();
const Q=a.ctx.window.IFDSM_QUESTIONS,TOPICS=a.ctx.window.IFDSM_TOPICS;
test('exactly 1,000 unique questions across 10 topics / 78 syllabus sections',()=>{
 assert.equal(Q.length,1000);assert.equal(new Set(Q.map(q=>q.number)).size,1000);
 assert.equal(TOPICS.length,10);assert.equal(TOPICS.reduce((s,t)=>s+t.sections.length,0),78);
});
test('all questions have five options, valid one-best-answer key and teaching text',()=>{
 assert(Q.every(q=>q.options?.length===5&&Number.isInteger(q.key)&&q.key>=0&&q.key<=4&&q.stem&&q.rationale));
 assert(Q.every(q=>TOPICS.find(t=>t.id===q.topic)?.sections.some(s=>s.id===q.section)));
});
test('question keys match the separate 1,000-row published answer CSV',()=>{
 const csv=fs.readFileSync(base+'qa/answer_key.csv','utf8').replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);
 // Answer column is comma-free, so checking first four fields is safe despite quoted reference commas.
 assert.equal(csv.length,1001);
 for(let i=1;i<csv.length;i++){
  const cols=csv[i].split(',');const n=+cols[0], answer=cols[3];
  assert.equal(n,i);assert.equal(answer,String.fromCharCode(65+Q[i-1].key),`Q${i}`);
 }
});
test('all / none of the above eliminated and all choices remain independent',()=>{
 assert(Q.every(q=>!q.options.some(v=>/^(?:all|none) of the above$/i.test(v.trim()))));
 assert(Q.every(q=>new Set(q.options.map(v=>v.toLowerCase().trim())).size===5));
});
test('original saved scores are isolated from revised questions',()=>{
 const old={'ifdsm-sba-web-v1':JSON.stringify({progress:{1:{answer:3,correct:true}},history:[{correct:1,total:1}],bookmarks:[1]})};
 const b=newApp(old,'#progress');
 assert.match(b.root.innerHTML,/Previous question-bank edition detected/);
 assert.match(b.root.innerHTML,/0 \/ 1000/);
 assert.equal(b.state(),null);
});
test('main screens render without throwing in VM (home / practice / exam / browse / progress / notebook / about)',()=>{
 for(const view of ['home','practice','exam','browse','progress','notebook','about']){
  a.click('nav',{view});assert(a.root.innerHTML.length>200,view);
 }
});
test('unseen-first practice filter excludes already answered questions',()=>{
 a.click('nav',{view:'practice'});
 a.setInput('setup-topic','all');a.setInput('setup-count','10');a.setInput('setup-kind','all');a.setInput('setup-pool','all');a.setInput('setup-order','sequential');
 a.click('start-session',{mode:'study'});assert.equal(a.state().session.order[0],1);
 a.click('answer',{choice:String(Q[0].key)});assert.equal(a.state().progress[1].correct,true);
 a.click('next');a.click('answer',{choice:String((Q[1].key+1)%5)});
 a.click('next');a.click('reveal');
 assert.equal(a.state().session.answers[3],-1);
 assert.match(a.root.innerHTML,/2 answered · 1 revealed/);
});
test('pause/resume and reload restore the exact question, answers and progress',()=>{
 a.click('pause');assert.equal(a.loc.hash,'#home');a=a.load('#home');
 a.click('continue');assert.equal(a.loc.hash,'#session');
 assert.equal(a.state().session.current,2);
 assert.equal(a.state().session.answers[1],Q[0].key);
 assert.equal(a.state().session.answers[3],-1);
});
test('incomplete study session scores out of total with correct breakdown',()=>{
 a.click('finish');const s=a.state();
 assert.equal(s.session.submitted,true);assert.equal(s.history[0].correct,1);assert.equal(s.history[0].total,10);
 assert.equal(s.history[0].answered,2);assert.equal(s.history[0].revealed,1);assert.equal(s.history[0].unanswered,7);
 assert.match(a.root.innerHTML,/10%[\s\S]*1 \/ 10 correct/);
 assert.match(a.root.innerHTML,/2 answered \(1 incorrect\) · 1 revealed · 7 unanswered/);
});
test('completed result review is deep linkable and reload safe',()=>{
 a.click('review',{id:'2'});assert.equal(a.loc.hash,'#review?question=2');
 assert.match(a.root.innerHTML,/REVIEW · QUESTION 2/);
 a=a.load(a.loc.hash);assert.match(a.root.innerHTML,/REVIEW · QUESTION 2/);
 a.click('nav',{view:'results'});assert.match(a.root.innerHTML,/1 \/ 10 correct/);
});
test('exam answers editable, not recorded as progress before finishing',()=>{
 a.click('nav',{view:'exam'});
 a.setInput('setup-topic','all');a.setInput('setup-count','25');a.setInput('setup-kind','all');a.setInput('setup-pool','all');a.setInput('setup-order','sequential');
 a.click('start-session',{mode:'exam'});
 assert.equal(a.state().session.mode,'exam');
 a.click('answer',{choice:String(Q[0].key)});assert(!a.root.innerHTML.includes('class="answer-panel'));
 a.click('next');a.click('answer',{choice:String((Q[1].key+1)%5)});
 a.click('answer',{choice:String(Q[1].key)});
 a.click('next');a.click('answer',{choice:String(Q[2].key)});
 assert.equal(a.state().progress[3],undefined);
});
test('exam partial score is 3/25 = 12% and all 22 omissions count zero',()=>{
 a.click('finish');const s=a.state();assert.equal(s.history[0].correct,3);
 assert.equal(s.history[0].total,25);assert.equal(s.history[0].answered,3);
 assert.equal(s.history[0].unanswered,22);
 assert.match(a.root.innerHTML,/12%[\s\S]*3 \/ 25 correct/);
 assert.match(a.root.innerHTML,/3 answered \(0 incorrect\) · 0 revealed · 22 unanswered/);
});
test('progress counts unique questions once; latest answers and session history distinct',()=>{
 a.click('nav',{view:'progress'});
 assert.match(a.root.innerHTML,/3 \/ 1000/);
 assert.match(a.root.innerHTML,/ACCURACY OF MOST RECENT ANSWER PER QUESTION/);
 assert.match(a.root.innerHTML,/100%/);
 assert.equal(a.state().progress[2].correct,true);
 assert.equal(a.state().progress[2].tries,2);
 assert.equal(a.state().history.length,2);
});
test('1000-question all-wrong session review paginated; never renders 1000 giant items at once',()=>{
 let mem=a.mem;let state=a.state();
 state.session={mode:'exam',order:Q.map(q=>q.number),answers:{},current:999,startedAt:Date.now()-60000,submitted:false,topic:'all',kind:'all'};
 mem['ifdsm-sba-examstyle-v2']=JSON.stringify(state);
 let b=newApp(mem,'#session');b.click('finish');
 assert.match(b.root.innerHTML,/0 \/ 1000 correct/);
 assert.equal((b.root.innerHTML.match(/data-action="review"/g)||[]).length,25);
 b.click('missed-next');assert.match(b.root.innerHTML,/Page 2 \/ 40/);
 b.click('review',{id:'26'});assert.match(b.root.innerHTML,/REVIEW · QUESTION 26/);
});
test('browse search / paging / back navigation are reachable',()=>{
 a.click('nav',{view:'browse'});
 assert.match(a.browse.innerHTML,/1000/);
 a.click('browse-next');assert.match(a.browse.innerHTML,/Page 2 of 50/);
 a.click('browse-open',{id:'22'});assert.equal(a.loc.hash,'#browse-detail?question=22');
 a=a.load(a.loc.hash);assert.match(a.root.innerHTML,/QUESTION 22/);
 a.click('browse-reveal');assert.match(a.root.innerHTML,/answer-panel/);
 a.click('nav',{view:'browse'});assert.match(a.root.innerHTML,/browse-results/);
});
test('valid question direct links survive reload; invalid ones recover to browse / results',()=>{
 let b=a.load('#browse-detail?question=777');assert.match(b.root.innerHTML,/QUESTION 777/);
 b=b.load('#browse-detail?question=999999');assert.equal(b.loc.hash,'#browse-detail?question=999999');assert.match(b.root.innerHTML,/Browse all questions/);
 b=b.load('#review?question=999999');assert.match(b.root.innerHTML,/Practice results|Examination results/);
});
test('invalid / corrupted persisted session cannot cause a stuck or blank screen',()=>{
 let state=a.state();state.session={mode:'exam',order:[2000],answers:{},current:40,submitted:false};state.progress[2000]={answer:3,correct:true,tries:12};
 a.mem['ifdsm-sba-examstyle-v2']=JSON.stringify(state);
 const b=a.load('#session');assert.match(b.root.innerHTML,/The Question Bank/);
 assert(!b.root.innerHTML.includes('undefined'));
 assert.equal(b.state()?.progress?.[2000]?.correct,true); // state not rewritten until next save; sanitized in memory
 b.click('nav',{view:'progress'});assert.doesNotMatch(b.root.innerHTML,/2000 \/ 1000/);
});
test('unseen-first excludes answered numbers in a new practice set',()=>{
 const s=a.state();s.session=null;a.mem['ifdsm-sba-examstyle-v2']=JSON.stringify(s);
 const b=a.load('#practice');
 b.setInput('setup-topic','all');b.setInput('setup-count','10');b.setInput('setup-kind','all');b.setInput('setup-pool','unseen');b.setInput('setup-order','sequential');
 b.click('start-session',{mode:'study'});
 assert.deepStrictEqual(Array.from(b.state().session.order.slice(0,3)),[4,5,6]);
});
test('all 1000 keys score 1000/1000 and progress reaches 100%',()=>{
 const saved=a.state();saved.session={mode:'exam',order:Q.map(q=>q.number),
   answers:Object.fromEntries(Q.map(q=>[q.number,q.key])),current:999,startedAt:Date.now()-60000,
   submitted:false,topic:'all',kind:'all'};
 const mem={'ifdsm-sba-examstyle-v2':JSON.stringify(saved)};
 const b=newApp(mem,'#session');b.click('finish');
 assert.match(b.root.innerHTML,/100%[\s\S]*1000 \/ 1000 correct/);
 assert.equal(b.state().history[0].correct,1000);
 assert.equal(Object.keys(b.state().progress).length,1000);
 b.click('nav',{view:'progress'});assert.match(b.root.innerHTML,/1000 \/ 1000/);
});
test('review distinguishes genuinely unanswered question from reveal-only',()=>{
 const saved=a.state();saved.session={mode:'exam',order:[1,2],answers:{1:Q[0].key},
   current:1,startedAt:Date.now()-1000,submitted:true,finishedAt:Date.now(),topic:'all',kind:'all'};
 const b=newApp({'ifdsm-sba-examstyle-v2':JSON.stringify(saved)},'#review?question=2');
 assert.match(b.root.innerHTML,/Unanswered question/);
 assert.match(b.root.innerHTML,/earned zero marks/);
 assert.doesNotMatch(b.root.innerHTML,/Revealed without an attempt/);
});
test('local core PDF links and icons all exist',()=>{
 for(const file of ['resources/IFDSM_Integrated_Revision_Notebook.pdf','resources/IFDSM_Question_Bank_Author_Edition.pdf',
   'assets/notebook-cover.webp','assets/icon-192.png','assets/icon-512.png','assets/styles.css','data/questions.js','data/keypoints.js','sw.js','manifest.webmanifest']){
  assert(fs.statSync(base+file).size>100,file);
 }
 const html=fs.readFileSync(base+'index.html','utf8');assert(html.includes('./data/questions.js')&&html.includes('./data/keypoints.js')&&html.includes('./assets/app.js'));
});
test('offline cache version updated and PDFs do not return disguised HTML when offline',()=>{
 const sw=fs.readFileSync(base+'sw.js','utf8');assert(sw.includes('ifdsm-navigation-backfix-20261109-v9'));
 assert(sw.includes('./data/keypoints.js'));
 assert(sw.includes("status:503")&&sw.includes("req.mode==='navigate'"));
});

test('all 78 keypoint sections are mapped exactly once to the syllabus',()=>{
 const K=a.ctx.window.IFDSM_KEYPOINTS;
 assert.equal(K.length,10);
 assert.equal(K.reduce((s,k)=>s+k.points.length,0),78);
 assert.equal(K.reduce((s,k)=>s+k.cases.length,0),30);
 for(const k of K){
   const exp=TOPICS.find(t=>t.id===k.id).sections.map(s=>s.id);
   assert.deepStrictEqual(Array.from(k.points.map(p=>p.section)),Array.from(exp));
   assert(k.points.every(p=>p.text.length>45),`Topic ${k.id}`);
   assert(k.practice.every(id=>Q.some(q=>q.number===id&&q.topic===k.id)));
 }
});
test('HTML keypoints accessible from notebook, question feedback and direct URLs',()=>{
 const b=a.load('#notebook');assert.match(b.root.innerHTML,/78 revised learning-outcome takeaways/);
 assert.match(b.root.innerHTML,/notes.html#contents/);
 const k=b.load('#keypoints?topic=8');
 assert.match(k.root.innerHTML,/Paediatric sleep-disordered breathing/);
 assert.match(k.root.innerHTML,/CASE 03/);
 assert.match(k.root.innerHTML,/Start Topic 8 practice/);
 const v=k.load('#browse-detail?question=1');v.click('browse-reveal');
 assert.match(v.root.innerHTML,/Volume I §1.6/);assert.match(v.root.innerHTML,/notes.html\?from=question-1#section-1\.6/);
});
test('all ten updated keypoint topics have direct links without dead ends',()=>{
 for(let i=1;i<=10;i++){
   const v=a.load('#keypoints?topic='+i);
   assert.match(v.root.innerHTML,new RegExp('TOPIC '+String(i).padStart(2,'0')));
   assert.match(v.root.innerHTML,/Detailed source chapter/);
   assert.match(v.root.innerHTML,/Clinical SBA decisions/);
   assert.match(v.root.innerHTML,/Start Topic/);
 }
});
test('reading updated keypoints never changes existing answer progress',()=>{
 const state=a.state();const copy=JSON.stringify(state);
 const b=a.load('#keypoints?topic=10');
 assert.match(b.root.innerHTML,/informed consent/i);
 assert.equal(JSON.stringify(b.state()),copy);
});

console.log('TEST RESULTS');console.log(results.map(row=>row[0]+' '+row[1]+(row[2]?'\n'+row[2]:'')).join('\n'));
const pass=results.filter(x=>x[0]==='PASS').length, fail=results.length-pass;
console.log(`SUMMARY: ${pass} passed, ${fail} failed`);
// The test suite only prints results and does not modify the website.
process.exitCode=fail?1:0;
// Additional chapter-reader integration tests (run after the original suite).
test('Volume I section deep link filters the question browser to that exact syllabus section',()=>{
 const b=newApp({},'#browse?section=1.3');
 assert.match(b.root.innerHTML,/Browse all questions/);
 assert.equal(b.ctx.document.getElementById('browse-section')?.value,undefined); // selected option rendered, DOM mocked
 assert.match(b.root.innerHTML,/value="1.3" selected/);
 assert.match(b.browse.innerHTML,/Q5/);
 assert.doesNotMatch(b.browse.innerHTML,/Topic 8 · §8\.5/);
});
test('Volume I direct SBA links can be answered and scored accurately',()=>{
 const b=newApp({},'#browse-detail?question=71');
 assert.match(b.root.innerHTML,/Answer this SBA · scored/);
 b.click('practice-one',{id:'71'});
 assert.equal(b.loc.hash,'#session');assert.deepStrictEqual(Array.from(b.state().session.order),[71]);
 const q=Q.find(x=>x.number===71);assert(q);
 b.click('answer',{choice:String(q.key)});
 assert.equal(b.state().progress[71].correct,true);
 assert.match(b.root.innerHTML,/notes.html\?from=session#section-1\.3/);
 b.click('finish');
 assert.match(b.root.innerHTML,/100%[\s\S]*1 \/ 1 correct/);
 assert.equal(b.state().history[0].correct,1);
});
console.log('CHAPTER ADD-ON CHECKS:',results.filter(r=>r[0]==='FAIL').length===0?'PASS':'FAIL');
if(results.some(x=>x[0]==='FAIL'))process.exitCode=1;
