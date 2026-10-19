import re,json,glob,os
import os,sys
R=sys.argv[1] if len(sys.argv)>1 else 'repos'  # pasta com os clones de ciencia-da-computacao (cc) e matematica (mat)
link=re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
def plist(u):
    m=re.search(r'[?&]list=([\w-]+)',u); return m.group(1) if m else None
def vid(u):
    m=re.search(r'(?:v=|youtu\.be/)([\w-]{11})',u); return m.group(1) if m else None
def clean(s): return re.sub(r'\s+',' ',re.sub(r'[¹²³*]','',s)).strip()
# specializations
SPEC={'web_development':('web','Desenvolvimento Web'),'devops':('devops','DevOps'),'data_science':('data','Ciência de Dados'),
 'cybersecurity':('cyber','CyberSecurity'),'embedded_systems':('emb','Embarcados'),'computer_graphics':('cgx','Computação Gráfica')}
specs=[]
for f,(sid,name) in SPEC.items():
    txt=open(f'{R}/cc/specializations/{f}.md',encoding='utf-8').read()
    desc=''
    for para in txt.split('\n\n')[1:]:
        p=para.strip()
        if p and not p.startswith(('Curso','|','[',':--','#','<')): desc=clean(re.sub(r'<[^>]+>','',p)); break
    courses=[]
    for line in txt.splitlines():
        if not line.lstrip('| ').startswith('['): continue
        cells=[c.strip() for c in line.strip().strip('|').split('|')]
        m=link.search(cells[0]); 
        if not m: continue
        t,u=m.group(1),m.group(2)
        courses.append(dict(id=f'{sid}{len(courses)+1}',name=clean(t),url=u,dur=clean(cells[1]) if len(cells)>1 else '',ded=clean(cells[2]) if len(cells)>2 else '',topics=clean(cells[3]) if len(cells)>3 else '',pl=plist(u),v=vid(u)))
    specs.append(dict(id=sid,name=name,desc=desc,courses=courses))
# math
txt=open(f'{R}/mat/README.md',encoding='utf-8').read()
cur=txt[txt.index('# Currículo'):txt.index('# Time')]
groups=[];allc={}
for sec in re.split(r'\n## ',cur)[1:]:
    title=sec.splitlines()[0].strip();cs=[]
    for line in sec.splitlines():
        if not line.startswith('['): continue
        cells=[c.strip() for c in line.split('|')]
        m=link.search(cells[0]);alts=link.findall(cells[0])
        cid='m'+str(len(allc)+1)
        c=dict(id=cid,name=clean(m.group(1)),url=m.group(2),alt=(alts[1][1] if len(alts)>1 else None),dur=clean(cells[1]),ded=clean(cells[2]),topics=clean(cells[3]),preq=clean(cells[4]) if len(cells)>4 else '-',pl=plist(m.group(2)),v=vid(m.group(2)))
        cs.append(c);allc[c['name']]=cid
    groups.append(dict(name=title,courses=cs))
alias={'Programação (Python)':'Algoritmos e Programação em Python','Cálculo IV':'Cálculo IV (Métodos Matemáticos)'}
for g in groups:
    for c in g['courses']:
        ps=[] if c['preq'] in ('-','') else [p.strip() for p in c['preq'].split(',')]
        c['pre']=[allc.get(alias.get(p,p)) for p in ps]
        assert all(c['pre']),(c['name'],ps)
        del c['preq']
# bibliographies
bib={}
for f in sorted(glob.glob(f'{R}/cc/extras/bibliography/*.md')):
    t=open(f,encoding='utf-8').read();books=[]
    for blk in re.split(r'\n## ',t)[1:]:
        def cell(k):
            m=re.search(r'<th>\s*'+k+r'\s*</th>\s*<td>(.*?)</td>',blk,re.S); return clean(re.sub(r'<[^>]+>','',m.group(1))) if m else ''
        title=cell('Título') or clean(blk.splitlines()[0])
        img=re.search(r'<img src="([^"]+)"',blk)
        d=re.search(r'### Descrição(.*?)(?:<hr>|$)',blk,re.S)
        desc=clean(re.sub(r'<[^>]+>',' ',d.group(1)))[:1400] if d else ''
        books.append(dict(t=title,a=cell('Autores'),y=cell('Ano de Publicação'),e=cell('Edição'),isbn=cell('ISBN'),d=desc))
    bib[os.path.basename(f)[:-3]]=books
json.dump(dict(specs=specs,math=groups,bib=bib),open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'conteudo.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print({s['id']:len(s['courses']) for s in specs}, [len(g['courses']) for g in groups], sum(len(b) for b in bib.values()),'livros')
pls=set();vids=set()
for s in specs:
    for c in s['courses']:
        if c['pl']: pls.add(c['pl'])
        elif c['v']: vids.add(c['v'])
for g in groups:
    for c in g['courses']:
        if c['pl']: pls.add(c['pl'])
        elif c['v']: vids.add(c['v'])
print(len(pls),'playlists',len(vids),'videos soltos')

