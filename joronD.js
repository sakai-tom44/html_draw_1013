function drawPoint(ctx, x, y, color = "black"){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1)
}

function drawLine(ctx, x1, y1, x2, y2, color = "black", width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function drawRectangle(ctx, x, y, w, h, color = "black", lineWidth = 1){
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x+w, y);
    ctx.lineTo(x+w, y+h);
    ctx.lineTo(x, y+h);
    ctx.closePath();
    ctx.stroke();
}

function fillRectangle(ctx, x, y, w, h, color = "black"){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx, cx, cy, radius, color = "black", lineWidth = 1){
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0 , Math.PI * 2, true);
    ctx.stroke();
}

function fillCircle(ctx, cx, cy, radius, color = "black"){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPolygon(ctx, points, color = "black", lineWidth = 1){
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for(let i = 1; i < points.length; i++){
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
}