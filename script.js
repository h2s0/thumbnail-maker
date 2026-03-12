const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const textInput = document.getElementById('textInput');
const overlayRange = document.getElementById('overlayRange');

let currentImg = null;
let currentFont = 'KkuBulLim';
let currentColor = 'black';
let currentBorder = false;
let currentOverlay = 0;  // 이름 통일

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.display = 'block';
    currentImg = img;
    draw();
  }
});

textInput.addEventListener('input', draw);

overlayRange.addEventListener('input', () => {
  currentOverlay = overlayRange.value  // 이름 통일
  draw()
})

function getWrappedLines(ctx, text, maxWidth) {
  const lines = []
  const paragraphs = text.split('\n')  // 엔터로 단락 나누기

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
    const fontSize = Math.floor(canvas.width * 0.13)
    const lineHeight = fontSize

    ctx.font = `bold ${fontSize}px ${currentFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const padding = 40
    const maxWidth = canvas.width - padding * 2
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

document.querySelectorAll('.font-container button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.font-container button').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentFont = btn.dataset.font
    draw()
  })
})

document.querySelectorAll('.color-container button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-container button').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentColor = btn.dataset.color
    draw()
  })
})

document.getElementById('borderToggle').addEventListener('click', (e) => {
  currentBorder = !currentBorder
  e.target.textContent = currentBorder ? '테두리 ON' : '테두리 OFF'
  e.target.classList.toggle('active', currentBorder)
  draw()
})

overlayRange.addEventListener('input', () => {
  currentOverlay = overlayRange.value
  document.getElementById('overlayValue').textContent = overlayRange.value
  draw()
})

document.querySelector('button[type="button"]:last-of-type').addEventListener('click', () => {
  const link = document.createElement('a')
  link.download = 'thumbnail.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
})

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!currentImg) {
    alert('이미지를 먼저 업로드해주세요!')
    return
  }
  const link = document.createElement('a')
  link.download = 'thumbnail.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
})