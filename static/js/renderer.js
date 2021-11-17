const CanvasRenderer = (() => {
    let ctx, width, height
    let texturesSources = ['house', 'storage', 'house_g']
    let loadedTextures = {}
    setup = (canvas, callback) => {
        ctx = canvas.getContext('2d')
        const positionInfo = canvas.getBoundingClientRect()
        width = positionInfo.width
        height = positionInfo.height
        loadTextures(callback)
    }
    loadTextures = (callback) => {
        texturesSources.forEach(t => {
            let img = new Image()
            img.id = t
            img.src = 'img/' + img.id + '.png'
            img.onload = (self) => {
                loadedTextures[self.target.id] = self.target
                if (texturesSources.length == Object.keys(loadedTextures).length) {
                    callback()
                }
            }
        })
    }
    clear = () => {
        ctx.clearRect(0, 0, width, height)
    }
    return {
        init: (canvas, callback) => {
            setup(canvas, callback)
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            // ctx.save();
            // ctx.font = '200px Arial';
            // ctx.translate(width/2, height/2+50);
            // //ctx.rotate(0.55);
            // ctx.textAlign = "center";
            // ctx.fillText("543", 0, 0);
            // ctx.restore();
        },
        drawBuilding: ([x, y, _], texture) => {
            img = loadedTextures[texture];
            ctx.drawImage(img, x-15, y-20, 30, 30);
        },
        drawNode: ([x, y, radius], color, outline=false) => {
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
            ctx.fillStyle = 'rgba('+color.join(',')+')' 
            if (!outline) ctx.fill()
            ctx.strokeStyle = 'rgba('+color.join(',')+')' 
            ctx.stroke()
        },
        drawHub: ([x, y, rx, ry]) => {
            let ellipse = new Path2D();
            ellipse.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#999';
            ctx.stroke(ellipse);
            ellipse = new Path2D();
            ellipse.ellipse(x, y, 3, 2, 0, 0, 2 * Math.PI);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#999';
            ctx.stroke(ellipse);            
        },
        drawLines: (linePoints) => {
            ctx.shadowColor = 'rgba(0,100,0,0.5)' 
            ctx.beginPath();
            ctx.moveTo(linePoints[0].x1, linePoints[0].y1);
            linePoints.forEach(line => {
                ctx.lineTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
            })
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba('+[100, 150, 50, 0.7].join(',')+')' ;
            ctx.stroke();
            ctx.shadowColor = 'rgba(0,0,0,0.0)' 
        },
        clear: () => { 
            clear()
        },
    }
})();