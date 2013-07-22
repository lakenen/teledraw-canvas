
(function (TeledrawCanvas) {
    TeledrawCanvas.canvases = [];
    var _id = 0;

    // global default tool settings
    var toolDefaults = {
        tool: 'pencil',
        alpha: 255,
        color: [0, 0, 0],
        strokeSize: 1000,
        strokeSoftness: 0
    };

    // global default state
    var defaultState = {
        last: null ,
        currentTool: null ,
        previousTool: null ,
        tool: null ,
        mouseDown: false,
        mouseOver: false,
        width: null ,
        height: null ,

        currentZoom: 1,
        currentOffset: { x: 0, y: 0 },

        // if you are using strokeSoftness, make sure shadowOffset >= max(canvas.width, canvas.height)
        // related note: safari has trouble with high values for shadowOffset
        shadowOffset: 5000,

        enableZoom: true,
        enableKeyboardShortcuts: true,
        enableWacomSupport: true,

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

    /*var lastPressure = null,
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
    }*/

    function wacomGetPressure() {
        if (wacomPlugin && wacomPlugin.penAPI) {
            var p = wacomPlugin.penAPI.pressure;
            return p;
        }
    }

    function wacomIsEraser() {
        if (wacomPlugin && wacomPlugin.penAPI) {
            return parseInt(wacomPlugin.penAPI.pointerType, 10) === 3;
        }
    }

    function getOffset(el) {
        var _x = 0;
        var _y = 0;
        // @TODO: replace isNaN with something safer
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft;
            _y += el.offsetTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    var Canvas = TeledrawCanvas.Canvas = typeof _Canvas !== 'undefined' ? _Canvas : function (width, height) {
        var canvas = document.createElement('canvas');
        if (width) {
            canvas.width = width;
        }
        if (height) {
            canvas.height = height;
        }
        return canvas;
    };

    var API = function (elt, options) {
        var self = this,
            element = self.element = elt.getContext ? elt : document.getElementById(elt);
            state = self.state = _.extend({}, defaultState, options);

        if (typeof (new Canvas()).getContext !== 'function') {
            throw new Error('Error: Your browser does not support HTML canvas!');
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
        self.bindEvents();
    };

    var APIprototype = API.prototype;

    APIprototype.bindEvents = function () {
        var self = this,
            element = self.element,
            state = self.state,
            gInitZoom,
            lastMoveEvent = null ,
            lastmove = 0,
            lastpressure = 0;

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
        addEvent(window, 'keydown', keyDown);
        addEvent(window, 'keyup', keyUp);

        self.unbindEvents = function () {
            removeEvent(element, 'gesturestart', gestureStart);
            removeEvent(element, 'gesturechange', gestureChange);
            removeEvent(element, 'gestureend', gestureEnd);
            removeEvent(element, 'dblclick', dblClick);
            removeEvent(element, 'mouseenter', mouseEnter);
            removeEvent(element, 'mousedown', mouseDown);
            removeEvent(element, 'touchstart', mouseDown);
            removeEvent(element, 'mouseleave', mouseLeave);
            removeEvent(window, 'mousemove', mouseMove);
            removeEvent(window, 'touchmove', mouseMove);
            removeEvent(window, 'keydown', keyDown);
            removeEvent(window, 'keyup', keyUp);
        };

        function mouseEnter(evt) {
            var pt = getCoord(evt);
            state.tool.enter(state.mouseDown, pt);
            state.last = pt;
            state.mouseOver = true;
        }

        function mouseLeave(evt) {
            var pt = getCoord(evt);
            state.tool.leave(state.mouseDown, pt);
            state.mouseOver = false;
        }

        function dblClick(evt) {
            var pt = getCoord(evt);
            state.tool.dblclick(pt);
        }

        function keyUp(e) {
            state.tool.keyup(state.mouseDown, e.keyCode);
        }

        function keyDown(e) {
            state.tool.keydown(state.mouseDown, e.keyCode);
            if (!state.enableKeyboardShortcuts) {
                return;
            }
            var eltName = document.activeElement.nodeName.toLowerCase();
            if (eltName === 'input' || eltName === 'textarea') {
                return;
            } else {
                switch (e.keyCode) {
                    case 69: // e
                        self.setTool('eraser');
                        break;
                    case 70: // f
                        self.setTool('fill');
                        break;
                    case 71: // g
                        self.setTool('grab');
                        break;
                    case 73: // i
                        self.setTool('eyedropper');
                        break;
                    case 76: // l
                        self.setTool('line');
                        break;
                    case 79: // o
                        self.setTool('ellipse');
                        //Canvas.getTool().setFill(e.shiftKey === true);
                        break;
                    case 80: // p
                        self.setTool('pencil');
                        break;
                    case 82: // r
                        self.setTool('rectangle');
                        //Canvas.getTool().setFill(e.shiftKey === true);
                        break;
                    case 90: // z
                        if (state.mouseDown) {
                            return false;
                        }
                        if (e.metaKey || e.ctrlKey) {
                            if (e.shiftKey) {
                                self.redo();
                            } else {
                                self.undo();
                            }
                            return false;
                        }
                        break;
                    case 189: // -
                        if (e.shiftKey) { // _
                            // decrease brush size
                            self.setStrokeSize(state.strokeSize - 500);
                        }
                        break;
                    case 187: // =
                        if (e.shiftKey) { // +
                            // increase brush size
                            self.setStrokeSize(state.strokeSize + 500);
                        }
                        break;
                    case 188: // ,
                        if (e.shiftKey) { // <
                            // decrease alpha
                            self.setAlpha(state.globalAlpha - 0.1);
                        }
                        break;
                    case 190: // .
                        if (e.shiftKey) { // >
                            // increase alpha
                            self.setAlpha(state.globalAlpha + 0.1);
                        }
                        break;
                    case 219: // [
                        if (e.shiftKey) { // {
                            // decrease brush softness
                            self.setStrokeSoftness(state.strokeSoftness - 10);
                        }
                        break;
                    case 221: // ]
                        if (e.shiftKey) { // }
                            // increase brush softness
                            self.setStrokeSoftness(state.strokeSoftness + 10);
                        }
                        break;
                }
            }
        }

        function mouseMove(e) {
            if (Date.now() - lastmove < 25) {
                return false;
            }
            lastmove = Date.now();

            if (e.type === 'touchmove' && e.touches.length > 1) {
                return true;
            }
            if (lastMoveEvent === 'touchmove' && e.type === 'mousemove') {
                return;
            }
            if (e.target === element || state.mouseDown) {
                var pt = getCoord(e);
                state.tool.move(state.mouseDown, state.last, pt);
                state.last = pt;
                self.trigger('mousemove', pt, e);
                lastMoveEvent = e.type;
                e.preventDefault();
                return false;
            }
        }

        function mouseDown(e) {
            var pt = state.last = getCoord(e);
            if (e.type === 'touchstart' && e.touches.length > 1) {
                return true;
            }
            addEvent(window, e.type === 'mousedown' ? 'mouseup' : 'touchend', mouseUp);

            state.mouseDown = true;
            if (state.enableWacomSupport && wacomIsEraser() && state.currentTool !== 'eraser') {
                self.setTool('eraser');
                state.wacomWasEraser = true;
            }
            state.tool.down(pt);
            self.trigger('mousedown', pt, e);

            document.onselectstart = function() { return false; };
            e.preventDefault();
            return false;
        }

        function mouseUp(e) {
            removeEvent(window, e.type === 'mouseup' ? 'mouseup' : 'touchend', mouseUp);

            if (e.type === 'touchend' && e.touches.length > 1) {
                return true;
            }

            state.mouseDown = false;
            state.tool.up(state.last);
            self.trigger('mouseup', state.last, e);

            if (state.wacomWasEraser === true) {
                self.previousTool();
                state.wacomWasEraser = false;
            }

            document.onselectstart = function() { return true; };
            e.preventDefault();
            return false;
        }

        function gestureStart(evt) {
            if (state.tool.name === 'grab') {
                gInitZoom = state.currentZoom;
            }
        }

        function gestureChange(evt) {
            if (state.tool.name === 'grab') {
                var pt = state.last;
                self.zoom(gInitZoom*evt.scale, pt.xd, pt.yd);
            }
            evt.preventDefault();
            return false;
        }

        function gestureEnd(evt) {

        }

        function getCoord(e) {
            var off = getOffset(element),
                pageX = e.pageX || e.touches && e.touches[0].pageX,
                pageY = e.pageY || e.touches && e.touches[0].pageY,
                pressure = null;
            if (state.enableWacomSupport) {
                if (Date.now() - lastpressure > 25) {
                    lastpressure = Date.now();
                    pressure = wacomGetPressure();
                }
            }

            return {
                x: floor((pageX - off.left)/state.currentZoom) + state.currentOffset.x || 0,
                y: floor((pageY - off.top)/state.currentZoom) + state.currentOffset.y || 0,
                xd: floor(pageX - off.left) || 0,
                yd: floor(pageY - off.top) || 0,
                p: pressure
            };
        }
    };

    APIprototype.setRGBAArrayColor = function (rgba) {
        var state = this.state;
        if (rgba.length === 4) {
            this.setAlpha(rgba.pop());
        }
        for (var i = rgba.length; i < 3; ++i) {
            rgba.push(0);
        }
        var old = state.color;
        state.color = rgba;
        this.trigger('tool.color', state.color, old);
        return this;
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
        TeledrawCanvas.util.clear(dctx);
        if (noTrigger !== true) {
            this.trigger('display.update:before');
        }
        dctx.drawImage(this._canvas, off.x, off.y, sw, sh, 0, 0, dw, dh);
        if (noTrigger !== true) {
            this.trigger('display.update:after');
        }
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

    // this should be called when removing a canvas to avoid event leaks
    APIprototype.destroy = function () {
        this.unbindEvents();
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
        } while (c.length && this.element.style.cursor !== c);
        return this;
    };

    // clears the canvas and (unless noCheckpoint===true) pushes to the undoable history
    APIprototype.clear = function (noCheckpoint) {
        var self = this;
        TeledrawCanvas.util.clear(self.ctx());
        if (noCheckpoint !== true) {
            self.history.checkpoint();
        }
        self.updateDisplayCanvas();
        self.trigger('clear');
        return self;
    };

    // resets the default tool and properties
    APIprototype.defaults = function () {
        var self = this;
        self.setTool(toolDefaults.tool);
        self.setAlpha(toolDefaults.alpha);
        self.setColor(toolDefaults.color);
        self.setStrokeSize(toolDefaults.strokeSize);
        self.setStrokeSoftness(toolDefaults.strokeSoftness);
        return self;
    };

    // returns a data url (image/png) of the canvas,
    // optionally a portion of the canvas specified by sx, sy, sw, sh, and output size by dw, dh
    APIprototype.toDataURL = function (sx, sy, sw, sh, dw, dh) {
        if (arguments.length >= 4) {
            sx = sx || 0;
            sy = sy || 0;
            dw = dw || sw;
            dh = dh || sh;
            var tmpcanvas = this.getTempCanvas(dw, dh);
            tmpcanvas.getContext('2d').drawImage(this.canvas(), sx, sy, sw, sh, 0, 0, dw, dh);
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
            self.clear(true);
            self.ctx().drawImage(img, 0, 0);
            self.updateDisplayCanvas();
            if (typeof cb === 'function') {
                cb.call(self);
            }
        };
        img.src = url;
        return self;
    };

    // returns trueif the canvas has no data
    APIprototype.isBlank = function () {
        var data = this.getImageData().data;
        var len = data.length;
        for (var i = 0, l = len; i < l; ++i) {
            if (data[i] !== 0) {
                return false;
            }
        }
        return true;
    };

    // clears the canvas and draws the supplied image, video or canvas element
    APIprototype.fromImage = APIprototype.fromVideo = APIprototype.fromCanvas = function (element) {
        this.clear(true);
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

    // returns the current color in the form [r, g, b, a], e.g. [255, 0, 0, 0.5]
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
        var old = this.state.globalAlpha;
        this.state.globalAlpha = clamp(a, 0, 1);
        this.trigger('tool.alpha', this.state.globalAlpha, old);
        return this;
    };

    // returns the current alpha
    APIprototype.getAlpha = function () {
        return this.state.globalAlpha;
    };

    // sets the current stroke size to s, where a is a number in [minStrokeSize, maxStrokeSize]
    // lineWidth = 1 + floor(pow(strokeSize / 1000.0, 2));
    APIprototype.setStrokeSize = function (s) {
        var old = this.state.strokeSize;
        this.state.strokeSize = clamp(s, this.state.minStrokeSize, this.state.maxStrokeSize);
        this.updateTool();
        this.trigger('tool.size', this.state.strokeSize, old);
        return this;
    };

    // sets the current stroke size to s, where a is a number in [minStrokeSoftness, maxStrokeSoftness]
    APIprototype.setStrokeSoftness = function (s) {
        var old = this.state.strokeSoftness;
        this.state.strokeSoftness = clamp(s, this.state.minStrokeSoftness, this.state.maxStrokeSoftness);
        this.updateTool();
        this.trigger('tool.softness', this.state.strokeSoftness, old);
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
        this.trigger('tool.change', this.state.currentTool, this.state.previousTool);
        return this;
    };


    APIprototype.previousTool = function () {
        return this.setTool(this.state.previousTool);
    };

    // undo to the last history checkpoint (if available)
    APIprototype.undo = function () {
        this.history.undo();
        this.trigger('history undo', this.history.past.length, this.history.future.length);
        return this;
    };

    // redo to the next history checkpoint (if available)
    APIprototype.redo = function () {
        this.history.redo();
        this.trigger('history redo', this.history.past.length, this.history.future.length);
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
        this.trigger('resize', w, h);
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
    // unless absolute === true    // if no arguments are specified, returns the current absolute position
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
        x = absolute === true ? x/zoom : currentX - (x || 0)/zoom;
        y = absolute === true ? y/zoom : currentY - (y || 0)/zoom;
        x = floor(clamp(x, 0, maxWidth));
        y = floor(clamp(y, 0, maxHeight));
        self.state.currentOffset = { x: x, y: y };
        self.trigger('pan', self.state.currentOffset, { x: currentX, y: currentY });
        self.updateDisplayCanvas();
        return self;
    };

    // events mixin
    _.extend(APIprototype, Events);
    TeledrawCanvas.api = API;
})(TeledrawCanvas);


