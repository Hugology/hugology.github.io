import { mobiusPoint } from './mobius-geometry.js';
// Original parametric surfaces with perspective projection, smooth pointer easing,
// and CPU shading. Canvas keeps every study interactive without requiring WebGL.
export function createMotionScene(host, { mode = 'silk', strength = 2.4, interactionTarget = host } = {}) {
  const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d',{alpha:true});
  canvas.setAttribute('aria-hidden','true'); host.appendChild(canvas);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches, visible=true, frame=0, previous=0, time=0;
  let tx=0,ty=0,px=0,py=0,w=1,h=1,currentMode=mode;
  const TAU=Math.PI*2, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  let sx,cx,sy,cy,sz,cz;
  function rotate(p){
    const x1=p[0]*cz-p[1]*sz,y1=p[0]*sz+p[1]*cz;
    const x2=x1*cy+p[2]*sy,z2=-x1*sy+p[2]*cy;
    return [x2,y1*cx-z2*sx,y1*sx+z2*cx];
  }
  function project(p){
    const s=currentMode==='current'?.74:currentMode==='silk'?1.2:1;
    const q=rotate(p.map(x=>x*s));q[0]+=px*.35*strength;q[1]-=py*.22*strength;
    const z=(w<500?8.8:7.4)-q[2],f=h/(2*Math.tan(35*Math.PI/360));
    return [w*.5+q[0]*f/z,h*.5-q[1]*f/z,q[2]];
  }
  const norm=p=>{const n=Math.hypot(...p)||1;return p.map(x=>x/n);};
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const light=norm([-.4,.9,1.5]);
  const steps=240,bands=10,points=[],faces=[];
  const stops=[[185,211,236],[206,198,232],[230,205,223],[185,211,236]];
  function spectrum(u){const n=((u%1)+1)%1*3,k=Math.floor(n),f=n-k;return stops[k].map((v,c)=>v+(stops[k+1][c]-v)*f);}
  function rgba(c,a=1){return `rgba(${c.map(x=>Math.round(clamp(x,0,255))).join(',')},${a})`;}
  for(let i=0;i<=steps;i++)for(let j=0;j<=bands;j++)points.push(mobiusPoint(i/steps*TAU,j/bands*2-1));
  for(let i=0;i<steps;i++)for(let j=0;j<bands;j++){
    const t=(i+.5)/steps*TAU,v=(j+.5)/bands*2-1;
    const a=mobiusPoint(t+.001,v),b=mobiusPoint(t-.001,v),c=mobiusPoint(t,v+.001),d=mobiusPoint(t,v-.001);
    const u=a.map((x,k)=>x-b[k]),v1=c.map((x,k)=>x-d[k]);
    const n=norm([u[1]*v1[2]-u[2]*v1[1],u[2]*v1[0]-u[0]*v1[2],u[0]*v1[1]-u[1]*v1[0]]);
    const ix=i*(bands+1)+j;
    faces.push({indices:[ix,ix+bands+1,ix+bands+2,ix+1],normal:n,u:i/steps,v});
  }
  function satin(){
    const projected=points.map(project);
    const ordered=faces.map(f=>({f,z:f.indices.reduce((sum,i)=>sum+projected[i][2],0)/4})).sort((a,b)=>a.z-b.z);
    // Broad diffuse lighting only: no specular lobes, emission, light rails or flares.
    for(const {f} of ordered){
      let n=rotate(f.normal);if(n[2]<0)n=n.map(x=>-x);
      const diffuse=Math.max(0,dot(n,light));
      const pigment=spectrum(f.u+.07);
      const color=pigment.map(x=>x*(.92+diffuse*.08));
      ctx.fillStyle=rgba(color);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.55;
      ctx.beginPath();f.indices.forEach((i,k)=>k?ctx.lineTo(projected[i][0],projected[i][1]):ctx.moveTo(projected[i][0],projected[i][1]));ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
  function linePoint(u,b){
    if(currentMode==='contour'){
      const t=u*TAU,s=b*.425,twist=2*t+.25*Math.sin(time*.16),r=1.35+s*Math.cos(twist);
      return [r*Math.cos(t),r*Math.sin(t)*.92,s*Math.sin(twist)+.37*Math.sin(2*t)];
    }
    const x=(u-.5)*2,envelope=.55+.45*Math.cos(x*2.2),influence=Math.exp(-Math.pow((x-px*.7)*1.6,2));
    return [x*2.65,.63*Math.sin(x*3.1+time*.22)+b*.48*envelope+py*.40*influence,
      .48*Math.cos(x*2.7+b*.5)+b*.55*Math.sin(x*2.8+time*.13)+.12*Math.sin(x*6+b+time*.18)];
  }
  function lines(){
    const bands=90,steps=260;
    ctx.lineWidth=.68;ctx.lineCap='round';
    for(let j=0;j<bands;j++){
      const b=j/(bands-1)*2-1;
      ctx.strokeStyle=currentMode==='contour'?`rgba(81,115,93,${.28+(.5-Math.abs(b)*.5)*.16})`:`rgba(${118-j*.35},${98+j*.5},169,.34)`;
      ctx.beginPath();for(let i=0;i<=steps;i++){const p=project(linePoint(i/steps,b));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();
    }
  }
  function render(){
    const rx=(currentMode==='silk'?.18:-.13)+py*.40*strength,ry=-.18+px*.57*strength,rz=-.14+px*.13*strength;
    sx=Math.sin(rx);cx=Math.cos(rx);sy=Math.sin(ry);cy=Math.cos(ry);sz=Math.sin(rz);cz=Math.cos(rz);
    ctx.clearRect(0,0,w,h);if(currentMode==='silk')satin();else lines();
  }
  function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0);render();}
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;const dt=previous?Math.min((now-previous)/1000,.05):.016;previous=now;time+=dt;const ease=1-Math.exp(-dt*7.5);const vx=(tx-px)*ease,vy=(ty-py)*ease;px+=vx;py+=vy;render();frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!paused&&visible&&!document.hidden){previous=0;frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function move(e){if(paused)return;const r=interactionTarget.getBoundingClientRect();tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1);ty=clamp((e.clientY-r.top)/r.height*2-1,-1,1);}
  interactionTarget.addEventListener('pointermove',move,{passive:true});interactionTarget.addEventListener('pointerdown',move,{passive:true});interactionTarget.addEventListener('pointerleave',()=>{tx=0;ty=0;});
  new ResizeObserver(resize).observe(host);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0}).observe(host);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  const api={setMode(value){currentMode=['silk','contour','current'].includes(value)?value:'silk';host.dataset.mode=currentMode;render();},setStrength(value){strength=clamp(Number(value),.5,3);render();},setPaused(value){paused=!!value;if(paused)stop();else start();},get paused(){return paused;}};
  reduced.addEventListener('change',e=>api.setPaused(e.matches));host.dataset.renderer='canvas';api.setMode(mode);resize();start();return api;
}
