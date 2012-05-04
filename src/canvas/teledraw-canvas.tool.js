/**
 * TeledrawCanvas.Tool
 */
(function (TeledrawCanvas) {
	var Tool = function () {};

	Tool.prototype.down = function (pt) {};
	Tool.prototype.up = function (pt) {};
	Tool.prototype.move = function (mouseDown, from, to) {};
	Tool.prototype.dblclick = function (pt) {};
	Tool.prototype.enter = function (mouseDown, pt) {};
	Tool.prototype.leave = function (mouseDown, pt) {};
	Tool.prototype.keydown = function (mouseDown, key) {
		if (key === 16) {
			this.shiftKey = true;
			if (mouseDown) {
	        	this._updateBoundaries({});
				this.draw();
			}
		}
	};
	Tool.prototype.keyup = function (mouseDown, key) {
		if (key === 16) {
			this.shiftKey = false;
			if (mouseDown) {
	        	this._updateBoundaries({});
	        	this.draw();
	        }
		}
	};
	Tool.prototype.preview = function () {};
	Tool.prototype.alt_down = function () {};
	Tool.prototype.alt_up = function () {};
	
	// A factory for creating tools
	Tool.createTool = function (name, cursor, ctor) {
		var Stroke = function (canvas) {
			this.canvas = canvas;
			this.ctx = canvas.ctx();
	        this.color = canvas.getColor();
	        this.color.push(canvas.getAlpha());
	        this.points = [];
	        this.tl = {x: this.ctx.canvas.width, y: this.ctx.canvas.height};
	        this.br = {x: 0, y: 0};
	        this.tool = {};
	    };
	    Stroke.prototype = new TeledrawCanvas.Stroke();
	    
	    var tool = function (canvas) {
			this.canvas = canvas;
			canvas.cursor(cursor);
	        this.name = name;
	        this.cursor = cursor || 'default';
	        this.currentStroke = null;
	        
	        if (typeof ctor=='function') {
	        	ctor.call(this);
	        }
	    };
	    
	    tool.prototype = new Tool();
	    
	    tool.prototype.down = function (pt) {
	    	this.currentStroke = new Stroke(this.canvas);
	    	this.currentStroke.tool = this;
	    	this.currentStroke.save();
	    	this.currentStroke.points.push(pt);
	    	this.currentStroke.start(pt);
	        this._updateBoundaries(pt);
	        this.draw();
	    };
	    
	    tool.prototype.move = function (mdown, from, to) {
	        if (mdown && this.currentStroke) {
	        	this.currentStroke.points.push(to);
	        	this.currentStroke.move(from, to);
	        	this._updateBoundaries(to);
	            this.draw();
	        }
	    };
	    
	    tool.prototype.up = function (pt) {
	        if (this.currentStroke) {
	        	this.currentStroke.end(pt);
	            this.draw();
	            this.currentStroke.destroy();
	        	this.currentStroke = null;
	            this.canvas.history.checkpoint();
	        }
	        this.canvas.trigger('tool.up');
	    };
	    
	    tool.prototype.draw = function () {
	    	this.currentStroke.ctx.save();
	    	this.currentStroke.restore();
	    	this.currentStroke.draw();
			this.canvas.updateDisplayCanvas(false, this.currentStroke.tl, this.currentStroke.br);
	    	this.currentStroke.ctx.restore();
	    };
	    
	    tool.prototype._updateBoundaries = function (pt) {
	    	var stroke = this.currentStroke,
	    		canvas = stroke.ctx.canvas,
	    		strokeSize = this.canvas.state.shadowBlur+this.canvas.state.lineWidth;
	    	if (this.shiftKey) {
	    		// hack to avoid bugginess when shift keying for ellipse, line and rect
	    		stroke.tl.x = stroke.tl.y = 0;
	    		stroke.br.x = canvas.width;
	    		stroke.br.y = canvas.height;
	    		return;
	    	}
	    	if (pt.x - strokeSize < stroke.tl.x) {
	    		stroke.tl.x = clamp(floor(pt.x - strokeSize), 0, canvas.width);
	    	}
	    	if (pt.x + strokeSize > stroke.br.x) {
	    		stroke.br.x = clamp(floor(pt.x + strokeSize), 0, canvas.width);
	    	}
	    	if (pt.y - strokeSize < stroke.tl.y) {
	    		stroke.tl.y = clamp(floor(pt.y - strokeSize), 0, canvas.height);
	    	}
	    	if (pt.y + strokeSize > stroke.br.y) {
	    		stroke.br.y = clamp(floor(pt.y + strokeSize), 0, canvas.height);
	    	}
	    };
	    
	    tool.stroke = Stroke;
	    Stroke.tool = tool;
	    TeledrawCanvas.tools[name] = tool;
	    return tool;
	};
	
	TeledrawCanvas.Tool = Tool;
	TeledrawCanvas.tools = {};
})(TeledrawCanvas);

