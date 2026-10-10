import {rad,deg,angles,maxForce,G,effectiveForce} from './model.js';
import {plot,download,exportSVG} from './chart.js';
const $=id=>document.getElementById(id),form=$('parameters'),colors={none:'#5d9f0b',threshold:'#d78233',linear:'#477ca6'},names={none:'Без сопротивления',threshold:'Постоянное',linear:'Пропорциональное скорости'};
let csv='';
function update(){
 if(!form.checkValidity()){ $('status').textContent='Введите положительные γ, Ly и границу оси в допустимых пределах.'; $('status').classList.add('invalid');$('angles-chart').innerHTML='';for(const id of ['rec-value','adv-value','split-value','effective-value'])$(id).textContent='—';$('svg').disabled=true;$('csv').disabled=true;sessionStorage.removeItem('panda-theory');return;}
 $('svg').disabled=false;$('csv').disabled=false;
 const theta0=rad(+$('theta0').value),gamma=+$('gamma').value,Ly=+$('ly').value,F0=+$('f0').value,drag=+$('drag').value,fmax=+$('fmax').value;
 $('force').max=fmax;const force=Math.min(+$('force').value,fmax),model=form.elements.model.value,chosen=angles(effectiveForce(force,model,F0,drag),theta0,Ly,gamma);
 $('theta0-out').textContent=deg(theta0).toFixed(0)+'°';$('force-out').textContent=force.toFixed(2);$('f0-out').textContent=F0.toFixed(2);$('drag-out').textContent=drag.toFixed(2);
 $('rec-value').textContent=chosen?deg(chosen.rec).toFixed(2)+'°':'—';$('adv-value').textContent=chosen?deg(chosen.adv).toFixed(2)+'°':'—';$('split-value').textContent=chosen?deg(chosen.adv-chosen.rec).toFixed(2)+'°':'—';$('effective-value').textContent=effectiveForce(force,model,F0,drag).toFixed(3);
 const models=$('compare').checked?['none','threshold','linear']:[model],series=[];csv='model,F_ext,F_eff,theta_rec_deg,theta_adv_deg\n';
 for(const m of models){const adv=[],rec=[];for(let i=0;i<=250;i++){const f=fmax*i/250,eff=effectiveForce(f,m,F0,drag),a=angles(eff,theta0,Ly,gamma);adv.push([f,a?deg(a.adv):null]);rec.push([f,a?deg(a.rec):null]);csv+=`${m},${f},${eff},${a?deg(a.rec):''},${a?deg(a.adv):''}\n`;}
 series.push({points:adv,color:colors[m]},{points:rec,color:colors[m],dash:'7 5'});}
 if($('linearization').checked){for(const s of [-1,1])series.push({points:Array.from({length:101},(_,i)=>{const f=fmax*i/100;return [f,deg(theta0+s*effectiveForce(f,model,F0,drag)/(4*Ly*gamma*Math.sin(theta0)))]}),color:'#a6aba2',dash:'2 4',width:1.5});}
 plot($('angles-chart'),{series,xlim:[0,fmax],ylim:[0,180],xlabel:'Внешняя сила F_ext, ε/σ',ylabel:'Контактный угол θ, °',horizontal:[deg(theta0)],vertical:[force],markers:chosen?[{x:force,y:deg(chosen.rec),color:colors[model]},{x:force,y:deg(chosen.adv),color:colors[model]}]:[]});
 $('legend').innerHTML=models.map(m=>`<span><i style="background:${colors[m]}"></i>${names[m]}</span>`).join('')+($('linearization').checked?'<span>··· линейное приближение выбранной модели</span>':'');
 const limit=maxForce(theta0,Ly,gamma);$('status').classList.toggle('invalid',!chosen);
 $('status').textContent=chosen?`Сохранение объёма: остаток ${(G(chosen.rec)+G(chosen.adv)-2*G(theta0)).toExponential(1)}. Геометрический предел капиллярной силы: ${limit.toFixed(3)} ε/σ. При F_eff = 0 оба угла равны θ₀.`:`F_eff превышает ${limit.toFixed(3)} ε/σ: допустимая пара круговых менисков отсутствует. Уменьшите силу или измените параметры.`;
 if(chosen){const p=new URLSearchParams({theta0:String(deg(theta0)),rec:String(deg(chosen.rec)),adv:String(deg(chosen.adv))});sessionStorage.setItem('panda-theory',p.toString());}else sessionStorage.removeItem('panda-theory');
}
form.addEventListener('input',update);form.addEventListener('submit',e=>e.preventDefault());$('reset').onclick=()=>{form.reset();update()};$('csv').onclick=()=>download('panda-dynamic-theory.csv',csv,'text/csv;charset=utf-8');$('svg').onclick=()=>exportSVG('angles-chart','panda-dynamic-theory.svg');update();
