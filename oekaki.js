let gCanvas = [];
let gCtx = [];
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
let selectLayer = 0;
let maxLayer = 0;

let nowDrawSize = 1;
let nowColor = [0, 0, 0];
let nowHsl_H = 0;
let nowHsl_S = 0;
let nowHsl_L = 0;
let fillThreshold = 30;

const UNDO_STACK = 3;
let undoCanvas = { data: [], number: [] };

window.addEventListener('load', () => {
    onload();
}, false);

window.addEventListener('resize', () => {
    updataCanvasPosition();
}, false);

document.addEventListener('DOMContentLoaded', () => {
    const resizeObserver = new ResizeObserver((entries) => {
        updataCanvasPosition();
    });
    resizeObserver.observe(document.querySelector('#main'));
}, false)

function onload() {
    gCanvas[0] = document.getElementById('canvas_0');
    gCtx[0] = gCanvas[0].getContext('2d');
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
    footerUpdate();
    setCanvasSize();
    setSelectMode();
    refreshPallet()
    clearCanvas();
    refreshHslCanvas();
    setHslColor();
    setDrawSizeSlider();
    deleteColorMemory();
    updataLayerButton();
    gCanvas[0].addEventListener('mousedown', onMouseDown, false);
    gCanvas[0].addEventListener('mousemove', onMouseMove, false);
    gCanvas[0].addEventListener('mouseup', onMouseUp, false);
    pCanvas.addEventListener('click', clickPallet, false);
    hslCanvas.addEventListener('click', clickHsl, false);
}

function setSelectMode(mode = "PEN") {

    hideB = "gray";
    hideC = "white";
    selectB = "lightgray";
    selectC = "black";

    selectMode = mode;
    footerUpdate();
    document.getElementById('pen').style.backgroundColor = hideB;
    document.getElementById('pen').style.color = hideC;
    document.getElementById('brush').style.backgroundColor = hideB;
    document.getElementById('brush').style.color = hideC;
    document.getElementById('eraser').style.backgroundColor = hideB;
    document.getElementById('eraser').style.color = hideC;
    document.getElementById('fill').style.backgroundColor = hideB;
    document.getElementById('fill').style.color = hideC;
    document.getElementById('eyedropper').style.backgroundColor = hideB;
    document.getElementById('eyedropper').style.color = hideC;

    if (selectMode === "PEN") {
        document.getElementById('pen').style.backgroundColor = selectB;
        document.getElementById('pen').style.color = selectC;
    }
    if (selectMode === "BRUSH") {
        document.getElementById('brush').style.backgroundColor = selectB;
        document.getElementById('brush').style.color = selectC;
    }
    if (selectMode === "ERASER") {
        document.getElementById('eraser').style.backgroundColor = selectB;
        document.getElementById('eraser').style.color = selectC;
    }
    if (selectMode === "FILL") {
        document.getElementById('fill').style.backgroundColor = selectB;
        document.getElementById('fill').style.color = selectC;
    }
    if (selectMode === "EYEDROPPER") {
        document.getElementById('eyedropper').style.backgroundColor = selectB;
        document.getElementById('eyedropper').style.color = selectC;
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
    saveCanvas();
    if (!isDraw) {
        isDraw = true;
        if (selectMode === "PEN") drawPenDown(gCtx[selectLayer]);
        if (selectMode === "ERASER") {
            if (selectLayer === 0) drawPenDown(gCtx[selectLayer]);
            if (selectLayer > 0) eraserDown(gCtx[selectLayer]);
        }
    }
    if (selectMode === "EYEDROPPER") eyedropperTool(e.offsetX, e.offsetY);
    if (selectMode === "FILL") fillTool(e.offsetX, e.offsetY);
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseMove(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx[selectLayer], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "BRUSH") drawBrushLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "ERASER") {
            if (selectLayer === 0) drawPenLine(gCtx[selectLayer], e.offsetX, e.offsetY, "white", nowDrawSize);
            if (selectLayer > 0) eraserLine(gCtx[selectLayer], e.offsetX, e.offsetY, nowDrawSize);
        }
    }
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseUp(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx[selectLayer], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "ERASER") {
            if (selectLayer === 0) drawPenLine(gCtx[selectLayer], e.offsetX, e.offsetY, "white", nowDrawSize);
            if (selectLayer > 0) eraserLine(gCtx[selectLayer], e.offsetX, e.offsetY, nowDrawSize);
        }
        isDraw = false;
        if (selectMode === "PEN") drawPenUp(gCtx[selectLayer])
        if (selectMode === "ERASER") {
            if (selectLayer === 0) drawPenUp(gCtx[selectLayer]);
            if (selectLayer > 0) eraserUp(gCtx[selectLayer]);
        }
    }
    mousePoint = null;
}

function footerUpdate(){
    document.getElementById('selectModeText').innerHTML = "selectMode : " + selectMode;
    document.getElementById('rgbText').innerHTML = "R : " + nowColor[0] + " / G : " + nowColor[1] + " / B : " + nowColor[2];
    document.getElementById('selectLayerText').innerHTML = "selectLayer : " + selectLayer;
}

function toRGB(c) {
    return ("rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")");
}

function fillTool(x, y) {
    let targetColor = gCtx[selectLayer].getImageData(x, y, 1, 1).data;
    let buffer = [];
    buffer.push([x, y]);
    while (buffer.length > 0) {
        let pos = buffer.pop();
        if (pos[0] < 0 || pos[0] >= gCanvas[selectLayer].width || pos[1] < 0 || pos[1] >= gCanvas[selectLayer].height) continue;
        let posColor = gCtx[selectLayer].getImageData(pos[0], pos[1], 1, 1).data;
        if (colorMatch(nowColor, posColor)) continue;
        if (!colorMatch(targetColor, posColor)) continue;
        drawPoint(gCtx[selectLayer], pos[0], pos[1], toRGB(nowColor));
        buffer.push([pos[0] - 1, pos[1]]);
        buffer.push([pos[0], pos[1] - 1]);
        buffer.push([pos[0], pos[1] + 1]);
        buffer.push([pos[0] + 1, pos[1]]);
    }
}

function colorMatch(c1, c2) {
    for (let i = 0; i < 4; i++) {
        if (c1[i] <= c2[i] - fillThreshold || c1[i] >= c2[i] + fillThreshold) return false;
    }
    return true;
}

function eyedropperTool(x, y) {
    let hsl = getCanvasColor(gCtx[selectLayer], x, y);
    setColor(hsl[0], hsl[1], hsl[2]);
}

function getCanvasColor(ctx, x, y) {
    let rgb = ctx.getImageData(x, y, 1, 1);
    let hsl = rgbToHsl(rgb.data);
    return hsl;
}

function rgbToHsl(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
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

function setCanvasSize() {
    allClearCanvas();
    updataCanvasPosition()
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

function setRGBSizeSlider() {
    nowColor[0] = parseInt(document.getElementById("rgbSlider_R").value);
    nowColor[1] = parseInt(document.getElementById("rgbSlider_G").value);
    nowColor[2] = parseInt(document.getElementById("rgbSlider_B").value);

    let hsl = rgbToHsl(nowColor);
    nowHsl_H = Math.floor(hsl[0] * 10) / 10;
    nowHsl_S = Math.floor(hsl[1] * 100) / 100;
    nowHsl_L = Math.floor(hsl[2] * 100) / 100;

    updataColor();
}

function updataColor() {
    document.getElementById("hslValue_H").innerHTML = "H:" + nowHsl_H;
    document.getElementById("hslValue_S").innerHTML = "S:" + nowHsl_S;
    document.getElementById("hslValue_L").innerHTML = "L:" + nowHsl_L;
    document.getElementById("rgbValue_R").innerHTML = "R:" + nowColor[0];
    document.getElementById("rgbValue_G").innerHTML = "G:" + nowColor[1];
    document.getElementById("rgbValue_B").innerHTML = "B:" + nowColor[2];
    document.getElementById("colorSample").style.backgroundColor = toRGB(nowColor);
    document.getElementById("rgbSlider_R").value = nowColor[0];
    document.getElementById("rgbSlider_G").value = nowColor[1];
    document.getElementById("rgbSlider_B").value = nowColor[2];

    footerUpdate();
    refreshPallet();
    refreshHslCanvas();

    refreshPenCanvas();
    refreshBrushCanvas();
    refreshFillCanvas();
}

function setHslColor() {
    nowColor = hslToRgb(nowHsl_H, nowHsl_S, nowHsl_L);

    updataColor();
}

function hslToRgb(h, s, l) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (((h || h === 0) && h <= 360) && ((s || s === 0) && s <= 100) && ((l || l === 0) && l <= 100)) {
        let q = 0;
        let p = 0;
        h = Number(h) / 360;
        s = Number(s) / 100;
        l = Number(l) / 100;
        if (s === 0) {
            r = l;
            g = l;
            b = l;
        } else {
            let hueToRgb = function (p, q, t) {
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
    let templateColor = [[0, 0, 0], [0, 0, 100], [0, 100, 50], [120, 100, 50], [240, 100, 50]];
    let str = "";
    for (let i = 0; i < templateColor.length; i++) {
        str += '<input type="button" style="background-color: ';
        str += 'hsl(' + templateColor[i][0] + ', ' + templateColor[i][1] + '%, ' + templateColor[i][2] + '%);"'
        str += ' onclick="setColor(' + templateColor[i][0] + ',' + templateColor[i][1] + ',' + templateColor[i][2] + ')">';
    }
    document.querySelector('#memorySlot').innerHTML = str;
}

function addLayer() {
    maxLayer += 1;
    let btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("id", "layerButton_" + maxLayer);
    btn.setAttribute("value", "レイヤー" + maxLayer);
    btn.setAttribute("onclick", "setSelectLayer(" + maxLayer + ")");
    document.getElementById("layerList").prepend(btn);

    let can = document.createElement("canvas");
    can.setAttribute("width", document.getElementById('canvasWidthSize').value);
    can.setAttribute("height", document.getElementById('canvasHeightSize').value);
    can.setAttribute("class", "main_canvas");
    can.setAttribute("id", "canvas_" + maxLayer);
    document.getElementById("canvas_group").appendChild(can);

    gCanvas.push(document.getElementById('canvas_' + maxLayer));
    gCtx.push(gCanvas[maxLayer].getContext('2d'));

    gCanvas[maxLayer].addEventListener('mousedown', onMouseDown, false);
    gCanvas[maxLayer].addEventListener('mousemove', onMouseMove, false);
    gCanvas[maxLayer].addEventListener('mouseup', onMouseUp, false);

    updataLayerButton();
}

function deleteLayer() {
    if (maxLayer > 0) {
        document.getElementById("layerButton_" + maxLayer).remove();
        document.getElementById("canvas_" + maxLayer).remove();
        maxLayer -= 1;
        gCanvas.pop();
        gCtx.pop();
    }
    if (selectLayer >= maxLayer) selectLayer = maxLayer;

    updataLayerButton();
}

function mergeButton() {
    if (selectLayer > 0) {
        if (window.confirm('本当に下のレイヤーと結合しますか？')) {
            gCtx[selectLayer - 1].drawImage(gCanvas[selectLayer], 0, 0);
            clearCanvas();
        }
    }
}

function setSelectLayer(num) {
    selectLayer = num;
    footerUpdate();
    updataLayerButton();
}

function updataLayerButton() {
    for (let i = 0; i <= maxLayer; i++) {
        if (i === selectLayer) {
            document.getElementById("layerButton_" + i).style.backgroundColor = "lightgray";
            document.getElementById("layerButton_" + i).style.color = "gray";
        } else {
            document.getElementById("layerButton_" + i).style.backgroundColor = "gray";
            document.getElementById("layerButton_" + i).style.color = "white";
        }
    }
}

function updataCanvasPosition() {
    let mainWidth = document.getElementById("main").clientWidth;
    let mainHeight = document.getElementById("main").clientHeight;
    let canvasWidth = document.getElementById("canvas_0").clientWidth;
    let canvasHeight = document.getElementById("canvas_0").clientHeight;

    let w = (mainWidth - canvasWidth) / 2;
    let h = (mainHeight - canvasHeight) / 2.5;
    if (h < 50) h = 50;

    document.getElementById("canvas_position").style.marginLeft = w + "px";
    document.getElementById("canvas_position").style.marginTop = h + "px";
}

function clearButton() {
    if (window.confirm('本当にこのレイヤーを初期化しますか？')) {
        clearCanvas();
    }
}

function clearCanvas() {
    if (selectLayer === 0) {
        fillRectangle(gCtx[0], 0, 0, gCanvas[0].width, gCanvas[0].height, "white");
    } else {
        gCanvas[selectLayer].width = document.getElementById('canvasWidthSize').value;
        gCanvas[selectLayer].height = document.getElementById('canvasHeightSize').value;
    }
}

function allClearButton() {
    if (window.confirm('本当にすべてのレイヤーを初期化しますか？')) {
        allClearCanvas();
    }
}

function allClearCanvas() {
    for (let i = 0; i <= maxLayer; i++) {
        gCanvas[i].width = document.getElementById('canvasWidthSize').value;
        gCanvas[i].height = document.getElementById('canvasHeightSize').value;
    }
    fillRectangle(gCtx[0], 0, 0, gCanvas[0].width, gCanvas[0].height, "white");
    undoCanvas.data = [];
    undoCanvas.number = [];
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
        fillCircle(brushCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), s / 2, toRGB(nowColor));
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

function refreshFillCanvas() {
    fillRectangle(fillCtx, 0, 0, fillCanvas.width, fillCanvas.height, toRGB(nowColor));
}

function saveCanvas() {
    if (undoCanvas.data.length >= UNDO_STACK) {
        undoCanvas.data.pop();
        undoCanvas.number.pop();
    }
    undoCanvas.data.unshift(gCtx[selectLayer].getImageData(0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height));
    undoCanvas.number.unshift(selectLayer);
}

function undo() {
    if (undoCanvas.data.length > 0) {
        let data = undoCanvas.data.shift();
        let num = undoCanvas.number.shift();

        if (num <= maxLayer) {
            gCtx[num].putImageData(data, 0, 0);
        }
    }
}