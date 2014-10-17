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

    EyeDropper.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        ctx.fillStyle = TeledrawCanvas.util.cssColor(this.color);
        ctx.fillRect(0, 0, canv.width, canv.height);
        return canv;
    };

    EyeDropper.prototype.pick = function (pt) {
        var nope, lightness,
            previewContainer = this.previewContainer,
            left = this.canvas.element.offsetLeft,
            top = this.canvas.element.offsetTop,
            pixel = this.canvas._displayCtx.getImageData(pt.xd,pt.yd,1,1).data;

        this.color = TeledrawCanvas.util.rgba2rgb(Array.prototype.slice.call(pixel));
        lightness = TeledrawCanvas.util.rgb2hsl(this.color)[2];
        _.extend(previewContainer.style, {
            left: (left + pt.xd + 15) + 'px',
            top: (top + pt.yd + 5) + 'px',
            background: TeledrawCanvas.util.cssColor(this.color),
            'border-color': lightness >= 50 ? '#000' : '#888'
        });
        if (this.canvas.state.mouseOver) {
            // hack for chrome, since it seems to ignore this and not redraw for some reason...
            previewContainer.style.display='none';
            nope = previewContainer.offsetHeight;
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

