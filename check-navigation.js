'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(ROOT,n),'utf8');
const reader=read('reader.html').match(/<script>([\s\S]*?)<\/script>/)[1];
const app=read('assets/app.js'),notes=read('assets/notes.js'),html=read('notes.html'),sw=read('sw.js');
let pass=0;function check(label,fn){try{fn();pass++;console.log('PASS '+label)}catch(err){console.error('FAIL '+label+' '+err.stack);process.exitCode=1}}
function viewer(query){
 const ids=['reader-back','reader-frame','page-number','reader-original','reader-title','page-total','page-prev','page-next','page-go'];
 const nodes=Object.fromEntries(ids.map(k=>[k,{href:'',textContent:'',value:'',src:'',disabled:false,handlers:{},addEventListener(name,cb){this.handlers[name]=cb;}}]));
 const loc={search:query};const changed=[];
 const ctx={document:{getElementById(k){if(!nodes[k])throw Error('Missing node '+k);return nodes[k];}},location:loc,history:{replaceState(a,b,v){changed.push(v);loc.search=v}},URLSearchParams,Number,Math};
 vm.runInNewContext(reader,ctx,{filename:'reader.html script'});
 return {nodes,changed,click(k){nodes[k].handlers.click();}};
}
check('PDF reader returns to exact Volume I section',()=>{
 const v=viewer('?doc=volume1&page=66&from=notes&section=4.3');
 assert.equal(v.nodes['reader-back'].href,'./notes.html#section-4.3');
 assert.match(v.nodes['reader-frame'].src,/IFDSM_Integrated_Revision_Notebook\.pdf#page=66/);
 assert.equal(v.nodes['page-number'].value,'66');v.click('page-next');assert.equal(v.nodes['page-number'].value,'67');v.click('page-prev');assert.equal(v.nodes['page-number'].value,'66');
});
check('PDF reader returns to exact chapter and all contents',()=>{
 assert.equal(viewer('?from=notes&chapter=9').nodes['reader-back'].href,'./notes.html#chapter-9');
 assert.equal(viewer('?from=notes&chapter=0').nodes['reader-back'].href,'./notes.html#contents');
 assert.equal(viewer('?from=notes').nodes['reader-back'].href,'./notes.html#contents');
});
check('PDF reader returns to competency keypoints',()=>{
 assert.equal(viewer('?from=keypoints&topic=8').nodes['reader-back'].href,'./index.html#keypoints?topic=8');
 assert.equal(viewer('?from=keypoints&topic=123').nodes['reader-back'].href,'./index.html#keypoints?topic=1');
});
check('PDF reader returns to Notebook, Home, Practice and About as requested',()=>{
 for(const from of ['notebook','home','session','about','progress','results']){
  assert.equal(viewer('?from='+from).nodes['reader-back'].href,'./index.html#'+from);
 }
});
check('PDF reader disallows invalid/outside return destinations',()=>{
 for(const bad of ['https://evil.example','javascript:alert(1)','../../','//example.com','']){
  assert.equal(viewer('?from='+encodeURIComponent(bad)).nodes['reader-back'].href,'./index.html#notebook');
 }
});
check('Question-bank PDF route uses real 399-page book, handles limits',()=>{
 const v=viewer('?doc=questions&page=9000&from=about');
 assert.match(v.nodes['reader-frame'].src,/Question_Bank_Author_Edition\.pdf#page=399/);
 assert.equal(v.nodes['page-total'].textContent,'of 399');assert.equal(v.nodes['page-next'].disabled,true);
 assert.equal(v.nodes['reader-back'].href,'./index.html#about');
});
check('Invalid PDF page inputs are safely clamped, never leave blank page',()=>{
 for(const page of ['-99','NaN','0','9999','abc','']){
  const v=viewer('?doc=volume1&page='+page+'&from=notes&chapter=2');
  const n=Number(v.nodes['page-number'].value);assert(n>=1&&n<=177);
  assert.match(v.nodes['reader-frame'].src,/\.pdf#page=\d+/);
 }
});
check('All PDF entry points use in-site reader, not a standalone PDF',()=>{
 assert(!/href="(?:\.\/)?resources\/[^\"]+\.pdf(?:#[^\"]*)?"/.test(app));
 assert(!/href="(?:\.\/)?resources\/[^\"]+\.pdf(?:#[^\"]*)?"/.test(html));
 assert(!/href="\$\{pdf\}/.test(notes));
 for(const name of ['assets/app.js','assets/notes.js','notes.html','reader.html'])assert(read(name).length>1500);
});
check('Volume I reader has visible home / contents return in desktop and mobile markup',()=>{
 for(const id of ['reader-quicknav','notes-mobile-back'])assert(html.includes(`id="${id}"`));
 assert(notes.includes('returnLink=from'));assert(notes.includes('Back to Notebook'));
 const css=read('assets/notes.css');assert(css.includes('.reader-quicknav'));assert(css.includes('.notes-mobilebar'));
});
check('Keypoints and notebook have persistent return nav in the question-bank app',()=>{
 assert(app.includes('function revisionReturnNav()'));
 assert(app.includes("ui.view==='notebook'||ui.view==='keypoints'"));
 assert(app.includes('← Home'));assert(app.includes('All chapters'));
});
check('Broken old page jumps 245 / 250 removed and actual pages are in bounds',()=>{
 assert(!app.includes('pdfAt(245)'));assert(!app.includes('pdfAt(250)'));
 assert(app.includes('pdfAt(168)'));assert(app.includes('pdfAt(174)'));
 const numbers=[...app.matchAll(/pdfAt\((\d+)\)/g)].map(x=>+x[1]);assert(numbers.every(n=>n>=1&&n<=177));
});
check('Offline service worker recognises PDF reader route',()=>{
 assert(sw.includes("'./reader.html'"));assert(sw.includes("url.pathname.endsWith('/reader.html')"));
 assert(sw.includes('ifdsm-navigation-backfix-20261109-v9'));
});
check('Scoring data and PDF source files are unchanged',()=>{
 const crypto=require('crypto'),old=path.resolve(ROOT,'../IFDSM_Volume_I_Consolidated_GitHub');
 for(const file of ['data/questions.js','data/chapters.js','data/keypoints.js','resources/IFDSM_Integrated_Revision_Notebook.pdf','resources/IFDSM_Question_Bank_Author_Edition.pdf']){
   const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
   assert.equal(hash(path.join(ROOT,file)),hash(path.join(old,file)),file+' altered');
 }
 assert(app.includes("const KEY = 'ifdsm-sba-examstyle-v2'"));
});
console.log(`NAVIGATION SUMMARY: ${pass} checks passed`);
