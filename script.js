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
		var i = 0, o = 0;
		for (i; i<=this.size.y/CELL_SIZE+1; ++i) {
			this.xAryList.push(new Array);	
			this.xAryList[i].push(-1);
			for (o; o<this.size.x/CELL_SIZE; ++o) this.xAryList[i].push(false);
			this.xAryList[i].push(this.size.x/CELL_SIZE);
			o = 0;
		}

		//yAryList
		var i = 0, o = 0;
		for (i; i<=this.size.x/CELL_SIZE+1; ++i) {
			this.yAryList.push(new Array);	
			this.yAryList[i].push(-1);
			for (o; o<this.size.y/CELL_SIZE; ++o) this.yAryList[i].push(false);
			this.yAryList[i].push(this.size.y/CELL_SIZE);
			o = 0;
		}
	},

	add: function(blockCell) {
	//	console.log(blockCell);
		for each (var pos in blockCell) {
			board.xAryList[pos.y][pos.x] = pos.x;
			board.yAryList[pos.x][pos.y] = pos.y;
		}
	}

}

//きもい
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
		for each (var pos in this.cell.pos) {
			for (var i=pos.y; i<board.xAryList.length; ++i) {
				if (board.yAryList[pos.x][pos.y+2] != false)
					return false;
			}
		}
		return true;
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
			manager.blockAccurate();

			for (var i=0; i<Object.keys(BLOCK).length; ++i)
				nextNames.push(Object.keys(BLOCK)[rand(Object.keys(BLOCK).length)]);

		//	console.log(curBlock.cell);
			curBlock.cell = $.extend(true, BLOCK[ nextNames[manager.curNum] ]);
	//		console.log(curBlock.cell);
	//		console.log(curBlock.cell.pos);

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
	/*
		console.log(BLOCK);
		console.log(board);
*/

		if (curBlock.isFloat()) {
			curBlock.clear(this.clearRectM);
			curBlock.fall();
			curBlock.draw(this.fillRectM);
		} else {
			console.log(curBlock.cell);
			board.add(curBlock.cell);
			curBlock.cell = this.callNextBlock();
		}
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

