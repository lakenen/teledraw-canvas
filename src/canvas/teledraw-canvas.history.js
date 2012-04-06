/**
 * TeledrawCanvas.History
 */

(function (TeledrawCanvas) {
	var History = function (canvas) {
		this.canvas = canvas;
		this.rev = 0;
		this.clear();
	};
	
	History.prototype.clear = function () {
		this.past = [];
		this.current = null;
		this.future = [];
	};

	History.prototype.checkpoint = function () {
	    if (this.past.length > this.canvas.state.maxHistory) {
			this.past.shift();
	    }
	    
	    if (this.current) {
			this.past.push(this.current);
	    }
	    this.current = new TeledrawCanvas.Snapshot(this.canvas);
	    this.future = [];
	    this.rev++;
	};

	History.prototype.undo = function () {
	    if (this._move(this.past, this.future)) {
	    	this.rev--;
	    }
	};

	History.prototype.redo = function () {
	    if (this._move(this.future, this.past)) {
	    	this.rev++;
	    }
	};
	
	History.prototype._move = function(stack_from, stack_to) {
	    if (!stack_from.length) return false;
	    if (!this.current) return false;
	    stack_to.push(this.current);
		this.current = stack_from.pop();
		this.current.restore();
		return true;
	};
	TeledrawCanvas.History = History;
})(TeledrawCanvas);

