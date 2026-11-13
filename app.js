import { createMotionScene } from './motion-engine.js';
(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); };
  menuButton.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const copy = document.querySelector('.copy-email');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('haoguangmai@gmail.com'); copy.textContent = 'Email copied ✓'; document.querySelector('#copy-status').textContent = 'Email address copied'; }
    catch { copy.textContent = 'haoguangmai@gmail.com'; document.querySelector('#copy-status').textContent = 'Copy this address: haoguangmai@gmail.com'; }
  });


  const hero=document.querySelector('.hero');
  const scene=createMotionScene(document.querySelector('#hero-art'),{mode:'silk',strength:2.4,interactionTarget:hero});
  const motion=document.querySelector('.motion-toggle');
  function updateMotion(){
    motion.setAttribute('aria-pressed',String(scene.paused));
    motion.setAttribute('aria-label',scene.paused?'Resume motion':'Pause motion');
    motion.querySelector('.motion-label').textContent=scene.paused?'Resume motion':'Pause motion';
    motion.querySelector('.pause-icon').textContent=scene.paused?'▷':'Ⅱ';
    document.querySelectorAll('.publication video').forEach(v=>scene.paused?v.pause():v.play().catch(()=>{}));
  }
  motion.addEventListener('click',()=>{scene.setPaused(!scene.paused);updateMotion();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{scene.setPaused(e.matches);updateMotion();});
  updateMotion();
  const filters=[...document.querySelectorAll('[data-filter]')];
  const initiatives=[...document.querySelectorAll('.initiative')];
  filters.forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.filter;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    initiatives.forEach(card=>card.hidden=value!=='all'&&!card.dataset.category.split(' ').includes(value));
    const shown=initiatives.filter(c=>!c.hidden),reserved=shown.filter(c=>c.classList.contains('initiative-placeholder')).length;
    document.querySelector('.archive-count').textContent=`${shown.length-reserved} initiative${shown.length-reserved===1?'':'s'} · ${reserved} reserved space${reserved===1?'':'s'}`;
  }));
})();
