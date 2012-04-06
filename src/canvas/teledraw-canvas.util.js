/**
 * TeledrawCanvas.util
 */
(function (TeledrawCanvas) {
	var Util = function () { return Util; };
	var floor = Math.floor,
		min = Math.min,
		max = Math.max;
	
	Util.cssColor = function (rgba) {
	    if (rgba.length == 3) {
	        return "rgb(" +  floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + ")";
	    }
	    return "rgba(" + floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + "," + (floor(rgba[3]) / 0xFF) + ")";
	};
	
	Util.clamp = function (c, a, b) {
		return (c < a ? a : c > b ? b : c);
	};
	
	Util.opposite = function (color) {
		if (!$.isArray(color)) {
			color = TeledrawCanvas.util.parseColorString(color);
		}
		var hsl = Util.rgb2hsl(color);
		hsl[0] = (hsl[0] + 180) % 360;
		hsl[1] = 100 - hsl[1];
		hsl[2] = 100 - hsl[2];
		return Util.hsl2rgb(hsl);
	};
	
	// kill the alpha channel!
	Util.rgba2rgb = function(rgba) {
		if (rgba.length === 3 || rgba[3] === 255) {
			return rgba;
		}
		var r = rgba[0],
			g = rgba[1],
			b = rgba[2],
			a = rgba[3]/255,
			out = [];
		out[0] = (a * r) + (255 - a*255);
		out[1] = (a * g) + (255 - a*255);
		out[2] = (a * b) + (255 - a*255);
		return out;
	};
	
	Util.rgb2hex = function (rgb) {
		rgb = Util.rgba2rgb(rgb);
		return '#' + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
	};
	
	Util.hex2rgb = function (hex) {
		return Util.parseColorString(hex);
	};
	
	Util.rgb2hsl = function (rgb) {
		var r = rgb[0]/255,
			g = rgb[1]/255,
			b = rgb[2]/255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			d, h, s, l = (max + min) / 2;
		if (max == min) {
			h = s = 0;
		} else {
			d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s*100, l*100];
	};
	
	Util.hex2hsl = function (hex) {
		return Util.rgb2hsl(Util.hex2rgb(hex));
	};
	
	Util.hsl2rgb = function (hsl) {
		var m1, m2, hue;
		var r, g, b;
		var h = hsl[0],
			s = hsl[1]/100,
			l = hsl[2]/100;
		if (s == 0)
			r = g = b = (l * 255);
		else {
			if (l <= 0.5)
				m2 = l * (s + 1);
			else
				m2 = l + s - l * s;
			m1 = l * 2 - m2;
			hue = h / 360;
			r = hue2rgb(m1, m2, hue + 1/3);
			g = hue2rgb(m1, m2, hue);
			b = hue2rgb(m1, m2, hue - 1/3);
		}
		return [r, g, b];
	};
	
	function toHex(n) {
		n = parseInt(n, 10) || 0;
		n = Util.clamp(n, 0, 255).toString(16);
		if (n.length === 1) {
			n = '0'+n;
		}
		return n;
	}
	
	
	function hue2rgb(m1, m2, hue) {
		var v;
		if (hue < 0)
			hue += 1;
		else if (hue > 1)
			hue -= 1;
	
		if (6 * hue < 1)
			v = m1 + (m2 - m1) * hue * 6;
		else if (2 * hue < 1)
			v = m2;
		else if (3 * hue < 2)
			v = m1 + (m2 - m1) * (2/3 - hue) * 6;
		else
			v = m1;
	
		return 255 * v;
	}
	
	/**
	* A class to parse color values (into rgba array)
	* @author Stoyan Stefanov <sstoo@gmail.com>
	* @link   http://www.phpied.com/rgb-color-parser-in-javascript/
	* @license Use it if you like it
	*/
	Util.parseColorString = function(color_string)
	{
		var ok = false;
	 	var r, g, b, a;
	 	
		// strip any leading #
		if (color_string.charAt(0) == '#') { // remove # if any
			color_string = color_string.substr(1,6);
		}
	 
		color_string = color_string.replace(/ /g,'');
		color_string = color_string.toLowerCase();
	 
		// before getting into regexps, try simple matches
		// and overwrite the input
		var simple_colors = {
			aliceblue: 'f0f8ff',
			antiquewhite: 'faebd7',
			aqua: '00ffff',
			aquamarine: '7fffd4',
			azure: 'f0ffff',
			beige: 'f5f5dc',
			bisque: 'ffe4c4',
			black: '000000',
			blanchedalmond: 'ffebcd',
			blue: '0000ff',
			blueviolet: '8a2be2',
			brown: 'a52a2a',
			burlywood: 'deb887',
			cadetblue: '5f9ea0',
			chartreuse: '7fff00',
			chocolate: 'd2691e',
			coral: 'ff7f50',
			cornflowerblue: '6495ed',
			cornsilk: 'fff8dc',
			crimson: 'dc143c',
			cyan: '00ffff',
			darkblue: '00008b',
			darkcyan: '008b8b',
			darkgoldenrod: 'b8860b',
			darkgray: 'a9a9a9',
			darkgreen: '006400',
			darkkhaki: 'bdb76b',
			darkmagenta: '8b008b',
			darkolivegreen: '556b2f',
			darkorange: 'ff8c00',
			darkorchid: '9932cc',
			darkred: '8b0000',
			darksalmon: 'e9967a',
			darkseagreen: '8fbc8f',
			darkslateblue: '483d8b',
			darkslategray: '2f4f4f',
			darkturquoise: '00ced1',
			darkviolet: '9400d3',
			deeppink: 'ff1493',
			deepskyblue: '00bfff',
			dimgray: '696969',
			dodgerblue: '1e90ff',
			feldspar: 'd19275',
			firebrick: 'b22222',
			floralwhite: 'fffaf0',
			forestgreen: '228b22',
			fuchsia: 'ff00ff',
			gainsboro: 'dcdcdc',
			ghostwhite: 'f8f8ff',
			gold: 'ffd700',
			goldenrod: 'daa520',
			gray: '808080',
			green: '008000',
			greenyellow: 'adff2f',
			honeydew: 'f0fff0',
			hotpink: 'ff69b4',
			indianred : 'cd5c5c',
			indigo : '4b0082',
			ivory: 'fffff0',
			khaki: 'f0e68c',
			lavender: 'e6e6fa',
			lavenderblush: 'fff0f5',
			lawngreen: '7cfc00',
			lemonchiffon: 'fffacd',
			lightblue: 'add8e6',
			lightcoral: 'f08080',
			lightcyan: 'e0ffff',
			lightgoldenrodyellow: 'fafad2',
			lightgrey: 'd3d3d3',
			lightgreen: '90ee90',
			lightpink: 'ffb6c1',
			lightsalmon: 'ffa07a',
			lightseagreen: '20b2aa',
			lightskyblue: '87cefa',
			lightslateblue: '8470ff',
			lightslategray: '778899',
			lightsteelblue: 'b0c4de',
			lightyellow: 'ffffe0',
			lime: '00ff00',
			limegreen: '32cd32',
			linen: 'faf0e6',
			magenta: 'ff00ff',
			maroon: '800000',
			mediumaquamarine: '66cdaa',
			mediumblue: '0000cd',
			mediumorchid: 'ba55d3',
			mediumpurple: '9370d8',
			mediumseagreen: '3cb371',
			mediumslateblue: '7b68ee',
			mediumspringgreen: '00fa9a',
			mediumturquoise: '48d1cc',
			mediumvioletred: 'c71585',
			midnightblue: '191970',
			mintcream: 'f5fffa',
			mistyrose: 'ffe4e1',
			moccasin: 'ffe4b5',
			navajowhite: 'ffdead',
			navy: '000080',
			oldlace: 'fdf5e6',
			olive: '808000',
			olivedrab: '6b8e23',
			orange: 'ffa500',
			orangered: 'ff4500',
			orchid: 'da70d6',
			palegoldenrod: 'eee8aa',
			palegreen: '98fb98',
			paleturquoise: 'afeeee',
			palevioletred: 'd87093',
			papayawhip: 'ffefd5',
			peachpuff: 'ffdab9',
			peru: 'cd853f',
			pink: 'ffc0cb',
			plum: 'dda0dd',
			powderblue: 'b0e0e6',
			purple: '800080',
			red: 'ff0000',
			rosybrown: 'bc8f8f',
			royalblue: '4169e1',
			saddlebrown: '8b4513',
			salmon: 'fa8072',
			sandybrown: 'f4a460',
			seagreen: '2e8b57',
			seashell: 'fff5ee',
			sienna: 'a0522d',
			silver: 'c0c0c0',
			skyblue: '87ceeb',
			slateblue: '6a5acd',
			slategray: '708090',
			snow: 'fffafa',
			springgreen: '00ff7f',
			steelblue: '4682b4',
			tan: 'd2b48c',
			teal: '008080',
			thistle: 'd8bfd8',
			tomato: 'ff6347',
			turquoise: '40e0d0',
			violet: 'ee82ee',
			violetred: 'd02090',
			wheat: 'f5deb3',
			white: 'ffffff',
			whitesmoke: 'f5f5f5',
			yellow: 'ffff00',
			yellowgreen: '9acd32'
		};
		for (var key in simple_colors) {
			if (color_string == key) {
				color_string = simple_colors[key];
			}
		}
		// emd of simple type-in colors
	 
		// array of color definition objects
		var color_defs = [
		{
			re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				return [
				parseInt(bits[1]),
				parseInt(bits[2]),
				parseInt(bits[3]),
				255
				];
			}
		},
		{
			re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*\.*\d{1,3})\)$/,
			//example: ['rgba(123, 234, 45, 0.5)', 'rgba(255,234,245, .1)'],
			process: function (bits){
				return [
				parseInt(bits[1]),
				parseInt(bits[2]),
				parseInt(bits[3]),
				parseFloat(bits[4]) * 0xFF
				];
			}
		},
		{
			re: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				var rgba = Util.hsl2rgb(bits.slice(1, 4));
				rgba.push(255);
				return rgba;
			}
		},
		{
			re: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d*\.*\d{1,3})\)$/,
			//example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
			process: function (bits){
				var rgba = Util.hsl2rgb(bits.slice(1, 4));
				rgba.push(parseFloat(bits[4]) * 0xFF);
				return rgba;
			}
		},
		{
			re: /^(\w{2})(\w{2})(\w{2})$/,
			//example: ['#00ff00', '336699'],
			process: function (bits){
				return [
				parseInt(bits[1], 16),
				parseInt(bits[2], 16),
				parseInt(bits[3], 16),
				255
				];
			}
		},
		{
			re: /^(\w{1})(\w{1})(\w{1})$/,
			//example: ['#fb0', 'f0f'],
			process: function (bits){
				return [
				parseInt(bits[1] + bits[1], 16),
				parseInt(bits[2] + bits[2], 16),
				parseInt(bits[3] + bits[3], 16),
				255
				];
			}
		}
		];
	 
		// search through the definitions to find a match
		for (var i = 0; i < color_defs.length; i++) {
			var re = color_defs[i].re;
			var processor = color_defs[i].process;
			var bits = re.exec(color_string);
			if (bits) {
				channels = processor(bits);
				r = channels[0];
				g = channels[1];
				b = channels[2];
				a = channels[3];
				ok = true;
			}
	 
		}
	 
		// validate/cleanup values
		r = (r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r);
		g = (g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g);
		b = (b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b);
		a = (a < 0 || isNaN(a)) ? 0 : ((a > 255) ? 255 : a);
		return ok ? [r, g, b, a] : [0, 0, 0, 255];
	}
	
	TeledrawCanvas.util = Util;
})(TeledrawCanvas);

