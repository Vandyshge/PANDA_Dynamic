const NS='http://www.w3.org/2000/svg';
export function plot(svg,{series,xlim,ylim,xlabel,ylabel,markers=[],bands=[],extra='',horizontal=[],vertical=[]}){
 const compact=svg.id==='density-chart'||svg.id==='com-chart';
 const W=compact?520:760,H=compact?380:410,right=25,top=25,bottom=76;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
 const add=(name,attrs,text)=>{const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;svg.append(e);return e;};
 add('rect',{width:W,height:H,fill:'#fff'});
 const label=(x,y,t,attrs={})=>{const e=add('text',{x,y,fill:'#697069','font-family':'Arial, sans-serif','font-size':12,...attrs});for(const part of Array.isArray(t)?t:[{text:t}]){const span=document.createElementNS(NS,'tspan');span.textContent=part.text;if(part.math){span.setAttribute('font-family','Cambria, Georgia, serif');span.setAttribute('font-style','italic');}if(part.sub){span.setAttribute('baseline-shift','sub');span.setAttribute('font-size','10');}e.append(span);}return e;};
 const fmt=v=>Math.abs(v)<1e-8?'0':Number(v.toPrecision(3)).toString();
 const yticks=Array.from({length:6},(_,i)=>ylim[0]+(ylim[1]-ylim[0])*i/5);
 const tickWidth=Math.max(...yticks.map(y=>{const e=label(0,0,fmt(y));const width=e.getComputedTextLength();e.remove();return width;}));
 const left=Math.max(compact?86:88,Math.ceil(tickWidth)+44),w=W-left-right,h=H-top-bottom;
 const X=x=>left+(x-xlim[0])/(xlim[1]-xlim[0])*w,Y=y=>top+h-(y-ylim[0])/(ylim[1]-ylim[0])*h;
 const defs=add('defs',{}),clip=document.createElementNS(NS,'clipPath');clip.id=svg.id+'-clip';clip.innerHTML=`<rect x="${left}" y="${top}" width="${w}" height="${h}"/>`;defs.append(clip);
 for(const b of bands)add('rect',{x:X(b[0]),y:top,width:X(b[1])-X(b[0]),height:h,fill:'#eef1ec'});
 for(let i=0;i<=5;i++){const x=xlim[0]+(xlim[1]-xlim[0])*i/5,y=ylim[0]+(ylim[1]-ylim[0])*i/5;
  add('line',{x1:X(x),x2:X(x),y1:top,y2:top+h,stroke:'#edf0eb'});label(X(x),top+h+24,fmt(x),{'text-anchor':'middle',class:'tick-label x-tick'});
  add('line',{x1:left,x2:left+w,y1:Y(y),y2:Y(y),stroke:'#edf0eb'});label(left-10,Y(y)+4,fmt(y),{'text-anchor':'end',class:'tick-label y-tick'});
 }
 for(const y of horizontal)add('line',{x1:left,x2:left+w,y1:Y(y),y2:Y(y),stroke:'#abb3a8','stroke-dasharray':'4 5'});
 for(const x of vertical)add('line',{x1:X(x),x2:X(x),y1:top,y2:top+h,stroke:'#abb3a8','stroke-dasharray':'4 5'});
 for(const s of series){let d='',open=false;for(const [x,y] of s.points){if(y===null||!Number.isFinite(y)){open=false;continue;}d+=`${open?'L':'M'}${X(x).toFixed(3)},${Y(y).toFixed(3)} `;open=true;}
  add('path',{d,fill:'none',stroke:s.color,'stroke-width':s.width||2.4,'stroke-dasharray':s.dash||'','clip-path':`url(#${clip.id})`});}
 for(const m of markers)add('circle',{cx:X(m.x),cy:Y(m.y),r:5,fill:m.color,stroke:'white','stroke-width':2,'clip-path':`url(#${clip.id})`});
 add('path',{d:`M${left},${top}V${top+h}H${left+w}`,fill:'none',stroke:'#8c9489'});
 label(left+w/2,H-16,xlabel,{'text-anchor':'middle','font-size':14,fill:'#323b30',class:'axis-title x-title'});
 label(18,top+h/2,ylabel,{transform:`rotate(-90 18 ${top+h/2})`,'text-anchor':'middle','font-size':14,fill:'#323b30',class:'axis-title y-title'});
 if(extra)label(left+15,top+20,extra,{'font-size':12});
}
export function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export function exportSVG(id,name){const svg=document.getElementById(id).cloneNode(true);svg.setAttribute('xmlns',NS);download(name,new XMLSerializer().serializeToString(svg),'image/svg+xml');}
export function exportProfiles(){
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('xmlns',NS);svg.setAttribute('viewBox','0 0 1040 380');svg.setAttribute('width','1040');svg.setAttribute('height','380');
 for(const [i,id] of ['density-chart','com-chart'].entries()){const panel=document.getElementById(id).cloneNode(true);panel.setAttribute('x',String(i*520));panel.setAttribute('y','0');panel.setAttribute('width','520');panel.setAttribute('height','380');svg.append(panel);}
 download('panda-dynamic-profiles.svg',new XMLSerializer().serializeToString(svg),'image/svg+xml');
}
