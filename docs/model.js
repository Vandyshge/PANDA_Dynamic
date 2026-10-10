// PANDA-D circular menisci. All geometry is normalized by physical pore height H.
export const rad = degrees => degrees*Math.PI/180;
export const deg = radians => radians*180/Math.PI;
export function integrals(theta,h){
 const k=Math.abs(Math.cos(theta)),sign=theta>Math.PI/2?1:-1;
 if(k<.01)return [sign*h*h*k*(2/3+k*k*(1/5+k*k*(3/28+k*k*5/72))),h**3*k*k*(4/15+k*k*(16/105+k*k*32/315))];
 const s=Math.sin(theta),a=Math.asin(k);
 return [sign*h*h*(a-k*s)/(k*k),2*h**3*(k-s*a-k**3/3)/(k**3)];
}
export const G = theta => integrals(theta,.5)[0];
export function inverseG(value){let lo=0,hi=Math.PI;for(let i=0;i<65;i++){const m=(lo+hi)/2;if(G(m)<value)lo=m;else hi=m;}return (lo+hi)/2;}
export function bulge(z,theta,h){return -Math.cos(theta)*(h*h-z*z)/(Math.sqrt(Math.max(0,h*h-Math.cos(theta)**2*z*z))+h*Math.sin(theta));}
export function maxForce(theta0,Ly,gamma){const sum=2*G(theta0),top=G(Math.PI),bottom=G(0);const rec=inverseG(Math.max(bottom,sum-top)),adv=inverseG(Math.min(top,sum-bottom));return 2*Ly*gamma*(Math.cos(rec)-Math.cos(adv));}
export function angles(force,theta0,Ly,gamma){
 if(force<0||force>maxForce(theta0,Ly,gamma)+1e-9)return null;
 const target=force/(2*Ly*gamma),sum=2*G(theta0),lowest=inverseG(Math.max(G(0),sum-G(Math.PI)));
 let lo=lowest,hi=theta0;
 for(let i=0;i<60;i++){const rec=(lo+hi)/2,adv=inverseG(sum-G(rec));if(Math.cos(rec)-Math.cos(adv)>target)lo=rec;else hi=rec;}
 const rec=(lo+hi)/2;return {rec,adv:inverseG(sum-G(rec))};
}
export function effectiveForce(force,model,F0,drag){return model==='threshold'?Math.max(force-F0,0):model==='linear'?(1-drag)*force:force;}
export function profiles({theta0,rec,adv,l,phi,delta},count=401){
 const h=.5-delta,[u0]=integrals(theta0,h),[u1,v1]=integrals(rec,h),[u2,v2]=integrals(adv,h),d=(phi*l-2*u0)/(2*h),A=2*h*d+u1+u2;
 const offset=(d*(u2-u1)+v2-v1)/(2*A),rows=[];
 let valid=d>0&&A>0&&phi>0&&phi<1&&l>0;
 for(let i=0;i<count;i++){
  const z=-.5+i/(count-1),inside=Math.abs(z)<h;
  const b1=inside?bulge(z,rec,h):0,b2=inside?bulge(z,adv,h):0,width=d+b1+b2;
  if(inside&&(width<=0||width>=l))valid=false;
  rows.push({z,R:inside?width/l:0,Q:inside?(b2-b1)/2-offset:null,left:inside?-d/2-b1:null,right:inside?d/2+b2:null});
 }
 return {rows,h,d,A,offset,valid,volumeResidual:(A-phi*l)/(phi*l),xCOM:offset};
}
