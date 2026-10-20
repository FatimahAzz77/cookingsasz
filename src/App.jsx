import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ingredients, recipes } from "./data/recipes.js";
import { readStore, writeStore } from "./utils/storage.js";

function playTone(kind, enabled) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const patterns = {
      click: [[520, 0.045]],
      correct: [[660, 0.08], [820, 0.1]],
      wrong: [[230, 0.14], [170, 0.18]],
      win: [[523, 0.12], [659, 0.12], [784, 0.22]],
      lose: [[330, 0.14], [260, 0.2]],
    };
    let start = ctx.currentTime;
    (patterns[kind] || patterns.click).forEach(([frequency, duration]) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
      start += duration + 0.035;
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    // Audio is an enhancement; the game still works when sound is unavailable.
  }
}

function speak(text, lang = "ar-SA") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    window.alert("Fitur suara belum didukung oleh browser ini.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

function CatChef({ emotion = "happy", small = false }) {
  return (
    <div className={`cat-chef ${small ? "cat-small" : ""} mood-${emotion}`} aria-label="Koki kucing">
      <div className="chef-hat"><span /><i /></div>
      <div className="cat-ears"><i /><i /></div>
      <div className="cat-head">
        <div className="cat-eyes"><i /><i /></div>
        <div className="cat-cheeks"><i /><i /></div>
        <div className="cat-nose" />
        <div className="cat-mouth" />
        <div className="cat-whiskers left"><i /><i /></div>
        <div className="cat-whiskers right"><i /><i /></div>
      </div>
      {!small && <div className="cat-scarf" />}
    </div>
  );
}

function Food({ item, tiny = false }) {
  if (!item) return null;
  return (
    <span className={`food-emoji ${tiny ? "food-tiny" : ""}`} aria-hidden="true">
      <span className="food-symbol">{item.emoji}</span>
      <span className="food-eyes">••</span>
      <span className="food-smile">⌣</span>
      <i className="food-cheek left" />
      <i className="food-cheek right" />
    </span>
  );
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

const defaultProgress = { completed: [], scores: {} };

export default function App() {
  const [screen, setScreen] = useState("home");
  const [playerName, setPlayerName] = useState(() => readStore("playerName", ""));
  const [draftName, setDraftName] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [progress, setProgress] = useState(() => readStore("progress", defaultProgress));
  const [notebook, setNotebook] = useState(() => readStore("notebook", []));
  const [leaderboard, setLeaderboard] = useState(() => readStore("leaderboard", []));
  const [challengeMode, setChallengeMode] = useState(() => readStore("challengeMode", false));
  const [soundEnabled, setSoundEnabled] = useState(() => readStore("soundEnabled", true));

  const [recipeId, setRecipeId] = useState("salad");
  const [sessionId, setSessionId] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [helps, setHelps] = useState(0);
  const [remaining, setRemaining] = useState(100);
  const [placedBoard, setPlacedBoard] = useState([]);
  const [placedVessel, setPlacedVessel] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [emotion, setEmotion] = useState("happy");
  const [message, setMessage] = useState("Ahlan wa sahlan! Siap memasak sambil belajar bahasa Arab?");
  const [result, setResult] = useState(null);

  const finishedRef = useRef(false);
  const finishRef = useRef(() => {});
  const recipe = useMemo(() => recipes.find((item) => item.id === recipeId) || recipes[0], [recipeId]);
  const step = recipe.steps[stepIndex];
  const rackItems = recipe.ingredients.map((id) => ingredients[id]).filter(Boolean);
  const burn = Math.min(100, mistakes * 34);
  const isUnlocked = (index) => index === 0 || progress.completed.includes(recipes[index - 1].id);
  const totalStars = Object.values(progress.scores || {}).reduce((sum, score) => sum + Number(score || 0), 0);

  useEffect(() => writeStore("playerName", playerName), [playerName]);
  useEffect(() => writeStore("progress", progress), [progress]);
  useEffect(() => writeStore("notebook", notebook), [notebook]);
  useEffect(() => writeStore("leaderboard", leaderboard), [leaderboard]);
  useEffect(() => writeStore("challengeMode", challengeMode), [challengeMode]);
  useEffect(() => writeStore("soundEnabled", soundEnabled), [soundEnabled]);

  const finishGame = useCallback((success, forcedMistakes = null) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalMistakes = forcedMistakes === null ? mistakes : forcedMistakes;
    const stars = success
      ? Math.max(1, 3 - (finalMistakes >= 2 ? 1 : 0) - (helps >= 2 ? 1 : 0))
      : 0;

    setResult({
      success,
      stars,
      mistakes: finalMistakes,
      helps,
      remaining: success ? remaining : 0,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    });
    setScreen("result");
    setEmotion(success ? "happy" : "sad");
    setMessage(success ? "Yay! Masakanmu berhasil. أحسنت!" : "Ups, belum berhasil. Tidak apa-apa, ayo coba lagi!");
    playTone(success ? "win" : "lose", soundEnabled);

    if (success) {
      setProgress((previous) => {
        const nextScores = { ...(previous.scores || {}), [recipe.id]: Math.max(previous.scores?.[recipe.id] || 0, stars) };
        const completed = [...new Set([...(previous.completed || []), recipe.id])];
        return { completed, scores: nextScores };
      });
      setLeaderboard((previous) => {
        const name = (playerName || "Koki Baru").trim();
        const existing = previous.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
        const nextScores = { ...(progress.scores || {}), [recipe.id]: Math.max(progress.scores?.[recipe.id] || 0, stars) };
        const nextTotal = Object.values(nextScores).reduce((sum, value) => sum + Number(value || 0), 0);
        const row = {
          name,
          totalStars: nextTotal,
          dishes: Object.keys(nextScores).length,
          bestTime: Math.max(existing?.bestTime || 0, remaining),
        };
        const without = previous.filter((entry) => entry.name.toLowerCase() !== name.toLowerCase());
        return [...without, row].sort((a, b) => b.totalStars - a.totalStars || b.bestTime - a.bestTime).slice(0, 20);
      });
    }
  }, [mistakes, helps, remaining, recipe, soundEnabled, playerName, progress.scores]);
  finishRef.current = finishGame;

  useEffect(() => {
    if (screen !== "game") return undefined;
    const timer = setInterval(() => {
      setRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setTimeout(() => finishRef.current(false), 0);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, sessionId]);

  const startRecipe = (id) => {
    const chosen = recipes.find((item) => item.id === id);
    if (!chosen) return;
    finishedRef.current = false;
    setRecipeId(id);
    setStepIndex(0);
    setStepCount(0);
    setMistakes(0);
    setHelps(0);
    setRemaining(chosen.timeLimit);
    setPlacedBoard([]);
    setPlacedVessel([]);
    setSelectedIngredient(null);
    setActiveWord(null);
    setShowTranslation(false);
    setHintShown(false);
    setBusy(false);
    setShake(false);
    setEmotion("happy");
    setMessage(chosen.steps[0].comment);
    setResult(null);
    setSessionId((value) => value + 1);
    setScreen("game");
    playTone("click", soundEnabled);
  };

  const registerWrong = (why) => {
    playTone("wrong", soundEnabled);
    setEmotion("surprised");
    setMessage(why || "Hampir! Periksa lagi bahan dan tempatnya.");
    setShake(true);
    setTimeout(() => setShake(false), 430);
    setMistakes((previous) => {
      const next = previous + 1;
      if (next >= 3) setTimeout(() => finishRef.current(false, next), 0);
      return next;
    });
  };

  const handlePlace = (ingredientId, target) => {
    if (screen !== "game" || busy || finishedRef.current) return;
    if (!ingredientId) {
      setMessage("Pilih bahan dari rak terlebih dahulu.");
      return;
    }
    if (ingredientId !== step.ingredient || target !== step.target) {
      registerWrong(target !== step.target ? "Tempatnya belum tepat. Coba ikuti perintah Arab!" : "Bahan itu belum cocok dengan resep. Coba lagi!");
      setSelectedIngredient(null);
      return;
    }

    playTone("correct", soundEnabled);
    setEmotion("happy");
    setMessage(step.comment);
    setSelectedIngredient(null);
    const item = ingredients[ingredientId];
    if (target === "board") setPlacedBoard((previous) => [...previous, { ...item, key: `${Date.now()}-${previous.length}` }]);
    else setPlacedVessel((previous) => [...previous, { ...item, key: `${Date.now()}-${previous.length}` }]);

    const nextCount = stepCount + 1;
    setStepCount(nextCount);
    if (nextCount >= step.quantity) {
      setBusy(true);
      setMessage(stepIndex === recipe.steps.length - 1 ? "Sempurna! Sajianmu hampir siap..." : "Bagus! Lanjut ke langkah berikutnya...");
      setTimeout(() => {
        if (finishedRef.current) return;
        if (stepIndex >= recipe.steps.length - 1) {
          finishRef.current(true);
        } else {
          setStepIndex((previous) => previous + 1);
          setStepCount(0);
          setHintShown(false);
          setShowTranslation(false);
          setActiveWord(null);
          setBusy(false);
          setMessage(recipe.steps[stepIndex + 1].comment);
          setEmotion("happy");
        }
      }, 650);
    } else {
      setMessage(`Bagus! ${nextCount} dari ${step.quantity}. Ambil ${step.quantity - nextCount} lagi.`);
    }
  };

  const openWord = (word) => {
    setActiveWord(word);
    setNotebook((previous) => {
      if (previous.some((item) => item.ar === word.ar)) return previous;
      return [...previous, { ...word, savedAt: new Date().toISOString() }];
    });
    playTone("click", soundEnabled);
  };

  const showHint = () => {
    setHelps((value) => value + 1);
    setHintShown(true);
    setMessage(step.hint);
    setEmotion("thinking");
    playTone("click", soundEnabled);
  };

  const saveName = (event) => {
    event.preventDefault();
    const clean = draftName.trim().slice(0, 24);
    if (!clean) return;
    setPlayerName(clean);
    setLoginOpen(false);
    setDraftName("");
  };

  const backHome = () => {
    setScreen("home");
    setActiveWord(null);
    setSelectedIngredient(null);
    setBusy(false);
  };

  const startNextRecipe = () => {
    const index = recipes.findIndex((item) => item.id === recipeId);
    const next = recipes[index + 1];
    if (next && progress.completed.includes(recipeId)) startRecipe(next.id);
    else backHome();
  };

  const renderHeader = () => (
    <header className="topbar">
      <button className="brand-button" onClick={backHome} aria-label="Kembali ke beranda">
        <span className="brand-pot">🍲</span>
        <span><strong>Dapur Arab</strong><small>Masak dulu, paham kemudian.</small></span>
      </button>
      <div className="top-actions">
        {screen !== "home" && <button className="nav-pill" onClick={backHome}>⌂ <span>Beranda</span></button>}
        <button className="nav-pill" onClick={() => setScreen("notebook")}>📒 <span>Buku Catatan</span></button>
        <button className="nav-pill" onClick={() => setScreen("leaderboard")}>🏆 <span>Peringkat</span></button>
        <button className={`icon-pill ${challengeMode ? "active" : ""}`} onClick={() => setChallengeMode((value) => !value)} title="Ganti mode menantang" aria-label="Ganti mode menantang">
          {challengeMode ? "🧠" : "🌱"} <span className="desktop-only">{challengeMode ? "Menantang" : "Belajar"}</span>
        </button>
        <button className="icon-pill" onClick={() => setSoundEnabled((value) => !value)} title="Aktif/nonaktifkan suara" aria-label="Aktif/nonaktifkan suara">
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        <button className="profile-pill" onClick={() => { setDraftName(playerName); setLoginOpen(true); }}>
          <span className="profile-avatar">👩‍🍳</span><span>{playerName || "Masuk"}</span>
        </button>
      </div>
    </header>
  );

  return (
    <div className="app-shell">
      {renderHeader()}

      {screen === "home" && (
        <main className="home-page">
          <section className="hero-card gingham">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> GAME KOSAKATA BAHASA ARAB</span>
              <h1>Selamat datang di<br /><span>Dapur Arab!</span></h1>
              <p>Ikuti resep, pilih bahan, dan pahami bahasa Arab lewat aksi memasak. Tidak perlu menghafal daftar kata.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => startRecipe(recipes.find((item, index) => isUnlocked(index) && !progress.completed.includes(item.id))?.id || recipes[0].id)}>
                  Mulai memasak <span>→</span>
                </button>
                <span className="hero-note">✨ Belajar sambil bermain</span>
              </div>
              <div className="hero-stats">
                <div><strong>{progress.completed.length}/{recipes.length}</strong><span>Resep selesai</span></div>
                <div><strong>{totalStars} ★</strong><span>Total bintang</span></div>
                <div><strong>{notebook.length}</strong><span>Kata dipelajari</span></div>
              </div>
            </div>
            <div className="hero-art">
              <div className="sun-doodle">✦</div>
              <div className="floating-food food-tomato">🍅</div>
              <div className="floating-food food-leaf">🌿</div>
              <div className="hero-cat-wrap"><CatChef /></div>
              <div className="speech-bubble">أهلاً وسهلاً!<br /><small>Ayo masak bareng!</small></div>
              <div className="counter-top"><span>🥣</span><span>🥕</span><span>🧂</span></div>
            </div>
          </section>

          <section className="recipe-section">
            <div className="section-heading">
              <div><span className="section-kicker">PILIH MISI DAPURMU</span><h2>Resep hari ini <span>🍽️</span></h2></div>
              <p>Selesaikan resep untuk membuka misi berikutnya.</p>
            </div>
            <div className="recipe-grid">
              {recipes.map((item, index) => {
                const unlocked = isUnlocked(index);
                const stars = progress.scores?.[item.id] || 0;
                return (
                  <article className={`recipe-card ${!unlocked ? "locked" : ""}`} key={item.id}>
                    <div className={`recipe-art recipe-art-${item.id}`}>
                      <span className="recipe-emoji">{item.emoji}</span>
                      {!unlocked && <div className="lock-overlay"><span>🔒</span><small>Selesaikan resep sebelumnya</small></div>}
                      <span className="recipe-number">0{index + 1}</span>
                    </div>
                    <div className="recipe-content">
                      <div className="recipe-title-row"><h3>{item.title}</h3><span className="arabic-mini" dir="rtl">{item.arabicTitle}</span></div>
                      <p>{item.subtitle}</p>
                      <div className="recipe-card-bottom">
                        <span className="stars-small" aria-label={`${stars} bintang`}>{"★".repeat(stars)}<span>{"☆".repeat(3 - stars)}</span></span>
                        <button disabled={!unlocked} className={unlocked ? "recipe-button" : "recipe-button disabled"} onClick={() => startRecipe(item.id)}>
                          {progress.completed.includes(item.id) ? "Main lagi" : "Mulai resep"} <span>↗</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="learning-strip">
            <div className="strip-icon">📚</div>
            <div><strong>Belajar sedikit demi sedikit</strong><p>Klik kata Arab untuk melihat arti, cara baca, dan mendengarkan pelafalannya.</p></div>
            <button className="text-button" onClick={() => setScreen("notebook")}>Buka Buku Catatan <span>→</span></button>
          </section>
          <footer className="site-footer"><span>🍅 Dapur Arab</span><span>Belajar bahasa Arab dengan cara yang menyenangkan.</span><span>Progres tersimpan di perangkat ini.</span></footer>
        </main>
      )}

      {screen === "game" && (
        <main className={`game-page ${shake ? "shake-screen" : ""}`}>
          <div className="game-heading">
            <button className="back-link" onClick={backHome}>← Kembali ke resep</button>
            <div className="game-recipe-title"><span>{recipe.emoji}</span><div><h1>{recipe.title}</h1><p>Langkah {stepIndex + 1} dari {recipe.steps.length}</p></div></div>
            <div className="step-progress" aria-label="Progres resep">
              {recipe.steps.map((item, index) => <span key={item.arabic} className={index < stepIndex ? "done" : index === stepIndex ? "current" : ""} />)}
            </div>
          </div>

          <section className="game-status-row">
            <div className="status-card timer-card"><span className="status-icon">⏱️</span><div><small>WAKTU</small><strong className={remaining <= 20 ? "danger-text" : ""}>{formatTime(remaining)}</strong></div><div className="timer-track"><span style={{ width: `${Math.max(0, (remaining / recipe.timeLimit) * 100)}%` }} /></div></div>
            <div className="status-card fire-card"><span className="status-icon">🔥</span><div><small>TINGKAT GOSONG</small><strong>{burn}%</strong></div><div className="fire-track"><span style={{ width: `${burn}%` }} /></div></div>
            <div className="status-card help-card"><span className="status-icon">💡</span><div><small>BANTUAN</small><strong>{helps} kali</strong></div><button onClick={showHint} disabled={busy} className="hint-button">Petunjuk</button></div>
          </section>

          <div className="game-layout">
            <section className="chef-panel">
              <div className="chef-stage"><div className="stage-spark spark-one">✦</div><div className="stage-spark spark-two">✧</div><CatChef emotion={emotion} /></div>
              <div className={`chef-message mood-message-${emotion}`}><span className="message-tail" />{message}</div>
              <div className="mini-tip"><span>💭</span><p>Tips: sentuh kata Arab untuk melihat artinya. Kata yang kamu buka masuk ke Buku Catatan.</p></div>
              <div className="game-controls">
                <button className="soft-button" onClick={() => setShowTranslation((value) => !value)}>{showTranslation ? "Sembunyikan arti" : "Terjemahkan kalimat"}</button>
                <button className="soft-button" onClick={() => speak(step.arabic)}>🔊 Dengarkan</button>
              </div>
            </section>

            <section className="cooking-panel">
              <div className="recipe-paper">
                <div className="paper-top"><span>📜 RESEP RAHASIA</span><span className="paper-stamp">DAPUR ARAB</span></div>
                <p className="instruction-label">IKUTI PERINTAH INI</p>
                <div className="arabic-instruction" dir="rtl" lang="ar">
                  {step.words.map((word, index) => (
                    <button key={`${word.ar}-${index}`} className={`arabic-word ${activeWord?.ar === word.ar ? "word-active" : ""}`} onClick={() => openWord(word)}>{word.ar}</button>
                  ))}
                </div>
                {showTranslation && <div className="sentence-translation">“{step.translation}”</div>}
                {activeWord && (
                  <div className="word-popover">
                    <button className="popover-close" onClick={() => setActiveWord(null)} aria-label="Tutup arti">×</button>
                    <div className="word-popover-ar" dir="rtl">{activeWord.ar}</div>
                    <strong>{activeWord.meaning}</strong>
                    <span>Cara baca: {activeWord.latin}</span>
                    <button className="listen-word" onClick={() => speak(activeWord.ar)}>🔊 Dengarkan kata</button>
                  </div>
                )}
                {hintShown && <div className="hint-box"><span>💡</span><span>{step.hint}</span></div>}
                <div className="paper-bottom"><span>✦ Satu langkah pada satu waktu</span><span>{stepCount}/{step.quantity} bahan</span></div>
              </div>

              <div className="workbench-label"><span>AREA MEMASAK</span><span className="mode-label">Ketuk bahan, lalu ketuk tempatnya</span></div>
              <div className="stations">
                <button
                  className={`station board-station ${step.target === "board" ? "target-station" : ""} ${selectedIngredient ? "station-ready" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); handlePlace(event.dataTransfer.getData("ingredientId"), "board"); }}
                  onClick={() => handlePlace(selectedIngredient, "board")}
                  aria-label="Talenan, letakkan bahan di sini"
                >
                  <span className="station-caption">🪵 TALENAN</span>
                  <div className="board-wood">
                    <div className="placed-foods">{placedBoard.map((item) => <Food key={item.key} item={item} tiny />)}</div>
                    <span className="board-handle" />
                  </div>
                  {step.target === "board" && <span className="target-badge">Letakkan di sini!</span>}
                </button>
                <button
                  className={`station vessel-station ${step.target === "vessel" ? "target-station" : ""} ${selectedIngredient ? "station-ready" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); handlePlace(event.dataTransfer.getData("ingredientId"), "vessel"); }}
                  onClick={() => handlePlace(selectedIngredient, "vessel")}
                  aria-label={`Wadah memasak ${recipe.station}, letakkan bahan di sini`}
                >
                  <span className="station-caption">🥣 {recipe.station.toUpperCase()}</span>
                  <div className={`vessel ${recipe.id === "eggs" ? "vessel-pan" : recipe.id === "mint-tea" ? "vessel-pot" : ""}`}>
                    <div className="vessel-foods">{placedVessel.map((item) => <Food key={item.key} item={item} tiny />)}</div>
                    <span className="steam steam-one" /><span className="steam steam-two" />
                  </div>
                  {step.target === "vessel" && <span className="target-badge">Letakkan di sini!</span>}
                </button>
              </div>

              <div className="ingredient-rack gingham">
                <div className="rack-heading"><div><strong>Rak bahan</strong><small>Pilih bahan yang sesuai dengan perintah</small></div><span>🧺</span></div>
                <div className="ingredient-grid">
                  {rackItems.map((item) => (
                    <button
                      key={item.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("ingredientId", item.id)}
                      onClick={() => { setSelectedIngredient(item.id); setMessage(`${item.meaning} dipilih. Sekarang letakkan di ${step.target === "board" ? "talenan" : recipe.station}.`); playTone("click", soundEnabled); }}
                      className={`ingredient-card ${selectedIngredient === item.id ? "ingredient-selected" : ""}`}
                      aria-label={`Pilih ${item.meaning}`}
                    >
                      <Food item={item} />
                      {!challengeMode && <span className="ingredient-ar" dir="rtl">{item.ar}</span>}
                      <span className="ingredient-meaning">{challengeMode ? "?" : item.meaning}</span>
                    </button>
                  ))}
                </div>
                {selectedIngredient && <div className="selected-note">Dipilih: <strong>{ingredients[selectedIngredient]?.meaning}</strong>. Sekarang ketuk talenan atau wadah.</div>}
                {challengeMode && <div className="challenge-note">🧠 Mode menantang aktif: nama bahan Arab disembunyikan.</div>}
              </div>
              <div className="game-bottom-actions">
                <button className="quiet-button" onClick={() => { setSelectedIngredient(null); setMessage(step.comment); }}>Batalkan pilihan</button>
                <span>Kesalahan: <strong className={mistakes > 0 ? "danger-text" : ""}>{mistakes}/3</strong></span>
              </div>
            </section>
          </div>
        </main>
      )}

      {screen === "result" && result && (
        <main className="result-page">
          <div className={`result-card ${result.success ? "result-success" : "result-fail"}`}>
            <div className="result-confetti">{result.success ? "✦ ✧ ✦" : "☁︎ ☁︎"}</div>
            <CatChef emotion={result.success ? "happy" : "sad"} />
            <span className="result-kicker">{result.success ? "MISI SELESAI" : "COBA LAGI, YA!"}</span>
            <h1>{result.success ? "Masakanmu berhasil!" : "Dapur butuh satu percobaan lagi."}</h1>
            <p>{result.success ? `Hebat, ${playerName || "Koki"}! Kamu sudah menyelesaikan ${result.recipeTitle}.` : "Tidak apa-apa kalau salah. Baca lagi perintah Arab, lalu coba resep ini sekali lagi."}</p>
            <div className="result-stars" aria-label={`${result.stars} bintang`}>
              {[1, 2, 3].map((star) => <span key={star} className={star <= result.stars ? "earned" : ""} style={{ animationDelay: `${star * 220}ms` }}>★</span>)}
            </div>
            <div className="result-stats">
              <div><span>❌</span><strong>{result.mistakes}</strong><small>Kesalahan</small></div>
              <div><span>💡</span><strong>{result.helps}</strong><small>Bantuan</small></div>
              <div><span>⏱️</span><strong>{formatTime(result.remaining)}</strong><small>Sisa waktu</small></div>
            </div>
            <div className="result-explanation">
              {result.success
                ? `Kamu mendapat ${result.stars} bintang. ${result.mistakes >= 2 ? "Dua kesalahan atau lebih mengurangi satu bintang. " : ""}${result.helps >= 2 ? "Penggunaan petunjuk dua kali atau lebih mengurangi satu bintang." : "Terus berlatih untuk mendapatkan tiga bintang!"}`
                : "Tiga kesalahan atau waktu habis membuat misi gagal. Kamu bisa mengulang tanpa kehilangan progres resep lain."}
            </div>
            <div className="result-actions">
              <button className="primary-button" onClick={() => startRecipe(result.recipeId)}>{result.success ? "Main lagi" : "Coba lagi"} ↻</button>
              {result.success && recipes.findIndex((item) => item.id === result.recipeId) < recipes.length - 1
                && <button className="secondary-button" onClick={startNextRecipe}>Resep berikutnya →</button>}
              <button className="text-button" onClick={backHome}>Kembali ke beranda</button>
            </div>
          </div>
        </main>
      )}

      {screen === "notebook" && (
        <main className="library-page">
          <div className="library-heading"><span className="large-icon">📒</span><div><span className="section-kicker">CATATAN BELAJARMU</span><h1>Buku Catatan Koki</h1><p>Kata yang kamu klik saat memasak akan tersimpan di sini.</p></div></div>
          {notebook.length === 0 ? (
            <div className="empty-state"><span>📝</span><h2>Belum ada kata yang dicatat</h2><p>Mulai resep, lalu klik kata Arab pada kertas resep untuk menyimpannya di sini.</p><button className="primary-button" onClick={() => startRecipe(recipes[0].id)}>Mulai belajar →</button></div>
          ) : (
            <div className="word-grid">
              {notebook.map((word, index) => (
                <article className="vocab-card" key={`${word.ar}-${index}`}>
                  <span className="vocab-number">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="vocab-ar" dir="rtl">{word.ar}</strong>
                  <h3>{word.meaning}</h3>
                  <p>{word.latin}</p>
                  <button className="listen-word" onClick={() => speak(word.ar)}>🔊 Dengarkan</button>
                </article>
              ))}
            </div>
          )}
          <div className="library-actions"><button className="secondary-button" onClick={backHome}>← Kembali ke beranda</button><button className="quiet-button" onClick={() => { if (window.confirm("Hapus semua kata dari Buku Catatan?")) setNotebook([]); }}>Hapus catatan</button></div>
        </main>
      )}

      {screen === "leaderboard" && (
        <main className="library-page leaderboard-page">
          <div className="library-heading"><span className="large-icon">🏆</span><div><span className="section-kicker">PAPAN SKOR</span><h1>Peringkat Koki</h1><p>Kumpulkan bintang dari setiap resep dan jadilah koki andalan.</p></div></div>
          <div className="leaderboard-card">
            <div className="leaderboard-top"><span>⭐</span><div><strong>Peringkat lokal</strong><small>Skor tersimpan pada browser/perangkat ini.</small></div></div>
            {leaderboard.length === 0 ? (
              <div className="empty-leaderboard"><span>👩‍🍳</span><h2>Belum ada skor</h2><p>Selesaikan resep untuk masuk ke papan peringkat.</p><button className="primary-button" onClick={() => startRecipe(recipes[0].id)}>Main sekarang →</button></div>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <div className={`leaderboard-row ${entry.name.toLowerCase() === (playerName || "").toLowerCase() ? "current-player" : ""}`} key={entry.name}>
                    <span className={`rank rank-${index + 1}`}>{index === 0 ? "👑" : index + 1}</span>
                    <span className="leader-avatar">{["👩‍🍳", "🧑‍🍳", "👨‍🍳"][index % 3]}</span>
                    <div className="leader-name"><strong>{entry.name}</strong><small>{entry.dishes || 0} misi selesai</small></div>
                    <strong className="leader-score">{entry.totalStars || 0} ★</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="local-warning">ℹ️ Papan peringkat ini bersifat lokal. Untuk papan skor online antarpengguna, aplikasi perlu dihubungkan ke backend seperti Supabase.</div>
          <button className="secondary-button" onClick={backHome}>← Kembali ke beranda</button>
        </main>
      )}

      {loginOpen && (
        <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}>
          <form className="profile-modal" onSubmit={saveName}>
            <button type="button" className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Tutup">×</button>
            <div className="modal-chef"><CatChef small /></div>
            <span className="section-kicker">PROFIL KOKI</span>
            <h2>Siapa nama koki hari ini?</h2>
            <p>Nama ini digunakan untuk menyimpan skor lokal di perangkatmu. Tidak perlu kata sandi.</p>
            <label htmlFor="player-name">Nama pemain</label>
            <input id="player-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={24} placeholder="Misalnya: Aisyah" autoFocus />
            <button className="primary-button full-button" type="submit">Simpan nama <span>→</span></button>
            <small className="privacy-note">Ini bukan akun online. Progres tersimpan di browser ini.</small>
          </form>
        </div>
      )}
    </div>
  );
}
