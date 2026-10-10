import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rad,deg,G,angles,maxForce,profiles,integrals,bulge,effectiveForce} from '../docs/model.js';
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('G is regular at 90 degrees and agrees with the original formula away from it',()=>{
 close(G(Math.PI/2),0);close((G(Math.PI/2+1e-5)-G(Math.PI/2-1e-5))/2e-5,1/6,1e-9);
 for(const degrees of [1,30,70,89,91,110,128,150,179]){const t=rad(degrees);close(G(t),(2*t+Math.sin(2*t)-Math.PI)/(8*Math.cos(t)**2),1e-10);}
});
test('nonlinear angles satisfy volume and force budgets on both sides of 90 degrees',()=>{
 for(const t of [30,60,90,128,150,170]){const theta0=rad(t),limit=maxForce(theta0,18.624,.398);for(const part of [0,.01,.3,.9,.999]){const F=part*limit,a=angles(F,theta0,18.624,.398);assert.ok(a);close(G(a.rec)+G(a.adv),2*G(theta0));close(2*18.624*.398*(Math.cos(a.rec)-Math.cos(a.adv)),F);assert.ok(a.rec<=theta0+1e-10&&a.adv>=theta0-1e-10);}assert.equal(angles(limit+.001,theta0,18.624,.398),null);}
});
test('small-force slope is the linearization stated in the manuscript',()=>{
 const t=rad(128),F=1e-5,a=angles(F,t,18.624,.398),s=1/(4*18.624*.398*Math.sin(t));close((a.adv-t)/F,s,1e-7);close((t-a.rec)/F,s,1e-7);
});
test('threshold and proportional resistance behave at zero and at the threshold',()=>{close(effectiveForce(1,'threshold',1.8,.55),0);close(effectiveForce(2,'threshold',1.8,.55),.2);close(effectiveForce(4,'linear',1.8,.55),1.8);close(effectiveForce(4,'linear',1.8,1),0);});
test('analytic U and V agree with numerical integration, including nearly flat menisci',()=>{
 const n=10000,h=.483;
 for(const degrees of [30,89.999,90,90.001,128,170]){const theta=rad(degrees),[u,v]=integrals(theta,h);let un=0,vn=0;for(let i=0;i<n;i++){const b=bulge(-h+(i+.5)*2*h/n,theta,h);un+=b*2*h/n;vn+=b*b*2*h/n;}close(u,un,1e-8);close(v,vn,1e-8);}
});
test('swapping interfaces preserves density and reverses COM, symmetric interfaces give Q=0',()=>{
 const p={theta0:rad(128),rec:rad(118),adv:rad(138),l:2.293,phi:.45,delta:.017},a=profiles(p),b=profiles({...p,rec:p.adv,adv:p.rec}),s=profiles({...p,rec:p.theta0,adv:p.theta0});assert.ok(a.valid&&b.valid&&s.valid);
 for(let i=0;i<a.rows.length;i++){close(a.rows[i].R,b.rows[i].R);if(a.rows[i].Q!==null)close(a.rows[i].Q,-b.rows[i].Q);if(s.rows[i].Q!==null)close(s.rows[i].Q,0);}assert.equal(a.rows[0].Q,null);assert.equal(a.rows.at(-1).Q,null);
});
test('COM is mass-weighted and geometric solution preserves profile volume',()=>{
 const theta0=rad(128),a=angles(4.96,theta0,18.624,.398),p={theta0,...a,l:2.293,phi:.45,delta:.017},data=profiles(p,20001);assert.ok(data.valid);close(data.volumeResidual,0);let mass=0,moment=0;for(const r of data.rows){mass+=r.R*.00005;if(r.Q!==null)moment+=r.R*r.Q*.00005;}close(mass,p.phi,1e-4);close(moment,0,1e-6);
});
test('unphysical periodic and intersecting geometries are rejected',()=>{
 assert.equal(profiles({theta0:rad(170),rec:rad(170),adv:rad(170),l:.3,phi:.1,delta:0}).valid,false);
 assert.equal(profiles({theta0:rad(30),rec:rad(170),adv:rad(170),l:.3,phi:.85,delta:.15}).valid,false);
});
test('theory-driven profiles preserve volume and respond to force and resistance',()=>{
 const theta0=rad(128),base={theta0,l:2.293,phi:.45,delta:.017},qmax=data=>Math.max(...data.rows.filter(r=>r.Q!==null).map(r=>Math.abs(r.Q)));
 const result=(force,model)=>{const a=angles(effectiveForce(force,model,1.8,.55),theta0,18.624,.398);assert.ok(a);const p=profiles({...base,...a});assert.ok(p.valid);close(p.volumeResidual,0);return p;};
 close(qmax(result(0,'none')),0);close(qmax(result(1,'threshold')),0);
 assert.ok(qmax(result(4.96,'none'))>qmax(result(2,'none')));
 assert.ok(qmax(result(4.96,'none'))>qmax(result(4.96,'threshold')));
 assert.ok(qmax(result(4.96,'none'))>qmax(result(4.96,'linear')));
});
