/*!

	Teledraw TeledrawCanvas
	Version 1.0
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
	var floor = Math.floor,
		pow = Math.pow,
		clamp = function (c, a, b) {
			return (c < a ? a : c > b ? b : c);
		};
		
	var _canvases = [];
	var _id = 0;
	
	var defaults = {
		tool: 'pencil',
		alpha: 255,
		color: [0, 0, 0],
		strokeSize: 1000,
		strokeSoftness: 0
	};
	var defaultState = {
		color: [0, 0, 0],
		globalAlpha: 255,
		strokeSize: 1000,
		strokeSoftness: 5,
		last: null,
		currentTool: null,
		previousTool: null,
		tool: null,
		mouse_down: false,
		mouse_over: false,
		width: null,
		height: null,
		shadowOffset: 2000,
		max_history: 10
	};
	
	var TeledrawCanvas = function (elt) {
		if (typeof elt.getContext == 'function') {
			this._canvas = elt;
		} else {
			this._canvas = $(elt).get(0);
		}
		var element = this.element = $(elt);
		var container = this.container = element.parent();
		var state = this.state = $.extend({}, defaultState);
		var canvas = this;
		this.drawHandlers  = [];
		this.history = new TeledrawCanvas.History(this);
		//this.history.checkpoint();
		
		state.width = parseInt(element.attr('width'));
		state.height = parseInt(element.attr('height'));
		if (typeof element.get(0).getContext != 'function') {
			alert('Your browser does not support HTML canvas!');
			return;
		}
		container
			.addClass('noselect')
			.bind('mouseenter', function (evt) {
	            var pt = getCoord(evt);
	            state.tool.enter(state.mouse_down, pt);
	            state.last = pt;
	            state.mouse_over = true;
	        })      
	        .bind('mousedown touchstart', mouseDown)
	        .bind('mouseleave', function (evt) {
	            var pt = getCoord(evt);
	            state.tool.leave(state.mouse_down, pt);
	            state.mouse_over = false;
	        });
        
        
	    $(window).bind('mousemove touchmove', mouseMove);
	   
	    var canvasElt = element.get(0);
	    var lastMoveEvent = null;
	    function mouseMove(e) {
	    	if (e.type == 'touchmove' && e.originalEvent.touches.length > 1) {
	    		return true;
	    	}
	    	if (lastMoveEvent == 'touchmove' && e.type == 'mousemove') return;
	    	target = $(e.target).parents().andSelf();
	        if (target.is(element) || state.mouse_down) {
	            var next = getCoord(e);
	            state.tool.move(state.mouse_down, state.last, next);
	            state.last = next;
	            lastMoveEvent = e.type;
            	e.preventDefault();
	        }
	    }

	    function mouseDown(e) {
	    	if (e.type == 'touchstart' && e.originalEvent.touches.length > 1) {
	    		return true;
	    	}
            var pt = state.last = getCoord(e);
            state.mouse_down = true;
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
        	state.mouse_down = false;
            document.onselectstart = function() { return true; };
            state.tool.up(state.last);
        	e.preventDefault();
	    }
	    
		function getCoord(e) {
	        var offset = element.offset(),
		        pageX = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX,
				pageY = e.pageY || e.originalEvent.touches && e.originalEvent.touches[0].pageY;
	        return {x: floor(pageX - offset.left) || 0, y: floor(pageY - offset.top) || 0};
		}
		
		this.defaults();
		this.history.checkpoint();
		_canvases[_id++] = this;
	};
	
	TeledrawCanvas.canvases = _canvases;
	
	
	TeledrawCanvas.prototype.canvas = function () {
	    return this._canvas;
	};

	TeledrawCanvas.prototype.cursor = function (c) {
	    if (!c) {
	        c = "default";
	    }
	    this.container.css('cursor', c);
	};

	TeledrawCanvas.prototype.ctx = function () {
	    return this._ctx || (this._ctx = this.canvas().getContext('2d'));
	};
	
	TeledrawCanvas.prototype.clear = function (nocheckpoint) {
	    var ctx = this.ctx();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if (nocheckpoint !== true) {
			this.history.checkpoint();
		}
	};
	
	TeledrawCanvas.prototype.defaults = function () {
		this.setTool('pencil');
		this.setAlpha(defaults.alpha);
		this.setColor(defaults.color);
		this.setStrokeSize(defaults.strokeSize);
		this.setStrokeSoftness(defaults.strokeSoftness);
	};
	
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
	
	TeledrawCanvas.prototype.getRevision = function (rev) {
		return this.history.getRevision(rev);
	};
	TeledrawCanvas.prototype.setRevision = function (data) {
		this.fromDataURL(data.data, function () {
			this.history.setRevision(data.rev);
		});
	};

	TeledrawCanvas.prototype.getTempCanvas = function (w, h) {
		var tmp = $('<canvas>').get(0);
		tmp.width = w || this._canvas.width;
		tmp.height = h || this._canvas.height;
		return tmp;
	};

	TeledrawCanvas.prototype.fromDataURL = function (url, cb) {
		var self = this,
			img = new Image();
		img.onload = function () {
			self.clear(true);
			self.ctx().drawImage(img, 0, 0);
			//self.history.checkpoint();
			if (typeof cb == 'function') {
				cb.call(self);
			}
		};
		img.src = url;
	};

	TeledrawCanvas.prototype.getImageData = function () {
		var ctx = this.ctx();
	    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	TeledrawCanvas.prototype.putImageData = function (data) {
		this.ctx().putImageData(data, 0, 0);
	};
	
	TeledrawCanvas.prototype.getColor = function () {
	    return this.state.color.slice();
	};
	
	TeledrawCanvas.prototype.setColor = function (rgba) {
		var state = this.state;
		if (rgba.length === 4) {
			state.globalAlpha = rgba.pop();
		}
		state.color = rgba;
		this._updateTool();
	};
	
	TeledrawCanvas.prototype.setHexColor =  function (hex, track) {
		this.setColor(TeledrawCanvas.hex2rgb(hex));
	};
	
	TeledrawCanvas.prototype.getHexColor = function () {
		return TeledrawCanvas.rgb2hex(this.state.color);
	};

	TeledrawCanvas.prototype.setAlpha = function (a) {
		this.state.globalAlpha = clamp(a, 0, 255);
		this._updateTool();
	};
	
	TeledrawCanvas.prototype.getAlpha = function () {
		return this.state.globalAlpha;
	};
	
	TeledrawCanvas.prototype.setStrokeSize = function (s) {
		this.state.strokeSize = clamp(s, 500, 10000);
		this._updateTool();
	};
	
	TeledrawCanvas.prototype.setStrokeSoftness = function (s) {
		this.state.strokeSoftness = clamp(s, 0, 60);
		this._updateTool();
	};
	
	TeledrawCanvas.prototype.setTool = function (name) {
		this.state.previousTool = this.state.currentTool;
		this.state.currentTool = name;
		if (!TeledrawCanvas.tools[name]) {
			throw new Error('Tool "'+name+'" not defined.');
		}
		this.state.tool = new TeledrawCanvas.tools[name](this);
		this._updateTool();
	};
	
	TeledrawCanvas.prototype.undo = function () {
		//if (this.history.hasRevision(this.history.rev-1)) {
			this.history.undo();
		//}
	};
	
	TeledrawCanvas.prototype.redo = function () {
		//if (this.history.hasRevision(this.history.rev+1)) {
			this.history.redo();
		//}
	};
	
	TeledrawCanvas.prototype.action = function (action) {
		switch (action.type) {
			case 'state':
				this._updateState(action.state);
				break;
			case 'clear':
				this.clear();
				break;
			case 'undo':
				if (!this.history.hasRevision(action.rev)) {
				} else {
					this.history.undo();
				}
				break;
			case 'redo':
				if (!this.history.hasRevision(action.rev)) {
				} else {
					this.history.redo();
				}
				break;
			case 'down':
            	this.state.tool.down(arr2coord(action.pt));
				break;
			case 'move':
				if (action.pts.length === 2) {
	        		this.state.tool.move(true, arr2coord(action.pts[0]), arr2coord(action.pts[1]));
	        	} else {
	        		for (var i = 1, l = action.pts.length; i < l; ++i) {
	        			this.state.tool.move(true, arr2coord(action.pts[i-1]), arr2coord(action.pts[i]));
					}
	        	}
				break;
			case 'up':
            	this.state.tool.up(arr2coord(action.pt));
				break;
		}
	};
	
	TeledrawCanvas.prototype.resize = function (w, h) {
		var tmpcanvas = $(this._canvas).clone().get(0);
		tmpcanvas.getContext('2d').drawImage(this._canvas,0,0);
		this._canvas.width = w;
		this._canvas.height = h;
		this.ctx().drawImage(tmpcanvas, 0, 0, tmpcanvas.width, tmpcanvas.height, 0, 0, w, h);
	};
	
	TeledrawCanvas.prototype._updateState = function (state) {
		$.extend(this.state, state);
		this.setTool(state.currentTool, true);
	};
	
	TeledrawCanvas.prototype._updateTool = function () {
		var lw = 1 + floor(pow(this.state.strokeSize / 1000.0, 2));
		var sb = floor(pow(this.state.strokeSoftness, 1.3) / 300.0 * lw);
		this.state.lineWidth = lw;
		this.state.shadowBlur = sb;
	};
	
	
	/***** Class methods *****/
	
	TeledrawCanvas.rgba2rgb = function(rgba) {
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
	
	TeledrawCanvas.rgb2hex = function (rgb) {
		rgb = TeledrawCanvas.rgba2rgb(rgb);
		function toHex(n) {
			n = parseInt(n, 10);
			if (isNaN(n)) {
				return "00";
			}
			n = Math.max(0, Math.min(n, 255));
			return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
		}
		return '#' + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
	};
	
	TeledrawCanvas.hex2rgb = function (hex) {
		var r = 255, g = 255, b = 255;
		hex = hex.replace(' ','');
	    hex = (hex.charAt(0) == "#" ? hex.substr(1) : hex);
	    if (hex.length == 6) {
	    	r = parseInt(hex.substring(0, 2), 16);
	    	g = parseInt(hex.substring(2, 4), 16);
	    	b = parseInt(hex.substring(4, 6), 16);
	    } else if (hex.length == 3) {
	    	r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
	    	g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
	    	b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
	    }
	    return [r, g, b];
	};
	
	TeledrawCanvas.rgb2hsl = function (rgb) {
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
		return [h, s, l];
	};
	
	TeledrawCanvas.hex2hsl = function (hex) {
		return TeledrawCanvas.rgb2hsl(TeledrawCanvas.hex2rgb(hex));
	};
	
	TeledrawCanvas.cssColor = function (rgba) {
	    if (rgba.length == 3) {
	        return "rgb(" +  floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + ")";
	    }
	    return "rgba(" + floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + "," + (floor(rgba[3]) / 0xFF) + ")";
	};
	
	function coord2arr(coord) {
		return [coord.x, coord.y];
	}
	
	function arr2coord(arr) {
		return {x: arr[0], y: arr[1]};
	}
	
	TeledrawCanvas.clamp = clamp;
	return TeledrawCanvas;
})();
