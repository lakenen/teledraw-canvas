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
}