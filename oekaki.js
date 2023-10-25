let topCanvas;
let topCtx;
let backCanvas;
let backCtx;
let gCanvas = [];
let gCtx = [];
let pCanvas;
let pCtx;
let hslCanvas;
let hslCtx;
let previewCanvas;
let previewCtx;
let penCanvas;
let penCtx;
let waterCanvas;
let waterCtx;
let eraserCanvas;
let eraserCtx;
let brushCanvas;
let brushCtx;
let sprayCanvas;
let sprayCtx;
let sharpCanvas;
let sharpCtx;
let fillCanvas;
let fillCtx;
let copyCanvas;
let copyCtx;
let mousePoint = null;
let isDraw = false;
let selectMode = "PEN";
let selectLayer = 0;
let maxLayer = -1;
let maxColorMemory = 0;
let importButton;

let nowDrawSize = 1;
let nowColor = [0, 0, 0];
let nowHsl_H = 0;
let nowHsl_S = 0;
let nowHsl_L = 0;
let fillThreshold = 5;

let mouseDownPoint = [];
let mouseLastPoint = [];
let clickPoint = [[]];

const UNDO_STACK = 10;
let undoCanvas = { data: [], number: [] };
let redoCanvas = { data: [], number: [] };

let copyData = null;

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
    topCanvas = document.getElementById('top_canvas');
    topCtx = topCanvas.getContext('2d');
    backCanvas = document.getElementById('back_canvas');
    backCtx = backCanvas.getContext('2d');
    pCanvas = document.getElementById('pallet_canvas');
    pCtx = pCanvas.getContext('2d');
    hslCanvas = document.getElementById('hsl_canvas');
    hslCtx = hslCanvas.getContext('2d');
    previewCanvas = document.getElementById('preview_canvas');
    previewCtx = previewCanvas.getContext('2d');
    penCanvas = document.getElementById('pen_canvas');
    penCtx = penCanvas.getContext('2d');
    waterCanvas = document.getElementById('water_canvas');
    waterCtx = waterCanvas.getContext('2d');
    brushCanvas = document.getElementById('brush_canvas');
    brushCtx = brushCanvas.getContext('2d');
    sprayCanvas = document.getElementById('spray_canvas');
    sprayCtx = sprayCanvas.getContext('2d');
    sharpCanvas = document.getElementById('sharp_canvas');
    sharpCtx = sharpCanvas.getContext('2d');
    fillCanvas = document.getElementById('fill_canvas');
    fillCtx = fillCanvas.getContext('2d');
    eraserCanvas = document.getElementById('eraser_canvas');
    eraserCtx = eraserCanvas.getContext('2d');
    copyCanvas = document.getElementById('copy_canvas');
    copyCtx = copyCanvas.getContext('2d');
    for (let i = 0; i < 3; i++) addLayer();
    footerUpdate();
    setCanvasSize();
    setSelectMode();
    refreshPallet()
    clearCanvas();
    refreshHslCanvas();
    refreshCopyCanvas();
    setHslColor();
    setDrawSizeSlider();
    clearColorMemory()
    updataLayerButton();
    updateTopCanvas();
    topCanvas.addEventListener('mousedown', onMouseDown, false);
    topCanvas.addEventListener('mousemove', onMouseMove, false);
    topCanvas.addEventListener('mouseup', onMouseUp, false);
    pCanvas.addEventListener('click', clickPallet, false);
    hslCanvas.addEventListener('click', clickHsl, false);

    importButton = document.getElementById('import');

    refreshPenCanvas();
    refreshWaterCanvas();
    refreshBrushCanvas();
    refreshSprayCanvas();
    refreshSharpCanvas();
    refreshEraserCanvas();
    refreshFillCanvas();
}

function setSelectMode(mode = "PEN") {

    hideB = "gray";
    hideC = "white";
    selectB = "lightgray";
    selectC = "black";

    mouseDownPoint = null;
    mouseLastPoint = null;
    clickPoint = [];
    selectMode = mode;
    footerUpdate();
    document.getElementById('pen').style.backgroundColor = hideB;
    document.getElementById('pen').style.color = hideC;
    document.getElementById('water').style.backgroundColor = hideB;
    document.getElementById('water').style.color = hideC;
    document.getElementById('brush').style.backgroundColor = hideB;
    document.getElementById('brush').style.color = hideC;
    document.getElementById('spray').style.backgroundColor = hideB;
    document.getElementById('spray').style.color = hideC;
    document.getElementById('line').style.backgroundColor = hideB;
    document.getElementById('line').style.color = hideC;
    document.getElementById('rect').style.backgroundColor = hideB;
    document.getElementById('rect').style.color = hideC;
    document.getElementById('circle').style.backgroundColor = hideB;
    document.getElementById('circle').style.color = hideC;
    document.getElementById('tryangle').style.backgroundColor = hideB;
    document.getElementById('tryangle').style.color = hideC;
    document.getElementById('eraser').style.backgroundColor = hideB;
    document.getElementById('eraser').style.color = hideC;
    document.getElementById('fill').style.backgroundColor = hideB;
    document.getElementById('fill').style.color = hideC;
    document.getElementById('eyedropper').style.backgroundColor = hideB;
    document.getElementById('eyedropper').style.color = hideC;
    document.getElementById('copy').style.backgroundColor = hideB;
    document.getElementById('copy').style.color = hideC;
    document.getElementById('paste').style.backgroundColor = hideB;
    document.getElementById('paste').style.color = hideC;

    if (selectMode === "PEN") {
        document.getElementById('pen').style.backgroundColor = selectB;
        document.getElementById('pen').style.color = selectC;
    } else if (selectMode === "WATER") {
        document.getElementById('water').style.backgroundColor = selectB;
        document.getElementById('water').style.color = selectC;
    } else if (selectMode === "BRUSH") {
        document.getElementById('brush').style.backgroundColor = selectB;
        document.getElementById('brush').style.color = selectC;
    } else if (selectMode === "SPRAY") {
        document.getElementById('spray').style.backgroundColor = selectB;
        document.getElementById('spray').style.color = selectC;
    } else if (selectMode === "LINE") {
        document.getElementById('line').style.backgroundColor = selectB;
        document.getElementById('line').style.color = selectC;
    } else if (selectMode === "RECT") {
        document.getElementById('rect').style.backgroundColor = selectB;
        document.getElementById('rect').style.color = selectC;
    } else if (selectMode === "CIRCLE") {
        document.getElementById('circle').style.backgroundColor = selectB;
        document.getElementById('circle').style.color = selectC;
    } else if (selectMode === "TRYANGLE") {
        document.getElementById('tryangle').style.backgroundColor = selectB;
        document.getElementById('tryangle').style.color = selectC;
    } else if (selectMode === "ERASER") {
        document.getElementById('eraser').style.backgroundColor = selectB;
        document.getElementById('eraser').style.color = selectC;
    } else if (selectMode === "FILL") {
        document.getElementById('fill').style.backgroundColor = selectB;
        document.getElementById('fill').style.color = selectC;
    } else if (selectMode === "EYEDROPPER") {
        document.getElementById('eyedropper').style.backgroundColor = selectB;
        document.getElementById('eyedropper').style.color = selectC;
    } else if (selectMode === "COPY") {
        document.getElementById('copy').style.backgroundColor = selectB;
        document.getElementById('copy').style.color = selectC;
    } else if (selectMode === "PASET") {
        document.getElementById('paste').style.backgroundColor = selectB;
        document.getElementById('paste').style.color = selectC;
    }

    updateTopCanvas();
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
        if (selectMode === "PEN" || selectMode === "WATER") drawPenDown(gCtx[selectLayer]);
        if (selectMode === "ERASER") eraserDown(gCtx[selectLayer]);
    }
    if (selectMode === "EYEDROPPER") eyedropperTool(e.offsetX, e.offsetY);
    if (selectMode === "FILL") fillTool(e.offsetX, e.offsetY);
    if (selectMode === "PASTE") pasetCopyData();
    if (selectMode === "TRYANGLE") {
        clickPoint.push([e.offsetX, e.offsetY]);
        if (clickPoint.length > 2) {
            drawPolygon(gCtx[selectLayer], clickPoint, toRGB(nowColor), nowDrawSize);
            clickPoint = [];
        }
    }
    mousePoint = [e.offsetX, e.offsetY];
    mouseDownPoint = [e.offsetX, e.offsetY];
    mouseLastPoint = null;
    updateTopCanvas();
    footerUpdate();
}

function onMouseMove(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "WATER") drawPenLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGBA(nowColor), nowDrawSize);
        if (selectMode === "BRUSH") drawBrushLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "SPRAY") drawSpray(gCtx[selectLayer], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "ERASER") eraserLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, nowDrawSize);
        mouseLastPoint = [e.offsetX, e.offsetY];
    }
    mousePoint = [e.offsetX, e.offsetY];
    updateTopCanvas();
    footerUpdate();
}

function onMouseUp(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "WATER") drawPenLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, toRGBA(nowColor), nowDrawSize);
        if (selectMode === "ERASER") eraserLine(gCtx[selectLayer], mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, nowDrawSize);
        isDraw = false;
        if (selectMode === "PEN") drawPenUp(gCtx[selectLayer])
        if (selectMode === "ERASER") eraserUp(gCtx[selectLayer]);
        if (selectMode === "COPY") setCopyData();
        if (selectMode === "LINE") drawLine(gCtx[selectLayer], mouseDownPoint[0], mouseDownPoint[1], e.offsetX, e.offsetY, toRGB(nowColor), nowDrawSize);
        if (selectMode === "RECT") drawRectangle(gCtx[selectLayer], mouseDownPoint[0], mouseDownPoint[1], e.offsetX - mouseDownPoint[0], e.offsetY - mouseDownPoint[1], toRGB(nowColor), nowDrawSize);
        if (selectMode === "CIRCLE") drawCircle(gCtx[selectLayer], mouseDownPoint[0], mouseDownPoint[1], Math.sqrt((e.offsetX - mouseDownPoint[0]) ** 2 + (e.offsetY - mouseDownPoint[1]) ** 2), toRGB(nowColor), nowDrawSize);
    }
    mouseLastPoint = [e.offsetX, e.offsetY];
    updateTopCanvas();
    footerUpdate();
}

function setCopyData() {
    copyData = gCtx[selectLayer].getImageData(mouseDownPoint[0], mouseDownPoint[1], mouseLastPoint[0] - mouseDownPoint[0], mouseLastPoint[1] - mouseDownPoint[1]);
    refreshCopyCanvas();
}

function pasetCopyData() {
    if (copyData != null) {
        let x = mousePoint[0] - (copyData.width / 2);
        let y = mousePoint[1] - (copyData.height / 2);
        gCtx[selectLayer].putImageData(copyData, x, y);
    }
}

function updateTopCanvas() {
    topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height);
    if (mousePoint != null) {
        if (selectMode == "ERASER" || selectMode == "SPRAY") {
            drawCircle(topCtx, mousePoint[0], mousePoint[1], nowDrawSize / 2, "red", 1);
        } else {
            fillRectangle(topCtx, mousePoint[0] - 4, mousePoint[1], 9, 1, "red");
            fillRectangle(topCtx, mousePoint[0], mousePoint[1] - 4, 1, 9, "red");
        }

        if (selectMode == "COPY" && mouseDownPoint != null && mouseLastPoint != null) {
            drawRectangle(topCtx, mouseDownPoint[0], mouseDownPoint[1], mouseLastPoint[0] - mouseDownPoint[0], mouseLastPoint[1] - mouseDownPoint[1], "red", 1);
        }
        if (selectMode == "PASTE" && copyData != null) {
            let x = mousePoint[0] - (copyData.width / 2);
            let y = mousePoint[1] - (copyData.height / 2);
            topCtx.putImageData(copyData, x, y);
            drawRectangle(topCtx, x, y, copyData.width, copyData.height, "blue", 1);
        }
        if (selectMode == "LINE" && mouseDownPoint != null && mouseLastPoint != null && isDraw) {
            drawLine(topCtx, mouseDownPoint[0], mouseDownPoint[1], mouseLastPoint[0], mouseLastPoint[1], "red", 1);
        }
        if (selectMode == "RECT" && mouseDownPoint != null && mouseLastPoint != null && isDraw) {
            drawRectangle(topCtx, mouseDownPoint[0], mouseDownPoint[1], mouseLastPoint[0] - mouseDownPoint[0], mouseLastPoint[1] - mouseDownPoint[1], "red", 1);
        }
        if (selectMode == "CIRCLE" && mouseDownPoint != null && mouseLastPoint != null && isDraw) {
            drawCircle(topCtx, mouseDownPoint[0], mouseDownPoint[1], Math.sqrt((mouseLastPoint[0] - mouseDownPoint[0]) ** 2 + (mouseLastPoint[1] - mouseDownPoint[1]) ** 2), "red", 1);
        }
        if (selectMode == "TRYANGLE" && clickPoint.length > 0) {
            let points = [[]];
            for (let i = 0; i < clickPoint.length; i++) {
                points.push([clickPoint[i][0], clickPoint[i][1]]);
            }
            points.push([mousePoint[0], mousePoint[1]])
            drawPolygon(topCtx, points, "red", 1);
        }
    }
}

function footerUpdate() {
    document.getElementById('selectModeText').innerHTML = "selectMode : " + selectMode;
    document.getElementById('rgbText').innerHTML = "R : " + nowColor[0] + " / G : " + nowColor[1] + " / B : " + nowColor[2];
    document.getElementById('selectLayerText').innerHTML = "selectLayer : " + selectLayer;
    document.getElementById('undoRedoText').innerHTML = "undo : " + undoCanvas.data.length + " / redo : " + redoCanvas.data.length;
}

function toRGB(c) {
    return ("rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")");
}

function toRGBA(c) {
    return ("rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", 0.02)");
}

function fillTool(x, y) {
    let w = gCanvas[selectLayer].width;
    let h = gCanvas[selectLayer].height;
    let data = gCtx[selectLayer].getImageData(0, 0, w, h);

    let getRGB = function (x, y) {
        let r = data.data[(y * w + x) * 4];
        let g = data.data[(y * w + x) * 4 + 1];
        let b = data.data[(y * w + x) * 4 + 2];
        let a = data.data[(y * w + x) * 4 + 3];
        return [r, g, b, a];
    }
    let setRGB = function (x, y, rgb, a = 255) {
        data.data[(y * w + x) * 4] = rgb[0];
        data.data[(y * w + x) * 4 + 1] = rgb[1];
        data.data[(y * w + x) * 4 + 2] = rgb[2];
        data.data[(y * w + x) * 4 + 3] = a;
    }

    let targetColor = gCtx[selectLayer].getImageData(x, y, 1, 1).data;
    let buffer = [];
    buffer.push([x, y]);
    while (buffer.length > 0) {
        let pos = buffer.pop();
        if (pos[0] < 0 || pos[0] >= w || pos[1] < 0 || pos[1] >= h) continue;
        let posColor = getRGB(pos[0], pos[1]);
        if (colorMatch(nowColor, posColor)) continue;
        if (!colorMatch(targetColor, posColor)) continue;
        setRGB(pos[0], pos[1], nowColor);
        buffer.push([pos[0] - 1, pos[1]]);
        buffer.push([pos[0], pos[1] - 1]);
        buffer.push([pos[0], pos[1] + 1]);
        buffer.push([pos[0] + 1, pos[1]]);
    }
    gCtx[selectLayer].putImageData(data, 0, 0);
}

function colorMatch(c1, c2) {
    for (let i = 0; i < 3; i++) {
        if (c1[i] <= c2[i] - fillThreshold || c1[i] >= c2[i] + fillThreshold) return false;
    }
    if (c1[3] <= c2[3] - 50 || c1[3] >= c2[3] + 50 || c1.length < 4) return false;
    return true;
}

function eyedropperTool(x, y) {
    let rgb = getCanvasColor(gCtx[selectLayer], x, y);
    if (rgb[3] > 0) {
        setColor(rgb[0], rgb[1], rgb[2]);
    }
}

function getCanvasColor(ctx, x, y) {
    let rgb = ctx.getImageData(x, y, 1, 1).data;
    let r = Math.floor(rgb[0]);
    let g = Math.floor(rgb[1]);
    let b = Math.floor(rgb[2]);
    let a = Math.floor(rgb[3]);
    return [r, g, b, a];
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
    h = Math.floor(h * 10) / 10;
    s = Math.floor(s * 100) / 100;
    l = Math.floor(l * 100) / 100;
    return [h, s, l];
}

function setCanvasSize() {
    let w = document.getElementById('canvasWidthSize').value;
    let h = document.getElementById('canvasHeightSize').value;
    backCanvas.width = w;
    backCanvas.height = h;
    topCanvas.width = w;
    topCanvas.height = h;
    for (let i = 0; i <= maxLayer; i++) {
        gCanvas[i].width = w;
        gCanvas[i].height = h;
    }
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
    refreshPreviewCanvas();
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
    refreshPreviewCanvas();
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

function setColor(r, g, b) {
    nowColor = [r, g, b];
    let hsl = rgbToHsl(nowColor);
    nowHsl_H = hsl[0];
    nowHsl_S = hsl[1];
    nowHsl_L = hsl[2];
    updataColor();
}

function addColorMemory() {
    maxColorMemory++;
    let btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("id", "colorMemory_" + maxColorMemory);
    btn.setAttribute("style", "background-color: rgb(" + nowColor[0] + ", " + nowColor[1] + ", " + nowColor[2] + ")");
    btn.setAttribute("onclick", "setColor(" + nowColor[0] + "," + nowColor[1] + "," + nowColor[2] + ")");
    document.getElementById("memorySlot").appendChild(btn);
}

function deleteColorMemory() {
    if (maxColorMemory >= 0) {
        document.getElementById("colorMemory_" + maxColorMemory).remove();
        maxColorMemory--;
    }
}

function clearColorMemory() {
    let templateColor = [[0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0], [0, 0, 255]];
    maxColorMemory = -1;
    let str = "";
    for (let i = 0; i < templateColor.length; i++) {
        maxColorMemory++;
        str += '<input type="button"';
        str += ' id="colorMemory_' + maxColorMemory + '" ';
        str += ' style="background-color: rgb(' + templateColor[i][0] + ', ' + templateColor[i][1] + ', ' + templateColor[i][2] + ');"';
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
    let canvasWidth = document.getElementById("back_canvas").clientWidth;
    let canvasHeight = document.getElementById("back_canvas").clientHeight;

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
    gCtx[selectLayer].clearRect(0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height);
}

function allClearButton() {
    if (window.confirm('本当にすべてのレイヤーを初期化しますか？')) {
        allClearCanvas();
    }
}

function allClearCanvas() {
    for (let i = 0; i <= maxLayer; i++) {
        gCtx[i].clearRect(0, 0, gCanvas[i].width, gCanvas[i].height)
    }
    fillRectangle(backCtx, 0, 0, backCanvas.width, backCanvas.height, "white");
    undoCanvas.data = [];
    undoCanvas.number = [];
    redoCanvas.data = [];
    redoCanvas.number = [];
}

function refreshPallet() {
    let data = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height);
    for (let i = 0; i < 200; i++) {
        for (let j = 0; j < 200; j++) {
            let h = nowHsl_H;
            let s = 100 * (j / 200);
            let l = (100 - 100 * (i / 200));
            let rgb = hslToRgb(h, s, l);
            data.data[(i * 200 + j) * 4] = rgb[0];
            data.data[(i * 200 + j) * 4 + 1] = rgb[1];
            data.data[(i * 200 + j) * 4 + 2] = rgb[2];
            data.data[(i * 200 + j) * 4 + 3] = 255;
        }
    }
    pCtx.putImageData(data, 0, 0);
    drawRectangle(pCtx, nowHsl_S * 2 - 3, ((100 - nowHsl_L) * 2) - 3, 6, 6, "black", 1);
    drawRectangle(pCtx, nowHsl_S * 2 - 2, ((100 - nowHsl_L) * 2) - 2, 4, 4, "white", 1);
}

function refreshHslCanvas() {
    let data = hslCtx.getImageData(0, 0, hslCanvas.width, hslCanvas.height);
    fillRectangle(hslCtx, 0, 0, hslCanvas.width, hslCanvas.height, "white");
    for (let i = 0; i < hslCanvas.height; i++) {
        for (let j = 0; j < 200; j++) {
            let h = 360 * j / 200;
            let rgb = hslToRgb(h, 100, 50);
            data.data[(i * 200 + j) * 4] = rgb[0];
            data.data[(i * 200 + j) * 4 + 1] = rgb[1];
            data.data[(i * 200 + j) * 4 + 2] = rgb[2];
            data.data[(i * 200 + j) * 4 + 3] = 255;
        }
    }
    hslCtx.putImageData(data, 0, 0);
    drawLine(hslCtx, 200 * nowHsl_H / 360 - 1, 0, 200 * nowHsl_H / 360 - 1, 20, "black");
    drawLine(hslCtx, 200 * nowHsl_H / 360 + 0, 0, 200 * nowHsl_H / 360 + 0, 20, "white");
    drawLine(hslCtx, 200 * nowHsl_H / 360 + 1, 0, 200 * nowHsl_H / 360 + 1, 20, "black");
}

function refreshPreviewCanvas() {
    drawMeshPattern(previewCtx, previewCanvas.width, previewCanvas.height);
    drawPenDown(previewCtx);
    drawPenLine(previewCtx, previewCanvas.width/2, previewCanvas.height/2, previewCanvas.width/2, previewCanvas.height/2, toRGB(nowColor), nowDrawSize);
    drawPenUp(previewCtx);
}

function refreshPenCanvas() {
    drawMeshPattern(penCtx, penCanvas.width, penCanvas.height);
    drawPenDown(penCtx);
    for (let i = 0; i < penCanvas.width - 60; i++) {
        let h = penCanvas.height;
        let w = penCanvas.width - 60;
        drawPenLine(penCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), (i + 1) + 30, (h / 2 + Math.sin((i + 1) * 2 * Math.PI / (w)) * h / 6), toRGB(nowColor), nowDrawSize);
    }
    drawPenUp(penCtx);
}

function refreshWaterCanvas() {
    drawMeshPattern(waterCtx, waterCanvas.width, waterCanvas.height);
    drawPenDown(waterCtx);
    for (let i = 0; i < waterCanvas.width - 60; i++) {
        let h = waterCanvas.height;
        let w = waterCanvas.width - 60;
        drawPenLine(waterCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), (i + 1) + 30, (h / 2 + Math.sin((i + 1) * 2 * Math.PI / (w)) * h / 6), toRGBA(nowColor), nowDrawSize);
    }
    drawPenUp(waterCtx);
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

function refreshSprayCanvas() {
    drawMeshPattern(sprayCtx, sprayCanvas.width, sprayCanvas.height);
    for (let i = 0; i < sprayCanvas.width - 60; i+=2) {
        let h = sprayCanvas.height;
        let w = sprayCanvas.width - 60;
        drawSpray(sprayCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), toRGB(nowColor), nowDrawSize);
    }
}

function refreshSharpCanvas() {
    drawMeshPattern(sharpCtx, sharpCanvas.width, sharpCanvas.height);
    drawLine(sharpCtx, 20, sharpCanvas.height / 2, sharpCanvas.width - 20, sharpCanvas.height / 2, toRGB(nowColor), nowDrawSize);
}

function refreshEraserCanvas() {
    eraserCtx.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
    drawPenDown(eraserCtx);
    for (let i = 0; i < eraserCanvas.width - 60; i++) {
        let h = eraserCanvas.height;
        let w = eraserCanvas.width - 60;
        drawPenLine(eraserCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), (i + 1) + 30, (h / 2 + Math.sin((i + 1) * 2 * Math.PI / (w)) * h / 6), 'white', nowDrawSize);
    }
    drawPenUp(eraserCtx);
    drawRectangle(eraserCtx, 1, 1, eraserCanvas.width-2, eraserCanvas.height-2, "gray", 2)
}

function refreshFillCanvas() {
    drawRectangle(fillCtx, 1, 1, fillCanvas.width-2, fillCanvas.height-2, "gray", 2)
}

function refreshCopyCanvas() {
    //drawMeshPattern(copyCtx, copyCanvas.width, copyCanvas.height);
    copyCtx.clearRect(0, 0, copyCanvas.width, copyCanvas.height);

    if (copyData != null) {
        copyCtx.putImageData(copyData, 0, 0);
    }

    drawRectangle(copyCtx, 1, 1, copyCanvas.width - 2, copyCanvas.height - 2, "gray", 2)
}

function saveCanvas() {
    redoCanvas.data = [];
    redoCanvas.number = [];
    if (undoCanvas.data.length >= UNDO_STACK) {
        undoCanvas.data.pop();
        undoCanvas.number.pop();
    }
    undoCanvas.data.unshift(gCtx[selectLayer].getImageData(0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height));
    undoCanvas.number.unshift(selectLayer);
}

function undo() {
    if (undoCanvas.data.length > 0) {
        redoCanvas.data.unshift(gCtx[selectLayer].getImageData(0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height));
        redoCanvas.number.unshift(selectLayer);

        let data = undoCanvas.data.shift();
        let num = undoCanvas.number.shift();

        if (num <= maxLayer) {
            gCtx[num].putImageData(data, 0, 0);
        }
    }
    footerUpdate();
}

function redo() {
    if (redoCanvas.data.length > 0) {
        undoCanvas.data.unshift(gCtx[selectLayer].getImageData(0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height));
        undoCanvas.number.unshift(selectLayer);

        let data = redoCanvas.data.shift();
        let num = redoCanvas.number.shift();

        if (num <= maxLayer) {
            gCtx[num].putImageData(data, 0, 0);
        }
    }
    footerUpdate();
}

function exportImage() {
    for (let i = 0; i < gCanvas.length; i++) {
        backCtx.drawImage(gCanvas[i], 0, 0);
    }

    let a = document.createElement("a");
    a.href = backCanvas.toDataURL("image/jpeg", 1);
    fillRectangle(backCtx, 0, 0, backCanvas.width, backCanvas.height, "white");
    a.download = "download.jpg";
    a.click();
}

let importCount = 0;
function importImage() {
    importCount++;
    importButton.addEventListener("change", function (e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let image = new Image();
            image.src = reader.result;
            gCtx[selectLayer].drawImage(image, 0, 0, gCanvas[selectLayer].width, gCanvas[selectLayer].height);
        }
    }, false);
    if (importCount <= 1) importImage();
    importCount = 0;
}