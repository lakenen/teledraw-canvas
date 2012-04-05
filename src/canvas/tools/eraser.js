/**
 * Eraser tool
 */
(function (TeledrawCanvas) {
	var Eraser = TeledrawCanvas.Tool.createTool("eraser", "crosshair");
	
	Eraser.stroke.prototype.lineWidth = 1;
	Eraser.stroke.prototype.lineCap = 'round';

	Eraser.stroke.prototype.draw = function () {
		this.color = [255, 255, 255, 255];
	    this.ctx.globalCompositeOperation = 'destination-out';
	    TeledrawCanvas.tools["pencil"].stroke.prototype.draw.call(this);
	};
})(TeledrawCanvas);

