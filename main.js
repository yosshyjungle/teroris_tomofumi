// スマホ向けテトリス（純粋なJavaScript）
(function(){
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');

  // スマホ向けにサイズを調整
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = Math.min(20, Math.floor(window.innerWidth * 0.8 / COLS)); // レスポンシブサイズ
  const WIDTH = COLS * BLOCK;
  const HEIGHT = ROWS * BLOCK;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  
  // キャンバスを中央に配置
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  // テトロミノ定義（各形状の全回転パターンを含む）
  const TETROMINOES = {
    I: [
      [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
      ],
      [
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0]
      ]
    ],
    J: [
      [
        [1,0,0],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,1],
        [0,1,0],
        [0,1,0]
      ],
      [
        [0,0,0],
        [1,1,1],
        [0,0,1]
      ],
      [
        [0,1,0],
        [0,1,0],
        [1,1,0]
      ]
    ],
    L: [
      [
        [0,0,1],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,0],
        [0,1,1]
      ],
      [
        [0,0,0],
        [1,1,1],
        [1,0,0]
      ],
      [
        [1,1,0],
        [0,1,0],
        [0,1,0]
      ]
    ],
    O: [
      [
        [1,1],
        [1,1]
      ]
    ],
    S: [
      [
        [0,1,1],
        [1,1,0],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,1],
        [0,0,1]
      ]
    ],
    T: [
      [
        [0,1,0],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,1],
        [0,1,0]
      ],
      [
        [0,0,0],
        [1,1,1],
        [0,1,0]
      ],
      [
        [0,1,0],
        [1,1,0],
        [0,1,0]
      ]
    ],
    Z: [
      [
        [1,1,0],
        [0,1,1],
        [0,0,0]
      ],
      [
        [0,0,1],
        [0,1,1],
        [0,1,0]
      ]
    ]
  };

  const COLORS = {
    I:'#00f0f0', J:'#0000f0', L:'#f0a000', O:'#f0f000', S:'#00f000', T:'#a000f0', Z:'#f00000'
  };

  // 盤面を0で初期化
  function createBoard(){
    const board = [];
    for(let r=0;r<ROWS;r++){
      board.push(new Array(COLS).fill(0));
    }
    return board;
  }

  let board = createBoard();

  // ランダムにテトロミノを生成
  function randomPiece(){
    const keys = Object.keys(TETROMINOES);
    const k = keys[Math.floor(Math.random()*keys.length)];
    const matrix = cloneMatrix(TETROMINOES[k][0]);
    return {matrix, type:k, rotation: 0, x:Math.floor((COLS - matrix[0].length)/2), y: -1};
  }

  function cloneMatrix(m){
    return m.map(r => r.slice());
  }

  // 回転（次の回転パターンに変更）
  function rotatePiece(piece){
    const tetromino = TETROMINOES[piece.type];
    const nextRotation = (piece.rotation + 1) % tetromino.length;
    return {
      ...piece,
      matrix: cloneMatrix(tetromino[nextRotation]),
      rotation: nextRotation
    };
  }

  function collide(board, piece){
    const m = piece.matrix;
    for(let y=0;y<m.length;y++){
      for(let x=0;x<m[y].length;x++){
        if(m[y][x]){
          const bx = piece.x + x;
          const by = piece.y + y;
          if(bx < 0 || bx >= COLS || by >= ROWS) return true;
          if(by >=0 && board[by][bx]) return true;
        }
      }
    }
    return false;
  }

  function merge(board, piece){
    const m = piece.matrix;
    for(let y=0;y<m.length;y++){
      for(let x=0;x<m[y].length;x++){
        if(m[y][x]){
          const bx = piece.x + x;
          const by = piece.y + y;
          if(by>=0) board[by][bx] = piece.type;
        }
      }
    }
  }

  function clearLines(){
    let lines = 0;
    outer: for(let y=ROWS-1;y>=0;y--){
      for(let x=0;x<COLS;x++){
        if(!board[y][x]){
          continue outer;
        }
      }
      // この行は満杯
      board.splice(y,1);
      board.unshift(new Array(COLS).fill(0));
      lines++;
      y++; // 再チェック
    }
    return lines;
  }

  function draw(){
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    // board
    for(let y=0;y<ROWS;y++){
      for(let x=0;x<COLS;x++){
        const v = board[y][x];
        if(v){
          drawBlock(x,y,COLORS[v]);
        }
      }
    }
    // current piece
    const m = player.matrix;
    for(let y=0;y<m.length;y++){
      for(let x=0;x<m[y].length;x++){
        if(m[y][x]){
          const bx = player.x + x;
          const by = player.y + y;
          if(by>=0){
            drawBlock(bx,by,COLORS[player.type]);
          }
        }
      }
    }
  }

  function drawBlock(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK, BLOCK);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(x*BLOCK+1, y*BLOCK+1, BLOCK-2, BLOCK-2);
  }

  function updateScore(lines){
    if(lines>0){
      const points = [0,100,300,500,800];
      score += points[lines] || (lines*200);
      scoreEl.textContent = score;
      level = Math.floor(score/500)+1;
      levelEl.textContent = level;
      // speed adjust
      dropInterval = Math.max(100, 600 - (level-1)*50);
      resetDropInterval();
    }
  }

  function resetDropInterval(){
    if(dropTimer) clearInterval(dropTimer);
    dropTimer = setInterval(() => { drop(); }, dropInterval);
  }

  // ゲーム状態
  let player = randomPiece();
  let next = randomPiece();
  let score = 0;
  let level = 1;
  let dropInterval = 600; // ms
  let dropTimer = null;
  let gameOver = false;

  function spawn(){
    player = next;
    next = randomPiece();
    player.x = Math.floor((COLS - player.matrix[0].length)/2);
    player.y = -1;
    if(collide(board, player)){
      // ゲームオーバー
      gameOver = true;
      clearInterval(dropTimer);
      alert('ゲームオーバー！スコア: ' + score);
    }
  }

  function drop(){
    if(gameOver) return;
    player.y++;
    if(collide(board, player)){
      player.y--;
      merge(board, player);
      const lines = clearLines();
      updateScore(lines);
      spawn();
    }
    draw();
  }

  // 操作関数
  function moveLeft(){
    if(gameOver) return;
    player.x--;
    if(collide(board, player)) player.x++;
    draw();
  }

  function moveRight(){
    if(gameOver) return;
    player.x++;
    if(collide(board, player)) player.x--;
    draw();
  }

  function rotateBlock(){
    if(gameOver) return;
    const rotated = rotatePiece(player);
    const oldMatrix = player.matrix;
    const oldRotation = player.rotation;
    
    player.matrix = rotated.matrix;
    player.rotation = rotated.rotation;
    
    // 壁キック（簡単版）
    let kick = 0;
    while(collide(board, player) && kick < 3){
      player.x += (kick%2===0) ? 1 : -1;
      kick++;
    }
    
    if(collide(board, player)){
      player.matrix = oldMatrix;
      player.rotation = oldRotation;
    }
    draw();
  }

  function softDrop(){
    if(gameOver) return;
    drop();
  }

  function hardDrop(){
    if(gameOver) return;
    while(!collide(board, player)) player.y++;
    player.y--;
    merge(board, player);
    const lines = clearLines();
    updateScore(lines);
    spawn();
    draw();
  }

  // キーボード操作
  document.addEventListener('keydown', e=>{
    if(e.key === 'ArrowLeft') moveLeft();
    else if(e.key === 'ArrowRight') moveRight();
    else if(e.key === 'ArrowUp') rotateBlock();
    else if(e.key === 'ArrowDown') softDrop();
    else if(e.code === 'Space') hardDrop();
  });

  // タッチ操作とボタンイベント
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    if(Math.abs(deltaX) > Math.abs(deltaY)){
      if(deltaX > 30) moveRight();
      else if(deltaX < -30) moveLeft();
    } else {
      if(deltaY > 30) softDrop();
      else if(deltaY < -30) rotateBlock();
    }
  });

  // ボタンイベント
  document.getElementById('leftBtn')?.addEventListener('click', moveLeft);
  document.getElementById('rightBtn')?.addEventListener('click', moveRight);
  document.getElementById('rotateBtn')?.addEventListener('click', rotateBlock);
  document.getElementById('downBtn')?.addEventListener('click', softDrop);
  document.getElementById('dropBtn')?.addEventListener('click', hardDrop);

  // 初期描画
  draw();
  resetDropInterval();

})();
