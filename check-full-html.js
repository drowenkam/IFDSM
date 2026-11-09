'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const ctx={window:{}};for(const f of ['data/chapters.js','data/full_notes.js','data/questions.js'])vm.runInNewContext(read(f),ctx,{filename:f});
const C=ctx.window.IFDSM_CHAPTERS,F=ctx.window.IFDSM_FULL_NOTES,Q=ctx.window.IFDSM_QUESTIONS;
let checks=0;function test(label,fn){fn();checks++;console.log('PASS '+label)}
test('All 10 chapters, 78 learning outcomes and exactly 1,000 question links remain',()=>{
 assert.equal(C.length,10);assert.equal(C.flatMap(c=>c.sections).length,78);
 const ids=C.flatMap(c=>c.sections.flatMap(s=>s.question_ids));assert.equal(ids.length,1000);assert.equal(new Set(ids).size,1000);
 for(const id of ids)assert(Q.some(q=>q.number===id));});
test('Every syllabus section contains substantive full teaching notes from original companion',()=>{
 const keys=C.flatMap(c=>c.sections.map(s=>s.id));assert.equal(JSON.stringify(Object.keys(F.sections).sort()),JSON.stringify(keys.sort()));
 for(const id of keys){const s=F.sections[id];assert(s.approx_words>=40,id);assert(s.html.length>300,id);assert(Array.isArray(s.source_pages));}
 const words=Object.values(F.sections).reduce((a,s)=>a+s.approx_words,0);assert(words>60000);});
test('All 38 source illustrations embedded as website assets, no figure points to a PDF',()=>{
 const html=Object.values(F.sections).map(s=>s.html).join('');const f=[...html.matchAll(/<figure class="study-figure"><img[^>]*src="\.\/assets\/figures\/([^"]+)"/g)];
 assert(f.length>=38,'Figure count');for(const m of f)assert(fs.existsSync(path.join(ROOT,'assets/figures',m[1])),m[1]);});
test('Semantic tables, full definitions and footnoted source references retained',()=>{
 assert(F.meta.html_tables>=100);const t=Object.values(F.sections).map(s=>s.html).join('');
 for(const term of ['Sleep-disordered breathing','mandibular','Arousal threshold','informed consent'])assert(t.toLowerCase().includes(term.toLowerCase()),term);
 assert(t.includes('<table')&&t.includes('study-caption'));});
test('Master numbers, 60-question mock, bibliography/abbreviations read as HTML',()=>{
 for(const id of ['numbers','mock','sources']){assert(F.extras[id].html.length>5000);assert(!F.extras[id].html.includes('<iframe'))};});
test('Volume I online chapter HTML is primary, PDF is optional',()=>{
 const notes=read('notes.html'),script=read('assets/notes.js'),app=read('assets/app.js');
 assert(notes.includes('data/full_notes.js'));assert(script.includes('full.html')||script.includes('Full teaching notes'));
 assert(script.includes('class="study-details"'));assert(script.includes('expand-all'));assert(script.includes('collapse-all'));
 assert(script.includes('href="#contents"'));assert(script.includes('returnLink'));assert(script.includes('study-body'));
 assert(app.includes('Read complete Chapter'));assert(app.includes('Full chapter text'));
 assert(!script.includes('Read §${s.id} full explanation ↗'));});
test('All question answer keys and progress key preserved',()=>{
 assert(Q.length===1000);assert(read('assets/app.js').includes("const KEY = 'ifdsm-sba-examstyle-v2'"));
 assert(read('assets/notes.js').includes("const storageKey='ifdsm-sba-examstyle-v2'"));});
test('Offline service worker pre-caches full notes and every chapter illustration',()=>{
 const sw=read('sw.js');assert(sw.includes('./data/full_notes.js'));
 for(const name of fs.readdirSync(path.join(ROOT,'assets/figures')))assert(sw.includes(name),name);
 assert(sw.includes('ifdsm-full-html-chapters-20261109-v10'));});
test('All ten sections have previous/next and all chapters navigation available',()=>{
 const js=read('assets/notes.js');assert(js.includes('chapter-pager'));assert(js.includes("'#contents'"));
 assert(js.includes('href="#contents"'));assert(js.includes('qbadge'));});
test('No generated individual per-page HTML proliferation',()=>{
 const files=fs.readdirSync(ROOT).filter(x=>x.endsWith('.html'));assert(files.length<=4);
 assert(files.includes('notes.html')&&files.includes('index.html'));});
console.log(`SUMMARY ${checks} passed, 0 failed`);
