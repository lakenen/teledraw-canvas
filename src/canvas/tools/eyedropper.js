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
		var previewContainer = this.previewContainer,
			lightness,
			off = this.canvas.element.offset(),
			pixel = this.canvas.ctx().getImageData(pt.x,pt.y,1,1).data;
		this.color = TeledrawCanvas.util.rgba2rgb(Array.prototype.slice.call(pixel));
		this.previewContainer.offset({ left: off.left + pt.xd + 15, top: off.top + pt.yd + 5});
		var lightness = TeledrawCanvas.util.rgb2hsl(this.color)[2];
		previewContainer.css({
			'background': TeledrawCanvas.util.cssColor(this.color),
			'border-color': lightness >= 50 ? '#000' : '#888'
		});
		if (this.canvas.state.mouseOver) {
			// hack for chrome, since it seems to ignore this and not redraw for some reason...
			previewContainer[0].style.display='none';
			previewContainer[0].offsetHeight; // no need to store this anywhere, the reference is enough
			previewContainer[0].style.display='block';
		} else {
			previewContainer.hide();
		}
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

