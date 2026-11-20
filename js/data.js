const EXERCISES_DATA = [
  // ==================== UPPER BODY (6 GERAKAN) ====================
  {
    id: 'pushup',
    name: 'Push-Up',
    category: 'upper',
    categoryLabel: 'UPPER BODY • DADA & TRISEP',
    mode: 'reps',
    modeLabel: 'Repetisi (Sudut Siku)',
    cameraTip: 'Sandarkan HP di lantai 1,5 - 2 meter dari posisi serong depan/samping agar bahu, siku, dan pergelangan tangan terlihat jelas.',
    steps: [
      {
        label: '1. Posisi Plank Lurus',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="32" cy="34" r="6" fill="#166b0e"/><line x1="38" y1="38" x2="105" y2="62" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/><line x1="45" y1="41" x2="45" y2="66" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        label: '2. Turun Siku ≤ 90° & Dorong',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="32" cy="50" r="6" fill="#166b0e"/><line x1="38" y1="53" x2="105" y2="64" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/><polyline points="45,54 36,61 45,66" fill="none" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'pullup',
    name: 'Pull-Up',
    category: 'upper',
    categoryLabel: 'UPPER BODY • PUNGGUNG & LATS',
    mode: 'reps',
    modeLabel: 'Repetisi (Palang)',
    cameraTip: 'Posisikan HP sejauh 2,5 - 3 meter menghadap palang agar posisi menggantung penuh dan dagu melewati palang masuk layar.',
    steps: [
      {
        label: '1. Gantung Lengan Lurus',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="10" x2="110" y2="10" stroke="#475569" stroke-width="3"/><circle cx="70" cy="30" r="5" fill="#166b0e"/><line x1="70" y1="36" x2="70" y2="58" stroke="#166b0e" stroke-width="4"/><polyline points="56,10 62,25 70,38 78,25 84,10" fill="none" stroke="#94bf4e" stroke-width="3"/></svg>`
      },
      {
        label: '2. Tarik Dagu Lewati Palang',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="14" x2="110" y2="14" stroke="#475569" stroke-width="3"/><circle cx="70" cy="11" r="5" fill="#166b0e"/><line x1="70" y1="18" x2="70" y2="44" stroke="#166b0e" stroke-width="4"/><polyline points="54,14 52,26 70,22 88,26 86,14" fill="none" stroke="#94bf4e" stroke-width="3"/></svg>`
      }
    ]
  },
  {
    id: 'pikepushup',
    name: 'Pike Push-Up',
    category: 'upper',
    categoryLabel: 'UPPER BODY • BAHU & TRISEP',
    mode: 'reps',
    modeLabel: 'Repetisi (Sudut Siku)',
    cameraTip: 'Posisikan kamera dari arah samping. Angkat pinggul membentuk huruf V terbalik, lalu tekuk siku turunkan kepala ke arah lantai.',
    steps: [
      {
        label: '1. Angkat Pinggul Bentuk V Terbalik',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="38" cy="48" r="5" fill="#166b0e"/><polyline points="42,66 44,44 74,22 104,66" fill="none" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        label: '2. Tekuk Siku Turunkan Kepala',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="34" cy="58" r="5" fill="#94bf4e"/><polyline points="42,66 35,56 74,26 104,66" fill="none" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'lateralraise',
    name: 'Lateral Raise',
    category: 'upper',
    categoryLabel: 'UPPER BODY • BAHU SAMPING',
    mode: 'reps',
    modeLabel: 'Repetisi (Angkat Lengan)',
    cameraTip: 'Berdiri menghadap kamera (bisa pakai dumbbell atau botol air penuh). Angkat kedua lengan ke samping hingga sejajar bahu.',
    steps: [
      {
        label: '1. Berdiri Tangan di Samping Badan',
        svg: `<svg viewBox="0 0 140 80"><circle cx="70" cy="14" r="5" fill="#166b0e"/><line x1="70" y1="20" x2="70" y2="54" stroke="#166b0e" stroke-width="4"/><line x1="60" y1="24" x2="58" y2="48" stroke="#94bf4e" stroke-width="3.5"/><line x1="80" y1="24" x2="82" y2="48" stroke="#94bf4e" stroke-width="3.5"/></svg>`
      },
      {
        label: '2. Angkat Lengan Sejajar Bahu (T)',
        svg: `<svg viewBox="0 0 140 80"><circle cx="70" cy="14" r="5" fill="#166b0e"/><line x1="70" y1="20" x2="70" y2="54" stroke="#166b0e" stroke-width="4"/><line x1="42" y1="24" x2="98" y2="24" stroke="#94bf4e" stroke-width="3.5" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'chinup',
    name: 'Chin-Up',
    category: 'upper',
    categoryLabel: 'UPPER BODY • BISEP & PUNGGUNG',
    mode: 'reps',
    modeLabel: 'Repetisi (Palang)',
    cameraTip: 'Genggam palang dengan telapak tangan menghadap ke arah wajah (underhand grip). Posisikan HP 2,5 - 3 meter dari palang.',
    steps: [
      {
        label: '1. Gantung Telapak Menghadap Diri',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="10" x2="110" y2="10" stroke="#475569" stroke-width="3"/><circle cx="70" cy="30" r="5" fill="#94bf4e"/><line x1="70" y1="36" x2="70" y2="58" stroke="#166b0e" stroke-width="4"/><polyline points="60,10 64,25 70,38 76,25 80,10" fill="none" stroke="#166b0e" stroke-width="3"/></svg>`
      },
      {
        label: '2. Tarik Tubuh Fokus pada Bisep',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="14" x2="110" y2="14" stroke="#475569" stroke-width="3"/><circle cx="70" cy="11" r="5" fill="#94bf4e"/><line x1="70" y1="18" x2="70" y2="44" stroke="#166b0e" stroke-width="4"/><polyline points="58,14 58,26 70,22 82,26 82,14" fill="none" stroke="#166b0e" stroke-width="3"/></svg>`
      }
    ]
  },
  {
    id: 'benchdips',
    name: 'Bench Dips',
    category: 'upper',
    categoryLabel: 'UPPER BODY • TRISEP & DADA',
    mode: 'reps',
    modeLabel: 'Repetisi (Sudut Siku)',
    cameraTip: 'Tumpu kedua tangan di tepi kursi/bangku kokoh di belakangmu. Posisikan kamera dari arah samping agar tekukan siku terlihat jelas.',
    steps: [
      {
        label: '1. Tumpu Tangan di Kursi, Lengan Lurus',
        svg: `<svg viewBox="0 0 140 80"><rect x="24" y="42" width="24" height="26" fill="#94a3b8"/><circle cx="56" cy="24" r="5" fill="#166b0e"/><polyline points="44,42 54,32 58,48 92,48 102,68" fill="none" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        label: '2. Turunkan Pinggul (Siku 90°) & Dorong',
        svg: `<svg viewBox="0 0 140 80"><rect x="24" y="42" width="24" height="26" fill="#94a3b8"/><circle cx="56" cy="36" r="5" fill="#94bf4e"/><polyline points="44,42 48,50 58,60 92,56 102,68" fill="none" stroke="#166b0e" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'deadhang',
    name: 'Dead Hang',
    category: 'upper',
    categoryLabel: 'UPPER BODY • GRIP & BAHU',
    mode: 'timer',
    modeLabel: 'Timer Otomatis (Detik)',
    cameraTip: 'Timer berjalan otomatis selama kedua tangan memegang palang di atas kepala dan kaki menggantung.',
    steps: [
      {
        label: '1. Genggam Palang Selebar Bahu',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="10" x2="110" y2="10" stroke="#475569" stroke-width="3"/><circle cx="70" cy="28" r="5" fill="#166b0e"/><line x1="58" y1="10" x2="64" y2="34" stroke="#94bf4e" stroke-width="3"/><line x1="82" y1="10" x2="76" y2="34" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="34" x2="70" y2="68" stroke="#166b0e" stroke-width="4"/></svg>`
      },
      {
        label: '2. Tahan Tubuh Rileks Lurus',
        svg: `<svg viewBox="0 0 140 80"><line x1="30" y1="10" x2="110" y2="10" stroke="#475569" stroke-width="3"/><circle cx="70" cy="28" r="5" fill="#94bf4e"/><line x1="70" y1="34" x2="70" y2="70" stroke="#166b0e" stroke-width="4"/><text x="95" y="45" fill="#166b0e" font-size="11" font-weight="bold">TIMER</text></svg>`
      }
    ]
  },

  // ==================== LOWER BODY (2 GERAKAN) ====================
  {
    id: 'squat',
    name: 'Squat',
    category: 'lower',
    categoryLabel: 'LOWER BODY • PAHA & GLUTES',
    mode: 'reps',
    modeLabel: 'Repetisi (Sudut Lutut)',
    cameraTip: 'Berdiri 2 meter dari kamera dari arah serong samping agar pinggul, lutut, dan pergelangan kaki terlihat penuh.',
    steps: [
      {
        label: '1. Berdiri Tegak Selebar Bahu',
        svg: `<svg viewBox="0 0 140 80"><line x1="20" y1="72" x2="120" y2="72" stroke="#94a3b8" stroke-width="2"/><circle cx="70" cy="14" r="5" fill="#166b0e"/><line x1="70" y1="20" x2="70" y2="44" stroke="#166b0e" stroke-width="4"/><line x1="70" y1="44" x2="70" y2="70" stroke="#94bf4e" stroke-width="4"/></svg>`
      },
      {
        label: '2. Turunkan Pinggul (Lutut ≤ 95°)',
        svg: `<svg viewBox="0 0 140 80"><line x1="20" y1="72" x2="120" y2="72" stroke="#94a3b8" stroke-width="2"/><circle cx="75" cy="28" r="5" fill="#166b0e"/><polyline points="75,34 60,52 78,54 74,70" fill="none" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'lower',
    categoryLabel: 'LOWER BODY • PAHA & KESEIMBANGAN',
    mode: 'reps',
    modeLabel: 'Repetisi (Lutut 90°)',
    cameraTip: 'Posisikan tubuh menyamping atau serong terhadap kamera agar langkah kaki depan dan lutut belakang terdeteksi akurat.',
    steps: [
      {
        label: '1. Langkahkan Satu Kaki ke Depan',
        svg: `<svg viewBox="0 0 140 80"><line x1="20" y1="72" x2="120" y2="72" stroke="#94a3b8" stroke-width="2"/><circle cx="70" cy="16" r="5" fill="#166b0e"/><line x1="70" y1="22" x2="70" y2="44" stroke="#166b0e" stroke-width="4"/><polyline points="54,70 70,44 86,70" fill="none" stroke="#94bf4e" stroke-width="3.5"/></svg>`
      },
      {
        label: '2. Tekuk Kedua Lutut Mendekati 90°',
        svg: `<svg viewBox="0 0 140 80"><line x1="20" y1="72" x2="120" y2="72" stroke="#94a3b8" stroke-width="2"/><circle cx="70" cy="26" r="5" fill="#166b0e"/><line x1="70" y1="32" x2="70" y2="50" stroke="#166b0e" stroke-width="4"/><polyline points="46,70 56,64 70,50 88,52 88,70" fill="none" stroke="#94bf4e" stroke-width="3.5"/></svg>`
      }
    ]
  },

  // ==================== CORE & CARDIO (5 GERAKAN) ====================
  {
    id: 'situp',
    name: 'Sit-Up',
    category: 'core',
    categoryLabel: 'CORE • OTOT PERUT',
    mode: 'reps',
    modeLabel: 'Repetisi (Sudut Pinggul)',
    cameraTip: 'Letakkan kamera di samping matras agar bahu, pinggul, dan lutut yang ditekuk terlihat dari samping.',
    steps: [
      {
        label: '1. Berbaring Lutut Ditekuk',
        svg: `<svg viewBox="0 0 140 80"><line x1="15" y1="68" x2="125" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="28" cy="60" r="5" fill="#166b0e"/><polyline points="34,63 72,63 92,44 108,66" fill="none" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        label: '2. Angkat Punggung ke Arah Lutut',
        svg: `<svg viewBox="0 0 140 80"><line x1="15" y1="68" x2="125" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="58" cy="34" r="5" fill="#166b0e"/><polyline points="60,40 72,63 92,44 108,66" fill="none" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    categoryLabel: 'CORE STABILITY',
    mode: 'timer',
    modeLabel: 'Timer Otomatis (Detik)',
    cameraTip: 'Posisikan kamera dari samping. Timer berjalan otomatis selama punggung dan pinggul berada dalam garis lurus.',
    steps: [
      {
        label: '1. Tumpu Lengan Bawah di Lantai',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="30" cy="46" r="5" fill="#166b0e"/><polyline points="35,66 46,66 44,50 112,64" fill="none" stroke="#94bf4e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        label: '2. Tahan Pinggul Sejajar Bahu',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="30" cy="46" r="5" fill="#94bf4e"/><line x1="36" y1="49" x2="114" y2="64" stroke="#166b0e" stroke-width="4"/><text x="72" y="36" fill="#166b0e" font-size="11" font-weight="bold">TIMER</text></svg>`
      }
    ]
  },
  {
    id: 'mountainclimbers',
    name: 'Mountain Climbers',
    category: 'core',
    categoryLabel: 'CORE & CARDIO',
    mode: 'reps',
    modeLabel: 'Repetisi (Tarikan Lutut)',
    cameraTip: 'Posisikan kamera dari arah samping agar gerakan lutut yang ditarik bergantian ke arah dada terdeteksi jelas.',
    steps: [
      {
        label: '1. Mulai dari Posisi High Plank',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="32" cy="34" r="5" fill="#166b0e"/><line x1="38" y1="38" x2="108" y2="64" stroke="#166b0e" stroke-width="4"/><line x1="44" y1="41" x2="44" y2="66" stroke="#94bf4e" stroke-width="3.5"/></svg>`
      },
      {
        label: '2. Tarik Lutut ke Dada Bergantian',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="32" cy="34" r="5" fill="#166b0e"/><line x1="38" y1="38" x2="108" y2="64" stroke="#166b0e" stroke-width="4"/><polyline points="74,51 56,55 62,65" fill="none" stroke="#94bf4e" stroke-width="3.5"/></svg>`
      }
    ]
  },
  {
    id: 'jumpingjack',
    name: 'Jumping Jacks',
    category: 'core',
    categoryLabel: 'CARDIO FULL BODY',
    mode: 'reps',
    modeLabel: 'Repetisi (Bukaan Lengan)',
    cameraTip: 'Berdiri menghadap lurus ke kamera dari jarak 2 - 2,5 meter agar ujung tangan di atas kepala dan kaki masuk frame.',
    steps: [
      {
        label: '1. Berdiri Rapat Tangan di Samping',
        svg: `<svg viewBox="0 0 140 80"><circle cx="70" cy="14" r="5" fill="#166b0e"/><line x1="70" y1="20" x2="70" y2="46" stroke="#166b0e" stroke-width="4"/><line x1="62" y1="24" x2="60" y2="44" stroke="#94bf4e" stroke-width="3"/><line x1="78" y1="24" x2="80" y2="44" stroke="#94bf4e" stroke-width="3"/><line x1="67" y1="46" x2="67" y2="70" stroke="#166b0e" stroke-width="3"/><line x1="73" y1="46" x2="73" y2="70" stroke="#166b0e" stroke-width="3"/></svg>`
      },
      {
        label: '2. Lompat Buka Kaki & Tepuk di Atas',
        svg: `<svg viewBox="0 0 140 80"><circle cx="70" cy="16" r="5" fill="#166b0e"/><line x1="70" y1="22" x2="70" y2="46" stroke="#166b0e" stroke-width="4"/><line x1="70" y1="24" x2="54" y2="8" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="24" x2="86" y2="8" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="46" x2="54" y2="70" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="46" x2="86" y2="70" stroke="#94bf4e" stroke-width="3"/></svg>`
      }
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'core',
    categoryLabel: 'FULL BODY HIIT',
    mode: 'reps',
    modeLabel: 'Repetisi (Transisi Penuh)',
    cameraTip: 'Posisikan kamera agak jauh (2,5 meter) serong samping agar posisi berdiri tegak maupun posisi plank di lantai terlihat.',
    steps: [
      {
        label: '1. Turun ke Posisi Plank di Lantai',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="30" cy="40" r="5" fill="#166b0e"/><line x1="36" y1="44" x2="104" y2="65" stroke="#94bf4e" stroke-width="4"/><line x1="42" y1="46" x2="42" y2="66" stroke="#166b0e" stroke-width="3"/></svg>`
      },
      {
        label: '2. Lompat Berdiri & Angkat Tangan',
        svg: `<svg viewBox="0 0 140 80"><line x1="10" y1="68" x2="130" y2="68" stroke="#94a3b8" stroke-width="2"/><circle cx="70" cy="14" r="5" fill="#166b0e"/><line x1="70" y1="20" x2="70" y2="44" stroke="#166b0e" stroke-width="4"/><line x1="70" y1="22" x2="58" y2="6" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="22" x2="82" y2="6" stroke="#94bf4e" stroke-width="3"/><line x1="70" y1="44" x2="66" y2="62" stroke="#166b0e" stroke-width="3"/><line x1="70" y1="44" x2="74" y2="62" stroke="#166b0e" stroke-width="3"/></svg>`
      }
    ]
  }
];