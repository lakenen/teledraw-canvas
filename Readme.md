# Teledraw Canvas

Teledraw Canvas is an HTML5 Canvas drawing engine that is used in [Teledraw.com](http://teledraw.com/). It is currently dependent on jQuery (1.5+), but the goal is to make it standalone eventually.

## How to use

Include jQuery and teledraw-canvas.js in your page, and from there it's as simple as creating a canvas element with whatever width and hight you want:

```html
<canvas id="test-canvas" width="800" height="600"></canvas>
```

and initializing the TeledrawCanvas:

```js
var canvas = new TeledrawCanvas('#test-canvas');
```

## API

### Setting tool color

Teledraw Canvas will accept any color string that works with CSS, as well as an array of RGBA values 0 to 255, (e.g. [255, 0, 0, 255] would be a fully opaque red).

```js
// by hex value
canvas.setColor('#ec823f');
// or
canvas.setColor('#fc0');

// by rgb
canvas.setColor('rgb(255, 0, 0)');

// by hsla
canvas.setColor('hsl(240, 100%, 50%, 0.5)');

// by common color name
canvas.setColor('lightGoldenrodYellow');

// by RGBA array
canvas.setColor([255, 0, 0, 130]);

// and so on...
```

### Picking a tool

Currently, the only tools available are 'pencil' and 'eraser'. You can select them with `setTool`.

```js
// pencil
canvas.setTool('pencil');

// eraser
canvas.setTool('eraser');

// more to come!
```

### Adjusting the stroke style

You can modify how the stroke looks, including opacity, size and softness.

```js
// relatively small stroke
canvas.setStrokeSize(1000);
// relatively large stroke
canvas.setStrokeSize(10000);

// no softness
canvas.setStrokeSoftness(0);
// super blurry
canvas.setStrokeSoftness(100);

// fully opaque
canvas.setAlpha(255);
// fully transparent
canvas.setAlpha(0);
```

### Clear the canvas, undo, redo, etc

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

// returns a data url (image/png) of the canvas, optionally scaled to w x h pixels
var dataURL = canvas.toDataURL(w, h);

// draw an image data url to the canvas and when it's finished, calls the given
// callback function (with `this` as the TeledrawCanvas Object)
canvas.fromDataURL(url, function () { alert('done!'); });

// get the ImageData of the canvas element
var data = canvas.getImageData();

// sets the ImageData of the canvas element
canvas.putImageData(data);
```


## Tests

(coming soon!)

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