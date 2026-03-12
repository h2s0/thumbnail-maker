const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const textInput = document.getElementById('textInput');

// 전역 변수로 이미지 저장
let currentImg = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.display = 'block';

    // 전역 변수에 저장
    currentImg = img;

    // 이미지 로딩 끝나면 draw 호출
    draw();
  }
});

textInput.addEventListener('input', draw);

function draw() {
  // 이미지 없으면 실행 안함
  if (!currentImg) return;

  const ctx = canvas.getContext('2d');

  // 1. 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. 이미지
  ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);

  // 3. 텍스트
  const text = textInput.value;
  if (text) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }
}