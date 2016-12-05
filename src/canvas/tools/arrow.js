/**
 * Arrow tool
 */
(function (TeledrawCanvas) {
    var Arrow = TeledrawCanvas.Tool.createTool("arrow", "crosshair");
    var ArrowStroke = Arrow.stroke.prototype;
    var LineArrow = TeledrawCanvas.Tool.createTool("line-arrow", "crosshair");
    var LineArrowStroke = LineArrow.stroke.prototype;

    function calculateArrowVectors(a, b, edgeLength) {
        var currv, tmpv, leftv, rightv, frontv;
        tmpv = new Vector(a.x, a.y);
        currv = new Vector(b.x, b.y);
        tmpv = Vector.subtract(currv, tmpv).unit();
        leftv = new Vector(tmpv).rotateZ(Math.PI/2).scale(edgeLength).add(currv);
        rightv = new Vector(tmpv).rotateZ(-Math.PI/2).scale(edgeLength).add(currv);
        frontv = new Vector(tmpv).scale(edgeLength).add(currv);
        return {
            left: leftv,
            right: rightv,
            front: frontv
        };
    }

    var updateBoundaries = Arrow.prototype.updateBoundaries;
    Arrow.prototype.updateBoundaries = LineArrow.prototype.updateBoundaries = function () {
        var tool = this;
        // update the box if the arrow falls outside
        if (this.currentStroke.last && this.currentStroke.current) {
            var a = this.currentStroke.last,
                b = this.currentStroke.current,
                edgeLength = this.currentStroke.calculateEdgeLength(),
                vectors = calculateArrowVectors(a, b, edgeLength);
            _.values(vectors).forEach(function (pt) {
                updateBoundaries.call(tool, pt);
            });
        }
    };

    Arrow.prototype.preview = LineArrow.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canv.width, canv.height);
        var stroke = new Arrow.stroke(this.canvas, ctx);
        stroke.points = [{ x: canv.width * 0.25, y: canv.height * 0.25 }, { x: canv.width * 0.75, y: canv.height * 0.75 }];
        stroke.draw();
        return canv;
    };


    ArrowStroke.lineWidth = LineArrowStroke.lineWidth = 1;
    ArrowStroke.lineCap = LineArrowStroke.lineCap = 'round';

    ArrowStroke.calculateEdgeLength = LineArrowStroke.calculateEdgeLength = function () {
        return Math.max(10, this.canvas.state.lineWidth * 2);
    };
    ArrowStroke.drawArrow = function () {
        var state = this.canvas.state,
            ctx = this.ctx,
            edgeLength = this.calculateEdgeLength(),
            vectors;

        if (this.last && this.current) {
            vectors = calculateArrowVectors(this.last, this.current, edgeLength);
            ctx.beginPath();
            ctx.moveTo(this.current.x, this.current.y);
            ctx.lineTo(vectors.left.x, vectors.left.y);
            ctx.lineTo(vectors.front.x, vectors.front.y);
            ctx.lineTo(vectors.right.x, vectors.right.y);
            ctx.lineTo(this.current.x, this.current.y);
            ctx.closePath();
            ctx.fill();
        }
    };

    LineArrowStroke.start = function () {
        TeledrawCanvas.tools.line.stroke.prototype.start.apply(this, arguments);
    };

    ArrowStroke.move = function (a, b) {
        this.last = a;
        this.current = b;
    };
    LineArrowStroke.move = function (a, b) {
        TeledrawCanvas.tools.line.stroke.prototype.move.apply(this, arguments);
        this.last = this.first;
        this.current = this.second;
    };

    ArrowStroke.draw = function () {
        TeledrawCanvas.tools.pencil.stroke.prototype.draw.call(this);
        ArrowStroke.drawArrow.call(this);
    };
    LineArrowStroke.draw = function () {
        TeledrawCanvas.tools.line.stroke.prototype.draw.call(this);
        // update points because they might be using shift key
        this.last = this.points[0];
        this.current = this.points[1];
        ArrowStroke.drawArrow.call(this);
    };

    ArrowStroke.end = function (pt) {
        this.current = pt;
    };
    LineArrowStroke.end = function () {
        TeledrawCanvas.tools.line.stroke.prototype.end.apply(this, arguments);
        ArrowStroke.end.apply(this, arguments);
    };
})(TeledrawCanvas);

