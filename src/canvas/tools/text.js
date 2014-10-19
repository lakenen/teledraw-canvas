/**
 * Text tool
 */
(function (TeledrawCanvas) {
    var TextTool = TeledrawCanvas.Tool.createTool('text', 'text'),
        TextStrokePrototype = TextTool.stroke.prototype;


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
        var x = this.first.x,
            y = this.first.y,
            w = this.second.x - x,
            h = this.second.y - y,
            ctx = this.ctx,
            state = this.canvas.state,
            color = TeledrawCanvas.util.cssColor(state.color);

        console.log(this.text, x, y, w, h)

        ctx.globalAlpha = state.globalAlpha;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.textBaseline = 'top';
        ctx.font = h + 'px ' + (!!state.font ? state.font : 'Arial');

        if (this.tool.fill) {
            ctx.fillText(this.text, x, y, w);
        } else {
            ctx.strokeText(this.text, x, y, w);
        }
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
            var tool = stroke.tool;

            if (ev.keyCode === 13) { //enter
                removeHandlers(stroke);
                tool.draw();
                stroke.destroy();
                tool.currentStroke = null;
                tool.canvas.history.checkpoint();
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

})(TeledrawCanvas);

