// ==================== MESIN RENCANA ADAPTIF AI & NUTRISI PER HARI (100% LOKAL) ====================

function renderAIAdaptivePlan() {
  if (activeUserSlot === null) return;
  const user = slotsState[activeUserSlot].data;
  const container = document.getElementById('aiWeeklyPlanList');
  if (!container) return;

  // 1. Hitung BMI & Profil Fisik
  const weight = parseFloat(user.weight) || 60;
  const heightCm = parseFloat(user.height) || 170;
  const heightM = heightCm / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);
  const isFemale = user.gender === 'Wanita';

  let bmiCategory = 'Ideal';
  let intensityMultiplier = 1.0;
  let calorieGoalNote = 'Surplus ringan (+250 kkal) untuk bangun massa otot bersih';
  let calorieOffset = 250;

  if (bmi < 18.5) {
    bmiCategory = 'Underweight (Fokus Kekuatan Otot)';
    intensityMultiplier = 0.9;
    calorieGoalNote = 'Surplus otot (+350 kkal) untuk naikkan berat & massa otot';
    calorieOffset = 350;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight (Low-Impact & Bakar Kalori)';
    intensityMultiplier = 0.85;
    calorieGoalNote = 'Defisit ringan (-300 kkal) tinggi protein agar lemak turun & otot terjaga';
    calorieOffset = -300;
  } else if (bmi >= 30) {
    bmiCategory = 'Obesitas (Sendi Aman & Kardio Bertahap)';
    intensityMultiplier = 0.75;
    calorieGoalNote = 'Defisit bertahap (-400 kkal) tinggi protein untuk jaga sendi & metabolisme';
    calorieOffset = -400;
  }

  // 2. Kalkulasi Kebutuhan Makro Harian (BMR Mifflin-St Jeor + Aktivitas 1.45)
  const bmr = isFemale
    ? (10 * weight) + (6.25 * heightCm) - (5 * 25) - 161
    : (10 * weight) + (6.25 * heightCm) - (5 * 25) + 5;
  const tdee = Math.round(bmr * 1.45);
  const targetCalories = Math.max(1200, tdee + calorieOffset);
  const targetProtein = Math.round(weight * 1.8); // 1.8g per kg berat badan
  const targetWaterLiters = (weight * 0.035).toFixed(1);

  // 3. Analisis Riwayat Latihan 7 Hari Terakhir
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentWorkouts = (user.workouts || []).filter(w => new Date(w.date) >= sevenDaysAgo);

  const catVolume = { upper: 0, lower: 0, core: 0 };
  const exBestRecord = {};

  recentWorkouts.forEach(w => {
    if (catVolume[w.category] !== undefined) {
      catVolume[w.category] += (w.value || 0);
    }
    if (!exBestRecord[w.exerciseId] || w.value > exBestRecord[w.exerciseId]) {
      exBestRecord[w.exerciseId] = w.value;
    }
  });

  // Tentukan kategori otot yang paling tertinggal minggu ini
  let weakestCategory = 'upper';
  let weakestLabel = 'Upper Body';
  if (catVolume.lower < catVolume[weakestCategory]) {
    weakestCategory = 'lower';
    weakestLabel = 'Lower Body';
  }
  if (catVolume.core < catVolume[weakestCategory]) {
    weakestCategory = 'core';
    weakestLabel = 'Core & Cardio';
  }

  const insightTitle = recentWorkouts.length === 0
    ? `Program Fondasi Minggu Pertama untuk ${user.name}`
    : `Fokus Minggu Ini: Kejar Ketertinggalan ${weakestLabel}`;

  const insightDesc = recentWorkouts.length === 0
    ? `Berdasarkan profil (${user.gender}, ${weight} kg, ${heightCm} cm, BMI ${bmi} — ${bmiCategory}), AI menyusun pola latihan 5 hari aktif + 2 hari pemulihan beserta menu pasar lokal per hari.`
    : `Dalam 7 hari terakhir kamu menyelesaikan ${recentWorkouts.length} sesi (Upper: ${catVolume.upper}, Lower: ${catVolume.lower}, Core: ${catVolume.core}). AI menaikkan porsi ${weakestLabel} & menaikkan target +12%.`;

  // 4. Susun 7 Hari Rencana Adaptif + Menu Real Food Lokal Per Hari
  const weeklyTemplate = buildAdaptiveDays(weakestCategory, bmi, intensityMultiplier, exBestRecord, weight, targetCalories, targetProtein);

  // Render ke HTML
  let html = `
    <div class="ai-summary-box">
      <div class="ai-summary-top">
        <span class="ai-chip-status">BMI ${bmi} • ${bmiCategory.split(' ')[0]}</span>
        <span class="ai-chip-status">${recentWorkouts.length} Sesi (7 Hr)</span>
      </div>
      <h4>${insightTitle}</h4>
      <p>${insightDesc}</p>

      <div class="nutri-mini-strip">
        <div><strong>${targetCalories} kkal</strong><span>Target/Hari</span></div>
        <div><strong>${targetProtein}g Protein</strong><span>~${Math.round(targetProtein / 3)}g/Makan</span></div>
        <div><strong>${targetWaterLiters} L</strong><span>Air Mineral</span></div>
      </div>
    </div>

    <div class="ai-days-stack">
  `;

  weeklyTemplate.forEach((item, index) => {
    const mealDropdownHtml = buildDayMealDropdown(item.mealPlan, index);

    if (item.isRest) {
      html += `
        <div class="ai-day-card rest-day">
          <div class="ai-day-head">
            <span class="ai-day-name">${item.day}</span>
            <span class="ai-day-tag rest">ACTIVE RECOVERY</span>
          </div>
          <h4>${item.title}</h4>
          <p class="muted-text">${item.note}</p>
          ${mealDropdownHtml}
        </div>
      `;
    } else {
      const exListHtml = item.exercises.map(exPlan => `
        <div class="ai-ex-row">
          <div>
            <strong>${exPlan.name}</strong>
            <span>${exPlan.sets} Set × ${exPlan.targetText} • Rest ${exPlan.rest}d</span>
          </div>
          <button class="btn-ai-start" onclick="applyAIExerciseAndGo('${exPlan.id}', ${exPlan.rest})">
            Latih &rarr;
          </button>
        </div>
      `).join('');

      html += `
        <div class="ai-day-card">
          <div class="ai-day-head">
            <span class="ai-day-name">${item.day}</span>
            <span class="ai-day-tag">${item.focusTag}</span>
          </div>
          <h4>${item.title}</h4>
          <div class="ai-ex-list">${exListHtml}</div>
          ${mealDropdownHtml}
        </div>
      `;
    }
  });

  html += `</div>`;

  container.innerHTML = html;
  lucide.createIcons();
}

// Komponen Opsi B: Tombol Buka-Tutup Rekomendasi Makan Per Hari
function buildDayMealDropdown(meal, idx) {
  if (!meal) return '';
  return `
    <div class="day-meal-wrapper">
      <button type="button" class="btn-toggle-meal" onclick="toggleDayMeal(${idx}, this)">
        <span>🍽️ Lihat Rekomendasi Makan Hari Ini (${meal.carbLevel})</span>
        <span class="meal-arrow" id="mealArrow-${idx}">▾</span>
      </button>
      <div id="dayMealBox-${idx}" class="day-meal-content hidden">
        <div class="meal-science-note">
          <strong>Fokus Nutrisi:</strong> ${meal.strategy}
        </div>
        <div class="meal-portion-headline">Contoh 1 Set Porsi Makan Utama (~${meal.estProtein}g Protein):</div>
        <ul class="meal-items-list">
          <li><strong>Karbohidrat:</strong> ${meal.carb}</li>
          <li><strong>Lauk Utama:</strong> ${meal.mainProtein}</li>
          <li><strong>Lauk Pendamping:</strong> ${meal.sideProtein}</li>
          <li><strong>Sayur & Buah:</strong> ${meal.veggieFruit}</li>
        </ul>
        <div class="meal-cook-tip">
          <strong>Cara Olah Sehat:</strong> ${meal.cookingMethod}
        </div>
      </div>
    </div>
  `;
}

function toggleDayMeal(idx, btnEl) {
  const box = document.getElementById(`dayMealBox-${idx}`);
  const arrow = document.getElementById(`mealArrow-${idx}`);
  if (!box) return;

  const isHidden = box.classList.contains('hidden');
  if (isHidden) {
    box.classList.remove('hidden');
    if (arrow) arrow.innerText = '▴';
    btnEl.classList.add('open');
  } else {
    box.classList.add('hidden');
    if (arrow) arrow.innerText = '▾';
    btnEl.classList.remove('open');
  }
}

// Helper: Hitung Target Repetisi/Detik Adaptif
function calcAdaptiveTarget(exId, baseVal, multiplier, bestRecordMap) {
  const exObj = EXERCISES_DATA.find(e => e.id === exId);
  const isTimer = exObj && exObj.mode === 'timer';
  let target = Math.round(baseVal * multiplier);

  if (bestRecordMap[exId] && bestRecordMap[exId] > 0) {
    target = Math.max(target, Math.ceil(bestRecordMap[exId] * 1.12));
  }

  return isTimer ? `${target} Detik` : `${target} Reps`;
}

// Susun Jadwal 7 Hari + Porsi Real Food Pasar Lokal Sesuai Latihan Per Hari
function buildAdaptiveDays(weakestCat, bmi, mult, bestMap, weight, targetCalories, targetProtein) {
  const highImpactCardio = bmi >= 27 ? 'mountainclimbers' : 'jumpingjack';
  const finisherCardio = bmi >= 27 ? 'plank' : 'burpees';

  // Skalakan takaran gram berdasarkan berat badan user (patokan 60 kg)
  const scale = Math.max(0.75, Math.min(1.5, weight / 60));
  const riceHigh = Math.round(210 * scale);   // Hari otot besar / kardio tinggi (~2 centong)
  const riceMed = Math.round(165 * scale);    // Hari upper body (~1.5 centong)
  const riceLow = Math.round(115 * scale);    // Hari istirahat / recovery (~1 centong)

  const fishGrams = Math.round(130 * scale);
  const chickenGrams = Math.round(110 * scale);
  const tempeGrams = Math.round(55 * scale);
  const tofuGrams = Math.round(80 * scale);
  const singleMealProt = Math.round(targetProtein / 3);

  const bonusDay = weakestCat === 'upper'
    ? {
        day: 'Sabtu (Hari 6)',
        focusTag: 'PRIORITAS UPPER BODY',
        title: 'Penguatan Tubuh Bagian Atas',
        exercises: [
          { id: 'pushup', name: 'Push-Up', sets: 3, targetText: calcAdaptiveTarget('pushup', 12, mult, bestMap), rest: 60 },
          { id: 'benchdips', name: 'Bench Dips', sets: 3, targetText: calcAdaptiveTarget('benchdips', 12, mult, bestMap), rest: 60 },
          { id: 'lateralraise', name: 'Lateral Raise', sets: 3, targetText: calcAdaptiveTarget('lateralraise', 15, mult, bestMap), rest: 45 }
        ],
        mealPlan: {
          carbLevel: 'Karbo Moderat',
          estProtein: singleMealProt,
          strategy: 'Kombinasi protein cepat & sedang untuk mengejar volume latihan otot atas.',
          carb: `${riceMed}g nasi putih/merah matang (± ${(riceMed / 100).toFixed(1)} centong) atau ${Math.round(riceMed * 1.4)}g singkong/ubi kukus.`,
          mainProtein: `${fishGrams}g ikan tongkol / cakalang segar (± 2 potong sedang, kaya protein & vitamin B12).`,
          sideProtein: `1 butir telur rebus utuh + ${tempeGrams}g tempe kukus (2 potong tipis, tanpa kecap manis).`,
          veggieFruit: `1 mangkuk tumis kangkung/sawi bawang putih + 1 potong pepaya segar (± 120g).`,
          cookingMethod: `Ikan tongkol dimasak bumbu kuning/kuah asam tanpa santan kental atau dibakar teflon; telur direbus matang.`
        }
      }
    : weakestCat === 'lower'
    ? {
        day: 'Sabtu (Hari 6)',
        focusTag: 'PRIORITAS LOWER BODY',
        title: 'Kekuatan & Stabilitas Kaki',
        exercises: [
          { id: 'squat', name: 'Squat', sets: 4, targetText: calcAdaptiveTarget('squat', 15, mult, bestMap), rest: 60 },
          { id: 'lunges', name: 'Lunges', sets: 3, targetText: calcAdaptiveTarget('lunges', 12, mult, bestMap), rest: 60 },
          { id: 'plank', name: 'Plank', sets: 2, targetText: calcAdaptiveTarget('plank', 35, mult, bestMap), rest: 45 }
        ],
        mealPlan: {
          carbLevel: 'Karbo Tinggi',
          estProtein: singleMealProt,
          strategy: 'Isi ulang glikogen otot paha & bokong dengan karbohidrat cukup + zat besi.',
          carb: `${riceHigh}g nasi matang (± ${(riceHigh / 100).toFixed(1)} centong) atau ${Math.round(riceHigh * 1.4)}g kentang rebus.`,
          mainProtein: `${chickenGrams}g paha/dada ayam tanpa kulit (ungkep bumbu rempah).`,
          sideProtein: `${tofuGrams}g tahu putih/kuning kukus + 1 pasang ati ampela ayam rebus (sumber zat besi & zinc).`,
          veggieFruit: `1 mangkuk sayur bayam/daun singkong rebus + 1 buah pisang kepok/raja.`,
          cookingMethod: `Ayam & ati ampela diungkep kunyit-bawang putih-ketumbar lalu dipanggang sebentar di teflon tanpa minyak banyak.`
        }
      }
    : {
        day: 'Sabtu (Hari 6)',
        focusTag: 'PRIORITAS CORE & CARDIO',
        title: 'Ketahanan Inti & Kardio',
        exercises: [
          { id: 'situp', name: 'Sit-Up', sets: 3, targetText: calcAdaptiveTarget('situp', 15, mult, bestMap), rest: 45 },
          { id: 'mountainclimbers', name: 'Mountain Climbers', sets: 3, targetText: calcAdaptiveTarget('mountainclimbers', 20, mult, bestMap), rest: 45 },
          { id: 'plank', name: 'Plank', sets: 3, targetText: calcAdaptiveTarget('plank', 40, mult, bestMap), rest: 60 }
        ],
        mealPlan: {
          carbLevel: 'Karbo Tinggi-Serat',
          estProtein: singleMealProt,
          strategy: 'Energi tahan lama untuk kardio & latihan perut tanpa bikin perut begah.',
          carb: `${riceMed}g nasi merah/putih matang (± ${(riceMed / 100).toFixed(1)} centong).`,
          mainProtein: `${fishGrams}g ikan lele / patin segar (1 ekor ukuran sedang-besar).`,
          sideProtein: `${tempeGrams}g tempe bakar/kukus (tanpa kecap) + 1 putih telur rebus.`,
          veggieFruit: `1 mangkuk bening oyong/bayam + 1 buah jambu biji merah / jeruk.`,
          cookingMethod: `Ikan lele/patin dibumbui bawang-kunyit-jeruk nipis lalu dipanggang teflon/air-fryer (hindari goreng minyak dalam).`
        }
      };

  return [
    {
      day: 'Senin (Hari 1)',
      focusTag: 'UPPER BODY PUSH',
      title: 'Dada, Bahu & Trisep',
      exercises: [
        { id: 'pushup', name: 'Push-Up', sets: 3, targetText: calcAdaptiveTarget('pushup', 12, mult, bestMap), rest: 60 },
        { id: 'pikepushup', name: 'Pike Push-Up', sets: 3, targetText: calcAdaptiveTarget('pikepushup', 10, mult, bestMap), rest: 60 },
        { id: 'benchdips', name: 'Bench Dips', sets: 3, targetText: calcAdaptiveTarget('benchdips', 12, mult, bestMap), rest: 60 }
      ],
      mealPlan: {
        carbLevel: 'Karbo Moderat',
        estProtein: singleMealProt,
        strategy: 'Tinggi leucine untuk memicu sintesis protein otot dada, bahu & trisep setelah Push-Up.',
        carb: `${riceMed}g nasi putih/merah matang (± ${(riceMed / 100).toFixed(1)} centong sedang).`,
        mainProtein: `${chickenGrams}g dada ayam tanpa kulit & lemak (sumber leucine paling padat).`,
        sideProtein: `${tempeGrams}g tempe (2–3 potong sedang, tanpa kecap manis).`,
        veggieFruit: `1 mangkuk buncis/sawi hijau rebus + 1 buah pisang ukuran sedang.`,
        cookingMethod: `Dada ayam diungkep bawang putih-jahe-kunyit lalu panggang teflon anti lengket; tempe dikukus atau dibakar tanpa kecap.`
      }
    },
    {
      day: 'Selasa (Hari 2)',
      focusTag: 'LOWER BODY',
      title: 'Paha, Glutes & Keseimbangan',
      exercises: [
        { id: 'squat', name: 'Squat', sets: 3, targetText: calcAdaptiveTarget('squat', 15, mult, bestMap), rest: 60 },
        { id: 'lunges', name: 'Lunges', sets: 3, targetText: calcAdaptiveTarget('lunges', 12, mult, bestMap), rest: 60 },
        { id: 'plank', name: 'Plank', sets: 2, targetText: calcAdaptiveTarget('plank', 30, mult, bestMap), rest: 45 }
      ],
      mealPlan: {
        carbLevel: 'Karbo Tinggi',
        estProtein: singleMealProt,
        strategy: 'Otot kaki menguras energi terbesar; butuh karbo lebih tinggi + zat besi & kolin.',
        carb: `${riceHigh}g nasi matang (± ${(riceHigh / 100).toFixed(1)} centong) atau ${Math.round(riceHigh * 1.4)}g kentang rebus.`,
        mainProtein: `2 butir telur ayam utuh + 1 pasang ati ampela ayam (pengganti daging sapi kaya zat besi & zinc).`,
        sideProtein: `${tofuGrams}g tahu putih/kuning (2 potong sedang).`,
        veggieFruit: `1 mangkuk sayur bayam/kangkung bening + 1 potong pepaya segar (± 120g).`,
        cookingMethod: `Telur direbus/orak-arik sedikit minyak kelapa; ati ampela direbus bumbu rempah tanpa santan; tahu dikukus/pepes.`
      }
    },
    {
      day: 'Rabu (Hari 3)',
      isRest: true,
      title: 'Istirahat & Peregangan Ringan',
      note: 'Fokus pemulihan otot, jalan santai 15–20 menit, dan hidrasi cukup.',
      mealPlan: {
        carbLevel: 'Karbo Rendah',
        estProtein: singleMealProt,
        strategy: 'Karbohidrat diturunkan karena tidak latihan berat, namun protein tetap tinggi agar otot terus tumbuh.',
        carb: `${riceLow}g nasi matang (± ${(riceLow / 100).toFixed(1)} centong) atau ${Math.round(riceLow * 1.5)}g ubi/kentang rebus.`,
        mainProtein: `3 butir telur ayam utuh (kuning telur meningkatkan respons pembentukan otot hingga ~40%).`,
        sideProtein: `${tofuGrams}g tahu putih/sutra + 1 gelas (± 200ml) susu UHT plain / susu kedelai tawar.`,
        veggieFruit: `1 mangkuk besar capcay sayur/sup bening + 1 buah jeruk atau jambu biji merah.`,
        cookingMethod: `Telur rebus setengah/matang penuh atau dadar sayur tipis di teflon; tahu dicampur ke dalam sup bening.`
      }
    },
    {
      day: 'Kamis (Hari 4)',
      focusTag: 'UPPER PULL & POSTURE',
      title: 'Punggung, Biseps & Grip',
      exercises: [
        { id: 'pullup', name: 'Pull-Up', sets: 3, targetText: calcAdaptiveTarget('pullup', 6, mult, bestMap), rest: 75 },
        { id: 'chinup', name: 'Chin-Up', sets: 3, targetText: calcAdaptiveTarget('chinup', 6, mult, bestMap), rest: 75 },
        { id: 'deadhang', name: 'Dead Hang', sets: 2, targetText: calcAdaptiveTarget('deadhang', 25, mult, bestMap), rest: 60 }
      ],
      mealPlan: {
        carbLevel: 'Karbo Moderat',
        estProtein: singleMealProt,
        strategy: 'Omega-3 tinggi dari ikan lokal untuk meredakan radang sendi siku/bahu setelah Pull-Up.',
        carb: `${riceMed}g nasi putih/merah matang (± ${(riceMed / 100).toFixed(1)} centong sedang).`,
        mainProtein: `${fishGrams}g ikan kembung lokal (1 ekor sedang — kandungan Omega-3 lebih tinggi dari salmon).`,
        sideProtein: `${tempeGrams}g tempe kukus/pepes (2 potong sedang, tanpa kecap manis).`,
        veggieFruit: `1 mangkuk tumis tauge & sawi hijau + 1 buah pisang ukuran sedang.`,
        cookingMethod: `Ikan kembung dipepes daun pisang, dikukus bumbu jahe-serai, atau dibakar teflon (hindari deep-fry minyak banyak).`
      }
    },
    {
      day: 'Jumat (Hari 5)',
      focusTag: 'CORE & CARDIO',
      title: 'Pembakaran Kalori & Otot Perut',
      exercises: [
        { id: highImpactCardio, name: EXERCISES_DATA.find(e => e.id === highImpactCardio).name, sets: 3, targetText: calcAdaptiveTarget(highImpactCardio, 20, mult, bestMap), rest: 45 },
        { id: 'situp', name: 'Sit-Up', sets: 3, targetText: calcAdaptiveTarget('situp', 15, mult, bestMap), rest: 45 },
        { id: finisherCardio, name: EXERCISES_DATA.find(e => e.id === finisherCardio).name, sets: 3, targetText: calcAdaptiveTarget(finisherCardio, 10, mult, bestMap), rest: 60 }
      ],
      mealPlan: {
        carbLevel: 'Karbo Tinggi',
        estProtein: singleMealProt,
        strategy: 'Kardio & Burpees membakar kalori cepat; butuh karbo bersih & elektrolit kalium.',
        carb: `${riceHigh}g nasi matang (± ${(riceHigh / 100).toFixed(1)} centong) atau ${Math.round(riceHigh * 1.4)}g kentang rebus.`,
        mainProtein: `${fishGrams}g ikan tongkol / patin / bandeng presto tanpa duri.`,
        sideProtein: `1 butir telur rebus utuh + ${tofuGrams}g tahu kukus.`,
        veggieFruit: `1 mangkuk sayur asem/bening labu siam + 1 potong semangka atau pepaya.`,
        cookingMethod: `Ikan dimasak kuah asam pedas segar tanpa santan atau dipanggang bumbu kunyit; bandeng dikukus/pepes.`
      }
    },
    bonusDay,
    {
      day: 'Minggu (Hari 7)',
      isRest: true,
      title: 'Full Rest & Evaluasi Mingguan',
      note: 'Catat perubahan berat & lingkar tubuh di tab Statistik untuk pembaruan target minggu depan.',
      mealPlan: {
        carbLevel: 'Karbo Rendah',
        estProtein: singleMealProt,
        strategy: 'Pemulihan menyeluruh & detoks pencernaan dengan serat tinggi dan protein bersih.',
        carb: `${riceLow}g nasi merah/putih matang (± ${(riceLow / 100).toFixed(1)} centong) atau 1 buah jagung rebus.`,
        mainProtein: `${chickenGrams}g dada/paha ayam tanpa kulit (suwir kuah soto bening tanpa santan).`,
        sideProtein: `${tempeGrams}g tempe kukus + ${tofuGrams}g tahu putih rebus.`,
        veggieFruit: `1 mangkuk besar lalapan/sayur rebus (kol, timun, kacang panjang) + 1 buah apel / pisang.`,
        cookingMethod: `Semua bahan direbus/dikukus dalam kuah kaldu ayam bening rempah (serai, daun salam, jahe) tanpa santan & tanpa gorengan.`
      }
    }
  ];
}

// Tombol "Latih ->" langsung membuka gerakan & rest timer di tab Latihan
function applyAIExerciseAndGo(exerciseId, recommendedRest) {
  const workoutNavBtn = document.querySelectorAll('.bottom-nav .nav-item')[0];
  switchTab('workout', workoutNavBtn);

  const allChip = document.querySelector('.filter-chips .chip');
  if (allChip) filterExercises('all', allChip);

  selectExercise(exerciseId);
  document.getElementById('restDurationInput').value = recommendedRest;

  const setupCard = document.getElementById('workoutSetupCard');
  if (setupCard) {
    setupCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}