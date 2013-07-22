/*

	Vector.js
	Copyright 2012 Cameron Lakenen

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

function Vector(x, y, z) {
	if (x instanceof Vector) {
		z = x.z;
        y = x.y;
        x = x.x;
	}
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}
Vector.prototype.add = function (v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};
Vector.prototype.scale = function (s) {
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
};
Vector.prototype.direction = function () {
	return Math.atan2(this.y, this.x);
};
Vector.prototype.magnitude = function () {
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};
Vector.prototype.addToMagnitude = function (n) {
	n = n || 0;
	var mag = this.magnitude();
	var magTransformation = Math.sqrt((n + mag) / mag);
	this.x *= magTransformation;
	this.y *= magTransformation;
	this.z *= magTransformation;
	return this;
};
Vector.prototype.unit = function () {
	return this.scale(1/this.magnitude());
};
Vector.prototype.rotateZ = function (t) {
	var oldX = this.x;
	var oldY = this.y;
	this.x = oldX*Math.cos(t) - oldY*Math.sin(t);
	this.y = oldX*Math.sin(t) + oldY*Math.cos(t);
	return this;
};
Vector.add = function (v1, v2) {
	return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};
Vector.subtract = function (v1, v2) {
	return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};
Vector.dot = function (v1, v2) {
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};
Vector.scale = function (v, s) {
	return new Vector(v.x * s, v.y * s, v.z * s);
};
Vector.cross = function (v1, v2) {
	return new Vector(
		v1.y * v2.z - v2.y * v1.z,
		v1.z * v2.x - v2.z * v1.x,
		v1.x * v2.y - v2.x * v1.y
	);
};
Vector.average = function () {
	var num, result = new Vector(), items = arguments;
	if (arguments[0].constructor.toString().indexOf('Array') !== -1) {
		items = arguments[0];
    }
	num = items.length;
	for (i = 0; i < num;i++) {
		result.add(Vector.create(items[i]));
	}
	return result.scale(1/num);
};
Vector.create = function (o) {
	return new Vector(o.x, o.y, o.z);
};
