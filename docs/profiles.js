import {rad,deg,G,inverseG,profiles} from './model.js';
import {plot,download,exportProfiles} from './chart.js';
const $=id=>document.getElementById(id),form=$('parameters');let csv='';
function invalid(message){$('status').textContent=message;$('status').classList.add('invalid');for(const id of ['density-chart','com-chart','geometry'])$(id).innerHTML='';for(const id of ['angles-value','q-value','volume-value','d-value'])$(id).textContent='—';$('csv').disabled=true;$('svg').disabled=true;}
function update(){
 if(!form.checkValidity()){invalid('Введите допустимое отношение длины ячейки к высоте поры.');return;}
 const theta0=rad(+$('theta0').value),rec=rad(+$('rec').value),l=+$('length').value,phi=+$('phi').value,delta=+$('delta').value;
 $('adv').disabled=$('volume').checked;
 if($('volume').checked){const target=2*G(theta0)-G(rec);if(target<G(rad(1))||target>G(rad(179))){invalid('При выбранных θ₀ и θ_rec нет θ_adv в диапазоне 1°–179°, сохраняющего объём. Измените угол или отключите ограничение объёма.');return;}$('adv').value=deg(inverseG(target)).toFixed(1);}
 const adv=$('volume').checked?inverseG(2*G(theta0)-G(rec)):rad(+$('adv').value),p={theta0,rec,adv,l,phi,delta},data=profiles(p),mirror=profiles({...p,rec:adv,adv:rec});
 for(const [id,val] of [['theta0',deg(theta0).toFixed(1)+'°'],['rec',deg(rec).toFixed(1)+'°'],['adv',deg(adv).toFixed(1)+'°'],['phi',phi.toFixed(2)],['delta',delta.toFixed(3)]])$(id+'-out').textContent=val;
 if(!data.valid){invalid('Эта геометрия невозможна: мениски пересекаются или ширина мостика выходит за длину ячейки. Измените φ, ℓ или углы.');return;}
 $('csv').disabled=false;$('svg').disabled=false;
 $('angles-value').textContent=`${deg(rec).toFixed(1)}° / ${deg(adv).toFixed(1)}°`;
 const qmax=Math.max(...data.rows.filter(r=>r.Q!==null).map(r=>Math.abs(r.Q)));
 $('q-value').textContent=qmax.toFixed(4);$('volume-value').textContent=(100*data.volumeResidual).toFixed(3)+'%';$('d-value').textContent=data.d.toFixed(3);
 const common={xlim:[-.5,.5],xlabel:'Поперечная координата ζ = z/H',bands:[[-.5,-data.h],[data.h,.5]],vertical:[-data.h,data.h]};
 const dens=[{points:data.rows.map(r=>[r.z,r.R]),color:'#5d9f0b'}],com=[{points:data.rows.map(r=>[r.z,r.Q]),color:'#5d9f0b'}];
 if($('mirror').checked){dens.push({points:mirror.rows.map(r=>[r.z,r.R]),color:'#477ca6',dash:'7 5',width:1.8});com.push({points:mirror.rows.map(r=>[r.z,r.Q]),color:'#477ca6',dash:'7 5',width:1.8});}
 plot($('density-chart'),{...common,series:dens,ylim:[0,Math.min(1,Math.max(.2,Math.max(...data.rows.map(r=>r.R))*1.15))],ylabel:'Плотность R = ρ/ρ_l'});
 const qscale=Math.max(.005,qmax*1.15);plot($('com-chart'),{...common,series:com,ylim:[-qscale,qscale],ylabel:'Смещение Q = q/H',horizontal:[0]});
 $('status').classList.remove('invalid');$('status').textContent=Math.abs(rec-adv)<1e-8?'Симметричный мостик: Q = 0 во всех заполненных слоях. Пристеночные области исключены из эффективной геометрии.':'Плотность не различает перестановку менисков. Профиль Q различает её по знаку; его среднее с весом плотности равно нулю.';
 geometry(data,l);
 csv=`# theta0_deg=${deg(theta0)},theta_rec_deg=${deg(rec)},theta_adv_deg=${deg(adv)},phi=${phi},ell=${l},delta=${delta}\nz_over_H,rho_over_rho_l,q_over_H,rho_swapped,q_swapped\n`+data.rows.map((r,i)=>[r.z,r.R,r.Q??'',mirror.rows[i].R,mirror.rows[i].Q??''].join(',')).join('\n');
}
function geometry(data,l){
 const rows=data.rows.filter(r=>r.left!==null),X=x=>250+x/l*430,Y=z=>140-z*220;
 const outline=rows.map((r,i)=>`${i?'L':'M'}${X(r.left)},${Y(r.z)}`).join(' ')+rows.slice().reverse().map(r=>`L${X(r.right)},${Y(r.z)}`).join(' ')+'Z';
 $('geometry').innerHTML=`<rect width="500" height="280" fill="white"/><rect x="25" y="15" width="450" height="15" fill="#e1e5dd"/><rect x="25" y="250" width="450" height="15" fill="#e1e5dd"/><path d="${outline}" fill="#edf4e5" stroke="#5d9f0b" stroke-width="2.5"/><line x1="${X(data.xCOM)}" x2="${X(data.xCOM)}" y1="30" y2="250" stroke="#626c5c" stroke-dasharray="5 4"/><text x="${X(data.xCOM)+8}" y="55" fill="#626c5c" font-family="Arial" font-size="12">COM</text><text x="35" y="47" fill="#697069" font-family="Arial" font-size="12">z/H = +½</text><text x="35" y="241" fill="#697069" font-family="Arial" font-size="12">z/H = −½</text><text x="${X(rows[Math.floor(rows.length/2)].left)-5}" y="285" text-anchor="middle" fill="#477b08" font-size="12"></text>`;
}
form.addEventListener('input',update);form.addEventListener('submit',e=>e.preventDefault());$('reset').onclick=()=>{form.reset();update()};$('symmetric').onclick=()=>{$('rec').value=$('theta0').value;$('adv').value=$('theta0').value;update()};$('swap').onclick=()=>{const v=$('rec').value;$('rec').value=$('adv').value;$('adv').value=v;update()};$('from-theory').onclick=()=>{const query=sessionStorage.getItem('panda-theory');if(!query){$('status').textContent='Сначала выберите силу и модель на странице «Теория расщепления», затем вернитесь сюда.';return;}const p=new URLSearchParams(query);for(const id of ['theta0','rec','adv']){const v=Number(p.get(id));if(v<+$('rec').min||v>+$('rec').max){invalid('Углы теории лежат за диапазоном профилей 1°–179°. Выберите меньшую силу на странице теории.');return;}}for(const id of ['theta0','rec','adv'])$(id).value=Number(p.get(id)).toFixed(1);$('volume').checked=true;update()};
 $('csv').onclick=()=>download('panda-dynamic-profiles.csv',csv,'text/csv;charset=utf-8');$('svg').onclick=exportProfiles;update();
