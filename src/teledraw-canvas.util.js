/**
 * TeledrawCanvas.util
 */
(function (TeledrawCanvas) {
    var Util = function () { return Util; };

    Util.clear = function (ctx) {
        var ctx = ctx.canvas ? ctx : /* (canvas) */ctx.getContext('2d');
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    };

    // returns a CSS-style rgb(a) string for the given RGBA array
    Util.cssColor = function (rgba) {
        if (rgba.length == 3) {
            return "rgb(" +  floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + ")";
        }
        return "rgba(" + floor(rgba[0]) + "," + floor(rgba[1]) + "," + floor(rgba[2]) + "," + rgba[3] + ")";
    };

    // constrains c within a and b
    Util.clamp = clamp = function (c, a, b) {
        return (c < a ? a : c > b ? b : c);
    };

    // returns the opposite color. I think?
    Util.opposite = function (color) {
        if (!_.isArray(color)) {
            color = Util.parseColorString(color);
        }
        var hsl = Util.rgb2hsl(color);
        hsl[0] = (hsl[0] + 180) % 360;
        hsl[1] = 100 - hsl[1];
        hsl[2] = 100 - hsl[2];
        var rgb = Util.hsl2rgb(hsl);
        if (color.length === 4) {
            rgb.push(color[3]);
        }
        return rgb;
    };

    // kill the alpha channel!
    Util.rgba2rgb = function(rgba) {
        if (rgba.length === 3 || rgba[3] === 255) {
            return rgba;
        }
        var r = rgba[0],
            g = rgba[1],
            b = rgba[2],
            a = rgba[3],
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
            _max = max(r, g, b),
            _min = min(r, g, b),
            d, h, s, l = (_max + _min) / 2;
        if (_max == _min) {
            h = s = 0;
        } else {
            d = _max - _min;
            s = l > 0.5 ? d / (2 - _max - _min) : d / (_max + _min);
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
        n = clamp(n, 0, 255).toString(16);
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

    // parses any valid css color into an RGBA array
    Util.parseColorString = function(color_string)
    {
        function getRGB(str) {
            var a = document.createElement('a');
            a.style.color = str;
            document.body.appendChild(a);
            var color = getComputedStyle(a).color;
            document.body.removeChild(a);
            return color;
        }

        var ok = false, r, g, b, a;
        color_string = getRGB(color_string);

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
                1
                ];
            }
        },
        {
            re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(\.\d+)?)\)$/,
            //example: ['rgba(123, 234, 45, 0.5)', 'rgba(255,234,245, .1)'],
            process: function (bits){
                return [
                parseInt(bits[1]),
                parseInt(bits[2]),
                parseInt(bits[3]),
                parseFloat(bits[4])
                ];
            }
        }];

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
        a = (a < 0 || isNaN(a)) ? 0 : ((a > 1) ? 1 : a);
        return ok ? [r, g, b, a] : [0, 0, 0, 1];
    }

    TeledrawCanvas.util = Util;
})(TeledrawCanvas);


// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
