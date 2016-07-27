/**
 * Arrow tool
 */
(function (TeledrawCanvas) {
    var Arrow = TeledrawCanvas.Tool.createTool("arrow", "crosshair");

    Arrow.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canv.width, canv.height);
        var stroke = new Arrow.stroke(this.canvas, ctx);
        stroke.points = [{ x: canv.width * 0.25, y: canv.height * 0.25 }, { x: canv.width * 0.75, y: canv.height * 0.75 }];
        stroke.draw();
        return canv;
    }


    Arrow.stroke.prototype.lineWidth = 1;
    Arrow.stroke.prototype.lineCap = 'round';

    Arrow.stroke.prototype.move = function (a, b) {
        this.last = a;
        this.current = b;
    };

    Arrow.stroke.prototype.draw = function () {
        TeledrawCanvas.tools.pencil.stroke.prototype.draw.call(this);

        var state = this.canvas.state,
            ctx = this.ctx,
            edgeLength = Math.max(10, state.lineWidth * 2),
            currv, tmpv, leftv, rightv, frontv;

        if (this.ended && this.last && this.current) {
            tmpv = new Vector(this.last.x, this.last.y);
            currv = new Vector(this.current.x, this.current.y);
            tmpv = Vector.subtract(currv, tmpv).unit();
            leftv = new Vector(tmpv).rotateZ(Math.PI/2).scale(edgeLength).add(currv);
            rightv = new Vector(tmpv).rotateZ(-Math.PI/2).scale(edgeLength).add(currv);
            frontv = new Vector(tmpv).scale(edgeLength).add(currv);
            ctx.beginPath();
            ctx.moveTo(this.current.x, this.current.y);
            ctx.lineTo(leftv.x, leftv.y);
            ctx.lineTo(frontv.x, frontv.y);
            ctx.lineTo(rightv.x, rightv.y);
            ctx.lineTo(this.current.x, this.current.y);
            ctx.closePath();
            ctx.fill();
        }
    };

    Arrow.stroke.prototype.end = function () {
        this.ended = true;
    };
})(TeledrawCanvas);

