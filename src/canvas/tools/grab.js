/**
 * Grab tool
 */
(function (TeledrawCanvas) {
	var cursorUp = "hand, grab, -moz-grab, -webkit-grab, move",
		cursorDown = "grabbing, -moz-grabbing, -webkit-grabbing, move";
	
	var Grab = TeledrawCanvas.Tool.createTool("grab", cursorUp);

	Grab.prototype.move = function (down, from, to) {
		var self = this;
		if (down) {
			clearTimeout(this._clearDeltasId);
			cancelAnimationFrame(this._momentumId);
			this.dx = to.xd - from.xd;
			this.dy = to.yd - from.yd;
			this.canvas.pan(this.dx, this.dy);
			this._clearDeltasId = setTimeout(function () {
				self.dx = self.dy = 0;
			}, 100);
		}
	};
	
	Grab.prototype.down = function (pt) {
		cancelAnimationFrame(this._momentumId);
		this.canvas.cursor(cursorDown);
	};
	
	Grab.prototype.up = function (pt) {
		cancelAnimationFrame(this._momentumId);
	    this.momentum(this.dx, this.dy);
	    this.dx = this.dy = 0;
		this.canvas.cursor(cursorUp);
	};
	
	Grab.prototype.dblclick = function (pt) {
		cancelAnimationFrame(this._momentumId);
	    this.dx = this.dy = 0;
	    this.canvas.zoom(this.canvas.state.currentZoom*2, pt);
	};
	
	Grab.prototype.momentum = function (dx, dy) {
		var self = this;
		if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
			dx /= 1.1;
			dy /= 1.1;
	    	this.canvas.pan(dx, dy);
	    	this._momentumId = requestAnimationFrame(function () {
	    		self.momentum(dx, dy);
	    	});
	    }
	}
})(TeledrawCanvas);

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								   || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());