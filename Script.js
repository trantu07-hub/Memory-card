"use strict";

/* =========================================================
   Memory Card Game - JavaScript thuần
   ========================================================= */

const EMOJIS = ["🍎", "🚀", "🐱", "🎲", "🌈", "🎸", "🍕", "🦊", "🌻", "⚡", "🐳", "🍩"];
const CUSTOM_DEFAULT_EMOJIS = [
  ...EMOJIS, "🐶", "🐼", "🐸", "🦁", "🐵", "🐧", "🦋", "🌷", "🍉", "🍓",
  "🥑", "🍔", "⚽", "🎨", "🎁", "🚗", "✈️", "🌙", "⭐", "🔥", "💎", "🎈",
  "🧸", "🍀", "🌍", "🐢", "🐰", "🦄"
];

const MODES = {
  easy:   { pairs: 4,  label: "Dễ" },
  medium: { pairs: 8,  label: "Vừa" },
  hard:   { pairs: 12, label: "Khó" },
  custom: { pairs: 4, label: "Tùy chỉnh" }
};

const MISMATCH_DELAY = 800;   // ms trước khi úp lại 2 thẻ khác nhau
const WIN_DELAY = 700;        // ms chờ hiệu ứng ghép đúng trước khi hiện màn thắng
const STORAGE_KEY = "memory-card-best-v1";
const MAX_CUSTOM_PAIRS = 30;
const MAX_CUSTOM_IMAGES = 60;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_IMAGE_SIZE = 30 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const VOCAB_DECKS_KEY = "memory-card-vocabulary-decks-v1";
const VOCAB_BEST_KEY = "memory-card-vocabulary-best-v1";
const VOCAB_IMAGE_DB = "memory-card-vocabulary-images";
const VOCAB_IMAGE_STORE = "images";
const VOCAB_MISMATCH_DELAY = 600;
const VOCAB_TOPICS = {
  animals: {
    label: "Animals",
    words: [
      ["cat", "Con mèo", "🐱"], ["dog", "Con chó", "🐶"], ["elephant", "Con voi", "🐘"],
      ["giraffe", "Hươu cao cổ", "🦒"], ["rabbit", "Con thỏ", "🐰"], ["turtle", "Con rùa", "🐢"],
      ["dolphin", "Cá heo", "🐬"], ["penguin", "Chim cánh cụt", "🐧"], ["butterfly", "Con bướm", "🦋"],
      ["monkey", "Con khỉ", "🐵"], ["lion", "Sư tử", "🦁"], ["fox", "Con cáo", "🦊"]
    ]
  },
  food: {
    label: "Food & Drinks",
    words: [
      ["apple", "Quả táo", "🍎"], ["bread", "Bánh mì", "🍞"], ["cheese", "Phô mai", "🧀"],
      ["egg", "Quả trứng", "🥚"], ["rice", "Cơm; gạo", "🍚"], ["noodles", "Mì", "🍜"],
      ["milk", "Sữa", "🥛"], ["coffee", "Cà phê", "☕"], ["orange", "Quả cam", "🍊"],
      ["strawberry", "Quả dâu tây", "🍓"], ["watermelon", "Dưa hấu", "🍉"], ["sandwich", "Bánh mì kẹp", "🥪"]
    ]
  },
  nature: {
    label: "Nature",
    words: [
      ["tree", "Cái cây", "🌳"], ["flower", "Bông hoa", "🌼"], ["river", "Con sông", "🏞️"],
      ["mountain", "Ngọn núi", "⛰️"], ["cloud", "Đám mây", "☁️"], ["rain", "Mưa", "🌧️"],
      ["sun", "Mặt trời", "☀️"], ["moon", "Mặt trăng", "🌙"], ["star", "Ngôi sao", "⭐"],
      ["forest", "Khu rừng", "🌲"], ["beach", "Bãi biển", "🏖️"], ["rainbow", "Cầu vồng", "🌈"]
    ]
  },
  objects: {
    label: "Objects",
    words: [
      ["book", "Quyển sách", "📚"], ["chair", "Cái ghế", "🪑"], ["table", "Cái bàn", "🪵"],
      ["key", "Chìa khóa", "🔑"], ["clock", "Đồng hồ", "🕒"], ["umbrella", "Cái ô", "☂️"],
      ["bottle", "Cái chai", "🧴"], ["cup", "Cái cốc", "☕"], ["pencil", "Bút chì", "✏️"],
      ["bag", "Cái túi", "🎒"], ["window", "Cửa sổ", "🪟"], ["lamp", "Đèn bàn", "💡"]
    ]
  },
  transport: {
    label: "Transportation",
    words: [
      ["car", "Ô tô", "🚗"], ["bus", "Xe buýt", "🚌"], ["bicycle", "Xe đạp", "🚲"],
      ["train", "Tàu hỏa", "🚆"], ["airplane", "Máy bay", "✈️"], ["boat", "Thuyền", "⛵"],
      ["motorcycle", "Xe máy", "🏍️"], ["truck", "Xe tải", "🚚"], ["taxi", "Xe taxi", "🚕"],
      ["helicopter", "Trực thăng", "🚁"], ["subway", "Tàu điện ngầm", "🚇"], ["scooter", "Xe tay ga", "🛵"]
    ]
  },
  body: {
    label: "Human Body",
    words: [
      ["head", "Đầu", "🙂"], ["eye", "Mắt", "👁️"], ["ear", "Tai", "👂"],
      ["nose", "Mũi", "👃"], ["mouth", "Miệng", "👄"], ["hand", "Bàn tay", "✋"],
      ["foot", "Bàn chân", "🦶"], ["heart", "Trái tim", "❤️"], ["tooth", "Răng", "🦷"],
      ["hair", "Tóc", "💇"], ["shoulder", "Vai", "💪"], ["knee", "Đầu gối", "🦵"]
    ]
  },
  technology: {
    label: "Technology",
    words: [
      ["computer", "Máy tính", "💻"], ["phone", "Điện thoại", "📱"], ["keyboard", "Bàn phím", "⌨️"],
      ["camera", "Máy ảnh", "📷"], ["headphones", "Tai nghe", "🎧"], ["robot", "Người máy", "🤖"],
      ["screen", "Màn hình", "🖥️"], ["printer", "Máy in", "🖨️"], ["mouse", "Chuột máy tính", "🖱️"],
      ["tablet", "Máy tính bảng", "📲"], ["battery", "Pin", "🔋"], ["microphone", "Micrô", "🎙️"]
    ]
  },
  daily: {
    label: "Daily Activities",
    words: [
      ["wake up", "Thức dậy", "⏰"], ["eat", "Ăn", "🍽️"], ["drink", "Uống", "🥤"],
      ["read", "Đọc", "📖"], ["write", "Viết", "✍️"], ["sleep", "Ngủ", "😴"],
      ["walk", "Đi bộ", "🚶"], ["run", "Chạy", "🏃"], ["cook", "Nấu ăn", "🍳"],
      ["wash", "Rửa", "🧼"], ["study", "Học", "📚"], ["play", "Chơi", "🎲"]
    ]
  }
};

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);

const menuScreen = $("menu-screen");
const gameScreen = $("game-screen");
const boardEl = $("board");
const winOverlay = $("win-overlay");
const modeButtons = document.querySelectorAll(".mode");
const startButton = $("start-btn");
const customSettings = $("custom-settings");
const customPairsInput = $("custom-pairs");
const customFilesInput = $("custom-files");
const customImageCount = $("custom-image-count");
const customMessage = $("custom-message");
const customError = $("custom-error");
const customPreview = $("custom-preview");
const customStartButton = $("custom-start-btn");

const statMoves = $("stat-moves");
const statTime = $("stat-time");
const statPairs = $("stat-pairs");
const statAccuracy = $("stat-accuracy");
const gameModeChoices = document.querySelectorAll("[data-game-mode]");
const classicModeSettings = $("classic-mode-settings");
const vocabularySettings = $("vocabulary-settings");
const vocabSourceButtons = document.querySelectorAll("[data-vocab-source]");
const randomVocabPanel = $("random-vocab-panel");
const customVocabPanel = $("custom-vocab-panel");
const vocabTopicSelect = $("vocab-topic");
const vocabDifficultySelect = $("vocab-difficulty");
const vocabCountInput = $("vocab-count");
const vocabDeckSelect = $("vocab-deck-select");
const vocabWordList = $("vocab-word-list");
const vocabImageInput = $("vocab-image");
const vocabImagePreview = $("vocab-image-preview");
const vocabularyForm = $("vocabulary-form");
const vocabularyGameScreen = $("vocabulary-game-screen");
const vocabularyWinOverlay = $("vocab-win-overlay");
const englishWordCards = $("english-word-cards");
const vietnameseMeaningCards = $("vietnamese-meaning-cards");
const vocabGameFeedback = $("vocab-game-feedback");
const vocabStorageStatus = $("vocab-storage-status");

/* ---------- Trạng thái ---------- */
const state = {
  gameType: "classic",
  mode: "easy",
  firstCard: null,
  secondCard: null,
  locked: false,        // true khi đang chờ úp thẻ hoặc game đã kết thúc
  moves: 0,
  matchedPairs: 0,
  totalPairs: 0,
  timerId: null,
  startTime: 0,
  elapsed: 0,           // giây
  mismatchTimeout: null,
  winTimeout: null,
  customImages: [],
  nextImageId: 1,
  vocabSource: "random",
  vocabDecks: [],
  selectedVocabDeckId: "",
  editingVocabWordId: null,
  pendingVocabImage: null,
  removeExistingVocabImage: false,
  vocabImageDb: null,
  vocabObjectUrls: new Map(),
  vocabRenderToken: 0,
  vocabPreviewToken: 0,
  vocabGame: {
    words: [],
    selectedEnglishId: null,
    locked: false,
    attempts: 0,
    correctMatches: 0,
    timerId: null,
    startTime: 0,
    elapsed: 0,
    mismatchTimeout: null,
    winTimeout: null,
    bestKey: "",
    deckName: "",
    starting: false
  }
};

/* ---------- Tiện ích ---------- */
function shuffle(array) {
  // Fisher–Yates
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function getAccuracy() {
  return state.moves === 0 ? 0 : Math.round((state.matchedPairs / state.moves) * 100);
}

/* ---------- LocalStorage ---------- */
function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveBest(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* LocalStorage bị chặn: bỏ qua, game vẫn chạy bình thường */
  }
}

// Thành tích tốt hơn = ít lượt hơn; nếu bằng lượt thì thời gian ngắn hơn
function isBetter(a, b) {
  if (!b) return true;
  return a.moves < b.moves || (a.moves === b.moves && a.time < b.time);
}

function renderBest() {
  const best = loadBest();
  document.querySelectorAll("[data-best]").forEach((el) => {
    const record = best[el.dataset.best];
    el.textContent = record
      ? `Tốt nhất: ${record.moves} lượt · ${formatTime(record.time)}`
      : "Chưa có kỷ lục";
  });
}

function getCustomPairCount() {
  const pairs = customPairsInput.valueAsNumber;
  return Number.isInteger(pairs) && pairs >= 2 && pairs <= MAX_CUSTOM_PAIRS ? pairs : null;
}

function updateCustomSettings() {
  const pairs = getCustomPairCount();
  const imageCount = state.customImages.length;
  const totalSize = state.customImages.reduce((sum, image) => sum + image.file.size, 0);
  const defaultCount = pairs === null ? 0 : Math.max(0, pairs - imageCount);

  customImageCount.textContent =
    `Đã chọn ${imageCount}/${MAX_CUSTOM_IMAGES} ảnh (${(totalSize / (1024 * 1024)).toFixed(1)} / 30 MB).`;
  customMessage.textContent = pairs === null
    ? `Chọn từ 2 đến ${MAX_CUSTOM_PAIRS} cặp thẻ.`
    : `Bạn chọn ${pairs} cặp và đã tải ${imageCount} ảnh. ${defaultCount} emoji mặc định sẽ được thêm.`;
  customError.textContent = pairs === null
    ? `Số cặp phải là số nguyên từ 2 đến ${MAX_CUSTOM_PAIRS}.`
    : "";
  customStartButton.disabled = pairs === null;

  customPreview.replaceChildren();
  state.customImages.forEach((image) => {
    const item = document.createElement("li");
    item.className = "custom-preview-item";

    const preview = document.createElement("img");
    preview.src = image.url;
    preview.alt = "";

    const name = document.createElement("p");
    name.className = "custom-preview-name";
    name.textContent = image.name;
    name.title = image.name;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-ghost custom-remove-btn";
    removeButton.textContent = "Xóa ảnh";
    removeButton.setAttribute("aria-label", `Xóa ảnh ${image.name}`);
    removeButton.addEventListener("click", () => removeCustomImage(image.id));

    item.append(preview, name, removeButton);
    customPreview.append(item);
  });
}

function removeCustomImage(imageId) {
  const imageIndex = state.customImages.findIndex((image) => image.id === imageId);
  if (imageIndex === -1) return;

  const [image] = state.customImages.splice(imageIndex, 1);
  URL.revokeObjectURL(image.url);
  updateCustomSettings();
}

function clearCustomImages() {
  state.customImages.forEach((image) => URL.revokeObjectURL(image.url));
  state.customImages = [];
  updateCustomSettings();
}

function handleCustomFilesChange() {
  const errors = [];
  const files = Array.from(customFilesInput.files || []);

  files.forEach((file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    const validFormat = ACCEPTED_IMAGE_EXTENSIONS.has(extension)
      && (!file.type || ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase()));
    if (!validFormat) {
      errors.push(`${file.name}: chỉ hỗ trợ JPG, PNG hoặc WEBP.`);
      return;
    }
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      errors.push(`${file.name}: ảnh phải lớn hơn 0 và không quá 5 MB.`);
      return;
    }
    const totalSize = state.customImages.reduce((sum, image) => sum + image.file.size, 0);
    if (totalSize + file.size > MAX_TOTAL_IMAGE_SIZE) {
      errors.push(`${file.name}: tổng dung lượng ảnh không được vượt quá 30 MB.`);
      return;
    }
    if (state.customImages.length >= MAX_CUSTOM_IMAGES) {
      errors.push(`Chỉ có thể chọn tối đa ${MAX_CUSTOM_IMAGES} ảnh.`);
      return;
    }

    state.customImages.push({
      id: state.nextImageId++,
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    });
  });

  customError.textContent = errors.join(" ");
  customFilesInput.value = "";
  updateCustomSettings();
  if (errors.length) customError.textContent = errors.join(" ");
}

/* ---------- Vocabulary storage and editor ---------- */
function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadVocabularyDecks() {
  try {
    const stored = JSON.parse(localStorage.getItem(VOCAB_DECKS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((deck) => deck && typeof deck.id === "string" && typeof deck.name === "string"
      && Array.isArray(deck.words)).map((deck) => ({
      id: deck.id,
      name: deck.name.slice(0, 60),
      words: deck.words.filter((word) => word && typeof word.id === "string"
        && typeof word.english === "string" && typeof word.meaning === "string")
        .map((word) => ({
          id: word.id,
          english: word.english,
          meaning: word.meaning,
          imageId: typeof word.imageId === "string" ? word.imageId : null
        }))
    }));
  } catch (error) {
    $("vocab-manager-error").textContent = "Không đọc được dữ liệu bộ từ đã lưu. Có thể xóa hoặc tạo bộ từ mới.";
    return [];
  }
}

function saveVocabularyDecks() {
  try {
    localStorage.setItem(VOCAB_DECKS_KEY, JSON.stringify(state.vocabDecks));
    vocabStorageStatus.textContent = "Đã lưu bộ từ trên thiết bị này.";
    return true;
  } catch (error) {
    vocabStorageStatus.textContent = "Không lưu được bộ từ. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.";
    return false;
  }
}

function openVocabularyImageDb() {
  if (state.vocabImageDb) return Promise.resolve(state.vocabImageDb);
  if (!("indexedDB" in window)) return Promise.reject(new Error("Trình duyệt không hỗ trợ IndexedDB."));

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(VOCAB_IMAGE_DB, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(VOCAB_IMAGE_STORE)) {
        database.createObjectStore(VOCAB_IMAGE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      state.vocabImageDb = request.result;
      state.vocabImageDb.onversionchange = () => state.vocabImageDb.close();
      resolve(state.vocabImageDb);
    };
    request.onerror = () => reject(request.error || new Error("Không thể mở kho ảnh."));
    request.onblocked = () => reject(new Error("Kho ảnh đang được dùng ở cửa sổ khác. Hãy tải lại trang đó."));
  });
}

function storeVocabularyImage(file) {
  return openVocabularyImageDb().then((database) => new Promise((resolve, reject) => {
    const id = createId("vocab-image");
    const transaction = database.transaction(VOCAB_IMAGE_STORE, "readwrite");
    transaction.objectStore(VOCAB_IMAGE_STORE).put({ id, blob: file });
    transaction.oncomplete = () => resolve(id);
    transaction.onerror = () => reject(transaction.error || new Error("Không thể lưu ảnh."));
    transaction.onabort = () => reject(transaction.error || new Error("Đã hủy lưu ảnh."));
  }));
}

function getVocabularyImage(imageId) {
  return openVocabularyImageDb().then((database) => new Promise((resolve, reject) => {
    const request = database.transaction(VOCAB_IMAGE_STORE, "readonly")
      .objectStore(VOCAB_IMAGE_STORE).get(imageId);
    request.onsuccess = () => resolve(request.result ? request.result.blob : null);
    request.onerror = () => reject(request.error || new Error("Không thể đọc ảnh."));
  }));
}

function deleteVocabularyImage(imageId) {
  if (!imageId) return Promise.resolve();
  return openVocabularyImageDb().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(VOCAB_IMAGE_STORE, "readwrite");
    transaction.objectStore(VOCAB_IMAGE_STORE).delete(imageId);
    transaction.oncomplete = () => {
      const url = state.vocabObjectUrls.get(imageId);
      if (url) URL.revokeObjectURL(url);
      state.vocabObjectUrls.delete(imageId);
      resolve();
    };
    transaction.onerror = () => reject(transaction.error || new Error("Không thể xóa ảnh."));
    transaction.onabort = () => reject(transaction.error || new Error("Đã hủy xóa ảnh."));
  }));
}

async function getVocabularyImageUrl(imageId) {
  if (!imageId) return null;
  if (state.vocabObjectUrls.has(imageId)) return state.vocabObjectUrls.get(imageId);
  const blob = await getVocabularyImage(imageId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  state.vocabObjectUrls.set(imageId, url);
  return url;
}

function releaseVocabularyImageUrls() {
  state.vocabObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  state.vocabObjectUrls.clear();
}

function selectedVocabularyDeck() {
  return state.vocabDecks.find((deck) => deck.id === state.selectedVocabDeckId) || null;
}

function renderVocabularyDeckSelect() {
  const selected = state.selectedVocabDeckId;
  vocabDeckSelect.replaceChildren();
  state.vocabDecks.forEach((deck) => {
    const option = document.createElement("option");
    option.value = deck.id;
    option.textContent = `${deck.name} (${deck.words.length})`;
    vocabDeckSelect.append(option);
  });
  if (state.vocabDecks.some((deck) => deck.id === selected)) {
    vocabDeckSelect.value = selected;
  } else {
    state.selectedVocabDeckId = state.vocabDecks[0] ? state.vocabDecks[0].id : "";
    vocabDeckSelect.value = state.selectedVocabDeckId;
  }
}

async function validateVocabularyImage(file) {
  if ("createImageBitmap" in window) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      return bitmap.width > 0 && bitmap.height > 0 && bitmap.width * bitmap.height <= 40000000;
    } catch {
      return false;
    } finally {
      if (bitmap) bitmap.close();
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image.naturalWidth > 0 && image.naturalHeight > 0
        && image.naturalWidth * image.naturalHeight <= 40000000);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    image.src = url;
  });
}

function clearVocabularyForm() {
  if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
  vocabularyForm.reset();
  state.editingVocabWordId = null;
  state.pendingVocabImage = null;
  state.removeExistingVocabImage = false;
  vocabImagePreview.replaceChildren();
  vocabImagePreview.hidden = true;
  $("vocab-form-title").textContent = "Thêm từ vựng";
  $("save-vocab-word").textContent = "Add Vocabulary";
  $("cancel-vocab-edit").hidden = true;
  $("vocab-manager-error").textContent = "";
}

async function setVocabularyImagePreview(url, name, removable) {
  vocabImagePreview.replaceChildren();
  if (!url) {
    vocabImagePreview.hidden = true;
    return;
  }
  const image = document.createElement("img");
  image.src = url;
  image.alt = `Ảnh minh họa ${name}`;
  const label = document.createElement("span");
  label.textContent = name;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-ghost btn-small";
  remove.textContent = "Bỏ ảnh";
  remove.addEventListener("click", () => {
    if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
    state.pendingVocabImage = null;
    state.removeExistingVocabImage = true;
    vocabImageInput.value = "";
    setVocabularyImagePreview(null, "", false);
  });
  vocabImagePreview.append(image, label);
  if (removable) vocabImagePreview.append(remove);
  vocabImagePreview.hidden = false;
}

async function renderVocabularyWords() {
  const renderToken = ++state.vocabRenderToken;
  const deck = selectedVocabularyDeck();
  vocabWordList.replaceChildren();
  $("vocab-deck-preview").hidden = true;
  $("vocab-deck-preview").replaceChildren();
  $("vocab-word-count").textContent = `(${deck ? deck.words.length : 0})`;
  $("custom-vocab-start").disabled = !deck || deck.words.length < 2;
  $("preview-vocab-deck").disabled = !deck || deck.words.length === 0;
  $("delete-vocab-deck").disabled = !deck;

  if (!deck) {
    const empty = document.createElement("li");
    empty.className = "vocab-empty";
    empty.textContent = "Tạo một bộ từ để bắt đầu.";
    vocabWordList.append(empty);
    return;
  }

  for (const word of deck.words) {
    const item = document.createElement("li");
    item.className = "vocab-word-item";
    const detail = document.createElement("div");
    detail.className = "vocab-word-detail";
    if (word.imageId) {
      try {
        const url = await getVocabularyImageUrl(word.imageId);
        if (renderToken !== state.vocabRenderToken) return;
        if (url) {
          const image = document.createElement("img");
          image.src = url;
          image.alt = "";
          detail.append(image);
        }
      } catch (error) {
        $("vocab-manager-error").textContent = `Không đọc được ảnh của “${word.english}”.`;
      }
    }
    const text = document.createElement("div");
    const english = document.createElement("strong");
    english.textContent = word.english;
    const meaning = document.createElement("span");
    meaning.textContent = word.meaning;
    text.append(english, meaning);
    detail.append(text);

    const actions = document.createElement("div");
    actions.className = "vocab-word-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn btn-ghost btn-small";
    edit.textContent = "Sửa";
    edit.addEventListener("click", () => editVocabularyWord(word));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-ghost btn-small";
    remove.textContent = "Xóa";
    remove.addEventListener("click", () => removeVocabularyWord(word.id));
    actions.append(edit, remove);
    item.append(detail, actions);
    vocabWordList.append(item);
  }
}

async function renderVocabularyDeckPreview() {
  const previewToken = ++state.vocabPreviewToken;
  const deck = selectedVocabularyDeck();
  if (!deck || deck.words.length === 0) return;
  const preview = $("vocab-deck-preview");
  preview.replaceChildren();
  for (const word of deck.words) {
    const card = document.createElement("article");
    card.className = "vocab-preview-card";
    if (word.imageId) {
      try {
        const url = await getVocabularyImageUrl(word.imageId);
        if (previewToken !== state.vocabPreviewToken) return;
        if (url) {
          const image = document.createElement("img");
          image.src = url;
          image.alt = "";
          card.append(image);
        }
      } catch (error) {
        $("vocab-preview-error").textContent = `Không tải được ảnh “${word.english}”.`;
      }
    } else {
      const illustration = document.createElement("span");
      illustration.className = "vocab-preview-illustration";
      illustration.textContent = "✦";
      illustration.setAttribute("aria-hidden", "true");
      card.append(illustration);
    }
    const english = document.createElement("strong");
    english.textContent = word.english;
    const meaning = document.createElement("span");
    meaning.textContent = word.meaning;
    card.append(english, meaning);
    preview.append(card);
  }
  preview.hidden = false;
}

async function editVocabularyWord(word) {
  if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
  state.editingVocabWordId = word.id;
  state.removeExistingVocabImage = false;
  state.pendingVocabImage = null;
  $("vocab-english").value = word.english;
  $("vocab-meaning").value = word.meaning;
  $("vocab-form-title").textContent = "Chỉnh sửa từ vựng";
  $("save-vocab-word").textContent = "Lưu thay đổi";
  $("cancel-vocab-edit").hidden = false;
  $("vocab-manager-error").textContent = "";
  try {
    const url = word.imageId ? await getVocabularyImageUrl(word.imageId) : null;
    await setVocabularyImagePreview(url, word.english, Boolean(url));
  } catch (error) {
    $("vocab-manager-error").textContent = "Không thể mở ảnh minh họa đã lưu.";
  }
  $("vocab-english").focus();
}

async function removeVocabularyWord(wordId) {
  const deck = selectedVocabularyDeck();
  if (!deck) return;
  const wordIndex = deck.words.findIndex((entry) => entry.id === wordId);
  const word = deck.words[wordIndex];
  deck.words = deck.words.filter((entry) => entry.id !== wordId);
  if (!saveVocabularyDecks()) {
    deck.words.splice(wordIndex, 0, word);
    return;
  }
  if (word && word.imageId) {
    try { await deleteVocabularyImage(word.imageId); }
    catch (error) { $("vocab-manager-error").textContent = "Đã xóa từ nhưng không xóa được ảnh trong kho."; }
  }
  if (state.editingVocabWordId === wordId) clearVocabularyForm();
  await renderVocabularyWords();
}

async function handleVocabularyImageChange() {
  const file = vocabImageInput.files && vocabImageInput.files[0];
  if (!file) return;
  const extension = file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED_IMAGE_EXTENSIONS.has(extension)
    || (file.type && !ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase()))) {
    $("vocab-manager-error").textContent = "Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP.";
    vocabImageInput.value = "";
    return;
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    $("vocab-manager-error").textContent = "Ảnh phải lớn hơn 0 và không quá 5 MB.";
    vocabImageInput.value = "";
    return;
  }
  try {
    if (!(await validateVocabularyImage(file))) {
      $("vocab-manager-error").textContent = "Tệp không phải ảnh hợp lệ hoặc độ phân giải vượt giới hạn.";
      vocabImageInput.value = "";
      return;
    }
  } catch (error) {
    $("vocab-manager-error").textContent = "Không thể kiểm tra ảnh này.";
    vocabImageInput.value = "";
    return;
  }
  if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
  state.pendingVocabImage = { file, url: URL.createObjectURL(file), name: file.name };
  state.removeExistingVocabImage = false;
  $("vocab-manager-error").textContent = "";
  await setVocabularyImagePreview(state.pendingVocabImage.url, file.name, true);
}

async function handleVocabularyFormSubmit(event) {
  event.preventDefault();
  const deck = selectedVocabularyDeck();
  if (!deck) {
    $("vocab-manager-error").textContent = "Hãy tạo hoặc chọn một bộ từ trước.";
    return;
  }
  const english = $("vocab-english").value.trim();
  const meaning = $("vocab-meaning").value.trim();
  if (!english || !meaning) {
    $("vocab-manager-error").textContent = "Từ tiếng Anh và nghĩa tiếng Việt không được để trống.";
    return;
  }

  const previous = deck.words.find((word) => word.id === state.editingVocabWordId);
  let newImageId = null;
  try {
    if (state.pendingVocabImage) newImageId = await storeVocabularyImage(state.pendingVocabImage.file);
  } catch (error) {
    $("vocab-manager-error").textContent = `Không lưu được ảnh: ${error.message}`;
    return;
  }

  const imageId = newImageId || (state.removeExistingVocabImage ? null : previous && previous.imageId) || null;
  const word = { id: previous ? previous.id : createId("word"), english, meaning, imageId };
  const originalWords = deck.words.slice();
  if (previous) {
    deck.words = deck.words.map((entry) => entry.id === previous.id ? word : entry);
  } else {
    deck.words.push(word);
  }
  if (!saveVocabularyDecks()) {
    deck.words = originalWords;
    if (newImageId) {
      try { await deleteVocabularyImage(newImageId); }
      catch (error) { vocabStorageStatus.textContent = "Không lưu được bộ từ và không dọn được ảnh tạm."; }
    }
    return;
  }
  if (previous && previous.imageId && previous.imageId !== imageId) {
    try { await deleteVocabularyImage(previous.imageId); }
    catch (error) { $("vocab-manager-error").textContent = "Đã lưu từ nhưng không xóa được ảnh cũ."; }
  }
  if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
  clearVocabularyForm();
  await renderVocabularyDeckSelect();
  await renderVocabularyWords();
}

async function createVocabularyDeck() {
  const nameInput = $("new-vocab-deck-name");
  const name = nameInput.value.trim();
  if (!name) {
    $("vocab-manager-error").textContent = "Hãy nhập tên cho bộ từ.";
    nameInput.focus();
    return;
  }
  const deck = { id: createId("deck"), name, words: [] };
  state.vocabDecks.push(deck);
  if (!saveVocabularyDecks()) {
    state.vocabDecks.pop();
    return;
  }
  state.selectedVocabDeckId = deck.id;
  nameInput.value = "";
  $("vocab-manager-error").textContent = "";
  await renderVocabularyDeckSelect();
  clearVocabularyForm();
  await renderVocabularyWords();
}

async function deleteVocabularyDeck() {
  const deck = selectedVocabularyDeck();
  if (!deck) return;
  const deckIndex = state.vocabDecks.indexOf(deck);
  const imageIds = deck.words.map((word) => word.imageId).filter(Boolean);
  state.vocabDecks = state.vocabDecks.filter((entry) => entry.id !== deck.id);
  if (!saveVocabularyDecks()) {
    state.vocabDecks.splice(deckIndex, 0, deck);
    return;
  }
  state.selectedVocabDeckId = state.vocabDecks[0] ? state.vocabDecks[0].id : "";
  clearVocabularyForm();
  try {
    const best = loadVocabularyBest();
    delete best[deck.id];
    localStorage.setItem(VOCAB_BEST_KEY, JSON.stringify(best));
  } catch (error) {
    vocabStorageStatus.textContent = "Đã xóa bộ từ nhưng không dọn được kỷ lục cũ.";
  }
  for (const imageId of imageIds) {
    try { await deleteVocabularyImage(imageId); }
    catch (error) { $("vocab-manager-error").textContent = "Đã xóa bộ từ nhưng một số ảnh chưa được xóa."; }
  }
  await renderVocabularyDeckSelect();
  await renderVocabularyWords();
}

async function initializeVocabulary() {
  state.vocabDecks = loadVocabularyDecks();
  if (state.vocabDecks.length === 0) {
    const initialDeck = { id: createId("deck"), name: "Bộ từ của tôi", words: [] };
    state.vocabDecks = [initialDeck];
    saveVocabularyDecks();
  }
  state.selectedVocabDeckId = state.vocabDecks[0].id;

  Object.entries(VOCAB_TOPICS).forEach(([id, topic]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = topic.label;
    vocabTopicSelect.append(option);
  });
  try {
    await openVocabularyImageDb();
    vocabStorageStatus.textContent = "Bộ từ và ảnh được lưu cục bộ trên thiết bị này.";
  } catch (error) {
    vocabStorageStatus.textContent = `Không thể mở kho ảnh: ${error.message} Từ không có ảnh vẫn dùng được.`;
    vocabImageInput.disabled = true;
  }
  await renderVocabularyDeckSelect();
  await renderVocabularyWords();
}

/* ---------- Vocabulary Match gameplay ---------- */
function shuffleVocabularyWords(words) {
  const shuffled = shuffle(words);
  let attempts = 0;
  while (shuffled.every((word, index) => word.id === words[index].id) && attempts < 20) {
    shuffled.splice(0, shuffled.length, ...shuffle(words));
    attempts++;
  }
  if (words.length > 1 && shuffled.every((word, index) => word.id === words[index].id)) {
    shuffled.splice(0, shuffled.length, ...words.slice(1), words[0]);
  }
  return shuffled;
}

function createRandomVocabulary(topicId, count) {
  return shuffle(VOCAB_TOPICS[topicId].words).slice(0, count).map(([english, meaning, illustration]) => ({
    id: `random-${topicId}-${english}`,
    english,
    meaning,
    illustration,
    imageId: null
  }));
}

function getVocabularyAccuracy() {
  const game = state.vocabGame;
  return game.attempts === 0 ? 0 : Math.round((game.correctMatches / game.attempts) * 100);
}

function updateVocabularyStats() {
  const game = state.vocabGame;
  $("vocab-stat-total").textContent = game.words.length;
  $("vocab-stat-matched").textContent = game.correctMatches;
  $("vocab-stat-attempts").textContent = game.attempts;
  $("vocab-stat-correct").textContent = game.correctMatches;
  $("vocab-stat-accuracy").textContent = `${getVocabularyAccuracy()}%`;
  $("vocab-stat-time").textContent = formatTime(game.elapsed);
  const remaining = game.words.length - game.correctMatches;
  $("english-remaining").textContent = `${remaining} còn lại`;
  $("meaning-remaining").textContent = `${remaining} còn lại`;
}

function renderVocabularyCard(word, side) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `vocab-choice vocab-${side}-card`;
  card.dataset.vocabularyId = word.id;
  card.dataset.side = side;
  if (side === "english") {
    const text = document.createElement("span");
    text.className = "vocab-english-text";
    text.textContent = word.english;
    card.append(text);
  } else {
    if (word.imageUrl) {
      const image = document.createElement("img");
      image.className = "vocab-meaning-image";
      image.src = word.imageUrl;
      image.alt = "";
      card.append(image);
    } else {
      const illustration = document.createElement("span");
      illustration.className = "vocab-meaning-illustration";
      illustration.textContent = word.illustration || "✦";
      illustration.setAttribute("aria-hidden", "true");
      card.append(illustration);
    }
    const meaning = document.createElement("span");
    meaning.className = "vocab-meaning-text";
    meaning.textContent = word.meaning;
    card.append(meaning);
  }
  card.setAttribute("aria-label", side === "english" ? word.english : word.meaning);
  return card;
}

async function startVocabularyGame(words, bestKey, deckName) {
  const game = state.vocabGame;
  if (game.starting) return;
  game.starting = true;
  try {
    clearInterval(game.timerId);
    clearTimeout(game.mismatchTimeout);
    clearTimeout(game.winTimeout);
    releaseVocabularyImageUrls();
    game.words = words.map((word) => ({ ...word, imageUrl: null }));
    game.selectedEnglishId = null;
    game.locked = false;
    game.attempts = 0;
    game.correctMatches = 0;
    game.timerId = null;
    game.startTime = 0;
    game.elapsed = 0;
    game.mismatchTimeout = null;
    game.winTimeout = null;
    game.bestKey = bestKey;
    game.deckName = deckName;
    vocabularyWinOverlay.hidden = true;
    vocabGameFeedback.textContent = "";

    for (const word of game.words) {
      if (word.imageId) {
        try { word.imageUrl = await getVocabularyImageUrl(word.imageId); }
        catch (error) {
          $("vocab-manager-error").textContent =
            `Không đọc được ảnh của “${word.english}”; thẻ sẽ dùng biểu tượng thay thế.`;
        }
      }
    }

    const englishWords = shuffleVocabularyWords(game.words);
    let meanings = shuffleVocabularyWords(game.words);
    let attempts = 0;
    while (meanings.every((word, index) => word.id === englishWords[index].id) && attempts < 20) {
      meanings = shuffleVocabularyWords(game.words);
      attempts++;
    }
    if (meanings.every((word, index) => word.id === englishWords[index].id) && meanings.length > 1) {
      meanings = [...englishWords.slice(1), englishWords[0]];
    }
    englishWordCards.replaceChildren(...englishWords.map((word) => renderVocabularyCard(word, "english")));
    vietnameseMeaningCards.replaceChildren(...meanings.map((word) => renderVocabularyCard(word, "meaning")));
    $("vocab-game-title").textContent = deckName;
    menuScreen.hidden = true;
    gameScreen.hidden = true;
    vocabularyGameScreen.hidden = false;
    updateVocabularyStats();
  } catch (error) {
    vocabGameFeedback.textContent = `Không thể bắt đầu bộ từ: ${error.message}`;
    $("vocab-manager-error").textContent = vocabGameFeedback.textContent;
  } finally {
    game.starting = false;
  }
}

function startRandomVocabularyGame() {
  const topicId = vocabTopicSelect.value;
  const count = vocabCountInput.valueAsNumber;
  const topic = VOCAB_TOPICS[topicId];
  if (!topic || !Number.isInteger(count) || count < 2 || count > 12 || count > topic.words.length) {
    $("random-vocab-error").textContent = "Chọn một chủ đề và số từ hợp lệ (2–12).";
    return;
  }
  $("random-vocab-error").textContent = "";
  const words = createRandomVocabulary(topicId, count);
  startVocabularyGame(words, `random-${topicId}-${count}`, `${topic.label} · ${count} từ`);
}

function startCustomVocabularyGame() {
  const deck = selectedVocabularyDeck();
  if (!deck || deck.words.length < 2) {
    $("vocab-manager-error").textContent = "Cần ít nhất 2 từ hợp lệ để bắt đầu.";
    return;
  }
  $("vocab-manager-error").textContent = "";
  startVocabularyGame(deck.words.map((word) => ({ ...word, illustration: "✦" })), deck.id, deck.name);
}

function startVocabularyTimer() {
  const game = state.vocabGame;
  if (game.timerId !== null) return;
  game.startTime = Date.now() - game.elapsed * 1000;
  game.timerId = setInterval(() => {
    game.elapsed = Math.floor((Date.now() - game.startTime) / 1000);
    $("vocab-stat-time").textContent = formatTime(game.elapsed);
  }, 250);
}

function handleVocabularyCardClick(event) {
  const card = event.target.closest(".vocab-choice");
  if (!card || state.vocabGame.locked || card.classList.contains("is-matched")) return;
  const game = state.vocabGame;
  const side = card.dataset.side;
  const vocabularyId = card.dataset.vocabularyId;

  if (side === "english") {
    if (game.selectedEnglishId) {
      if (game.selectedEnglishId === vocabularyId) {
        game.selectedEnglishId = null;
        card.classList.remove("is-selected");
        vocabGameFeedback.textContent = "Chọn một từ tiếng Anh để bắt đầu ghép.";
      }
      return;
    }
    game.selectedEnglishId = vocabularyId;
    card.classList.add("is-selected");
    startVocabularyTimer();
    vocabGameFeedback.textContent = "Bây giờ hãy chọn nghĩa tiếng Việt tương ứng.";
    return;
  }

  if (!game.selectedEnglishId) {
    vocabGameFeedback.textContent = "Hãy chọn một từ tiếng Anh trước.";
    return;
  }

  const selectedEnglish = englishWordCards.querySelector(
    `.vocab-choice[data-vocabulary-id="${CSS.escape(game.selectedEnglishId)}"]`
  );
  game.locked = true;
  game.attempts++;
  startVocabularyTimer();

  if (game.selectedEnglishId === vocabularyId) {
    selectedEnglish.classList.remove("is-selected");
    selectedEnglish.classList.add("is-matched");
    card.classList.add("is-matched");
    selectedEnglish.disabled = true;
    card.disabled = true;
    game.correctMatches++;
    game.selectedEnglishId = null;
    game.locked = false;
    vocabGameFeedback.textContent = "Đúng rồi! Hãy tiếp tục.";
    updateVocabularyStats();
    if (game.correctMatches === game.words.length) finishVocabularyGame();
    return;
  }

  selectedEnglish.classList.add("is-incorrect");
  card.classList.add("is-incorrect");
  vocabGameFeedback.textContent = "Chưa đúng. Thử lại nhé.";
  updateVocabularyStats();
  game.mismatchTimeout = setTimeout(() => {
    selectedEnglish.classList.remove("is-selected", "is-incorrect");
    card.classList.remove("is-incorrect");
    game.selectedEnglishId = null;
    game.mismatchTimeout = null;
    game.locked = false;
    vocabGameFeedback.textContent = "Chọn một từ tiếng Anh để tiếp tục.";
  }, VOCAB_MISMATCH_DELAY);
}

function loadVocabularyBest() {
  try {
    const best = JSON.parse(localStorage.getItem(VOCAB_BEST_KEY) || "{}");
    return best && typeof best === "object" ? best : {};
  } catch (error) {
    return {};
  }
}

function finishVocabularyGame() {
  const game = state.vocabGame;
  clearInterval(game.timerId);
  game.timerId = null;
  game.elapsed = Math.floor((Date.now() - game.startTime) / 1000);
  updateVocabularyStats();
  game.winTimeout = setTimeout(showVocabularyWin, 350);
}

function showVocabularyWin() {
  const game = state.vocabGame;
  game.winTimeout = null;
  const result = { attempts: game.attempts, time: game.elapsed };
  const best = loadVocabularyBest();
  const previous = best[game.bestKey];
  const isRecord = !previous || result.attempts < previous.attempts
    || (result.attempts === previous.attempts && result.time < previous.time);

  if (isRecord) {
    best[game.bestKey] = result;
    try {
      localStorage.setItem(VOCAB_BEST_KEY, JSON.stringify(best));
    } catch (error) {
      vocabStorageStatus.textContent = "Không lưu được kỷ lục từ vựng trong trình duyệt.";
    }
  }

  $("vocab-win-time").textContent = formatTime(game.elapsed);
  $("vocab-win-attempts").textContent = game.attempts;
  $("vocab-win-accuracy").textContent = `${getVocabularyAccuracy()}%`;
  $("vocab-win-correct").textContent = `${game.correctMatches}/${game.words.length}`;
  $("vocab-win-record").hidden = !isRecord;
  const shown = isRecord ? result : previous;
  $("vocab-win-best").textContent =
    `Kỷ lục bộ “${game.deckName}”: ${shown.attempts} lượt · ${formatTime(shown.time)}`;
  vocabularyWinOverlay.hidden = false;
  $("vocab-win-restart").focus();
}

function showVocabularyMenu() {
  const game = state.vocabGame;
  clearInterval(game.timerId);
  clearTimeout(game.mismatchTimeout);
  clearTimeout(game.winTimeout);
  game.timerId = null;
  game.mismatchTimeout = null;
  game.winTimeout = null;
  game.locked = false;
  vocabularyWinOverlay.hidden = true;
  vocabularyGameScreen.hidden = true;
  menuScreen.hidden = false;
  selectGameType("vocabulary");
  releaseVocabularyImageUrls();
  renderVocabularyWords();
}

function selectGameType(type) {
  state.gameType = type;
  gameModeChoices.forEach((button) => {
    const active = button.dataset.gameMode === type;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-checked", String(active));
  });
  classicModeSettings.hidden = type !== "classic";
  vocabularySettings.hidden = type !== "vocabulary";
}

function selectVocabularySource(source) {
  state.vocabSource = source;
  vocabSourceButtons.forEach((button) => {
    const active = button.dataset.vocabSource === source;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-checked", String(active));
  });
  randomVocabPanel.hidden = source !== "random";
  customVocabPanel.hidden = source !== "custom";
  if (source === "custom") renderVocabularyWords();
}

/* ---------- Timer ---------- */
function updateTimeDisplay() {
  statTime.textContent = formatTime(state.elapsed);
}

function startTimer() {
  if (state.timerId !== null) return;          // tránh tạo nhiều timer
  state.startTime = Date.now() - state.elapsed * 1000;
  state.timerId = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    updateTimeDisplay();
  }, 250);
}

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

/* ---------- Giao diện thống kê ---------- */
function updateStats() {
  statMoves.textContent = state.moves;
  statPairs.textContent = `${state.matchedPairs}/${state.totalPairs}`;
  statAccuracy.textContent = `${getAccuracy()}%`;
  updateTimeDisplay();
}

/* ---------- Tạo bàn chơi ---------- */
function createCard(pair, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.dataset.cardId = String(index + 1);
  card.dataset.pairId = pair.pairId;
  card.dataset.label = pair.label;
  card.setAttribute("aria-label", `Thẻ số ${index + 1}, đang úp`);

  const inner = document.createElement("span");
  inner.className = "card-inner";
  const back = document.createElement("span");
  back.className = "card-face card-back";
  back.setAttribute("aria-hidden", "true");
  back.textContent = "?";
  const front = document.createElement("span");
  front.className = "card-face card-front";
  front.setAttribute("aria-hidden", "true");

  if (pair.type === "image") {
    const image = document.createElement("img");
    image.src = pair.value;
    image.alt = "";
    image.draggable = false;
    front.append(image);
  } else {
    front.textContent = pair.value;
  }

  inner.append(back, front);
  card.append(inner);
  return card;
}

function createShuffledDeck(pairs) {
  const cards = pairs.flatMap((pair) => [pair, pair]);
  let deck = shuffle(cards);
  let attempts = 0;

  while (deck.some((card, index) => index > 0 && card.pairId === deck[index - 1].pairId) && attempts < 100) {
    deck = shuffle(cards);
    attempts++;
  }

  if (deck.some((card, index) => index > 0 && card.pairId === deck[index - 1].pairId)) {
    const orderedPairs = shuffle(pairs);
    deck = [...orderedPairs, ...orderedPairs];
  }
  return deck;
}

function createCustomPairs(pairCount) {
  const chosenImages = state.customImages.length > pairCount
    ? shuffle(state.customImages).slice(0, pairCount)
    : state.customImages;
  const pairs = chosenImages.map((image) => ({
    pairId: `custom-image-${image.id}`,
    type: "image",
    value: image.url,
    label: image.name
  }));
  const missingCount = pairCount - pairs.length;
  const defaultEmojis = shuffle(CUSTOM_DEFAULT_EMOJIS).slice(0, missingCount);

  defaultEmojis.forEach((emoji, index) => {
    pairs.push({
      pairId: `custom-emoji-${index}`,
      type: "emoji",
      value: emoji,
      label: emoji
    });
  });
  return pairs;
}

function resetTimersAndState() {
  stopTimer();
  clearTimeout(state.mismatchTimeout);
  clearTimeout(state.winTimeout);
  state.mismatchTimeout = null;
  state.winTimeout = null;

  state.firstCard = null;
  state.secondCard = null;
  state.locked = false;
  state.moves = 0;
  state.matchedPairs = 0;
  state.elapsed = 0;
  state.startTime = 0;
}

function startGame() {
  const customPairCount = state.mode === "custom" ? getCustomPairCount() : null;
  if (state.mode === "custom" && customPairCount === null) {
    customError.textContent = `Số cặp phải là số nguyên từ 2 đến ${MAX_CUSTOM_PAIRS}.`;
    return;
  }

  resetTimersAndState();
  winOverlay.hidden = true;

  const pairs = state.mode === "custom"
    ? createCustomPairs(customPairCount)
    : shuffle(EMOJIS).slice(0, MODES[state.mode].pairs).map((emoji, index) => ({
      pairId: `${state.mode}-${index}`,
      type: "emoji",
      value: emoji,
      label: emoji
    }));
  state.totalPairs = pairs.length;
  const deck = createShuffledDeck(pairs);

  boardEl.dataset.mode = state.mode;
  boardEl.replaceChildren(...deck.map(createCard));

  menuScreen.hidden = true;
  gameScreen.hidden = false;
  updateStats();
}

/* ---------- Logic lật thẻ ---------- */
function flipCard(card) {
  card.classList.add("is-flipped");
  card.setAttribute("aria-label", `Thẻ đang mở: ${card.dataset.label}`);
}

function unflipCard(card) {
  card.classList.remove("is-flipped");
  card.setAttribute("aria-label", `Thẻ số ${card.dataset.cardId}, đang úp`);
}

function handleCardClick(event) {
  const card = event.target.closest(".card");
  if (!card || !boardEl.contains(card)) return;

  // Các điều kiện chặn click
  if (state.locked) return;                              // đang chờ úp / game kết thúc
  if (card.classList.contains("is-matched")) return;     // thẻ đã tìm được
  if (card.classList.contains("is-flipped")) return;     // thẻ đang mở (gồm click đúp)

  startTimer();                                          // bắt đầu tính giờ ở lần lật đầu tiên
  flipCard(card);

  if (!state.firstCard) {
    state.firstCard = card;
    return;
  }

  // Thẻ thứ hai: khóa bàn ngay để không mở được thẻ thứ ba
  state.secondCard = card;
  state.locked = true;
  state.moves++;

  if (state.firstCard.dataset.pairId === state.secondCard.dataset.pairId) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  [state.firstCard, state.secondCard].forEach((c) => {
    c.classList.add("is-matched", "just-matched");
    c.disabled = true;
    c.setAttribute("aria-label", `Đã ghép cặp ${c.dataset.pairId}`);
  });

  state.matchedPairs++;
  state.firstCard = null;
  state.secondCard = null;
  updateStats();

  if (state.matchedPairs === state.totalPairs) {
    finishGame();        // giữ khóa bàn
  } else {
    state.locked = false;
  }
}

function handleMismatch() {
  updateStats();
  state.mismatchTimeout = setTimeout(() => {
    unflipCard(state.firstCard);
    unflipCard(state.secondCard);
    state.firstCard = null;
    state.secondCard = null;
    state.mismatchTimeout = null;
    state.locked = false;
  }, MISMATCH_DELAY);
}

/* ---------- Kết thúc game ---------- */
function finishGame() {
  stopTimer();
  state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  updateTimeDisplay();

  state.winTimeout = setTimeout(showWin, WIN_DELAY);
}

function showWin() {
  state.winTimeout = null;

  const result = { moves: state.moves, time: state.elapsed };
  const best = loadBest();
  const previous = best[state.mode];
  const isRecord = isBetter(result, previous);

  if (isRecord) {
    best[state.mode] = result;
    saveBest(best);
    renderBest();
  }

  $("win-moves").textContent = state.moves;
  $("win-time").textContent = formatTime(state.elapsed);
  $("win-accuracy").textContent = `${getAccuracy()}%`;
  $("win-record").hidden = !isRecord;

  const shown = isRecord ? result : previous;
  $("win-best").textContent =
    `Tốt nhất (${MODES[state.mode].label}): ${shown.moves} lượt · ${formatTime(shown.time)}`;

  winOverlay.hidden = false;
  $("win-restart-btn").focus();
}

/* ---------- Điều hướng ---------- */
function showMenu() {
  resetTimersAndState();
  winOverlay.hidden = true;
  gameScreen.hidden = true;
  vocabularyGameScreen.hidden = true;
  vocabularyWinOverlay.hidden = true;
  menuScreen.hidden = false;
  selectGameType("classic");
  renderBest();
}

function selectMode(button) {
  selectGameType("classic");
  state.mode = button.dataset.mode;
  modeButtons.forEach((b) => {
    const active = b === button;
    b.classList.toggle("is-selected", active);
    b.setAttribute("aria-checked", String(active));
  });
  const isCustom = state.mode === "custom";
  startButton.hidden = isCustom;
  customSettings.hidden = !isCustom;
  if (isCustom) updateCustomSettings();
}

/* ---------- Sự kiện ---------- */
boardEl.addEventListener("click", handleCardClick);
modeButtons.forEach((b) => b.addEventListener("click", () => selectMode(b)));
gameModeChoices.forEach((button) => button.addEventListener("click", () => selectGameType(button.dataset.gameMode)));
vocabSourceButtons.forEach((button) => button.addEventListener("click", () => selectVocabularySource(button.dataset.vocabSource)));

$("start-btn").addEventListener("click", startGame);
$("restart-btn").addEventListener("click", startGame);
$("win-restart-btn").addEventListener("click", startGame);
$("menu-btn").addEventListener("click", showMenu);
$("win-menu-btn").addEventListener("click", showMenu);
customPairsInput.addEventListener("input", updateCustomSettings);
customFilesInput.addEventListener("change", handleCustomFilesChange);
$("clear-images-btn").addEventListener("click", clearCustomImages);
customStartButton.addEventListener("click", startGame);
$("custom-back-btn").addEventListener("click", () => {
  selectMode(document.querySelector('[data-mode="easy"]'));
});
$("random-vocab-start").addEventListener("click", startRandomVocabularyGame);
$("custom-vocab-start").addEventListener("click", startCustomVocabularyGame);
$("create-vocab-deck").addEventListener("click", createVocabularyDeck);
$("delete-vocab-deck").addEventListener("click", deleteVocabularyDeck);
$("preview-vocab-deck").addEventListener("click", () => {
  $("vocab-preview-error").textContent = "";
  const preview = $("vocab-deck-preview");
  if (!preview.hidden) {
    preview.hidden = true;
    return;
  }
  renderVocabularyDeckPreview();
});
vocabDeckSelect.addEventListener("change", async () => {
  state.selectedVocabDeckId = vocabDeckSelect.value;
  clearVocabularyForm();
  releaseVocabularyImageUrls();
  await renderVocabularyWords();
});
vocabularyForm.addEventListener("submit", handleVocabularyFormSubmit);
vocabImageInput.addEventListener("change", handleVocabularyImageChange);
$("cancel-vocab-edit").addEventListener("click", clearVocabularyForm);
$("vocab-menu-btn").addEventListener("click", showVocabularyMenu);
$("vocab-win-menu").addEventListener("click", showVocabularyMenu);
$("vocab-restart-btn").addEventListener("click", () => {
  const game = state.vocabGame;
  startVocabularyGame(game.words, game.bestKey, game.deckName);
});
$("vocab-win-restart").addEventListener("click", () => {
  const game = state.vocabGame;
  startVocabularyGame(game.words, game.bestKey, game.deckName);
});
englishWordCards.addEventListener("click", handleVocabularyCardClick);
vietnameseMeaningCards.addEventListener("click", handleVocabularyCardClick);
vocabDifficultySelect.addEventListener("change", () => {
  vocabCountInput.value = { easy: 5, medium: 8, hard: 12 }[vocabDifficultySelect.value];
  $("random-vocab-error").textContent = "";
});
vocabCountInput.addEventListener("input", () => {
  $("random-vocab-error").textContent = "";
});
window.addEventListener("beforeunload", () => {
  state.customImages.forEach((image) => URL.revokeObjectURL(image.url));
  if (state.pendingVocabImage) URL.revokeObjectURL(state.pendingVocabImage.url);
  releaseVocabularyImageUrls();
});

updateCustomSettings();
renderBest();
initializeVocabulary();