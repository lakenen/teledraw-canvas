/**
 * Text tool
 */
(function (TeledrawCanvas) {
    var TextTool = TeledrawCanvas.Tool.createTool('text', 'text'),
        TextStrokePrototype = TextTool.stroke.prototype;

    var BUFFER = 0.05;

    var down = TextTool.prototype.down;
    TextTool.prototype.down = function (pt) {
        if (this.currentStroke) {
            finish(this.currentStroke);
        }
        down.call(this, pt);
    };

    TextTool.prototype.up = function (pt) {
        if (this.currentStroke) {
            this.currentStroke.end(pt);
            this.currentStroke.draw();
            initHandlers(this.currentStroke);
        }
        this.canvas.trigger('tool.up');
    };

    TextTool.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        var stroke = new TextTool.stroke(this.canvas, ctx);
        stroke.first = { x: 0, y: 0 };
        stroke.second = { x: canv.width, y: canv.height };
        stroke.text = 'Aa';
        stroke.draw();
        return canv;
    };

    TextStrokePrototype.start = function (pt) {
        this.text = '';
        this.first = pt;
    };

    TextStrokePrototype.move = function (a, b) {
        this.second = b;
    };

    TextStrokePrototype.end = function (pt) {
        this.second = pt;
    };

    TextStrokePrototype.draw = function () {
        if (!this.first || !this.second) return;
        var buffer,
            x = this.first.x,
            y = this.first.y,
            w = this.second.x - x,
            h = this.second.y - y,
            ctx = this.ctx,
            state = this.canvas.state,
            color = TeledrawCanvas.util.cssColor(state.color);

        // reposition x/y coords if h or w is negative
        if (w < 0) {
            w = -w;
            x -= w;
        }
        if (h < 0) {
            h = -h;
            y -= h;
        }

        buffer = h * BUFFER;

        // only draw the outline if not finished
        if (!this.finished) {
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
        }

        // add a buffer to keep the text inside the drawing area
        x += buffer;
        w -= buffer * 2;

        y += buffer;
        h -= buffer * 2;

        ctx.globalAlpha = state.globalAlpha;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = h + 'px ' + (!!state.font ? state.font : 'Arial');
        ctx.fillText(this.text, x + w / 2, y + h / 2, w);
    };

    function initHandlers(stroke) {
        var input = document.createElement('input');
        input.style.opacity = 0;
        document.body.appendChild(input);
        input.focus();
        stroke.input = input;
        stroke.inputHandler = function () {
            stroke.text = input.value;
            stroke.tool.draw();
        };
        stroke.keydownHandler = function (ev) {
            if (ev.keyCode === 13) { //enter
                finish(stroke);
            }
        }
        addEvent(input, 'input', stroke.inputHandler);
        addEvent(input, 'keydown', stroke.keydownHandler);
    }

    function removeHandlers(stroke) {
        if (stroke.input) {
            removeEvent(stroke.input, 'input', stroke.inputHandler);
            removeEvent(stroke.input, 'input', stroke.keydownHandler);
            stroke.input.parentNode.removeChild(stroke.input);
        }
    }

    function finish(stroke) {
        var tool = stroke.tool;
        removeHandlers(stroke);
        stroke.finished = true;
        tool.draw();
        stroke.destroy();
        tool.currentStroke = null;
        tool.canvas.history.checkpoint();
    }

})(TeledrawCanvas);

