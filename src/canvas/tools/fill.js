/**
 * Fill tool
 */
(function (TeledrawCanvas) {
    var Fill = TeledrawCanvas.Tool.createTool('fill', 'crosshair');
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

