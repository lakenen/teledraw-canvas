/**
 * Pencil tool
 */
(function (TeledrawCanvas) {
    var Pencil = TeledrawCanvas.Tool.createTool('pencil', 'crosshair');

    Pencil.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        var stroke = new Pencil.stroke(this.canvas, ctx);
        stroke.points = [{ x: canv.width/2, y: canv.height/2 }];
        stroke.draw();
        return canv;
    };

    Pencil.stroke.prototype.lineCap = 'round';
    Pencil.stroke.prototype.smoothing = true;

    Pencil.stroke.prototype.draw = function () {
        var state = this.canvas.state,
            ctx = this.ctx,
            points = this.points,
            shadowOffset = state.shadowOffset,
            shadowBlur = state.shadowBlur,
            lineWidth = state.lineWidth,
            color = TeledrawCanvas.util.cssColor(state.color);

        ctx.globalAlpha = state.globalAlpha;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.miterLimit = 100000;
        if (shadowBlur > 0) {
            ctx.shadowColor = color;
            ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
            ctx.shadowBlur = shadowBlur;
            ctx.translate(-shadowOffset,-shadowOffset);
        }

        if (points.length === 1) {
               // draw a single point
            switch (this.lineCap) {
                case 'round':
                    ctx.beginPath();
                    if (points[0].p) {
                        lineWidth *= points[0].p * 2;
                    }
                    ctx.arc(points[0].x, points[0].y, lineWidth / 2, 0, 2 * Math.PI, true);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(points[0].x - lineWidth/2, points[0].y - lineWidth/2, lineWidth, lineWidth);
            }
        } else if (points.length > 1) {
            ctx.lineJoin = 'round';
            ctx.lineCap = this.lineCap;
            ctx.lineWidth = lineWidth;

            if (points[0].p || points[1].p) {
                ctx.beginPath();
                drawLine(ctx, generatePressurePoints(points, lineWidth), this.smoothing);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                drawLine(ctx, points, this.smoothing);
                ctx.stroke();
            }
        }
    };

    function generatePressurePoints(points, thickness) {
        var path = {left:[], right:[]},
            len = points.length,
            lastp = points[0],
            lastv = new Vector(lastp.x, lastp.y),
            currp, currv, left, right, tmp;
        for (var i = 1, l = len; i < l; ++i) {
            currp = points[i];

            // ignore this point if they didn't actually move
            if (currp.x === lastp.x && currp.y === lastp.y) {
                continue;
            }

            currv = new Vector(currp.x, currp.y);
            left = Vector.subtract(currv, lastv).unit().rotateZ(Math.PI/2);
            right = Vector.subtract(currv, lastv).unit().rotateZ(-Math.PI/2);

            tmp = new Vector(left).scale(lastp.p*thickness).add(lastv);
            path.left.push({ x: tmp.x, y: tmp.y });

            tmp = new Vector(right).scale(lastp.p*thickness).add(lastv);
            path.right.unshift({ x: tmp.x, y: tmp.y });

            lastp = currp;
            lastv = currv;
        }


        //add the last points
        tmp = new Vector(left).scale(lastp.p*thickness).add(lastv);
        path.left.push({ x: tmp.x, y: tmp.y });

        tmp = new Vector(right).scale(lastp.p*thickness).add(lastv);
        path.right.unshift({ x: tmp.x, y: tmp.y });

        // combine them into one full path
        result = path.left.concat(path.right);
        result.push(path.left[0]);
        return result;
    }

    function drawLine(ctx, points, smoothing) {
        if (points.length === 0) {
            return;
        }
        ctx.moveTo(points[0].x, points[0].y);
        var prev = points[0],
            prevprev = null, curr = prev, len = points.length;
        for (var i = 1, l = len; i < l; ++i) {
            curr = points[i];

            if (prevprev && (prevprev.x === curr.x || prevprev.y === curr.y)) {
                // hack to avoid weird linejoins cutting the line
                curr.x += 0.1;
                curr.y += 0.1;
            }
            if (smoothing) {
                var mid = {x:(prev.x+curr.x)/2, y: (prev.y+curr.y)/2};
                ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
            } else {
                ctx.lineTo(curr.x, curr.y);
            }
            prevprev = prev;
            prev = points[i];
        }
        if (smoothing) {
            ctx.quadraticCurveTo(prev.x, prev.y, curr.x, curr.y);
        }
    }

    function distance(p1, p2) {
        return sqrt(pow2(p1.x - p2.x) + pow2(p1.y - p2.y));
    }

    function avg(arr) {
        var sum = 0,
            len = arr.length;
        for (var i = 0, l = len; i < l; i++) {
            sum += +arr[i];
        }
        return sum/len;
    }
})(TeledrawCanvas);

