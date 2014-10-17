/**
 * Eraser tool
 */
(function (TeledrawCanvas) {
    var Eraser = TeledrawCanvas.Tool.createTool("eraser", "crosshair");

    Eraser.prototype.preview = function () {
        var canv = TeledrawCanvas.Tool.prototype.preview.apply(this, arguments);
        var ctx = canv.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canv.width, canv.height);
        var stroke = new Eraser.stroke(this.canvas, ctx);
        stroke.points = [{ x: canv.width/2, y: canv.height/2 }];
        stroke.draw();
        return canv;
    }


    Eraser.stroke.prototype.lineWidth = 1;
    Eraser.stroke.prototype.lineCap = 'round';

    Eraser.stroke.prototype.draw = function () {
        this.color = [255, 255, 255, 255];
        this.ctx.globalCompositeOperation = 'destination-out';
        TeledrawCanvas.tools.pencil.stroke.prototype.draw.call(this);
    };
})(TeledrawCanvas);

