'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),statusEl=document.querySelector('#status'),overlay=document.querySelector('#overlay');
const startButton=document.querySelector('#start'),pauseButton=document.querySelector('#pause');
let step, running=false, paused=false, keys=[],last=0,accumulator=0,best=0;
try{best=Number(localStorage.getItem('nazym-flappy-best'))||0;}catch{}
document.querySelector('#best').textContent=best+' %';
window.flappyRender=(text,progress,state,x,y)=>{
 ctx.fillStyle='#061511';ctx.fillRect(0,0,1100,558);
 ctx.font='16px monospace';ctx.textBaseline='top';
 text.split('\n').forEach((line,row)=>{for(let col=0;col<line.length;col++){const c=line[col];if(c===' ')continue;ctx.fillStyle=c==='('||c===')'?'#ffe09a':c==='#'?'#4f7564':'#92d3ac';ctx.fillText(c,col*11,row*18);}});
 canvas.dataset.x=String(x);canvas.dataset.y=String(y);canvas.dataset.state=state;
 document.querySelector('#progress').textContent=progress+' %';
 if(progress>best){best=progress;document.querySelector('#best').textContent=best+' %';try{localStorage.setItem('nazym-flappy-best',String(best));}catch{}}
 if(state!=='playing'){
  running=false;pauseButton.disabled=true;
  document.querySelector('#overlay-title').textContent=state==='won'?'Parcours terminé !':'On retente un envol ?';
  document.querySelector('#overlay-description').textContent='Distance parcourue : '+progress+' %';
  startButton.textContent='Rejouer ↗';overlay.hidden=false;
  statusEl.textContent=state==='won'?'Bravo, vous avez traversé le parcours !':'Collision — la partie est terminée.';
 }
};
window.flappyInstall=callback=>{step=callback;startButton.disabled=false;startButton.textContent='Jouer ↗';document.querySelector('#restart').disabled=false;statusEl.textContent='Prêt à jouer.';};
function start(){if(!step)return;keys=[];step(-1);running=true;paused=false;accumulator=0;last=0;overlay.hidden=true;pauseButton.disabled=false;pauseButton.textContent='Pause';statusEl.textContent='En jeu — D pour avancer, Z ou Espace pour sauter.';canvas.focus();}
function input(code){if(!running||paused)return;keys.push(code);if(keys.length>10)keys.shift();}
function pause(){if(!running)return;paused=!paused;keys=[];accumulator=0;pauseButton.textContent=paused?'Reprendre':'Pause';statusEl.textContent=paused?'Partie en pause.':'En jeu — D pour avancer, Z ou Espace pour sauter.';if(!paused)canvas.focus();}
startButton.addEventListener('click',start);document.querySelector('#restart').addEventListener('click',start);pauseButton.addEventListener('click',pause);
document.querySelector('#jump').addEventListener('pointerdown',e=>{e.preventDefault();input(122);});document.querySelector('#advance').addEventListener('pointerdown',e=>{e.preventDefault();input(100);});
document.addEventListener('keydown',e=>{if(e.target.closest('button,a,summary')&&['Space','Enter'].includes(e.code))return;const key=e.key.toLowerCase();if(['z',' ','arrowup','d','arrowright','p'].includes(key)){e.preventDefault();if(e.repeat)return;if(key==='p')pause();else input(['d','arrowright'].includes(key)?100:122);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pause();});
document.querySelector('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('#stage').requestFullscreen();canvas.focus();}catch{statusEl.textContent='Le plein écran n’est pas disponible dans ce navigateur.';}});
function tick(now){if(!last)last=now;const dt=Math.min(now-last,100);last=now;if(running&&!paused){accumulator+=dt;while(accumulator>=1000/30&&running){step(keys.shift()||0);accumulator-=1000/30;}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
