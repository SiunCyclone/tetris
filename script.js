var Tetrimino = {
  orange: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 0, y: 1}
    ],
    base: {x: 1, y: 0},
    color: "#e87812"
  },
  yellow: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1}
    ],
    base: {x: 0.5, y: 0.5},
    color: "#ffd000"
  },
  red: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 1},
    ],
    base: {x: 1, y: 0},
    color: "#ff0000"
  },
  purple: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 1, y: 1},
    ],
    base: {x: 1, y: 0},
    color: "#dc00e0"
  },
  green: {
    pos: [
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1},
    ],
    base: {x: 1, y: 0},
    color: "#00ff00"
  },
  blue: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 2, y: 1},
    ],
    base: {x: 1, y: 0},
    color: "#0000eb"
  },
  cyan: {
    pos: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 3, y: 0},
    ],
    base: {x: 1, y: 0},
    color: "#02e4e6"
  }
};

var PI = Math.PI;
var  CELL_SIZE = 30;
var  speed = 500;

function cos(rad) { return ~~(Math.cos(rad)); } //check
function sin(rad) { return ~~(Math.sin(rad)); } //check
function rand(num) { return Math.random() * num | 0; } //return x < num

var board = {
  size: {x: 300, y: 600},

  field: new Array(),
  dLine: new Array(),
  emptyLine: new Array(),

  init: function() {
    for (var i=0; i<this.size.x/CELL_SIZE; ++i)
      this.emptyLine.push({flag: false, color: null});

    for (var i=0; i<this.size.y/CELL_SIZE; ++i)
      this.field.push( $.extend(true, [], this.emptyLine) );
  },

  update: function(drawFunc, colorFunc) {
    if ( this.canRemove() )
      this.remove();

    this.draw(drawFunc, colorFunc);
  },

  add: function(curCell) {
    var field = this.field;
    _.each(curCell.pos, function(pos) {
      field[pos.y][pos.x].flag = true;
      field[pos.y][pos.x].color = curCell.color;
    });
  },

  remove: function() {
    var field = this.field;
    var emptyLine = this.emptyLine;
    _.each(this.dLine, function(line) {
      field.splice(line, 1)
      field.unshift( $.extend(true, [], emptyLine) );
      ++gameBoard.line;
      $("#line").html("Line : "+gameBoard.line);
    });
    this.dLine = [];
  },
  
  canRemove: function() {
    var t;
    for (var y=0; y<this.size.y/CELL_SIZE; ++y) {
      t = true;
      for (var x=0; x<this.size.x/CELL_SIZE; ++x) {
        if (this.field[y][x].flag == false)
          t = false;
      }
      if (t) this.dLine.push(y);
    }    

    if ( _.isEmpty(this.dLine) )
      return false;
    else return true;
  },

  draw: function(drawFunc, colorFunc) {
    for (var y=0; y<this.size.y/CELL_SIZE; ++y) {
      for (var x=0; x<this.size.x/CELL_SIZE; ++x) {
        if (this.field[y][x].flag) {
          colorFunc(this.field[y][x].color);
          drawFunc(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }
}

var holdBox = {
  canvas: null,
  context: null,

  size: {x: 120, y: 60},

  lnWh: null,

  init: function() {
    this.canvas = document.getElementById("holdBox");
    if (!this.canvas || !this.canvas.getContext) {
      alert("No Canvas support in your browser...");
      return;
    }
    this.context = this.canvas.getContext("2d");
    this.context.lineWidth = 4;

    this.lnWh = this.context.lineWidth;

    this.setColor("#ffebcd");
    this.context.strokeRect(this.lnWh/2, this.lnWh/2,
                                holdBox.size.x+this.lnWh + holdBox.size.x/CELL_SIZE,
                                holdBox.size.y+this.lnWh + holdBox.size.y/CELL_SIZE);
    this.drawBackGround();
  },

  draw: function() {
    this.setColor(Tetrimino[curBlock.holdName].color);
    var fillRectM = this.fillRectM;
    _.each(Tetrimino[curBlock.holdName].pos, function(pos) {
      fillRectM(pos.x - ((board.size.x/CELL_SIZE)/2 - 1), pos.y, CELL_SIZE, CELL_SIZE);
    });
  },

  fillRectM: function(x, y, width, height) {
    holdBox.context.fillRect(x*CELL_SIZE+holdBox.lnWh+x,
                 y*CELL_SIZE+holdBox.lnWh+y,
                   width, height);
  },

  drawBackGround: function() {
    this.setColor("#000000");
    holdBox.context.fillRect(this.lnWh, this.lnWh, 
                 holdBox.size.x + holdBox.size.x/CELL_SIZE,
                 holdBox.size.y + holdBox.size.y/CELL_SIZE);
  },

  setColor: function(color) {
    holdBox.context.fillStyle = color;
    holdBox.context.strokeStyle = color;
  }
}

var nextBoxList = {
  canvas: null,
  context: null,

  nextNames: new Array,
  size: {x: 120, y: 60},

  lnWh: null,

  init: function() {
    this.canvas = document.getElementById("nextBoxList");
    if (!this.canvas || !this.canvas.getContext) {
      alert("No Canvas support in your browser...");
      return;
    }
    this.context = this.canvas.getContext("2d");
    this.context.lineWidth = 4;

    this.lnWh = this.context.lineWidth;

    for (var i=0; i<Object.keys(Tetrimino).length; ++i)
      this.nextNames.push(Object.keys( Tetrimino)[rand(Object.keys(Tetrimino).length)] );

    for (var i=0; i<this.nextNames.length-1; ++i) { 
      this.drawLine(i*3);
      this.drawBackGround(i*3);
    }
  },

  draw: function() {
    var t = 0;
    var fillRectM = this.fillRectM;
    if (gameBoard.curNum < this.nextNames.length) {
      for (var i=gameBoard.curNum+1; i<this.nextNames.length; ++i) {
        this.setColor(Tetrimino[ this.nextNames[i] ].color);
        _.each(Tetrimino[ this.nextNames[i] ].pos, function(pos) {
          fillRectM(pos.x - ((board.size.x/CELL_SIZE)/2 - 1),
                   pos.y + t,
                   CELL_SIZE, CELL_SIZE);
        });
        t += 3;
      }
    }

    for (var i=0; i<gameBoard.curNum; ++i) {
      this.setColor(Tetrimino[ this.nextNames[i] ].color);
      _.each(Tetrimino[ this.nextNames[i] ].pos, function(pos) {
        fillRectM(pos.x - ((board.size.x/CELL_SIZE)/2 - 1),
                 pos.y + t,
                 CELL_SIZE, CELL_SIZE);
      });
      t += 3;
    }
  },

  fillRectM: function(x, y, width, height) {
    nextBoxList.context.fillRect(x*CELL_SIZE+nextBoxList.lnWh+x,
                   y*CELL_SIZE+nextBoxList.lnWh+y,
                   width, height);
  },

  drawLine: function(i) {
    this.setColor("#330099");
    this.context.strokeRect(this.lnWh/2, this.lnWh/2 + i*CELL_SIZE + i,
                nextBoxList.size.x+this.lnWh + nextBoxList.size.x/CELL_SIZE,
                nextBoxList.size.y+this.lnWh + nextBoxList.size.y/CELL_SIZE);
  },

  drawBackGround: function(i) {
    this.setColor("#000000");
    nextBoxList.context.fillRect(this.lnWh, this.lnWh + i*CELL_SIZE + i, 
                   nextBoxList.size.x + nextBoxList.size.x/CELL_SIZE,
                   nextBoxList.size.y + nextBoxList.size.y/CELL_SIZE);
  },

  setColor: function(color) {
    nextBoxList.context.fillStyle = color;
    nextBoxList.context.strokeStyle = color;
  }
}

var curBlock = {
  cell: new Object,
  shade: new Array,
  holdName: null,
  canHold: true,
  
  init: function() {
    curBlock.cell = $.extend(true, {}, Tetrimino[ nextBoxList.nextNames[gameBoard.curNum] ]);
    var shade = this.shade;
    _.each(this.cell.pos, function(pos) {
      shade.push({x: pos.x, y: pos.y});
    });
  },

  update: function(drawFunc, colorFunc, alphaFunc) {
    if ( this.canFall() ) this.fall();
    else {
      board.add(this.cell);
      this.cell = gameBoard.callNextBlock();
      this.canHold = true;
      for (var i=0; i<this.cell.pos.length; ++i)
        this.shade[i] = {x: this.cell.pos[i].x, y: this.cell.pos[i].y};
      for (var i=0; i<nextBoxList.nextNames.length-1; ++i)
        nextBoxList.drawBackGround(i*3);
      nextBoxList.draw();
    }

    this.draw(drawFunc, colorFunc);
    this.drawShade(drawFunc, alphaFunc);
  },

  draw: function(drawFunc, colorFunc) {
    colorFunc(this.cell.color);
    _.each(this.cell.pos, function(pos) {
      drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
    });
  },
  
  drawShade: function(drawFunc, alphaFunc) {
    alphaFunc(0.4);
    this.shadeAcuPos();
    _.each(this.shade, function(pos) {
      drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
    });
    alphaFunc(1.0);
  },

  shadeAcuPos: function() {
    this.shade = $.extend(true, [], this.cell.pos);

    while (canFall())
      fall();

    function canFall() {
      var result = true;
      _.each(curBlock.shade, function(pos) {
        //Field
        if ( (board.size.y/CELL_SIZE-1 - pos.y) == 0 )
          result = false;

        //SolidBlock
        for (var y=0; y<board.size.y/CELL_SIZE; ++y) {
          if (pos.y < y) {
            if (board.field[y][pos.x].flag && (y-pos.y) <= 1)
              result = false;
          }
        }
      });

      return result;
    }

    function fall() {
      _.each(curBlock.shade, function(pos) {
        ++pos.y;
      });
    }
  },

  clear: function(clearFunc) {
    _.each(this.cell.pos, function(pos) {
      clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
    });
    _.each(this.shade, function(pos) {
      clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
    });
  },

  move: function(e, drawFunc, colorFunc, alphaFunc) {
    switch (e.keyCode) {
    case 37: 
      if ( this.canSlide("left") )
        this.slide("left");
      break;
    case 38:
      while ( this.canFall() )
        this.fall();  
      gameBoard.drawBackGround();
      this.update(drawFunc, colorFunc, alphaFunc);
      board.update(drawFunc, colorFunc);
      break;
    case 39: 
      if ( this.canSlide("right") )
        this.slide("right");
      break;  
    case 40:
      if ( this.canFall() )
        this.fall();
      break;
    }

    switch (e.charCode) {
    case 32:
      if (this.canHold) {
        this.hold();
        holdBox.drawBackGround();
        holdBox.draw();
        for (var i=0; i<nextBoxList.nextNames.length-1; ++i)
          nextBoxList.drawBackGround(i*3);
        nextBoxList.draw();
      }
      break;
    case 99:
      if ( this.canTurn("right") )
        this.turn("right");
      break;
    case 120:
      if ( this.canTurn("left") )
        this.turn("left");
      break;
    }
  },

  hold: function() {
    var t;

    if (this.holdName == null) {
      this.holdName = nextBoxList.nextNames[gameBoard.curNum];
      nextBoxList.nextNames[gameBoard.curNum] = Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)];

      ++gameBoard.curNum;
      if (gameBoard.curNum >= Object.keys(Tetrimino).length)
        gameBoard.curNum = 0;
    } else {
      t = this.holdName;
      this.holdName =  nextBoxList.nextNames[gameBoard.curNum];
      nextBoxList.nextNames[gameBoard.curNum] = t;
    }  

    this.init();
    this.canHold = false;
  },

  slide: function(direction) {
    if (direction=="right")     ++this.cell.base.x;
    else if (direction=="left") --this.cell.base.x;

    _.each(this.cell.pos, function(pos) {
      if (direction=="right")     ++pos.x;
      else if (direction=="left") --pos.x;
    });
  },

  //i
  cx: null, cy: null,
  turn: function(direction) {
    for (var i=0; i<this.cell.pos.length; ++i) {
      if (direction=="right") {
        this.cx = (this.cell.pos[i].x-this.cell.base.x) * cos(PI/2) -
                (this.cell.pos[i].y-this.cell.base.y) * sin(PI/2) + this.cell.base.x;
        this.cy = (this.cell.pos[i].x-this.cell.base.x) * sin(PI/2) +
              (this.cell.pos[i].y-this.cell.base.y) * cos(PI/2) + this.cell.base.y;
      } else if (direction=="left") {
        this.cx = (this.cell.pos[i].x-this.cell.base.x) * cos(-PI/2) -
                (this.cell.pos[i].y-this.cell.base.y) * sin(-PI/2) + this.cell.base.x;
        this.cy = (this.cell.pos[i].x-this.cell.base.x) * sin(-PI/2) +
                (this.cell.pos[i].y-this.cell.base.y) * cos(-PI/2) + this.cell.base.y;
      }
      this.cell.pos[i].x = this.cx;
      this.cell.pos[i].y = this.cy;
    }
  },

  fall: function() {
    _.each(this.cell.pos, function(pos) {
      ++pos.y;
    });
    ++this.cell.base.y;
  },

  canFall: function() {
    var result = true;
    _.each(this.cell.pos, function(pos) {
      //Field
      if ( (board.size.y/CELL_SIZE-1 - pos.y) == 0 )
        result = false;

      //SolidBlock
      for (var y=0; y<board.size.y/CELL_SIZE; ++y) {
        if (pos.y < y) {
          if (board.field[y][pos.x].flag && (y-pos.y) <= 1)
            result= false;
        }
      }
    });

    return result;
  },

  canSlide: function(direction) {
    var result = true;
    _.each(this.cell.pos, function(pos) {
      if (direction=="right") {
        //Field
        if ( (board.size.x/CELL_SIZE-1 - pos.x) == 0 )
          result = false;

        //SolidBlock
        for (var x=0; x<board.size.x/CELL_SIZE; ++x) {
          if (pos.x < x) {
            if (board.field[pos.y][x].flag && (x-pos.x) <= 1)
              result = false;
          }
        }
      } else if (direction=="left") {
        //Field
        if (pos.x == 0 )
          result = false;

        //SolidBlock
        for (var x=0; x<board.size.x/CELL_SIZE; ++x) {
          if (pos.x > x) {
            if (board.field[pos.y][x].flag && (pos.x-x) <= 1)
              result = false;
          }
        }
      }
    });

    return result;
  },

  canTurn: function(direction) {
    var cx = this.cx;
    var cy = this.cy;
    var cell = this.cell;
    var result = true;
    _.each(this.cell.pos, function(pos) {
      if (direction=="right") {
        cx = (pos.x-cell.base.x) * cos(PI/2) -
                          (pos.y-cell.base.y) * sin(PI/2) + cell.base.x;
        cy = (pos.x-cell.base.x) * sin(PI/2) +
                          (pos.y-cell.base.y) * cos(PI/2) + cell.base.y;
      } else if (direction=="left") {
        cx = (pos.x-cell.base.x) * cos(-PI/2) -
                          (pos.y-cell.base.y) * sin(-PI/2) + cell.base.x;
        cy = (pos.x-cell.base.x) * sin(-PI/2) +
                          (pos.y-cell.base.y) * cos(-PI/2) + cell.base.y;
      }

      //Field
      if ( (board.size.x/CELL_SIZE-1 - cx) < 0 || cx < 0 ||
         (board.size.y/CELL_SIZE-1 - cy) < 0 || cy < 0 )
        result = false;

      //SolidBlock
      if (board.field[cy][cx].flag)
        result = false;
    });

    return result;
  }
};

var gameBoard = {
  canvas: null,
  context: null,
  
  isPlaying: true,
  curNum: 0,

  lnWh: null,

  line: 0,

  init: function() {
    this.canvas = document.getElementById("tetris");
    if (!this.canvas || !this.canvas.getContext) {
      alert("No Canvas support in your browser...");
      return;
    }
    this.context = this.canvas.getContext("2d");
    this.context.lineWidth = 4;

    this.lnWh = this.context.lineWidth;

    this.setColor("#003300");
    this.context.strokeRect(this.lnWh/2, this.lnWh/2,
                                board.size.x+this.lnWh + board.size.x/CELL_SIZE,
                                board.size.y+this.lnWh + board.size.y/CELL_SIZE);
    this.drawBackGround();

    this.run();
  },

  run: function() {
    $("#start").on("click", function() {
      $(this).css({display: "none"});

      board.init();
      gameBoard.blockAccurate();
      curBlock.init();

      $("html").keypress(function(e) {
        curBlock.clear(gameBoard.clearRectM);
        curBlock.move(e, gameBoard.fillRectM, gameBoard.setColor, gameBoard.alphaChange);

        gameBoard.drawBackGround();

        board.draw(gameBoard.fillRectM, gameBoard.setColor);

        curBlock.draw(gameBoard.fillRectM, gameBoard.setColor);
        curBlock.drawShade(gameBoard.fillRectM, gameBoard.alphaChange);
      });

      curBlock.draw(gameBoard.fillRectM, gameBoard.setColor);
      curBlock.drawShade(gameBoard.fillRectM, gameBoard.alphaChange);
      nextBoxList.draw();

      setTimeout(function() { gameBoard.main() }, speed);    
    });

    $("#stop").on("click", function() { gameBoard.isPlaying = false; });
    $("#resume").on("click", function() {
      gameBoard.isPlaying = true;
      gameBoard.main();    
    });
  },

  main: function() {
    this.update();
    if (this.isPlaying) setTimeout(function() { gameBoard.main() }, speed);
  },

  update: function() {
    this.drawBackGround();

    curBlock.update(this.fillRectM, this.setColor, this.alphaChange);
    board.update(this.fillRectM, this.setColor);
  },

  drawBackGround: function() {
    this.setColor("#000000");
    gameBoard.context.fillRect(this.lnWh, this.lnWh, 
                   board.size.x + board.size.x/CELL_SIZE,
                   board.size.y + board.size.y/CELL_SIZE);
  },

  fillRectM: function(x, y, width, height) {
    gameBoard.context.fillRect(x*CELL_SIZE+gameBoard.lnWh+x, y*CELL_SIZE+gameBoard.lnWh+y, width, height);
  },

  clearRectM: function(x, y, width, height) {
    gameBoard.context.clearRect(x*CELL_SIZE+gameBoard.lnWh+x, y*CELL_SIZE+gameBoard.lnWh+y, width, height);
  },

  setColor: function(color) {
    gameBoard.context.fillStyle = color;
    gameBoard.context.strokeStyle = color;
  },

  alphaChange: function(num) {
    gameBoard.context.globalAlpha = num;
  },

  callNextBlock: function() {
    nextBoxList.nextNames[this.curNum] = Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)];
    ++this.curNum;

    if (this.curNum >= Object.keys(Tetrimino).length)
      this.curNum = 0;

    return $.extend(true, {}, Tetrimino[nextBoxList.nextNames[this.curNum]]);
  },

  blockAccurate: function() {
    _.each(Object.keys(Tetrimino), function(color) {
      _.each(Tetrimino[color].pos, function(pos) {
        pos.x += (board.size.x/CELL_SIZE) / 2 - 1;
      });

      Tetrimino[color].base.x += (board.size.x/CELL_SIZE) /2 - 1;
    });
  }
}; 

$(function() {
  holdBox.init();
  gameBoard.init();
  nextBoxList.init();
});

