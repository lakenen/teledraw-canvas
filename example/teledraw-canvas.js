/*!

	Teledraw Canvas
	Version 0.9.4 (http://semver.org/)
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
})();
//     Backbone.js 0.9.2

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


// written by Dean Edwards, 2005
// with input from Tino Zijdel, Matthias Miller, Diego Perini

// http://dean.edwards.name/weblog/2005/10/add-event/

// modified to support mouseenter and mouseleave events

function addEvent(element, type, handler) {
	// add mouseenter and mouseleave events
	if (type === 'mouseenter' || type === 'mouseleave') {
		var mouseEnter = type === 'mouseenter',
			ie = mouseEnter ? 'fromElement' : 'toElement';
		type = mouseEnter ? 'mouseover' : 'mouseout';
		addEvent(element, type, function (e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
				related = e.relatedTarget || e[ie];
			if ((element === target || contains(element, target)) &&
				!contains(element, related))
			{
				return handler.apply(this, arguments);
			}
		});
		return;
	}

	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		// assign each event handler a unique ID
		if (!handler.$$guid) handler.$$guid = addEvent.guid++;
		// create a hash table of event types for the element
		if (!element.events) element.events = {};
		// create a hash table of event handlers for each element/event pair
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			// store the existing event handler (if there is one)
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			}
		}
		// store the event handler in the hash table
		handlers[handler.$$guid] = handler;
		// assign a global event handler to do all the work
		element["on" + type] = handleEvent;
	}
};
// a counter used to create unique IDs
addEvent.guid = 1;

function removeEvent(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler, false);
	} else {
		// delete the event handler from the hash table
		if (element.events && element.events[type]) {
			delete element.events[type][handler.$$guid];
		}
	}
};

function handleEvent(event) {
	var returnValue = true;
	// grab the event object (IE uses a global event object)
	event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
	// get a reference to the hash table of event handlers
	var handlers = this.events[event.type];
	// execute each event handler
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			returnValue = false;
		}
	}
	return returnValue;
};

function fixEvent(event) {
	// add W3C standard event methods
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
};
fixEvent.preventDefault = function() {
	this.returnValue = false;
};
fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
};

function contains(container, maybe) {
    return container.contains ? container.contains(maybe) :
        !!(container.compareDocumentPosition(maybe) & 16);
}//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
/*

	Vector.js
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

function Vector(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}
Vector.prototype.add = function (v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};
Vector.prototype.scale = function (s) {
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
};
Vector.prototype.direction = function () {
	return Math.atan2(this.y, this.x);
};
Vector.prototype.magnitude = function () {
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};
Vector.prototype.addToMagnitude = function (n) {
	n = n || 0;
	var mag = this.magnitude();
	var magTransformation = Math.sqrt((n + mag) / mag);
	this.x *= magTransformation;
	this.y *= magTransformation;
	this.z *= magTransformation;
	return this;
};
Vector.prototype.unit = function () {
	return this.scale(1/this.magnitude());
};
Vector.prototype.rotateZ = function (t) {
	var oldX = this.x;
	var oldY = this.y;
	this.x = oldX*Math.cos(t) - oldY*Math.sin(t);
	this.y = oldX*Math.sin(t) + oldY*Math.cos(t);
	return this;
};
Vector.add = function (v1, v2) {
	return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};
Vector.subtract = function (v1, v2) {
	return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};
Vector.dot = function (v1, v2) {
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};
Vector.scale = function (v, s) {
	return new Vector(v.x * s, v.y * s, v.z * s);
};
Vector.cross = function (v1, v2) {
	return new Vector(
		v1.y * v2.z - v2.y * v1.z, 
		v1.z * v2.x - v2.z * v1.x, 
		v1.x * v2.y - v2.x * v1.y
	);
};
Vector.average = function () {
	var num, result = new Vector(), items = arguments;
	if (arguments[0].constructor.toString().indexOf('Array') != -1)
		items = arguments[0];
	num = items.length;
	for (i = 0; i < num;i++) {
		result.add(Vector.create(items[i]));
	}
	return result.scale(1/num);
};
Vector.create = function (o) {
	return new Vector(o.x, o.y, o.z);
};
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
		if (!_.isArray(color)) {
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
}());
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
		last: NULL,
		currentTool: NULL,
		previousTool: NULL,
		tool: NULL,
		mouseDown: FALSE,
		mouseOver: FALSE,
		width: NULL,
		height: NULL,
		
		currentZoom: 1,
		currentOffset: { x: 0, y: 0 },
		
		// if you are using strokeSoftness, make sure shadowOffset >= max(canvas.width, canvas.height)
		// related note: safari has trouble with high values for shadowOffset
		shadowOffset: 5000,
		
		enableZoom: TRUE,
		enableWacomSupport: TRUE,
		
		// default limits
		maxHistory: 10,
		minStrokeSize: 500,
		maxStrokeSize: 10000,
		minStrokeSoftness: 0,
		maxStrokeSoftness: 100,
		maxZoom: 8 // (8 == 800%)
	};
	
	var wacomPlugin;
    
    function wacomEmbedObject() {
    	if (!wacomPlugin) {
    		var plugin;
    		if (navigator.mimeTypes["application/x-wacomtabletplugin"]) {
    			plugin = document.createElement('embed');
    			plugin.name = plugin.id = 'wacom-plugin';
    			plugin.type = 'application/x-wacomtabletplugin';
    		} else {
    			plugin = document.createElement('object');
    			plugin.classid = 'CLSID:092dfa86-5807-5a94-bf3b-5a53ba9e5308';
				plugin.codebase = "fbWacomTabletPlugin.cab";
    		}
    		
			plugin.style.width = plugin.style.height = '1px';
			plugin.style.top = plugin.style.left = '-10000px';
			plugin.style.position = 'absolute';
    		document.body.appendChild(plugin);
    		wacomPlugin = plugin;
    	}
    }
    
    
    function now() {
    	return (new Date).getTime();
    }
    
    var lastPressure = null,
    	lastPressureTime = now();
    function wacomGetPressure() {
    	if (wacomPlugin && wacomPlugin.penAPI) {
    		var pressure;
    		// only get pressure once every other poll;
    		if (now() - lastPressureTime > 20) {
    			pressure = wacomPlugin.penAPI.pressure;
    			lastPressure = pressure;
    			lastPressureTime = now();
    		} else {
    			pressure = lastPressure;
    		}
    		return pressure;
    	}
    }
    /*
    function wacomGetPressure() {
    	if (wacomPlugin && wacomPlugin.penAPI) {
    		return wacomPlugin.penAPI.pressure;
    	}
    }
	*/
	function wacomIsEraser() {
    	if (wacomPlugin && wacomPlugin.penAPI) {
    		return wacomPlugin.penAPI.pointerType === 3;
    	}
	}
	
	var Canvas = typeof _Canvas !== 'undefined' ? _Canvas : function (w, h) {
		var c = document.createElement('canvas');
		if (w) c.width = w;
		if (h) c.height = h;
		return c;
	};
	
	var API = function (elt, options) {
		var self = this,
			element = self.element = elt.getContext ? elt : document.getElementById(elt);
			state = self.state = _.extend({}, defaultState, options);
		
		if (typeof (new Canvas()).getContext != 'function') {
			throw new Error('Your browser does not support HTML canvas!');
			return false;
		}
		
		if (state.enableWacomSupport) {
			wacomEmbedObject();
		}
		
		element.width = state.width = state.displayWidth || state.width || element.width;
		element.height = state.height = state.displayHeight || state.height || element.height;
		state.fullWidth = state.fullWidth || state.width;
		state.fullHeight = state.fullHeight || state.height;
		
		if (state.width / state.height !== state.fullWidth / state.fullHeight) {
			//Display and full canvas aspect ratios differ!
			//Adjusting full size to match display aspect ratio...
			state.fullHeight = state.fullWidth * state.height / state.width;
		}
		
		self._displayCanvas = element;
		if (state.enableZoom) {
			self._canvas = new Canvas(state.fullWidth, state.fullHeight);
		} else {
			self._canvas = element;
		}
		self.history = new TeledrawCanvas.History(self);
		
		self.defaults();
		self.zoom(0);
		self.history.checkpoint();
		TeledrawCanvas.canvases[_id++] = self;
		
		var gInitZoom, lastMoveEvent = NULL;
		addEvent(element, 'gesturestart', gestureStart);
		addEvent(element, 'gesturechange', gestureChange);
		addEvent(element, 'gestureend', gestureEnd);
		addEvent(element, 'dblclick', dblClick);
		addEvent(element, 'mouseenter', mouseEnter); 
		addEvent(element, 'mousedown', mouseDown);    
		addEvent(element, 'touchstart', mouseDown);
		addEvent(element, 'mouseleave', mouseLeave);
	    addEvent(window, 'mousemove', mouseMove);        
	    addEvent(window, 'touchmove', mouseMove);
	   
		function mouseEnter(evt) {
			var pt = getCoord(evt);
			state.tool.enter(state.mouseDown, pt);
			state.last = pt;
			state.mouseOver = TRUE;
		}
		
		function mouseLeave(evt) {
			var pt = getCoord(evt);
			state.tool.leave(state.mouseDown, pt);
			state.mouseOver = FALSE;
		}
		
		function dblClick(evt) {
			var pt = getCoord(evt);
			state.tool.dblclick(pt);
		}
		
	    function mouseMove(e) {
	    	if (e.type == 'touchmove' && e.touches.length > 1) {
	    		return TRUE;
	    	}
	    	if (lastMoveEvent == 'touchmove' && e.type == 'mousemove') return;
	        if (e.target == element || state.mouseDown) {
	        	var pt = getCoord(e);
				_.defer(function () { state.tool.move(state.mouseDown, state.last, pt); });
				state.last = pt;
				self.trigger('mousemove', pt, e);
	            lastMoveEvent = e.type;
            	e.preventDefault();
        		return FALSE;
	        }
	    }

	    function mouseDown(e) {
            var pt = state.last = getCoord(e);
	    	if (e.type == 'touchstart' && e.touches.length > 1) {
	    		return TRUE;
	    	}
            addEvent(window, e.type === 'mousedown' ? 'mouseup' : 'touchend', mouseUp);
            
			state.mouseDown = TRUE;
			if (wacomIsEraser() && state.currentTool !== 'eraser') {
				self.setTool('eraser');
				state.wacomWasEraser = true;
			}
			state.tool.down(pt);
			self.trigger('mousedown', pt, e);
			
        	document.onselectstart = function() { return FALSE; };
        	e.preventDefault();
        	return FALSE;
        }
	    
	    function mouseUp(e) {
            removeEvent(window, e.type === 'mouseup' ? 'mouseup' : 'touchend', mouseUp);
            
	    	if (e.type == 'touchend' && e.touches.length > 1) {
	    		return TRUE;
	    	}
	    	
			state.mouseDown = FALSE;
			state.tool.up(state.last);
			self.trigger('mouseup', state.last, e);
        	
			if (state.wacomWasEraser === true) {
				self.previousTool();
				state.wacomWasEraser = false;
			}
        
        	document.onselectstart = function() { return TRUE; };
        	e.preventDefault();
        	return FALSE;
	    }
	    
	    function gestureStart(evt) {
			if (state.tool.name == 'grab') {
				gInitZoom = state.currentZoom;
			}
		}
		
		function gestureChange(evt) {
			if (state.tool.name == 'grab') {
				var pt = state.last;
				self.zoom(gInitZoom*evt.scale, pt.xd, pt.yd);
			}
			evt.preventDefault();
        	return FALSE;
		}
		
		function gestureEnd(evt) {
		
		}
	    
		function getCoord(e) {
	        var off = getOffset(element),
	        	pageX = e.pageX || e.touches && e.touches[0].pageX,
				pageY = e.pageY || e.touches && e.touches[0].pageY,
				pressure = state.enableWacomSupport ? wacomGetPressure() : null;

	        return {
	        	x: floor((pageX - off.left)/state.currentZoom) + state.currentOffset.x || 0,
	        	y: floor((pageY - off.top)/state.currentZoom) + state.currentOffset.y || 0,
	        	xd: floor(pageX - off.left) || 0,
	        	yd: floor(pageY - off.top) || 0,
	        	p: pressure
	        };
		}
	};
	
	function getOffset(el) {
		var _x = 0;
		var _y = 0;
		while( el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) ) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
		return { top: _y, left: _x };
	}
	
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
	
	APIprototype.updateDisplayCanvas = function (noTrigger) {
		if (this.state.enableZoom === false) {
			return this;
		}
		var dctx = this.displayCtx(),
			off = this.state.currentOffset,
			zoom = this.state.currentZoom, 
			dw = dctx.canvas.width,
			dh = dctx.canvas.height,
			sw = floor(dw / zoom),
			sh = floor(dh / zoom);
		dctx.clearRect(0, 0, dw, dh);
		if (noTrigger !== true) this.trigger('display.update:before');
		dctx.drawImage(this._canvas, off.x, off.y, sw, sh, 0, 0, dw, dh);
		if (noTrigger !== true) this.trigger('display.update:after');
	};
	
	/* this version attempts at better performance by drawing only the bounding rect of the changes
	APIprototype.updateDisplayCanvas = function (noTrigger, tl, br) {
		if (this.state.enableZoom === false) {
			return this;
		}
		var dctx = this.displayCtx(),
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
		if (noTrigger !== true) this.trigger('display.update:before');
		dctx.drawImage(this._canvas, stl.x, stl.y, sw, sh, dtl.x, dtl.y, dw, dh);
		if (noTrigger !== true) this.trigger('display.update:after');
	};*/
	
	
	// API
	
	// returns the HTML Canvas element associated with this tdcanvas
	APIprototype.canvas = function () {
	    return this._canvas;
	};

	// returns a 2d rendering context for the canvas element
	APIprototype.ctx = function () {
	    return this._ctx || (this._ctx = this._canvas.getContext('2d'));
	};
	
	APIprototype.displayCanvas = function () {
		return this._displayCanvas;
	};
	
	APIprototype.displayCtx = function () {
		return this._displayCtx || (this._displayCtx = this._displayCanvas.getContext('2d'));
	};
	
	// sets the cursor css to be used when the mouse is over the canvas element
	APIprototype.cursor = function (c) {
	    if (!c) {
	        c = "default";
	    }
	    var cursors = c.split(/,\s*/);
	    do {
	    	c = cursors.shift();
	    	this.element.style.cursor = c;
	    } while (c.length && this.element.style.cursor != c);
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
			
			var tmpcanvas = this.getTempCanvas(w, h);
			tmpcanvas.getContext('2d').drawImage(this.canvas(), x, y, w, h, 0, 0, w, h);
			return tmpcanvas.toDataURL();
		}
		return this.canvas().toDataURL();
	};
	
	// returns a new (blank) canvas element the same size as this tdcanvas element
	APIprototype.getTempCanvas = function (w, h) {
		return new Canvas(w || this._canvas.width, h || this._canvas.height);
	};

	// draws an image data url to the canvas and when it's finished, calls the given callback function
	APIprototype.fromDataURL = APIprototype.fromImageURL = function (url, cb) {
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
	
	// clears the canvas and draws the supplied image, video or canvas element
	APIprototype.fromImage = APIprototype.fromVideo = APIprototype.fromCanvas = function (element) {
		this.clear(TRUE);
		this.ctx().drawImage(element, 0, 0);
		this.updateDisplayCanvas();
		return this;
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
		if (!_.isArray(color)) {
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
		if (this.state.currentTool === name) {
			return this;
		}
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
		if (this.state.enableZoom === false) {
			return this;
		}
		var self = this,
			ar0 = Math.round(self._canvas.width/self._canvas.height*100)/100,
			ar1 = Math.round(w/h*100)/100;
		if (ar0 !== ar1) {
			throw new Error('Not the same aspect ratio!');
		}
		self._displayCanvas.width = self.state.width = w;
		self._displayCanvas.height = self.state.height = h;
		return self.zoom(self.state.currentZoom);
	};
	
	// zoom the canvas to the given multiplier, z (e.g. if z is 2, zoom to 2:1)
	// optionally at a given point (in display canvas coordinates)
	// otherwise in the center of the current display
	// if no arguments are specified, returns the current zoom level
	APIprototype.zoom = function (z, x, y) {
		if (arguments.length === 0) {
			return this.state.currentZoom;
		}
		if (this.state.enableZoom === false) {
			return this;
		}
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
		
		// figure out where to zoom at
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
		self.state.currentZoom = z;
		self.trigger('zoom', z, currentZoom);
		self.pan(panx, pany);
		self.updateDisplayCanvas();
		return self;
	};
	
	// pan the canvas to the given (relative) x,y position
	// unless absolute === TRUE
	// if no arguments are specified, returns the current absolute position
	APIprototype.pan = function (x, y, absolute) {
		if (arguments.length === 0) {
			return this.state.currentOffset;
		}
		if (this.state.enableZoom === false) {
			return this;
		}
		var self = this,
			zoom = self.state.currentZoom,
			currentX = self.state.currentOffset.x,
			currentY = self.state.currentOffset.y,
			maxWidth = self._canvas.width - floor(self._displayCanvas.width/zoom),
			maxHeight = self._canvas.height - floor(self._displayCanvas.height/zoom);
		x = absolute === TRUE ? x/zoom : currentX - (x || 0)/zoom;
		y = absolute === TRUE ? y/zoom : currentY - (y || 0)/zoom;
		x = floor(clamp(x, 0, maxWidth));
		y = floor(clamp(y, 0, maxHeight))
		self.state.currentOffset = { x: x, y: y };
		self.trigger('pan', self.state.currentOffset);
		self.updateDisplayCanvas();
		return self;
	};
	
	// events mixin
	_.extend(APIprototype, Events);
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
			this.past.shift().destroy();
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
		if (!this.canvas._snapshotBuffers) {
			this.canvas._snapshotBuffers = [];
		}
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
		this.canvas.updateDisplayCanvas(false, tl, br);
	};
	
	Snapshot.prototype.destroy = function () {
		this._putBufferCtx();
	};
	
	Snapshot.prototype.toDataURL = function () {
		return this.buffer && this.buffer.toDataURL();
	};
	
	// doing this with a buffer canvas instead of get/put image data seems to be significantly faster
	Snapshot.prototype._snapshotBufferCanvas = function () {
		this._getBufferCtx();
	    this.buffer.drawImage(this.canvas.canvas(), 0, 0);
	};
	
	Snapshot.prototype._restoreBufferCanvas = function (tl, br) {
		var ctx = this.canvas.ctx();
		
		var w = br.x - tl.x, h = br.y - tl.y;
		if (w === 0 || h === 0) {
			return;
		}
		ctx.clearRect(tl.x, tl.y, w, h);
	    ctx.drawImage(this.buffer.canvas, tl.x, tl.y, w, h, tl.x, tl.y, w, h);
	};

	Snapshot.prototype._snapshotImageData = function () {
	    this.data = this.canvas.getImageData();
	};
	
	Snapshot.prototype._restoreImageData = function () {
	    this.canvas.putImageData(this.data);
	};
	
	Snapshot.prototype._putBufferCtx = function () {
		if (this.buffer) {
			this.canvas._snapshotBuffers.push(this.buffer);
		}
		this.buffer = null;
	};
	
	Snapshot.prototype._getBufferCtx = function () {
		var ctx;
		if (!this.buffer) {
			if (this.canvas._snapshotBuffers.length) {
				ctx = this.canvas._snapshotBuffers.shift();
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			} else {
				ctx = this.canvas.getTempCanvas().getContext('2d');
			}
		}
		this.buffer = ctx;
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
	
	Stroke.prototype.destroy = function () {
	    this.snapshot.destroy();
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
		this.previewContainer = document.createElement('div');
		_.extend(this.previewContainer.style, {
			position: 'absolute',
			width: '10px',
			height: '10px',
			border: '1px solid black',
			display: 'none'
		});
		document.body.appendChild(this.previewContainer);
		if (this.canvas.state.mouseOver) {
			this.previewContainer.style.display = 'block';
		}
	};
	var EyeDropper = TeledrawCanvas.Tool.createTool("eyedropper", "crosshair", ctor);
	
	EyeDropper.prototype.pick = function (pt) {
		var previewContainer = this.previewContainer,
			lightness,
			left = this.canvas.element.offsetLeft,
			top = this.canvas.element.offsetTop,
			pixel = this.canvas._displayCtx.getImageData(pt.xd,pt.yd,1,1).data;
		this.color = TeledrawCanvas.util.rgba2rgb(Array.prototype.slice.call(pixel));
		var lightness = TeledrawCanvas.util.rgb2hsl(this.color)[2];
		_.extend(previewContainer.style, {
			left: (left + pt.xd + 15) + 'px', 
			top: (top + pt.yd + 5) + 'px',
			background: TeledrawCanvas.util.cssColor(this.color),
			'border-color': lightness >= 50 ? '#000' : '#888'
		});
		if (this.canvas.state.mouseOver) {
			// hack for chrome, since it seems to ignore this and not redraw for some reason...
			previewContainer.style.display='none';
			previewContainer.offsetHeight; // no need to store this anywhere, the reference is enough
			previewContainer.style.display='block';
		} else {
			previewContainer.style.display = 'none';
		}
	};

	EyeDropper.prototype.enter = function () {
		this.previewContainer.style.display = 'block';
	};
	
	EyeDropper.prototype.leave = function () {
		this.previewContainer.style.display = 'none';
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
		this.previewContainer.parentNode.removeChild(this.previewContainer);
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
		this.tmp_canvas = this.canvas.getTempCanvas();
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
/**
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
	    var first = _.extend({}, this.first),
	    	second = _.extend({}, this.second),
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
	    		
				if (pressurePoints.left.length === 0 || 
					pressurePoints.left.length !== pressurePoints.right.length)
				{
					return;
				}
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
			
			// ignore this point if they didn't actually move
			if (currp.x === lastp.x && currp.y === lastp.y) continue;
			
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
		if (points.length === 0) return;
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
	    	second = _.extend({}, this.second),
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

