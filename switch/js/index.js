const sw = 40; //方块宽
const sh = 40;
const tr = 9; //方块行数
const td = 14;


//用来创建各个icon
function Square(x, y, classname) {
  this.x = x * sw;
  this.y = y * sh;
  this.class = classname;
  this.viewContent = document.createElement("div"); //方块对应的DOM元素
  this.viewContent.className = this.class;
  this.parent = document.getElementById("snakeWrap"); //方块的父级
}

//给方块创建方法
Square.prototype.create = function () {
  //创建方块DOM并添加到页面里
  this.viewContent.style.position = "absolute";
  this.viewContent.style.width = sw + "px";
  this.viewContent.style.height = sh + "px";
  this.viewContent.style.left = this.x + "px";
  this.viewContent.style.top = this.y + "px";
  this.parent.appendChild(this.viewContent);
};

Square.prototype.remove = function () {
  this.parent.removeChild(this.viewContent);
};

//创建snake
function Snake() {
  this.head = null;
  this.tail = null;
  this.pos = []; //存储蛇身每一个方块的位置
  this.directionNum = {
    left: {
      x: -1,
      y: 0,
      rotate:180//嘴巴旋转角度
    },
    right: {
      x: 1,
      y: 0,
      rotate:0
    },
    up: {
      x: 0,
      y: -1,
      rotate:-90
    },
    down: {
      x: 0,
      y: 1,
      rotate:90
    },
  }; //存储蛇的走向
}

//初始化
Snake.prototype.init = function () {
  //创建默认的蛇的样子
  let snakeHead = new Square(1, 0, "snakeHead");
  snakeHead.create();
  this.head = snakeHead; // 存储嘴巴信息
  this.pos.push([1, 0]); //把嘴巴位置存起来

  //创建便便
  let snakeBody = new Square(0, 0, "snakeBody");
  snakeBody.create();
  this.tail = snakeBody;
  this.pos.push([0, 0]); //存储便便的位置

  //形成链表关系（头和便便形成一个整体）
  snakeHead.last = null;
  snakeHead.next = snakeBody;

  snakeBody.last = snakeHead;
  snakeBody.next = null;

  //给蛇添加一个属性，表示蛇走的方向
  this.direct = this.directionNum.right; //默认向右走
};

//用来获取嘴巴移动的下一个位置对应的元素，根据元素做不同的事
Snake.prototype.getNextPos = function () {
  let nextPos = [
    this.head.x/sw + this.direct.x,
    this.head.y/sh + this.direct.y
  ];

  //撞到自己 gameover
  const selfBody = false;
  this.pos.forEach(function (value) {
    if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
      selfBody = true;
    }
  });
  if (selfBody) {
    console.log("撞到自己了");
    this.strategies.gameOver.call(this);
    return;
  }
  //撞到墙 gameover
  if (
    nextPos[0] < 0 ||
    nextPos[1] < 0 ||
    nextPos[0] > td - 1 ||
    nextPos[1] > tr - 1
  ) {
    console.log("撞墙了");
    this.strategies.gameOver.call(this);
    return;
  }

  //吃到披萨 增加便便
  if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
    console.log('成功');
    
    this.strategies.eat.call(this);
    return;
  }
  //啥都没碰，继续走
  this.strategies.move.call(this);
};

//
Snake.prototype.strategies = {
  move: function (format) {
    //创建新便便（在旧嘴巴的位置）
    let newBody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");
    //更新链表关系
    newBody.next = this.head.next;
    newBody.next.last = newBody;
    newBody.last = null;
    this.head.remove(); //就嘴巴从原来位置删除
    newBody.viewContent.style.transform = 'rotate('+this.direct.rotate+'deg)';
    newBody.create();
    
    //创建新嘴巴
    let newHead = new Square(
      this.head.x / sw + this.direct.x,
      this.head.y / sh + this.direct.y,
      "snakeHead"
    );
    newHead.next = newBody;
    newHead.last = null;
    newBody.last = newHead;
    newHead.viewContent.style.transform = 'rotate('+this.direct.rotate+'deg)';
    newHead.create();

    this.pos.splice(0, 0, [
      this.head.x / sw + this.direct.x,
      this.head.y / sh + this.direct.y,
    ]);
    this.head = newHead;
    if (!format) {
      this.tail.remove();
      this.tail = this.tail.last;
      this.pos.pop();
    }
  },
  eat: function () {
    this.strategies.move.call(this, true);
    createFood();
    game.score++;
  },
  gameOver: function () {
    game.over();
  },
};
let snake = new Snake();

function createFood() {
  //食物的坐标
  let x = null;
  let y = null;

  let include = true; //true表示披萨的坐标在嘴巴上，要循环，false表示不再嘴巴上，可以不循环
  while (include) {
    x = Math.round(Math.random() * (td - 1));
    y = Math.round(Math.random() * (tr - 1));
    snake.pos.forEach(function (value) {
      if (x != value[0] && y != value[1]) {
        include = false;
      }
    });
  }
  food = new Square(x, y, "food");
  food.pos = [x, y];//存储食物坐标，判断是否吃到
  let foodDom = document.querySelector('.food');
  if (foodDom) {
    foodDom.style.left = x * sw + 'px';
    foodDom.style.top = y * sh + 'px';
  } else {
    food.create();
  }
  
}

function Game() {
  this.timer = null;
  this.score = 0;
}

Game.prototype.init = function () {
  

  snake.init();
  //snake.getNextPos();
  createFood();
  document.onkeydown = function (ev) {
    if (ev.which == 37 && snake.direct != snake.directionNum.right) {
      //左键
      snake.direct = snake.directionNum.left;
    } else if (ev.which == 38 && snake.direct != snake.directionNum.down) {
      snake.direct = snake.directionNum.up;
    } else if (ev.which == 39 && snake.direct != snake.directionNum.left) {
      snake.direct = snake.directionNum.right;
    } else if (ev.which == 40 && snake.direct != snake.directionNum.up) {
      snake.direct = snake.directionNum.down;
    }
  };
  this.start();
};
Game.prototype.start = function () {
  this.timer = setInterval(function () {
    snake.getNextPos();
  }, 200);
};

Game.prototype.over = function () {
  clearInterval(this.timer);
  alert('你的得分为' + this.score);

  let snakeWrap = document.getElementById('snakeWrap');
  snakeWrap.innerHTML = '';
  snake = new Snake();
  game = new Game();
  let startBtnWrap = document.querySelector('.startBtn button');
  startBtnWrap.style.display = 'block';
  startBtnWrap.parentNode.style.opacity = 1;
};
let game = new Game();
let startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function () {
  startBtn.style.display = 'none';
  startBtn.parentNode.style.opacity = 0;
  game.init();
}


