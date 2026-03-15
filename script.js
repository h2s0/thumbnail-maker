const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const textInput = document.getElementById('textInput');
const overlayRange = document.getElementById('overlayRange');
const overlayValue = document.getElementById('overlayValue');
const borderToggle = document.getElementById('borderToggle');
const downloadBtn = document.getElementById('downloadBtn');
const fontBtns = document.querySelectorAll('.font-container button');
const colorBtns = document.querySelectorAll('.color-container button');

let currentImg = null;
let currentFont = 'KkuBulLim';
let currentColor = 'black';
let currentBorder = false;
let currentOverlay = 0;

canvasWrapper.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.display = 'block';
    imagePlaceholder.style.display = 'none';
    canvasWrapper.classList.add('has-image');
    currentImg = img;
    downloadBtn.disabled = false;
    draw();
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
  })
})

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentColor = btn.dataset.color
    draw()
  })
})

borderToggle.addEventListener('click', (e) => {
  currentBorder = !currentBorder
  e.target.textContent = currentBorder ? '테두리 ON' : '테두리 OFF'
  e.target.classList.toggle('active', currentBorder)
  draw()
})

downloadBtn.disabled = true

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a')
  link.download = 'thumbnail.jpg'
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
})

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

function draw() {
  if (!currentImg) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);

  // 오버레이
  ctx.fillStyle = `rgba(0, 0, 0, ${currentOverlay / 100})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 텍스트
  const text = textInput.value;
  if (text) {
    const shortSide = Math.min(canvas.width, canvas.height)
    const fontSize = Math.floor(shortSide * 0.17)
    const lineHeight = fontSize

    ctx.font = `bold ${fontSize}px ${currentFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxWidth = shortSide * 0.8
    const lines = getWrappedLines(ctx, text, maxWidth)

    const totalHeight = lines.length * lineHeight
    const startY = (canvas.height - totalHeight) / 2

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight + lineHeight / 2

      if (currentBorder) {
        ctx.strokeStyle = currentColor === 'white' ? 'black' : 'white'
        ctx.lineWidth = 4
        ctx.strokeText(line, canvas.width / 2, y)
      }

      ctx.fillStyle = currentColor
      ctx.fillText(line, canvas.width / 2, y)
    })
  }
}
