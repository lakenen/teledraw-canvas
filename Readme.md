# Teledraw Canvas

Teledraw Canvas is an HTML5 Canvas drawing engine that is used in [Teledraw.com](http://teledraw.com/). It is currently dependent on [Underscore.js](http://documentcloud.github.com/underscore/) (1.x.x).

You can see a very basic live demo at [lakenen.com/teledraw-canvas](http://lakenen.com/teledraw-canvas).

## How to use

Include teledraw-canvas.js in your page, and from there it's as simple as creating a canvas element with whatever width and height you want:

```html
<canvas id="test-canvas" width="512" height="512"></canvas>
```

and initializing the TeledrawCanvas:

```js
var canvas = new TeledrawCanvas('test-canvas');

// with options
var canvas = new TeledrawCanvas('test-canvas', {
	width: 512,
	height: 512,
	fullWidth: 1024,
	fullHeight: 1024,
	
	maxHistory: 20,
	minStrokeSize: 500,
	maxStrokeSize: 10000,
	minStrokeSoftness: 0,
	maxStrokeSoftness: 100,
	
	enableZoom: true, // true by default
	maxZoom: 8 // 800%
});
```

## API

### Setting tool color

Teledraw Canvas will accept any color string that works with CSS, as well as an array of RGB(A) values 0 to 255 (A: 0-1), (e.g. [255, 0, 0, 1.0] would be a fully opaque red).

```js
// by hex value
canvas.setColor('#ec823f');
// or
canvas.setColor('#fc0');

// by rgb
canvas.setColor('rgb(255, 0, 0)');

// by hsla
canvas.setColor('hsla(240, 100%, 50%, 0.5)');

// by common color name
canvas.setColor('lightGoldenrodYellow');

// by RGBA array
canvas.setColor([255, 0, 0, 0.5]);

// and so on...
```

### Picking a tool

Currently, the tools available are 'pencil', 'eraser', 'fill', 'rectangle', 'line', 'ellipse', 'eyedropper' and (if zoom is enabled) 'grab'. You can select them with `setTool`.

```js
// pencil
canvas.setTool('pencil');

// eraser
canvas.setTool('eraser');

// etc
```

### Adjusting the stroke style

You can modify how the stroke looks, including opacity, size and softness.

```js
// relatively small stroke
canvas.setStrokeSize(1);
// relatively large stroke
canvas.setStrokeSize(100);

// no softness
canvas.setStrokeSoftness(0);
// super blurry
canvas.setStrokeSoftness(100);

// fully opaque
canvas.setAlpha(1);
// fully transparent
canvas.setAlpha(0);
```

### Clear the canvas, undo, redo, zoom, pan, etc

Here are some basic useful functions...

```js
// clear the canvas
canvas.clear();

// undo
canvas.undo();
// redo
canvas.redo();

// reset tool defaults
canvas.defaults();

// zoom 200% to the center of the display
canvas.zoom(2);

// zoom 200% centered at (100,100)
canvas.zoom(2, 100, 100);

// pan up and to the left 100px
canvas.pan(-100, -100);
```


### Lower-level stuff

Changing the cursor, getting image data, reference to the canvas element, etc...

```js
// change the css cursor attribute on the canvas element
canvas.cursor('default');

// get a reference to the HTML Canvas element
var elt = canvas.canvas();

// get a 2d canvas rendering context for the canvas element
var ctx = canvas.ctx();

// returns a new (blank) canvas element the same size as this tdcanvas element
var tmpCanvas = canvas.getTempCanvas();

// returns a data url (image/png) of the canvas, optionally a portion of the canvas specified by x, y, w, h
var dataURL = canvas.toDataURL(0, 0, 100, 100);

// draw an image to the canvas and when it's finished, calls the given
// callback function (with `this` as the TeledrawCanvas Object)
// this is also an alias for canvas.fromImageURL
canvas.fromDataURL(url, function () { alert('done!'); });

// get the ImageData of the canvas element
var data = canvas.getImageData();

// sets the ImageData of the canvas element
canvas.putImageData(data);
```

## Adding Tools

Teledraw Canvas provides a ton of flexibility when it comes to adding new tools. Check back here soon for a detailed walkthrough and example on how to build your own tools!


## Tests

Coming soon!

## Changelog

__0.11.2__
* Fixed a bug where user could undo while drawing

__0.11.1__
* Fixed rendering issue when using shift key with some tools

__0.11.0__
* Added keyboard shortcut support
* Added destroy() API call to prevent event leaks when removing a canvas
* Several bugfixes



## License 

(The MIT License)

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
