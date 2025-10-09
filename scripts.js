const videoElement = document.getElementById('video')
const canvasElement = document.getElementById('output')
const drawCanvas = document.getElementById('drawCanvas')
const ctx = canvasElement.getContext('2d')
const drawCtx = drawCanvas.getContext('2d')
const clearBtn = document.getElementById('clearBtn')
const ColorSelector = document.getElementById('color')
const eraseBtn = document.getElementById('eraseBtn')

function ColorOption() {
    drawCtx.strokeStyle = ColorSelector.value
}
let eraseMode = false

eraseBtn.addEventListener('click', () => {
    eraseMode = !eraseMode
    drawCtx.globalCompositeOperation = 'destination-out'
    drawCtx.lineWidth = 30

    eraseBtn.textContent = eraseMode ? 'Draw Mode' : 'Erase Mode'
})

let previousPosition = null

const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
})

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
})

hands.onResults(onResults)

function onResults(results) {
    ctx.save()
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    ctx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    )

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]

        for (const point of landmarks) {
            const x = point.x * canvasElement.width
            const y = point.y * canvasElement.height
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, 2 * Math.PI)
            ctx.fillStyle = 'cyan'
            ctx.fill()
        }

        const indexTip = landmarks[8]
        const x = indexTip.x * drawCanvas.width
        const y = indexTip.y * drawCanvas.height

        if (previousPosition) {
            drawCtx.beginPath()
            drawCtx.moveTo(previousPosition.x, previousPosition.y)
            drawCtx.lineTo(x, y)
            drawCtx.strokeStyle = eraseMode ? '#000000' : ColorSelector.value
            drawCtx.lineWidth = eraseMode ? 20 : 4
            if (eraseMode) {

            } else {
                drawCtx.globalCompositeOperation = 'source-over'
                drawCtx.strokeStyle = ColorSelector.value
                drawCtx.lineWidth = 4
            }

            drawCtx.stroke()
        }

        previousPosition = { x, y }
    } else {
        previousPosition = null
    }
    ctx.restore()
}

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement })
    },
    width: 640,
    height: 480,
})

camera.start()
clearBtn.addEventListener('click', () => {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
    console.log('Drawing cleared')
})
