/**
 * Eyedropper tool
 */
(function (TeledrawCanvas) {
	var ctor = function () {
		this.previewContainer = $('<div>').css({
			position: 'absolute',
			width: 10,
			height: 10,
			border: '1px solid black'
		});
		$('body').append(this.previewContainer.hide());
		if (this.canvas.state.mouseOver) {
			this.previewContainer.show();
		}
	};
	var EyeDropper = TeledrawCanvas.Tool.createTool("eyedropper", "crosshair", ctor);
	
	EyeDropper.prototype.pick = function (pt) {
		var off = $(this.canvas.canvas()).offset();
		this.previewContainer.offset({ left: off.left + pt.x + 15, top: off.top + pt.y + 5 });
		var pixel = this.canvas.ctx().getImageData(pt.x,pt.y,1,1).data;
		this.color = TeledrawCanvas.util.rgba2rgb(Array.prototype.slice.call(pixel));
		var l = TeledrawCanvas.util.rgb2hsl(this.color)[2];
		this.previewContainer.css({
			'background-color': TeledrawCanvas.util.cssColor(this.color),
			'border-color': l >= 50 ? '#000' : '#888'
		});
	};

	EyeDropper.prototype.enter = function () {
		this.previewContainer.show();
	};
	
	EyeDropper.prototype.leave = function () {
		this.previewContainer.hide();
	};
	
	EyeDropper.prototype.move = function (down, from, pt) {
		this.pick(pt);
	};
	
	EyeDropper.prototype.down = function (pt) {
		this.pick(pt);
	};
	
	EyeDropper.prototype.up = function (pt) {
	    this.pick(pt);
		this.canvas.setColor(this.color);
		this.previewContainer.remove();
		this.canvas.previousTool();
	};
})(TeledrawCanvas);

