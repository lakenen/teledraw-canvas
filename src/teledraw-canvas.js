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
		var lw = 1 + floor(pow((this.state.strokeSize) / 1000.0, 2));
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
})();