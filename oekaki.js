let gCanvas;
let gCtx;
let pCanvas;
let pCtx;
let hslCanvas;
let hslCtx;
let penCanvas;
let penCtx;
let eraserCanvas;
let eraserCtx;
let brushCanvas;
let brushCtx;
let fillCanvas;
let fillCtx;
let mousePoint = null;
let isDraw = false;
let selectMode = "PEN";

let nowDrawSize = 1;
let nowColor = [0, 0, 0];
let nowHsl_H = 0;
let nowHsl_S = 0;
let nowHsl_L = 0;
let fillThreshold = 30;

function setSelectMode(mode = "PEN") {
    selectMode = mode;
    document.getElementById('pen').style.backgroundColor = "lightgray";
    document.getElementById('pen').style.color = "black";
    document.getElementById('brush').style.backgroundColor = "lightgray";
    document.getElementById('brush').style.color = "black";
    document.getElementById('eraser').style.backgroundColor = "lightgray";
    document.getElementById('eraser').style.color = "black";
    document.getElementById('fill').style.backgroundColor = "lightgray";
    document.getElementById('fill').style.color = "black";
    document.getElementById('eyedropper').style.backgroundColor = "lightgray";
    document.getElementById('eyedropper').style.color = "black";

    if (selectMode === "PEN") {
        document.getElementById('pen').style.backgroundColor = "gray";
        document.getElementById('pen').style.color = "white";
    }
    if (selectMode === "BRUSH") {
        document.getElementById('brush').style.backgroundColor = "gray";
        document.getElementById('brush').style.color = "white";
    }
    if (selectMode === "ERASER") {
        document.getElementById('eraser').style.backgroundColor = "gray";
        document.getElementById('eraser').style.color = "white";
    }
    if (selectMode === "FILL") {
        document.getElementById('fill').style.backgroundColor = "gray";
        document.getElementById('fill').style.color = "white";
    }
    if (selectMode === "EYEDROPPER") {
        document.getElementById('eyedropper').style.backgroundColor = "gray";
        document.getElementById('eyedropper').style.color = "white";
    }
}

function clickHsl(e) {
    nowHsl_H = 360 * e.offsetX / 200;
    refreshHslCanvas();
    refreshPallet();
    setHslColor();
}

function clickPallet(e) {
    nowHsl_S = 100 * e.offsetX / 200;
    nowHsl_L = 100 - (100 * e.offsetY / 200);
    refreshPallet();
    setHslColor();
}

function onMouseDown(e) {
    if (!isDraw) {
        isDraw = true;
        drawPenDown(gCtx);
    }
    if (selectMode === "EYEDROPPER") eyedropperTool(e.offsetX, e.offsetY);
    if (selectMode === "FILL") fillTool(e.offsetX, e.offsetY);
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseMove(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx, e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "BRUSH") drawBrushLine(gCtx, mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "ERASER") drawPenLine(gCtx, e.offsetX, e.offsetY, "white", nowDrawSize);
    }
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseUp(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx, e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "ERASER") drawPenLine(gCtx, e.offsetX, e.offsetY, "white", nowDrawSize);
        isDraw = false;
        drawPenUp(gCtx)
    }
    mousePoint = null;
}

function toRGB(c) {
    return ("rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")");
}

function fillTool(x, y) {
    let targetColor = gCtx.getImageData(x, y, 1, 1).data;
    let buffer = [];
    buffer.push([x, y]);
    while (buffer.length > 0) {
        let pos = buffer.pop();
        if (pos[0] < 0 || pos[0] >= gCanvas.width || pos[1] < 0 || pos[1] >= gCanvas.height) continue;
        let posColor = gCtx.getImageData(pos[0], pos[1], 1, 1).data;
        if (colorMatch(nowColor, posColor)) continue;
        if (!colorMatch(targetColor, posColor)) continue;
        drawPoint(gCtx, pos[0], pos[1], toRGB(nowColor));
        buffer.push([pos[0] - 1, pos[1]]);
        buffer.push([pos[0], pos[1] - 1]);
        buffer.push([pos[0], pos[1] + 1]);
        buffer.push([pos[0] + 1, pos[1]]);
    }
}

function colorMatch(c1, c2) {
    for (let i = 0; i < 3; i++) {
        if (c1[i] <= c2[i] - fillThreshold || c1[i] >= c2[i] + fillThreshold) return false;
    }
    return true;
}

function eyedropperTool(x, y) {
    let hsl = getCanvasColor(gCtx, x, y);
    setColor(hsl[0], hsl[1], hsl[2]);
}

function getCanvasColor(ctx, x, y) {
    let rgb = ctx.getImageData(x, y, 1, 1)
    let r = rgb.data[0] / 255;
    let g = rgb.data[1] / 255;
    let b = rgb.data[2] / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let diff = max - min;
    let h = 0;
    let s = 100 * diff / (1 - (Math.abs(max + min - 1)));
    if (isNaN(s)) s = 0;
    let l = 100 * (max + min) / 2;
    switch (min) {
        case max:
            h = 0;
            break;
        case r:
            h = (60 * ((b - g) / diff)) + 180;
            break;
        case g:
            h = (60 * ((r - b) / diff)) + 300;
            break;
        case b:
            h = (60 * ((g - r) / diff)) + 60;
            break;
    }
    return [h, s, l];
}

window.addEventListener('load', () => {
    onload();
}, false);

function onload() {
    gCanvas = document.getElementById('main_canvas');
    gCtx = gCanvas.getContext('2d');
    pCanvas = document.getElementById('pallet_canvas');
    pCtx = pCanvas.getContext('2d');
    hslCanvas = document.getElementById('hsl_canvas');
    hslCtx = hslCanvas.getContext('2d');
    penCanvas = document.getElementById('pen_canvas');
    penCtx = penCanvas.getContext('2d');
    brushCanvas = document.getElementById('brush_canvas');
    brushCtx = brushCanvas.getContext('2d');
    fillCanvas = document.getElementById('fill_canvas');
    fillCtx = fillCanvas.getContext('2d');
    eraserCanvas = document.getElementById('eraser_canvas');
    eraserCtx = eraserCanvas.getContext('2d');
    setCanvasSize();
    setSelectMode();
    refreshPallet()
    clearCanvas();
    refreshHslCanvas();
    setHslColor();
    setDrawSizeSlider();
    deleteColorMemory();
    gCanvas.addEventListener('mousedown', onMouseDown, false);
    gCanvas.addEventListener('mousemove', onMouseMove, false);
    gCanvas.addEventListener('mouseup', onMouseUp, false);
    pCanvas.addEventListener('click', clickPallet, false);
    hslCanvas.addEventListener('click', clickHsl, false);
}

function setCanvasSize() {
    gCanvas.width = document.getElementById('canvasWidthSize').value;
    gCanvas.height = document.getElementById('canvasHeightSize').value;
    clearCanvas();
}

function setDrawSize(w) {
    document.getElementById('drawSizeSlider').value = w;
    setDrawSizeSlider();
}

function setDrawSizeSlider() {
    nowDrawSize = document.getElementById('drawSizeSlider').value;
    document.getElementById("drawSizeValue").innerHTML = nowDrawSize + "px";
    refreshPenCanvas();
    refreshBrushCanvas()
    refreshEraserCanvas();
}

function setHslColor() {
    nowColor = rgbToHSL(nowHsl_H, nowHsl_S, nowHsl_L);
    document.getElementById("hslValue_H").innerHTML = "H:" + nowHsl_H;
    document.getElementById("hslValue_S").innerHTML = "S:" + nowHsl_S;
    document.getElementById("hslValue_L").innerHTML = "L:" + nowHsl_L;
    document.getElementById("rgbValue_R").innerHTML = "R:" + nowColor[0];
    document.getElementById("rgbValue_G").innerHTML = "G:" + nowColor[1];
    document.getElementById("rgbValue_B").innerHTML = "B:" + nowColor[2];

    refreshPenCanvas();
    refreshBrushCanvas();
    refreshFillCanvas();
}

function rgbToHSL(h, s, l) {
    if (((h || h === 0) && h <= 360) && ((s || s === 0) && s <= 100) && ((l || l === 0) && l <= 100)) {
        var r = 0,
            g = 0,
            b = 0,
            q = 0,
            p = 0;
        h = Number(h) / 360;
        s = Number(s) / 100;
        l = Number(l) / 100;
        if (s === 0) {
            r = l;
            g = l;
            b = l;
        } else {
            var hueToRgb = function (p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;

                if (t < 1 / 6) {
                    p = p + (q - p) * 6 * t;
                } else if (t < 1 / 2) {
                    p = q;
                } else if (t < 2 / 3) {
                    p = p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            };
            if (l < 0.5) {
                q = l * (1 + s);
            } else {
                q = l + s - l * s;
            }
            p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function setColor(h, s, l) {
    nowHsl_H = Math.floor(10 * h) / 10;
    nowHsl_S = Math.floor(100 * s) / 100;
    nowHsl_L = Math.floor(100 * l) / 100;

    refreshPallet();
    refreshHslCanvas();
    setHslColor();
}

function addColorMemory() {
    let btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("style", "background-color: hsl(" + nowHsl_H + ", " + nowHsl_S + "%, " + nowHsl_L + "%)");
    btn.setAttribute("onclick", "setColor(" + nowHsl_H + "," + nowHsl_S + "," + nowHsl_L + ")");
    document.getElementById("memorySlot").appendChild(btn);
}

function deleteColorMemory() {
    let templateColor = [[0, 0, 0], [0, 100, 50], [120, 100, 50], [240, 100, 50]];
    let str = "";
    for (let i = 0; i < templateColor.length; i++) {
        str += '<input type="button" style="background-color: ';
        str += 'hsl(' + templateColor[i][0] + ', ' + templateColor[i][1] + '%, ' + templateColor[i][2] + '%);"'
        str += ' onclick="setColor(' + templateColor[i][0] + ',' + templateColor[i][1] + ',' + templateColor[i][2] + ')">';
    }
    document.querySelector('#memorySlot').innerHTML = str;
}

function clearButton() {
    if (window.confirm('本当に初期化しますか？')) {
        clearCanvas();
    }
}

function clearCanvas() {
    fillRectangle(gCtx, 0, 0, gCanvas.width, gCanvas.height, "white");
}

function refreshPallet() {
    fillRectangle(pCtx, 0, 0, pCanvas.width, pCanvas.height, "white");
    for (let i = 0; i < 200; i++) {
        for (let j = 0; j < 200; j++) {
            drawPoint(pCtx, j, i, "hsl(" + nowHsl_H + ", " + 100 * (j / 200) + "% ," + (100 - 100 * (i / 200)) + "%)");
        }
    }
    drawRectangle(pCtx, nowHsl_S * 2 - 3, ((100 - nowHsl_L) * 2) - 3, 6, 6, "black", 1);
    drawRectangle(pCtx, nowHsl_S * 2 - 2, ((100 - nowHsl_L) * 2) - 2, 4, 4, "white", 1);
}

function refreshHslCanvas() {
    fillRectangle(hslCtx, 0, 0, hslCanvas.width, hslCanvas.height, "white");
    for (let i = 0; i < 200; i++) {
        drawLine(hslCtx, i, 0, i, 20, "hsl(" + 360 * i / 200 + ", 100%, 50%)");
    }
    drawLine(hslCtx, 200 * nowHsl_H / 360 - 1, 0, 200 * nowHsl_H / 360 - 1, 20, "black");
    drawLine(hslCtx, 200 * nowHsl_H / 360 + 0, 0, 200 * nowHsl_H / 360 + 0, 20, "white");
    drawLine(hslCtx, 200 * nowHsl_H / 360 + 1, 0, 200 * nowHsl_H / 360 + 1, 20, "black");
}

function refreshPenCanvas() {
    drawMeshPattern(penCtx, penCanvas.width, penCanvas.height);
    drawPenDown(penCtx);
    for (let i = 0; i < penCanvas.width - 60; i++) {
        let h = penCanvas.height;
        let w = penCanvas.width - 60;
        drawPenLine(penCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), toRGB(nowColor), nowDrawSize);
    }
    drawPenUp(penCtx);
}

function refreshBrushCanvas() {
    drawMeshPattern(brushCtx, brushCanvas.width, brushCanvas.height);
    for (let i = 0; i < brushCanvas.width - 60; i++) {
        let h = brushCanvas.height;
        let w = brushCanvas.width - 60;
        let s = -4 / (w * w) * i * (i - w) * nowDrawSize;
        drawLine(brushCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), i + 1 + 30, (h / 2 + Math.sin((i + 1) * 2 * Math.PI / (w)) * h / 6), toRGB(nowColor), s);
    }
}

function refreshEraserCanvas() {
    drawMeshPattern(eraserCtx, eraserCanvas.width, eraserCanvas.height);
    drawPenDown(eraserCtx);
    for (let i = 0; i < eraserCanvas.width - 60; i++) {
        let h = eraserCanvas.height;
        let w = eraserCanvas.width - 60;
        drawPenLine(eraserCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), 'white', nowDrawSize);
    }
    drawPenUp(eraserCtx);
}

function refreshFillCanvas(){
    drawMeshPattern(fillCtx, fillCanvas.width, fillCanvas.height);
    fillRectangle(fillCtx, 0, 0, fillCanvas.width/2, fillCanvas.height, toRGB(nowColor));
}