/**
 * Rectangle tool
 */
(function (TeledrawCanvas) {
    var Rectangle = TeledrawCanvas.Tool.createTool("rectangle", "crosshair");

    Rectangle.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        var stroke = new Rectangle.stroke(this.canvas, ctx);
        stroke.first = { x: 0, y: 0 };
        stroke.second = { x: canv.width, y: canv.height };
        stroke.draw();
        return canv;
    };

    Rectangle.stroke.prototype.bgColor = [255, 255, 255];
    Rectangle.stroke.prototype.bgAlpha = 0;
    Rectangle.stroke.prototype.lineWidth = 1;

    Rectangle.stroke.prototype.start = function (pt) {
        this.first = pt;
    };

    Rectangle.stroke.prototype.move = function (a, b) {
        this.second = b;
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


    var FilledRectangle = TeledrawCanvas.Tool.createTool("filled-rectangle", "crosshair");

    FilledRectangle.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        var stroke = new FilledRectangle.stroke(this.canvas, ctx);
        stroke.tool = this;
        var w = canv.width, h = canv.height;
        stroke.first = { x: w*0.1, y: h*0.1 };
        stroke.second = { x: w*0.9, y: h*0.9 };
        stroke.draw();
        return canv;
    };
    _.extend(FilledRectangle.stroke.prototype, Rectangle.stroke.prototype);
    FilledRectangle.prototype.fill = true;

})(TeledrawCanvas);
