import { createMotionScene } from './motion-engine.js';
const modes={
  silk:{number:'01 / MÖBIUS',name:'柔雾莫比乌斯环',descriptor:'雾蓝—浅紫—粉灰 · 柔和曲面 · 连续转向',title:'三个领域，形成持续连接。',description:'雾蓝 Academia、浅紫 Industry、粉灰 Ecosystem 沿同一个半扭转曲面连续过渡。放大的曲面融入冷白背景，随鼠标平滑转向；柔和的漫反射保留空间层次，不再出现镜面亮斑或瞬间闪光。'},
  contour:{number:'02 / CONTOUR',name:'空间等高线',descriptor:'细线曲面 · 大幅转向 · 科研气质',title:'让轻盈的线条拥有真正的纵深。',description:'线条构成可旋转的三维曲面。鼠标横向移动会明显改变朝向，纵向移动会改变俯仰；保留细线秩序和较多留白。'},
  current:{number:'03 / CURRENT',name:'开放流线',descriptor:'连续弯曲 · 延展流向 · 轻盈感',title:'让流线沿着你的动作展开。',description:'开放线束在空间中延伸，并随鼠标位置连续弯曲。整体比封闭环形更舒展，适合表达科研、产业与生态之间的连接。'}
};
let selected=new URLSearchParams(location.search).get('sample')||'silk';if(!modes[selected])selected='silk';
const scene=createMotionScene(document.querySelector('#study-art'),{mode:selected,strength:2.4,interactionTarget:document.querySelector('#study')});
const buttons=[...document.querySelectorAll('[data-sample]')];
function choose(mode,updateUrl=true){
  selected=mode;scene.setMode(mode);document.body.dataset.sample=mode;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sample===mode)));
  const data=modes[mode];for(const [id,key] of [['sample-number','number'],['sample-name','name'],['sample-descriptor','descriptor'],['sample-title','title'],['sample-description','description']])document.getElementById(id).textContent=data[key];
  if(updateUrl){const url=new URL(location.href);url.searchParams.set('sample',mode);history.replaceState(null,'',url);}
}
buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.sample)));
const range=document.querySelector('#strength');range.addEventListener('input',()=>{scene.setStrength(range.value);document.querySelector('#strength-value').value=Number(range.value).toFixed(1)+'×';});
const pause=document.querySelector('#pause');function syncPause(){pause.setAttribute('aria-pressed',String(scene.paused));pause.textContent=scene.paused?'▷ 播放':'Ⅱ 暂停';}
pause.addEventListener('click',()=>{scene.setPaused(!scene.paused);syncPause();});
choose(selected,false);syncPause();

const surfaceCopy={porcelain:'冷白 + 银灰层次，科技感更清晰。',pearl:'白底上少量紫与冰蓝反光，保留柔和的空间感。',gallery:'纯白 + 墨黑姓名，让照片与字体成为视觉重点。'};
const surfaceButtons=[...document.querySelectorAll('[data-surface-option]')];
function chooseSurface(value,updateUrl=true){if(!surfaceCopy[value])value='porcelain';document.body.dataset.surface=value;surfaceButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.surfaceOption===value)));document.querySelector('#surface-description').textContent=surfaceCopy[value];if(updateUrl){const url=new URL(location.href);url.searchParams.set('surface',value);history.replaceState(null,'',url);}}
surfaceButtons.forEach(b=>b.addEventListener('click',()=>chooseSurface(b.dataset.surfaceOption)));
chooseSurface(new URLSearchParams(location.search).get('surface'),false);
