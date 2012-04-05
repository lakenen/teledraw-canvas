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
	    if (this.past.length > this.canvas.state.max_history) {
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
	console.log(this.future.length, this.past.length, this.current);
	    if (this._move(this.past, this.future)) {
	    	this.rev--;
	    }
	};

	History.prototype.redo = function () {
	console.log(this.future.length, this.past.length, this.current);
	    if (this._move(this.future, this.past)) {
	    	this.rev++;
	    }
	};
	/*
	History.prototype.hasRevision = function (rev) {
		if (rev === this.rev) {
			return true;
		}
		if (rev > this.rev + this.future.length || rev < this.rev - this.past.length) {
			return false;
		}
		return true;
	};
	
	History.prototype.setRevision = function (rev) {
		this.rev = rev;
		this.past = [];
		this.current = new TeledrawCanvas.Snapshot(this.canvas);
		this.future = [];
	};
	
	History.prototype.getRevision = function (rev) {
		var snapshot;
		if (!this.hasRevision(rev)) {
			return false;
		}
		if (rev < this.rev) {
			snapshot = this.past[this.past.length - (this.rev - rev)];
		} else if (rev > this.rev) {
			snapshot = this.future[rev - this.rev];
		} else {
			snapshot = this.current;
		}
		return snapshot && snapshot.toDataURL();
	};
	*/
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

