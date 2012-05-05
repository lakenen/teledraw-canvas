/**
 * Ellipse tool
 */
(function (TeledrawCanvas) {
	var Ellipse = TeledrawCanvas.Tool.createTool("ellipse", "crosshair"),
		EllipseStrokePrototype = Ellipse.stroke.prototype;

	Ellipse.prototype.preview = function () {
		var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
		var ctx = canv.getContext('2d');
		var stroke = new Ellipse.stroke(this.canvas, ctx);
		stroke.first = { x: 0, y: 0 };
		stroke.second = { x: canv.width, y: canv.height };
		stroke.draw();
		return canv;
	};

	EllipseStrokePrototype.bgColor = [255, 255, 255];
	EllipseStrokePrototype.bgAlpha = 0;
	EllipseStrokePrototype.lineWidth = 1;
	
	EllipseStrokePrototype.start = function (pt) {
	    this.first = pt;
	};

	EllipseStrokePrototype.move = function (a, b) {
	    this.second = b;
	};

	EllipseStrokePrototype.end = function (pt) {
	    this.second = pt;
	};

	EllipseStrokePrototype.draw = function () {
	    if (!this.first || !this.second) return;
	    var self = this,
	    	x = self.first.x,
	    	y = self.first.y,
	    	w = self.second.x - x,
	    	h = self.second.y - y,
	    	ctx = self.ctx,
	    	state = self.canvas.state,
			shadowOffset = state.shadowOffset,
			shadowBlur = state.shadowBlur,
			lineWidth = state.lineWidth,
			color = TeledrawCanvas.util.cssColor(state.color);
		
		ctx.lineJoin = ctx.lineCap = "round";
		ctx.globalAlpha = state.globalAlpha;
		ctx.fillStyle = ctx.strokeStyle = color;
		ctx.miterLimit = 100000;
	    
	    if (self.tool.shiftKey) {
	    	h = self.second.y > y ? abs(w) : -abs(w);
	    }
	    
	    if (self.tool.fill) {
		    drawEllipse(ctx, x, y, w, h);
		    ctx.fill();
	    } else {
			if (shadowBlur > 0) {
				ctx.shadowColor = color;
				ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
				ctx.shadowBlur = shadowBlur;
				ctx.translate(-shadowOffset,-shadowOffset);
			}
			
	        ctx.lineWidth = lineWidth;
		    drawEllipse(ctx, x, y, w, h);
			ctx.stroke();	
	    }
	};
	
	function drawEllipse(ctx, x, y, w, h) {
		var kappa = .5522848;
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle
		
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
	}
	
})(TeledrawCanvas);

