from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse,unquote
import re,json,collections
root=Path(__file__).resolve().parent.parent
pages=['index.html','notes.html','reader.html','volume1.html','book/index.html']+[f'book/chapter-{i:02}.html' for i in range(1,11)]
checked=0;missing=[]
for page in pages:
 path=root/page;dom=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
 for tag in dom.select('[href], [src]'):
  val=tag.get('href') or tag.get('src') or ''
  if not val or val.startswith(('data:','mailto:','tel:','#','javascript:')) or re.match(r'https?://',val):continue
  parsed=urlparse(val);relative=unquote(parsed.path)
  if not relative:continue
  target=(path.parent/relative).resolve()
  checked+=1
  if not target.is_file():missing.append((page,val))
notes=BeautifulSoup((root/'notes.html').read_text(encoding='utf-8'),'html.parser')
ids=[x['id'] for x in notes.find_all(id=True)]
assert len(ids)==len(set(ids)),'duplicate anchor ID'
sections=notes.select('article.note-page')
assert len(sections)==78
links=notes.select('article.note-page .section-sba .q-links a')
assert len(links)==1000
qids=[int(re.search(r'question=(\d+)',x['href']).group(1)) for x in links]
assert len(set(qids))==1000
assert all(x.select_one('.clinical-note') and x.select_one('.source-content') and x.select_one('.section-sba') for x in sections)
assert all(x.select_one('.source-content').get_text(' ',strip=True) for x in sections)
assert all(x.select_one('.source-content').sourceline is not None for x in sections)
assert all(x.select_one('.source-content').find_next(class_='section-sba') for x in sections)
assert not missing, missing[:20]
res={'files_checked':pages,'local_links_checked':checked,'missing_local_assets':len(missing),'unique_html_anchors':len(ids),'chapters':10,'syllabus_sections':len(sections),'sba_links':len(links),'unique_sba_questions':len(set(qids)),'tables':len(notes.select('table')),'figures':len(notes.select('.study-figure'))}
(root/'qa'/'LINK_AUDIT.json').write_text(json.dumps(res,indent=2),encoding='utf-8')
print(json.dumps(res,indent=2))
