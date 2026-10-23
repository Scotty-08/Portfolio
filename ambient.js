// Small interactive extras. Motion can be paused and respects the OS setting.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  try { paused = paused || localStorage.getItem('portfolio-motion') === 'off'; } catch (error) {}
  const canvas = document.createElement('canvas'); canvas.className = 'ambient-canvas'; canvas.setAttribute('aria-hidden','true'); document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const controls = document.createElement('div'); controls.className = 'ambient-controls';
  controls.innerHTML = '<span>A little curiosity goes a long way.</span><button type="button" class="motion-toggle"></button><button type="button" class="spark-button">Send a spark ✦</button><button type="button" class="play-button">Play: signal hunt</button>';
  document.body.append(controls);
  const motionButton = controls.querySelector('.motion-toggle');
  let width, height, dots = [], sparks = [], frame = 0, last = 0;
  const pointer = { x:-1000, y:-1000 };
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    if (!ctx) return;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    dots = Array.from({length: Math.min(48, Math.floor(width / 28))}, () => ({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12}));
    draw(0);
  }
  function draw(delta) {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    for (let i=0; i<dots.length; i++) {
      const dot=dots[i];
      dot.x=(dot.x + dot.vx*delta + width)%width; dot.y=(dot.y + dot.vy*delta + height)%height;
      const nearby=Math.hypot(pointer.x-dot.x,pointer.y-dot.y)<150;
      ctx.fillStyle=nearby?'rgba(51,93,232,.4)':'rgba(51,93,232,.16)';
      ctx.beginPath(); ctx.arc(dot.x,dot.y,nearby?2.5:1.8,0,Math.PI*2);ctx.fill();
      for(let j=i+1;j<dots.length;j++) {
        const other=dots[j], distance=Math.hypot(dot.x-other.x,dot.y-other.y);
        if(distance<140) {ctx.strokeStyle=`rgba(51,93,232,${(1-distance/140)*.12})`;ctx.beginPath();ctx.moveTo(dot.x,dot.y);ctx.lineTo(other.x,other.y);ctx.stroke();}
      }
      if(nearby) {ctx.strokeStyle='rgba(51,93,232,.12)';ctx.beginPath();ctx.moveTo(dot.x,dot.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();}
    }
    sparks=sparks.filter(spark=>spark.life>0);
    for(const spark of sparks) {spark.life-=delta*.012; spark.radius+=delta*.8;ctx.strokeStyle=`rgba(99,102,241,${Math.max(0,spark.life)*.35})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(spark.x,spark.y,spark.radius,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;}
  }
  function tick(time) {
    frame=0;
    if(paused || document.hidden) return;
    const delta=last?Math.min((time-last)/16.67,2):1; last=time;
    draw(delta); frame=requestAnimationFrame(tick);
  }
  function syncMotion() {
    motionButton.textContent=paused?'Background motion: off':'Background motion: on';
    motionButton.setAttribute('aria-pressed',String(!paused));
    controls.querySelector('.spark-button').disabled=paused;
    cancelAnimationFrame(frame);frame=0;last=0;
    if(!paused&&!document.hidden) frame=requestAnimationFrame(tick);
  }
  motionButton.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('portfolio-motion',paused?'off':'on');}catch(error){}syncMotion();});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){paused=true;syncMotion();}});
  document.addEventListener('visibilitychange',syncMotion);
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',event=>{pointer.x=event.clientX;pointer.y=event.clientY;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.x=-1000;pointer.y=-1000;});
  controls.querySelector('.spark-button').addEventListener('click',()=>{if(!paused)sparks.push({x:width*.5,y:height*.55,radius:8,life:1});});
  document.addEventListener('click',event=>{if(!paused&&!event.target.closest('a,button,input,summary,dialog'))sparks.push({x:event.clientX,y:event.clientY,radius:4,life:1});});
  resize();syncMotion();

  // Optional keyboard-friendly mini-game, kept away from the project content.
  const game=document.createElement('dialog');game.id='signal-game';game.setAttribute('aria-labelledby','game-title');
  game.innerHTML='<div class="game-heading"><h2 id="game-title">Signal hunt.</h2><button type="button" class="game-close" aria-label="Close signal hunt">×</button></div><p class="game-instruction">Connect the signals in order, 1 through 8. A tiny break from the project tour.</p><div class="signal-grid"></div><p class="game-status" role="status"></p><button type="button" class="game-reset">Shuffle & restart</button>';
  document.body.append(game);
  let next=1;
  function resetGame() {
    next=1;const grid=game.querySelector('.signal-grid');grid.replaceChildren();
    const numbers=Array.from({length:8},(_,i)=>i+1);
    for(let i=numbers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[numbers[i],numbers[j]]=[numbers[j],numbers[i]];}
    game.querySelector('.game-status').textContent='Find signal 1.';
    numbers.forEach(number=>{const button=document.createElement('button');button.type='button';button.className='signal-node';button.textContent=number;button.setAttribute('aria-label',`Signal ${number}`);button.addEventListener('click',()=>{
      const status=game.querySelector('.game-status');
      if(number!==next){status.textContent=`Almost — find signal ${next} first.`;return;}
      button.disabled=true;next++;
      status.textContent=next===9?'Connection complete. All 8 signals found!':`Connected ${number}/8. Find signal ${next}.`;
      const nextButton=grid.querySelector(`button[aria-label="Signal ${next}"]`);
      if(nextButton)nextButton.focus();else game.querySelector('.game-reset').focus();
    });grid.append(button);});
  }
  controls.querySelector('.play-button').addEventListener('click',()=>{resetGame();game.showModal();});
  game.querySelector('.game-close').addEventListener('click',()=>game.close());
  game.querySelector('.game-reset').addEventListener('click',resetGame);
  game.addEventListener('click',event=>{if(event.target===game)game.close();});
})();
