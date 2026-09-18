const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400) errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:8000/asteroids/');
 await page.getByRole('button',{name:'Lancer le jeu'}).click();
 await page.getByRole('status').filter({hasText:'Choisissez un mode'}).waitFor({timeout:60000});
 const canvas=page.frameLocator('iframe').locator('canvas');
 const menu=await canvas.screenshot();
 await canvas.press('Digit1');
 await canvas.press('ArrowUp');
 await canvas.press('Space');
 await page.waitForTimeout(1500);
 const game=await canvas.screenshot();
 assert(!menu.equals(game),'Canvas must change after starting a game');
 assert(game.length>10000,'Game canvas must contain rendered graphics');
 assert.deepEqual(errors,[]);
 console.log('PASS: wasm and assets loaded, menu rendered, mode 1 starts, movement/fire keys accepted, animated canvas, no runtime/network errors.');
 await page.getByRole('button',{name:'Recommencer'}).click();
 await page.getByRole('status').filter({hasText:'Choisissez un mode'}).waitFor({timeout:60000});
 console.log('PASS: restart loads a new playable instance.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
