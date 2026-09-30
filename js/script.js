(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pre=document.getElementById('preloader'), fill=document.getElementById('plFill'),
      pct=document.getElementById('plPct'), typed=document.getElementById('plNameTyped');
  if(!pre || !fill || !pct || !typed) return;
  if(reduce){ pre.style.display='none'; return; }
  document.body.style.overflow='hidden';

  var text='dev.subho', ti=0;
  var typeIv=setInterval(function(){
    ti++;
    typed.textContent=text.slice(0,ti);
    if(ti>=text.length) clearInterval(typeIv);
  }, 150);

  var p=0;
  var loadDone = (document.readyState === 'complete');
  var loadEventSeen = loadDone;
  var fallbackAt99 = null;
  var finished = false;
  var termBody = document.getElementById('plTermBody');
  var termLines = [
    {c:'loading portfolio', ok:false},
    {c:'loading page resources', ok:true},
    {c:'initializing interface', ok:true},
    {c:'preparing assets', ok:true},
    {c:'initializing scripts', ok:true},
    {c:'loading stylesheets', ok:true},
    {c:'checking page readiness', ok:true},
    {c:'preparing portfolio', ok:true},
    {c:'portfolio ready', ok:true}
  ];
  var shown = 0;

  function revealLines(target){
    if(!termBody) return;
    while(shown < target && shown < termLines.length){
      var l = termLines[shown];
      var row = document.createElement('div');
      row.className = 'pl-term-line';
      if(shown === 0){
        row.innerHTML = '<span class="prompt">➜</span>'+l.c;
      } else {
        row.innerHTML = '<span class="ok">✓</span> '+l.c;
      }
      termBody.appendChild(row);
      termBody.scrollTop = termBody.scrollHeight;
      shown++;
    }
    if(shown >= termLines.length && !document.getElementById('plTermCursorRow')){
      var cur = document.createElement('div');
      cur.className = 'pl-term-line';
      cur.id = 'plTermCursorRow';
      cur.innerHTML = '<span class="prompt">➜</span><span class="pl-term-cursor"></span>';
      termBody.appendChild(cur);
      termBody.scrollTop = termBody.scrollHeight;
    }
  }

  function finish(){
    if(finished) return;
    finished = true;
    clearInterval(iv);
    p=100;
    fill.style.width='100%';
    pct.textContent='100%';
    revealLines(termLines.length);
    setTimeout(function(){
      pre.classList.add('exit');
      setTimeout(function(){
        pre.style.display='none';
        document.body.style.overflow='';
      }, 1100);
    }, 300);
  }

  revealLines(1);
  window.addEventListener('load', function(){
    loadDone = true;
    loadEventSeen = true;
  }, {once:true});

  // The page loads normally behind the preloader from the start.
  // The visual progress follows a smooth curve; it never pauses at a
  // checkpoint unless the real window load is still pending at 99%.
  var startedAt = performance.now();
  var iv=setInterval(function(){
    if(finished) return;

    var elapsed = (performance.now() - startedAt) / 1000;

    if(loadEventSeen){
      // The real page is ready: glide from the current value to 100.
      p = Math.min(100, p + Math.max(1.8, (100 - p) * 0.16));
    } else if(p < 99){
      // Smoothly approach 99 while the page continues loading in the background.
      // The curve starts quickly, then eases naturally as it gets close to 99.
      var natural = 99 * (1 - Math.exp(-elapsed / 0.85));
      p = Math.min(99, Math.max(p, natural));
      if(natural >= 98.92) p = 99;
    } else {
      // 99% is the ONLY possible hold, and only while the real load is pending.
      if(fallbackAt99 === null) fallbackAt99 = performance.now();
      if(loadDone || (performance.now() - fallbackAt99) >= 1500){
        loadDone = true;
        loadEventSeen = true;
        p = Math.min(100, p + 2.2);
      }
    }

    fill.style.width=p+'%';
    pct.textContent=Math.floor(p)+'%';
    revealLines(Math.max(1, Math.ceil((p/100)*termLines.length)));

    if(p>=100) finish();
  }, 50);
})();

// ---------- projects coverflow scaling ----------
(function(){
  var viewport=document.querySelector('.proj-viewport');
  var track=document.getElementById('projTrack');
  if(!viewport || !track) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ track.style.animation='none'; track.style.flexWrap='wrap'; track.style.width='100%'; return; }
  function tick(){
    var cards=track.querySelectorAll('.pcard');
    var vRect=viewport.getBoundingClientRect();
    var center=vRect.left + vRect.width/2;
    cards.forEach(function(c){
      var r=c.getBoundingClientRect();
      var cc=r.left + r.width/2;
      var dist=Math.abs(cc-center);
      var scale=Math.max(0.8, 1.12 - dist/900);
      var opacity=Math.max(0.5, 1.05 - dist/700);
      c.style.transform='scale('+scale.toFixed(3)+')';
      c.style.opacity= '1';
      c.style.zIndex=Math.round(scale*100);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ---------- certifications coverflow scaling ----------
(function(){
  var viewport=document.querySelector('.cert-viewport');
  var track=document.getElementById('certTrack');
  if(!viewport || !track) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ track.style.animation='none'; }
  function tick(){
    var cards=track.querySelectorAll('.cert-card');
    var vRect=viewport.getBoundingClientRect();
    var center=vRect.left + vRect.width/2;
    cards.forEach(function(c){
      var r=c.getBoundingClientRect();
      var cc=r.left + r.width/2;
      var dist=Math.abs(cc-center);
      var scale=Math.max(0.78, 1.18 - dist/620);
      var opacity=Math.max(0.45, 1.1 - dist/500);
      c.style.transform='scale('+scale.toFixed(3)+')';
      c.style.opacity=opacity.toFixed(2);
      c.style.zIndex=Math.round(scale*100);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ---------- JSON-driven certifications ----------
(function(){
  var track=document.getElementById('certTrack');
  if(!track) return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]});}
  fetch('./data/certifications.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('certifications.json'); return r.json();})
    .then(function(items){
      if(!Array.isArray(items) || !items.length) throw new Error('empty certifications');
      var cards=items.map(function(c){
        var placeholder = c.placeholder ? ' placeholder' : '';
        var status = c.status
        ? '<span class="cert-status">' + esc(c.status) + '</span>'
        : '';

        var badge = c.logo
        ? '<div class="cert-badge"><img src="' + esc(c.logo) +
            '" alt="' + esc(c.badge || c.issuer || 'Certificate') +
            '" loading="lazy"></div>'
        : '<div class="cert-badge">' + esc(c.badge || 'CERT') + '</div>';

        return '<div class="cert-card' + placeholder + '">' +
        badge +
        '<h3>' + esc(c.name) + '</h3>' +
        '<p>' + esc(c.issuer || '') + '</p>' +
        '<span class="cert-yr">' + esc(c.year || 'VERIFY') + '</span>' +
        status +
        '</div>';
      }).join('');
      var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.innerHTML=reduce ? cards : cards+cards;
    })
    .catch(function(){
      track.innerHTML='<div class="cert-card"><div class="cert-badge">SAP</div><h3>SAP Certified — Back-End Developer — ABAP Cloud</h3><p>SAP</p><span class="cert-yr">2026</span></div>';
    });
})();

// ---------- JSON-driven roadmap ----------
(function(){
  var wrap=document.getElementById('roadmapData');
  if(!wrap) return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]});}
  var icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M7 7h10M6 12h12M8 17h8"/></svg>';
  fetch('./data/roadmap.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('roadmap.json'); return r.json();})
    .then(function(items){
      if(!Array.isArray(items) || !items.length) throw new Error('empty roadmap');
      wrap.innerHTML=items.slice(0,12).map(function(item,i){
        var side=i%2===0?'l':'r';
        var placeholder=item.placeholder ? ' placeholder' : '';
        return '<div class="rnode'+placeholder+' '+side+'"><span class="dot">'+icon+'</span><div class="box"><div class="yr">'+esc(item.year || 'YEAR')+'</div><h3>'+esc(item.title)+'</h3><p>'+esc(item.description || '')+'</p></div></div>';
      }).join('');
    })
    .catch(function(){
      wrap.innerHTML='<div class="rnode l"><span class="dot">'+icon+'</span><div class="box"><div class="yr">2026</div><h3>Finalist, Smart India Hackathon</h3><p>Reached the finalist stage with a team project.</p></div></div>';
    });
})();

// ---------- about photo carousel ----------
(function(){
  var box=document.getElementById('aphotoBox');
  if(!box) return;
  var frames=box.querySelectorAll('.aframe');
  var dots=document.querySelectorAll('#aphotoDots span');
  var prevBtn=document.getElementById('aphotoPrev'), nextBtn=document.getElementById('aphotoNext');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(frames.length<2) return;
  var i=0;

  function goTo(n){
    frames[i].classList.remove('on');
    dots[i] && dots[i].classList.remove('on');
    i=(n+frames.length)%frames.length;
    frames[i].classList.add('on');
    dots[i] && dots[i].classList.add('on');
  }

  if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(i-1); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(i+1); });

  if(reduce) return;
  setInterval(function(){ goTo(i+1); }, 4200);
})();

// ---------- achievements roadmap scroll fill ----------
(function(){
  var wrap=document.getElementById('roadmap'), fill=document.getElementById('roadmapFill');
  if(!wrap || !fill) return;
  function update(){
    var r=wrap.getBoundingClientRect();
    var vh=window.innerHeight;
    var total=r.height;
    var progressed=vh*0.75 - r.top;
    var pct=Math.max(0,Math.min(1,progressed/total));
    fill.style.height=(pct*100)+'%';
  }
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
})();

// ---------- about ribbon: visits, clock, time-on-page ----------
(function(){
  var visitsEl=document.getElementById('rbVisits');
  if(visitsEl){
    try{
      var n=parseInt(localStorage.getItem('rb-visits')||'0',10)+1;
      localStorage.setItem('rb-visits', n);
      visitsEl.textContent=n;
    }catch(e){ visitsEl.textContent='1'; }
  }
  var clockEl=document.getElementById('rbClock'), dateEl=document.getElementById('rbDate');
  function tickClock(){
    var d=new Date();
    var hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0'), ss=String(d.getSeconds()).padStart(2,'0');
    if(clockEl) clockEl.textContent=hh+':'+mm+':'+ss;
    if(dateEl) dateEl.textContent=d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+' · Local time';
  }
  tickClock();
  setInterval(tickClock, 1000);

  var timeEl=document.getElementById('rbTime');
  var start=Date.now();
  setInterval(function(){
    var s=Math.floor((Date.now()-start)/1000);
    var m=Math.floor(s/60), sec=s%60;
    timeEl.textContent = m>0 ? (m+'m '+sec+'s') : (sec+'s');
  }, 1000);
})();

// ---------- arcade ----------
(function(){
  var playBtn=document.getElementById('rbPlayBtn'), backdrop=document.getElementById('gameBackdrop'),
      picker=document.getElementById('gamePicker'), playView=document.getElementById('gamePlay'),
      cardsWrap=document.getElementById('gameCards'),
      closeFromPicker=document.getElementById('gameCloseFromPicker'), closeFromPlay=document.getElementById('gameCloseFromPlay'),
      backBtn=document.getElementById('gameBack'), titleEl=document.getElementById('gameTitle'),
      scoreEl=document.getElementById('gameScore'), hintEl=document.getElementById('gameHint'),
      canvas=document.getElementById('gameCanvas'), grid2048=document.getElementById('grid2048');
  if(!playBtn || !backdrop) return;
  var ctx=canvas.getContext('2d');
  var current=null; // active game controller

  function css(name, fallback){
    var v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  // ================= SNAKE =================
  function makeSnake(){
    var grid=15, cols=canvas.width/grid, rows=canvas.height/grid;
    var snake, dir, nextDir, food, score, running, loopId, gameOver, speed, minSpeed;
    function reset(){
      snake=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];
      dir={x:1,y:0}; nextDir=dir;
      score=0; running=false; gameOver=false;
      scoreEl.textContent='0';
      placeFood();
      draw();
      hintEl.textContent='Use Arrow keys or WASD to move. Press any key to start.';
    }
    function placeFood(){
      var ok=false;
      while(!ok){
        food={x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
        ok=!snake.some(function(s){ return s.x===food.x && s.y===food.y; });
      }
    }
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle=css('--accent','#FF4B2B');
      ctx.fillRect(food.x*grid+2, food.y*grid+2, grid-4, grid-4);
      snake.forEach(function(s,i){
        ctx.fillStyle = i===0 ? css('--ink','#111') : css('--accent2','#5B4CF0');
        ctx.fillRect(s.x*grid+1, s.y*grid+1, grid-2, grid-2);
      });
    }
    function step(){
      dir=nextDir;
      var head={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
      if(head.x<0 || head.y<0 || head.x>=cols || head.y>=rows || snake.some(function(s){return s.x===head.x && s.y===head.y;})){
        running=false; gameOver=true; clearTimeout(loopId);
        hintEl.textContent='Game over — score '+score+'. Press any key to restart.';
        return;
      }
      snake.unshift(head);
      if(head.x===food.x && head.y===food.y){
        score++; scoreEl.textContent=score; placeFood();
        if(score % 5 === 0){
          speed=Math.max(minSpeed, speed-6);
          hintEl.textContent='Speeding up a little — score '+score+'!';
          setTimeout(function(){ if(running) hintEl.textContent='Go! Arrow keys or WASD to steer.'; }, 900);
        }
      } else { snake.pop(); }
      draw();
      if(running) loopId=setTimeout(step, speed);
    }
    function start(){
      if(running) return;
      running=true; speed=180; minSpeed=70;
      hintEl.textContent='Go! Arrow keys or WASD to steer.';
      clearTimeout(loopId);
      loopId=setTimeout(step, speed);
    }
    function setDir(x,y){
      if(dir.x===-x && dir.y===-y) return;
      nextDir={x:x,y:y};
      if(!running) start();
    }
    return {
      name:'Snake',
      init:function(){ canvas.style.display='block'; grid2048.classList.remove('active'); reset(); },
      destroy:function(){ running=false; clearTimeout(loopId); },
      key:function(k){
        var isDirKey=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].indexOf(k)>-1;
        if(gameOver && isDirKey) reset();
        if(k==='arrowup'||k==='w') setDir(0,-1);
        else if(k==='arrowdown'||k==='s') setDir(0,1);
        else if(k==='arrowleft'||k==='a') setDir(-1,0);
        else if(k==='arrowright'||k==='d') setDir(1,0);
      },
      preventKeys:['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d']
    };
  }

  // ================= 2048 =================
  function make2048(){
    var size=4, board, score, over, won, cells=[];
    for(var i=0;i<size*size;i++){
      var d=document.createElement('div');
      d.className='g2-tile';
      grid2048.appendChild(d);
      cells.push(d);
    }
    function reset(){
      board=[]; for(var r=0;r<size;r++){ board.push([0,0,0,0]); }
      score=0; over=false; won=false;
      scoreEl.textContent='0';
      addTile(); addTile();
      render();
      hintEl.textContent='Arrow keys or WASD to slide the tiles.';
    }
    function addTile(){
      var empty=[];
      for(var r=0;r<size;r++) for(var c=0;c<size;c++) if(board[r][c]===0) empty.push([r,c]);
      if(!empty.length) return;
      var pick=empty[Math.floor(Math.random()*empty.length)];
      board[pick[0]][pick[1]] = Math.random()<0.9 ? 2 : 4;
    }
    function render(){
      for(var r=0;r<size;r++) for(var c=0;c<size;c++){
        var v=board[r][c], el=cells[r*size+c];
        el.textContent = v || '';
        if(v) el.setAttribute('data-v', v); else el.removeAttribute('data-v');
      }
      scoreEl.textContent=score;
    }
    function slideRow(row){
      var arr=row.filter(function(v){return v!==0;});
      var moved = arr.length !== row.filter(function(v){return v!==0;}).length;
      for(var i=0;i<arr.length-1;i++){
        if(arr[i]===arr[i+1]){
          arr[i]*=2; score+=arr[i];
          if(arr[i]===2048 && !won){ won=true; hintEl.textContent='You hit 2048! Keep going for a higher score.'; }
          arr.splice(i+1,1);
        }
      }
      while(arr.length<size) arr.push(0);
      return arr;
    }
    function rotateBoardCW(){
      var nb=[]; for(var r=0;r<size;r++){ nb.push([]); for(var c=0;c<size;c++){ nb[r][c]=board[size-1-c][r]; } }
      board=nb;
    }
    function move(dir){ // 0 up,1 right,2 down,3 left
      var before=JSON.stringify(board);
      var rotations = dir===0?3 : dir===1?2 : dir===2?1 : 0;
      for(var i=0;i<rotations;i++) rotateBoardCW();
      board = board.map(slideRow);
      for(var j=0;j<(4-rotations)%4;j++) rotateBoardCW();
      if(JSON.stringify(board)!==before){
        addTile(); render();
        if(!hasMoves()){ over=true; hintEl.textContent='Game over — score '+score+'. Press any key to restart.'; }
      }
    }
    function hasMoves(){
      for(var r=0;r<size;r++) for(var c=0;c<size;c++){
        if(board[r][c]===0) return true;
        if(c<size-1 && board[r][c]===board[r][c+1]) return true;
        if(r<size-1 && board[r][c]===board[r+1][c]) return true;
      }
      return false;
    }
    return {
      name:'2048',
      init:function(){ canvas.style.display='none'; grid2048.classList.add('active'); reset(); },
      destroy:function(){},
      key:function(k){
        if(over && ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].indexOf(k)>-1){ reset(); return; }
        if(k==='arrowup'||k==='w') move(0);
        else if(k==='arrowright'||k==='d') move(1);
        else if(k==='arrowdown'||k==='s') move(2);
        else if(k==='arrowleft'||k==='a') move(3);
      },
      preventKeys:['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d']
    };
  }

  // ================= BREAKOUT =================
  function makeBreakout(){
    var W=canvas.width, H=canvas.height;
    var paddle, ball, bricks, score, lives, level, running, over, loopId, cols=6, bw, bh;
    function baseSpeed(){ return 2.6 + (level-1)*0.35; }
    function buildBricks(){
      var rows=Math.min(4+level-1, 7);
      bricks=[]; bw=(W-16)/cols; bh=14;
      var colors=['#FF4B2B','#5B4CF0','#5B9BFF','#3ECF8E'];
      for(var r=0;r<rows;r++){ for(var c=0;c<cols;c++){
        bricks.push({x:8+c*bw, y:24+r*(bh+6), w:bw-6, h:bh, alive:true, color:colors[r%colors.length]});
      }}
    }
    function resetBall(){
      var s=baseSpeed();
      ball={x:W/2,y:H-40,r:5,dx:s,dy:-s};
      paddle.x=(W-paddle.w)/2;
    }
    function reset(){
      paddle={w:56,h:9,x:(W-56)/2,speed:6,left:false,right:false};
      level=1; score=0; lives=3; running=false; over=false;
      scoreEl.textContent='0';
      titleEl.textContent='Breakout';
      buildBricks();
      resetBall();
      draw();
      hintEl.textContent='Arrow keys or A/D to move the paddle. Press any key to start.';
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      bricks.forEach(function(b){
        if(!b.alive) return;
        ctx.fillStyle=b.color;
        ctx.fillRect(b.x,b.y,b.w,b.h);
      });
      ctx.fillStyle=css('--ink','#111');
      ctx.fillRect(paddle.x, H-14, paddle.w, paddle.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
      ctx.fillStyle=css('--accent','#FF4B2B');
      ctx.fill();
    }
    function tick(){
      if(paddle.left) paddle.x=Math.max(0, paddle.x-paddle.speed);
      if(paddle.right) paddle.x=Math.min(W-paddle.w, paddle.x+paddle.speed);
      ball.x+=ball.dx; ball.y+=ball.dy;
      if(ball.x<ball.r || ball.x>W-ball.r) ball.dx*=-1;
      if(ball.y<ball.r) ball.dy*=-1;
      if(ball.y > H-14-ball.r && ball.y < H-14+ball.r+6 && ball.x>paddle.x && ball.x<paddle.x+paddle.w && ball.dy>0){
        ball.dy*=-1;
        var hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
        var s=Math.hypot(ball.dx,ball.dy);
        ball.dx = hit*s;
      }
      bricks.forEach(function(b){
        if(!b.alive) return;
        if(ball.x>b.x && ball.x<b.x+b.w && ball.y-ball.r<b.y+b.h && ball.y+ball.r>b.y){
          b.alive=false; ball.dy*=-1; score+=10; scoreEl.textContent=score;
        }
      });
      if(ball.y > H+ball.r){
        lives--;
        if(lives<=0){
          running=false; over=true; clearInterval(loopId);
          hintEl.textContent='Game over — level '+level+', score '+score+'. Press any key to restart.';
          return;
        }
        resetBall();
        hintEl.textContent=lives+' '+(lives===1?'life':'lives')+' left. Keep going!';
      }
      if(bricks.every(function(b){return !b.alive;})){
        level++;
        titleEl.textContent='Breakout — Lv.'+level;
        buildBricks();
        resetBall();
        hintEl.textContent='Level '+level+'! Ball speed increased.';
        draw();
        return;
      }
      draw();
    }
    function start(){
      if(running) return;
      running=true;
      clearInterval(loopId);
      loopId=setInterval(tick, 16);
      hintEl.textContent='Go!';
    }
    return {
      name:'Breakout',
      init:function(){ canvas.style.display='block'; grid2048.classList.remove('active'); reset(); },
      destroy:function(){ running=false; clearInterval(loopId); },
      key:function(k){
        if(over && ['arrowleft','arrowright','a','d',' '].indexOf(k)>-1){ reset(); return; }
        if(k==='arrowleft'||k==='a') paddle.left=true;
        if(k==='arrowright'||k==='d') paddle.right=true;
        if(!running) start();
      },
      keyup:function(k){
        if(k==='arrowleft'||k==='a') paddle.left=false;
        if(k==='arrowright'||k==='d') paddle.right=false;
      },
      preventKeys:['arrowleft','arrowright','a','d']
    };
  }

  var registry={ snake:makeSnake, '2048':make2048, breakout:makeBreakout };

  function showPicker(){
    if(current && current.destroy) current.destroy();
    current=null;
    playView.classList.remove('active');
    picker.classList.remove('hidden');
    retriggerCardAnim();
  }
  function retriggerCardAnim(){
    Array.prototype.forEach.call(cardsWrap.querySelectorAll('.game-card'), function(c){
      c.style.animation='none'; void c.offsetWidth; c.style.animation='';
    });
  }
  function launch(id){
    if(current && current.destroy) current.destroy();
    current=registry[id]();
    titleEl.textContent=current.name;
    picker.classList.add('hidden');
    playView.classList.add('active');
    current.init();
  }
  function openArcade(){
    backdrop.classList.add('open');
    document.body.style.overflow='hidden';
    showPicker();
  }
  function closeArcade(){
    if(current && current.destroy) current.destroy();
    current=null;
    backdrop.classList.remove('open');
    document.body.style.overflow='';
  }

  playBtn.addEventListener('click', openArcade);
  closeFromPicker.addEventListener('click', closeArcade);
  closeFromPlay.addEventListener('click', closeArcade);
  backBtn.addEventListener('click', showPicker);
  backdrop.addEventListener('click', function(e){ if(e.target===backdrop) closeArcade(); });
  Array.prototype.forEach.call(cardsWrap.querySelectorAll('.game-card'), function(btn){
    btn.addEventListener('click', function(){ launch(btn.getAttribute('data-game')); });
  });

  document.addEventListener('keydown', function(e){
    if(!backdrop.classList.contains('open') || !current) return;
    var k=e.key.toLowerCase();
    if(current.preventKeys && current.preventKeys.indexOf(k)>-1) e.preventDefault();
    current.key(k);
  });
  document.addEventListener('keyup', function(e){
    if(!backdrop.classList.contains('open') || !current || !current.keyup) return;
    current.keyup(e.key.toLowerCase());
  });
})();

// ---------- theme ----------
var root=document.documentElement, t=document.getElementById('tgl');
try{var s=localStorage.getItem('theme'); if(s) root.setAttribute('data-theme',s);}catch(e){}
t.onclick=function(){
  var n = root.getAttribute('data-theme')==='dark' ? 'light':'dark';
  root.setAttribute('data-theme', n);
  try{localStorage.setItem('theme', n)}catch(e){}
};
window.onscroll=function(){document.getElementById('hd').classList.toggle('sc', window.scrollY>8)};

// ---------- mobile drawer ----------
var drawer=document.getElementById('drawer'), backdrop=document.getElementById('drawerBackdrop'), brandLink=document.getElementById('brandLink');
function openDrawer(){ drawer.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow='hidden'; }
function closeDrawer(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow=''; }
brandLink.addEventListener('click', function(e){
  if(window.innerWidth<=1300){
    e.preventDefault();
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  }
});
document.getElementById('drawerClose').onclick=closeDrawer;
backdrop.onclick=closeDrawer;
drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeDrawer); });

// ---------- scroll reveal ----------
var reveals=document.querySelectorAll('.reveal');
var io=new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(en.isIntersecting){
      en.target.classList.add('in');
      var batteries=en.target.querySelectorAll('.battery');
      batteries.forEach(function(bat){
        var lvl=parseInt(bat.getAttribute('data-level'),10)||0;
        var cells=bat.querySelectorAll('.cell');
        cells.forEach(function(cell,i){
          setTimeout(function(){
            if(i<lvl) cell.classList.add('on');
          }, i*90);
        });
      });
      io.unobserve(en.target);
    }
  });
},{threshold:.15});
reveals.forEach(function(el){ io.observe(el); });

// ---------- project shot carousel ----------
document.querySelectorAll('.pshot').forEach(function(shot){
  var frames=shot.querySelectorAll('.frame'), i=0;
  setInterval(function(){
    frames[i].classList.remove('on');
    i=(i+1)%frames.length;
    frames[i].classList.add('on');
  }, 2600);
});

// ---------- contact form ----------
var f=document.getElementById('form'), note=document.getElementById('note');
f.onsubmit=function(e){
  e.preventDefault();
  var m='From: '+f.name.value+' ('+f.email.value+')\n\n'+f.message.value;
  location.href='mailto:subhadeepm608@gmail.com?subject=Portfolio contact&body='+encodeURIComponent(m);
  note.textContent='Opening your email client…';
};

// ---------- droid chatbot ----------
var panel=document.getElementById('chatPanel'), body=document.getElementById('chatBody');
document.getElementById('droidBtn').onclick=function(){ panel.classList.toggle('open'); };
document.getElementById('chatClose').onclick=function(){ panel.classList.remove('open'); };

function addMsg(text, who){
  var d=document.createElement('div');
  d.className='msg '+who;
  d.textContent=text;
  body.appendChild(d);
  body.scrollTop=body.scrollHeight;
}
var replies={
  projects:"The Projects section contains selected work including FireBarrier, ReproSense, ESPect, RFMO HUB and AgroHelp.",
  skills:"I work across Java, Python, JavaScript/TypeScript, React, Node.js, FastAPI, Django, databases, machine learning and networking. See the Skills section for the current breakdown.",
  achievements:"My listed milestones include Smart India Hackathon finalist, participation in 20+ hackathons, and SAP Certified — Back-End Developer — ABAP Cloud.",
  contact:"Best way in is the contact form just below, or email subhadeepm608@gmail.com directly.",
  resume:"You can view or download the résumé from the button in the top nav.",
  default:"Good question — for anything specific, the contact form below reaches Subhadeep directly."
};
function respond(key, label){
  addMsg(label, 'user');
  setTimeout(function(){ addMsg(replies[key] || replies.default, 'bot'); }, 500);
}
document.getElementById('quickChips').addEventListener('click', function(e){
  var b=e.target.closest('.qchip');
  if(!b) return;
  respond(b.getAttribute('data-q'), b.textContent);
});
var input=document.getElementById('chatInput');
function send(){
  var v=input.value.trim();
  if(!v) return;
  var key='default';
  var lv=v.toLowerCase();
  if(lv.indexOf('project')>-1) key='projects';
  else if(lv.indexOf('skill')>-1) key='skills';
  else if(lv.indexOf('achiev')>-1||lv.indexOf('award')>-1) key='achievements';
  else if(lv.indexOf('contact')>-1||lv.indexOf('email')>-1||lv.indexOf('hire')>-1) key='contact';
  else if(lv.indexOf('resume')>-1||lv.indexOf('cv')>-1) key='resume';
  addMsg(v,'user'); input.value='';
  setTimeout(function(){ addMsg(replies[key],'bot'); }, 500);
}
document.getElementById('chatSend').onclick=send;
input.addEventListener('keydown', function(e){ if(e.key==='Enter') send(); });
// ---------- blog: static JSON source ----------
(function(){
  var GRID = document.getElementById('blogGrid');
  var VIEWPORT = document.getElementById('blogViewport');
  var TAGFILTER = document.getElementById('blogTagFilter');
  var PROGRESS = document.getElementById('blogProgress');
  var DOTS = document.getElementById('blogDots');
  var readerOverlay = document.getElementById('blogReaderOverlay');
  if(!GRID || !VIEWPORT || !TAGFILTER || !readerOverlay) return;

  var activeTag = 'All';
  var posts = [];
  var filteredPosts = [];
  var index = 0;
  var visible = 3;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplayTimer = null;
  var currentReaderId = null;
  var cloneCount = 0;
  var realCount = 0;

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function fmtDate(d){
    var dt = new Date(d + 'T00:00:00');
    if(Number.isNaN(dt.getTime())) return escapeHtml(d);
    return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  function computeVisible(){
    var w = VIEWPORT.getBoundingClientRect().width;
    if(w >= 900) return 3;
    if(w >= 600) return 2;
    return 1;
  }
  function cardHtml(p){
    return (
      '<div class="blog-slide" style="--vis:'+visible+'">'+
        '<article class="blog-card" data-id="'+escapeHtml(p.id)+'">'+
          '<div class="blog-cover" data-cover="'+escapeHtml(p.id)+'" style="background:linear-gradient(135deg,var(--accent2),var(--accent))"><span class="blog-cover-emoji">'+escapeHtml(p.emoji || '📝')+'</span></div>'+
          '<div class="blog-body">'+
            '<div class="blog-meta">'+fmtDate(p.date)+'<span class="sep">·</span>'+escapeHtml(String(p.readMin || 1))+' min read</div>'+
            '<h3 data-title="'+escapeHtml(p.id)+'">'+escapeHtml(p.title)+'</h3>'+
            '<p class="excerpt">'+escapeHtml(p.excerpt)+'</p>'+
            '<div class="tags">'+(Array.isArray(p.tags) ? p.tags : []).map(function(t){return '<span>'+escapeHtml(t)+'</span>';}).join('')+'</div>'+
            '<div class="blog-foot"><div class="blog-coming-mini">♡ Likes · 💬 Comments <span>coming soon</span></div></div>'+
          '</div>'+
        '</article>'+
      '</div>'
    );
  }
  function positionArrows(){
    var card = GRID.querySelector('.blog-card');
    var prevBtn = document.getElementById('blogPrev');
    var nextBtn = document.getElementById('blogNext');
    if(!card){ prevBtn.style.top=''; nextBtn.style.top=''; return; }
    var top = card.getBoundingClientRect().height / 2;
    prevBtn.style.top = top + 'px';
    nextBtn.style.top = top + 'px';
  }
  function slideStep(){
    var first = GRID.querySelector('.blog-slide');
    if(!first) return 0;
    var rect = first.getBoundingClientRect();
    var gap = parseFloat(getComputedStyle(GRID).gap || '22');
    return rect.width + gap;
  }
  function updateDots(){
    if(!realCount) return;
    var realIdx = ((index - cloneCount) % realCount + realCount) % realCount;
    Array.prototype.forEach.call(DOTS.querySelectorAll('.blog-dot'), function(btn, i){
      btn.classList.toggle('active', i === realIdx);
    });
  }
  function positionTrack(animated){
    var step = slideStep();
    GRID.classList.toggle('animating', !!animated && !reduce);
    GRID.style.transform = 'translateX('+(-index * step)+'px)';
    updateDots();
  }
  function handleWrap(){
    if(index >= cloneCount + realCount){
      index -= realCount;
      GRID.classList.remove('animating');
      GRID.style.transform = 'translateX('+(-index * slideStep())+'px)';
    } else if(index < cloneCount){
      index += realCount;
      GRID.classList.remove('animating');
      GRID.style.transform = 'translateX('+(-index * slideStep())+'px)';
    }
    updateDots();
  }
  function renderDots(){
    DOTS.innerHTML = filteredPosts.map(function(_, i){
      return '<button class="blog-dot" data-dot="'+i+'" aria-label="Go to blog post '+(i+1)+'"></button>';
    }).join('');
    Array.prototype.forEach.call(DOTS.querySelectorAll('[data-dot]'), function(btn){
      btn.addEventListener('click', function(){
        index = cloneCount + parseInt(btn.getAttribute('data-dot'), 10);
        positionTrack(true);
        restartProgress();
      });
    });
    updateDots();
  }
  function stopAutoplay(){
    if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; }
    if(PROGRESS) PROGRESS.classList.remove('run');
  }
  function restartProgress(){
    if(!PROGRESS || reduce) return;
    PROGRESS.classList.remove('run');
    void PROGRESS.offsetWidth;
    PROGRESS.classList.add('run');
  }
  function startAutoplay(){
    stopAutoplay();
    if(reduce || realCount <= visible) return;
    restartProgress();
    autoplayTimer = setInterval(function(){
      index++;
      positionTrack(true);
      restartProgress();
    },5000);
  }
  function renderTagFilter(){
    var tagSet = ['All'];
    posts.forEach(function(p){
      (p.tags || []).forEach(function(t){ if(tagSet.indexOf(t) === -1) tagSet.push(t); });
    });
    TAGFILTER.innerHTML = tagSet.map(function(t){
      return '<button class="blog-tag-chip'+(t===activeTag?' active':'')+'" data-tag="'+escapeHtml(t)+'">'+escapeHtml(t)+'</button>';
    }).join('');
    Array.prototype.forEach.call(TAGFILTER.querySelectorAll('[data-tag]'), function(btn){
      btn.addEventListener('click', function(){
        activeTag = btn.getAttribute('data-tag');
        renderTagFilter();
        initCarousel();
      });
    });
  }
  function initCarousel(){
    stopAutoplay();
    filteredPosts = posts.filter(function(p){ return activeTag === 'All' || (p.tags || []).indexOf(activeTag) !== -1; });
    visible = computeVisible();
    realCount = filteredPosts.length;
    if(!realCount){
      GRID.innerHTML = '<div class="blog-empty">No posts in this category yet.</div>';
      DOTS.innerHTML = '';
      return;
    }
    if(realCount <= visible){
      cloneCount = 0;
      index = 0;
      GRID.style.width = '100%';
      GRID.classList.add('notransition');
      GRID.innerHTML = filteredPosts.map(cardHtml).join('');
      bindCardEvents();
      renderDots();
      positionTrack(false);
      positionArrows();
      GRID.classList.remove('notransition');
      return;
    }
    cloneCount = Math.min(visible, realCount);
    var head = filteredPosts.slice(0, cloneCount);
    var tail = filteredPosts.slice(realCount - cloneCount);
    var combined = tail.concat(filteredPosts, head);
    GRID.classList.add('notransition');
    GRID.innerHTML = combined.map(cardHtml).join('');
    bindCardEvents();
    index = cloneCount;
    positionTrack(false);
    renderDots();
    positionArrows();
    requestAnimationFrame(function(){ GRID.classList.remove('notransition'); });
    startAutoplay();
  }
  function bindCardEvents(){
    Array.prototype.forEach.call(GRID.querySelectorAll('[data-cover],[data-title]'), function(el){
      el.addEventListener('click', function(){ openReader(el.getAttribute('data-cover') || el.getAttribute('data-title')); });
    });
  }
  function openReader(id){
    var post = posts.filter(function(p){ return p.id === id; })[0];
    if(!post) return;
    currentReaderId = id;
    document.getElementById('blogReaderMeta').textContent = fmtDate(post.date)+' · '+(post.readMin || 1)+' min read';
    document.getElementById('blogReaderTitle').textContent = post.title;
    document.getElementById('blogReaderTags').innerHTML = (post.tags || []).map(function(t){return '<span>'+escapeHtml(t)+'</span>';}).join('');
    document.getElementById('blogReaderBody').innerHTML = String(post.content || '').split(/\n\s*\n/).map(function(para){
      return '<p>'+escapeHtml(para).replace(/\n/g,'<br>')+'</p>';
    }).join('');
    readerOverlay.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeReader(){
    readerOverlay.classList.remove('open');
    document.body.style.overflow='';
    currentReaderId = null;
  }
  document.getElementById('blogReaderClose').addEventListener('click', closeReader);
  readerOverlay.addEventListener('click', function(e){ if(e.target === readerOverlay) closeReader(); });
  document.getElementById('blogPrev').addEventListener('click', function(){
    if(!realCount) return;
    index--;
    positionTrack(true);
    restartProgress();
  });
  document.getElementById('blogNext').addEventListener('click', function(){
    if(!realCount) return;
    index++;
    positionTrack(true);
    restartProgress();
  });
  VIEWPORT.parentElement.addEventListener('mouseenter', stopAutoplay);
  VIEWPORT.parentElement.addEventListener('mouseleave', startAutoplay);
  GRID.addEventListener('transitionend', handleWrap);
  window.addEventListener('resize', function(){
    clearTimeout(window.__blogResize);
    window.__blogResize = setTimeout(function(){ initCarousel(); },150);
  });

  fetch('./data/blogs.json', {cache:'no-store'})
    .then(function(res){
      if(!res.ok) throw new Error('Could not load blogs.json');
      return res.json();
    })
    .then(function(data){
      if(!Array.isArray(data)) throw new Error('blogs.json must contain an array');
      posts = data.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
      renderTagFilter();
      initCarousel();
    })
    .catch(function(err){
      console.error(err);
      TAGFILTER.innerHTML = '<span class="blog-tag-chip active">Blog</span>';
      GRID.innerHTML = '<div class="blog-empty">Blog posts could not be loaded. Make sure <code>blogs.json</code> is next to this HTML file.</div>';
      DOTS.innerHTML = '';
    });
})();

// ---------- JSON-driven site identity ----------
(function(){
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function applyLink(selector,url,text){
    if(!url) return;
    document.querySelectorAll(selector).forEach(function(a){
      a.href=url;
      if(text) {
        var span=a.querySelector('.cc-text span');
        if(span) span.textContent=text;
      }
    });
  }
  fetch('./data/site.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('site.json'); return r.json();})
    .then(function(site){
      if(site.name){
        document.querySelectorAll('.brand-name,.drawer-name').forEach(function(el){el.textContent=site.name;});
        document.title = site.name + ' — ' + (site.role || 'Developer') + ' | ' + (site.brand || 'Dev.SUBHO');
      }
      if(site.logo){
        document.querySelectorAll('.logo img').forEach(function(img){img.src=site.logo;});
      }
      if(site.heroImage){
        var hero=document.querySelector('.hero-photo img');
        if(hero) hero.src=site.heroImage;
      }
      if(site.aboutImage){
        var about=document.querySelector('.about-photo');
        if(about) about.src=site.aboutImage;
      }
      if(site.resume){
        document.querySelectorAll('a[href*="Subhadeep_Mandal_Resume.pdf"]').forEach(function(a){a.href=site.resume;});
      }
      if(site.email){
        document.querySelectorAll('a[href^="mailto:subhadeepm608@gmail.com"]').forEach(function(a){a.href='mailto:'+site.email;});
        document.querySelectorAll('.cc-text span').forEach(function(el){
          if(el.textContent.trim()==='subhadeepm608@gmail.com') el.textContent=site.email;
        });
      }
      if(site.github){
        document.querySelectorAll('a[href*="github.com/Subhadeep-Mandal"]').forEach(function(a){a.href=site.github;});
      }
      var identity=document.querySelector('.seo-identity');
      var identity=document.querySelector('.seo-identity');
      if(identity && site.heroIdentity){
      identity.textContent=site.heroIdentity;
      }
    })
    .catch(function(err){console.warn('site.json could not be applied',err);});
})();

// ---------- JSON-driven projects ----------
(function(){
  var track=document.getElementById('projTrack');
  if(!track) return;
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  var palettes=[
    ['var(--accent2)','var(--accent)'],
    ['var(--accent)','var(--accent2)'],
    ['var(--accent2)','var(--accent2)'],
    ['var(--accent)','var(--accent2)'],
    ['var(--accent2)','var(--accent)'],
    ['var(--accent)','var(--accent2)']
  ];
  function card(project,index){

  var images = Array.isArray(project.images) ? project.images : [];

  var shots = images.map(function(src, i){
    return '<img class="json-frame' + (i === 0 ? ' on' : '') +
      '" src="' + esc(src) +
      '" alt="' + esc(project.name || 'Project screenshot') +
      ' — screenshot ' + (i + 1) +
      '" loading="lazy">';
  }).join('');

  var safeUrl = String(project.url || '#');
  var validUrl = safeUrl && !safeUrl.match(/^YOUR-|^#/i);
  var linkText = validUrl ? 'View source ↗' : 'Add repository ↗';

  return '<div class="pcard">' +

    '<div class="pshot" data-shots="' + images.length + '">' +
      '<div class="proj-json-shot">' +
        shots +
      '</div>' +
    '</div>' +

    '<div class="pbody">' +
      '<h3>' + esc(project.name || 'Untitled project') + '</h3>' +
      '<p>' + esc(project.description || '') + '</p>' +

      '<div class="tags">' +
        (project.technologies || []).map(function(t){
          return '<span>' + esc(t) + '</span>';
        }).join('') +
      '</div>' +

      '<a href="' + (validUrl ? esc(safeUrl) : '#') + '" ' +
        (validUrl ? 'target="_blank" rel="noopener"' : 'aria-disabled="true"') +
        ' class="visit">' +
        linkText +
      '</a>' +

    '</div>' +

  '</div>';
}
  function animateProjectFrames(){
    document.querySelectorAll('#projTrack .pcard').forEach(function(c,idx){
      var frames=c.querySelectorAll('.json-frame');
      if(frames.length<2) return;
      var i=0;
      setInterval(function(){
        frames[i].classList.remove('on');
        i=(i+1)%frames.length;
        frames[i].classList.add('on');
      },3200+((idx%3)*350));
    });
  }
  fetch('./data/projects.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('projects.json'); return r.json();})
    .then(function(items){
      if(!Array.isArray(items) || !items.length) throw new Error('empty projects');
      var cards=items.map(card).join('');
      track.innerHTML=cards+cards;
      animateProjectFrames();
    })
    .catch(function(err){
      console.warn('projects.json could not be loaded',err);
      track.innerHTML='<div class="pcard"><div class="pbody"><h3>Projects unavailable</h3><p>Check data/projects.json and serve the site through a local web server.</p></div></div>';
    });
})();

// ---------- JSON-driven skills ----------
(function(){
  var wrap=document.getElementById('skillsData');
  if(!wrap) return;
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  var groups={
    languages:'Languages',
    frameworks_and_tools:'Frameworks & tools',
    platforms:'Operating systems',
    fundamentals:'Fundamentals'
  };
  var levelMap={
    'Java':5,'Python':5,'C++':4,'JavaScript':4,'TypeScript':4,
    'React':4,'Next.js':4,'Node.js':5,'Express':5,'FastAPI':4,'Django':4,'PostgreSQL':4,'MongoDB':4,'Docker':3,'AWS':3,
    'Windows':5,'Ubuntu/Debian':4,'Kali Linux':3,'macOS':3,
    'Data Structures & Algorithms':5,'OOP':4,'DBMS':4,'Operating Systems':3,'Computer Networks':3,'System Design':3
  };
    
  function icon(name){
    var icons = {
        'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
        'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
        'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg',
        'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
        'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',

        'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
        'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
        'Express': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg',
        'FastAPI': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg',
        'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg',
        'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',

        'Windows': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows11/windows11-original.svg',
        'Ubuntu/Debian': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-plain.svg',
        'Kali Linux': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kalilinux/kalilinux-original.svg',
        'AWS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
        'GCP': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
        'Android': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg',

        'SQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
        'ABAP': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/sap.svg',

        'DSA': 'https://api.iconify.design/lucide:brackets.svg',
        'OOP': 'https://api.iconify.design/lucide:boxes.svg',
        'DBMS': 'https://api.iconify.design/lucide:database.svg',
        'Operating Systems': 'https://api.iconify.design/lucide:monitor-cog.svg',
        'Computer Networks': 'https://api.iconify.design/lucide:network.svg',
        'System Design': 'https://api.iconify.design/lucide:workflow.svg'
    };

    var src = icons[name];

    return src? '<img class="sk-icon-img" src="' + src + '" alt="' + esc(name) + '" loading="lazy">' : '<span class="sk-fallback">◆</span>';
  }

  function splitSkill(name){
    var parts=String(name||'').split(' / ');
    return parts;
  }
  function row(skill){

    var name = skill.name || '';
    var logo = skill.logo || '';

    var lvl = levelMap[name] || levelMap[splitSkill(name)[0]] || 3;

    var cells = '';
    for(var i=0;i<5;i++){
        cells += '<span class="cell' + (i < lvl ? ' on' : '') + '"></span>';
    }

    var iconHtml = logo
        ? '<img class="sk-icon-img" src="' + esc(logo) +
        '" alt="' + esc(name) + '" loading="lazy">'
        : '<span class="sk-fallback">◆</span>';

    return '<div class="skill-item">' +
        '<div class="sk-icon">' + iconHtml + '</div>' +
        '<div class="sk-info">' +
        '<span class="nm">' + esc(name) + '</span>' +
        '<span class="lvl">' +
            (lvl >= 4 ? 'Advanced' : lvl === 3 ? 'Comfortable' : 'Familiar') +
        '</span>' +
        '</div>' +
        '<div class="battery" data-level="' + lvl + '">' +
        cells +
        '<span class="nub"></span>' +
        '</div>' +
    '</div>';
  }
  fetch('./data/skills.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('skills.json'); return r.json();})
    .then(function(data){
      var html='';
      Object.keys(groups).forEach(function(key){
        var items=Array.isArray(data[key])?data[key]:[];
        html+='<div class="skill-cat reveal skill-json-category"><h3>'+groups[key]+'</h3><div class="skill-grid">'+items.map(row).join('')+'</div></div>';
      });
      wrap.innerHTML=html;
      requestAnimationFrame(function(){
        wrap.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
      });
    })
    .catch(function(err){
      console.warn('skills.json could not be loaded',err);
      wrap.innerHTML='<div class="skill-cat"><h3>Skills unavailable</h3><div class="skill-grid"><div class="skill-item"><div class="sk-info"><span class="nm">Check data/skills.json</span></div></div></div></div>';
    });
})();

// ---------- JSON-driven experience ----------
(function(){
  var wrap=document.getElementById('experienceData');
  if(!wrap) return;
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  fetch('./data/experience.json',{cache:'no-store'})
    .then(function(r){if(!r.ok) throw new Error('experience.json'); return r.json();})
    .then(function(items){
      if(!Array.isArray(items) || !items.length) return;
      wrap.innerHTML='<div class="experience-kicker">Experience</div>'+
        items.map(function(x){
          return '<div class="experience-item"><strong>'+esc(x.title||'Role')+'</strong>'+
            '<span class="exp-meta">'+esc(x.company||'')+(x.period?' · '+esc(x.period):'')+'</span>'+
            '<p>'+esc(x.details||'')+'</p></div>';
        }).join('');
    })
    .catch(function(err){
      console.warn('experience.json could not be loaded',err);
    });
})();