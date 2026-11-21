#!/usr/bin/env python3
from __future__ import annotations
import json,re,sys
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
BANNED=('原创图解 · 单文件离线 HTML','用直觉 → 图示 → 数学 → 工程实现，理解残差网络 · 参考 Colah 风格，非原文翻译')
def validate(path):
 html=path.read_text(encoding='utf-8');soup=BeautifulSoup(html,'html.parser');fail=[]
 if len(soup.find_all('h1'))!=1:fail.append('Expected exactly one h1')
 if not soup.find('main') or not soup.find('nav'):fail.append('Missing semantic main/nav')
 if not soup.find('meta',attrs={'name':'viewport'}):fail.append('Missing viewport meta')
 if len(soup.find_all('h2'))<6:fail.append('Expected six instructional sections')
 for phrase in BANNED:
  if phrase in html or phrase in soup.get_text(' ',strip=True):fail.append('Banned process copy: '+phrase)
 ids={x.get('id') for x in soup.select('[id]')}
 for a in soup.select('a[href^="#"]'):
  if a['href'][1:] not in ids:fail.append('Broken local anchor '+a['href'])
 for i,fig in enumerate(soup.find_all('figure'),1):
  if not fig.find(['svg','img']):fail.append('Figure without image '+str(i))
  cap=fig.find('figcaption')
  if not cap or not cap.get_text(strip=True):fail.append('Figure without caption '+str(i))
 if not soup.find('svg'):fail.append('No accessible inline SVG mark')
 for svg in soup.find_all('svg'):
  if not svg.has_attr('viewbox') or not (svg.find('title') or svg.get('aria-label')):fail.append('SVG missing viewBox/title')
 for img in soup.find_all('img'):
  if not img.get('alt'):fail.append('Image missing alt')
  if img.get('src') and not re.match(r'^(?:data:|https?://)',img['src']) and not (path.parent/img['src']).exists():fail.append('Missing image '+img['src'])
 for s in soup.find_all('script',src=True):
  if s['src'].startswith('http'):fail.append('External script dependency')
 for l in soup.find_all('link',href=True):
  if l['href'].startswith('http') and l.get('rel')!=['canonical']:fail.append('External stylesheet dependency')
 return fail
def main():
 posts=json.loads((ROOT/'content/posts.json').read_text(encoding='utf-8'));failed=0
 for p in posts:
  if p['status']!='published':continue
  path=ROOT/'posts'/p['category']/p['slug']/'index.html';errors=validate(path)
  print(('FAIL' if errors else 'PASS'),p['slug'])
  for e in errors:print('  '+e)
  failed+=bool(errors)
 print('Validated',sum(p['status']=='published' for p in posts),'published articles')
 return 1 if failed else 0
if __name__=='__main__':sys.exit(main())
