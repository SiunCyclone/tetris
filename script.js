var BLOCK = {
	blue: {
		pos: [
			{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 2, y: 0},
			{x: 0, y: 1}
		],
		base: {x: 1, y: 0},
		color: "#6699ff"	
	},
	yellow: {
		pos: [
			{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 0, y: 1},
			{x: 1, y: 1}
		],
		base: {x: 0.5, y: 0.5},
		color: "yellow"
	}
};

var PI = Math.PI;
var	CELL_SIZE = 30;
var	speed = 1000;
var nextNames = new Array;

function cos(rad) { return ~~(Math.cos(rad)); }
function sin(rad) { return ~~(Math.sin(rad)); }
function rand(num) { return Math.random() * num | 0; } //return x < num

var board = {
	size: {x: 600, y: 300},

	xAryList: new Array(),
	yAryList: new Array(),

	init: function() {
		//xAryList
		for (var i=0; i<this.size.y/CELL_SIZE; ++i) {
			this.xAryList.push(new Array);	
			for (var o=0; o<this.size.x/CELL_SIZE-2; ++o) this.xAryList[i].push(false);
		}

		//yAryList
		for (var i=0; i<this.size.x/CELL_SIZE; ++i) {
			this.yAryList.push(new Array);	
			for (var o=0; o<this.size.y/CELL_SIZE-2; ++o) this.yAryList[i].push(false);
		}
	},

	add: function(blockCell) {
		for each (var pos in blockCell) {
			board.xAryList[pos.y][pos.x] = pos.x;
			board.yAryList[pos.x][pos.y] = pos.y;
		}
	},

	remove: function(blockCell) {
		for each (var pos in blockCell) {
			board.xAryList[pos.y][pos.x] = false;
			board.yAryList[pos.x][pos.y] = false;
		}
	}
}

//きもい
var LINE_NUM = board.size.y/CELL_SIZE;

var BOARD_MAX_X = board.size.x/CELL_SIZE-1;
var BOARD_MAX_Y = board.size.y/CELL_SIZE-1;

var cx, cy;
var curBlock = {
	cell: new Object,

	draw: function(drawFunc) {
		for each (var pos in this.cell.pos) {
			drawFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
		}
	},

	clear: function(clearFunc) {
		for each (var pos in this.cell.pos)
			clearFunc(pos.x, pos.y, CELL_SIZE, CELL_SIZE);
	},

	move: function(e) {
		switch (e.keyCode) {
		case 37: this.slide("left"); break;
		case 38:
			/*
			for each (var pos in this.cell.pos) {
				if (pos.y > board.size.y/CELL_SIZE) {
					break;
				}
				++pos.y
			}*/
			break;
		case 39: this.slide("right"); break;	
		case 40:
			if ( this.canFall() )
				this.fall();
			break;
		}
		switch (e.charCode) {
		case 99:  this.turn("right"); break;
		case 120: this.turn("left"); break
		}
	},

	slide: function(direction) {
		if (this.canSlide(direction)) {
			for each (var pos in this.cell.pos) {
				if (direction=="right")     ++pos.x;
				else if (direction=="left") --pos.x;
			}
		}
	},
	//cx, cyなんとかしたいかな
	//FIXME
	turn: function(direction) {
		for each (var pos in this.cell.pos) {
			if (direction=="right") {
				cx = (pos.x-this.cell.base.x) * cos(PI/2) -
					 (pos.y-this.cell.base.y) * sin(PI/2) + this.cell.base.x;
				cy = (pos.x-this.cell.base.x) * sin(PI/2) +
					 (pos.y-this.cell.base.y) * cos(PI/2) + this.cell.base.y;
			} else if (direction=="left") {
				cx = (pos.x-this.cell.base.x) * cos(-PI/2) -
					 (pos.y-this.cell.base.y) * sin(-PI/2) + this.cell.base.x;
				cy = (pos.x-this.cell.base.x) * sin(-PI/2) +
					 (pos.y-this.cell.base.y) * cos(-PI/2) + this.cell.base.y;
			}
			pos.x = cx;
			pos.y = cy;
		}
	},

	fall: function() {
		for each (var pos in this.cell.pos)
			++pos.y;
		++this.cell.base.y;
	},

	canFall: function() {
		for each (var pos in this.cell.pos) {
			if ( (BOARD_MAX_Y - pos.y) == 0 )
				return false;

			for each ( var min in _.compact(board.yAryList[pos.x]) ) {
				if (min!=BOARD_MAX_Y && pos.y < min && (min-pos.y) <= 1)
					return false;
			}
		}

		return true;
	},

	canSlide: function(direction) {
		for each (var pos in this.cell.pos) {
			if (direction=="right") {
				if ( (BOARD_MAX_X - pos.x) == 0 )
					return false;

				for each ( var min in _.compact(board.xAryList[pos.y]) ) {
					if (min!=BOARD_MAX_X && pos.x < min && (min-pos.x) <= 1)
						return false;
				}
			} else if (direction=="left") {
				if (pos.x == 0 )
					return false;

				for each ( var max in _.compact(board.xAryList[pos.y]) ) {
					if (max!=0 && pos.x > max && (pos.x-max) <= 1)
						return false;
				}
			}

			for each ( var min in _.compact(board.xAryList[pos.y]) ) {
				if (min!=BOARD_MAX_Y && pos.y < min && (min-pos.y) <= 1)
					return false;
			}
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
		// start押しまくったらバグ
		$("#start").on("click", function() {
			board.init();
			manager.blockAccurate();








			for (var i=0; i<Object.keys(BLOCK).length; ++i)
				nextNames.push(Object.keys(BLOCK)[rand(Object.keys(BLOCK).length)]);

			curBlock.cell = $.extend(true, BLOCK[ nextNames[manager.curNum] ]);

			$("html").keypress(function(e) {
				curBlock.clear(manager.clearRectM);
				curBlock.move(e);
				curBlock.draw(manager.fillRectM);
			});

			curBlock.draw(manager.fillRectM);
			setTimeout(function() { manager.main() }, speed);		
		});

		$("#stop").on("click", function() { manager.isPlaying = false; });
	},

	main: function() {
		this.update();
		if (this.isPlaying)
			setTimeout(function() { manager.main() }, speed);
	},

	update: function() {
		if ( curBlock.canFall() ) {
			curBlock.clear(this.clearRectM);
			curBlock.fall();
			curBlock.draw(this.fillRectM);
		} else {
			board.add(curBlock.cell.pos);
			curBlock.cell = this.callNextBlock();
		}

		console.log(board);
		console.log(curBlock.cell.pos);

	},

	fillRectM: function(x, y, width, height) {
		manager.context.fillRect(x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	clearRectM: function(x, y, width, height) {
		manager.context.clearRect(x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	callNextBlock: function() {
		nextNames[this.curNum] = Object.keys(BLOCK)[rand(Object.keys(BLOCK).length)];
		++this.curNum;

		if (!(this.curNum < Object.keys(BLOCK).lenth))
			this.curNum = 0;

		return $.extend(true, BLOCK[nextNames[this.curNum]]);
	},

	blockAccurate: function() {
		for each(var color in Object.keys(BLOCK)) {
			for each (var pos in BLOCK[color].pos)
				pos.x += (board.yAryList.length-2)/2 - 1;
		}
	}
}; 

$(function() {
	manager.init();
});

