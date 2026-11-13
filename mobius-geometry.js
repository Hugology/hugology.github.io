// Half-twist around a closed, lifted figure-eight centerline.
// The seam is joined with p(0,v) = p(2π,-v), giving one continuous side.
const norm=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);};
export function mobiusPoint(t,v){
  const tangent=norm([-1.72*Math.sin(t),1.22*Math.cos(2*t),.72*Math.cos(t)]);
  const normal=norm([-tangent[1],tangent[0],0]);
  const binormal=[tangent[1]*normal[2]-tangent[2]*normal[1],tangent[2]*normal[0]-tangent[0]*normal[2],tangent[0]*normal[1]-tangent[1]*normal[0]];
  const twist=t*.5+.35,width=.20;
  const c=[1.72*Math.cos(t),.61*Math.sin(2*t),.72*Math.sin(t)];
  return c.map((x,k)=>x+v*width*(normal[k]*Math.cos(twist)+binormal[k]*Math.sin(twist)));
}
