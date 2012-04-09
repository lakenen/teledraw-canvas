/*!

	Teledraw TeledrawCanvas
	Version 0.5.0 (http://semver.org/)
	Copyright 2012 Cameron Lakenen
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

TeledrawCanvas = (function () {
	// local reference to Math functions
	var floor = Math.floor,
		pow = Math.pow;
		
	var _canvases = [];
	var _id = 0;
	
	// global default tool settings
	var defaults = {
		tool: 'pencil',
		alpha: 255,
		color: [0, 0, 0],
		strokeSize: 1000,
		strokeSoftness: 0
	};
	
	// global default state
	var defaultState = {
		last: null,
		currentTool: 'pencil',
		previousTool: 'pencil',
		tool: null,
		mouseDown: false,
		mouseOver: false,
		width: null,
		height: null,
		
		currentZoom: 1,
		currentOffset: { x: 0, y: 0 },
		
		// if you are using strokeSoftness, make sure shadowOffset >= max(canvas.width, canvas.height)
		shadowOffset: 2000,
		
		// default limits
		maxHistory: 10,
		minStrokeSize: 500,
		maxStrokeSize: 10000,
		minStrokeSoftness: 0,
		maxStrokeSoftness: 100
	};
	
	var TeledrawCanvas = function (elt, options) {
		var element = this.element = $(elt);
		var container = this.container = element.parent();
		var state = this.state = $.extend({}, defaultState, options);
		
		if (typeof element.get(0).getContext != 'function') {
			alert('Your browser does not support HTML canvas!');
			return;
		}
		
		state.width = state.displayWidth || state.width || parseInt(element.attr('width'));
		state.height = state.displayHeight || state.height || parseInt(element.attr('height'));
		state.fullWidth = state.fullWidth || state.width;
		state.fullHeight = state.fullHeight || state.height;
		
		if (state.width / state.fullWidth !== state.height / state.fullHeight) {
			throw new Error('Display and full canvas aspect ratios differ!');
		}
		
		element.attr({
			width: state.width,
			height: state.height
		});
		
		this._displayCanvas = $(element).get(0);
		
		this._canvas =  $('<canvas>').attr({
			width: state.fullWidth,
			height: state.fullHeight
		}).get(0);
		
		
		var canvas = this;
		this.drawHandlers  = [];
		this.history = new TeledrawCanvas.History(this);
		
		this.defaults();
		this.zoom(0);
		this.history.checkpoint();
		_canvases[_id++] = this;
		var gInitZoom;
		container
			.bind('gesturestart', function (evt) {
	    		if (state.tool.name == 'grab') {
					gInitZoom = state.currentZoom;
	    		}
			})
			.bind('gesturechange', function (evt) {
	    		if (state.tool.name == 'grab') {
	    			var pt = state.last;//$.extend({},state.last);
	    			canvas.zoom(gInitZoom*evt.originalEvent.scale, pt);
	    		}
	    		evt.preventDefault();
			})
			.bind('gestureend', function (evt) {
			})
			.bind('dblclick', function (evt) {
				var pt = getCoord(evt);
	            state.tool.dblclick(pt);
			})
			.bind('mouseenter', function (evt) {
	            var pt = getCoord(evt);
	            state.tool.enter(state.mouseDown, pt);
	            state.last = pt;
	            state.mouseOver = true;
	        })      
	        .bind('mousedown touchstart', mouseDown)
	        .bind('mouseleave', function (evt) {
	            var pt = getCoord(evt);
	            state.tool.leave(state.mouseDown, pt);
	            state.mouseOver = false;
	        });
        
        
	    $(window).bind('mousemove touchmove', mouseMove);
	   
	    var canvasElt = element.get(0);
	    var lastMoveEvent = null;
	    function mouseMove(e) {
	    	if (e.type == 'touchmove' && e.originalEvent.touches.length > 1) {
	    		/*if (state.mouseDown) {
	    			// try to undo what was done...
	    			if (state.tool.currentStroke) {
	    				state.tool.currentStroke.restore();
	    				state.tool.currentStroke = null;
	    			}
	    		}*/
	    		return true;
	    	}
	    	if (lastMoveEvent == 'touchmove' && e.type == 'mousemove') return;
	    	target = $(e.target).parents().andSelf();
	        if (target.is(element) || state.mouseDown) {
	            var next = getCoord(e);
	            state.tool.move(state.mouseDown, state.last, next);
	            state.last = next;
	            lastMoveEvent = e.type;
            	e.preventDefault();
	        }
	    }

	    function mouseDown(e) {
	    	if (e.type == 'touchstart' && e.originalEvent.touches.length > 1) {
	    		state.last = getCoord(e);
	    		return true;
	    	}
            var pt = state.last = getCoord(e);
            state.mouseDown = true;
            document.onselectstart = function() { return false; };
            $(window)
                .one('mouseup touchend', mouseUp);
            state.tool.down(pt);
        	e.preventDefault();
        }
	    
	    function mouseUp(e) {
	    	if (e.type == 'touchend' && e.originalEvent.touches.length > 1) {
	    		return true;
	    	}
        	state.mouseDown = false;
            document.onselectstart = function() { return true; };
            state.tool.up(state.last);
        	e.preventDefault();
	    }
	    
		function getCoord(e) {
	        var offset = element.offset(),
		        pageX = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX,
				pageY = e.pageY || e.originalEvent.touches && e.originalEvent.touches[0].pageY;
	        return {
	        	x: floor((pageX - offset.left)/state.currentZoom) + state.currentOffset.x || 0,
	        	y: floor((pageY - offset.top)/state.currentZoom) + state.currentOffset.y || 0,
	        	xd: floor(pageX - offset.left) || 0,
	        	yd: floor(pageY - offset.top) || 0
	        };
		}
	};
	
	TeledrawCanvas.canvases = _canvases;
	
	
	// "Private" functions
	
	TeledrawCanvas.prototype._setRGBAArrayColor = function (rgba) {
		var state = this.state;
		if (rgba.length === 4) {
			state.globalAlpha = rgba.pop();
		}
		for (var i = rgba.length; i < 3; ++i) {
			rgba.push(0);
		}
		state.color = rgba;
		this._updateTool();
	};
	
	TeledrawCanvas.prototype._updateTool = function () {
		var lw = 1 + floor(pow(this.state.strokeSize / 1000.0, 2));
		var sb = floor(pow(this.state.strokeSoftness, 1.3) / 300.0 * lw);
		this.state.lineWidth = lw;
		this.state.shadowBlur = sb;
	};
	
	TeledrawCanvas.prototype.updateDisplayCanvas = function () {
		var dctx = this._displayCtx || (this._displayCtx = this._displayCanvas.getContext('2d')),
			off = this.state.currentOffset,
			zoom = this.state.currentZoom, 
			dw = dctx.canvas.width,
			dh = dctx.canvas.height,
			sw = dw / zoom,
			sh = dh / zoom;
		dctx.clearRect(0, 0, dw, dh);
		dctx.drawImage(this._canvas, off.x, off.y, sw, sh, 0, 0, dw, dh);
	};
	
	
	// API
	
	// returns the HTML Canvas element associated with this tdcanvas
	TeledrawCanvas.prototype.canvas = function () {
	    return this._canvas;
	};

	// returns a 2d rendering context for the canvas element
	TeledrawCanvas.prototype.ctx = function () {
	    return this._ctx || (this._ctx = this._canvas.getContext('2d'));
	};
	
	// sets the cursor css to be used when the mouse is over the canvas element
	TeledrawCanvas.prototype.cursor = function (c) {
	    if (!c) {
	        c = "default";
	    }
	    var cursors = c.split(/,\s*/);
	    do {
	    	c = cursors.shift();
	    	this.container.css('cursor', c);
	    } while (c.length && this.container.css('cursor') != c);
	    return this;
	};
	
	// clears the canvas and (unless noCheckpoint===true) pushes to the undoable history
	TeledrawCanvas.prototype.clear = function (noCheckpoint) {
	    var ctx = this.ctx();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if (noCheckpoint !== true) {
			this.history.checkpoint();
		}
		return this;
	};
	
	// resets the default tool and properties
	TeledrawCanvas.prototype.defaults = function () {
		this.setTool('pencil');
		this.setAlpha(defaults.alpha);
		this.setColor(defaults.color);
		this.setStrokeSize(defaults.strokeSize);
		this.setStrokeSoftness(defaults.strokeSoftness);
		return this;
	};
	
	// returns a data url (image/png) of the canvas, optionally scaled to w x h pixels
	TeledrawCanvas.prototype.toDataURL = function (w, h) {
		if (w && h) {
			w = parseInt(w);
			h = parseInt(h);
			var tmpcanvas = $('<canvas>').attr({
				width: w,
				height: h
			}).get(0);
			tmpcanvas.getContext('2d').drawImage(this.canvas(), 0, 0, w, h);
			return tmpcanvas.toDataURL();
		}
		return this.canvas().toDataURL();
	};
	
	// returns a new (blank) canvas element the same size as this tdcanvas element
	TeledrawCanvas.prototype.getTempCanvas = function (w, h) {
		var tmp = $('<canvas>').get(0);
		tmp.width = w || this._canvas.width;
		tmp.height = h || this._canvas.height;
		return tmp;
	};

	// draws an image data url to the canvas and when it's finished, calls the given callback function
	TeledrawCanvas.prototype.fromDataURL = function (url, cb) {
		var self = this,
			img = new Image();
		img.onload = function () {
			self.clear(true);
			self.ctx().drawImage(img, 0, 0);
			self.updateDisplayCanvas();
			//self.history.checkpoint();
			if (typeof cb == 'function') {
				cb.call(self);
			}
		};
		img.src = url;
		return this;
	};

	// returns the ImageData of the whole canvas element
	TeledrawCanvas.prototype.getImageData = function () {
		var ctx = this.ctx();
	    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	// sets the ImageData of the canvas
	TeledrawCanvas.prototype.putImageData = function (data) {
		this.ctx().putImageData(data, 0, 0);
		return this;
	};
	
	// returns the current color in the form [r, g, b, a] (where each can be [0,255])
	TeledrawCanvas.prototype.getColor = function () {
	    return this.state.color.slice();
	};
	
	// sets the current color, either as an array (see getColor) or any acceptable css color string
	TeledrawCanvas.prototype.setColor = function (color) {
		if (!$.isArray(color)) {
			color = TeledrawCanvas.util.parseColorString(color);
		}
		this._setRGBAArrayColor(color);
		return this;
	};
	
	// sets the current alpha to a, where a is a number in [0, 255]
	TeledrawCanvas.prototype.setAlpha = function (a) {
		this.state.globalAlpha = TeledrawCanvas.util.clamp(a, 0, 255);
		this._updateTool();
		return this;
	};
	
	// returns the current alpha
	TeledrawCanvas.prototype.getAlpha = function () {
		return this.state.globalAlpha;
	};
	
	// sets the current stroke size to s, where a is a number in [minStrokeSize, maxStrokeSize]
	// lineWidth = 1 + floor(pow(strokeSize / 1000.0, 2));
	TeledrawCanvas.prototype.setStrokeSize = function (s) {
		this.state.strokeSize = TeledrawCanvas.util.clamp(s, this.state.minStrokeSize, this.state.maxStrokeSize);
		this._updateTool();
		return this;
	};
	
	// sets the current stroke size to s, where a is a number in [minStrokeSoftness, maxStrokeSoftness]
	TeledrawCanvas.prototype.setStrokeSoftness = function (s) {
		this.state.strokeSoftness = TeledrawCanvas.util.clamp(s, this.state.minStrokeSoftness, this.state.maxStrokeSoftness);
		this._updateTool();
		return this;
	};
	
	// set the current tool, given the string name of the tool (e.g. 'pencil')
	TeledrawCanvas.prototype.setTool = function (name) {
		this.state.previousTool = this.state.currentTool;
		this.state.currentTool = name;
		if (!TeledrawCanvas.tools[name]) {
			throw new Error('Tool "'+name+'" not defined.');
		}
		this.state.tool = new TeledrawCanvas.tools[name](this);
		this._updateTool();
		return this;
	};
	
	
	TeledrawCanvas.prototype.previousTool = function () {
		return this.setTool(this.state.previousTool);
	};
	
	// undo to the last history checkpoint (if available)
	TeledrawCanvas.prototype.undo = function () {
		this.history.undo();
		return this;
	};
	
	// redo to the next history checkpoint (if available)
	TeledrawCanvas.prototype.redo = function () {
		this.history.redo();
		return this;
	};
	
	// resize the canvas to the given width and height, with the current image duplicated and stretched to the new size
	TeledrawCanvas.prototype.resize = function (w, h) {
		var tmpcanvas = $(this._canvas).clone().get(0);
		tmpcanvas.getContext('2d').drawImage(this._canvas,0,0);
		this._canvas.width = w;
		this._canvas.height = h;
		this.ctx().drawImage(tmpcanvas, 0, 0, tmpcanvas.width, tmpcanvas.height, 0, 0, w, h);
		return this;
	};
	
	// zoom the canvas to the given multiplier, z (e.g. if z is 2, zoom to 2:1)
	// optionally at a given point (otherwise in the center of the current display)
	TeledrawCanvas.prototype.zoom = function (z, pt) {
		var panx = 0, 
			pany = 0,
			currentZoom = this.state.currentZoom,
			displayWidth = this._displayCanvas.width,
			displayHeight = this._displayCanvas.height,
			pt = pt || { xd: displayWidth/2, yd: displayHeight/2};
		z = TeledrawCanvas.util.clamp(z || 0, displayWidth / this._canvas.width, 4);
		if (z !== currentZoom) {
			if (z > currentZoom) {
				panx = -(displayWidth/currentZoom - displayWidth/z + (pt.xd - displayWidth/2)/currentZoom)/2;
				pany = -(displayHeight/currentZoom - displayHeight/z + (pt.yd - displayHeight/2)/currentZoom)/2;
			} else if (z < currentZoom) {
				panx = (displayWidth/z - displayWidth/currentZoom)/2;
				pany = (displayHeight/z - displayHeight/currentZoom)/2;
			}
			panx *= z;
			pany *= z;
		}
		console.log(panx, pany);
		this.state.currentZoom = z;
		this.pan(panx, pany);
		this.updateDisplayCanvas();
	};
	
	// pan the canvas to the given (relative) x,y position
	TeledrawCanvas.prototype.pan = function (x, y) {
		var zoom = this.state.currentZoom,
			currentX = this.state.currentOffset.x,
			currentY = this.state.currentOffset.y,
			maxWidth = this._canvas.width - this._displayCanvas.width/zoom,
			maxHeight = this._canvas.height - this._displayCanvas.height/zoom;
		x = currentX - (x || 0)/zoom;
		y = currentY - (y || 0)/zoom;
		this.state.currentOffset = {
			x: floor(TeledrawCanvas.util.clamp(x, 0, maxWidth)),
			y: floor(TeledrawCanvas.util.clamp(y, 0, maxHeight))
		};
		this.updateDisplayCanvas();
	};
	
	return TeledrawCanvas;
})();/**
 * TeledrawCanvas.History
 */

(function (TeledrawCanvas) {
	var History = function (canvas) {
		this.canvas = canvas;
		this.rev = 0;
		this.clear();
	};
	
	History.prototype.clear = function () {
		this.past = [];
		this.current = null;
		this.future = [];
	};

	History.prototype.checkpoint = function () {
	    if (this.past.length > this.canvas.state.maxHistory) {
			this.past.shift();
	    }
	    
	    if (this.current) {
			this.past.push(this.current);
	    }
	    this.current = new TeledrawCanvas.Snapshot(this.canvas);
	    this.future = [];
	    this.rev++;
	};

	History.prototype.undo = function () {
	    if (this._move(this.past, this.future)) {
	    	this.rev--;
	    }
	};

	History.prototype.redo = function () {
	    if (this._move(this.future, this.past)) {
	    	this.rev++;
	    }
	};
	
	History.prototype._move = function(stack_from, stack_to) {
	    if (!stack_from.length) return false;
	    if (!this.current) return false;
	    stack_to.push(this.current);
		this.current = stack_from.pop();
		this.current.restore();
		return true;
	};
	TeledrawCanvas.History = History;
})(TeledrawCanvas);

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
		this.canvas.updateDisplayCanvas();
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

/**
 * TeledrawCanvas.Stroke
 */
(function (TeledrawCanvas) {
	var Stroke = function (canvas) {
		this.canvas = canvas;
	};
	
	Stroke.prototype.start = function (pt) {};
	Stroke.prototype.move = function (pt1, pt2) {};
	Stroke.prototype.end = function () {};
	Stroke.prototype.draw = function () {};

	Stroke.prototype.save = function () {
	    this.snapshot = new TeledrawCanvas.Snapshot(this.canvas);
	};

	Stroke.prototype.restore = function () {
	    this.snapshot.restore(this);
	};	
	
	TeledrawCanvas.Stroke = Stroke;
})(TeledrawCanvas);

/**
 * TeledrawCanvas.Tool
 */
(function (TeledrawCanvas) {
	var Tool = function () {};

	Tool.prototype.down = function (pt) {};
	Tool.prototype.up = function (pt) {};
	Tool.prototype.dblclick = function (pt) {};
	Tool.prototype.move = function (mdown, pt_from, pt_to) {};
	Tool.prototype.enter = function (mdown, pt) {};
	Tool.prototype.leave = function (mdown, pt) {};
	
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
	        	this.currentStroke = null;
	            this.canvas.history.checkpoint();
	        }
	    };
	    
	    tool.prototype.draw = function () {
	    	this.currentStroke.ctx.save();
	    	this.currentStroke.restore();
	    	this.currentStroke.draw();
			this.canvas.updateDisplayCanvas();
	    	this.currentStroke.ctx.restore();
	    };
	    
	    tool.prototype._updateBoundaries = function (pt) {
	    	var stroke = this.currentStroke,
	    		canvas = stroke.ctx.canvas;
	    	if (pt.x < stroke.tl.x) {
	    		stroke.tl.x = TeledrawCanvas.util.clamp(pt.x - 50, 0, canvas.width);
	    	}
	    	if (pt.x > stroke.br.x) {
	    		stroke.br.x = TeledrawCanvas.util.clamp(pt.x + 50, 0, canvas.width);
	    	}
	    	if (pt.y < stroke.tl.y) {
	    		stroke.tl.y = TeledrawCanvas.util.clamp(pt.y - 50, 0, canvas.height);
	    	}
	    	if (pt.y > stroke.br.y) {
	    		stroke.br.y = TeledrawCanvas.util.clamp(pt.y + 50, 0, canvas.height);
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

/**
 * TeledrawCanvas.util
 */
(function (TeledrawCanvas) {
	var Util = function () { return Util; };
	var floor = Math.floor,
		min = Math.min,
		max = Math.max;
	
	Util.cssColor = function (rgba) {
	    if (rgba.length == 3) {
	        return "rgb(" +  floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + ")";
	    }
	    return "rgba(" + floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + "," + (floor(rgba[3]) / 0xFF) + ")";
	};
	
	Util.clamp = function (c, a, b) {
		return (c < a ? a : c > b ? b : c);
	};
	
	Util.opposite = function (color) {
		if (!$.isArray(color)) {
			color = TeledrawCanvas.util.parseColorString(color);
		}
		var hsl = Util.rgb2hsl(color);
		hsl[0] = (hsl[0] + 180) % 360;
		hsl[1] = 100 - hsl[1];
		hsl[2] = 100 - hsl[2];
		return Util.hsl2rgb(hsl);
	};
	
	// kill the alpha channel!
	Util.rgba2rgb = function(rgba) {
		if (rgba.length === 3 || rgba[3] === 255) {
			return rgba;
		}
		var r = rgba[0],
			g = rgba[1],
			b = rgba[2],
			a = rgba[3]/255,
			out = [];
		out[0] = (a * r) + (255 - a*255);
		out[1] = (a * g) + (255 - a*255);
		out[2] = (a * b) + (255 - a*255);
		return out;
	};
	
	Util.rgb2hex = function (rgb) {
		rgb = Util.rgba2rgb(rgb);
		return '#' + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
	};
	
	Util.hex2rgb = function (hex) {
		return Util.parseColorString(hex);
	};
	
	Util.rgb2hsl = function (rgb) {
		var r = rgb[0]/255,
			g = rgb[1]/255,
			b = rgb[2]/255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			d, h, s, l = (max + min) / 2;
		if (max == min) {
			h = s = 0;
		} else {
			d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s*100, l*100];
	};
	
	Util.hex2hsl = function (hex) {
		return Util.rgb2hsl(Util.hex2rgb(hex));
	};
	
	Util.hsl2rgb = function (hsl) {
		var m1, m2, hue;
		var r, g, b;
		var h = hsl[0],
			s = hsl[1]/100,
			l = hsl[2]/100;
		if (s == 0)
			r = g = b = (l * 255);
		else {
			if (l <= 0.5)
				m2 = l * (s + 1);
			else
				m2 = l + s - l * s;
			m1 = l * 2 - m2;
			hue = h / 360;
			r = hue2rgb(m1, m2, hue + 1/3);
			g = hue2rgb(m1, m2, hue);
			b = hue2rgb(m1, m2, hue - 1/3);
		}
		return [r, g, b];
	};
	
	function toHex(n) {
		n = parseInt(n, 10) || 0;
		n = Util.clamp(n, 0, 255).toString(16);
		if (n.length === 1) {
			n = '0'+n;
		}
		return n;
	}
	
	
	function hue2rgb(m1, m2, hue) {
		var v;
		if (hue < 0)
			hue += 1;
		else if (hue > 1)
			hue -= 1;
	
		if (6 * hue < 1)
			v = m1 + (m2 - m1) * hue * 6;
		else if (2 * hue < 1)
			v = m2;
		else if (3 * hue < 2)
			v = m1 + (m2 - m1) * (2/3 - hue) * 6;
		else
			v = m1;
	
		return 255 * v;
	}
	
	/**
	* A class to parse color values (into rgba array)
	* @author Stoyan Stefanov <sstoo@gmail.com>
	* @link   http://www.phpied.com/rgb-color-parser-in-javascript/
	* @license Use it if you like it
	*/
	Util.parseColorString = function(color_string)
	{
		var ok = false;
	 	var r, g, b, a;
	 	
		// strip any leading #
		if (color_string.charAt(0) == '#') { // remove # if any
			color_string = color_string.substr(1,6);
		}
	 
		color_string = color_string.replace(/ /g,'');
		color_string = color_string.toLowerCase();
	 
		// before getting into regexps, try simple matches
		// and overwrite the input
		var simple_colors = {
			aliceblue: 'f0f8ff',
			antiquewhite: 'faebd7',
			aqua: '00ffff',
			aquamarine: '7fffd4',
			azure: 'f0ffff',
			beige: 'f5f5dc',
			bisque: 'ffe4c4',
			black: '000000',
			blanchedalmond: 'ffebcd',
			blue: '0000ff',
			blueviolet: '8a2be2',
			brown: 'a52a2a',
			burlywood: 'deb887',
			cadetblue: '5f9ea0',
			chartreuse: '7fff00',
			chocolate: 'd2691e',
			coral: 'ff7f50',
			cornflowerblue: '6495ed',
			cornsilk: 'fff8dc',
			crimson: 'dc143c',
			cyan: '00ffff',
			darkblue: '00008b',
			darkcyan: '008b8b',
			darkgoldenrod: 'b8860b',
			darkgray: 'a9a9a9',
			darkgreen: '006400',
			darkkhaki: 'bdb76b',
			darkmagenta: '8b008b',
			darkolivegreen: '556b2f',
			darkorange: 'ff8c00',
			darkorchid: '9932cc',
			darkred: '8b0000',
			darksalmon: 'e9967a',
			darkseagreen: '8fbc8f',
			darkslateblue: '483d8b',
			darkslategray: '2f4f4f',
			darkturquoise: '00ced1',
			darkviolet: '9400d3',
			deeppink: 'ff1493',
			deepskyblue: '00bfff',
			dimgray: '696969',
			dodgerblue: '1e90ff',
			feldspar: 'd19275',
			firebrick: 'b22222',
			floralwhite: 'fffaf0',
			forestgreen: '228b22',
			fuchsia: 'ff00ff',
			gainsboro: 'dcdcdc',
			ghostwhite: 'f8f8ff',
			gold: 'ffd700',
			goldenrod: 'daa520',
			gray: '808080',
			green: '008000',
			greenyellow: 'adff2f',
			honeydew: 'f0fff0',
			hotpink: 'ff69b4',
			indianred : 'cd5c5c',
			indigo : '4b0082',
			ivory: 'fffff0',
			khaki: 'f0e68c',
			lavender: 'e6e6fa',
			lavenderblush: 'fff0f5',
			lawngreen: '7cfc00',
			lemonchiffon: 'fffacd',
			lightblue: 'add8e6',
			lightcoral: 'f08080',
			lightcyan: 'e0ffff',
			lightgoldenrodyellow: 'fafad2',
			lightgrey: 'd3d3d3',
			lightgreen: '90ee90',
			lightpink: 'ffb6c1',
			lightsalmon: 'ffa07a',
			lightseagreen: '20b2aa',
			lightskyblue: '87cefa',
			lightslateblue: '8470ff',
			lightslategray: '778899',
			lightsteelblue: 'b0c4de',
			lightyellow: 'ffffe0',
			lime: '00ff00',
			limegreen: '32cd32',
			linen: 'faf0e6',
			magenta: 'ff00ff',
			maroon: '800000',
			mediumaquamarine: '66cdaa',
			mediumblue: '0000cd',
			mediumorchid: 'ba55d3',
			mediumpurple: '9370d8',
			mediumseagreen: '3cb371',
			mediumslateblue: '7b68ee',
			mediumspringgreen: '00fa9a',
			mediumturquoise: '48d1cc',
			mediumvioletred: 'c71585',
			midnightblue: '191970',
			mintcream: 'f5fffa',
			mistyrose: 'ffe4e1',
			moccasin: 'ffe4b5',
			navajowhite: 'ffdead',
			navy: '000080',
			oldlace: 'fdf5e6',
			olive: '808000',
			olivedrab: '6b8e23',
			orange: 'ffa500',
			orangered: 'ff4500',
			orchid: 'da70d6',
			palegoldenrod: 'eee8aa',
			palegreen: '98fb98',
			paleturquoise: 'afeeee',
			palevioletred: 'd87093',
			papayawhip: 'ffefd5',
			peachpuff: 'ffdab9',
			peru: 'cd853f',
			pink: 'ffc0cb',
			plum: 'dda0dd',
			powderblue: 'b0e0e6',
			purple: '800080',
			red: 'ff0000',
			rosybrown: 'bc8f8f',
			royalblue: '4169e1',
			saddlebrown: '8b4513',
			salmon: 'fa8072',
			sandybrown: 'f4a460',
			seagreen: '2e8b57',
			seashell: 'fff5ee',
			sienna: 'a0522d',
			silver: 'c0c0c0',
			skyblue: '87ceeb',
			slateblue: '6a5acd',
			slategray: '708090',
			snow: 'fffafa',
			springgreen: '00ff7f',
			steelblue: '4682b4',
			tan: 'd2b48c',
			teal: '008080',
			thistle: 'd8bfd8',
			tomato: 'ff6347',
			turquoise: '40e0d0',
			violet: 'ee82ee',
			violetred: 'd02090',
			wheat: 'f5deb3',
			white: 'ffffff',
			whitesmoke: 'f5f5f5',
			yellow: 'ffff00',
			yellowgreen: '9acd32'
		};
		for (var key in simple_colors) {
			if (color_string == key) {
				color_string = simple_colors[key];
			}
		}
		// emd of simple type-in colors
	 
		// array of color definition objects
		var color_defs = [
		{
			re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				return [
				parseInt(bits[1]),
				parseInt(bits[2]),
				parseInt(bits[3]),
				255
				];
			}
		},
		{
			re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*\.*\d{1,3})\)$/,
			//example: ['rgba(123, 234, 45, 0.5)', 'rgba(255,234,245, .1)'],
			process: function (bits){
				return [
				parseInt(bits[1]),
				parseInt(bits[2]),
				parseInt(bits[3]),
				parseFloat(bits[4]) * 0xFF
				];
			}
		},
		{
			re: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				var rgba = Util.hsl2rgb(bits.slice(1, 4));
				rgba.push(255);
				return rgba;
			}
		},
		{
			re: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d*\.*\d{1,3})\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				var rgba = Util.hsl2rgb(bits.slice(1, 4));
				rgba.push(parseFloat(bits[4]) * 0xFF);
				return rgba;
			}
		},
		{
			re: /^(\w{2})(\w{2})(\w{2})$/,
			//example: ['#00ff00', '336699'],
			process: function (bits){
				return [
				parseInt(bits[1], 16),
				parseInt(bits[2], 16),
				parseInt(bits[3], 16),
				255
				];
			}
		},
		{
			re: /^(\w{1})(\w{1})(\w{1})$/,
			//example: ['#fb0', 'f0f'],
			process: function (bits){
				return [
				parseInt(bits[1] + bits[1], 16),
				parseInt(bits[2] + bits[2], 16),
				parseInt(bits[3] + bits[3], 16),
				255
				];
			}
		}
		];
	 
		// search through the definitions to find a match
		for (var i = 0; i < color_defs.length; i++) {
			var re = color_defs[i].re;
			var processor = color_defs[i].process;
			var bits = re.exec(color_string);
			if (bits) {
				channels = processor(bits);
				r = channels[0];
				g = channels[1];
				b = channels[2];
				a = channels[3];
				ok = true;
			}
	 
		}
	 
		// validate/cleanup values
		r = (r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r);
		g = (g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g);
		b = (b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b);
		a = (a < 0 || isNaN(a)) ? 0 : ((a > 255) ? 255 : a);
		return ok ? [r, g, b, a] : [0, 0, 0, 255];
	}
	
	TeledrawCanvas.util = Util;
})(TeledrawCanvas);

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

/**
 * Grab tool
 */
(function (TeledrawCanvas) {
	var cursorUp = "hand, grab, -moz-grab, -webkit-grab, move",
		cursorDown = "grabbing, -moz-grabbing, -webkit-grabbing, move";
	
	var Grab = TeledrawCanvas.Tool.createTool("grab", cursorUp);

	Grab.prototype.move = function (down, from, to) {
		var self = this;
		if (down) {
			clearTimeout(this._clearDeltasId);
			cancelAnimationFrame(this._momentumId);
			this.dx = to.xd - from.xd;
			this.dy = to.yd - from.yd;
			this.canvas.pan(this.dx, this.dy);
			this._clearDeltasId = setTimeout(function () {
				self.dx = self.dy = 0;
			}, 100);
		}
	};
	
	Grab.prototype.down = function (pt) {
		cancelAnimationFrame(this._momentumId);
		this.canvas.cursor(cursorDown);
	};
	
	Grab.prototype.up = function (pt) {
		cancelAnimationFrame(this._momentumId);
	    this.momentum(this.dx, this.dy);
	    this.dx = this.dy = 0;
		this.canvas.cursor(cursorUp);
	};
	
	Grab.prototype.dblclick = function (pt) {
		cancelAnimationFrame(this._momentumId);
	    this.dx = this.dy = 0;
	    this.canvas.zoom(this.canvas.state.currentZoom + 0.5, pt);
	};
	
	Grab.prototype.momentum = function (dx, dy) {
		var self = this;
		if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
			dx /= 1.1;
			dy /= 1.1;
	    	this.canvas.pan(dx, dy);
	    	this._momentumId = requestAnimationFrame(function () {
	    		self.momentum(dx, dy);
	    	});
	    }
	}
})(TeledrawCanvas);

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								   || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());/**
 * Line tool
 */
(function (TeledrawCanvas) {
	var Line = TeledrawCanvas.Tool.createTool("line", "crosshair");
	
	//Line.prototype.keydown = Canvas.ellipse.prototype.keydown;
	//Line.prototype.keyup = Canvas.ellipse.prototype.keyup;
	
	Line.stroke.prototype.lineWidth = 1;
	Line.stroke.prototype.lineCap = 'round';
	Line.stroke.prototype.bgColor = [255, 255, 255];
	Line.stroke.prototype.bgAlpha = 0;
	
	Line.stroke.prototype.start = function (pt) {
	    this.first = pt;
	};

	Line.stroke.prototype.move = function (a, b) {
	    this.second = b;
	};

	Line.stroke.prototype.end = function (pt) {
	    this.second = pt;
	};

	Line.stroke.prototype.draw = function () {
	    if (!this.first || !this.second) return;
	    var first = $.extend({}, this.first),
	    	second = $.extend({}, this.second),
	    	a, x, y, pi = Math.PI;
	    if (this.tool.shiftKey) {
	    	x = second.x - first.x;
	    	y = second.y - first.y;
	    	a = Math.atan2(y, x);
	    	
	    	if ((a >= -pi*7/8 && a < -pi*5/8) ||
	    		(a >= -pi*3/8 && a < -pi/8))
	    	{
	    		second.y = first.y - Math.abs(x); // NW, NE
	    	} else
	    	if ((a >= -pi*5/8 && a < -pi*3/8) ||
	    		(a >= pi*3/8 && a < pi*5/8))
	    	{
	    		second.x = first.x; // N, S
	    	} else
	    	if ((a >= pi/8 && a < pi*3/8) || 
	    		(a >= pi*5/8 && a < pi*7/8))
	    	{
	    		second.y = first.y + Math.abs(x); // SE, SW
	    	} else {
	    		second.y = first.y; // E, W
	    	}
	    }
	    this.points = [first, second];
	    TeledrawCanvas.tools['pencil'].stroke.prototype.draw.call(this);
	};
})(TeledrawCanvas);

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

/**
 * Rectangle tool
 */
(function (TeledrawCanvas) {
	var Rectangle = TeledrawCanvas.Tool.createTool("rectangle", "crosshair");

	Rectangle.stroke.prototype.bgColor = [255, 255, 255];
	Rectangle.stroke.prototype.bgAlpha = 0;
	Rectangle.stroke.prototype.lineWidth = 1;
	
	//Rectangle.prototype.keydown = Canvas.ellipse.prototype.keydown;
	//Rectangle.prototype.keyup = Canvas.ellipse.prototype.keyup;

	Rectangle.stroke.prototype.start = function (pt) {
	    this.first = pt;
	};

	Rectangle.stroke.prototype.move = function (a, b) {
	    this.second = b;
	};

	Rectangle.stroke.prototype.end = function (pt) {
	    this.second = pt;
	};

	Rectangle.stroke.prototype.draw = function () {
	    if (!this.first || !this.second) return;
	    var first = this.first,
	    	second = $.extend({}, this.second),
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
	    	var w = Math.abs(second.x - first.x);
	    	second.y = first.y + (second.y > first.y ? w : -w);
	    }
	    
	    if (this.tool.fill) {
	    	drawRect(ctx, first, second);
	    	ctx.fill();
	    } else {
	    	if (shadowBlur > 0) {
				ctx.shadowColor = color;
				ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
				ctx.shadowBlur = shadowBlur;
				ctx.translate(-shadowOffset,-shadowOffset);
			}
	    
	        ctx.lineWidth = lineWidth;
		    drawRect(ctx, first, second);
			ctx.stroke();	
	    }
	};
	
	function drawRect(ctx, first, second) {
	    ctx.beginPath();
	    ctx.moveTo(first.x, first.y);
	    ctx.lineTo(second.x, first.y);
	    ctx.lineTo(second.x, second.y);
	    ctx.lineTo(first.x, second.y);
	    ctx.lineTo(first.x, first.y);
	}
})(TeledrawCanvas);
