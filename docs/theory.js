import {rad,deg,angles,maxForce,G,effectiveForce} from './model.js?v=20261010-7';
import {plot,download,exportSVG} from './chart.js?v=20261010-7';
const $=id=>document.getElementById(id),form=$('parameters'),colors={none:{adv:'#d16b24',rec:'#307ca8'},threshold:{adv:'#b94758',rec:'#228579'},linear:{adv:'#947b12',rec:'#7263ad'}},names={none:'No additional resistance',threshold:'Constant resistance',linear:'Velocity-dependent resistance'};
let csv='';
function update(){
 if(!form.checkValidity()){ $('status').textContent='Enter positive γ, Ly, and a force-axis limit within the allowed ranges.'; $('status').classList.add('invalid');$('angles-chart').innerHTML='';for(const id of ['rec-value','adv-value','split-value','effective-value'])$(id).textContent='—';$('svg').disabled=true;$('csv').disabled=true;sessionStorage.removeItem('panda-theory');return;}
 $('svg').disabled=false;$('csv').disabled=false;
 const theta0=rad(+$('theta0').value),gamma=+$('gamma').value,Ly=+$('ly').value,F0=+$('f0').value,drag=+$('drag').value,fmax=+$('fmax').value;
 $('force').max=fmax;const force=Math.min(+$('force').value,fmax),model=form.elements.model.value,chosen=angles(effectiveForce(force,model,F0,drag),theta0,Ly,gamma);
 $('theta0-out').textContent=deg(theta0).toFixed(0)+'°';$('force-out').textContent=force.toFixed(2);$('f0-out').textContent=F0.toFixed(2);$('drag-out').textContent=drag.toFixed(2);
 $('rec-value').textContent=chosen?deg(chosen.rec).toFixed(2)+'°':'—';$('adv-value').textContent=chosen?deg(chosen.adv).toFixed(2)+'°':'—';$('split-value').textContent=chosen?deg(chosen.adv-chosen.rec).toFixed(2)+'°':'—';$('effective-value').textContent=effectiveForce(force,model,F0,drag).toFixed(3);
 const models=['none','threshold','linear'].filter(m=>$('show-'+m).checked),showAdv=$('show-adv').checked,showRec=$('show-rec').checked,hasCurves=models.length>0&&(showAdv||showRec),series=[];csv='model,F_ext,F_eff,theta_rec_deg,theta_adv_deg\n';
 for(const m of models){const adv=[],rec=[];for(let i=0;i<=250;i++){const f=fmax*i/250,eff=effectiveForce(f,m,F0,drag),a=angles(eff,theta0,Ly,gamma);adv.push([f,a?deg(a.adv):null]);rec.push([f,a?deg(a.rec):null]);csv+=`${m},${f},${eff},${a&&showRec?deg(a.rec):''},${a&&showAdv?deg(a.adv):''}\n`;}
 if(showAdv)series.push({points:adv,color:colors[m].adv});if(showRec)series.push({points:rec,color:colors[m].rec});}
 const linearVisible=$('linearization').checked&&models.includes(model)&&hasCurves;
 if(linearVisible){for(const s of [-1,1].filter(s=>s===1?showAdv:showRec))series.push({points:Array.from({length:101},(_,i)=>{const f=fmax*i/100;return [f,deg(theta0+s*effectiveForce(f,model,F0,drag)/(4*Ly*gamma*Math.sin(theta0)))]}),color:'#a6aba2',dash:'2 4',width:1.5});}
 const markers=[];if(chosen&&models.includes(model)){if(showRec)markers.push({x:force,y:deg(chosen.rec),color:colors[model].rec});if(showAdv)markers.push({x:force,y:deg(chosen.adv),color:colors[model].adv});}
 $('adv-value').style.color=colors[model].adv;$('rec-value').style.color=colors[model].rec;
 plot($('angles-chart'),{series,xlim:[0,fmax],ylim:[0,180],xlabel:[{text:'External force '},{text:'F',math:true},{text:'ext',sub:true},{text:', ε/σ'}],ylabel:[{text:'Contact angle '},{text:'θ',math:true},{text:', °'}],horizontal:hasCurves?[deg(theta0)]:[],vertical:hasCurves?[force]:[],markers});
 $('legend').innerHTML=(hasCurves?models:[]).map(m=>`<div class="angle-legend-row"><span class="angle-legend-model">${names[m]}</span>${showAdv?`<span><i class="angle-swatch" style="background:${colors[m].adv}"></i>Advancing θ<sub>adv</sub></span>`:''}${showRec?`<span><i class="angle-swatch" style="background:${colors[m].rec}"></i>Receding θ<sub>rec</sub></span>`:''}</div>`).join('')+(linearVisible?'<span>··· linear approximation of the active model</span>':'');
 $('selection-note').textContent=!hasCurves?'Select at least one model and one angle branch.':$('linearization').checked&&!models.includes(model)?'Select the active model in Visible curves to show its linear approximation.':'Choose any combination of models and angle branches. Markers appear only when the active model is visible.';
 $('csv').disabled=!hasCurves;$('svg').disabled=!hasCurves;
 const limit=maxForce(theta0,Ly,gamma);$('status').classList.toggle('invalid',!chosen);
 $('status').textContent=chosen?`Volume-conservation residual: ${(G(chosen.rec)+G(chosen.adv)-2*G(theta0)).toExponential(1)}. Geometric capillary-force limit: ${limit.toFixed(3)} ε/σ. At F_eff = 0, both angles equal θ₀.`:`F_eff exceeds ${limit.toFixed(3)} ε/σ: no admissible circular-meniscus pair exists. Reduce the force or adjust the parameters.`;
 if(chosen){const p=new URLSearchParams({theta0:String(deg(theta0)),rec:String(deg(chosen.rec)),adv:String(deg(chosen.adv)),force:String(force),gamma:String(gamma),ly:String(Ly),f0:String(F0),drag:String(drag),model});sessionStorage.setItem('panda-theory',p.toString());}else sessionStorage.removeItem('panda-theory');
}
form.addEventListener('input',update);form.addEventListener('submit',e=>e.preventDefault());$('reset').onclick=()=>{HTMLFormElement.prototype.reset.call(form);update()};$('csv').onclick=()=>download('panda-dynamic-theory.csv',csv,'text/csv;charset=utf-8');$('svg').onclick=()=>exportSVG('angles-chart','panda-dynamic-theory.svg');update();
