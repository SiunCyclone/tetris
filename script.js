var BLOCK = {
	blue: {
		pos: [
			{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 2, y: 0},
			{x: 0, y: 1}
		],
		base: {x: 1, y: 0}, //this.pos[1]ってしたい つかポインタみたいに。
		color: "#6699ff"	
	},
	yellow: {
		pos: [
			{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 0, y: 1},
			{x: 1, y: 1}
		],
		base: {x: 1, y: 1}
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

	cellList: new Array(),

	init: function() {
		for (var i=0; i<=this.size.y/CELL_SIZE+1; ++i) {
			this.cellList.push(new Array);
			for (var o=0; o<=this.size.x/CELL_SIZE+1; ++o)
				this.cellList[i].push(false);
		}
	}

}

var LINE_NUM = board.size.y/CELL_SIZE;

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
			if (this.isFloat())
				this.fall();
			break;
		}
		switch (e.charCode) {
		case 99:  this.turn("right"); break;
		case 120: this.turn("left"); break
		}
	},

	//汚いです
	slide: function(direction) {
		if (this.isFloat()) {
			if (direction=="right")
				++this.cell.base.x;
			else if (direction=="left")
				--this.cell.base.x;

			for each (var pos in this.cell.pos) {
				if (direction=="right")
					++pos.x;
				else if (direction=="left")
					--pos.x;
			}
		}
	},
	//cx, cyなんとかしたいかな
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
	isFloat: function() {
		for each (var pos in this.cell.pos)
			if (pos.y >= LINE_NUM-1) {
				//ぴたっっととまっちゃう
				 return false;
			}
		return true;
	/*	switch (where) {
		case "under":
			for each (var pos in this.cell.pos)
				if (pos.y >= LINE_NUM-1) return false;
			return true;
			break;
		case "left":
			break;
		case "right":
			break;*/
	}
};

var manager = {
	canvas: null,
	context: null,

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
			
			for (var i=0; i<Object.keys(BLOCK).length; ++i)
				nextNames.push(Object.keys(BLOCK)[rand(Object.keys(BLOCK).length)]);

			curBlock.cell = $.extend(true, BLOCK[ nextNames[manager.curNum] ]);

			$("html").keypress(function(e) {
				curBlock.clear(manager.clearRectM);
				curBlock.move(e);
				curBlock.draw(manager.fillRectM);
			});

			setTimeout(function() { manager.main() }, speed);		
		});
	},

	main: function() {
		this.update();
		setTimeout(function() { manager.main() }, speed);		
	},

	update: function() {
		if (curBlock.isFloat()) {
			curBlock.clear(this.clearRectM);
			curBlock.fall();
			curBlock.draw(this.fillRectM);
		} else 
			curBlock.cell = this.callNextBlock();
	},

	fillRectM: function(x, y, width, height) {
		manager.context.fillRect(board.size.x/2-CELL_SIZE + x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	clearRectM: function(x, y, width, height) {
		manager.context.clearRect(board.size.x/2-CELL_SIZE + x*CELL_SIZE, y*CELL_SIZE, width, height);
	},

	callNextBlock: function() {
		nextNames[this.curNum] = Object.keys(BLOCK)[rand(Object.keys(BLOCK).length)];
		++this.curNum;

		if (!(this.curNum < Object.keys(BLOCK).lenth))
			this.curNum = 0;

		return $.extend(true, BLOCK[nextNames[this.curNum]]);
	}
}; 
$(function() {
	manager.init();
});

