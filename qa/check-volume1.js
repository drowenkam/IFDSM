'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const B=path.resolve(__dirname,'..');
const chapterData=fs.readFileSync(path.join(B,'data/chapters.js'),'utf8');
const notesSource=fs.readFileSync(path.join(B,'assets/notes.js'),'utf8');
const qData=fs.readFileSync(path.join(B,'data/questions.js'),'utf8');
const app=fs.readFileSync(path.join(B,'assets/app.js'),'utf8');
let pass=0,fail=0;function test(label,fn){try{fn();pass++;console.log('PASS',label)}catch(e){fail++;console.error('FAIL',label,e.stack||e.message)}}
let dataCtx={window:{}};vm.runInNewContext(chapterData,dataCtx,{filename:'chapters.js'});vm.runInNewContext(qData,dataCtx,{filename:'questions.js'});
const C=dataCtx.window.IFDSM_CHAPTERS,Q=dataCtx.window.IFDSM_QUESTIONS;
function notesScreen(hash,stored={}){
  const listeners={},nodes={};
  const cls={open:false,remove(){this.open=false},add(){this.open=true},toggle(){this.open=!this.open;return this.open}};
  nodes['main-notes']={innerHTML:'',scrollTop:0};nodes['notes-sidebar']={classList:cls};
  nodes['chapter-list']={innerHTML:'',querySelector(sel){return this.innerHTML.includes('href="#chapter-')?{}:null}};
  nodes['notes-search']={value:'',addEventListener(name,fn){listeners['filter:'+name]=fn}};
  nodes['progress-total']={textContent:''};
  nodes['toggle-chapters']={setAttribute(k,v){this[k]=v},addEventListener(name,fn){listeners['toggle:'+name]=fn}};
  const doc={getElementById(id){if(nodes[id])return nodes[id];if(id.startsWith('section-')&&nodes['main-notes'].innerHTML.includes(`id="${id}"`))return {setAttribute(){},scrollIntoView(){listeners.scrolled=id},focus(){listeners.focused=id}};return null;}};
  let mem={'ifdsm-sba-examstyle-v2':JSON.stringify(stored)};
  const loc={hash};const win={IFDSM_CHAPTERS:C,addEventListener(n,cb){listeners[n]=cb;},scrollTo(){}};
  const context={window:win,document:doc,location:loc,localStorage:{getItem(k){return mem[k]||null;}},requestAnimationFrame(fn){fn()},console,JSON,Number,String,Array,Object,RegExp,decodeURIComponent};
  vm.runInNewContext(notesSource,context,{filename:'notes.js'});
  return {nodes,loc,win,listeners,changeHash(newHash){loc.hash=newHash;listeners.hashchange();},filter(q){nodes['notes-search'].value=q;listeners['filter:input']();}};
}
test('Volume I exactly 10 chapters, 78 outcomes and 1,000 unique SBA deep links',()=>{
  assert.equal(C.length,10);const a=C.flatMap(c=>c.sections),ids=a.flatMap(s=>s.question_ids);
  assert.equal(a.length,78);assert.equal(ids.length,1000);assert.equal(new Set(ids).size,1000);
  assert.deepStrictEqual([...ids].sort((a,b)=>a-b),Array.from({length:1000},(_,i)=>i+1));
});
test('all chapter references link to a question with the same exact syllabus outcome',()=>{
 const qmap=new Map(Q.map(q=>[q.number,q]));
 for(const c of C){for(const s of c.sections){for(const id of s.question_ids){assert.equal(qmap.get(id).topic,c.id);assert.equal(qmap.get(id).section,s.id);}}}
});
test('Volume II PDF page cross-references populated for all 1000 questions',()=>{
 for(const c of C)for(const s of c.sections){assert.equal(s.examples.length,s.count);for(const e of s.examples)assert(Number.isInteger(e.pdf_page)&&e.pdf_page>=6&&e.pdf_page<=399);}
});
test('chapter one displays all twelve learning outcomes and exact question 71 in §1.3',()=>{
 const r=notesScreen('#chapter-1');const html=r.nodes['main-notes'].innerHTML;
 assert.match(html,/section-1\.3/);assert.equal((html.match(/class="section-card"/g)||[]).length,12);
 assert(html.includes('Q71'));assert(html.includes('./index.html#browse-detail?question=71'));
 assert.match(html,/13[0]? linked SBAs|130 linked SBAs|130/);
});
test('Volume I full contents works and contains all ten chapter links',()=>{
 const r=notesScreen('#contents');assert.equal((r.nodes['main-notes'].innerHTML.match(/class="overview-card"/g)||[]).length,10);
 for(let i=1;i<=10;i++)assert(r.nodes['main-notes'].innerHTML.includes(`href="#chapter-${i}"`));
});
test('all ten chapter pages render and all 1000 SBA references are actionable',()=>{
 const r=notesScreen('#chapter-1');let found=[];
 for(let id=1;id<=10;id++){r.changeHash('#chapter-'+id);const html=r.nodes['main-notes'].innerHTML;
  const got=[...html.matchAll(/class="qlink [^\"]*" href="\.\/index\.html#browse-detail\?question=(\d+)"/g)].map(x=>+x[1]);
  assert.equal(got.length,C[id-1].count);found.push(...got);
 }
 assert.equal(new Set(found).size,1000);
});
test('deep link from SBA to exact Volume I section is safe on reload',()=>{
 const r=notesScreen('#section-1.3');assert.equal(r.listeners.scrolled,'section-1.3');assert(r.nodes['main-notes'].innerHTML.includes('§1.3'));
 r.changeHash('#section-10.6');assert.equal(r.listeners.scrolled,'section-10.6');assert(r.nodes['main-notes'].innerHTML.includes('§10.6'));
});
test('invalid chapter hash recovers to chapter 1; all chapter nav links remain reachable',()=>{
 const r=notesScreen('#chapter-999');assert.match(r.nodes['main-notes'].innerHTML,/CHAPTER 01/);assert.match(r.nodes['chapter-list'].innerHTML,/Chapter 10|10 ·/);
});
test('saved correct/wrong/unseen scores are displayed consistently in chapter and section',()=>{
 const p={progress:{71:{answer:0,correct:false,tries:1},5:{answer:2,correct:true,tries:1}}};
 const r=notesScreen('#section-1.3',p),h=r.nodes['main-notes'].innerHTML;
 assert(h.includes('Q71'));assert(h.includes('class="qlink wrong" href="./index.html#browse-detail?question=71"'));
 assert(h.includes('class="qlink done" href="./index.html#browse-detail?question=5"'));
 assert.match(h,/<b>2<\/b> attempted/);assert.match(h,/<b>1<\/b> latest correct/);
});
test('search navigation narrows chapters without dead ends and clears safely',()=>{
 const r=notesScreen('#chapter-1');r.filter('titration');assert(r.nodes['chapter-list'].innerHTML.includes('chapter-6'));
 r.filter('impossible-syllabus-text-xyz');assert.match(r.nodes['chapter-list'].innerHTML,/No chapter matches/);
 r.filter('');assert(r.nodes['chapter-list'].innerHTML.includes('chapter-10'));
});
test('Volume II explanation links to exact section; direct question can start scored one-question practice',()=>{
 assert(app.includes('notes.html#section-${encodeURIComponent(q.section)}'));
 assert(app.includes("if(a==='practice-one')"));
 assert(app.includes("order:[id],answers:{},current:0"));
 assert(app.includes("if(db.session && !db.session.submitted && !window.confirm"));
});
test('HTML and offline asset references included in service-worker pre-cache',()=>{
 const sw=fs.readFileSync(path.join(B,'sw.js'),'utf8');
 for(const f of ['./notes.html','./assets/notes.js','./assets/notes.css','./data/chapters.js'])assert(sw.includes(f));
 for(const f of ['notes.html','assets/notes.js','assets/notes.css','data/chapters.js'])assert(fs.statSync(path.join(B,f)).size>200);
});
console.log(`SUMMARY: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
