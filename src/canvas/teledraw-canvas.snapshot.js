/**
 * TeledrawCanvas.Snapshot
 */

(function (TeledrawCanvas) {
	var Snapshot = function (canvas) {
		this.canvas = canvas;
		this._snapshotBufferCanvas();
	};

	Snapshot.prototype.restore = function (stroke) {
		if (stroke) {
			this._restoreBufferCanvas(stroke.tl, stroke.br);
		} else {
			this._restoreBufferCanvas({ x:0, y:0 }, { x:this.canvas.canvas().width, y:this.canvas.canvas().height });
		}
	};
	
	Snapshot.prototype.toDataURL = function () {
		return this.buffer && this.buffer.toDataURL();
	};
	
	// doing this with a buffer canvas instead of get/put image data seems to be significantly faster
	Snapshot.prototype._snapshotBufferCanvas = function () {
	    this.buffer = this.canvas.getTempCanvas();
	    this.buffer.getContext('2d').drawImage(this.canvas.canvas(), 0, 0);
	};
	
	Snapshot.prototype._restoreBufferCanvas = function (tl, br) {
		var ctx = this.canvas.ctx();
		var w = br.x - tl.x, h = br.y - tl.y;
		if (w === 0 || h === 0) {
			return;
		}
		ctx.clearRect(tl.x, tl.y, w, h);
	    ctx.drawImage(this.buffer, tl.x, tl.y, w, h, tl.x, tl.y, w, h);
	};

	Snapshot.prototype._snapshotImageData = function () {
	    this.data = this.canvas.getImageData();
	};
	
	Snapshot.prototype._restoreImageData = function () {
	    this.canvas.putImageData(this.data);
	};
	
	TeledrawCanvas.Snapshot = Snapshot;
})(TeledrawCanvas);

