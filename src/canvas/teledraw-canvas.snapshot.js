/**
 * TeledrawCanvas.Snapshot
 */

(function (TeledrawCanvas) {
	var Snapshot = function (canvas) {
		this.canvas = canvas;
		if (!this.canvas._snapshotBuffers) {
			this.canvas._snapshotBuffers = [];
		}
		this._snapshotBufferCanvas();
	};

	Snapshot.prototype.restore = function (stroke) {
		var tl, br;
		if (stroke) {
			tl = stroke.tl;
			br = stroke.br;
		} else {
			tl = { x:0, y:0 };
			br = { x:this.canvas.canvas().width, y:this.canvas.canvas().height };
		}
		this._restoreBufferCanvas(tl, br);
		this.canvas.updateDisplayCanvas(false, tl, br);
	};
	
	Snapshot.prototype.destroy = function () {
		this._putBufferCtx();
	};
	
	Snapshot.prototype.toDataURL = function () {
		return this.buffer && this.buffer.toDataURL();
	};
	
	// doing this with a buffer canvas instead of get/put image data seems to be significantly faster
	Snapshot.prototype._snapshotBufferCanvas = function () {
		this._getBufferCtx();
	    this.buffer.drawImage(this.canvas.canvas(), 0, 0);
	};
	
	Snapshot.prototype._restoreBufferCanvas = function (tl, br) {
		var ctx = this.canvas.ctx();
		
		var w = br.x - tl.x, h = br.y - tl.y;
		if (w === 0 || h === 0) {
			return;
		}
		ctx.clearRect(tl.x, tl.y, w, h);
	    ctx.drawImage(this.buffer.canvas, tl.x, tl.y, w, h, tl.x, tl.y, w, h);
	};

	Snapshot.prototype._snapshotImageData = function () {
	    this.data = this.canvas.getImageData();
	};
	
	Snapshot.prototype._restoreImageData = function () {
	    this.canvas.putImageData(this.data);
	};
	
	Snapshot.prototype._putBufferCtx = function () {
		if (this.buffer) {
			this.canvas._snapshotBuffers.push(this.buffer);
		}
		this.buffer = null;
	};
	
	Snapshot.prototype._getBufferCtx = function () {
		var ctx;
		if (!this.buffer) {
			if (this.canvas._snapshotBuffers.length) {
				ctx = this.canvas._snapshotBuffers.pop();
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			} else {
				ctx = this.canvas.getTempCanvas().getContext('2d');
			}
		}
		this.buffer = ctx;
	};
	
	TeledrawCanvas.Snapshot = Snapshot;
})(TeledrawCanvas);

