// ==================== MANAJEMEN 5 PROFILE, NAVIGASI TAB & STATISTIK ====================
const STORAGE_KEY = 'letsMove_clean_v5';
const DEV_MASTER_CODE = 'MDkwOTAz'; // Verifikasi PIN Developer 6 Angka

const DEFAULT_SLOTS = [
  { index: 0, label: 'Profile 1', claimed: false, data: null },
  { index: 1, label: 'Profile 2', claimed: false, data: null },
  { index: 2, label: 'Profile 3', claimed: false, data: null },
  { index: 3, label: 'Profile 4', claimed: false, data: null },
  { index: 4, label: 'Profile 5', claimed: false, data: null }
];

let slotsState = loadSlotsFromStorage();
let activeUserSlot = null;
let currentFilter = 'all';
let selectedExerciseId = typeof EXERCISES_DATA !== 'undefined' && EXERCISES_DATA.length > 0 ? EXERCISES_DATA[0].id : 'pushup';
let thirtyDayChartInstance = null;
let consistencyRingInstance = null;
let volumeRingInstance = null;

function refreshIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function safeSetValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function loadSlotsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 5) return parsed;
    }
  } catch (e) {
    console.warn('Gagal memuat data penyimpanan:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SLOTS));
}

function saveSlotsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slotsState));
}

// ==================== 1. RENDER LAYAR PILIH PROFILE ====================
function renderAccountSlots() {
  const grid = document.getElementById('slotsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  slotsState.forEach((slot, idx) => {
    const card = document.createElement('div');
    if (slot.claimed && slot.data) {
      card.className = 'slot-card claimed';
      card.onclick = () => openPinModal(idx);
      card.innerHTML = `
        <div class="slot-number">${slot.data.name.charAt(0).toUpperCase()}</div>
        <div class="slot-info">
          <h3>${slot.data.name}</h3>
          <p>Profile ${idx + 1} • ${slot.data.gender} • ${slot.data.weight} kg • ${slot.data.height} cm</p>
        </div>
        <div class="slot-lock"><i data-lucide="lock"></i></div>
      `;
    } else {
      card.className = 'slot-card empty';
      card.onclick = () => openClaimModal(idx);
      card.innerHTML = `
        <div class="slot-num">${idx + 1}</div>
        <div class="slot-info">
          <h3>Profile ${idx + 1}</h3>
          <p>Tersedia untuk dibuat</p>
        </div>
        <button class="btn-claim" type="button">Buat Akun</button>
      `;
    }
    grid.appendChild(card);
  });

  refreshIcons();
}

// ==================== 1B. KELOLA AKUN KHUSUS DEVELOPER ====================
function openDevAuthModal() {
  safeSetValue('devPinInput', '');
  const errEl = document.getElementById('devPinErrorMsg');
  if (errEl) errEl.classList.add('hidden');
  const modal = document.getElementById('devAuthModal');
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => {
    const inp = document.getElementById('devPinInput');
    if (inp) inp.focus();
  }, 100);
  refreshIcons();
}

function submitDevAuth(e) {
  e.preventDefault();
  const entered = document.getElementById('devPinInput').value.trim();
  if (btoa(entered) === DEV_MASTER_CODE) {
    closeModal('devAuthModal');
    openDevManageModal();
  } else {
    const errEl = document.getElementById('devPinErrorMsg');
    if (errEl) errEl.classList.remove('hidden');
  }
}

function openDevManageModal() {
  renderDevSlotsList();
  const modal = document.getElementById('devManageModal');
  if (modal) modal.classList.remove('hidden');
  refreshIcons();
}

function renderDevSlotsList() {
  const list = document.getElementById('devSlotsList');
  if (!list) return;
  list.innerHTML = '';

  slotsState.forEach((slot, idx) => {
    const row = document.createElement('div');
    row.className = 'dev-slot-row';

    if (slot.claimed && slot.data) {
      row.innerHTML = `
        <div class="dev-slot-info">
          <strong>Profile ${idx + 1}: ${slot.data.name}</strong>
          <span>${slot.data.gender} • ${slot.data.weight} kg • PIN: ${slot.data.pin}</span>
        </div>
        <div class="dev-slot-actions">
          <button type="button" class="btn-dev-reset" onclick="devResetUserPin(${idx})">Reset PIN</button>
          <button type="button" class="btn-dev-delete" onclick="devDeleteSlot(${idx})">Hapus</button>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="dev-slot-info">
          <strong>Profile ${idx + 1}</strong>
          <span>Kosong (Tersedia)</span>
        </div>
      `;
    }
    list.appendChild(row);
  });
}

function devResetUserPin(slotIdx) {
  const user = slotsState[slotIdx].data;
  if (!user) return;
  const newPin = prompt(`Masukkan 4 angka PIN baru untuk ${user.name} (Profile ${slotIdx + 1}):`, '0000');
  if (newPin === null) return;

  if (!/^\d{4}$/.test(newPin.trim())) {
    alert('Gagal: PIN harus terdiri dari 4 angka.');
    return;
  }

  user.pin = newPin.trim();
  saveSlotsToStorage();
  renderDevSlotsList();
  alert(`PIN untuk ${user.name} berhasil diubah menjadi ${user.pin}.`);
}

function devDeleteSlot(slotIdx) {
  const user = slotsState[slotIdx].data;
  if (!user) return;
  if (!confirm(`Hapus permanen akun "${user.name}" di Profile ${slotIdx + 1}?`)) return;

  slotsState[slotIdx] = {
    index: slotIdx,
    label: `Profile ${slotIdx + 1}`,
    claimed: false,
    data: null
  };

  saveSlotsToStorage();
  renderAccountSlots();
  renderDevSlotsList();
}

function openClaimModal(slotIdx) {
  safeSetValue('claimSlotIndex', slotIdx);
  safeSetText('claimModalTitle', `Buat Akun — Profile ${slotIdx + 1}`);
  const form = document.getElementById('claimForm');
  if (form) form.reset();
  const modal = document.getElementById('claimModal');
  if (modal) modal.classList.remove('hidden');
  refreshIcons();
}

function submitClaimAccount(e) {
  e.preventDefault();
  const idx = parseInt(document.getElementById('claimSlotIndex').value);
  const name = document.getElementById('regName').value.trim();
  const gender = document.getElementById('regGender').value;
  const weight = parseFloat(document.getElementById('regWeight').value);
  const height = parseFloat(document.getElementById('regHeight').value);
  const pin = document.getElementById('regPin').value.trim();

  if (!/^\d{4}$/.test(pin)) {
    alert('PIN harus terdiri dari 4 angka.');
    return;
  }

  slotsState[idx].claimed = true;
  slotsState[idx].data = {
    name,
    gender,
    weight,
    height,
    pin,
    cycleStartDate: null,
    workouts: [],
    metrics: [
      {
        date: new Date().toISOString().split('T')[0],
        weight,
        waist: 78,
        chest: 92,
        arm: 31
      }
    ]
  };

  saveSlotsToStorage();
  closeModal('claimModal');
  renderAccountSlots();
  loginIntoSlot(idx);
}

function openPinModal(slotIdx) {
  const user = slotsState[slotIdx].data;
  safeSetValue('verifySlotIndex', slotIdx);
  safeSetText('pinModalTitle', `PIN — ${user.name}`);
  safeSetText('pinPromptLabel', `Masukkan 4 angka PIN untuk membuka Profile ${slotIdx + 1}`);
  safeSetValue('verifyPinInput', '');
  const errEl = document.getElementById('pinErrorMsg');
  if (errEl) errEl.classList.add('hidden');
  const modal = document.getElementById('pinModal');
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => {
    const inp = document.getElementById('verifyPinInput');
    if (inp) inp.focus();
  }, 100);
  refreshIcons();
}

function submitVerifyPin(e) {
  e.preventDefault();
  const idx = parseInt(document.getElementById('verifySlotIndex').value);
  const entered = document.getElementById('verifyPinInput').value.trim();
  const user = slotsState[idx].data;

  if (entered === user.pin) {
    closeModal('pinModal');
    loginIntoSlot(idx);
  } else {
    const errEl = document.getElementById('pinErrorMsg');
    if (errEl) errEl.classList.remove('hidden');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function loginIntoSlot(idx) {
  activeUserSlot = idx;
  const user = slotsState[idx].data;

  safeSetText('headerAvatar', user.name.charAt(0).toUpperCase());
  safeSetText('headerUserName', user.name);
  safeSetText('headerUserMeta', `${user.gender} • ${user.weight} kg • ${user.height} cm`);

  safeSetText('profileSlotTag', `PROFILE ${idx + 1}`);
  safeSetText('profileAvatarLg', user.name.charAt(0).toUpperCase());
  safeSetText('profileNameLg', user.name);
  safeSetText('profileDetailsLg', `${user.gender} • ${user.weight} kg • ${user.height} cm`);

  if (user.metrics && user.metrics.length > 0) {
    const latest = user.metrics[user.metrics.length - 1];
    safeSetValue('logWeight', latest.weight || user.weight);
    safeSetValue('logWaist', latest.waist || '');
    safeSetValue('logChest', latest.chest || '');
    safeSetValue('logArm', latest.arm || '');
  } else {
    safeSetValue('logWeight', user.weight);
  }

  const accScreen = document.getElementById('accountScreen');
  const mainApp = document.getElementById('mainApp');
  if (accScreen) {
    accScreen.classList.add('hidden');
    accScreen.classList.remove('active');
  }
  if (mainApp) {
    mainApp.classList.remove('hidden');
  }

  renderExerciseLibrary();
  selectExercise(selectedExerciseId);
  if (typeof renderAIAdaptivePlan === 'function') renderAIAdaptivePlan();
  updateStatsAndChart();
  refreshIcons();
}

function switchAccount() {
  activeUserSlot = null;
  const mainApp = document.getElementById('mainApp');
  const accScreen = document.getElementById('accountScreen');
  if (mainApp) mainApp.classList.add('hidden');
  if (accScreen) {
    accScreen.classList.remove('hidden');
    accScreen.classList.add('active');
  }
  renderAccountSlots();
}

// ==================== 2. NAVIGASI 4 TAB ====================
function switchTab(tabKey, btnEl) {
  document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  const target = document.getElementById(`tab-${tabKey}`);
  if (target) target.classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  if (tabKey === 'stats') {
    updateStatsAndChart();
  } else if (tabKey === 'program' && activeUserSlot !== null && typeof renderAIAdaptivePlan === 'function') {
    renderAIAdaptivePlan();
  }
}

// ==================== 3. TAB LATIHAN (14 GERAKAN + ILUSTRASI) ====================
function filterExercises(catKey, chipEl) {
  currentFilter = catKey;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');
  renderExerciseLibrary();
}

function renderExerciseLibrary() {
  const grid = document.getElementById('exerciseGrid');
  const supersetSelect = document.getElementById('supersetSecondExercise');
  if (!grid || typeof EXERCISES_DATA === 'undefined') return;

  grid.innerHTML = '';
  if (supersetSelect) supersetSelect.innerHTML = '';

  const filtered = EXERCISES_DATA.filter(ex => {
    if (currentFilter === 'all') return true;
    return ex.category === currentFilter;
  });

  safeSetText('exerciseCountBadge', `${filtered.length} Gerakan`);

  const catBadgeMap = {
    upper: 'Upper Body',
    lower: 'Lower Body',
    core: 'Core & Cardio'
  };

  filtered.forEach(ex => {
    const catName = catBadgeMap[ex.category] || ex.category;
    const subTarget = ex.categoryLabel && ex.categoryLabel.includes('•')
      ? ex.categoryLabel.split('•')[1].trim()
      : ex.modeLabel || '';

    const item = document.createElement('div');
    item.className = `ex-item ${ex.id === selectedExerciseId ? 'selected' : ''}`;
    item.onclick = () => selectExercise(ex.id);
    item.innerHTML = `
      <div class="ex-item-top">
        <span class="ex-type-dot">${catName}</span>
      </div>
      <h4>${ex.name}</h4>
      <span>${subTarget}</span>
    `;
    grid.appendChild(item);
  });

  if (supersetSelect) {
    EXERCISES_DATA.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.innerText = `${ex.name} (${ex.modeLabel || ex.category})`;
      supersetSelect.appendChild(opt);
    });
  }
}

function selectExercise(exId) {
  if (typeof EXERCISES_DATA === 'undefined') return;
  selectedExerciseId = exId;
  const ex = EXERCISES_DATA.find(item => item.id === exId) || EXERCISES_DATA[0];

  renderExerciseLibrary();

  safeSetText('selectedCategoryTag', ex.categoryLabel || ex.category.toUpperCase());
  safeSetText('selectedExName', ex.name);
  safeSetText('selectedExMode', ex.modeLabel || (ex.mode === 'timer' ? 'Penghitung Detik' : 'Penghitung Repetisi'));
  safeSetText('exerciseCameraTip', ex.cameraTip || '');

  const stepsBox = document.getElementById('exerciseStepsVisual');
  if (stepsBox && Array.isArray(ex.steps)) {
    stepsBox.innerHTML = ex.steps.map(step => `
      <div class="step-frame">
        ${step.svg}
        <p>${step.label}</p>
      </div>
    `).join('');
  }

  const supersetSelect = document.getElementById('supersetSecondExercise');
  if (supersetSelect && supersetSelect.value === ex.id) {
    const other = EXERCISES_DATA.find(item => item.id !== ex.id);
    if (other) supersetSelect.value = other.id;
  }
}

function toggleSupersetField() {
  const type = document.getElementById('setTypeSelect').value;
  const box = document.getElementById('supersetPairBox');
  if (!box) return;
  if (type === 'Superset') {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function launchCameraSession() {
  const primaryEx = EXERCISES_DATA.find(e => e.id === selectedExerciseId) || EXERCISES_DATA[0];
  const setType = document.getElementById('setTypeSelect').value;
  const restSec = parseInt(document.getElementById('restDurationInput').value) || 60;

  let secondaryEx = null;
  if (setType === 'Superset') {
    const secId = document.getElementById('supersetSecondExercise').value;
    secondaryEx = EXERCISES_DATA.find(e => e.id === secId) || null;
  }

  startAICameraSession(primaryEx, setType, restSec, secondaryEx);
}

// ==================== 4. TAB STATISTIK & GRAFIK 30 HARI ====================
function updateStatsAndChart() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;
  const workouts = user.workouts || [];

  const today = new Date();
  let startDate = user.cycleStartDate ? new Date(user.cycleStartDate) : new Date();
  const daysPassed = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));

  if (user.cycleStartDate && daysPassed >= 30) {
    user.cycleStartDate = today.toISOString().slice(0, 10);
    user.workouts = [];
    saveSlotsToStorage();
  }

  const activeDaysSet = new Set(workouts.map(w => w.date));
  const activeDaysCount = activeDaysSet.size;
  const totalReps = workouts.reduce((sum, w) => sum + (w.value || 0), 0);

  safeSetText('goalProgressBadge', `${activeDaysCount} / 30 Hari`);
  safeSetText('statTotalWorkouts', workouts.length);
  safeSetText('statTotalReps', totalReps);
  safeSetText('statStreak', `${activeDaysCount}/30`);

  const consistencyPct = Math.min(100, Math.round((activeDaysCount / 30) * 100));
  safeSetText('ringConsistencyPct', `${consistencyPct}%`);
  safeSetText('ringConsistencyDesc', `${activeDaysCount} dari 30 hari target latihan tercapai.`);
  renderDonutRing('consistencyRingChart', consistencyPct, '#166b0e', 'consistency');

  const volumePct = Math.min(100, Math.round((totalReps / 1000) * 100));
  safeSetText('ringVolumePct', `${volumePct}%`);
  safeSetText('ringVolumeDesc', `${totalReps} dari 1.000 total repetisi bulanan.`);
  renderDonutRing('volumeRingChart', volumePct, '#94bf4e', 'volume');

  const weeklyUpper = [0, 0, 0, 0];
  const weeklyLower = [0, 0, 0, 0];
  const weeklyCore = [0, 0, 0, 0];

  workouts.forEach(w => {
    const wDate = new Date(w.date);
    const diffDays = Math.max(0, Math.floor((wDate - startDate) / (1000 * 60 * 60 * 24)));
    const weekIdx = Math.min(3, Math.floor(diffDays / 7));

    if (w.category === 'upper' || w.category === 'Upper Body') {
      weeklyUpper[weekIdx] += w.value;
    } else if (w.category === 'lower' || w.category === 'Lower Body') {
      weeklyLower[weekIdx] += w.value;
    } else {
      weeklyCore[weekIdx] += w.value;
    }
  });

  renderThirtyDayChart(weeklyUpper, weeklyLower, weeklyCore);
}

function renderDonutRing(canvasId, pct, activeColor, key) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  if (key === 'consistency' && consistencyRingInstance) consistencyRingInstance.destroy();
  if (key === 'volume' && volumeRingInstance) volumeRingInstance.destroy();

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [pct, Math.max(0, 100 - pct)],
        backgroundColor: [activeColor, '#d2d6d2'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '74%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });

  if (key === 'consistency') consistencyRingInstance = chart;
  else volumeRingInstance = chart;
}

function renderThirtyDayChart(upperData, lowerData, coreData) {
  const ctx = document.getElementById('thirtyDayChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (thirtyDayChartInstance) {
    thirtyDayChartInstance.destroy();
  }

  thirtyDayChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      datasets: [
        { label: 'Upper Body', data: upperData, backgroundColor: '#166b0e', borderRadius: 6 },
        { label: 'Lower Body', data: lowerData, backgroundColor: '#94bf4e', borderRadius: 6 },
        { label: 'Core & Cardio', data: coreData, backgroundColor: '#2b8cbe', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' }, color: '#475547' } },
        y: { beginAtZero: true, suggestedMax: 20, grid: { color: 'rgba(24, 34, 24, 0.08)' }, ticks: { font: { size: 11 }, color: '#475547' } }
      }
    }
  });
}

function resetChartData() {
  if (activeUserSlot === null) return;
  if (!confirm('Reset seluruh riwayat latihan 30 hari pada profile ini?')) return;

  const user = slotsState[activeUserSlot].data;
  user.workouts = [];
  user.cycleStartDate = null;
  saveSlotsToStorage();
  updateStatsAndChart();
}

function saveBodyMetrics() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;

  const weight = parseFloat(document.getElementById('logWeight')?.value) || user.weight;
  const waist = parseFloat(document.getElementById('logWaist')?.value) || 0;
  const chest = parseFloat(document.getElementById('logChest')?.value) || 0;
  const arm = parseFloat(document.getElementById('logArm')?.value) || 0;

  user.weight = weight;
  if (!user.metrics) user.metrics = [];
  user.metrics.push({
    date: new Date().toISOString().split('T')[0],
    weight,
    waist,
    chest,
    arm
  });

  saveSlotsToStorage();
  loginIntoSlot(activeUserSlot);
  alert('Catatan berat & lingkar tubuh tersimpan!');
}

// ==================== 5. EDIT DATA PROFILE ====================
function openEditProfileModal() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;

  safeSetValue('editName', user.name || '');
  safeSetValue('editGender', user.gender || 'Pria');
  safeSetValue('editWeight', user.weight || 60);
  safeSetValue('editHeight', user.height || 170);
  safeSetValue('editPin', user.pin || '');

  const modal = document.getElementById('editProfileModal');
  if (modal) modal.classList.remove('hidden');
  refreshIcons();
}

function submitEditProfile(e) {
  e.preventDefault();
  if (activeUserSlot === null) return;

  const newName = document.getElementById('editName').value.trim();
  const newGender = document.getElementById('editGender').value;
  const newWeight = parseFloat(document.getElementById('editWeight').value);
  const newHeight = parseFloat(document.getElementById('editHeight').value);
  const newPin = document.getElementById('editPin').value.trim();

  if (!/^\d{4}$/.test(newPin)) {
    alert('PIN harus terdiri dari 4 angka.');
    return;
  }

  const user = slotsState[activeUserSlot].data;
  user.name = newName;
  user.gender = newGender;
  user.weight = newWeight;
  user.height = newHeight;
  user.pin = newPin;

  if (!user.metrics) user.metrics = [];
  user.metrics.push({
    date: new Date().toISOString().split('T')[0],
    weight: newWeight
  });

  saveSlotsToStorage();
  renderAccountSlots();
  loginIntoSlot(activeUserSlot);
  closeModal('editProfileModal');
  alert('Data profile & target nutrisi AI berhasil diperbarui!');
}

// ==================== 6. BAGIKAN KARTU PROGRES ====================
function shareProgressCard() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;
  const totalReps = (user.workouts || []).reduce((s, w) => s + (w.value || 0), 0);
  const activeDays = new Set((user.workouts || []).map(w => w.date)).size;

  const text = `🏋️ *LET'S MOVE — PROGRES LATIHAN*\n` +
    `Nama: ${user.name} (Profile ${activeUserSlot + 1})\n` +
    `Profil: ${user.gender} • ${user.weight} kg • ${user.height} cm\n` +
    `Konsistensi: ${activeDays}/30 Hari\n` +
    `Total Volume: ${totalReps} Repetisi/Detik\n` +
    `Tetap konsisten setiap hari!`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Kartu progres berhasil disalin! Silakan tempel (Paste) di WhatsApp.');
    });
  } else {
    alert(text);
  }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  renderAccountSlots();
  refreshIcons();
});