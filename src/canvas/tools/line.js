/**
 * Line tool
 */
(function (TeledrawCanvas) {
	var Line = TeledrawCanvas.Tool.createTool("line", "crosshair");
	
	//Line.prototype.keydown = Canvas.ellipse.prototype.keydown;
	//Line.prototype.keyup = Canvas.ellipse.prototype.keyup;
	
	Line.stroke.prototype.lineWidth = 1;
	Line.stroke.prototype.lineCap = 'round';
	Line.stroke.prototype.bgColor = [255, 255, 255];
	Line.stroke.prototype.bgAlpha = 0;
	
	Line.stroke.prototype.start = function (pt) {
	    this.first = pt;
	};

	Line.stroke.prototype.move = function (a, b) {
	    this.second = b;
	};

	Line.stroke.prototype.end = function (pt) {
	    this.second = pt;
	};

	Line.stroke.prototype.draw = function () {
	    if (!this.first || !this.second) return;
	    var first = _.extend({}, this.first),
	    	second = _.extend({}, this.second),
	    	a, x, y, pi = Math.PI;
	    if (this.tool.shiftKey) {
	    	x = second.x - first.x;
	    	y = second.y - first.y;
	    	a = Math.atan2(y, x);
	    	
	    	if ((a >= -pi*7/8 && a < -pi*5/8) ||
	    		(a >= -pi*3/8 && a < -pi/8))
	    	{
	    		second.y = first.y - Math.abs(x); // NW, NE
	    	} else
	    	if ((a >= -pi*5/8 && a < -pi*3/8) ||
	    		(a >= pi*3/8 && a < pi*5/8))
	    	{
	    		second.x = first.x; // N, S
	    	} else
	    	if ((a >= pi/8 && a < pi*3/8) || 
	    		(a >= pi*5/8 && a < pi*7/8))
	    	{
	    		second.y = first.y + Math.abs(x); // SE, SW
	    	} else {
	    		second.y = first.y; // E, W
	    	}
	    }
	    this.points = [first, second];
	    TeledrawCanvas.tools['pencil'].stroke.prototype.draw.call(this);
	};
})(TeledrawCanvas);

