/* Original exercise animation engine: a shaded runner drawn in SVG, side and front views. */
(function(){
const D=Math.PI/180,LT=52,LS=50,AU=35,AF=31,TOR=70;
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k],dir=a=>[Math.cos(a*D),Math.sin(a*D)];
const f1=n=>(+n).toFixed(1);
function ik(a,b,l1,l2,s){
  let dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);d=Math.min(Math.max(d,Math.abs(l1-l2)+.5),l1+l2-.01);
  const th=Math.atan2(dy,dx),al=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
  const k=[a[0]+l1*Math.cos(th+s*al),a[1]+l1*Math.sin(th+s*al)];
  const t=Math.atan2(b[1]-k[1],b[0]-k[0]);return [k,[k[0]+l2*Math.cos(t),k[1]+l2*Math.sin(t)]];
}
// ---------- primitives ----------
function cap(a,b,r1,r2,fill,op=1){
  const t=Math.atan2(b[1]-a[1],b[0]-a[0]),n=[-Math.sin(t),Math.cos(t)];
  const p=[add(a,n,r1),add(b,n,r2),add(b,n,-r2),add(a,n,-r1)].map(q=>f1(q[0])+','+f1(q[1])).join(' ');
  return `<g fill="${fill}" opacity="${op}"><polygon points="${p}"/><circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="${f1(r1)}"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="${f1(r2)}"/></g>`;
}
function sh3(a,b,r1,r2,P){
  const r=(r1+r2)/2,o1=[-.2*r,-.26*r],o2=[-.42*r,-.5*r];
  return cap(a,b,r1,r2,P[0])+cap(add(a,o1),add(b,o1),r1*.78,r2*.78,P[1])+cap(add(a,o2),add(b,o2),r1*.28,r2*.28,P[2],.55);
}
function ball(c,r,P){return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="${P[0]}"/><circle cx="${f1(c[0]-.18*r)}" cy="${f1(c[1]-.22*r)}" r="${f1(r*.78)}" fill="${P[1]}"/><circle cx="${f1(c[0]-.4*r)}" cy="${f1(c[1]-.45*r)}" r="${f1(r*.28)}" fill="${P[2]}" opacity=".55"/>`}
function ell(c,rx,ry,deg,fill='url(#mg)',op=.93){return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(${f1(deg)} ${f1(c[0])} ${f1(c[1])})" fill="${fill}" opacity="${op}"/>`}
function muscle(a,b,t0,t1,side,r,sc=1){
  const u=[b[0]-a[0],b[1]-a[1]],L=Math.hypot(...u)||1,un=[u[0]/L,u[1]/L],nn=[-un[1],un[0]];
  const c=add(add(a,un,L*(t0+t1)/2),nn,side*r*.32);
  return ell(c,L*(t1-t0)/2,r*.62*sc,Math.atan2(u[1],u[0])/D);
}
const SK=['#a8714f','#d39a73','#f3c9a6'],SKF=['#7c5038','#a2694a','#c58f6c'];
const TOP=['#1d4c82','#2f6db3','#8dbbee'],SHO=['#15161b','#2a2c36','#5d6072'],SHF=['#0e0f13','#1d1e26','#3b3d49'];
const SHOE=['#8f96a1','#eceff3','#ffffff'],SHOEF=['#6c727c','#b9bec6','#d5d9df'],HAIR=['#24160f','#43291b','#7a4d33'];

// ---------- side-view athlete ----------
function solveSide(p){
  const J={hip:p.hip,tor:p.tor},t=dir(p.tor);J.t=t;J.n=[-t[1],t[0]];
  J.sh=add(p.hip,t,TOR);
  const kd=p.kd??-1,ed=p.ed??1,ua=p.ua??1;
  [J.kn,J.an]=ik(p.hip,p.an,LT,LS,kd);[J.kn2,J.an2]=ik(add(p.hip,[-3,-1]),p.an2,LT,LS,p.kd2??kd);
  [J.el,J.wr]=ik(J.sh,p.wr,AU*ua,AF,ed);[J.el2,J.wr2]=ik(add(J.sh,[-3,-1]),p.wr2,AU*ua,AF,p.ed2??ed);
  J.to=add(J.an,dir(p.ft),22);J.he=add(J.an,dir(p.ft),-6);J.to2=add(J.an2,dir(p.ft2),22);J.he2=add(J.an2,dir(p.ft2),-6);
  J.h=dir(p.tor+(p.hd||0));J.hc=add(J.sh,J.h,24);return J;
}
function sideAthlete(J,hl){
  const has=k=>hl.includes(k);let s='';
  const gy=Math.max(J.an[1],J.an2[1],J.to[1]);
  if(gy>255)s+=`<ellipse cx="${f1((J.an[0]+J.an2[0])/2+6)}" cy="279" rx="34" ry="4" fill="#000" opacity=".14"/>`;
  s+=sh3(J.hip,J.kn2,13,9,SKF)+cap(J.hip,add(J.hip,[J.kn2[0]-J.hip[0],J.kn2[1]-J.hip[1]],.42),14,11.5,SHF[1]);
  if(has('calf'))s+=muscle(J.kn2,J.an2,.08,.6,1,10.5,1.05).replace('opacity=".93"','opacity=".5"');
  s+=sh3(J.kn2,J.an2,9,5.5,SKF)+sh3(J.he2,J.to2,5.5,4.2,SHOEF);
  s+=sh3(J.sh,J.el2,6,5,SKF)+sh3(J.el2,J.wr2,5,3.8,SKF)+ball(J.wr2,4.4,SKF);
  const t=J.t,n=J.n,hp=J.hip;
  s+=sh3(add(hp,t,-2),add(hp,t,16),16,14.5,SHO);
  s+=sh3(add(hp,t,14),add(hp,t,30),13,12.5,SK);
  s+=sh3(add(hp,t,26),add(J.sh,t,-3),13.5,15.5,TOP);
  if(has('glute')){const c=add(add(hp,n,-8),t,3);s+=ell(c,12,10.5,J.tor+90)}
  if(has('lumbar'))s+=muscle(hp,J.sh,.12,.5,-1,13,.55);
  if(has('lats'))s+=muscle(hp,J.sh,.45,.88,-1,14,.75);
  if(has('abs'))s+=muscle(hp,J.sh,.15,.6,1,13,.55);
  if(has('chest'))s+=muscle(hp,J.sh,.66,.94,1,14,.7);
  const hc=J.hc,fr=[-J.h[1],J.h[0]];
  s+=sh3(J.sh,add(J.sh,J.h,13),5.5,5.5,SK);
  s+=sh3(add(add(hc,fr,-9),J.h,4),add(add(hc,fr,-22),J.h,-11),4.6,2.4,HAIR);
  s+=ball(add(add(hc,fr,-2),J.h,1.5),13.6,HAIR)+ball(add(add(hc,fr,2),J.h,-1.5),11.4,SK);
  s+=sh3(J.hip,J.kn,13.5,9.5,SK);
  s+=cap(J.hip,add(J.hip,[J.kn[0]-J.hip[0],J.kn[1]-J.hip[1]],.42),14.5,12,SHO[1])+cap(add(J.hip,[-2,-3]),add(J.hip,[J.kn[0]-J.hip[0]-2,J.kn[1]-J.hip[1]-3],.36),5,4,SHO[2],.35);
  if(has('quads'))s+=muscle(J.hip,J.kn,.38,.92,-1,13);
  if(has('hams'))s+=muscle(J.hip,J.kn,.36,.9,1,13);
  s+=sh3(J.kn,J.an,9.5,5.8,SK);
  if(has('calf'))s+=muscle(J.kn,J.an,.08,.6,1,10.5,1.05);
  if(has('tib'))s+=muscle(J.kn,J.an,.12,.75,-1,9,.6);
  s+=sh3(J.he,J.to,5.8,4.4,SHOE)+cap(add(J.he,[0,4]),add(J.to,[0,3.4]),1.6,1.4,'#c8432b');
  s+=sh3(J.sh,J.el,6.6,5.3,SK);
  if(has('tri'))s+=muscle(J.sh,J.el,.2,.85,-1,6.6,1.1);
  s+=sh3(J.el,J.wr,5.3,4,SK)+ball(J.wr,4.8,SK)+ball(J.sh,9,TOP);
  if(has('delt'))s+=`<circle cx="${f1(J.sh[0])}" cy="${f1(J.sh[1])}" r="7.5" fill="url(#mg)" opacity=".93"/>`;
  return s;
}
// ---------- front-view athlete ----------
function solveFront(p){
  const J={hip:p.hip,tor:p.tor,front:1},t=dir(p.tor),n=[-t[1],t[0]];J.t=t;J.n=n;
  J.hL=add(p.hip,n,-9);J.hR=add(p.hip,n,9);J.sh=add(p.hip,t,TOR);J.sL=add(J.sh,n,-15);J.sR=add(J.sh,n,15);
  if(p.kn){J.kn=p.kn;J.an=p.an}else[J.kn,J.an]=ik(J.hL,p.an,LT,LS,1);
  if(p.kn2){J.kn2=p.kn2;J.an2=p.an2}else[J.kn2,J.an2]=ik(J.hR,p.an2,LT,LS,-1);
  [J.el,J.wr]=ik(J.sL,p.wr,AU,AF,1);[J.el2,J.wr2]=ik(J.sR,p.wr2,AU,AF,-1);
  J.hc=add(J.sh,dir(p.tor+(p.hd||0)),24);J.h=dir(p.tor+(p.hd||0));return J;
}
const quad=(a,b,c,d,fill,op=1)=>`<polygon points="${[a,b,c,d].map(q=>f1(q[0])+','+f1(q[1])).join(' ')}" fill="${fill}" opacity="${op}"/>`;
function frontAthlete(J,hl){
  const has=k=>hl.includes(k),t=J.t,n=J.n,hp=J.hip;let s='';
  const gy=Math.max(J.an[1],J.an2[1]);
  if(gy>255&&Math.abs(t[0])<.5)s+=`<ellipse cx="${f1((J.an[0]+J.an2[0])/2)}" cy="279" rx="30" ry="4" fill="#000" opacity=".14"/>`;
  // arms behind torso edges
  const leg=(h,k,a)=>sh3(h,k,12.5,9,SK)+cap(h,add(h,[k[0]-h[0],k[1]-h[1]],.4),13.5,11.5,SHO[1])+sh3(k,a,9,5.5,SK)+`<ellipse cx="${f1(a[0])}" cy="${f1(a[1]+4)}" rx="6.5" ry="5" fill="#eceff3" stroke="#9aa0aa" stroke-width="1"/>`;
  s+=leg(J.hL,J.kn,J.an)+leg(J.hR,J.kn2,J.an2);
  if(has('quads')){s+=muscle(J.hL,J.kn,.3,.9,0,12);s+=muscle(J.hR,J.kn2,.3,.9,0,12)}
  if(has('calf')){s+=muscle(J.kn,J.an,.1,.55,0,8,.8);s+=muscle(J.kn2,J.an2,.1,.55,0,8,.8)}
  // torso
  const P=(a,b)=>add(add(hp,t,a),n,b);
  s+=quad(P(-4,-17),P(-4,17),P(17,15),P(17,-15),'url(#shoG)');
  s+=quad(P(15,-13.5),P(15,13.5),P(30,12.5),P(30,-12.5),'url(#skinG)');
  s+=quad(P(28,-13),P(28,13),P(68,16.5),P(68,-16.5),'url(#topG)');
  s+=ball(J.sL,8.5,TOP)+ball(J.sR,8.5,TOP);
  if(has('glute')){s+=ell(P(2,-17),8,12,J.tor+90);s+=ell(P(2,17),8,12,J.tor+90)}
  if(has('abs'))s+=ell(P(26,0),14,9,J.tor);
  // arms
  s+=sh3(J.sL,J.el,6.4,5.2,SK)+sh3(J.el,J.wr,5.2,4,SK)+ball(J.wr,4.6,SK);
  s+=sh3(J.sR,J.el2,6.4,5.2,SK)+sh3(J.el2,J.wr2,5.2,4,SK)+ball(J.wr2,4.6,SK);
  // head
  s+=sh3(J.sh,add(J.sh,J.h,13),5.5,5.5,SK);
  s+=ball(add(J.hc,J.h,2),14,HAIR)+ball(add(J.hc,J.h,-1.5),11.6,SK);
  s+=cap(add(add(J.hc,J.h,9),n,-11),add(add(J.hc,J.h,9),n,11),3.2,3.2,HAIR[1]);
  return s;
}

// ---------- equipment ----------
const rect=(x,y,w,h,f,rx=2)=>`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${f}"/>`;
const line=(a,b,w,c,lc='round')=>`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="${lc}"/>`;
const FLOOR=`<rect x="0" y="280" width="400" height="20" fill="url(#floor)"/><line x1="0" y1="280" x2="400" y2="280" stroke="#8a929d" stroke-width="1.5"/>`;
function scroll(t,v){let s=FLOOR;const off=((t*v)%50+50)%50;for(let x=-off;x<420;x+=50)s+=`<rect x="${f1(x)}" y="286" width="22" height="3" rx="1.5" fill="#7d8692" opacity=".55"/>`;return s}
const mat=(x0,x1)=>rect(x0,271,x1-x0,9,'#3f7e78',4)+rect(x0,271,x1-x0,2.5,'#5aa39b',2);
function plateDisc(c,r){return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="url(#plate)"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r-4}" fill="none" stroke="#5b616c" stroke-width="1.5"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="5" fill="url(#steelv)"/>`}
function hexa(c,r,fill){let p='';for(let k=0;k<6;k++){const a=(k*60+30)*D;p+=f1(c[0]+r*Math.cos(a))+','+f1(c[1]+r*Math.sin(a))+' '}return `<polygon points="${p}" fill="${fill}"/>`}
function dumbbell(c,far){return hexa(c,12,far?'#0d0e11':'url(#plate)')+hexa(c,8.5,far?'#1a1c21':'#2a2d34')+`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="3.6" fill="url(#steelv)"/>`}
function dbVert(c){return rect(c[0]-7,c[1]-18,14,8,'#22252b',2)+rect(c[0]-2,c[1]-12,4,24,'#aab2bd',1)+rect(c[0]-7,c[1]+10,14,8,'#22252b',2)}
const pad=(a,b,r=7)=>line(a,b,r*2,'url(#pad)');
const post=(x,y0,y1=280,w=8)=>rect(x-w/2,y0,w,y1-y0,'url(#steel)',3);
function stack(x){let s=post(x-14,24)+post(x+14,24)+rect(x-20,18,40,8,'url(#steelv)',3);for(let y=200;y<274;y+=9)s+=rect(x-11,y,22,7,'#2a2d34',1.5);return s}
const ROPE='#2a2d34';

// leg press geometry
const U=dir(-40),PP=[-U[1],U[0]];
function pressFrame(J){const t=J.t,n=J.n,back=[-n[0],-n[1]],bp=add(J.hip,back,17);
  const railA=add(add([225,142],PP,58),U,-122),railB=add(add([225,142],PP,58),U,112);
  return FLOOR+line(railA,railB,9,'url(#steelv)')+line(railB,[railB[0],280],9,'#59616c','butt')+line([railB[0]-14,280],[railB[0]+14,280],5,'#4b525c')
   +line(add(bp,t,-16),add(bp,t,98),15,'url(#pad)')+line(add(bp,t,-6),[bp[0]-6,280],7,'#59616c','butt')+line(add(bp,t,60),[add(bp,t,60)[0],280],7,'#59616c','butt')
   +line(add(J.hip,[-14,16]),add(J.hip,[16,18]),12,'url(#pad)');}
function sledAt(a,lo,hi){const C=add(a,PP,52);return line(add(a,U,8),add(C,U,18),7,'#59616c')+plateDisc(add(C,U,18),24)+line(add(add(a,U,7),PP,lo),add(add(a,U,7),PP,hi),8,'url(#steel)','butt')}

const EQ={
 none:()=>[FLOOR,''],
 rope:(J,t,e)=>{const ph=-90+360*((t%e.T)/e.T),P=[202+72*Math.cos(ph*D),170+106*Math.sin(ph*D)],m=[(J.wr[0]+P[0])/2,(J.wr[1]+P[1])/2];
   const c1=add(m,[m[0]-202,m[1]-170],.35);const path=`<path d="M${f1(J.wr[0])},${f1(J.wr[1])} Q${f1(c1[0])},${f1(c1[1])} ${f1(P[0])},${f1(P[1])}" fill="none" stroke="${ROPE}" stroke-width="2.2"/>`;
   const behind=Math.sin(ph*D)<-.2||Math.cos(ph*D)<0;return [FLOOR+(behind?path:''),(behind?'':path)+cap(add(J.wr,[0,-6]),add(J.wr,[0,8]),2.6,2.6,'#c8432b')]},
 line:()=>[FLOOR+line([200,282],[200,299],3,'#c8432b'),''],
 marks:()=>[FLOOR+line([132,282],[132,299],3,'#c8432b')+line([262,282],[262,299],3,'#2459d6'),''],
 press:J=>[pressFrame(J)+sledAt(J.an,14,-40),line(add(J.wr,PP,-7),add(J.wr,PP,7),5,'#2b2f36')],
 pressCalf:J=>[pressFrame(J)+sledAt(add(J.to,U,-2),2,-50),line(add(J.wr,PP,-7),add(J.wr,PP,7),5,'#2b2f36')],
 hack:J=>{const t=J.t,b=[-J.n[0],-J.n[1]],bp=add(J.hip,b,17),rl=add(bp,b,7);
   const ft=[J.to[0]-J.he[0],J.to[1]-J.he[1]],fl=Math.hypot(...ft),fu=[ft[0]/fl,ft[1]/fl],sole=[-fu[1],fu[0]];
   const pl0=add(add(J.he,fu,-10),sole,7),pl1=add(add(J.to,fu,8),sole,7);
   return [FLOOR+line(add(rl,t,-80),add(rl,t,150),8,'url(#steelv)')+line(pl0,[pl0[0],280],6,'#59616c','butt')+line(pl1,[pl1[0],280],6,'#59616c','butt')+line(pl0,pl1,7,'url(#steel)')
     +pad(add(bp,t,-8),add(bp,t,74),7.5),pad(add(J.sh,b,2),add(add(J.sh,b,2),J.n,14),5.5)]},
 dbs:J=>[FLOOR+dumbbell(add(J.wr2,[-2,-1]),1),dumbbell(add(J.wr,[0,2]),0)],
 roman:J=>{const L=dir(135),hp=[210.7,169.3],pc=add(add(hp,L,12),[.707,.707],16);
   return [FLOOR+line([128,262],add(pc,[-6,22]),8,'#59616c')+line(add(pc,[-6,22]),[pc[0]+12,280],7,'#59616c','butt')+line([96,280],[150,262],7,'#59616c')+line([128,262],[110,280],6,'#59616c')
     +`<circle cx="133" cy="232" r="6.5" fill="url(#pad)"/>`+line([128,250],[150,244],6,'url(#steel)'),pad(add(pc,L,-14),add(pc,L,14),8)]},
 seatCalf:J=>{const k=J.kn;return [FLOOR+stack(300)+pad([126,206],[176,206],7)+line([150,213],[150,280],7,'#59616c','butt')+rect(214,247,26,33,'url(#steelv)',3)
     +line(add(k,[8,-16]),[300,150],6,'#59616c'),pad(add(k,[-14,-15]),add(k,[14,-15]),6)]},
 seatDb:J=>[FLOOR+rect(108,213,70,9,'url(#pad)',4)+line([118,222],[118,280],6,'#59616c','butt')+line([168,222],[168,280],6,'#59616c','butt')+rect(214,247,26,33,'url(#wood)',3),dbVert(add(J.kn,[0,-20]))],
 abd:J=>[FLOOR+stack(352)+rect(174,96,52,108,'url(#pad)',8)+rect(166,198,68,14,'url(#pad)',6)+line([200,212],[200,280],8,'#59616c','butt')+rect(150,262,100,7,'#59616c',3),
   rect(J.kn[0]-18,J.kn[1]-16,8,34,'url(#pad)',4)+rect(J.kn2[0]+10,J.kn2[1]-16,8,34,'url(#pad)',4)],
 sideMat:()=>[FLOOR+mat(70,330),''],
 box:()=>[FLOOR+rect(248,220,96,60,'url(#wood)',4)+rect(248,220,96,6,'#e7c896',3)+line([254,242],[338,242],1,'#94693a')+line([254,262],[338,262],1,'#94693a'),''],
 scroll:(J,t,e)=>[scroll(t,e.v||.08),''],
 smithSplit:J=>{const bar=add(J.sh,[-6,-6]);return [FLOOR+rect(bar[0]-4,14,8,266,'url(#steel)',3)+rect(bar[0]-40,10,80,8,'url(#steelv)',3)
   +'',`<circle cx="${f1(bar[0])}" cy="${f1(bar[1])}" r="6" fill="url(#steelv)"/><circle cx="${f1(bar[0])}" cy="${f1(bar[1])}" r="2.5" fill="#59616c"/>`]},
 step:J=>[FLOOR+rect(210,232,92,48,'url(#wood)',4)+rect(210,232,92,5,'#e7c896',3)+dumbbell(add(J.wr2,[-2,6]),1),dumbbell(add(J.wr,[0,8]),0)],
 hipMachine:J=>{const n=J.n,pc=add(J.hip,n,16);return [FLOOR+rect(40,218,70,62,'url(#pad)',6)+line([300,240],[300,280],9,'#59616c','butt')+plateDisc([300,232],22),
   line(pc,[300,232],6,'#59616c')+`<circle cx="${f1(pc[0])}" cy="${f1(pc[1])}" r="9.5" fill="url(#pad)"/>`]},
 bench:()=>[FLOOR+rect(40,218,70,62,'url(#pad)',6),''],
 legCurl:J=>{const u=[J.an[0]-J.kn[0],J.an[1]-J.kn[1]],L=Math.hypot(...u),nn=[-u[1]/L,u[0]/L],r=add(J.an,nn,-8);
   return [FLOOR+stack(352)+rect(88,205,150,9,'url(#pad)',4)+line([110,214],[110,280],7,'#59616c','butt')+line([220,214],[220,280],7,'#59616c','butt')+line(r,add(J.kn,[8,10]),5,'#59616c'),
     `<circle cx="${f1(r[0])}" cy="${f1(r[1])}" r="6.5" fill="url(#pad)"/>`]},
 nordic:()=>[FLOOR+rect(132,268,84,12,'url(#pad)',5)+line([112,250],[112,280],6,'#59616c','butt'),`<circle cx="120" cy="251" r="6.5" fill="url(#pad)"/>`],
 calfStep:J=>[FLOOR+rect(212,240,90,40,'url(#wood)',4)+rect(212,240,90,5,'#e7c896',3)+post(262,70,240,7),dumbbell(add(J.wr,[0,8]),0)],
 wall:()=>[FLOOR+rect(96,0,24,280,'#cfd5dd',0)+rect(116,0,4,280,'#b4bcc7',0),''],
 pulldown:J=>[FLOOR+stack(330)+`<circle cx="186" cy="20" r="7" fill="url(#steelv)"/>`+line([186,14],[330,14],5,'#59616c')+line([186,20],J.wr,2,ROPE)+pad([156,228],[206,228],7)+line([180,235],[180,280],7,'#59616c','butt')+line([206,228],[330,236],5,'#59616c'),
   line(add(J.wr,[-14,0]),add(J.wr,[14,0]),5,'#2b2f36')+pad(add(J.kn,[-8,-13]),add(J.kn,[10,-13]),6)],
 assist:J=>[FLOOR+stack(330)+line([224,40],[330,30],6,'url(#steelv)')+line(add(J.kn,[8,12]),[316,236],5,'#59616c')+`<circle cx="224" cy="40" r="5" fill="#2b2f36"/>`,
   pad(add(J.kn,[-30,12]),add(J.kn,[8,12]),6)],
 chestPress:J=>{const t=J.t,b=[-J.n[0],-J.n[1]],bp=add(J.hip,b,17);return [FLOOR+stack(352)+pad(add(bp,t,-6),add(bp,t,84),7)+pad(add(J.hip,[-22,16]),add(J.hip,[26,16]),7)+line([150,230],[150,280],7,'#59616c','butt')+line(J.wr,[210,52],5,'#59616c')+line([210,52],[352,30],5,'#59616c'),
   cap(add(J.wr,[0,-9]),add(J.wr,[0,9]),3,3,'#2b2f36')]},
 pushup:()=>[FLOOR+mat(70,330),''],
 rowMachine:J=>[FLOOR+stack(352)+pad([172,150],[172,186],7)+pad([128,230],[176,230],7)+line([150,237],[150,280],7,'#59616c','butt')+line([172,186],[172,280],6,'#59616c','butt')+line(J.wr,[250,90],5,'#59616c')+line([250,90],[352,60],5,'#59616c'),
   cap(add(J.wr,[0,-9]),add(J.wr,[0,9]),3,3,'#2b2f36')],
 inclineRow:J=>{const t=J.t,n=J.n,a=add(add(J.hip,n,17),t,-14),b=add(add(J.sh,n,17),t,6);
   return [FLOOR+line(a,[a[0]+4,280],6,'#59616c','butt')+line(b,[b[0]-8,280],6,'#59616c','butt')+pad(a,b,7)+dumbbell(add(J.wr2,[-2,2]),1),dumbbell(add(J.wr,[0,4]),0)]},
 shoulderMachine:J=>{const t=J.t,b=[-J.n[0],-J.n[1]],bp=add(J.hip,b,17);return [FLOOR+stack(60)+pad(add(bp,t,-6),add(bp,t,86),7)+pad(add(J.hip,[-22,16]),add(J.hip,[26,16]),7)+line([160,230],[160,280],7,'#59616c','butt')+line(J.wr,[110,150],5,'#59616c')+line([110,150],[60,120],5,'#59616c'),
   line(add(J.wr,[-8,0]),add(J.wr,[8,0]),5,'#2b2f36')]},
 dbBench:J=>{const t=J.t,b=[-J.n[0],-J.n[1]],bp=add(J.hip,b,17);return [FLOOR+pad(add(bp,t,-6),add(bp,t,80),7)+pad(add(J.hip,[-22,16]),add(J.hip,[26,16]),7)+line([160,230],[160,280],7,'#59616c','butt')+dumbbell(add(J.wr2,[-2,-2]),1),dumbbell(J.wr,0)]},
 pallof:J=>[FLOOR+post(140,30)+`<circle cx="140" cy="126" r="6" fill="url(#steelv)"/>`+line([140,126],J.wr,2,ROPE),cap(add(J.wr,[0,-6]),add(J.wr,[0,6]),3,3,'#2b2f36')],
 mat:()=>[FLOOR+mat(40,360),''],
 standCalf:J=>{const p=add(J.sh,[0,-8]);return [FLOOR+stack(110)+rect(200,260,54,20,'url(#steelv)',3)+line([110,p[1]-10],[p[0]-6,p[1]-10],6,'#59616c'),pad(add(p,[-16,0]),add(p,[12,0]),6.5)]},
 cableCrunch:J=>[FLOOR+post(306,14)+`<circle cx="300" cy="22" r="7" fill="url(#steelv)"/>`+line([300,22],J.wr,2,ROPE)+rect(150,270,90,10,'url(#pad)',4),cap(add(J.wr,[-5,-3]),add(J.wr,[5,3]),3,3,'#2b2f36')],
};

// ---------- animation data ----------
const lerp=(a,b,f)=>{const o={};for(const k in a){const v=a[k],w=b[k]??v;o[k]=Array.isArray(v)?v.map((x,i)=>x+(w[i]-x)*f):x+(w-x)*f}return o};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function cr(p0,p1,p2,p3,f){const o={};for(const k in p1){const g=(a,b,c,d)=>.5*(2*b+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f);
  const A=p0[k]??p1[k],C=p2[k]??p1[k],Dd=p3[k]??C;o[k]=Array.isArray(p1[k])?p1[k].map((v,i)=>g(A[i],v,C[i],Dd[i])):g(A,p1[k],C,Dd)}return o}
// helpers to write poses
const S=(o)=>Object.assign({an2:o.an?[o.an[0]-4,o.an[1]]:undefined,ft:0,ft2:o.ft??0,wr2:o.wr?[o.wr[0]-4,o.wr[1]-2]:undefined,hd:0},o);
const F=(p,d,ph)=>({p,d,ph});
const sit=(hip,tor,wr,extra={})=>S(Object.assign({hip,tor,an:[hip[0]+56,272],an2:[hip[0]+52,272],wr},extra));
function onHip(hip,dx=7,dy=-4){return [hip[0]+dx,hip[1]+dy]}

const A={};
// ---- DAY A ----
{const g=(y,ft)=>S({hip:[197,178+y],tor:-88,an:[200,270+y],ft,wr:[214,150+y],ed:1});
 A.pogo={view:'side',eq:'none',hl:['calf'],trail:J=>J.he,frames:[F(g(0,18),260,'Contacto corto'),F(g(-16,32),260,'Rebota con los tobillos')]};
 const r=(y,ft)=>S({hip:[197,178+y],tor:-88,an:[200,270+y],ft,wr:[211,172+y],ed:1});
 A.rope={view:'side',eq:'rope',hl:['calf'],frames:[F(r(0,18),300,'Contacto corto'),F(r(-11,30),300,'La cuerda pasa por debajo')]};}
A.cmj={view:'side',eq:'none',hl:['quads','glute','calf'],trail:J=>J.hip,trailFrom:1,trailTo:4,frames:[
 F(S({hip:[197,175],tor:-88,an:[200,272],wr:[203,172]}),520,'Preparada'),
 F(S({hip:[176,208],tor:-50,an:[200,272],wr:[178,196],hd:-15}),380,'Baja rápido, brazos atrás'),
 F(S({hip:[198,162],tor:-84,an:[200,256],ft:50,wr:[214,40]}),280,'Salta con todo'),
 F(S({hip:[198,136],tor:-88,an:[200,230],ft:40,wr:[206,20]}),280,'Máxima altura'),
 F(S({hip:[188,196],tor:-62,an:[200,272],wr:[226,176]}),460,'Aterriza suave')]};
A.squatJump={view:'side',eq:'none',hl:['quads','glute','calf'],trail:J=>J.hip,trailFrom:2,trailTo:5,frames:[
 F(S({hip:[197,175],tor:-88,an:[200,272],wr:[212,124],ed:-1}),400,'Preparada'),
 F(S({hip:[172,215],tor:-55,an:[200,272],wr:[226,176],ed:-1}),500,'Baja a media sentadilla'),
 F(S({hip:[172,215],tor:-55,an:[200,272],wr:[226,176],ed:-1}),300,'Pausa: sin rebote'),
 F(S({hip:[198,160],tor:-84,an:[200,254],ft:50,wr:[220,110],ed:-1}),280,'Salta'),
 F(S({hip:[198,136],tor:-88,an:[200,230],ft:40,wr:[215,86],ed:-1}),280,'Máxima altura'),
 F(S({hip:[186,198],tor:-62,an:[200,272],wr:[234,156],ed:-1}),460,'Aterriza suave')]};
{const st=(x,y)=>({hip:[x,176+y],tor:-90,an:[x-10,272+y],an2:[x+10,272+y],wr:[x-22,172+y],wr2:[x+22,172+y]});
 A.lineHops={view:'front',eq:'line',hl:['calf'],trail:J=>J.hip,frames:[F(st(176,6),200,'Contacto'),F(st(200,-16),200,'Cruza la línea'),F(st(224,6),200,'Contacto'),F(st(200,-16),200,'Cruza la línea')]};}
A.skater={view:'front',eq:'none',hl:['glute','quads'],trail:J=>J.hip,frames:[
 F({hip:[150,192],tor:-78,an:[146,272],an2:[170,244],wr:[178,184],wr2:[186,166]},420,'Aterriza en una pierna'),
 F({hip:[200,150],tor:-90,an:[190,236],an2:[210,236],wr:[176,150],wr2:[224,150]},300,'Salta lateral'),
 F({hip:[250,192],tor:-102,an:[230,244],an2:[254,272],wr:[214,166],wr2:[222,184]},420,'Aterriza en la otra'),
 F({hip:[200,150],tor:-90,an:[190,236],an2:[210,236],wr:[176,150],wr2:[224,150]},300,'Salta lateral')]};
{const b={hip:[150,205],tor:-150,an:[194,168],ft:-130,wr:[128,214],hd:8},e={...b,an:[225,142]};
 A.legPress={view:'side',eq:'press',hl:['quads','glute'],trail:J=>J.an,frames:[F(S(b),450,'Abajo'),F(S(b),1100,'Empuja'),F(S(e),350,'Arriba, sin bloquear'),F(S(e),1500,'Baja controlado')]};}
{const top={hip:[196,172],tor:-105,an:[226,262],ft:-15,ed:-1},bot={hip:[211.6,230],tor:-105,an:[226,262],ft:-15,ed:-1};
 const wr=p=>{const sh=add(p.hip,dir(p.tor),TOR);return [sh[0]+12,sh[1]-4]};top.wr=wr(top);bot.wr=wr(bot);
 A.hack={view:'side',eq:'hack',hl:['quads','glute'],trail:J=>J.hip,frames:[F(S(top),400,'Arriba'),F(S(top),1500,'Baja controlada'),F(S(bot),300,'Abajo'),F(S(bot),1000,'Empuja')]};}
{const t={hip:[196,174],tor:-88,an:[200,272],wr:[204,172]},b={hip:[158,182],tor:-18,an:[200,272],wr:[224,228],hd:-14};
 A.rdl={view:'side',eq:'dbs',hl:['hams','glute','lumbar'],trail:J=>J.wr,frames:[F(S(t),400,'Arriba'),F(S(t),1700,'Cadera atrás'),F(S(b),350,'Estira isquios'),F(S(b),1100,'Sube apretando glúteo')]};}
{const hp=[210.7,169.3],an=[140,240],chest=tor=>{const T=dir(tor),N=[-T[1],T[0]],sh=add(hp,T,TOR);return add(add(sh,T,-14),N,14)};
 const P=tor=>S({hip:hp,tor,an,ft:45,wr:chest(tor),ed:-1});
 A.roman={view:'side',eq:'roman',hl:['hams','glute','lumbar'],trail:J=>J.sh,frames:[F(P(-45),300,'Arriba: cuerpo en línea'),F(P(-45),1500,'Baja doblando la cadera'),F(P(70),300,'Abajo'),F(P(70),1000,'Sube apretando glúteo')]};}
{const d=S({hip:[150,198],tor:-88,an:[204,248],ft:-18,wr:[196,186],ed:-1,an2:[200,248],ft2:-18}),u=S({hip:[150,198],tor:-88,an:[207,229],ft:34,wr:[198,176],ed:-1,an2:[203,229],ft2:34});
 A.seatCalf={view:'side',eq:'seatCalf',hl:['calf'],trail:J=>J.he,frames:[F(d,450,'Talones abajo: estira'),F(d,700,'Sube'),F(u,400,'Aprieta arriba'),F(u,900,'Baja lento')]};
 const d2=S({hip:[150,206],tor:-84,an:[204,250],ft:-18,an2:[196,272],ft2:0,wr:[212,190],ed:-1}),u2=S({hip:[150,206],tor:-84,an:[207,231],ft:34,an2:[196,272],ft2:0,wr:[214,172],ed:-1});
 A.seatDbOld={view:'side',eq:'seatDb',hl:['calf'],trail:J=>J.he,frames:[F(d2,450,'Talón abajo: estira'),F(d2,700,'Sube'),F(u2,400,'Aprieta arriba'),F(u2,900,'Baja lento')]};}
{const c={hip:[200,200],tor:-90,kn:[188,214],an:[188,262],kn2:[212,214],an2:[212,262],wr:[168,206],wr2:[232,206]},o={...c,kn:[160,212],an:[166,262],kn2:[240,212],an2:[234,262]};
 {const P=(an,ft,hipY)=>{const hip=[an[0]-3,hipY],sh=add(hip,dir(-88),TOR);return S({hip,tor:-88,an,ft,wr:[sh[0]+12,sh[1]-10],ed:-1})};
 const d=P([196,266],-25,169),u=P([198,244],35,147);
 A.standCalf={view:'side',eq:'standCalf',hl:['calf'],trail:J=>J.he,frames:[F(d,400,'Talones abajo: estira'),F(d,800,'Sube a puntillas'),F(u,350,'Aprieta arriba'),F(u,1000,'Baja lento')]};}
A.abd={view:'front',eq:'abd',hl:['glute'],trail:J=>J.kn,frames:[F(c,350,'Rodillas juntas'),F(c,900,'Abre'),F(o,400,'Aprieta'),F(o,1100,'Cierra lento')]};}
{const base={hip:[205,252],tor:180,an:[305,262],wr:[100,238],wr2:[150,268],hd:0},dn={...base,an2:[305,250]},up={...base,an2:[287,192]};
 A.sideLying={view:'front',eq:'sideMat',hl:['glute'],trail:J=>J.an2,frames:[F(dn,350,'Pierna de arriba estirada'),F(dn,800,'Sube la pierna'),F(up,400,'Arriba 1 s'),F(up,1100,'Baja lento')]};}
// ---- DAY B ----
A.boxJump={view:'side',eq:'box',hl:['quads','glute','calf'],trail:J=>J.hip,trailFrom:1,trailTo:4,frames:[
 F(S({hip:[193,175],tor:-88,an:[196,272],wr:[200,170]}),600,'Preparada'),
 F(S({hip:[172,212],tor:-48,an:[196,272],wr:[178,196],hd:-20}),520,'Carga: brazos atrás'),
 F(S({hip:[208,165],tor:-78,an:[204,258],ft:55,wr:[246,38]}),380,'Despega'),
 F(S({hip:[244,150],tor:-80,an:[258,188],ft:15,wr:[296,124]}),400,'Recoge rodillas'),
 F(S({hip:[266,182],tor:-52,an:[292,212],wr:[338,160],hd:-18}),480,'Aterriza suave'),
 F(S({hip:[289,115],tor:-88,an:[292,212],wr:[296,110]}),800,'Ponte de pie'),
 F(S({hip:[266,160],tor:-84,an:[236,256],an2:[292,212],ft:30,ft2:0,wr:[272,154]}),620,'Baja andando'),
 F(S({hip:[236,178],tor:-86,an:[232,272],an2:[276,214],ft:0,ft2:10,wr:[242,172]}),520,'Baja andando'),
 F(S({hip:[229,175],tor:-88,an:[232,272],wr:[236,170]}),420,'Vuelve atrás'),
 F(S({hip:[218,174],tor:-88,an:[212,262],an2:[226,272],ft:10,ft2:0,wr:[225,169]}),420,'Vuelve atrás'),
 F(S({hip:[203,175],tor:-88,an:[200,272],an2:[210,264],ft:0,ft2:10,wr:[210,170]}),420,'Vuelve atrás')]};
{const w=(h)=>[h[0]+7,h[1]-4];
 A.broadJump={view:'side',eq:'marks',hl:['quads','glute','calf'],trail:J=>J.hip,trailFrom:1,trailTo:4,frames:[
 F(S({hip:[117,175],tor:-88,an:[120,272],wr:[123,172]}),500,'Preparada'),
 F(S({hip:[96,210],tor:-45,an:[120,272],wr:[106,190],hd:-15}),420,'Carga: brazos atrás'),
 F(S({hip:[150,170],tor:-55,an:[130,262],ft:50,wr:[244,84]}),280,'Despega hacia delante'),
 F(S({hip:[192,150],tor:-70,an:[214,198],ft:20,wr:[250,140]}),300,'Lleva los pies delante'),
 F(S({hip:[234,214],tor:-50,an:[262,272],wr:[318,190]}),440,'Aterriza suave'),
 F(S({hip:[259,175],tor:-88,an:[262,272],wr:w([259,175])}),500,'Estabiliza'),
 F(S({hip:[245,174],tor:-88,an:[230,264],an2:[258,272],ft:10,ft2:0,wr:w([245,174])}),320,'Vuelve caminando'),
 F(S({hip:[214,174],tor:-88,an:[230,272],an2:[196,264],ft:0,ft2:10,wr:w([214,174])}),320,'Vuelve caminando'),
 F(S({hip:[182,174],tor:-88,an:[164,264],an2:[196,272],ft:10,ft2:0,wr:w([182,174])}),320,'Vuelve caminando'),
 F(S({hip:[150,174],tor:-88,an:[164,272],an2:[128,264],ft:0,ft2:10,wr:w([150,174])}),320,'Vuelve caminando')]};}
A.bound={view:'side',eq:'scroll',v:.16,hl:['glute','hams','calf'],frames:[
 F(S({hip:[200,168],tor:-80,an:[176,268],ft:30,an2:[236,206],ft2:20,wr:[244,120],wr2:[172,164]}),260,'Empuja con la pierna de atrás'),
 F(S({hip:[200,150],tor:-80,an:[166,214],ft:40,an2:[246,196],ft2:10,wr:[240,122],wr2:[176,160]}),260,'Vuelo largo'),
 F(S({hip:[200,168],tor:-80,an2:[176,268],ft2:30,an:[236,206],ft:20,wr2:[244,120],wr:[172,164]}),260,'Empuja con la otra'),
 F(S({hip:[200,150],tor:-80,an2:[166,214],ft2:40,an:[246,196],ft:10,wr2:[240,122],wr:[176,160]}),260,'Vuelo largo')]};
A.askip={view:'side',eq:'scroll',v:.08,hl:['quads','calf'],frames:[
 F(S({hip:[200,172],tor:-88,an:[200,270],ft:15,an2:[230,218],ft2:25,wr:[232,120],wr2:[178,160]}),260,'Rodilla arriba'),
 F(S({hip:[200,166],tor:-88,an:[200,262],ft:30,an2:[206,258],ft2:10,wr:[214,140],wr2:[196,150]}),240,'Pisa debajo de la cadera'),
 F(S({hip:[200,172],tor:-88,an2:[200,270],ft2:15,an:[230,218],ft:25,wr2:[232,120],wr:[178,160]}),260,'Rodilla arriba'),
 F(S({hip:[200,166],tor:-88,an2:[200,262],ft2:30,an:[206,258],ft:10,wr2:[214,140],wr:[196,150]}),240,'Pisa debajo de la cadera')]};
{const g=(y,ft)=>S({hip:[197,176+y],tor:-88,an:[200,270+y],ft,an2:[178,222+y],ft2:40,wr:[214,150+y],ed:1});
 A.hops={view:'side',eq:'none',hl:['calf'],trail:J=>J.he,frames:[F(g(0,15),250,'Contacto corto'),F(g(-14,35),250,'Rebota')]};}
A.fwdHops={view:'side',eq:'scroll',v:.12,hl:['calf','quads','glute'],frames:[
 F(S({hip:[196,184],tor:-78,an:[204,270],ft:0,an2:[176,226],ft2:40,wr:[184,160]}),260,'Aterriza y absorbe'),
 F(S({hip:[204,170],tor:-80,an:[196,262],ft:45,an2:[178,220],ft2:40,wr:[236,120]}),240,'Empuja hacia delante'),
 F(S({hip:[204,150],tor:-82,an:[206,232],ft:20,an2:[180,206],ft2:40,wr:[234,126]}),240,'Vuelo'),
 F(S({hip:[200,164],tor:-80,an:[214,258],ft:5,an2:[178,214],ft2:40,wr:[214,140]}),240,'Prepara el aterrizaje')]};
{const P=(hip)=>{const sh=add(hip,dir(-86),TOR);return S({hip,tor:-86,an:[214,272],an2:[140,266],ft2:30,wr:[sh[0]-8,sh[1]-6],ed:1})};
 A.bulgarian={view:'side',eq:'smithSplit',hl:['quads','glute'],trail:J=>J.sh,frames:[F(P([178,178]),400,'Arriba, pies separados en zancada'),F(P([178,178]),1500,'Baja en vertical'),F(P([176,216]),300,'Rodilla de atrás cerca del suelo'),F(P([176,216]),1000,'Empuja con la pierna de delante')]};}
{const w=h=>[h[0]+7,h[1]-4],P=(hip,tor,an2,ft2)=>S({hip,tor,an:[236,224],an2,ft2,wr:w(hip),wr2:[w(hip)[0]-4,w(hip)[1]-2]});
 const f0=P([186,188],-80,[176,272],0),f2=P([232,128],-88,[262,180],20),f3=P([214,150],-84,[196,236],20);
 A.stepUp={view:'side',eq:'step',hl:['quads','glute'],trail:J=>J.hip,frames:[F(f0,300,'Pie en el cajón'),F(f0,800,'Sube empujando con ese pie'),F(f2,350,'Rodilla arriba'),F(f2,500,'Baja'),F(f3,500,'Baja controlada')]};}
{const P=(hip,tor,wr,extra={})=>S(Object.assign({hip,tor,an:[214,272],wr,ed:-1},extra));
 A.hipThrust={view:'side',eq:'hipMachine',hl:['glute','hams'],trail:J=>J.hip,frames:[F(P([156,256],-136,[160,242],{hd:30}),300,'Abajo'),F(P([156,256],-136,[160,242],{hd:30}),900,'Sube la cadera'),F(P([178,206],-180,[182,192],{hd:25}),500,'Aprieta 1 s'),F(P([178,206],-180,[182,192],{hd:25}),1100,'Baja controlado')]};
 A.slHipThrust={view:'side',eq:'bench',hl:['glute','hams'],trail:J=>J.hip,frames:[F(P([156,256],-136,[74,214],{hd:30,an2:[176,196],ft2:-20,wr2:[70,212]}),300,'Abajo'),F(P([156,256],-136,[74,214],{hd:30,an2:[176,196],ft2:-20,wr2:[70,212]}),900,'Sube con una pierna'),F(P([178,206],-180,[70,214],{hd:25,an2:[214,150],ft2:-60,wr2:[66,212]}),500,'Aprieta 1 s'),F(P([178,206],-180,[70,214],{hd:25,an2:[214,150],ft2:-60,wr2:[66,212]}),1100,'Baja controlado')]};}
{const P=(an,ft)=>S({hip:[180,190],tor:180,an,ft,an2:[an[0]-2,an[1]-2],kd:1,wr:[96,214],ed:-1,hd:8});
 A.legCurl={view:'side',eq:'legCurl',hl:['hams'],trail:J=>J.an,frames:[F(P([282,192],80),300,'Piernas estiradas'),F(P([282,192],80),700,'Sube rápido'),F(P([236,112],-30),300,'Arriba'),F(P([236,112],-30),1500,'Baja en 2–3 s')]};}
{const K=[170,262],P=(th,wr)=>{const hip=[K[0]+52*Math.sin(th*D),K[1]-52*Math.cos(th*D)];return S({hip,tor:-90+th,an:[120,262],ft:120,wr,ed:1})};
 A.nordic={view:'side',eq:'nordic',hl:['hams'],trail:J=>J.sh,frames:[F(P(0,[192,160]),400,'Arriba: cuerpo recto'),F(P(0,[192,160]),900,'Déjate caer lento'),F(P(35,[262,180]),900,'Frena con los isquios'),F(P(65,[300,236]),300,'Apoya las manos'),F(P(72,[304,268]),250,'Apoya las manos'),F(P(72,[304,268]),900,'Empuja y vuelve')]};}
{const b={hip:[150,205],tor:-150,an:[225,142],an2:[190,180],ft2:-150,wr:[128,214],hd:8};
 A.pressCalf={view:'side',eq:'pressCalf',hl:['calf'],trail:J=>J.to,frames:[F(S({...b,ft:-150}),400,'Talón hacia ti: estira'),F(S({...b,ft:-150}),700,'Empuja con la punta'),F(S({...b,ft:-95}),350,'Aprieta'),F(S({...b,ft:-95}),900,'Vuelve lento')]};}
{const P=(an,ft,hipY)=>S({hip:[an[0]-3,hipY],tor:-88,an,ft,an2:[an[0]-28,hipY+70],ft2:40,wr:[an[0]+4,hipY-4],wr2:[258,hipY-34],ed2:-1});
 const d=P([200,247],-25,150),u=P([202,225],35,128);
 A.calfStep={view:'side',eq:'calfStep',hl:['calf'],trail:J=>J.he,frames:[F(d,400,'Talón abajo: estira'),F(d,800,'Sube a puntillas'),F(u,300,'Arriba'),F(u,1000,'Baja lento')]};}
{const P=ft=>S({hip:[138,184],tor:-92,an:[188,272],ft,wr:[142,184]});
 A.tibWall={view:'side',eq:'wall',hl:['tib'],trail:J=>J.to,frames:[F(P(0),300,'Puntas abajo'),F(P(0),600,'Sube las puntas'),F(P(-30),300,'Arriba'),F(P(-30),800,'Baja lento')]};}
A.heelWalk={view:'side',eq:'scroll',v:.083,hl:['tib'],frames:[
 F(S({hip:[200,180],tor:-88,an:[226,272],an2:[176,272],ft:-30,ft2:-30,wr:[184,168],wr2:[218,164]}),300,'Camina sobre talones'),
 F(S({hip:[200,174],tor:-88,an:[200,272],an2:[204,252],ft:-30,ft2:-30,wr:[200,170],wr2:[204,170]}),300,'Puntas siempre arriba'),
 F(S({hip:[200,180],tor:-88,an2:[226,272],an:[176,272],ft:-30,ft2:-30,wr2:[184,168],wr:[218,164]}),300,'Camina sobre talones'),
 F(S({hip:[200,174],tor:-88,an2:[200,272],an:[204,252],ft:-30,ft2:-30,wr2:[200,170],wr:[204,170]}),300,'Puntas siempre arriba')]};
// ---- DAY C ----
{const P=wr=>S({hip:[180,214],tor:-100,an:[236,272],wr,ed:1});
 A.pulldown={view:'side',eq:'pulldown',hl:['lats'],trail:J=>J.wr,frames:[F(P([176,82]),300,'Brazos estirados'),F(P([176,82]),800,'Tira con los codos'),F(P([196,140]),300,'Barra al pecho'),F(P([196,140]),1200,'Sube controlado')]};}
{const P=(sh)=>{const hip=[sh[0]+6.1,sh[1]+69.7];return S({hip,tor:-95,an:[hip[0]-46,hip[1]+52],ft:150,wr:[224,40],ed:1,hd:-8})};
 A.assistPull={view:'side',eq:'assist',hl:['lats'],trail:J=>J.sh,frames:[F(P([205,106]),300,'Abajo: brazos estirados'),F(P([205,106]),900,'Sube: pecho a la barra'),F(P([198,56]),300,'Barbilla sobre la barra'),F(P([198,56]),1300,'Baja controlado')]};}
{const P=wr=>S({hip:[150,214],tor:-88,an:[206,272],wr,ed:1});
 A.chestPress={view:'side',eq:'chestPress',hl:['chest','tri'],trail:J=>J.wr,frames:[F(P([176,150]),300,'Manos al pecho'),F(P([176,150]),800,'Empuja'),F(P([218,150]),250,'Brazos extendidos'),F(P([218,150]),1200,'Vuelve controlado')]};}
{const an=[100,266],P=a=>{const sh=add(an,dir(a),172),hip=add(an,dir(a),102);return S({hip,tor:a,an,ft:80,wr:[264,272],ed:1})};
 A.pushup={view:'side',eq:'pushup',hl:['chest','tri'],trail:J=>J.sh,frames:[F(P(-20.3),300,'Arriba: cuerpo en línea'),F(P(-20.3),900,'Baja el pecho'),F(P(-8.5),200,'Abajo'),F(P(-8.5),800,'Empuja')]};}
{const P=wr=>S({hip:[150,214],tor:-86,an:[206,272],wr,ed:1});
 A.rowMachine={view:'side',eq:'rowMachine',hl:['lats'],trail:J=>J.wr,frames:[F(P([218,170]),300,'Brazos estirados'),F(P([218,170]),800,'Tira con los codos'),F(P([162,178]),300,'Junta escápulas'),F(P([162,178]),1100,'Vuelve controlado')]};}
{const P=wr=>S({hip:[160,200],tor:-35,an:[110,272],wr,ed:1});
 A.inclineRow={view:'side',eq:'inclineRow',hl:['lats'],trail:J=>J.wr,frames:[F(P([217,226]),300,'Brazos colgando'),F(P([217,226]),800,'Lleva los codos atrás'),F(P([200,200]),300,'Aprieta'),F(P([200,200]),1100,'Baja controlado')]};}
{const P=(wr,ua)=>S({hip:[160,214],tor:-90,an:[216,272],wr,ua,ed:1});
 A.shoulderMachine={view:'side',eq:'shoulderMachine',hl:['delt','tri'],trail:J=>J.wr,frames:[F(P([176,124],.6),300,'Manos a la altura de los hombros'),F(P([176,124],.6),800,'Empuja arriba'),F(P([170,78],1),250,'Arriba'),F(P([170,78],1),1100,'Baja controlado')]};
 A.dbPress={view:'side',eq:'dbBench',hl:['delt','tri'],trail:J=>J.wr,frames:[F(P([176,124],.6),300,'Mancuernas a los hombros'),F(P([176,124],.6),800,'Empuja arriba'),F(P([170,78],1),250,'Arriba'),F(P([170,78],1),1100,'Baja controlado')]};}
{const P=wr=>S({hip:[190,180],tor:-88,an:[196,272],an2:[184,272],wr,ed:1});
 A.pallof={view:'side',eq:'pallof',hl:['abs'],trail:J=>J.wr,frames:[F(P([212,128]),300,'Manos al pecho'),F(P([212,128]),700,'Extiende sin girar'),F(P([256,116]),900,'Aguanta 2 s'),F(P([256,116]),800,'Vuelve')]};}
{const base={hip:[200,256],tor:180,an:[250,206],an2:[246,204],ft:-90,ft2:-90,wr:[130,190],wr2:[126,188],hd:0};
 const f1={...base,wr:[66,250],an2:[300,244],ft2:-60},f3={...base,wr2:[62,248],an:[300,244],ft:-60};
 A.deadBug={view:'side',eq:'mat',hl:['abs'],frames:[F(S(base),300,'Posición inicial'),F(S(base),900,'Extiende brazo y pierna contraria'),F(S(f1),300,'Lumbar pegada al suelo'),F(S(f1),900,'Vuelve'),F(S(base),300,'Cambia de lado'),F(S(base),900,'Extiende el otro lado'),F(S(f3),300,'Lumbar pegada al suelo'),F(S(f3),900,'Vuelve')]};}
{const up=S({hip:[196,216],tor:-92,an:[150,270],ft:170,wr:[206,126],ed:-1}),dn=S({hip:[186,220],tor:-25,an:[150,270],ft:170,wr:[262,198],ed:-1,hd:45});
 A.cableCrunch={view:'side',eq:'cableCrunch',hl:['abs'],trail:J=>J.sh,frames:[F(up,300,'Arriba'),F(up,800,'Enrolla la columna'),F(dn,300,'Aprieta el abdomen'),F(dn,1000,'Sube controlado')]};}
{const base={hip:[150,206],tor:0,an:[100,266],an2:[96,266],ft:170,ft2:170,wr:[222,272],wr2:[218,272]};
 const f1={...base,wr:[284,196],an2:[52,198],ft2:100},f3={...base,wr2:[280,196],an:[52,198],ft:100};
 A.birdDog={view:'side',eq:'mat',hl:['abs','glute'],frames:[F(S(base),300,'A cuatro patas'),F(S(base),900,'Brazo y pierna contraria'),F(S(f1),500,'Aguanta: cadera quieta'),F(S(f1),900,'Vuelve'),F(S(base),300,'Cambia de lado'),F(S(base),900,'El otro lado'),F(S(f3),500,'Aguanta: cadera quieta'),F(S(f3),900,'Vuelve')]};}

A.run={view:'side',eq:'none',hl:[],frames:[
 F(S({hip:[200,172],tor:-80,an:[216,268],ft:0,an2:[166,236],ft2:40,wr:[184,150],wr2:[224,128]}),170,''),
 F(S({hip:[200,164],tor:-82,an:[198,256],ft:30,an2:[220,224],ft2:30,wr:[198,150],wr2:[206,148]}),170,''),
 F(S({hip:[200,172],tor:-80,an2:[216,268],ft2:0,an:[166,236],ft:40,wr2:[184,150],wr:[224,128]}),170,''),
 F(S({hip:[200,164],tor:-82,an2:[198,256],ft2:30,an:[220,224],ft:30,wr2:[198,150],wr:[206,148]}),170,'')]};
A.win={view:'side',eq:'none',hl:[],frames:[
 F(S({hip:[200,175],tor:-90,an:[206,272],an2:[192,272],wr:[234,52],wr2:[176,50],hd:-10}),500,''),
 F(S({hip:[200,169],tor:-90,an:[206,268],ft:20,an2:[192,268],ft2:20,wr:[236,44],wr2:[174,42],hd:-14}),500,'')]};
for(const k in A){const e=A[k];e.id=k;e.T=e.frames.reduce((s,f)=>s+f.d,0);for(const f of e.frames)for(const q in f.p)if(f.p[q]===undefined)delete f.p[q]}

function at(e,t){
  t=((t%e.T)+e.T)%e.T;const Fr=e.frames,n=Fr.length;let i=0;while(t>Fr[i].d&&i<n-1){t-=Fr[i].d;i++}
  const P=k=>Fr[((k%n)+n)%n].p,a=P(i),b=P(i+1);
  if(same(a,b))return [a,Fr[i].ph];
  const f=.5-.5*Math.cos(Math.PI*Math.min(1,t/Fr[i].d));
  const p0=same(P(i-1),a)?a:P(i-1),p3=same(P(i+2),b)?b:P(i+2);
  return [cr(p0,a,b,p3,f),Fr[i].ph];
}
const solve=(e,p)=>e.view==='front'?solveFront(p):solveSide(p);
function trailOf(e){
  if(!e.trail)return '';
  const Fr=e.frames,from=e.trailFrom||0,end=e.trailTo??Fr.length;let T0=0,T=0;for(let i=0;i<end;i++){if(i<from)T0+=Fr[i].d;else T+=Fr[i].d}
  const pts=[];for(let k=0;k<=90;k++){const [p]=at(e,T0+T*k/90),q=e.trail(solve(e,p));pts.push(f1(q[0])+','+f1(q[1]))}
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="#2459d6" stroke-width="2.2" stroke-dasharray="5 5" stroke-linecap="round" opacity=".55"/>`;
}
function frame(e,t){
  if(e.tr===undefined)e.tr=trailOf(e);
  const [p,ph]=at(e,t),J=solve(e,p),[b,fr]=(EQ[e.eq]||EQ.none)(J,t,e);
  return [b+e.tr+(e.view==='front'?frontAthlete(J,e.hl):sideAthlete(J,e.hl))+fr,ph];
}
const DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="mg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ff8a73"/><stop offset=".55" stop-color="#e03a2c"/><stop offset="1" stop-color="#a81f18"/></radialGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b7480"/><stop offset=".45" stop-color="#c9d0d8"/><stop offset="1" stop-color="#5a626d"/></linearGradient>
<linearGradient id="steelv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d0d8"/><stop offset="1" stop-color="#5a626d"/></linearGradient>
<linearGradient id="pad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f5a"/><stop offset="1" stop-color="#15171c"/></linearGradient>
<radialGradient id="plate" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#4b505a"/><stop offset="1" stop-color="#111317"/></radialGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b27c"/><stop offset="1" stop-color="#a87b45"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c0ca"/><stop offset="1" stop-color="#9aa3ae"/></linearGradient>
<linearGradient id="topG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8bd0"/><stop offset=".5" stop-color="#2f6db3"/><stop offset="1" stop-color="#1d4c82"/></linearGradient>
<linearGradient id="shoG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4d5c"/><stop offset="1" stop-color="#15161b"/></linearGradient>
<linearGradient id="skinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8b48f"/><stop offset="1" stop-color="#a8714f"/></linearGradient>
</defs></svg>`;
function athleteAt(e,t){const [p]=at(e,t),J=solve(e,p);return sideAthlete(J,e.hl)}
window.ANIM={A,frame,DEFS,athleteAt};
})();
