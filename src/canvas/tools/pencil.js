/**
 * Pencil tool
 */
(function (TeledrawCanvas) {
	var Pencil = TeledrawCanvas.Tool.createTool("pencil", "crosshair");
	
	Pencil.stroke.prototype.lineWidth = 1;
	Pencil.stroke.prototype.lineCap = 'round';
	Pencil.stroke.prototype.smoothing = true;

	Pencil.stroke.prototype.draw = function () {
		var state = this.canvas.state,
			ctx = this.ctx,
			points = this.points,
			prev,
			prevprev,
			curr,
			shadowOffset = state.shadowOffset,
			shadowBlur = state.shadowBlur,
			lineWidth = state.lineWidth,
			color = TeledrawCanvas.util.cssColor(state.color);
		
		ctx.globalAlpha = state.globalAlpha;
		ctx.fillStyle = ctx.strokeStyle = color;
	    ctx.miterLimit = 100000;
	    if (shadowBlur > 0) {
	    	ctx.shadowColor = color;
			ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
			ctx.shadowBlur = shadowBlur;
	    	ctx.translate(-shadowOffset,-shadowOffset);
	    }
	    
	    if (points.length === 1) {
	   		// draw a single point
			switch (this.lineCap) {
				case 'round':
					ctx.beginPath();
					ctx.arc(points[0].x, points[0].y, lineWidth / 2, 0, 2 * Math.PI, true);
					ctx.closePath();
					ctx.fill();
					break;
				case 'square':
					ctx.fillRect(points[0].x - lineWidth/2, points[0].y - lineWidth/2, lineWidth, lineWidth);
			}
	    } else if (points.length > 1) {
	        ctx.lineJoin = 'round';
	        ctx.lineCap = this.lineCap;
	        ctx.lineWidth = lineWidth;
	    
	        ctx.beginPath();
	        ctx.moveTo(points[0].x, points[0].y);
			prev = points[0];
			prevprev = null;
	        for (var i = 1; i < points.length; ++i) {
	        	curr = points[i];
	        	if (prevprev && (prevprev.x == curr.x || prevprev.y == curr.y)) {
	        		// hack to avoid weird linejoins cutting the line
	        		curr.x += 0.1; curr.y += 0.1;
	        	}
	            if (this.smoothing) {
	           		var mid = {x:(prev.x+curr.x)/2, y: (prev.y+curr.y)/2};
	         		ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
	            } else {
	            	ctx.lineTo(curr.x, curr.y);
	            }
	            prevprev = prev;
	            prev = points[i];
	        }
	        if (this.smoothing) {
	       		ctx.quadraticCurveTo(prev.x, prev.y, curr.x, curr.y);
	        }
	        ctx.stroke();
	    }
	};
})(TeledrawCanvas);

