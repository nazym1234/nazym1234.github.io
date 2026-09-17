'use strict';
const stage=document.querySelector('#stage'),statusText=document.querySelector('#game-status');
let frame;
function fit(){if(!frame)return;const scale=Math.min(stage.clientWidth/1280,stage.clientHeight/720);frame.style.transform='scale('+scale+')';frame.style.left=(stage.clientWidth-1280*scale)/2+'px';frame.style.top=(stage.clientHeight-720*scale)/2+'px';}
function start(){stage.replaceChildren();frame=document.createElement('iframe');frame.title='Jeu Asteroids';frame.src='game.html';frame.allow='autoplay; fullscreen';stage.append(frame);statusText.textContent='Chargement du jeu…';fit();}
document.querySelector('#start').addEventListener('click',start);
document.querySelector('#restart').addEventListener('click',start);
document.querySelector('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{statusText.textContent='Le plein écran n’est pas disponible dans ce navigateur.';}});
new ResizeObserver(fit).observe(stage);
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;if(e.data==='game-ready')statusText.textContent='Choisissez un mode avec 1, 2 ou 3. Cliquez dans le jeu si nécessaire.';if(e.data==='game-error')statusText.textContent='Le jeu n’a pas pu démarrer. Essayez de recharger la page ou un navigateur compatible WebGL.';});
