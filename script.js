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
			{x: 1, y: 0},
			{x: 2, y: 0},
			{x: 3, y: 0},
			{x: 4, y: 0},
		],
		base: {x: 1, y: 0},
		color: "#02e4e6"
	}
};

//どこに落ちるか表示
//スペア

var PI = Math.PI;
var	CELL_SIZE = 30;
var	speed = 1000;
var nextNames = new Array;

function cos(rad) { return ~~(Math.cos(rad)); } //バグの温床
function sin(rad) { return ~~(Math.sin(rad)); } //バグの温床
function rand(num) { return Math.random() * num | 0; } //return x < num

//boardの名前変えるべき
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
		for each (var pos in curCell.pos) {
			console.log(pos.y);
			this.field[pos.y][pos.x].flag = true;
			this.field[pos.y][pos.x].color = curCell.color;
			console.log(this.field[pos.y]);
		}
	},

	remove: function() {
		for each (var line in this.dLine) {
			this.field.splice(line, 1)
			this.field.unshift( $.extend(true, [], this.emptyLine) );
		}
		this.dLine = [];
	},
	
	//もうすこし きれいにしたい
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

var curBlock = {
	cell: new Object,

	update: function(drawFunc, colorFunc) {
		if ( this.canFall() ) this.fall();
		else {
			board.add(this.cell);
			this.cell = manager.callNextBlock();
		}

		this.draw(drawFunc, colorFunc);
	},

	draw: function(drawFunc, colorFunc) {
		colorFunc(this.cell.color);
		for each (var pos in this.cell.pos)
			drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
	},

	clear: function(clearFunc) {
		for each (var pos in this.cell.pos)
			clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
	},

	move: function(e) {
		switch (e.keyCode) {
		case 37: 
			if ( this.canSlide("left") )
				this.slide("left");
			break;
		case 38:
			/*
			for each (var pos in this.cell.pos) {
				if (pos.y > board.size.y/CELL_SIZE) {
					break;
				}
				++pos.y
			}*/
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

	slide: function(direction) {
		if (direction=="right")     ++this.cell.base.x;
		else if (direction=="left") --this.cell.base.x;

		for each (var pos in this.cell.pos) {
			if (direction=="right")     ++pos.x;
			else if (direction=="left") --pos.x;
		}
	},
	//cx, cyなんとかしたいかな
	cx: null, cy: null,
	turn: function(direction) {
		for each (var pos in this.cell.pos) {
			if (direction=="right") {
				this.cx = (pos.x-this.cell.base.x) * cos(PI/2) -
					 (pos.y-this.cell.base.y) * sin(PI/2) + this.cell.base.x;
				this.cy = (pos.x-this.cell.base.x) * sin(PI/2) +
					 (pos.y-this.cell.base.y) * cos(PI/2) + this.cell.base.y;
			} else if (direction=="left") {
				this.cx = (pos.x-this.cell.base.x) * cos(-PI/2) -
					 (pos.y-this.cell.base.y) * sin(-PI/2) + this.cell.base.x;
				this.cy = (pos.x-this.cell.base.x) * sin(-PI/2) +
					 (pos.y-this.cell.base.y) * cos(-PI/2) + this.cell.base.y;
			}
			pos.x = this.cx;
			pos.y = this.cy;
		}
	},

	fall: function() {
		for each (var pos in this.cell.pos)
			++pos.y;
		++this.cell.base.y;
	},

	canFall: function() {
		for each (var pos in this.cell.pos) {
			//Field
			if ( (board.size.y/CELL_SIZE-1 - pos.y) == 0 )
				return false;

			//SolidBlock
			for (var y=0; y<board.size.y/CELL_SIZE; ++y) {
				if (pos.y < y) {
					if (board.field[y][pos.x].flag && (y-pos.y) <= 1)
						return false;
				}
			}
		}

		return true;

		//fieldチェックの関数とブロックの上かの判定関数をつくって
		//わけてみたい
	},

	canSlide: function(direction) {
		for each (var pos in this.cell.pos) {
			if (direction=="right") {
				//Field
				if ( (board.size.x/CELL_SIZE-1 - pos.x) == 0 )
					return false;

				//SolidBlock
				for (var x=0; x<board.size.x/CELL_SIZE; ++x) {
					if (pos.x < x) {
						if (board.field[pos.y][x].flag && (x-pos.x) <= 1)
							return false;
					}
				}
			} else if (direction=="left") {
				//Field
				if (pos.x == 0 )
					return false;

				//SolidBlock
				for (var x=0; x<board.size.x/CELL_SIZE; ++x) {
					if (pos.x > x) {
						if (board.field[pos.y][x].flag && (pos.x-x) <= 1)
							return false;
					}
				}
			}
		}

		return true;
	},

	canTurn: function(direction) {
		for each (var pos in this.cell.pos) {
			if (direction=="right") {
				this.cx = (pos.x-this.cell.base.x) * cos(PI/2) -
					      (pos.y-this.cell.base.y) * sin(PI/2) + this.cell.base.x;
				this.cy = (pos.x-this.cell.base.x) * sin(PI/2) +
					 	  (pos.y-this.cell.base.y) * cos(PI/2) + this.cell.base.y;
			} else if (direction=="left") {
				this.cx = (pos.x-this.cell.base.x) * cos(-PI/2) -
						  (pos.y-this.cell.base.y) * sin(-PI/2) + this.cell.base.x;
				this.cy = (pos.x-this.cell.base.x) * sin(-PI/2) +
						  (pos.y-this.cell.base.y) * cos(-PI/2) + this.cell.base.y;
			}

			//Field
			if ( (board.size.x/CELL_SIZE-1 - this.cx) < 0 || this.cx < 0 ||
				 (board.size.y/CELL_SIZE-1 - this.cy) < 0 || this.cy < 0 )
				return false;

			//SolidBlock
			if (board.field[this.cy][this.cx].flag)
				return false;
		}

		return true;
	}
};

var manager = {
	canvas: null,
	context: null,
	
	isPlaying: true,
	curNum: 0,

	init: function() {
		this.canvas = document.getElementById("tetorisu");
		if (!this.canvas || !this.canvas.getContext) {
			alert("No Canvas support in your browser...");
			return;
		}
		this.context = this.canvas.getContext("2d");

		this.run();
	},

	run: function() {
		$("#start").on("click", function() {
			$(this).css({display: "none"});

			board.init();
			manager.blockAccurate();

			for (var i=0; i<Object.keys(Tetrimino).length; ++i)
				nextNames.push(Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)]);

			curBlock.cell = $.extend(true, {}, Tetrimino[ nextNames[manager.curNum] ]);

			$("html").keypress(function(e) {
				curBlock.clear(manager.clearRectM);
				curBlock.move(e);
				curBlock.draw(manager.fillRectM, manager.setColor);
			});

			curBlock.draw(manager.fillRectM, manager.setColor);
			setTimeout(function() { manager.main() }, speed);		
		});

		$("#stop").on("click", function() { manager.isPlaying = false; });
		$("#resume").on("click", function() {
			manager.isPlaying = true;
			manager.main();		
		});
	},

	main: function() {
		this.update();
		if (this.isPlaying) setTimeout(function() { manager.main() }, speed);
	},

	update: function() {
		this.clearView();

		curBlock.update(this.fillRectM, this.setColor);
		board.update(this.fillRectM, this.setColor);

		console.log(board);
	},

	fillRectM: function(x, y, width, height) {
		manager.context.fillRect(x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	clearRectM: function(x, y, width, height) {
		manager.context.clearRect(x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	setColor: function(color) {
		manager.context.fillStyle = color;
	},

	callNextBlock: function() {
		nextNames[this.curNum] = Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)];
		++this.curNum;

		if (!(this.curNum < Object.keys(Tetrimino).lenth))
			this.curNum = 0;

		return $.extend(true, {}, Tetrimino[nextNames[this.curNum]]);
	},

	blockAccurate: function() {
		for each(var color in Object.keys(Tetrimino)) {
			for each (var pos in Tetrimino[color].pos)
				pos.x += (board.size.x/CELL_SIZE) / 2 - 1;

			Tetrimino[color].base.x += (board.size.x/CELL_SIZE) /2 - 1;
		}
	},

	clearView: function() {
		this.clearRectM(0, 0, board.size.x, board.size.y);
	}
}; 

$(function() {
	manager.init();
});

