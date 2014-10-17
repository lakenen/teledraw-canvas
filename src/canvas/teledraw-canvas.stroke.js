/**
 * TeledrawCanvas.Stroke
 */
(function (TeledrawCanvas) {
    var Stroke = function (canvas) {
        this.canvas = canvas;
    };

    Stroke.prototype.start = function (pt) {};
    Stroke.prototype.move = function (pt1, pt2) {};
    Stroke.prototype.end = function () {};
    Stroke.prototype.draw = function () {};

    Stroke.prototype.save = function () {
        this.snapshot = new TeledrawCanvas.Snapshot(this.canvas);
    };

    Stroke.prototype.restore = function () {
        this.snapshot.restore(this);
    };

    Stroke.prototype.destroy = function () {
        this.snapshot.destroy();
    };

    TeledrawCanvas.Stroke = Stroke;
})(TeledrawCanvas);

