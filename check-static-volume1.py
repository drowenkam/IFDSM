from pathlib import Path
from bs4 import BeautifulSoup
from collections import Counter
from urllib.parse import urlsplit,unquote
import json,re,sys
root=Path(__file__).resolve().parent.parent

# Expected chapter/section/SBA associations come from the published question and chapter mapping.
# A small, static manifest is bundled for independent validation.
D=json.load(open(root/'qa'/'book_manifest.json'))
cs=D['chapters']
errors=[];counts=Counter(); all_ids=[]
for c in cs:
    fn=root/f'book/chapter-{c["id"]:02d}.html'
    soup=BeautifulSoup(fn.read_text(),'html.parser')
    expected=[s['id'] for s in c['sections']]
    observed=[x.get('id','').removeprefix('section-') for x in soup.select('article.lesson')]
    if expected!=observed: errors.append(f'{fn.name} missing or out-of-order outcomes {expected=} {observed=}')
    for s in c['sections']:
        article=soup.select_one(f'article[id="section-{s["id"]}"]')
        txt=article.select_one('.bodytext').get_text(' ',strip=True)
        if len(txt.split())<40:errors.append(f'Section {s["id"]} no readable full notes')
        if 'pdf' in str(article.select_one('.bodytext')).lower() and not re.search(r'portable|document|PDF',txt):pass
        if article.select_one('.bodytext img'):
            for img in article.select('.bodytext img'):
                if not (fn.parent / img.get('src','')).is_file():errors.append('Missing figure '+str(fn)+img.get('src',''))
        if article.select_one('.bodytext') is None:errors.append(f'Section {s["id"]} missing text')
        ids=[int(a.text.lstrip('Q')) for a in article.select('.questions a')]
        if ids!=s['question_ids']:errors.append(f'Wrong SBA mapping in {s["id"]}')
        # Question links must come AFTER all lesson content in document order
        if str(article).find('class="practice"')<str(article).find('class="bodytext"'):
            errors.append(f'Lesson after SBAs in {s["id"]}')
        all_ids+=ids
        counts['sections']+=1
        counts['words']+=len(txt.split())
        counts['tables']+=len(article.select('table'))
        counts['figures']+=len(article.select('figure img'))
    counts['chapters']+=1
assert counts['chapters']==10 and counts['sections']==78
if len(all_ids)!=1000 or sorted(all_ids)!=list(range(1,1001)):
    errors.append(f'Wrong coverage or duplicates {len(all_ids)} {len(set(all_ids))}')
# Every static local file link resolves; SPA fragments are handled by its client JS.
for fn in (root/'book').rglob('*.html'):
    soup=BeautifulSoup(fn.read_text(),'html.parser')
    if soup.select('script,iframe,object,embed'):
        errors.append(f'{fn}: static teaching content depends on scripts/iframes')
    for tag in soup.select('[href],[src]'):
        val=tag.get('href') or tag.get('src')
        if not val or val.startswith(('https:','mailto:','tel:','#','data:')):continue
        split=urlsplit(val)
        path=(fn.parent / unquote(split.path)).resolve()
        if not path.exists():errors.append(f'BROKEN link {fn.relative_to(root)}: {val}')
        elif split.fragment and path.suffix=='.html' and 'index.html#' not in val:
            q=BeautifulSoup(path.read_text(),'html.parser')
            anchor=unquote(split.fragment)
            if not q.find(id=anchor) and not q.find(attrs={'name':anchor}):
                errors.append(f'BROKEN anchor {fn.relative_to(root)}: {val}')
    counts['pages']+=1
# coverage source vs html & integrity
full_html=' '.join((root/'book'/f'chapter-{i:02d}.html').read_text() for i in range(1,11))
if re.search(r'<details[^>]*class="study-visible-lesson',full_html):errors.append('Hidden teaching content')
# Ensure no original notes are required as runtime deps
for p in (root/'book').rglob('*.html'):
    if 'data/full_notes' in p.read_text():errors.append(f'Runtime notes dependency: {p}')
print('CHECK',dict(counts),'Question IDs',len(all_ids),'unique',len(set(all_ids)))
for e in errors[:40]:print('ERROR',e)
print('SUMMARY',len(errors),'issues')
sys.exit(1 if errors else 0)
