/**
 * Ellipse tool
 */
(function (TeledrawCanvas) {
	var Ellipse = TeledrawCanvas.Tool.createTool("ellipse", "crosshair");

	Ellipse.stroke.prototype.bgColor = [255, 255, 255];
	Ellipse.stroke.prototype.bgAlpha = 0;
	Ellipse.stroke.prototype.lineWidth = 1;
	
	/*
	Ellipse.prototype.keydown = function (mdown, key) {
		if (key === 16) {
			this.shiftKey = true;
			if (mdown) {
				this.draw();
			}
		}
	};
	
	Ellipse.prototype.keyup = function (mdown, key) {
		if (key === 16) {
			this.shiftKey = false;
			if (mdown) {
				this.draw();
			}
		}
	};
	*/
	
	Ellipse.stroke.prototype.start = function (pt) {
	    this.first = pt;
	};

	Ellipse.stroke.prototype.move = function (a, b) {
	    this.second = b;
	};

	Ellipse.stroke.prototype.end = function (pt) {
	    this.second = pt;
	};

	Ellipse.stroke.prototype.draw = function () {
	    if (!this.first || !this.second) return;
	    var x = this.first.x,
	    	y = this.first.y,
	    	w = this.second.x - x,
	    	h = this.second.y - y,
	    	ctx = this.ctx,
	    	state = this.canvas.state,
			shadowOffset = state.shadowOffset,
			shadowBlur = state.shadowBlur,
			lineWidth = state.lineWidth,
			color = TeledrawCanvas.util.cssColor(state.color);
		
		ctx.lineJoin = ctx.lineCap = "round";
		ctx.globalAlpha = state.globalAlpha;
		ctx.fillStyle = ctx.strokeStyle = color;
		ctx.miterLimit = 100000;
	    
	    if (this.tool.shiftKey) {
	    	h = this.second.y > y ? Math.abs(w) : -Math.abs(w);
	    }
	    
	    if (this.tool.fill) {
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

