import json,re,collections
import os
D=os.path.dirname(os.path.abspath(__file__))
P=lambda n:os.path.join(D,n)
rows=[tuple(r) for r in json.load(open(P('grade-cc.json'),encoding='utf-8'))]
assert len(rows)==35
def readsrc(path):
    d=collections.OrderedDict();k=None
    for line in open(path,encoding='utf-8'):
        line=line.rstrip('\n')
        if not line: continue
        if line.startswith('#'): k=line[1:]; d[k]=[]; continue
        i,dur,t=line.split('|',2); d[k].append([i,dur,t])
    return d
LCC=readsrc(P('aulas-cc.txt')); SRC=readsrc(P('aulas-trilhas.txt')); C=json.load(open(P('conteudo.json'),encoding='utf-8'))
courses={}; tracks=[]; books=[]
FREE={'Pense em Python':'https://penseallen.github.io/PensePython2e/','Python Fluente':'https://pythonfluente.com/',
 'Aprender Haskell':'https://haskell.tailorfontela.com.br/','Lambda Calculus':'https://www.macs.hw.ac.uk/~greg/books/gjm.lambook88.pdf',
 'Structure and Interpretation':'https://web.mit.edu/6.001/6.037/sicp.pdf','Cálculo III':'https://www.icmc.usp.br/institucional/estrutura-administrativa/departamentos/sma/material-didatico'}
def addbooks(cid,key):
    out=[]
    for b in C['bib'].get(key,[]):
        b=dict(b); b['c']=cid
        for k,u in FREE.items():
            if k in b['t']: b['free']=u
        m=re.search(r'(97[89]\d{10}|\d{9}[\dX])',b.get('isbn','').replace('-',''))
        b['isbn']=m.group(1) if m else ''
        books.append(b); out.append(len(books)-1)
    return out
# CC
groups=[{'name':f'{e}ª etapa','items':[]} for e in range(1,8)]
for cid,name,et,url,pre,bib in rows:
    pre=re.findall(r'"(\w+)"',pre)
    c=dict(id=cid,name=name,track='cc',g=int(et)-1,url=url,pre=pre,L=LCC.get(cid,[]),bk=addbooks(cid,bib))
    if cid=='py2': c['note']='As aulas da Parte II ficam no curso do Coursera e na mesma playlist da Parte I (a partir da aula 33, Programação Orientada a Objetos).'
    courses[cid]=c; groups[int(et)-1]['items'].append(cid)
tracks.append(dict(id='cc',name='Ciência da Computação',short='CC',kind='Currículo',color='violet',map=True,
  desc='Uma educação completa em Ciência da Computação com materiais abertos de universidades brasileiras: 35 cadeiras em 7 etapas.',
  link='https://github.com/Universidade-Livre/ciencia-da-computacao',groups=groups))
def lessons_for(c):
    if c.get('pl'): k=c['pl']
    elif c.get('v'): k='V:'+c['v']
    else: return None
    return SRC.get(k)
def ext_hours(dur,ded):
    w=re.search(r'(\d+)\s*(semana|dia)',dur,re.I); h=re.search(r'(\d+(?:[.,]\d+)?)\s*hora',ded,re.I)
    if w and h: return float(w.group(1))*float(h.group(1).replace(',','.'))
    m=re.search(r'(\d+)\s*min',ded+' '+dur); 
    if m: return int(m.group(1))/60
    return None
def mkcourse(raw,track,g,pre):
    L=lessons_for(raw)
    c=dict(id=raw['id'],name=raw['name'],track=track,g=g,url=raw['url'],pre=pre,L=L or [],
           topics=raw.get('topics',''),dur=raw.get('dur',''),ded=raw.get('ded',''),bk=[])
    if raw.get('alt'): c['alt']=raw['alt']
    if L is None:
        c['ext']=True; hh=ext_hours(c['dur'],c['ded']); 
        if hh: c['estH']=hh
    elif len(L)==0: c['gone']=True
    courses[c['id']]=c; return c['id']
# Math
mg=[]
for gi,g in enumerate(C['math']):
    items=[mkcourse(c,'mat',gi,c['pre']) for c in g['courses']]
    mg.append({'name':g['name'],'items':items})
tracks.append(dict(id='mat',name='Matemática',short='MAT',kind='Currículo',color='teal',map=True,
  desc='Uma educação completa em Matemática com materiais abertos, organizada em 6 blocos com pré-requisitos.',
  link='https://github.com/Universidade-Livre/matematica',groups=mg))
colors={'web':'pink','devops':'sky','data':'orange','cyber':'red','emb':'lime','cgx':'purple'}
shorts={'web':'WEB','devops':'OPS','data':'DADOS','cyber':'SEC','emb':'EMB','cgx':'CG'}
for s in C['specs']:
    items=[mkcourse(c,s['id'],0,[]) for c in s['courses']]
    tracks.append(dict(id=s['id'],name=s['name'],short=shorts[s['id']],kind='Especialização',color=colors[s['id']],map=False,desc=s['desc'],
      link=f"https://github.com/Universidade-Livre/ciencia-da-computacao/blob/main/specializations/",groups=[{'name':'Cursos','items':items}]))
data=dict(tracks=tracks,courses=courses,books=books)
js='const DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';'
open(os.path.join(D,'..','data.js'),'w',encoding='utf-8').write(js)
n=sum(len(c['L']) for c in courses.values())
print('courses',len(courses),'lessons',n,'books',len(books),'bytes',len(js))
print('ext',[c['name'] for c in courses.values() if c.get('ext')])
print('gone',[c['name'] for c in courses.values() if c.get('gone')])
for t in tracks: print(t['id'],t['desc'][:90])
