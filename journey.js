(() => {
 const svg=document.getElementById('journey-scene');if(!svg)return;
 const route=document.getElementById('flight-route'),trail=document.getElementById('flight-trail'),plane=document.getElementById('journey-plane');
 const slider=document.getElementById('journey-progress'),toggle=document.getElementById('journey-toggle'),status=document.getElementById('journey-status');
 const cityTitle=document.getElementById('city-note-title'),cityCopy=document.getElementById('city-note-copy');
 const dialog=document.getElementById('journey-dialog'),openers=[...document.querySelectorAll('[data-journey-open]')],close=document.getElementById('journey-close');
 const small=matchMedia('(max-width:600px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let progress=0,playing=false,frame=0,lastTime=0,length=1,selectedCity='',activeOpener=null;
 const cities={shanghai:{name:'Shanghai / 上海',copy:'The city where I grew up. The beginning of this story.'},london:{name:'London / 伦敦',copy:'My current chapter: People Analytics and Human-Centric Management at UCL.'}};
 function selectCity(city){if(city===selectedCity)return;selectedCity=city;cityTitle.textContent=cities[city].name;cityCopy.textContent=cities[city].copy;document.querySelectorAll('[data-city]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===city)));svg.dataset.activeCity=city;}
 function draw(){
  const distance=progress*length,p=route.getPointAtLength(distance),a=route.getPointAtLength(Math.max(0,distance-2)),b=route.getPointAtLength(Math.min(length,distance+2));
  const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  plane.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle}) scale(${small.matches?1.12:1})`);
  trail.style.strokeDasharray=`${distance} ${length+1}`;
  slider.value=String(progress*100);slider.setAttribute('aria-valuetext',`${Math.round(progress*100)} percent, Shanghai to London`);
  dialog.dataset.arrived=String(progress>=1);
  selectCity(progress<.5?'shanghai':'london');
 }
 function buttonText(){toggle.textContent=reduced.matches?(progress>=.999?'Show Shanghai':'Show London'):playing?'Pause':progress>=.999?'Replay ↻':progress<=.001?'Play journey →':'Continue →';toggle.setAttribute('aria-label',toggle.textContent==='Pause'?'Pause journey':toggle.textContent==='Replay ↻'?'Replay journey':toggle.textContent);}
 function pause(){playing=false;cancelAnimationFrame(frame);lastTime=0;buttonText();}
 function step(time){if(!playing||!dialog.open)return;if(!lastTime)lastTime=time;progress=Math.min(1,progress+Math.min(time-lastTime,80)/5200);lastTime=time;draw();if(progress>=1){pause();status.textContent='Hello, London. A new chapter.';}else{frame=requestAnimationFrame(step);}}
 function play(){if(!dialog.open)return;if(reduced.matches){progress=progress>=.999?0:1;draw();status.textContent=progress?'Hello, London. A new chapter.':'Shanghai, where it all began.';buttonText();return;}if(progress>=.999)progress=0;playing=true;lastTime=0;status.textContent='From Shanghai, on the way to London.';buttonText();frame=requestAnimationFrame(step);}
 function layout(){
  if(!dialog.open)return;
  const mobile=small.matches;
  svg.setAttribute('viewBox',mobile?'0 0 580 660':'0 0 1160 420');
  document.getElementById('shanghai-scene').setAttribute('transform',mobile?'translate(25 25) scale(.87)':'translate(55 125)');
  document.getElementById('london-scene').setAttribute('transform',mobile?'translate(152 380) scale(.87)':'translate(685 125)');
  document.getElementById('journey-sun').setAttribute('cx',mobile?'472':'582');document.getElementById('journey-sun').setAttribute('cy',mobile?'255':'144');
  const d=mobile?'M180 40C500 30 550 245 454 350':'M235 111C433 9 742 9 982 111';
  route.setAttribute('d',d);trail.setAttribute('d',d);length=route.getTotalLength();draw();
 }
 toggle.addEventListener('click',()=>{if(playing){pause();status.textContent='Journey paused. Drag the route to explore.';}else play();});
 slider.addEventListener('input',()=>{pause();progress=Number(slider.value)/100;draw();status.textContent=progress>=1?'Hello, London. A new chapter.':progress<=0?'Shanghai, where it all began.':'A moment along the journey.';buttonText();});
 document.querySelectorAll('[data-city]').forEach(b=>b.addEventListener('click',()=>{pause();progress=b.dataset.city==='shanghai'?0:1;draw();status.textContent=progress?'Hello, London. A new chapter.':'Shanghai, where it all began.';buttonText();}));
 openers.forEach(opener=>opener.addEventListener('click',event=>{
  // Preserve the normal About link if dialogs are unavailable or a new tab was requested.
  if(typeof dialog.showModal!=='function'||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();if(dialog.open)return;
  activeOpener=opener;pause();progress=reduced.matches?1:0;
  dialog.showModal();document.body.classList.add('journey-dialog-open');dialog.scrollTop=0;
  layout();buttonText();close.focus({preventScroll:true});
  if(!reduced.matches)play();else status.textContent='Shanghai to London. A new chapter.';
 }));
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{pause();document.body.classList.remove('journey-dialog-open');if(activeOpener?.isConnected)activeOpener.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 small.addEventListener('change',layout);reduced.addEventListener('change',()=>{pause();if(dialog.open&&reduced.matches){progress=1;draw();status.textContent='Hello, London. A new chapter.';}buttonText();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){pause();status.textContent='Journey paused.';}});
 buttonText();
 const filterButtons=document.querySelectorAll('[data-timeline-filter]'),cards=[...document.querySelectorAll('.timeline-card')],count=document.getElementById('timeline-count');
 function filter(kind){let shown=0;for(const card of cards){const visible=kind==='all'||card.dataset.kind===kind;card.hidden=!visible;if(visible){card.classList.toggle('timeline-left',shown%2===0);card.classList.toggle('timeline-right',shown%2===1);shown++;}}for(const b of filterButtons)b.setAttribute('aria-pressed',String(b.dataset.timelineFilter===kind));count.textContent=`${shown} ${shown===1?'entry':'entries'}`;}
 filterButtons.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.timelineFilter)));filter('all');
})();
