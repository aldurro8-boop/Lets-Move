// ==================== MESIN KAMERA AI (14 GERAKAN + GESTUR 5 JARI) ====================
let holisticModel = null;
let cameraInstance = null;
let isCameraActive = false;

// Status Sesi Latihan
let sessionConfig = {
  primaryEx: null,
  secondaryEx: null,
  activeEx: null,
  setType: 'Normal Set',
  restSeconds: 60,
  isSupersetPhase2: false
};

let repCounter = 0;
let motionStage = 'READY';
let holdTimerSeconds = 0;
let lastFrameTimestamp = null;
let lastRepTimestamp = 0;

// Realtime Stopwatch HH:MM:SS
let sessionElapsedSeconds = 0;
let sessionClockInterval = null;
let isSessionClockRunning = false;

// Status Rest Timer & Gestur 5 Jari
let isResting = false;
let restRemaining = 0;
let restInterval = null;
let fiveFingerHoldTime = 0;
let gestureCooldown = 0;

function speakVoice(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'id-ID';
    msg.rate = 1.12;
    window.speechSynthesis.speak(msg);
  }
}

function calcAngle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs(rad * 180.0 / Math.PI);
  if (deg > 180.0) deg = 360.0 - deg;
  return Math.round(deg);
}

function getVisibleSide(lm, leftIndices, rightIndices) {
  const lScore = leftIndices.reduce((acc, idx) => acc + (lm[idx]?.visibility || 0), 0) / leftIndices.length;
  const rScore = rightIndices.reduce((acc, idx) => acc + (lm[idx]?.visibility || 0), 0) / rightIndices.length;
  if (lScore < 0.45 && rScore < 0.45) return null;
  return lScore >= rScore ? leftIndices.map(i => lm[i]) : rightIndices.map(i => lm[i]);
}

function isFiveFingersOpen(handLandmarks) {
  if (!handLandmarks || handLandmarks.length < 21) return false;
  const indexOpen = handLandmarks[8].y < handLandmarks[6].y;
  const middleOpen = handLandmarks[12].y < handLandmarks[10].y;
  const ringOpen = handLandmarks[16].y < handLandmarks[14].y;
  const pinkyOpen = handLandmarks[20].y < handLandmarks[18].y;
  const thumbSpread = Math.abs(handLandmarks[4].x - handLandmarks[17].x) > Math.abs(handLandmarks[3].x - handLandmarks[17].x);
  return indexOpen && middleOpen && ringOpen && pinkyOpen && thumbSpread;
}

function formatHHMMSS(totalSec) {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return [hrs, mins, secs].map(v => String(v).padStart(2, '0')).join(':');
}

function resetSessionClock() {
  sessionElapsedSeconds = 0;
  isSessionClockRunning = false;
  clearInterval(sessionClockInterval);
  const clockEl = document.getElementById('camSessionClock');
  if (clockEl) clockEl.innerText = '00:00:00';
}

function triggerSessionClock() {
  if (isSessionClockRunning) return;
  isSessionClockRunning = true;
  clearInterval(sessionClockInterval);
  sessionClockInterval = setInterval(() => {
    if (isCameraActive) { // Tetap berjalan walaupun isResting = true
      sessionElapsedSeconds++;
      const clockEl = document.getElementById('camSessionClock');
      if (clockEl) clockEl.innerText = formatHHMMSS(sessionElapsedSeconds);
    }
  }, 1000);
}

// Mulai Sesi Kamera AI
async function startAICameraSession(primaryEx, setType, restSeconds, secondaryEx = null) {
  sessionConfig = {
    primaryEx,
    secondaryEx,
    activeEx: primaryEx,
    setType,
    restSeconds: parseInt(restSeconds) || 60,
    isSupersetPhase2: false
  };

  repCounter = 0;
  motionStage = 'READY';
  holdTimerSeconds = 0;
  isResting = false;
  fiveFingerHoldTime = 0;
  gestureCooldown = 0;
  lastRepTimestamp = 0;
  lastFrameTimestamp = performance.now();

  document.getElementById('cameraModal').classList.remove('hidden');
  updateCameraHUDLabels();
  resetSessionClock();

  const videoEl = document.getElementById('aiVideo');
  const statusEl = document.getElementById('aiLoadingOverlay');
  statusEl.classList.remove('hidden');
  statusEl.innerText = 'Menyiapkan Kamera & Model AI...';

  if (!holisticModel) {
    holisticModel = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });
    holisticModel.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holisticModel.onResults(onHolisticResults);
  }

  isCameraActive = true;
  cameraInstance = new Camera(videoEl, {
    onFrame: async () => {
      if (isCameraActive && holisticModel) {
        await holisticModel.send({ image: videoEl });
      }
    },
    facingMode: 'user',
    width: 640,
    height: 480
  });

  await cameraInstance.start();
  statusEl.classList.add('hidden');
  speakVoice(`Mulai ${primaryEx.name}`);
}

function updateCameraHUDLabels() {
  const ex = sessionConfig.activeEx;
  document.getElementById('camExName').innerText = ex.name;
  document.getElementById('camSetBadge').innerText = sessionConfig.isSupersetPhase2
    ? `SUPERSET • GERAKAN 2`
    : sessionConfig.setType.toUpperCase();

  const unitLabel = ex.mode === 'timer' ? 'DETIK' : 'REPETISI';
  document.getElementById('camUnitLabel').innerText = unitLabel;
  document.getElementById('camMainCounter').innerText = ex.mode === 'timer' ? Math.floor(holdTimerSeconds) : repCounter;
  document.getElementById('camStageStatus').innerText = 'POSISIKAN TUBUH';
  document.getElementById('camDepthFill').style.width = '0%';

  const switchBtn = document.getElementById('btnNextSuperset');
  if (sessionConfig.setType === 'Superset' && !sessionConfig.isSupersetPhase2 && sessionConfig.secondaryEx) {
    switchBtn.classList.remove('hidden');
  } else {
    switchBtn.classList.add('hidden');
  }
}

function switchToSupersetSecond() {
  if (!sessionConfig.secondaryEx) return;
  recordCurrentSetToUser();

  sessionConfig.isSupersetPhase2 = true;
  sessionConfig.activeEx = sessionConfig.secondaryEx;
  repCounter = 0;
  holdTimerSeconds = 0;
  motionStage = 'READY';
  updateCameraHUDLabels();
  speakVoice(`Lanjut tanpa istirahat, ${sessionConfig.activeEx.name}`);
}

function onHolisticResults(results) {
  if (!isCameraActive) return;

  const now = performance.now();
  const deltaSec = Math.min(0.2, (now - (lastFrameTimestamp || now)) / 1000);
  lastFrameTimestamp = now;

  if (gestureCooldown > 0) gestureCooldown -= deltaSec;

  const videoEl = document.getElementById('aiVideo');
  const canvasEl = document.getElementById('aiCanvas');
  const ctx = canvasEl.getContext('2d');

  canvasEl.width = videoEl.videoWidth || 640;
  canvasEl.height = videoEl.videoHeight || 480;

  ctx.save();
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // 1. Cek Gestur 5 Jari Terbuka
  const fiveOpen = isFiveFingersOpen(results.leftHandLandmarks) || isFiveFingersOpen(results.rightHandLandmarks);
  const gestureRingBox = document.getElementById('gestureHoldIndicator');
  const gestureFill = document.getElementById('gestureHoldFill');

  if (fiveOpen && gestureCooldown <= 0) {
    fiveFingerHoldTime += deltaSec;
    gestureRingBox.classList.remove('hidden');
    const pct = Math.min(100, Math.round((fiveFingerHoldTime / 1.5) * 100));
    gestureFill.style.width = `${pct}%`;

    if (fiveFingerHoldTime >= 1.5) {
      fiveFingerHoldTime = 0;
      gestureCooldown = 2.5;
      gestureRingBox.classList.add('hidden');
      toggleRestTimerByGesture();
    }
  } else {
    fiveFingerHoldTime = Math.max(0, fiveFingerHoldTime - deltaSec * 2);
    if (fiveFingerHoldTime === 0) gestureRingBox.classList.add('hidden');
  }

  if (results.leftHandLandmarks) {
    drawLandmarks(ctx, results.leftHandLandmarks, { color: '#94bf4e', radius: 3 });
  }
  if (results.rightHandLandmarks) {
    drawLandmarks(ctx, results.rightHandLandmarks, { color: '#94bf4e', radius: 3 });
  }

  if (isResting) {
    ctx.restore();
    return;
  }

  if (results.poseLandmarks) {
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#94bf4e', lineWidth: 3 });
    drawLandmarks(ctx, results.poseLandmarks, { color: '#166b0e', lineWidth: 2, radius: 4 });
    processExerciseLogic(results.poseLandmarks, deltaSec);
  }

  ctx.restore();
}

// ==================== LOGIKA DETEKSI 14 GERAKAN ====================
function processExerciseLogic(lm, deltaSec) {
  const exId = sessionConfig.activeEx.id;
  const stageEl = document.getElementById('camStageStatus');
  const angleEl = document.getElementById('camMetricVal');
  const depthBar = document.getElementById('camDepthFill');

  // A. SUDUT SIKU (Push-Up, Pike Push-Up, Bench Dips)
  if (exId === 'pushup' || exId === 'pikepushup' || exId === 'benchdips') {
    const pts = getVisibleSide(lm, [11, 13, 15], [12, 14, 16]);
    if (!pts) return setOutOfFrame();

    const elbowAngle = calcAngle(pts[0], pts[1], pts[2]);
    angleEl.innerText = `${elbowAngle}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((160 - elbowAngle) / 70) * 100))}%`;

    if (elbowAngle <= 92) {
      motionStage = 'DOWN';
      stageEl.innerText = 'BAWAH (DORONG!)';
      stageEl.style.color = '#94bf4e';
    }
    if (elbowAngle >= 158 && motionStage === 'DOWN') {
      motionStage = 'UP';
      addRepetition();
    }
  }

  // B. PULL-UP & CHIN-UP
  else if (exId === 'pullup' || exId === 'chinup') {
    const nose = lm[0];
    const lWrist = lm[15], rWrist = lm[16];
    const lElbow = lm[13], lShoulder = lm[11];

    if (nose.visibility < 0.5 || (lWrist.visibility < 0.4 && rWrist.visibility < 0.4)) {
      return setOutOfFrame();
    }

    const avgWristY = (lWrist.y + rWrist.y) / 2;
    const elbowAngle = calcAngle(lShoulder, lElbow, lWrist);
    angleEl.innerText = `${elbowAngle}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, (1 - (nose.y - avgWristY + 0.15) / 0.3) * 100))}%`;

    if (nose.y <= avgWristY + 0.02 && elbowAngle <= 95) {
      motionStage = 'TOP_BAR';
      stageEl.innerText = 'PUNCAK PALANG!';
      stageEl.style.color = '#94bf4e';
    }
    if (elbowAngle >= 152 && nose.y > avgWristY + 0.12 && motionStage === 'TOP_BAR') {
      motionStage = 'HANG';
      addRepetition();
    }
  }

  // C. LATERAL RAISE
  else if (exId === 'lateralraise') {
    const lArm = calcAngle(lm[23], lm[11], lm[15]);
    const rArm = calcAngle(lm[24], lm[12], lm[16]);
    if (lm[15].visibility < 0.4 && lm[16].visibility < 0.4) return setOutOfFrame();

    const avgArm = Math.round((lArm + rArm) / 2);
    angleEl.innerText = `${avgArm}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((avgArm - 15) / 70) * 100))}%`;

    if (avgArm >= 80 && avgArm <= 115) {
      motionStage = 'RAISED';
      stageEl.innerText = 'SEJAJAR BAHU!';
      stageEl.style.color = '#94bf4e';
    }
    if (avgArm <= 30 && motionStage === 'RAISED') {
      motionStage = 'DOWN';
      addRepetition();
    }
  }

  // D. SQUAT
  else if (exId === 'squat') {
    const pts = getVisibleSide(lm, [23, 25, 27], [24, 26, 28]);
    if (!pts) return setOutOfFrame();

    const kneeAngle = calcAngle(pts[0], pts[1], pts[2]);
    angleEl.innerText = `${kneeAngle}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((170 - kneeAngle) / 75) * 100))}%`;

    if (kneeAngle <= 95) {
      motionStage = 'DOWN';
      stageEl.innerText = 'BAWAH (NAIK!)';
      stageEl.style.color = '#94bf4e';
    }
    if (kneeAngle >= 162 && motionStage === 'DOWN') {
      motionStage = 'UP';
      addRepetition();
    }
  }

  // E. LUNGES (Anti-Dobel: Pantau Sudut Lutut Terkecil + Wajib Kembali Berdiri Tegak)
  else if (exId === 'lunges') {
    const lVis = (lm[23].visibility + lm[25].visibility + lm[27].visibility) / 3;
    const rVis = (lm[24].visibility + lm[26].visibility + lm[28].visibility) / 3;
    if (lVis < 0.45 && rVis < 0.45) return setOutOfFrame();

    const lKnee = lVis >= 0.45 ? calcAngle(lm[23], lm[25], lm[27]) : 180;
    const rKnee = rVis >= 0.45 ? calcAngle(lm[24], lm[26], lm[28]) : 180;

    // Ambil lutut yang sedang menekuk paling dalam, dan pastikan kedua kaki lurus saat kembali berdiri
    const activeKnee = Math.min(lKnee, rKnee);
    const bothStanding = lKnee >= 162 && rKnee >= 162;

    angleEl.innerText = `${activeKnee}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((165 - activeKnee) / 68) * 100))}%`;

    if (activeKnee <= 98 && motionStage !== 'LUNGE_DOWN') {
      motionStage = 'LUNGE_DOWN';
      stageEl.innerText = 'TURUN (KEMBALI TEGAK!)';
      stageEl.style.color = '#94bf4e';
    } else if (bothStanding && motionStage === 'LUNGE_DOWN') {
      motionStage = 'STAND_UP';
      addRepetition();
    }
  }

  // F. SIT-UP
  else if (exId === 'situp') {
    const pts = getVisibleSide(lm, [11, 23, 25], [12, 24, 26]);
    if (!pts) return setOutOfFrame();

    const hipAngle = calcAngle(pts[0], pts[1], pts[2]);
    angleEl.innerText = `${hipAngle}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((130 - hipAngle) / 70) * 100))}%`;

    if (hipAngle <= 65) {
      motionStage = 'CRUNCH';
      stageEl.innerText = 'PUNCAK (TURUN!)';
      stageEl.style.color = '#94bf4e';
    }
    if (hipAngle >= 122 && motionStage === 'CRUNCH') {
      motionStage = 'FLAT';
      addRepetition();
    }
  }

  // G. MOUNTAIN CLIMBERS
  else if (exId === 'mountainclimbers') {
    if (lm[25].visibility < 0.4 && lm[26].visibility < 0.4) return setOutOfFrame();
    const lKnee = calcAngle(lm[23], lm[25], lm[27]);
    const rKnee = calcAngle(lm[24], lm[26], lm[28]);
    const minKnee = Math.min(lKnee, rKnee);

    angleEl.innerText = `${minKnee}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((160 - minKnee) / 80) * 100))}%`;

    if (lKnee <= 85 && motionStage !== 'LEFT_IN') {
      motionStage = 'LEFT_IN';
      stageEl.innerText = 'LUTUT KIRI!';
      stageEl.style.color = '#94bf4e';
      addRepetition();
    } else if (rKnee <= 85 && motionStage !== 'RIGHT_IN') {
      motionStage = 'RIGHT_IN';
      stageEl.innerText = 'LUTUT KANAN!';
      stageEl.style.color = '#94bf4e';
      addRepetition();
    }
  }

  // H. JUMPING JACKS
  else if (exId === 'jumpingjack') {
    if (lm[15].visibility < 0.4 || lm[27].visibility < 0.4) return setOutOfFrame();
    const avgArm = Math.round((calcAngle(lm[23], lm[11], lm[15]) + calcAngle(lm[24], lm[12], lm[16])) / 2);
    const ankleDist = Math.abs(lm[27].x - lm[28].x);
    const hipWidth = Math.abs(lm[23].x - lm[24].x) || 0.1;
    const spread = ankleDist / hipWidth;

    angleEl.innerText = `${avgArm}°`;
    depthBar.style.width = `${Math.min(100, Math.max(0, ((avgArm - 20) / 130) * 100))}%`;

    if (avgArm >= 145 && spread >= 1.35) {
      motionStage = 'OPEN';
      stageEl.innerText = 'TERBUKA!';
      stageEl.style.color = '#94bf4e';
    }
    if (avgArm <= 45 && spread <= 1.2 && motionStage === 'OPEN') {
      motionStage = 'CLOSED';
      addRepetition();
    }
  }

  // I. BURPEES
  else if (exId === 'burpees') {
    const pts = getVisibleSide(lm, [11, 23, 27], [12, 24, 28]);
    if (!pts) return setOutOfFrame();

    const verticalSpan = Math.abs(pts[2].y - pts[0].y);
    angleEl.innerText = verticalSpan < 0.25 ? 'PLANK' : 'TEGAK';
    depthBar.style.width = motionStage === 'FLOOR' ? '100%' : '30%';

    if (verticalSpan < 0.25) {
      motionStage = 'FLOOR';
      stageEl.innerText = 'POSISI LANTAI (LOMPAT!)';
      stageEl.style.color = '#94bf4e';
    }
    if (verticalSpan > 0.52 && motionStage === 'FLOOR') {
      motionStage = 'STAND';
      addRepetition();
    }
  }

  // J. PLANK
  else if (exId === 'plank') {
    const pts = getVisibleSide(lm, [11, 23, 27], [12, 24, 28]);
    if (!pts) return setOutOfFrame();

    const bodyLineAngle = calcAngle(pts[0], pts[1], pts[2]);
    const isHorizontal = Math.abs(pts[0].y - pts[2].y) < 0.28;
    angleEl.innerText = `${bodyLineAngle}°`;

    if (isHorizontal && bodyLineAngle >= 150) {
      const prevSec = Math.floor(holdTimerSeconds);
      holdTimerSeconds += deltaSec;
      const currSec = Math.floor(holdTimerSeconds);

      if (currSec >= 1) {
        triggerSessionClock();
      }

      document.getElementById('camMainCounter').innerText = currSec;
      stageEl.innerText = 'TAHAN POSISI!';
      stageEl.style.color = '#94bf4e';
      depthBar.style.width = '100%';

      if (currSec > prevSec && currSec % 10 === 0) {
        speakVoice(`${currSec} detik`);
      }
    } else {
      stageEl.innerText = 'LURUSKAN PINGGUL';
      stageEl.style.color = '#fbbf24';
      depthBar.style.width = '30%';
    }
  }

  // K. DEAD HANG
  else if (exId === 'deadhang') {
    const nose = lm[0];
    const lWrist = lm[15], rWrist = lm[16];
    if (nose.visibility < 0.5 || (lWrist.visibility < 0.4 && rWrist.visibility < 0.4)) {
      return setOutOfFrame();
    }

    const handsAboveHead = lWrist.y < nose.y - 0.08 && rWrist.y < nose.y - 0.08;
    angleEl.innerText = handsAboveHead ? 'GANTUNG' : 'LEPAS';

    if (handsAboveHead) {
      const prevSec = Math.floor(holdTimerSeconds);
      holdTimerSeconds += deltaSec;
      const currSec = Math.floor(holdTimerSeconds);

      if (currSec >= 1) {
        triggerSessionClock();
      }

      document.getElementById('camMainCounter').innerText = currSec;
      stageEl.innerText = 'MENGGANTUNG AKTIF';
      stageEl.style.color = '#94bf4e';
      depthBar.style.width = '100%';

      if (currSec > prevSec && currSec % 10 === 0) {
        speakVoice(`${currSec} detik`);
      }
    } else {
      stageEl.innerText = 'PEGANG PALANG DI ATAS';
      stageEl.style.color = '#fbbf24';
      depthBar.style.width = '20%';
    }
  }
}

function addRepetition() {
  const now = performance.now();
  // Debounce 650ms mencegah pantulan sendi terhitung 2x
  if (now - lastRepTimestamp < 650) return;
  lastRepTimestamp = now;

  repCounter++;
  triggerSessionClock();

  document.getElementById('camMainCounter').innerText = repCounter;
  document.getElementById('camStageStatus').innerText = 'BAGUS!';
  speakVoice(repCounter.toString());
}

function setOutOfFrame() {
  document.getElementById('camStageStatus').innerText = 'POSISIKAN TUBUH DI LAYAR';
  document.getElementById('camStageStatus').style.color = '#f87171';
  document.getElementById('camMetricVal').innerText = '-';
}

// ==================== REST TIMER OTOMATIS VIA GESTUR 5 JARI ====================
function toggleRestTimerByGesture() {
  if (!isResting) {
    startRestTimer();
  } else {
    stopRestTimer();
  }
}

function startRestTimer() {
  isResting = true;
  restRemaining = sessionConfig.restSeconds;
  const overlay = document.getElementById('restTimerOverlay');
  const countdownEl = document.getElementById('restCountdownText');

  overlay.classList.remove('hidden');
  countdownEl.innerText = `${restRemaining}d`;
  speakVoice(`Istirahat ${restRemaining} detik`);

  clearInterval(restInterval);
  restInterval = setInterval(() => {
    restRemaining--;
    countdownEl.innerText = `${restRemaining}d`;

    if (restRemaining <= 3 && restRemaining > 0) {
      speakVoice(restRemaining.toString());
    }
    if (restRemaining <= 0) {
      stopRestTimer();
    }
  }, 1000);
}

function stopRestTimer() {
  isResting = false;
  clearInterval(restInterval);
  document.getElementById('restTimerOverlay').classList.add('hidden');
  motionStage = 'READY';
  speakVoice('Istirahat selesai, lanjut latihan');
}

// ==================== SIMPAN, BATALKAN & TUTUP SESI KAMERA ====================
function cleanupCameraResources() {
  isCameraActive = false;
  isResting = false;
  isSessionClockRunning = false;
  clearInterval(restInterval);
  clearInterval(sessionClockInterval);

  if (cameraInstance) {
    cameraInstance.stop();
  }

  document.getElementById('restTimerOverlay').classList.add('hidden');
  document.getElementById('cameraModal').classList.add('hidden');
}

function recordCurrentSetToUser() {
  const ex = sessionConfig.activeEx;
  const val = ex.mode === 'timer' ? Math.floor(holdTimerSeconds) : repCounter;
  if (val <= 0 || activeUserSlot === null) return;

  const user = slotsState[activeUserSlot].data;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Tetapkan tanggal mulai siklus 30 hari dari sesi pertama pengguna
  if (!user.cycleStartDate) {
    user.cycleStartDate = todayStr;
  }

  user.workouts.push({
    date: todayStr,
    exerciseId: ex.id,
    exerciseName: ex.name,
    category: ex.category,
    setType: sessionConfig.setType,
    mode: ex.mode,
    value: val,
    durationSec: sessionElapsedSeconds
  });
  saveSlotsToStorage();
}

// Tombol "Selesai" -> Simpan ke Grafik & Tutup
function finishCameraSession() {
  recordCurrentSetToUser();
  cleanupCameraResources();
  speakVoice('Sesi selesai');
  updateStatsAndChart();
}

// Tombol "Kembali ke Beranda" -> Batal & Tidak Ada Data Tersimpan
function cancelCameraSession() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  cleanupCameraResources();
}