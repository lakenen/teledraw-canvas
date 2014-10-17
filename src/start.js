var math = Math,
    abs = math.abs,
    sqrt = math.sqrt,
    floor = math.floor,
    round = math.round,
    min = math.min,
    max = math.max,
    pow = math.pow,
    pow2 = function (x) { return pow(x, 2); },
    clamp;

window.TeledrawCanvas = function (elt, opt) {
    return new TeledrawCanvas.api(elt, opt);
};
