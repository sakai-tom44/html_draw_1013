let gCanvas;
let gCtx;
let pCanvas;
let pCtx;
let hslCanvas;
let hslCtx;
let penCanvas;
let penCtx;
let mousePoint = null;
let isDraw = false;

let nowPenSize = 1;
let nowColor = "black";
let nowHsl_H = 0;
let nowHsl_S = 0;
let nowHsl_L = 0;

function clickHsl(e) {
    nowHsl_H = 360*e.offsetX/200;
    refreshHslCanvas();
    refreshPallet();
    setHslColor();
    refreshPenCanvas();
}

function clickPallet(e) {
    nowHsl_S = 100*e.offsetX/200;
    nowHsl_L = 100-(100*e.offsetY/200);
    refreshPallet();
    setHslColor();
    refreshPenCanvas();
}

function onMouseDown(e) {
    isDraw = true;
    mousePoint = [e.offsetX, e.offsetY];
}

function onMouseMove(e) {
    if (isDraw) {
        drawLine(gCtx, mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, nowColor, nowPenSize);
        mousePoint = [e.offsetX, e.offsetY];
    }
}

function onMouseUp(e) {
    drawLine(gCtx, mousePoint[0], mousePoint[1], e.offsetX, e.offsetY, nowColor, nowPenSize);
    isDraw = false;
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
    setCanvasSize();
    refreshPallet()
    clearCanvas();
    refreshHslCanvas();
    setHslColor();
    setPenSizeSlider();
    gCanvas.addEventListener('mousedown', onMouseDown, false);
    gCanvas.addEventListener('mousemove', onMouseMove, false);
    gCanvas.addEventListener('mouseup', onMouseUp, false);
    pCanvas.addEventListener('click', clickPallet, false);
    hslCanvas.addEventListener('click', clickHsl, false);
}

function setCanvasSize(){
    gCanvas.width = document.getElementById('canvasWidthSize').value;
    gCanvas.height = document.getElementById('canvasHeightSize').value;
    clearCanvas();
}

function setPenSize(w) {
    nowPenSize = w;
}

function setPenSizeSlider(){
    nowPenSize = document.getElementById('penSizeSlider').value;
    document.getElementById("penSizeValue").innerHTML = nowPenSize + "px";
    refreshPenCanvas();
}

function setHslColor(){
    nowColor = "hsl(" + nowHsl_H + ", "+ nowHsl_S +"%, "+ nowHsl_L +"%)";
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
    drawRectangle(pCtx, nowHsl_S*2, ((100-nowHsl_L)*2), 4, 4, "hsl(" + (180+nowHsl_H)%360 + ", 100%, 50%)", 1);
}

function refreshHslCanvas() {
    fillRectangle(hslCtx, 0, 0, hslCanvas.width, hslCanvas.height, "white");
    for (let i = 0; i < 200; i++) {
        drawLine(hslCtx, i, 0, i, 20, "hsl(" + 360*i/200 + ", 100%, 50%)");
    }
    drawLine(hslCtx, 200*nowHsl_H/360, 0, 200*nowHsl_H/360, 20, "black");
}

function refreshPenCanvas() {
    fillRectangle(penCtx, 0, 0, penCanvas.width, penCanvas.height, "white");
    for(let i = 0; i*16 < penCanvas.width; i++){
        for(let j = 0; j*8 < penCanvas.height; j++){
            fillRectangle(penCtx, i*16+8*(1-j%2), j*8, 8, 8, "lightgray");
        }
    }
    for(let i = 0; i < penCanvas.width - 60; i++){
        let h = penCanvas.height;
        let w = penCanvas.width-60;
        drawLine(penCtx, i+30, (h/2 + Math.sin(i*2*Math.PI/(w))*h/6), i+30+1, (h/2 +(Math.sin((i+1)*2*Math.PI/(w)))*h/6), nowColor, nowPenSize);
    }
}