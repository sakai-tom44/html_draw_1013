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
let mousePoint = null;
let isDraw = false;
let selectMode = "PEN";

let nowDrawSize = 1;
let nowColor = "black";
let nowHsl_H = 0;
let nowHsl_S = 0;
let nowHsl_L = 0;

function setSelectMode(mode = "PEN") {
    selectMode = mode;

    document.getElementById('pen').style.backgroundColor = "gray";
    document.getElementById('pen').style.color = "lightgray";
    document.getElementById('eraser').style.backgroundColor = "gray";
    document.getElementById('eraser').style.color = "lightgray";
    if (selectMode === "PEN") {
        document.getElementById('pen').style.backgroundColor = "lightgray";
        document.getElementById('pen').style.color = "black";
    }
    if (selectMode === "ERASER") {
        document.getElementById('eraser').style.backgroundColor = "lightgray";
        document.getElementById('eraser').style.color = "black";
    }
}

function clickHsl(e) {
    nowHsl_H = 360 * e.offsetX / 200;
    refreshHslCanvas();
    refreshPallet();
    setHslColor();
    refreshPenCanvas();
}

function clickPallet(e) {
    nowHsl_S = 100 * e.offsetX / 200;
    nowHsl_L = 100 - (100 * e.offsetY / 200);
    refreshPallet();
    setHslColor();
    refreshPenCanvas();
}

function onMouseDown(e) {
    if (!isDraw) {
        isDraw = true;
        drawPenDown(gCtx);
    }
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseMove(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx, e.offsetX, e.offsetY, nowColor, nowDrawSize);
        if (selectMode === "ERASER") drawPenLine(gCtx, e.offsetX, e.offsetY, "white", nowDrawSize);
    }
}

function onMouseUp(e) {
    if (isDraw) {
        if (selectMode === "PEN") drawPenLine(gCtx, e.offsetX, e.offsetY, nowColor, nowDrawSize);
        if (selectMode === "ERASER") drawPenLine(gCtx, e.offsetX, e.offsetY, "white", nowDrawSize);
        isDraw = false;
        drawPenUp(gCtx)
    }
    mousePoint = null;
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
    eraserCanvas = document.getElementById('eraser_canvas');
    eraserCtx = eraserCanvas.getContext('2d');
    setCanvasSize();
    setSelectMode();
    refreshPallet()
    clearCanvas();
    refreshHslCanvas();
    setHslColor();
    setDrawSizeSlider();
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
    refreshEraserCanvas();
}

function setHslColor() {
    nowColor = "hsl(" + nowHsl_H + ", " + nowHsl_S + "%, " + nowHsl_L + "%)";
    document.getElementById("hslValue_H").innerHTML = "H:" + nowHsl_H;
    document.getElementById("hslValue_S").innerHTML = "S:" + nowHsl_S;
    document.getElementById("hslValue_L").innerHTML = "L:" + nowHsl_L;

    let tmp = document.getElementById("irohyouji");
    let st = tmp.style;
    st.backgroundColor = nowColor;
}

function setAnyColor() {
    console.log("Anyが呼ばれた");
    let clsentaku = document.getElementById("irosentaku");
    nowColor = clsentaku.value;
    let tmp = document.getElementById("irohyouji");
    let st = tmp.style;
    st.backgroundColor = clsentaku.value;
}

function setColor(c) {
    nowColor = c;
    let tmp = document.getElementById("irohyouji");
    let st = tmp.style;
    st.backgroundColor = c;
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
    drawRectangle(pCtx, nowHsl_S * 2, ((100 - nowHsl_L) * 2), 4, 4, "hsl(" + (180 + nowHsl_H) % 360 + ", 100%, 50%)", 1);
}

function refreshHslCanvas() {
    fillRectangle(hslCtx, 0, 0, hslCanvas.width, hslCanvas.height, "white");
    for (let i = 0; i < 200; i++) {
        drawLine(hslCtx, i, 0, i, 20, "hsl(" + 360 * i / 200 + ", 100%, 50%)");
    }
    drawLine(hslCtx, 200 * nowHsl_H / 360, 0, 200 * nowHsl_H / 360, 20, "black");
}

function refreshPenCanvas() {
    drawMeshPattern(penCtx, penCanvas.width, penCanvas.height);
    drawPenDown(penCtx);
    for (let i = 0; i < penCanvas.width - 60; i++) {
        let h = penCanvas.height;
        let w = penCanvas.width - 60;
        drawPenLine(penCtx, i + 30, (h / 2 + Math.sin(i * 2 * Math.PI / (w)) * h / 6), nowColor, nowDrawSize);
    }
    drawPenUp(penCtx);
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