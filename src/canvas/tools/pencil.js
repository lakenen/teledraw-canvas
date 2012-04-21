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
					if (points[0].p) {
						lineWidth *= points[0].p;
					}
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
	    
	    	if (points[0].p) {
				var pressurePoints = generatePressurePoints(points, lineWidth);
				var length = pressurePoints.left.length;
	    		pressurePoints.right.reverse();
	    		
				ctx.beginPath();
	    		drawLine(ctx, pressurePoints.left, this.smoothing);
	    		ctx.lineTo(pressurePoints.right[0].x, pressurePoints.right[0].y);
	    		drawLine(ctx, pressurePoints.right, this.smoothing);
	    		ctx.lineTo(pressurePoints.left[0].x, pressurePoints.left[0].y);
	    		ctx.closePath();
	    		ctx.fill();
	    		
	    		/*
	    		ctx.beginPath();
	    		var pt2 = new Vector(pressurePoints.right[0].x,pressurePoints.right[0].y),
	    			pt1 = new Vector(pressurePoints.left[length-1].x,pressurePoints.left[length-1].y);
	    		var pt = points[points.length-2];
	    		ctx.arc(pt.x, pt.y, Vector.subtract(pt2,pt1).magnitude()/2, Vector.subtract(pt2,pt1).direction(), Vector.subtract(pt1,pt2).direction());
	    		ctx.closePath();
	    		ctx.fill();

	    		
				ctx.beginPath();
	    		pt1 = new Vector(pressurePoints.right[length-1].x,pressurePoints.right[length-1].y);
	    		pt2 = new Vector(pressurePoints.left[0].x,pressurePoints.left[0].y);
	    		pt = points[0];
	    		ctx.arc(pt.x, pt.y, Vector.subtract(pt2,pt1).magnitude()/2, Vector.subtract(pt2,pt1).direction(), Vector.subtract(pt1,pt2).direction());
	    		ctx.closePath();
	    		ctx.fill();*/
	    	} else {
				ctx.beginPath();
				drawLine(ctx, points, this.smoothing);
				ctx.stroke();
			}
	    }
	};
	
	function generatePressurePoints(points, thickness) {
		var result = {left:[], right:[]},
			len = points.length,
			lastp = points[0],
			lastv = new Vector(lastp.x, lastp.y), 
			currp, currv, tmp;
		for (var i = 1, l = len; i < l; ++i) {
			currp = points[i];
			currv = new Vector(currp.x, currp.y);
			tmp = Vector.subtract(currv, lastv);
			tmp.rotateZ(Math.PI/2).unit().scale(lastp.p*thickness).add(lastv);
			result.left.push({ x: tmp.x, y: tmp.y });
			tmp = Vector.subtract(currv, lastv);
			tmp.rotateZ(-Math.PI/2).unit().scale(lastp.p*thickness).add(lastv);
			result.right.push({ x: tmp.x, y: tmp.y });
			lastp = currp;
			lastv = currv;
		}
		return result;
	}
	
	function drawLine(ctx, points, smoothing) {
	    ctx.moveTo(points[0].x, points[0].y);
		var prev = points[0],
			prevprev = null, curr = prev, len = points.length;
		for (var i = 1, l = len; i < l; ++i) {
			curr = points[i];
			if (prevprev && (prevprev.x == curr.x || prevprev.y == curr.y)) {
				// hack to avoid weird linejoins cutting the line
				curr.x += 0.1; curr.y += 0.1;
			}
			if (smoothing) {
				var mid = {x:(prev.x+curr.x)/2, y: (prev.y+curr.y)/2};
				ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
			} else {
				ctx.lineTo(curr.x, curr.y);
			}
			prevprev = prev;
			prev = points[i];
		}
		if (smoothing) {
			ctx.quadraticCurveTo(prev.x, prev.y, curr.x, curr.y);
		}
	}
})(TeledrawCanvas);

