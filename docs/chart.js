const NS='http://www.w3.org/2000/svg';
export function plot(svg,{series,xlim,ylim,xlabel,ylabel,markers=[],bands=[],extra='',horizontal=[],vertical=[]}){
 const W=760,H=410,left=72,right=25,top=25,bottom=57,w=W-left-right,h=H-top-bottom;
 const X=x=>left+(x-xlim[0])/(xlim[1]-xlim[0])*w,Y=y=>top+h-(y-ylim[0])/(ylim[1]-ylim[0])*h;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
 const add=(name,attrs,text)=>{const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;svg.append(e);return e;};
 add('rect',{width:W,height:H,fill:'#fff'});
 const defs=add('defs',{}),clip=document.createElementNS(NS,'clipPath');clip.id=svg.id+'-clip';clip.innerHTML=`<rect x="${left}" y="${top}" width="${w}" height="${h}"/>`;defs.append(clip);
 const label=(x,y,t,attrs={})=>add('text',{x,y,fill:'#697069','font-family':'Arial, sans-serif','font-size':12,...attrs},t);
 for(const b of bands)add('rect',{x:X(b[0]),y:top,width:X(b[1])-X(b[0]),height:h,fill:'#eef1ec'});
 const fmt=v=>Math.abs(v)<1e-8?'0':Number(v.toPrecision(3)).toString();
 for(let i=0;i<=5;i++){const x=xlim[0]+(xlim[1]-xlim[0])*i/5,y=ylim[0]+(ylim[1]-ylim[0])*i/5;
  add('line',{x1:X(x),x2:X(x),y1:top,y2:top+h,stroke:'#edf0eb'});label(X(x),top+h+23,fmt(x),{'text-anchor':'middle'});
  add('line',{x1:left,x2:left+w,y1:Y(y),y2:Y(y),stroke:'#edf0eb'});label(left-12,Y(y)+4,fmt(y),{'text-anchor':'end'});
 }
 for(const y of horizontal)add('line',{x1:left,x2:left+w,y1:Y(y),y2:Y(y),stroke:'#abb3a8','stroke-dasharray':'4 5'});
 for(const x of vertical)add('line',{x1:X(x),x2:X(x),y1:top,y2:top+h,stroke:'#abb3a8','stroke-dasharray':'4 5'});
 for(const s of series){let d='',open=false;for(const [x,y] of s.points){if(y===null||!Number.isFinite(y)){open=false;continue;}d+=`${open?'L':'M'}${X(x).toFixed(3)},${Y(y).toFixed(3)} `;open=true;}
  add('path',{d,fill:'none',stroke:s.color,'stroke-width':s.width||2.4,'stroke-dasharray':s.dash||'','clip-path':`url(#${clip.id})`});}
 for(const m of markers)add('circle',{cx:X(m.x),cy:Y(m.y),r:5,fill:m.color,stroke:'white','stroke-width':2,'clip-path':`url(#${clip.id})`});
 add('path',{d:`M${left},${top}V${top+h}H${left+w}`,fill:'none',stroke:'#8c9489'});
 label(left+w/2,H-10,xlabel,{'text-anchor':'middle','font-size':14,fill:'#323b30'});
 label(20,top+h/2,ylabel,{transform:`rotate(-90 20 ${top+h/2})`,'text-anchor':'middle','font-size':14,fill:'#323b30'});
 if(extra)label(left+15,top+20,extra,{'font-size':12});
}
export function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export function exportSVG(id,name){const svg=document.getElementById(id).cloneNode(true);svg.setAttribute('xmlns',NS);download(name,new XMLSerializer().serializeToString(svg),'image/svg+xml');}
