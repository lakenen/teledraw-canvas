/**
 * Fill tool
 */
(function (TeledrawCanvas) {
	var Fill = TeledrawCanvas.Tool.createTool("fill", "crosshair");

	Fill.tolerance = 30;
	Fill.stroke.prototype.bgColor = [255, 255, 255];
	Fill.stroke.prototype.bgAlpha = 255;

	Fill.stroke.prototype.end = function (target) {
		var w = this.ctx.canvas.width, h = this.ctx.canvas.height;
		var pixels = this.ctx.getImageData(0,0, w,h);
		var fill_mask = this.ctx.createImageData(w,h);
		var pxd = pixels.data, fmd = fill_mask.data;
		
		var tstart = (target.y * w + target.x) * 4;
		var tR = pxd[tstart],
			tG = pxd[tstart+1], 
			tB = pxd[tstart+2], 
			tA = pxd[tstart+3];
		
		var abs = Math.abs;
		
		var T = Fill.tolerance;
		var iT = Math.floor(0xFF / T);
	
		var open = [[target.x, target.y]];
		while (open.length > 0) {
			var pt = open.shift();
			var px = pt[0], py = pt[1];
			if (py < 0 || py > h) continue;
			if (px < 0 || px > w) continue;
			var start = (py*w+px)*4;
	
			if (fmd[start+3] > 0) continue;
			
			var R = pxd[start], 
				G = pxd[start+1], 
				B = pxd[start+2], 
				A = pxd[start+3];
			var dist =  abs(R - tR) + abs(G - tG) + abs(B - tB) + abs(A - tA);
		
			if (dist < T) {
				fmd[start+3] = 0xFF - dist*iT;
				
				if (px > 0) open.push([px - 1, py, px - 2, py]);
				if (px <= w-1) open.push([px + 1, py, px + 2, py]);
				if (py > 0) open.push([px, py - 1, px, py - 2]);
				if (py <= h-1) open.push([px, py + 1, px, py + 2]);
			}
		}
		
		var rc = this.color;
		var new_pixels = this.ctx.createImageData(w,h);
		var dpd = new_pixels.data;
		var alpha = Math.floor(this.canvas.getAlpha());
		for (var i = 0; i < fill_mask.data.length; i += 4) {
			if (fmd[i+3] > 0x00) {
				dpd[i] = rc[0];
				dpd[i+1] = rc[1];
				dpd[i+2] = rc[2];
				dpd[i+3] = Math.floor(rc[3] * fmd[i+3] / 0xFF);
			}
		}
		this.tmp_canvas = $('<canvas>').attr({width: w, height: h}).get(0);
		var tmp_ctx = this.tmp_canvas.getContext('2d');
		tmp_ctx.putImageData(new_pixels, 0,0);
		
		/*stackBlurCanvasRGBA(this.tmp_canvas, 1);
		
		var tmp_data = tmp_ctx.getImageData(0, 0, w, h);
		for (var i = 0, l = tmp_data.data.length; i < l; i += 4) {
			if (tmp_data.data[i+3] > 0x20) {
				tmp_data.data[i] = rc[0];
				tmp_data.data[i+1] = rc[1];
				tmp_data.data[i+2] = rc[2];
				tmp_data.data[i+3] = Math.min(rc[3], tmp_data.data[i+3] * 4);
			}
		}
		tmp_ctx.putImageData(tmp_data, 0, 0);*/
	};

	Fill.stroke.prototype.draw = function () {
		if (this.tmp_canvas) {
        	this.ctx.drawImage(this.tmp_canvas, 0,0);
    	}
	};
})(TeledrawCanvas);

