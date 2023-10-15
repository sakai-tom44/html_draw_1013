function drawPoint(ctx, x, y, color = "black") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1)
}

function drawPenDown(ctx) {
    ctx.beginPath();
}

function drawPenLine(ctx, x, y, color = "black", width = 1, cap = "round") {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = cap;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawPenUp(ctx) {
    ctx.closePath();
}

function drawBrushLine(ctx, x1, y1, x2, y2, color = "black", width = 1) {
    let s = 5 * width / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 5;
    s = Math.min(s, width)
    ctx.strokeStyle = color;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function eraserDown(ctx) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-out';
}

function eraserLine(ctx, x, y, width = 1) {
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
}

function eraserUp(ctx){
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
}

function drawLine(ctx, x1, y1, x2, y2, color = "black", width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function drawRectangle(ctx, x, y, w, h, color = "black", lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();
}

function fillRectangle(ctx, x, y, w, h, color = "black") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx, cx, cy, radius, color = "black", lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.stroke();
}

function fillCircle(ctx, cx, cy, radius, color = "black") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPolygon(ctx, points, color = "black", lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawMeshPattern(ctx, w, h) {
    fillRectangle(ctx, 0, 0, w, h, "white");
    for (let i = 0; i * 16 < w; i++) {
        for (let j = 0; j * 8 < h; j++) {
            fillRectangle(ctx, i * 16 + 8 * (1 - j % 2), j * 8, 8, 8, "lightgray");
        }
    }
}