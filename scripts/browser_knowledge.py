#!/usr/bin/env python3
from __future__ import annotations
import argparse,json,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SIZES=[('desktop',1440,900),('tablet',768,1024),('mobile',390,844),('narrow',360,800)]
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def log_message(self,*args):pass
def main():
 pa=argparse.ArgumentParser();pa.add_argument('--output',type=Path,default=Path('reports/knowledge'));args=pa.parse_args();args.output.mkdir(parents=True,exist_ok=True)
 posts=[p for p in json.loads((ROOT/'content/posts.json').read_text(encoding='utf-8')) if p['status']=='published']
 server=ThreadingHTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();base='http://127.0.0.1:'+str(server.server_port)+'/'
 report={'pass':True,'articles':{},'root':{}}
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True,args=['--no-sandbox'])
   for post in posts:
    key=post['slug'];report['articles'][key]={};url=base+'posts/'+post['category']+'/'+key+'/'
    for label,w,h in SIZES:
     page=browser.new_page(viewport={'width':w,'height':h});errors=[];external=[]
     page.on('pageerror',lambda e,log=errors:log.append(str(e)))
     page.on('console',lambda m,log=errors:log.append('console: '+m.text) if m.type=='error' else None)
     page.on('request',lambda r,log=external:log.append(r.url) if r.url.startswith('https://') else None)
     page.goto(url,wait_until='networkidle');page.evaluate('window.scrollTo(0,document.body.scrollHeight)');page.wait_for_timeout(250);page.evaluate('window.scrollTo(0,0)')
     measure=page.evaluate("""() => ({width:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelectorAll('h1').length,figures:document.querySelectorAll('figure').length,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth<1).length,blankSvg:[...document.querySelectorAll('svg')].filter(s=>s.getBoundingClientRect().width<1||s.getBoundingClientRect().height<1).length,buttons:document.querySelectorAll('[data-stepper] button').length})""")
     okay=measure['width']<=measure['viewport']+1 and measure['h1']==1 and measure['figures']>=3 and measure['brokenImages']==0 and measure['blankSvg']==0 and not errors and not external
     if label in ('desktop','mobile'):page.screenshot(path=str(args.output/(key+'-'+label+'.png')),full_page=True)
     if label=='desktop':
      page.keyboard.press('Tab');focus=page.evaluate("document.activeElement.classList.contains('skip-link')")
      btn=page.locator('[data-stepper] button[data-stage="2"]');btn.click();interaction=page.locator('[data-panel="2"]').is_visible() and btn.get_attribute('aria-pressed')=='true'
      okay=okay and focus and interaction;measure['keyboardSkipFocus']=focus;measure['interaction']=interaction
      page.emulate_media(media='print');page.screenshot(path=str(args.output/(key+'-print.png')),full_page=True)
     report['articles'][key][label]={'pass':okay,**measure,'errors':errors,'external_requests':external}
     if not okay:report['pass']=False
     page.close()
   for label,w,h in [('desktop',1440,900),('mobile',390,844)]:
    page=browser.new_page(viewport={'width':w,'height':h});errors=[];page.on('pageerror',lambda e,log=errors:log.append(str(e)))
    page.goto(base,wait_until='networkidle');page.locator('#casePanel h3').wait_for(timeout=10000)
    page.goto(base+'?case=upward-001#practice',wait_until='networkidle');page.locator('#casePanel h3').wait_for(timeout=10000)
    title=page.locator('#casePanel h3').inner_text();width=page.evaluate('document.documentElement.scrollWidth');okay=title=='周会汇报进展' and width<=w+1 and not errors
    report['root'][label]={'pass':okay,'deepLinkTitle':title,'scrollWidth':width,'viewport':w,'errors':errors}
    if not okay:report['pass']=False
    page.close()
   browser.close()
 finally:server.shutdown();server.server_close()
 (args.output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'pass':report['pass'],'articles':len(posts),'root':report['root'],'report':str(args.output/'report.json')},ensure_ascii=False,indent=2))
 return 0 if report['pass'] else 1
if __name__=='__main__':raise SystemExit(main())
