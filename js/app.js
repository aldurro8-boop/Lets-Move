// ==================== INISIALISASI 5 PROFILE ====================
const DEFAULT_SLOTS = [
  { slotIndex: 0, presetName: 'AlDurro', claimed: false, data: null },
  { slotIndex: 1, presetName: 'Hani', claimed: false, data: null },
  { slotIndex: 2, presetName: 'Profile 3', claimed: false, data: null },
  { slotIndex: 3, presetName: 'Profile 4', claimed: false, data: null },
  { slotIndex: 4, presetName: 'Profile 5', claimed: false, data: null }
];

let slotsState = JSON.parse(localStorage.getItem('letsmove_slots_v2')) || DEFAULT_SLOTS;
let activeUserSlot = null;
let selectedExerciseId = 'pushup';
let thirtyDayChartInstance = null;
let consistencyRingInstance = null;
let volumeRingInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderSlots();
  renderExercises('all');
  selectExercise('pushup');
  populateSupersetDropdown();
});

function saveSlotsToStorage() {
  localStorage.setItem('letsmove_slots_v2', JSON.stringify(slotsState));
}

// ==================== RENDER 5 KARTU PROFILE ====================
function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';

  slotsState.forEach((slot, idx) => {
    const card = document.createElement('div');
    if (slot.claimed && slot.data) {
      const heightText = slot.data.height ? ` • ${slot.data.height} cm` : '';
      card.className = 'slot-card claimed';
      card.onclick = () => openPinModal(idx);
      card.innerHTML = `
        <div class="slot-left">
          <div class="slot-number">${slot.data.name.charAt(0).toUpperCase()}</div>
          <div class="slot-info">
            <h4>${slot.data.name}</h4>
            <p>Profile ${idx + 1} • ${slot.data.gender} • ${slot.data.weight} kg${heightText}</p>
          </div>
        </div>
        <i data-lucide="lock" style="color:#166b0e; width:18px;"></i>
      `;
    } else {
      card.className = 'slot-card empty';
      const displayTitle = idx < 2 ? `${slot.presetName} (Profile ${idx + 1})` : `Profile ${idx + 1} (Kosong)`;
      card.innerHTML = `
        <div class="slot-left">
          <div class="slot-number">#${idx + 1}</div>
          <div class="slot-info">
            <h4>${displayTitle}</h4>
            <p>Tersedia untuk dibuat</p>
          </div>
        </div>
        <button class="btn-claim" onclick="openClaimModal(${idx})">Buat Akun</button>
      `;
    }
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function openClaimModal(idx) {
  const slot = slotsState[idx];
  document.getElementById('claimSlotIndex').value = idx;
  document.getElementById('claimModalTitle').innerText = `Buat Akun — Profile ${idx + 1}`;
  document.getElementById('regName').value = idx < 2 ? slot.presetName : '';
  document.getElementById('regWeight').value = '';
  document.getElementById('regHeight').value = '';
  document.getElementById('regPin').value = '';
  document.getElementById('claimModal').classList.remove('hidden');
}

function submitClaimAccount(e) {
  e.preventDefault();
  const idx = parseInt(document.getElementById('claimSlotIndex').value);
  const name = document.getElementById('regName').value.trim();
  const gender = document.getElementById('regGender').value;
  const weight = parseFloat(document.getElementById('regWeight').value);
  const height = parseInt(document.getElementById('regHeight').value);
  const pin = document.getElementById('regPin').value;

  slotsState[idx].claimed = true;
  slotsState[idx].data = {
    name,
    gender,
    weight,
    height,
    pin,
    createdAt: new Date().toISOString(),
    cycleStartDate: null,
    workouts: [],
    bodyMetrics: []
  };

  saveSlotsToStorage();
  closeModal('claimModal');
  loginIntoSlot(idx);
}

function openPinModal(idx) {
  const slot = slotsState[idx];
  document.getElementById('verifySlotIndex').value = idx;
  document.getElementById('pinModalTitle').innerText = `Halo, ${slot.data.name}`;
  document.getElementById('verifyPinInput').value = '';
  document.getElementById('pinErrorMsg').classList.add('hidden');
  document.getElementById('pinModal').classList.remove('hidden');
}

function submitVerifyPin(e) {
  e.preventDefault();
  const idx = parseInt(document.getElementById('verifySlotIndex').value);
  const inputPin = document.getElementById('verifyPinInput').value;

  if (slotsState[idx].data.pin === inputPin) {
    closeModal('pinModal');
    loginIntoSlot(idx);
  } else {
    document.getElementById('pinErrorMsg').classList.remove('hidden');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function loginIntoSlot(idx) {
  activeUserSlot = idx;
  const user = slotsState[idx].data;
  const heightInfo = user.height ? ` • ${user.height} cm` : '';

  document.getElementById('headerAvatar').innerText = user.name.charAt(0).toUpperCase();
  document.getElementById('headerUserName').innerText = user.name;
  document.getElementById('headerUserMeta').innerText = `${user.gender} • ${user.weight} kg${heightInfo}`;

  document.getElementById('profileSlotTag').innerText = `PROFILE ${idx + 1}`;
  document.getElementById('profileAvatarLg').innerText = user.name.charAt(0).toUpperCase();
  document.getElementById('profileNameLg').innerText = user.name;
  document.getElementById('profileDetailsLg').innerText = `${user.gender} • ${user.weight} kg${heightInfo}`;

  document.getElementById('accountScreen').classList.remove('active');
  document.getElementById('accountScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');

  updateStatsAndChart();
  if (typeof renderAIAdaptivePlan === 'function') renderAIAdaptivePlan();
}

function switchAccount() {
  activeUserSlot = null;
  renderSlots();
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('accountScreen').classList.remove('hidden');
  document.getElementById('accountScreen').classList.add('active');
}

// ==================== NAVIGASI 4 TAB ====================
function switchTab(tabName, btnEl) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  btnEl.classList.add('active');

  if (tabName === 'stats') {
    updateStatsAndChart();
  } else if (tabName === 'program') {
    if (typeof renderAIAdaptivePlan === 'function') renderAIAdaptivePlan();
  }
}

// ==================== RESET DATA GRAFIK ====================
function resetChartData() {
  if (activeUserSlot === null) return;
  const yakin = confirm('Anda yakin ingin menghapus data?');
  if (!yakin) return;

  const user = slotsState[activeUserSlot].data;
  user.workouts = [];
  user.cycleStartDate = null;
  saveSlotsToStorage();
  updateStatsAndChart();
}

// ==================== GRAFIK GROUPED BAR (MULAI MINGGU 1 DARI SESI PERTAMA) ====================
function updateStatsAndChart() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;
  user.workouts = user.workouts || [];

  // Tentukan tanggal mulai siklus 30 hari dari sesi latihan pertama pengguna
  if (user.workouts.length > 0 && !user.cycleStartDate) {
    const sortedDates = user.workouts.map(w => w.date).sort();
    user.cycleStartDate = sortedDates[0];
    saveSlotsToStorage();
  }

  // Jika siklus 30 hari sudah terlewati, otomatis mulai siklus baru
  if (user.cycleStartDate) {
    const startObj = new Date(user.cycleStartDate + 'T00:00:00');
    const todayObj = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
    const daysSinceStart = Math.floor((todayObj - startObj) / (1000 * 60 * 60 * 24));
    if (daysSinceStart >= 30) {
      user.workouts = [];
      user.cycleStartDate = null;
      saveSlotsToStorage();
    }
  }

  const upperWeekly = [0, 0, 0, 0];
  const lowerWeekly = [0, 0, 0, 0];
  const coreWeekly = [0, 0, 0, 0];

  let totalReps = 0;
  const activeDaysSet = new Set();

  if (user.cycleStartDate) {
    const startObj = new Date(user.cycleStartDate + 'T00:00:00');

    user.workouts.forEach(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      const dayOffset = Math.max(0, Math.floor((wDate - startObj) / (1000 * 60 * 60 * 24)));

      if (dayOffset < 30) {
        const val = w.value || 0;
        totalReps += val;
        activeDaysSet.add(w.date);

        // Hari 0-6 -> Minggu 1 (idx 0), Hari 7-13 -> Minggu 2 (idx 1), Hari 14-20 -> Minggu 3 (idx 2), Hari 21-29 -> Minggu 4 (idx 3)
        let weekIdx = Math.floor(dayOffset / 7);
        if (weekIdx > 3) weekIdx = 3;

        if (w.category === 'upper') upperWeekly[weekIdx] += val;
        else if (w.category === 'lower') lowerWeekly[weekIdx] += val;
        else coreWeekly[weekIdx] += val;
      }
    });
  }

  const activeDaysCount = activeDaysSet.size;
  const consistencyPct = Math.min(100, Math.round((activeDaysCount / 30) * 100));
  const targetMonthlyVolume = 1000;
  const volumePct = Math.min(100, Math.round((totalReps / targetMonthlyVolume) * 100));

  document.getElementById('goalProgressBadge').innerText = `${activeDaysCount} / 30 Hari`;
  document.getElementById('statTotalWorkouts').innerText = user.workouts.length;
  document.getElementById('statTotalReps').innerText = totalReps;
  document.getElementById('statStreak').innerText = `${activeDaysCount}/30`;

  document.getElementById('ringConsistencyPct').innerText = `${consistencyPct}%`;
  document.getElementById('ringConsistencyDesc').innerText = `${activeDaysCount} dari 30 hari target latihan tercapai.`;

  document.getElementById('ringVolumePct').innerText = `${volumePct}%`;
  document.getElementById('ringVolumeDesc').innerText = `${totalReps} dari ${targetMonthlyVolume} total repetisi bulanan.`;

  const ctxBar = document.getElementById('thirtyDayChart').getContext('2d');
  if (thirtyDayChartInstance) thirtyDayChartInstance.destroy();

  thirtyDayChartInstance = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      datasets: [
        {
          label: 'Upper Body',
          data: upperWeekly,
          backgroundColor: '#166b0e',
          borderRadius: 4,
          barPercentage: 0.78,
          categoryPercentage: 0.68
        },
        {
          label: 'Lower Body',
          data: lowerWeekly,
          backgroundColor: '#94bf4e',
          borderRadius: 4,
          barPercentage: 0.78,
          categoryPercentage: 0.68
        },
        {
          label: 'Core & Cardio',
          data: coreWeekly,
          backgroundColor: '#2b8cbe',
          borderRadius: 4,
          barPercentage: 0.78,
          categoryPercentage: 0.68
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: '600' }, color: '#4a574a' }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 20,
          grid: { color: 'rgba(0,0,0,0.08)' },
          ticks: { stepSize: 5, font: { size: 11 }, color: '#4a574a' }
        }
      }
    }
  });

  const ctxRing1 = document.getElementById('consistencyRingChart').getContext('2d');
  if (consistencyRingInstance) consistencyRingInstance.destroy();

  consistencyRingInstance = new Chart(ctxRing1, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [consistencyPct, 100 - consistencyPct],
        backgroundColor: ['#166b0e', '#d2d6d2'],
        borderWidth: 0,
        borderRadius: consistencyPct > 0 ? 10 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '74%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });

  const ctxRing2 = document.getElementById('volumeRingChart').getContext('2d');
  if (volumeRingInstance) volumeRingInstance.destroy();

  volumeRingInstance = new Chart(ctxRing2, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [volumePct, 100 - volumePct],
        backgroundColor: ['#94bf4e', '#d2d6d2'],
        borderWidth: 0,
        borderRadius: volumePct > 0 ? 10 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '74%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });

  lucide.createIcons();
}

// ==================== PILIH GERAKAN & ILUSTRASI STEP ====================
function filterExercises(category, chipEl) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  renderExercises(category);
}

function renderExercises(category) {
  const grid = document.getElementById('exerciseGrid');
  grid.innerHTML = '';

  const filtered = category === 'all'
    ? EXERCISES_DATA
    : EXERCISES_DATA.filter(ex => ex.category === category);

  document.getElementById('exerciseCountBadge').innerText = `${filtered.length} Gerakan`;

  filtered.forEach(ex => {
    const item = document.createElement('div');
    item.className = `ex-item ${ex.id === selectedExerciseId ? 'selected' : ''}`;
    item.onclick = () => selectExercise(ex.id);
    item.innerHTML = `
      <div class="ex-item-top">
        <span class="ex-type-dot">${ex.mode === 'timer' ? 'TIMER' : 'REPS'}</span>
      </div>
      <h4>${ex.name}</h4>
      <span>${ex.categoryLabel}</span>
    `;
    grid.appendChild(item);
  });
}

function selectExercise(id) {
  selectedExerciseId = id;
  const ex = EXERCISES_DATA.find(item => item.id === id);
  if (!ex) return;

  document.querySelectorAll('.ex-item').forEach(el => {
    el.classList.toggle('selected', el.querySelector('h4').innerText === ex.name);
  });

  document.getElementById('selectedCategoryTag').innerText = ex.categoryLabel;
  document.getElementById('selectedExName').innerText = ex.name;
  document.getElementById('selectedExMode').innerText = ex.modeLabel;
  document.getElementById('exerciseCameraTip').innerText = ex.cameraTip;

  const visualContainer = document.getElementById('exerciseStepsVisual');
  visualContainer.innerHTML = ex.steps.map(step => `
    <div class="step-frame">
      ${step.svg}
      <p>${step.label}</p>
    </div>
  `).join('');
}

function populateSupersetDropdown() {
  const select = document.getElementById('supersetSecondExercise');
  select.innerHTML = EXERCISES_DATA.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('');
}

function toggleSupersetField() {
  const val = document.getElementById('setTypeSelect').value;
  document.getElementById('supersetPairBox').classList.toggle('hidden', val !== 'Superset');
}

function saveBodyMetrics() {
  if (activeUserSlot === null) return;
  const weight = parseFloat(document.getElementById('logWeight').value);
  const waist = parseFloat(document.getElementById('logWaist').value);
  const chest = parseFloat(document.getElementById('logChest').value);
  const arm = parseFloat(document.getElementById('logArm').value);

  const user = slotsState[activeUserSlot].data;
  const heightInfo = user.height ? ` • ${user.height} cm` : '';
  if (weight) {
    user.weight = weight;
    document.getElementById('headerUserMeta').innerText = `${user.gender} • ${user.weight} kg${heightInfo}`;
    document.getElementById('profileDetailsLg').innerText = `${user.gender} • ${user.weight} kg${heightInfo}`;
  }

  user.bodyMetrics.push({
    date: new Date().toISOString().slice(0, 10),
    weight: weight || user.weight,
    waist: waist || null,
    chest: chest || null,
    arm: arm || null
  });

  saveSlotsToStorage();
  alert('Catatan berat & ukuran lingkar tubuh berhasil disimpan!');
}

function shareProgressCard() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;
  const heightInfo = user.height ? ` / ${user.height} cm` : '';
  const text = `🏋️ *LET'S MOVE — KARTU PROGRES*\nNama: ${user.name} (${user.gender})\nBerat / Tinggi: ${user.weight} kg${heightInfo}\nTotal Sesi 30 Hari: ${user.workouts.length} sesi\n\nAyo gerak bareng!`;
  navigator.clipboard.writeText(text);
  alert('Kartu progres disalin! Tinggal tempel (Paste) di chat WhatsApp.');
}

// ==================== LUNCURKAN SESI KAMERA AI ====================
function launchCameraSession() {
  const primaryEx = EXERCISES_DATA.find(item => item.id === selectedExerciseId);
  if (!primaryEx) return;

  const setType = document.getElementById('setTypeSelect').value;
  const restSeconds = document.getElementById('restDurationInput').value;
  let secondaryEx = null;

  if (setType === 'Superset') {
    const secondId = document.getElementById('supersetSecondExercise').value;
    secondaryEx = EXERCISES_DATA.find(item => item.id === secondId);
  }

  lucide.createIcons();
  startAICameraSession(primaryEx, setType, restSeconds, secondaryEx);
}

// ==================== EDIT DATA PROFILE ====================
function openEditProfileModal() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;

  document.getElementById('editName').value = user.name || '';
  document.getElementById('editGender').value = user.gender || 'Pria';
  document.getElementById('editWeight').value = user.weight || 60;
  document.getElementById('editHeight').value = user.height || 170;
  document.getElementById('editPin').value = user.pin || '';

  document.getElementById('editProfileModal').classList.remove('hidden');
  lucide.createIcons();
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

  // Catat juga riwayat berat terbaru ke metrics agar sinkron
  if (!user.metrics) user.metrics = [];
  user.metrics.push({
    date: new Date().toISOString().split('T')[0],
    weight: newWeight
  });

  saveSlotsToStorage();
  renderAccountSlots();
  loginIntoSlot(activeUserSlot); // Refresh header, kartu ID, & hitung ulang nutrisi AI
  closeModal('editProfileModal');
  alert('Data profile & target nutrisi AI berhasil diperbarui!');
}