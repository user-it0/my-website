let audioContext;
let micStream;
let mediaStreamSource;
let gainNode;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const gainSlider = document.getElementById('gainSlider');
const gainValue = document.getElementById('gainValue');

// マイク入力開始
startButton.addEventListener('click', async () => {
  try {
    // AudioContextを作成
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // マイクへのアクセス要求
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // マイクストリームからAudioNodeを作成
    mediaStreamSource = audioContext.createMediaStreamSource(micStream);
    
    // ゲインノードで増幅
    gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat(gainSlider.value);
    
    // マイクの音声→ゲイン→出力（既定のオーディオ出力へ接続）
    mediaStreamSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    startButton.disabled = true;
    stopButton.disabled = false;
    
  } catch (error) {
    console.error('マイクへのアクセスに失敗しました:', error);
    alert('マイクにアクセスできませんでした。設定や許可を確認してください。');
  }
});

// マイク入力停止
stopButton.addEventListener('click', () => {
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  startButton.disabled = false;
  stopButton.disabled = true;
});

// ゲインスライダーの調整
gainSlider.addEventListener('input', () => {
  const gainVal = parseFloat(gainSlider.value);
  if (gainNode) {
    gainNode.gain.value = gainVal;
  }
  gainValue.textContent = gainVal;
});