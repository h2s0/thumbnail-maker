const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const textInput = document.getElementById('textInput');
const overlayRange = document.getElementById('overlayRange');
const overlayValue = document.getElementById('overlayValue');
const borderToggle = document.getElementById('borderToggle');
const downloadBtn = document.getElementById('downloadBtn');
const squareToggle = document.getElementById('squareToggle');
const cropToggle = document.getElementById('cropToggle');
const squareOverlay = document.getElementById('squareOverlay');
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const fontBtns = document.querySelectorAll('.font-container button');
const colorBtns = document.querySelectorAll('.color-container button');
const fontSizeMinus = document.getElementById('fontSizeMinus');
const fontSizePlus = document.getElementById('fontSizePlus');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');

let currentImg = null;
let currentFont = 'KkuBulLim';
let currentColor = 'black';
let currentBorder = false;
let currentOverlay = 0;
let fontSizeStep = 0; // 1step = 비율 0.01 (≈10px @ 1080p)
let squareOverlayVisible = false;
let cropMode = false;
let currentTextPosV = 'center';
let currentTextPosH = 'center';
let currentRotation = 0;
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDraggingImage = false;
let dragStartPoint = null;
let dragStartOffset = null;
let hasDraggedImage = false;
let suppressFilePicker = false;

function trackEvent(name, data = {}) {
  if (typeof window.va === 'function') {
    window.va('event', { name, data });
  }
}

canvasWrapper.addEventListener('click', () => {
  if (suppressFilePicker) {
    suppressFilePicker = false;
    return;
  }

  if (cropMode && currentImg) return;

  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    currentRotation = 0;
    currentImg = img;
    resetImageOffset();
    updateCanvasSize();
    canvas.style.display = 'block';
    imagePlaceholder.style.display = 'none';
    canvasWrapper.classList.add('has-image');
    downloadBtn.disabled = false;
    cropToggle.disabled = false;
    rotateLeftBtn.disabled = false;
    rotateRightBtn.disabled = false;
    draw();
    updateSquareOverlay();
    trackEvent('Image Uploaded', {
      fileType: file.type || 'unknown',
      imageWidth: img.width,
      imageHeight: img.height,
    });
  }
});

textInput.addEventListener('input', draw);

overlayRange.addEventListener('input', () => {
  currentOverlay = overlayRange.value
  overlayValue.textContent = overlayRange.value
  draw()
})

fontBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    fontBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentFont = btn.dataset.font
    draw()
    trackEvent('Font Changed', { font: currentFont });
  })
})

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentColor = btn.dataset.color
    draw()
    trackEvent('Text Color Changed', { color: currentColor });
  })
})

fontSizeMinus.addEventListener('click', () => {
  if (fontSizeStep > -5) {
    fontSizeStep--;
    updateFontSizeDisplay();
    draw();
    trackEvent('Font Size Changed', { step: fontSizeStep });
  }
});

fontSizePlus.addEventListener('click', () => {
  if (fontSizeStep < 5) {
    fontSizeStep++;
    updateFontSizeDisplay();
    draw();
    trackEvent('Font Size Changed', { step: fontSizeStep });
  }
});

function updateFontSizeDisplay() {
  if (fontSizeStep === 0) fontSizeDisplay.textContent = '0';
  else if (fontSizeStep > 0) fontSizeDisplay.textContent = `+${fontSizeStep}`;
  else fontSizeDisplay.textContent = `${fontSizeStep}`;
}

squareToggle.addEventListener('click', (e) => {
  squareOverlayVisible = !squareOverlayVisible;
  e.target.classList.toggle('active', squareOverlayVisible);
  updateSquareOverlay();
  trackEvent('Square Preview Toggled', { enabled: squareOverlayVisible });
});

cropToggle.addEventListener('click', (e) => {
  cropMode = !cropMode;
  e.target.classList.toggle('active', cropMode);
  canvasWrapper.classList.toggle('crop-active', cropMode);
  constrainImageOffset();
  draw();
  updateSquareOverlay();
  trackEvent('Square Crop Toggled', { enabled: cropMode });
});

function rotateImage(direction) {
  if (!currentImg) return;

  currentRotation = (currentRotation + direction + 360) % 360;
  resetImageOffset();
  draw();
  updateSquareOverlay();
  trackEvent('Image Rotated', { rotation: currentRotation });
}

rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
rotateRightBtn.addEventListener('click', () => rotateImage(90));

canvasWrapper.addEventListener('pointerdown', (e) => {
  if (!currentImg || !cropMode) return;

  isDraggingImage = true;
  dragStartPoint = getCanvasPoint(e);
  dragStartOffset = { x: imageOffsetX, y: imageOffsetY };
  hasDraggedImage = false;
  canvasWrapper.classList.add('dragging');
  canvasWrapper.setPointerCapture(e.pointerId);
  e.preventDefault();
});

canvasWrapper.addEventListener('pointermove', (e) => {
  if (!isDraggingImage || !dragStartPoint || !dragStartOffset) return;

  const point = getCanvasPoint(e);
  const nextOffsetX = dragStartOffset.x + point.x - dragStartPoint.x;
  const nextOffsetY = dragStartOffset.y + point.y - dragStartPoint.y;

  setImageOffset(nextOffsetX, nextOffsetY);

  if (Math.abs(point.x - dragStartPoint.x) > 2 || Math.abs(point.y - dragStartPoint.y) > 2) {
    hasDraggedImage = true;
    suppressFilePicker = true;
  }

  e.preventDefault();
});

function stopImageDrag(e) {
  if (!isDraggingImage) return;

  isDraggingImage = false;
  dragStartPoint = null;
  dragStartOffset = null;
  canvasWrapper.classList.remove('dragging');

  if (canvasWrapper.hasPointerCapture(e.pointerId)) {
    canvasWrapper.releasePointerCapture(e.pointerId);
  }

  if (hasDraggedImage) {
    trackEvent('Crop Image Repositioned', {
      offsetX: Math.round(imageOffsetX),
      offsetY: Math.round(imageOffsetY),
    });
  } else {
    fileInput.click();
  }
}

canvasWrapper.addEventListener('pointerup', stopImageDrag);
canvasWrapper.addEventListener('pointercancel', stopImageDrag);

const posGridBtns = document.querySelectorAll('.pos-grid-picker button');
posGridBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    posGridBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTextPosV = btn.dataset.posv;
    currentTextPosH = btn.dataset.posh;
    draw();
    trackEvent('Text Position Changed', {
      vertical: currentTextPosV,
      horizontal: currentTextPosH,
    });
  });
});

borderToggle.addEventListener('click', (e) => {
  currentBorder = !currentBorder
  e.target.textContent = currentBorder ? '테두리 ON' : '테두리 OFF'
  e.target.classList.toggle('active', currentBorder)
  draw()
  trackEvent('Text Border Toggled', { enabled: currentBorder });
})

downloadBtn.disabled = true
cropToggle.disabled = true
rotateLeftBtn.disabled = true
rotateRightBtn.disabled = true

downloadBtn.addEventListener('click', async () => {
  const fileName = `${textInput.value || 'thumbnail'}_썸네일.jpg`;
  const exportCanvas = getExportCanvas();
  const blob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/jpeg', 0.95));

  if (!blob) return;

  saveBlob(fileName, blob);

  trackEvent('Thumbnail Downloaded', {
    hasText: Boolean(textInput.value.trim()),
    font: currentFont,
    color: currentColor,
    border: currentBorder,
    overlay: Number(currentOverlay),
    fontSizeStep,
    textPosition: `${currentTextPosV}-${currentTextPosH}`,
    squarePreview: squareOverlayVisible,
    squareCrop: cropMode,
    imageOffsetX: Math.round(imageOffsetX),
    imageOffsetY: Math.round(imageOffsetY),
  });
})

function saveBlob(fileName, blob) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = URL.createObjectURL(blob)
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

function getWrappedLines(ctx, text, maxWidth) {
  const lines = []
  const paragraphs = text.split('\n')

  paragraphs.forEach(paragraph => {
    if (paragraph === '') {
      lines.push('')
      return
    }
    const words = paragraph.split(' ')
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word
      const testWidth = ctx.measureText(testLine).width

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }

      if (ctx.measureText(currentLine).width > maxWidth) {
        let charLine = ''
        for (const char of currentLine) {
          const testCharLine = charLine + char
          if (ctx.measureText(testCharLine).width > maxWidth && charLine) {
            lines.push(charLine)
            charLine = char
          } else {
            charLine = testCharLine
          }
        }
        currentLine = charLine
      }
    })
    lines.push(currentLine)
  })

  return lines
}

function updateSquareOverlay() {
  if ((!squareOverlayVisible && !cropMode) || !currentImg) {
    squareOverlay.classList.remove('visible');
    return;
  }
  const canvasRect = canvas.getBoundingClientRect();
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const displayW = canvasRect.width;
  const displayH = canvasRect.height;
  const squareSize = Math.min(displayW, displayH);
  const offsetX = canvasRect.left - wrapperRect.left + (displayW - squareSize) / 2;
  const offsetY = canvasRect.top - wrapperRect.top + (displayH - squareSize) / 2;
  squareOverlay.style.width = squareSize + 'px';
  squareOverlay.style.height = squareSize + 'px';
  squareOverlay.style.left = offsetX + 'px';
  squareOverlay.style.top = offsetY + 'px';
  squareOverlay.classList.add('visible');
}

window.addEventListener('resize', updateSquareOverlay);

function resetImageOffset() {
  imageOffsetX = 0;
  imageOffsetY = 0;
}

function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function getMaxImageOffset() {
  const squareSize = Math.min(canvas.width, canvas.height);

  return {
    x: (canvas.width - squareSize) / 2,
    y: (canvas.height - squareSize) / 2,
  };
}

function setImageOffset(nextOffsetX, nextOffsetY) {
  const maxOffset = getMaxImageOffset();
  imageOffsetX = Math.max(-maxOffset.x, Math.min(maxOffset.x, nextOffsetX));
  imageOffsetY = Math.max(-maxOffset.y, Math.min(maxOffset.y, nextOffsetY));
  draw();
  updateSquareOverlay();
}

function constrainImageOffset() {
  setImageOffset(imageOffsetX, imageOffsetY);
}

function getExportCanvas() {
  if (!cropMode) return canvas;

  const squareSize = Math.min(canvas.width, canvas.height);
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  const sourceX = (canvas.width - squareSize) / 2;
  const sourceY = (canvas.height - squareSize) / 2;

  cropCanvas.width = squareSize;
  cropCanvas.height = squareSize;
  cropCtx.drawImage(canvas, sourceX, sourceY, squareSize, squareSize, 0, 0, squareSize, squareSize);

  return cropCanvas;
}

function updateCanvasSize() {
  if (!currentImg) return;

  const isSideways = currentRotation % 180 !== 0;
  const nextWidth = isSideways ? currentImg.height : currentImg.width;
  const nextHeight = isSideways ? currentImg.width : currentImg.height;

  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;
}

function drawRotatedImage(ctx) {
  const offsetX = cropMode ? imageOffsetX : 0;
  const offsetY = cropMode ? imageOffsetY : 0;

  ctx.save();
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate(currentRotation * Math.PI / 180);
  ctx.drawImage(currentImg, -currentImg.width / 2, -currentImg.height / 2);
  ctx.restore();
}

function draw() {
  if (!currentImg) return;

  updateCanvasSize();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRotatedImage(ctx);

  // 오버레이
  ctx.fillStyle = `rgba(0, 0, 0, ${currentOverlay / 100})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 텍스트
  const text = textInput.value;
  if (text) {
    const shortSide = Math.min(canvas.width, canvas.height)
    const fontSize = Math.floor(shortSide * (0.13 + fontSizeStep * 0.01))
    const lineHeight = fontSize

    ctx.textBaseline = 'middle';
    const maxWidth = shortSide * 0.8
    ctx.font = `bold ${fontSize}px ${currentFont}`;
    const lines = getWrappedLines(ctx, text, maxWidth)
    const totalHeight = lines.length * lineHeight

    // 정사각형 영역 기준으로 위치 계산
    const sqSize = shortSide
    const sqLeft = (canvas.width - sqSize) / 2
    const sqTop = (canvas.height - sqSize) / 2
    const pad = sqSize * 0.1

    let startY;
    if (currentTextPosV === 'top') startY = sqTop + pad;
    else if (currentTextPosV === 'bottom') startY = sqTop + sqSize - totalHeight - pad;
    else startY = sqTop + (sqSize - totalHeight) / 2;

    let drawX;
    if (currentTextPosH === 'left') { drawX = sqLeft + pad; ctx.textAlign = 'left'; }
    else if (currentTextPosH === 'right') { drawX = sqLeft + sqSize - pad; ctx.textAlign = 'right'; }
    else { drawX = sqLeft + sqSize / 2; ctx.textAlign = 'center'; }

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight + lineHeight / 2

      if (currentBorder) {
        ctx.strokeStyle = currentColor === 'white' ? 'black' : 'white'
        ctx.lineWidth = 4
        ctx.strokeText(line, drawX, y)
      }

      ctx.fillStyle = currentColor
      ctx.fillText(line, drawX, y)
    })
  }
}
