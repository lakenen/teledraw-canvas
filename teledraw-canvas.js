/*!

	Teledraw TeledrawCanvas
	Version 0.6.3 (http://semver.org/)
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

(function () {

var TRUE = true, 
	FALSE = false, 
	NULL = null, 
	UNDEFINED,
	math = Math,
	abs = math.abs, 
	floor = math.floor, 
	round = math.round,
	min = math.min, 
	max = math.max,
	pow = math.pow,
	clamp;

TeledrawCanvas = function (elt, opt) {
	return new TeledrawCanvas.api(elt, opt);
}

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version: 	0.5
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/StackBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
stackBlurCanvasRGBA = (function () {
	
	var mul_table = [
			512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
			454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
			482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
			437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
			497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
			320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
			446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
			329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
			505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
			399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
			324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
			268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
			451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
			385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
			332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
			289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];
			
	   
	var shg_table = [
			 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
			17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
			19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
			20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
			21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
			21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 
			22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
			22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 
			23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];
	
	
	var stackBlurCanvasRGBA = function( canvas, radius )
	{
		if ( isNaN(radius) || radius < 1 ) return;
		radius |= 0;
		var top_x = 0,
			top_y = 0,
			width = canvas.width,
			height = canvas.height;
		var context = canvas.getContext("2d");
		var imageData;
		
		try {
		  try {
			imageData = context.getImageData( top_x, top_y, width, height );
		  } catch(e) {
		  
			// NOTE: this part is supposedly only needed if you want to work with local files
			// so it might be okay to remove the whole try/catch block and just use
			// imageData = context.getImageData( top_x, top_y, width, height );
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData( top_x, top_y, width, height );
			} catch(e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		  }
		} catch(e) {
		  alert("Cannot access image");
		  throw new Error("unable to access image data: " + e);
		}
				
		var pixels = imageData.data;
				
		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, 
		r_out_sum, g_out_sum, b_out_sum, a_out_sum,
		r_in_sum, g_in_sum, b_in_sum, a_in_sum, 
		pr, pg, pb, pa, rbs;
				
		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = radius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;
		
		var stackStart = new BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;
		
		yw = yi = 0;
		
		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];
		
		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
			
			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3] );
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[p+3])) * rbs;
				
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;
				
				stack = stack.next;
			}
			
			
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi+3] = pa = (a_sum * mul_sum) >> shg_sum;
				if ( pa != 0 )
				{
					pa = 255 / pa;
					pixels[yi]   = ((r_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
				} else {
					pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
				}
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;
				
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;
				
				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
				
				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);
				a_in_sum += ( stackIn.a = pixels[p+3]);
				
				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				a_sum += a_in_sum;
				
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;
				
				stackOut = stackOut.next;
	
				yi += 4;
			}
			yw += width;
		}
	
		
		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
			
			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			yp = width;
			
			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;
				
				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[yi+3])) * rbs;
			   
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;
				
				stack = stack.next;
			
				if( i < heightMinus1 )
				{
					yp += width;
				}
			}
			
			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p+3] = pa = (a_sum * mul_sum) >> shg_sum;
				if ( pa > 0 )
				{
					pa = 255 / pa;
					pixels[p]   = ((r_sum * mul_sum) >> shg_sum ) * pa;
					pixels[p+1] = ((g_sum * mul_sum) >> shg_sum ) * pa;
					pixels[p+2] = ((b_sum * mul_sum) >> shg_sum ) * pa;
				} else {
					pixels[p] = pixels[p+1] = pixels[p+2] = 0;
				}
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;
			   
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;
				
				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
				
				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
				a_sum += ( a_in_sum += ( stackIn.a = pixels[p+3]));
			   
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;
				
				stackOut = stackOut.next;
				
				yi += width;
			}
		}
		
		context.putImageData( imageData, top_x, top_y );
		
	}
	
	function BlurStack()
	{
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.next = null;
	}
	return stackBlurCanvasRGBA;
})();//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

Events = (function () {
	// Backbone.Events
	// -----------------
	
  	var slice = Array.prototype.slice;
	// Regular expression used to split event strings
	var eventSplitter = /\s+/;
	
	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback functions
	// to an event; trigger`-ing an event fires all callbacks in succession.
	//
	//		 var object = {};
	//		 _.extend(object, Backbone.Events);
	//		 object.on('expand', function(){ alert('expanded'); });
	//		 object.trigger('expand');
	//
	var Events = {
	
	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	on: function(events, callback, context) {
	
		var calls, event, node, tail, list;
		if (!callback) return this;
		events = events.split(eventSplitter);
		calls = this._callbacks || (this._callbacks = {});
	
		// Create an immutable callback list, allowing traversal during
		// modification.	The tail is an empty object that will always be used
		// as the next node.
		while (event = events.shift()) {
		list = calls[event];
		node = list ? list.tail : {};
		node.next = tail = {};
		node.context = context;
		node.callback = callback;
		calls[event] = {tail: tail, next: list ? list.next : node};
		}
	
		return this;
	},
	
	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	off: function(events, callback, context) {
		var event, calls, node, tail, cb, ctx;
	
		// No events, or removing *all* events.
		if (!(calls = this._callbacks)) return;
		if (!(events || callback || context)) {
		delete this._callbacks;
		return this;
		}
	
		// Loop through the listed events and contexts, splicing them out of the
		// linked list of callbacks if appropriate.
		events = events ? events.split(eventSplitter) : _.keys(calls);
		while (event = events.shift()) {
		node = calls[event];
		delete calls[event];
		if (!node || !(callback || context)) continue;
		// Create a new list, omitting the indicated callbacks.
		tail = node.tail;
		while ((node = node.next) !== tail) {
			cb = node.callback;
			ctx = node.context;
			if ((callback && cb !== callback) || (context && ctx !== context)) {
			this.on(event, cb, ctx);
			}
		}
		}
	
		return this;
	},
	
	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	trigger: function(events) {
		var event, node, calls, tail, args, all, rest;
		if (!(calls = this._callbacks)) return this;
		all = calls.all;
		events = events.split(eventSplitter);
		rest = slice.call(arguments, 1);
	
		// For each event, walk through the linked list of callbacks twice,
		// first to trigger the event, then to trigger any `"all"` callbacks.
		while (event = events.shift()) {
		if (node = calls[event]) {
			tail = node.tail;
			while ((node = node.next) !== tail) {
			node.callback.apply(node.context || this, rest);
			}
		}
		if (node = all) {
			tail = node.tail;
			args = [event].concat(rest);
			while ((node = node.next) !== tail) {
			node.callback.apply(node.context || this, args);
			}
		}
		}
	
		return this;
	}
	
	};
	
	// Aliases for backwards compatibility.
	Events.bind	 = Events.on;
	Events.unbind = Events.off;
	
	return Events;
})();

/**
 * TeledrawCanvas.util
 */
(function (TeledrawCanvas) {
	var Util = function () { return Util; };
	
	// returns a CSS-style rgb(a) string for the given RGBA array
	Util.cssColor = function (rgba) {
	    if (rgba.length == 3) {
	        return "rgb(" +  floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + ")";
	    }
	    return "rgba(" + floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + "," + rgba[3] + ")";
	};
	
	// constrains c within a and b
	Util.clamp = clamp = function (c, a, b) {
		return (c < a ? a : c > b ? b : c);
	};
	
	// returns the opposite color. I think?
	Util.opposite = function (color) {
		if (!$.isArray(color)) {
			color = Util.parseColorString(color);
		}
		var hsl = Util.rgb2hsl(color);
		hsl[0] = (hsl[0] + 180) % 360;
		hsl[1] = 100 - hsl[1];
		hsl[2] = 100 - hsl[2];
		var rgb = Util.hsl2rgb(hsl);
		if (color.length === 4) {
			rgb.push(color[3]);
		}
		return rgb;
	};
	
	// kill the alpha channel!
	Util.rgba2rgb = function(rgba) {
		if (rgba.length === 3 || rgba[3] === 255) {
			return rgba;
		}
		var r = rgba[0],
			g = rgba[1],
			b = rgba[2],
			a = rgba[3],
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
			_max = max(r, g, b),
			_min = min(r, g, b),
			d, h, s, l = (_max + _min) / 2;
		if (_max == _min) {
			h = s = 0;
		} else {
			d = _max - _min;
			s = l > 0.5 ? d / (2 - _max - _min) : d / (_max + _min);
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
		n = clamp(n, 0, 255).toString(16);
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
	
	// parses any valid css color into an RGBA array
	Util.parseColorString = function(color_string)
	{
		function getRGB(str) { 
			var a = document.createElement('a');
			a.style.color = str;
			document.body.appendChild(a);
			var color = getComputedStyle(a).color;
			document.body.removeChild(a);
			return color;
		}
		
	 	var ok = false, r, g, b, a;
	 	color_string = getRGB(color_string);
	 	
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
				1
				];
			}
		},
		{
			re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(\.\d+)?)\)$/,
			//example: ['rgba(123, 234, 45, 0.5)', 'rgba(255,234,245, .1)'],
			process: function (bits){
				return [
				parseInt(bits[1]),
				parseInt(bits[2]),
				parseInt(bits[3]),
				parseFloat(bits[4])
				];
			}
		}];
	 
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
		a = (a < 0 || isNaN(a)) ? 0 : ((a > 1) ? 1 : a);
		return ok ? [r, g, b, a] : [0, 0, 0, 1];
	}
	
	TeledrawCanvas.util = Util;
})(TeledrawCanvas);


(function (TeledrawCanvas) {
	TeledrawCanvas.canvases = [];
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
		mouseDown: FALSE,
		mouseOver: FALSE,
		width: null,
		height: null,
		
		currentZoom: 1,
		currentOffset: { x: 0, y: 0 },
		
		// if you are using strokeSoftness, make sure shadowOffset >= max(canvas.width, canvas.height)
		// related note: safari has trouble with high values for shadowOffset
		shadowOffset: 5000,
		
		// default limits
		maxHistory: 10,
		minStrokeSize: 500,
		maxStrokeSize: 10000,
		minStrokeSoftness: 0,
		maxStrokeSoftness: 100,
		maxZoom: 8 // (8 == 800%)
	};
	
	var Canvas = Canvas || function (w, h) {
		var c = document.createElement('canvas');
		c.width = w; c.height = h;
		return c;
	};
	
	var API = function (elt, options) {
		var self = this,
			element = self.element = $(elt),
			state = self.state = $.extend({}, defaultState, options);
		
		if (typeof element.get(0).getContext != 'function') {
			alert('Your browser does not support HTML canvas!');
			return;
		}
		
		state.width = state.displayWidth || state.width || parseInt(element.attr('width'));
		state.height = state.displayHeight || state.height || parseInt(element.attr('height'));
		state.fullWidth = state.fullWidth || state.width;
		state.fullHeight = state.fullHeight || state.height;
		
		if (state.width / state.height !== state.fullWidth / state.fullHeight) {
			//Display and full canvas aspect ratios differ!
			//Adjusting full size to match display aspect ratio...
			state.fullHeight = state.fullWidth * state.height / state.width;
		}
		
		element.attr({
			width: state.width,
			height: state.height
		});
		
		self._displayCanvas = $(element).get(0);
		
		self._canvas = new Canvas(state.fullWidth, state.fullHeight);
		
		self.history = new TeledrawCanvas.History(this);
		
		self.defaults();
		self.zoom(0);
		self.history.checkpoint();
		TeledrawCanvas.canvases[_id++] = self;
		
		var gInitZoom;
		element.css({ width: state.width, height: state.height })
			.bind('gesturestart', function (evt) {
	    		if (state.tool.name == 'grab') {
					gInitZoom = state.currentZoom;
	    		}
			})
			.bind('gesturechange', function (evt) {
	    		if (state.tool.name == 'grab') {
	    			var pt = state.last;//$.extend({},state.last);
	    			self.zoom(gInitZoom*evt.originalEvent.scale, pt.xd, pt.yd);
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
	            state.mouseOver = TRUE;
	        })      
	        .bind('mousedown touchstart', mouseDown)
	        .bind('mouseleave', function (evt) {
	            var pt = getCoord(evt);
	            state.tool.leave(state.mouseDown, pt);
	            state.mouseOver = FALSE;
	        });
        
        
	    $(window).bind('mousemove touchmove', mouseMove);
	   
	    var lastMoveEvent = null;
	    function mouseMove(e) {
	    	if (e.type == 'touchmove' && e.originalEvent.touches.length > 1) {
	    		return TRUE;
	    	}
	    	if (lastMoveEvent == 'touchmove' && e.type == 'mousemove') return;
	    	target = $(e.target).parents().andSelf();
	        if (target.is(element) || state.mouseDown) {
	        	var pt = getCoord(e);
				state.tool.move(state.mouseDown, state.last, pt);
				state.last = pt;
				self.trigger('mousemove', pt, e);
	            lastMoveEvent = e.type;
            	e.preventDefault();
	        }
	    }

	    function mouseDown(e) {
            var pt = state.last = getCoord(e);
	    	if (e.type == 'touchstart' && e.originalEvent.touches.length > 1) {
	    		return TRUE;
	    	}
            $(window)
                .one('mouseup touchend', mouseUp);
            
			state.mouseDown = TRUE;
			state.tool.down(pt);
			self.trigger('mousedown', pt, e);
			
        	document.onselectstart = function() { return FALSE; };
        	e.preventDefault();
        }
	    
	    function mouseUp(e) {
	    	if (e.type == 'touchend' && e.originalEvent.touches.length > 1) {
	    		return TRUE;
	    	}
	    	
			state.mouseDown = FALSE;
			state.tool.up(state.last);
			self.trigger('mouseup', state.last, e);
        
        	document.onselectstart = function() { return TRUE; };
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
	
	var APIprototype = API.prototype;
	
	
	APIprototype.setRGBAArrayColor = function (rgba) {
		var state = this.state;
		if (rgba.length === 4) {
			state.globalAlpha = rgba.pop();
		}
		for (var i = rgba.length; i < 3; ++i) {
			rgba.push(0);
		}
		state.color = rgba;
		this.updateTool();
	};
	
	APIprototype.updateTool = function () {
		var lw = 1 + floor(pow(this.state.strokeSize / 1000.0, 2));
		var sb = floor(pow(this.state.strokeSoftness, 1.3) / 300.0 * lw);
		this.state.lineWidth = lw;
		this.state.shadowBlur = sb;
	};
	
	APIprototype.updateDisplayCanvas = function () {
		var dctx = this._displayCtx || (this._displayCtx = this._displayCanvas.getContext('2d')),
			off = this.state.currentOffset,
			zoom = this.state.currentZoom, 
			dw = dctx.canvas.width,
			dh = dctx.canvas.height,
			sw = dw / zoom,
			sh = dh / zoom;
		dctx.clearRect(0, 0, dw, dh);
		this.trigger('display.update:before');
		dctx.drawImage(this._canvas, off.x, off.y, sw, sh, 0, 0, dw, dh);
		this.trigger('display.update:after');
	};
	
	/* this version attempts at better performance, but I don't think it is actually significantly better.
	APIprototype.updateDisplayCanvas = function (tl, br) {
		var dctx = this._displayCtx || (this._displayCtx = this._displayCanvas.getContext('2d')),
			off = this.state.currentOffset,
			zoom = this.state.currentZoom,
			// bounding rect of the change
			stl = tl || { x: 0, y: 0 },
			sbr = br || { x: this._canvas.width, y: this._canvas.height },
			dtl = { x: floor((stl.x - off.x)*zoom), y: floor((stl.y - off.y)*zoom) },
			dbr = { x: floor((sbr.x - off.x)*zoom), y: floor((sbr.y - off.y)*zoom) },
			sw = sbr.x - stl.x,
			sh = sbr.y - stl.y,
			dw = dbr.x - dtl.x,
			dh = dbr.y - dtl.y;
		if (sw === 0 || sh === 0) {
			return;
		}
		// only clear and draw what we need to
		dctx.clearRect(dtl.x, dtl.y, dw, dh);
		dctx.drawImage(this._canvas, stl.x, stl.y, sw, sh, dtl.x, dtl.y, dw, dh);
	};
	*/
	
	
	// API
	
	// returns the HTML Canvas element associated with this tdcanvas
	APIprototype.canvas = function () {
	    return this._canvas;
	};

	// returns a 2d rendering context for the canvas element
	APIprototype.ctx = function () {
	    return this._ctx || (this._ctx = this._canvas.getContext('2d'));
	};
	
	// sets the cursor css to be used when the mouse is over the canvas element
	APIprototype.cursor = function (c) {
	    if (!c) {
	        c = "default";
	    }
	    var cursors = c.split(/,\s*/);
	    do {
	    	c = cursors.shift();
	    	this.element.css('cursor', c);
	    } while (c.length && this.element.css('cursor') != c);
	    return this;
	};
	
	// clears the canvas and (unless noCheckpoint===TRUE) pushes to the undoable history
	APIprototype.clear = function (noCheckpoint) {
	    var self = this,
			ctx = self.ctx();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if (noCheckpoint !== TRUE) {
			self.history.checkpoint();
		}
		self.updateDisplayCanvas();
		return self;
	};
	
	// resets the default tool and properties
	APIprototype.defaults = function () {
		var self = this;
		self.setTool('pencil');
		self.setAlpha(defaults.alpha);
		self.setColor(defaults.color);
		self.setStrokeSize(defaults.strokeSize);
		self.setStrokeSoftness(defaults.strokeSoftness);
		return self;
	};
	
	// returns a data url (image/png) of the canvas,
	// optionally a portion of the canvas specified by x, y, w, h
	APIprototype.toDataURL = function (x, y, w, h) {
		if (w && h) {
			w = parseInt(w);
			h = parseInt(h);
			x = x !== UNDEFINED ? x : 0;
			y = y !== UNDEFINED ? y : 0;
			
			var tmpcanvas = $('<canvas>').attr({
				width: w,
				height: h
			}).get(0);
			tmpcanvas.getContext('2d').drawImage(this.canvas(), x, y, w, h, 0, 0, w, h);
			return tmpcanvas.toDataURL();
		}
		return this.canvas().toDataURL();
	};
	
	// returns a new (blank) canvas element the same size as this tdcanvas element
	APIprototype.getTempCanvas = function (w, h) {
		var tmp = $('<canvas>').get(0);
		tmp.width = w || this._canvas.width;
		tmp.height = h || this._canvas.height;
		return tmp;
	};

	// draws an image data url to the canvas and when it's finished, calls the given callback function
	APIprototype.fromDataURL = function (url, cb) {
		var self = this,
			img = new Image();
		img.onload = function () {
			self.clear(TRUE);
			self.ctx().drawImage(img, 0, 0);
			self.updateDisplayCanvas();
			if (typeof cb == 'function') {
				cb.call(self);
			}
		};
		img.src = url;
		return self;
	};

	// returns the ImageData of the whole canvas element
	APIprototype.getImageData = function () {
		var ctx = this.ctx();
	    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	// sets the ImageData of the canvas
	APIprototype.putImageData = function (data) {
		this.ctx().putImageData(data, 0, 0);
		this.updateDisplayCanvas();
		return this;
	};
	
	// returns the current color in the form [r, g, b, a] (where each can be [0,255])
	APIprototype.getColor = function () {
	    return this.state.color.slice();
	};
	
	// sets the current color, either as an array (see getColor) or any acceptable css color string
	APIprototype.setColor = function (color) {
		if (!$.isArray(color)) {
			color = TeledrawCanvas.util.parseColorString(color);
		}
		this.setRGBAArrayColor(color);
		return this;
	};
	
	// sets the current alpha to a, where a is a number in [0,1]
	APIprototype.setAlpha = function (a) {
		this.state.globalAlpha = clamp(a, 0, 1);
		return this;
	};
	
	// returns the current alpha
	APIprototype.getAlpha = function () {
		return this.state.globalAlpha;
	};
	
	// sets the current stroke size to s, where a is a number in [minStrokeSize, maxStrokeSize]
	// lineWidth = 1 + floor(pow(strokeSize / 1000.0, 2));
	APIprototype.setStrokeSize = function (s) {
		this.state.strokeSize = clamp(s, this.state.minStrokeSize, this.state.maxStrokeSize);
		this.updateTool();
		return this;
	};
	
	// sets the current stroke size to s, where a is a number in [minStrokeSoftness, maxStrokeSoftness]
	APIprototype.setStrokeSoftness = function (s) {
		this.state.strokeSoftness = clamp(s, this.state.minStrokeSoftness, this.state.maxStrokeSoftness);
		this.updateTool();
		return this;
	};
	
	// set the current tool, given the string name of the tool (e.g. 'pencil')
	APIprototype.setTool = function (name) {
		this.state.previousTool = this.state.currentTool;
		this.state.currentTool = name;
		if (!TeledrawCanvas.tools[name]) {
			throw new Error('Tool "'+name+'" not defined.');
		}
		this.state.tool = new TeledrawCanvas.tools[name](this);
		this.updateTool();
		return this;
	};
	
	
	APIprototype.previousTool = function () {
		return this.setTool(this.state.previousTool);
	};
	
	// undo to the last history checkpoint (if available)
	APIprototype.undo = function () {
		this.history.undo();
		return this;
	};
	
	// redo to the next history checkpoint (if available)
	APIprototype.redo = function () {
		this.history.redo();
		return this;
	};
	
	// resize the display canvas to the given width and height
	// (throws an error if it's not the same aspect ratio as the source canvas)
	// @todo/consider: release this constraint and just change the size of the source canvas?
	APIprototype.resize = function (w, h) {
		var self = this;
		if (w/h !== self._canvas.width/self._canvas.height) {
			throw new Error('Not the same aspect ratio!');
		}
		self._displayCanvas.width = w;
		self._displayCanvas.height = h;
		self.updateDisplayCanvas();
		return self;
	};
	
	// zoom the canvas to the given multiplier, z (e.g. if z is 2, zoom to 2:1)
	// optionally at a given point (in display canvas coordinates)
	// otherwise in the center of the current display
	APIprototype.zoom = function (z, x, y) {
		var self = this,
			panx = 0, 
			pany = 0,
			currentZoom = self.state.currentZoom,
			displayWidth = self._displayCanvas.width,
			displayHeight = self._displayCanvas.height;
			
		// if no point is specified, use the center of the canvas
		x = clamp(x || displayWidth/2, 0, displayWidth);
		y = clamp(y || displayHeight/2, 0, displayHeight);
		
		// restrict the zoom
		z = clamp(z || 0, displayWidth / self._canvas.width, self.state.maxZoom);
		if (z !== currentZoom) {
			if (z > currentZoom) {
				// zooming in
				panx = -(displayWidth/currentZoom - displayWidth/z)/2 - (x - displayWidth/2)/currentZoom;
				pany = -(displayHeight/currentZoom - displayHeight/z)/2 - (y - displayHeight/2)/currentZoom;
			} else if (z < currentZoom) {
				// zooming out
				panx = (displayWidth/z - displayWidth/currentZoom)/2;
				pany = (displayHeight/z - displayHeight/currentZoom)/2;
			}
			panx *= z;
			pany *= z;
		}
		//console.log(panx, pany);
		self.state.currentZoom = z;
		self.trigger('zoom', z, currentZoom);
		self.pan(panx, pany);
		self.updateDisplayCanvas();
		return self;
	};
	
	// pan the canvas to the given (relative) x,y position
	// unless absolute === TRUE
	APIprototype.pan = function (x, y, absolute) {
		var self = this,
			zoom = self.state.currentZoom,
			currentX = self.state.currentOffset.x,
			currentY = self.state.currentOffset.y,
			maxWidth = self._canvas.width - self._displayCanvas.width/zoom,
			maxHeight = self._canvas.height - self._displayCanvas.height/zoom;
		x = absolute === TRUE ? x/zoom : currentX - (x || 0)/zoom;
		y = absolute === TRUE ? y/zoom : currentY - (y || 0)/zoom;
		self.state.currentOffset = {
			x: floor(clamp(x, 0, maxWidth)),
			y: floor(clamp(y, 0, maxHeight))
		};
		self.trigger('pan', x, y);
		self.updateDisplayCanvas();
		return self;
	};
	
	// events mixin
	$.extend(APIprototype, Events);
	TeledrawCanvas.api = API;
})(TeledrawCanvas);
/**
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
	    if (!stack_from.length) return FALSE;
	    if (!this.current) return FALSE;
	    stack_to.push(this.current);
		this.current = stack_from.pop();
		this.current.restore();
		return TRUE;
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
		var tl, br;
		if (stroke) {
			tl = stroke.tl;
			br = stroke.br;
		} else {
			tl = { x:0, y:0 };
			br = { x:this.canvas.canvas().width, y:this.canvas.canvas().height };
		}
		this._restoreBufferCanvas(tl, br);
		this.canvas.updateDisplayCanvas(tl, br);
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
	Tool.prototype.move = function (mouseDown, from, to) {};
	Tool.prototype.dblclick = function (pt) {};
	Tool.prototype.enter = function (mouseDown, pt) {};
	Tool.prototype.leave = function (mouseDown, pt) {};
	Tool.prototype.keydown = function (mdown, key) {};
	Tool.prototype.keyup = function (mdown, key) {};
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
	        	this.currentStroke = null;
	            this.canvas.history.checkpoint();
	        }
	        this.canvas.trigger('tool.up');
	    };
	    
	    tool.prototype.draw = function () {
	    	this.currentStroke.ctx.save();
	    	this.currentStroke.restore();
	    	this.currentStroke.draw();
			this.canvas.updateDisplayCanvas(this.currentStroke.tl, this.currentStroke.br);
	    	this.currentStroke.ctx.restore();
	    };
	    
	    tool.prototype._updateBoundaries = function (pt) {
	    	var stroke = this.currentStroke,
	    		canvas = stroke.ctx.canvas,
	    		strokeSize = this.canvas.state.shadowBlur+this.canvas.state.lineWidth;
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

/**
 * Ellipse tool
 */
(function (TeledrawCanvas) {
	var Ellipse = TeledrawCanvas.Tool.createTool("ellipse", "crosshair"),
		EllipseStrokePrototype = Ellipse.stroke.prototype;

	EllipseStrokePrototype.bgColor = [255, 255, 255];
	EllipseStrokePrototype.bgAlpha = 0;
	EllipseStrokePrototype.lineWidth = 1;
	
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

/**
 * Fill tool
 */
(function (TeledrawCanvas) {
	var Fill = TeledrawCanvas.Tool.createTool("fill", "crosshair");
	var abs = Math.abs;
	
	Fill.blur = true;
	Fill.stroke.prototype.bgColor = [255, 255, 255];
	Fill.stroke.prototype.bgAlpha = 255;


	Fill.stroke.prototype.end = function (target) {
		var w = this.ctx.canvas.width, h = this.ctx.canvas.height;
		var pixels = this.ctx.getImageData(0,0, w,h);
		var fill_mask = this.ctx.createImageData(w,h);
		var color = this.color;
		color[3]*=0xFF;
		floodFillScanlineStack(pixels.data, fill_mask.data, target, w, h, this.color);
		this.tmp_canvas = $('<canvas>').attr({width: w, height: h}).get(0);
		var tmp_ctx = this.tmp_canvas.getContext('2d');
		tmp_ctx.putImageData(fill_mask, 0, 0);
		
		if (Fill.blur) {
			stackBlurCanvasRGBA(this.tmp_canvas, 1);
			var tmp_data = tmp_ctx.getImageData(0, 0, w, h);
			for (var i = 0, l = tmp_data.data.length; i < l; i += 4) {
				if (tmp_data.data[i+3]/0xFF > 0.2) {
					tmp_data.data[i] = color[0];
					tmp_data.data[i+1] = color[1];
					tmp_data.data[i+2] = color[2];
					tmp_data.data[i+3] = Math.min(color[3], tmp_data.data[i+3] * 3);
				}
			}
			tmp_ctx.putImageData(tmp_data, 0, 0);
		}
	};

	Fill.stroke.prototype.draw = function () {
		if (this.tmp_canvas) {
        	this.ctx.drawImage(this.tmp_canvas, 0, 0);
    	}
	};
	
	function floodFillScanlineStack(dataFrom, dataTo, target, w, h, newColor) {
		var stack = [[target.x, target.y]];
		var oldColor = getColor(dataFrom, target.x, target.y, w);
		var tolerance = Fill.tolerance;
		var spanLeft, spanRight;
		var color, dist, pt, x, y, y1;
		var oppColor = TeledrawCanvas.util.opposite(oldColor);
		oppColor[3]/=2;
		while (stack.length) {
			pt = stack.pop();
			x = pt[0];
			y1 = y = pt[1];
        	while (y1 >= 0 && colorsEqual(getColor(dataFrom, x, y1, w), oldColor)) y1--;
			y1++;
			spanLeft = spanRight = false;
			
			while(y1 < h && colorsEqual(getColor(dataFrom, x, y1, w), oldColor))
        	{
				setColor(dataFrom, x, y1, w, oppColor);
				setColor(dataTo, x, y1, w, newColor);
				if (!spanLeft && x > 0 && colorsEqual(getColor(dataFrom, x - 1, y1, w), oldColor)) 
				{
					stack.push([x - 1, y1]);
					spanLeft = true;
				}
				else if (spanLeft && x > 0 && colorsEqual(getColor(dataFrom, x - 1, y1, w), oldColor))
				{
					spanLeft = false;
				}
				if (!spanRight && x < w - 1 && colorsEqual(getColor(dataFrom, x + 1, y1, w), oldColor))
				{
					stack.push([x + 1, y1]);
					spanRight = true;
				}
				else if (spanRight && x < w - 1 && colorsEqual(getColor(dataFrom, x + 1, y1, w), oldColor))
				{
					spanRight = false;
				} 
				y1++;
			}
		}
	}
	
	function getColor(data, x, y, w) {
		var start = (y * w + x) * 4;
		return [
			data[start],
			data[start+1], 
			data[start+2], 
			data[start+3]
		];
	}
	
	function setColor(data, x, y, w, color) {
		var start = (y * w + x) * 4;
		data[start] = color[0];
		data[start+1] = color[1];
		data[start+2] = color[2];
		data[start+3] = color[3];
	}
	
	function colorDistance(col1, col2) {
		return abs(col1[0] - col2[0]) + 
				abs(col1[1] - col2[1]) + 
				abs(col1[2] - col2[2]) + 
				abs(col1[3] - col2[3]);
	}
	
	function colorsEqual(col1, col2) {
		return colorDistance(col1, col2) < 5;
	}
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
	    this.canvas.zoom(this.canvas.state.currentZoom*2, pt.xd, pt.yd);
	};
	
	Grab.prototype.momentum = function (dx, dy) {
		var self = this;
		if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
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

})();

