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
var	CELL_SIZE = 30;
var	speed = 500;
var nextNames = new Array;

function cos(rad) { return ~~(Math.cos(rad)); } //バグの温床
function sin(rad) { return ~~(Math.sin(rad)); } //バグの温床
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
		for each (var pos in curCell.pos) {
			this.field[pos.y][pos.x].flag = true;
			this.field[pos.y][pos.x].color = curCell.color;
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
	shade: new Array,
	spareName: null,
	canSpare: true,
	
	init: function() {
		curBlock.cell = $.extend(true, {}, Tetrimino[ nextNames[manager.curNum] ]);
		for each (var pos in this.cell.pos)
			this.shade.push({x: pos.x, y: pos.y});
	},

	update: function(drawFunc, colorFunc, alphaFunc) {
		if ( this.canFall() ) this.fall();
		else {
			board.add(this.cell);
			this.cell = manager.callNextBlock();
			for (var i=0; i<this.cell.pos.length; ++i)
				this.shade[i] = {x: this.cell.pos[i].x, y: this.cell.pos[i].y};
			this.canSpare = true;
		}

		this.draw(drawFunc, colorFunc);
		this.drawShade(drawFunc, alphaFunc);
	},

	draw: function(drawFunc, colorFunc) {
		colorFunc(this.cell.color);
		for each (var pos in this.cell.pos)
			drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
	},
	
	drawShade: function(drawFunc, alphaFunc) {
		alphaFunc(0.4);
		this.shadeAcuPos();
		for each (var pos in this.shade)
			drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
		alphaFunc(1.0);
	},

	shadeAcuPos: function() {
		this.shade = $.extend(true, [], this.cell.pos);

		while (canFall())
			fall();

		function canFall() {
			for each (var pos in curBlock.shade) {
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
		}

		function fall() {
			for each (var pos in curBlock.shade)
				++pos.y;
		}
	},

	clear: function(clearFunc) {
		for each (var pos in this.cell.pos)
			clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
		for each (var pos in this.shade)
			clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
	},

	move: function(e) {
		switch (e.keyCode) {
		case 37: 
			if ( this.canSlide("left") )
				this.slide("left");
			break;
		case 38:
			//まだ動ける
			while ( this.canFall() )
				this.fall();	
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
			if (this.canSpare)
				this.spare();
			//スペア切り替え
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

	spare: function() {
		if (this.spareName != null) {
			if (manager.curNum >= Object.keys(Tetrimino).length)
				nextNames[0] = this.spareName;
			else nextNames[manager.curNum+1] = this.spareName;
		}
		this.spareName = nextNames[manager.curNum];
		nextNames[manager.curNum] = Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)];
		++manager.curNum;

		if (manager.curNum >= Object.keys(Tetrimino).length)
			manager.curNum = 0;

		this.init();
		this.canSpare = false;
	},

	slide: function(direction) {
		if (direction=="right")     ++this.cell.base.x;
		else if (direction=="left") --this.cell.base.x;

		for each (var pos in this.cell.pos) {
			if (direction=="right")     ++pos.x;
			else if (direction=="left") --pos.x;
		}
	},

	//i にしなくていい
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
		this.context.strokeRect(1, 1, 
								board.size.x+2 + board.size.x/CELL_SIZE,
								board.size.y+2 + board.size.y/CELL_SIZE);

		this.run();
	},

	run: function() {
		$("#start").on("click", function() {
			$(this).css({display: "none"});

			board.init();
			manager.blockAccurate();

			for (var i=0; i<Object.keys(Tetrimino).length; ++i)
				nextNames.push(Object.keys( Tetrimino)[rand(Object.keys(Tetrimino).length)] );

			curBlock.init();

			$("html").keypress(function(e) {
				curBlock.clear(manager.clearRectM);
				curBlock.move(e);
				curBlock.draw(manager.fillRectM, manager.setColor);
				curBlock.drawShade(manager.fillRectM, manager.alphaChange);
			});

			curBlock.draw(manager.fillRectM, manager.setColor);
			curBlock.drawShade(manager.fillRectM, manager.alphaChange);
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

		curBlock.update(this.fillRectM, this.setColor, this.alphaChange);
		board.update(this.fillRectM, this.setColor);
	},

	fillRectM: function(x, y, width, height) {
		manager.context.fillRect(x*CELL_SIZE+2+x, y*CELL_SIZE+2+y, width, height);
	},

	clearRectM: function(x, y, width, height) {
		manager.context.clearRect(x*CELL_SIZE+2+x, y*CELL_SIZE+2+y, width, height);
	},

	clearView: function() {
		this.clearRectM(0, 0,
						board.size.x + board.size.x/CELL_SIZE,
						board.size.y + board.size.y/CELL_SIZE);
	},

	setColor: function(color) {
		manager.context.fillStyle = color;
	},

	alphaChange: function(num) {
		manager.context.globalAlpha = num;
	},

	callNextBlock: function() {
		nextNames[this.curNum] = Object.keys(Tetrimino)[rand(Object.keys(Tetrimino).length)];
		++this.curNum;

		if (this.curNum >= Object.keys(Tetrimino).length)
			this.curNum = 0;

		return $.extend(true, {}, Tetrimino[nextNames[this.curNum]]);
	},

	blockAccurate: function() {
		for each(var color in Object.keys(Tetrimino)) {
			for each (var pos in Tetrimino[color].pos)
				pos.x += (board.size.x/CELL_SIZE) / 2 - 1;

			Tetrimino[color].base.x += (board.size.x/CELL_SIZE) /2 - 1;
		}
	}
}; 

$(function() {
	manager.init();
});

