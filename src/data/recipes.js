export const ingredients = {
  tomato: { id: "tomato", ar: "طماطم", latin: "ṭamāṭim", meaning: "tomat", emoji: "🍅" },
  cucumber: { id: "cucumber", ar: "خيار", latin: "khiyār", meaning: "mentimun", emoji: "🥒" },
  salt: { id: "salt", ar: "ملح", latin: "milḥ", meaning: "garam", emoji: "🧂" },
  egg: { id: "egg", ar: "بيضة", latin: "bayḍah", meaning: "telur", emoji: "🥚" },
  pepper: { id: "pepper", ar: "فلفل", latin: "filfil", meaning: "lada", emoji: "🌶️" },
  mint: { id: "mint", ar: "نعناع", latin: "naʿnāʿ", meaning: "daun mint", emoji: "🌿" },
  sugar: { id: "sugar", ar: "سكر", latin: "sukkar", meaning: "gula", emoji: "🍬" },
  water: { id: "water", ar: "ماء", latin: "māʾ", meaning: "air", emoji: "💧" },
  lemon: { id: "lemon", ar: "ليمون", latin: "laymūn", meaning: "lemon", emoji: "🍋" },
  honey: { id: "honey", ar: "عسل", latin: "ʿasal", meaning: "madu", emoji: "🍯" },
  milk: { id: "milk", ar: "حليب", latin: "ḥalīb", meaning: "susu", emoji: "🥛" },
  bread: { id: "bread", ar: "خبز", latin: "khubz", meaning: "roti", emoji: "🍞" },
};

const w = (ar, latin, meaning) => ({ ar, latin, meaning });

export const recipes = [
  {
    id: "salad",
    title: "Salad Ceria",
    arabicTitle: "سلطة",
    subtitle: "Potong dan campur sayuran",
    emoji: "🥗",
    station: "mangkuk",
    timeLimit: 100,
    ingredients: ["cucumber", "tomato", "salt", "egg", "lemon"],
    steps: [
      {
        arabic: "قطّع الخيار على اللوح",
        translation: "Potong mentimun di atas talenan.",
        words: [w("قطّع", "qaṭṭiʿ", "potonglah"), w("الخيار", "al-khiyār", "mentimun"), w("على", "ʿalā", "di atas"), w("اللوح", "al-lawḥ", "talenan")],
        ingredient: "cucumber", quantity: 1, target: "board",
        comment: "Ayo potong mentimunnya di talenan!",
        hint: "Cari mentimun 🥒, lalu letakkan di talenan."
      },
      {
        arabic: "ضع الخيار في الوعاء",
        translation: "Letakkan mentimun ke dalam mangkuk.",
        words: [w("ضع", "ḍaʿ", "letakkan"), w("الخيار", "al-khiyār", "mentimun"), w("في", "fī", "di dalam / ke dalam"), w("الوعاء", "al-wiʿāʾ", "wadah / mangkuk")],
        ingredient: "cucumber", quantity: 1, target: "vessel",
        comment: "Bagus! Masukkan mentimun ke mangkuk.",
        hint: "Ambil mentimun 🥒 dan masukkan ke mangkuk."
      },
      {
        arabic: "أضف الطماطم إلى الوعاء",
        translation: "Tambahkan tomat ke dalam mangkuk.",
        words: [w("أضف", "aḍif", "tambahkan"), w("الطماطم", "aṭ-ṭamāṭim", "tomat"), w("إلى", "ilā", "ke"), w("الوعاء", "al-wiʿāʾ", "wadah / mangkuk")],
        ingredient: "tomato", quantity: 1, target: "vessel",
        comment: "Saladnya mulai berwarna-warni!",
        hint: "Cari tomat 🍅, lalu masukkan ke mangkuk."
      },
      {
        arabic: "أضف الملح إلى السلطة",
        translation: "Tambahkan garam ke dalam salad.",
        words: [w("أضف", "aḍif", "tambahkan"), w("الملح", "al-milḥ", "garam"), w("إلى", "ilā", "ke"), w("السلطة", "as-salaṭah", "salad")],
        ingredient: "salt", quantity: 1, target: "vessel",
        comment: "Sedikit garam, lalu salad siap!",
        hint: "Cari garam 🧂 dan letakkan ke mangkuk."
      }
    ]
  },
  {
    id: "eggs",
    title: "Telur Goreng",
    arabicTitle: "بيض مقلي",
    subtitle: "Masak telur dengan hati-hati",
    emoji: "🍳",
    station: "wajan",
    timeLimit: 95,
    ingredients: ["egg", "salt", "pepper", "tomato", "milk"],
    steps: [
      {
        arabic: "ضع بيضتين في المقلاة",
        translation: "Letakkan dua telur ke dalam wajan.",
        words: [w("ضع", "ḍaʿ", "letakkan"), w("بيضتين", "bayḍatayn", "dua telur"), w("في", "fī", "di dalam / ke dalam"), w("المقلاة", "al-maqlāh", "wajan")],
        ingredient: "egg", quantity: 2, target: "vessel",
        comment: "Dua telur, satu per satu!",
        hint: "Ambil telur 🥚 sebanyak 2 kali dan masukkan ke wajan."
      },
      {
        arabic: "أضف الملح إلى البيض",
        translation: "Tambahkan garam ke telur.",
        words: [w("أضف", "aḍif", "tambahkan"), w("الملح", "al-milḥ", "garam"), w("إلى", "ilā", "ke"), w("البيض", "al-bayḍ", "telur")],
        ingredient: "salt", quantity: 1, target: "vessel",
        comment: "Tambahkan sedikit garam.",
        hint: "Cari garam 🧂 dan masukkan ke wajan."
      },
      {
        arabic: "ضع الفلفل على البيض",
        translation: "Letakkan lada di atas telur.",
        words: [w("ضع", "ḍaʿ", "letakkan"), w("الفلفل", "al-filfil", "lada"), w("على", "ʿalā", "di atas"), w("البيض", "al-bayḍ", "telur")],
        ingredient: "pepper", quantity: 1, target: "vessel",
        comment: "Sedikit lada membuatnya lebih sedap.",
        hint: "Cari lada 🌶️ dan letakkan ke wajan."
      }
    ]
  },
  {
    id: "mint-tea",
    title: "Teh Mint",
    arabicTitle: "شاي بالنعناع",
    subtitle: "Racik teh mint yang segar",
    emoji: "🫖",
    station: "panci",
    timeLimit: 105,
    ingredients: ["mint", "sugar", "water", "lemon", "honey", "salt"],
    steps: [
      {
        arabic: "ضع النعناع في الإبريق",
        translation: "Letakkan daun mint ke dalam teko.",
        words: [w("ضع", "ḍaʿ", "letakkan"), w("النعناع", "an-naʿnāʿ", "daun mint"), w("في", "fī", "di dalam / ke dalam"), w("الإبريق", "al-ibrīq", "teko")],
        ingredient: "mint", quantity: 1, target: "vessel",
        comment: "Daun mint dulu, koki kecil!",
        hint: "Cari daun mint 🌿 dan masukkan ke teko."
      },
      {
        arabic: "أضف ملعقتين من السكر",
        translation: "Tambahkan dua sendok gula.",
        words: [w("أضف", "aḍif", "tambahkan"), w("ملعقتين", "milʿaqatayn", "dua sendok"), w("من", "min", "dari / berupa"), w("السكر", "as-sukkar", "gula")],
        ingredient: "sugar", quantity: 2, target: "vessel",
        comment: "Dua sendok gula. Hitung, ya!",
        hint: "Ambil gula 🍬 sebanyak 2 kali."
      },
      {
        arabic: "اسكب الماء في الإبريق",
        translation: "Tuangkan air ke dalam teko.",
        words: [w("اسكب", "uskub", "tuangkan"), w("الماء", "al-māʾ", "air"), w("في", "fī", "ke dalam"), w("الإبريق", "al-ibrīq", "teko")],
        ingredient: "water", quantity: 1, target: "vessel",
        comment: "Tuangkan air dengan hati-hati.",
        hint: "Cari air 💧 dan masukkan ke teko."
      },
      {
        arabic: "أضف الليمون إلى الشاي",
        translation: "Tambahkan lemon ke dalam teh.",
        words: [w("أضف", "aḍif", "tambahkan"), w("الليمون", "al-laymūn", "lemon"), w("إلى", "ilā", "ke"), w("الشاي", "ash-shāy", "teh")],
        ingredient: "lemon", quantity: 1, target: "vessel",
        comment: "Segar sekali! Teh mint siap.",
        hint: "Cari lemon 🍋 dan masukkan ke teko."
      }
    ]
  }
];
