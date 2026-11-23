(function () {
  "use strict";

  /* ---------- Data ---------- */
  var WEEKS = [
    { w: 1,  name: "Welcome & what is law",            color: "orange" },
    { w: 2,  name: "History & first concepts",         color: "green"  },
    { w: 4,  name: "Theories, personality & treaties", color: "blue"   },
    { w: 6,  name: "Custom, sovereignty & statehood",  color: "pink"   },
    { w: 8,  name: "States, the UN & the ICJ",         color: "yellow" },
    { w: 9,  name: "The use of force",                 color: "red"    },
    { w: 10, name: "Human rights & humanitarian law",  color: "green"  }
  ];
  var OPT_COLORS = ["orange", "green", "blue", "pink"];
  var ITEMS = {};
  WEEKS.forEach(function (wk) {
    ITEMS[wk.w] = (window.PIL_DATA[wk.w] || []).map(function (r, i) {
      return { id: wk.w + "-" + i, w: wk.w, t: r.t, m: r.m, e: r.e, x: r.x };
    });
  });
  var ALL = [].concat.apply([], WEEKS.map(function (wk) { return ITEMS[wk.w]; }));

  /* ---------- Storage (optional; game works without it) ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("pilgame:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("pilgame:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  var settings = store.get("settings", { mode: "mix", len: 10 });
  var stats = store.get("stats", { answered: 0, correct: 0, bestStreak: 0, best: {} });

  /* ---------- Helpers ---------- */
  var app = document.getElementById("app");
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function low(s) { return String(s).toLowerCase(); }
  function weekMeta(w) { for (var i = 0; i < WEEKS.length; i++) if (WEEKS[i].w === w) return WEEKS[i]; return null; }

  /* ---------- Hand-drawn bits ---------- */
  var SVG = {
    circle: function (color) {
      return '<svg class="mark circle" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path class="draw" vector-effect="non-scaling-stroke" d="M22 36 C 8 16, 70 4, 112 6 C 162 8, 197 18, 193 34 C 189 52, 122 58, 80 56 C 34 54, 5 46, 11 29 C 15 18, 42 10, 66 9" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round"/></svg>';
    },
    strike: '<svg class="mark strike" viewBox="0 0 200 22" preserveAspectRatio="none" aria-hidden="true"><path class="draw" vector-effect="non-scaling-stroke" d="M2 13 L 28 7 L 55 15 L 88 6 L 122 15 L 158 7 L 198 12" fill="none" stroke="#e4502a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    uline: '<svg class="uline" viewBox="0 0 90 8" preserveAspectRatio="none" aria-hidden="true"><path d="M2 5 Q 22 1 45 5 T 88 4" fill="none" stroke="#2a2418" stroke-width="2" stroke-linecap="round"/></svg>',
    squig: function (c) { return '<svg class="squig" viewBox="0 0 84 8" preserveAspectRatio="none" aria-hidden="true"><path d="M2 5 q 6 -6 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0" fill="none" stroke="var(--' + c + ')" stroke-width="2" stroke-linecap="round"/></svg>'; },
    arrow: '<svg viewBox="0 0 26 14" aria-hidden="true"><path d="M1 7 H 23 M 17 2 L 24 7 L 17 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    backArrow: '<svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true"><path d="M26 9 C 18 3, 10 4, 3 8 M 8 3 L 2 8 L 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 34 30" aria-hidden="true"><path d="M17 27 C 6 19, 2 13, 4 8 C 6 3, 13 2, 17 9 C 21 2, 29 3, 30 9 C 32 15, 25 21, 17 27 M 9 9 L 24 20 M 12 6 L 27 16 M 7 13 L 20 23" fill="none" stroke="#2a1520" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    doodles: [
      '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="none" stroke="#fff" stroke-width="2"/><path d="M18 22h24M14 30h32M18 38h24" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 60 60"><path d="M30 8 C 46 18, 46 42, 30 52 C 14 42, 14 18, 30 8 Z M30 12 V 50" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 60 60"><g fill="none" stroke="#fff" stroke-width="2"><circle cx="30" cy="20" r="7"/><circle cx="20" cy="30" r="7"/><circle cx="40" cy="30" r="7"/><circle cx="30" cy="40" r="7"/><circle cx="30" cy="30" r="3"/></g></svg>',
      '<svg viewBox="0 0 60 60"><g fill="none" stroke="#fff" stroke-width="2"><circle cx="30" cy="30" r="18"/><path d="M12 30h36M30 12v36M17 18l26 24M43 18L17 42"/></g></svg>',
      '<svg viewBox="0 0 60 60"><path d="M10 40 C 20 20, 40 20, 50 40" fill="none" stroke="#fff" stroke-width="2"/><circle cx="30" cy="44" r="6" fill="none" stroke="#fff" stroke-width="2"/><path d="M42 12 l6 6 M48 12 l-6 6" stroke="#ef6a2b" stroke-width="2.4" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 60 60"><path d="M14 46 C 14 26, 26 14, 46 14 C 46 34, 34 46, 14 46 Z M14 46 L 40 20" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>'
    ],
    blockG: '<svg viewBox="0 0 60 60"><path d="M30 6 L 51 18 V 42 L 30 54 L 9 42 V 18 Z" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M22 20 V 40 M38 20 V 40 M22 30 H 38" stroke="#fff" stroke-width="2.4"/></svg>',
    blockB: '<svg viewBox="0 0 60 60"><circle cx="24" cy="24" r="14" fill="#f6f3ea"/><path d="M30 56 A 26 26 0 0 1 56 30 V 56 Z" fill="#f6f3ea"/><circle cx="46" cy="14" r="5" fill="#f6f3ea"/></svg>',
    blockO: '<svg viewBox="0 0 60 60"><g fill="none" stroke="#fff" stroke-width="2.4"><path d="M8 52 A 44 44 0 0 1 52 8"/><path d="M18 52 A 34 34 0 0 1 52 18"/><path d="M28 52 A 24 24 0 0 1 52 28"/><path d="M38 52 A 14 14 0 0 1 52 38"/></g></svg>'
  };

  /* ---------- Question generation ---------- */
  var ASK = {
    t2m: "What does this term mean?",
    m2t: "Which term matches this meaning?",
    e2t: "Explained like I'm 5. Which term is it?",
    x2t: "Slide example. Which term does it illustrate?"
  };
  function valid(type, it) {
    if (type === "t2m") return true;
    if (type === "m2t") return low(it.m).indexOf(low(it.t)) === -1;
    if (type === "e2t") return it.e.length > 6 && low(it.e).indexOf(low(it.t)) === -1;
    if (type === "x2t") return it.x.length >= 6 && !/^s\.\s?\d/i.test(it.x) && !/^(Challenge|Week|Art\. 4 list)/.test(it.x) && low(it.x).indexOf(low(it.t)) === -1;
    return false;
  }
  function pickType(it) {
    if (settings.mode !== "mix") return valid(settings.mode, it) ? settings.mode : "t2m";
    var bag = ["t2m", "t2m", "m2t", "m2t", "e2t", "x2t"].filter(function (t) { return valid(t, it); });
    return bag[Math.floor(Math.random() * bag.length)];
  }
  function makeQuestion(it) {
    var type = pickType(it);
    var field = type === "t2m" ? "m" : "t";
    var correct = it[field];
    var seen = {}; seen[low(correct)] = 1;
    var pool = shuffle(ITEMS[it.w].filter(function (o) { return o.id !== it.id; }));
    if (pool.length < 6) pool = pool.concat(shuffle(ALL.filter(function (o) { return o.w !== it.w; })).slice(0, 12));
    var cands = [];
    for (var i = 0; i < pool.length && cands.length < 10; i++) {
      var v = pool[i][field];
      if (!seen[low(v)]) { seen[low(v)] = 1; cands.push(v); }
    }
    // prefer distractors of similar length so length isn't a giveaway
    cands.sort(function (a, b) { return Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length); });
    var opts = shuffle([correct].concat(cands.slice(0, 3)));
    return { item: it, type: type, prompt: it[type === "t2m" ? "t" : type === "m2t" ? "m" : type === "e2t" ? "e" : "x"], options: opts, answer: opts.indexOf(correct) };
  }

  /* ---------- Game state ---------- */
  var game = null;
  function startGame(items, label, key, origKey) {
    var deck = shuffle(items);
    if (settings.len !== "all") deck = deck.slice(0, settings.len);
    game = { label: label, key: key, origKey: origKey != null ? origKey : key, deck: deck, i: 0, q: null, picked: null, results: [], streak: 0, best: 0, score: 0 };
    nextQuestion();
  }
  function nextQuestion() {
    if (game.i >= game.deck.length) return renderResults();
    game.q = makeQuestion(game.deck[game.i]);
    game.picked = null;
    renderQuiz();
  }
  function answer(idx) {
    if (!game || game.picked !== null) return;
    game.picked = idx;
    var ok = idx === game.q.answer;
    game.results.push({ item: game.q.item, ok: ok });
    if (ok) { game.score++; game.streak++; game.best = Math.max(game.best, game.streak); } else { game.streak = 0; }
    stats.answered++; if (ok) stats.correct++;
    stats.bestStreak = Math.max(stats.bestStreak || 0, game.best);
    store.set("stats", stats);
    renderQuiz();
  }
  function advance() { if (game && game.picked !== null) { game.i++; nextQuestion(); } }

  /* ---------- Views ---------- */
  function renderHome() {
    game = null;
    document.title = "PIL Term Game";
    var acc = stats.answered ? Math.round(100 * stats.correct / stats.answered) + "%" : "–";
    var today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    var weeksHtml = WEEKS.map(function (wk) {
      var best = stats.best[wk.w];
      var bestHtml = "";
      if (best != null) {
        bestHtml = '<span class="best">' + best + "%" + (best >= 80 ? SVG.circle("#1b1b1b").replace("mark circle", "") : "") + "</span>";
      }
      return '<li class="week-item"><button data-week="' + wk.w + '">' + bestHtml +
        '<span class="num c-' + wk.color + '">' + pad(wk.w) + "</span>" +
        '<span class="name c-' + wk.color + '">' + esc(wk.name) + "</span>" + SVG.squig(wk.color) +
        '<span class="meta">' + ITEMS[wk.w].length + " terms</span></button></li>";
    }).join("");

    function chip(group, val, label) {
      return '<button class="chip" data-set="' + group + '" data-val="' + val + '" aria-pressed="' + (String(settings[group]) === String(val)) + '">' + label + "</button>";
    }

    app.innerHTML =
      '<div class="home">' +
        '<section class="brief paper white holes tilt-l" aria-labelledby="title">' +
          '<div class="sticky"><span class="big">FINAL</span>' + SVG.uline + '<span class="small">exam prep</span></div>' +
          '<h1 class="display" id="title">Public International Law<span class="blue">Term Game</span></h1>' +
          '<p class="lede">Multiple choice, one week at a time. Get the official meaning, the plain-English version and the slide example after every answer.</p>' +
          '<ul class="week-list">' + weeksHtml + "</ul>" +
        "</section>" +

        '<div class="side">' +
          '<section class="email paper white tilt-r" aria-label="Your progress">' +
            '<p class="mono"><b>From:</b> Term Game<br><b>To:</b> You<br><b>Subject:</b> Re: Your progress<br><b>Date:</b> ' + esc(today) + "</p><hr>" +
            '<div class="stat"><span>Terms in the game</span><b>' + ALL.length + "</b></div>" +
            '<div class="stat"><span>Questions answered</span><b>' + stats.answered + "</b></div>" +
            '<div class="stat"><span>Accuracy</span><b>' + acc + "</b></div>" +
            '<div class="stat"><span>Best streak</span><b>' + (stats.bestStreak || 0) + "</b></div>" +
          "</section>" +
          '<section class="portfolio paper tab tilt-l" aria-labelledby="mixed-title">' +
            '<div class="sticky pink"><span class="small">all weeks!</span></div>' +
            '<h2 class="light-title" id="mixed-title">Mixed deck</h2>' +
            '<p class="lede">Every week shuffled together, for the final exam.</p>' +
            '<button class="mixed-btn" data-week="all" aria-label="Play the mixed deck">' +
              '<div class="mixed-art"><div class="y"><svg aria-hidden="true"><rect width="100%" height="100%" fill="url(#maze)"/></svg><span class="label">Play all ' + ALL.length + "</span></div>" +
              '<div class="bl"><svg aria-hidden="true"><rect width="100%" height="100%" fill="url(#waves)"/></svg></div></div>' +
            "</button>" +
          "</section>" +
          '<aside class="doodle-card tilt-xl">' +
            '<span class="mono" style="color:#9d988d">PIL · Weeks 1–10</span>' +
            '<span class="hand">pick a week, circle the right answer</span>' +
            "<p>Every term from the lecture slides, with its official meaning, a like-I'm-5 version and the slide example.</p>" +
            '<div class="doodle-grid" aria-hidden="true">' + SVG.doodles.join("") + "</div>" +
            '<div class="blocks" aria-hidden="true"><div class="g">' + SVG.blockG + '</div><div class="b">' + SVG.blockB + '</div><div class="o">' + SVG.blockO + "</div></div>" +
          "</aside>" +
        "</div>" +

        '<section class="settings paper tilt-r" aria-label="Game settings">' +
          '<div class="setting"><h3>Question style</h3><div class="chips">' +
            chip("mode", "mix", "Mix it up") + chip("mode", "t2m", "Term → meaning") + chip("mode", "m2t", "Meaning → term") + chip("mode", "e2t", "Like I'm 5 → term") +
          "</div></div>" +
          '<div class="setting"><h3>Round length</h3><div class="chips">' +
            chip("len", 10, "10 questions") + chip("len", 20, "20 questions") + chip("len", "all", "Whole week") +
          "</div></div>" +
        "</section>" +
        '<p class="footer-note">Progress is saved in this browser only.</p>' +
      "</div>";
  }

  function renderQuiz() {
    var q = game.q, wk = weekMeta(q.item.w);
    var total = game.deck.length, n = game.i + 1;
    document.title = "Question " + n + " of " + total + " · PIL Term Game";
    var answered = game.picked !== null;
    var ok = answered && game.picked === q.answer;
    var promptLong = q.type !== "t2m";

    var dots = game.deck.map(function (_, i) {
      var cls = i < game.results.length ? (game.results[i].ok ? "ok" : "no") : (i === game.i ? "now" : "");
      return '<i class="' + cls + '"></i>';
    }).join("");

    var opts = q.options.map(function (o, i) {
      var c = OPT_COLORS[i], extra = "", cls = "opt", mark = "";
      if (answered) {
        if (i === q.answer) { mark = SVG.circle("#1b1b1b") + '<span class="tag c-green">' + (ok ? "yes!" : "this one") + "</span>"; }
        else if (i === game.picked) { mark = SVG.strike; cls += " dim"; }
        else cls += " dim";
        extra = " disabled";
      }
      return '<li><button class="' + cls + '" data-opt="' + i + '"' + extra + ' aria-label="Option ' + (i + 1) + ": " + esc(o) + '">' +
        '<span class="n c-' + c + '">' + pad(i + 1) + "</span><span class=\"txt\">" + esc(o) + mark + "</span></button></li>";
    }).join("");

    var it = q.item;
    var feedback = "";
    if (answered) {
      feedback =
        '<section class="feedback paper white tilt-r" aria-live="polite">' +
          '<p class="mono"><b>Week ' + pad(it.w) + "</b> · " + esc(wk.name) + "</p>" +
          '<p class="verdict ' + (ok ? "ok" : "no") + '">' + (ok ? "Correct" : "Not quite") + "</p>" +
          '<p class="term">' + esc(it.t) + "</p>" +
          '<span class="label">Official meaning</span><p class="def">' + esc(it.m) + "</p>" +
          '<div class="eli">' + SVG.heart + '<span class="label">Like I\'m 5</span><p>' + esc(it.e) + "</p></div>" +
          '<span class="label">From the slides</span><p class="ex">' + esc(it.x) + "</p>" +
          '<button class="next" data-next>' + (game.i + 1 >= total ? "See results" : "Next question") + SVG.arrow + "</button>" +
        "</section>";
    }

    var side =
      '<div class="qside">' +
        '<section class="scorecard paper tilt-l" aria-label="Score">' +
          '<span class="label mono">Score</span>' +
          '<div class="big">' + game.score + "<small> / " + game.results.length + "</small></div>" +
          '<div class="streak">' + (game.streak >= 3 ? "streak ×" + game.streak + ", on a roll!" : "streak ×" + game.streak) + "</div>" +
        "</section>" +
        feedback +
        (answered ? "" : '<p class="hint">Keys: <kbd>1</kbd>–<kbd>4</kbd> to answer, <kbd>Enter</kbd> for next, <kbd>Esc</kbd> back to the desk.</p>') +
      "</div>";

    app.innerHTML =
      '<div class="quiz">' +
        '<div class="topbar"><button class="back" data-home>' + SVG.backArrow + "desk</button>" +
          '<div class="progress" aria-label="Question ' + n + " of " + total + '">' + dots + "</div></div>" +
        '<section class="qcard paper white holes tilt-l" aria-labelledby="qprompt">' +
          '<div class="meta-row"><span class="mono"><b>' + esc(game.label) + "</b></span>" +
            '<span class="mono">Question ' + pad(n) + " / " + pad(total) + "</span></div>" +
          '<p class="ask c-' + wk.color + '">' + ASK[q.type] + "</p>" +
          '<h2 class="prompt' + (promptLong ? " long" : "") + '" id="qprompt" tabindex="-1">' + esc(q.prompt) + "</h2>" +
          '<ol class="options">' + opts + "</ol>" +
        "</section>" + side +
      "</div>";

    if (answered) {
      var nb = app.querySelector("[data-next]");
      if (nb) {
        nb.focus({ preventScroll: true });
        if (window.innerWidth <= 1060) {
          var fb = app.querySelector(".feedback");
          if (fb) fb.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      }
    }
    else { var h = document.getElementById("qprompt"); if (h) h.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  }

  function renderResults() {
    var total = game.results.length, pct = total ? Math.round(100 * game.score / total) : 0;
    if (game.key != null) {
      var prev = stats.best[game.key];
      if (prev == null || pct > prev) stats.best[game.key] = pct;
      store.set("stats", stats);
    }
    var missed = game.results.filter(function (r) { return !r.ok; });
    var msg = pct >= 90 ? "Exam ready." : pct >= 70 ? "Nearly there!" : pct >= 50 ? "Halfway. Review the pink notes." : "Read the guide, then try again.";
    document.title = "Results · PIL Term Game";
    var list = missed.length
      ? "<ol>" + missed.map(function (r) {
          return "<li><b>" + esc(r.item.t) + "</b><span>" + esc(r.item.m) + "</span><em>" + esc(r.item.e) + "</em></li>";
        }).join("") + "</ol>"
      : '<p class="none">Nothing to review. Every one circled!</p>';

    app.innerHTML =
      '<div class="results">' +
        '<div class="topbar" style="grid-column:1/-1"><button class="back" data-home>' + SVG.backArrow + "desk</button><span></span></div>" +
        '<section class="result-card paper tab tilt-l" aria-labelledby="rtitle">' +
          '<div class="sticky"><span class="big">FINAL</span>' + SVG.uline + "</div>" +
          '<div class="head"><h2 class="light-title" id="rtitle">' + esc(game.label) + " results</h2>" +
            '<span class="mono">' + total + " questions · best streak " + game.best + "</span></div>" +
          '<div class="result-art"><div class="y"><svg class="pat" aria-hidden="true"><rect width="100%" height="100%" fill="url(#maze)"/></svg>' +
            '<div class="score">' + pct + "<small>%</small></div><div class=\"msg\">" + msg + "</div></div>" +
            '<div class="bl"><svg class="pat" aria-hidden="true"><rect width="100%" height="100%" fill="url(#waves)"/></svg></div></div>' +
          '<div class="actions">' +
            (missed.length ? '<button class="next" data-retry>Retry the ' + missed.length + " missed" + SVG.arrow + "</button>" : "") +
            '<button class="ghost" data-again>Play again</button>' +
            '<button class="ghost" data-home>Back to the desk</button>' +
          "</div>" +
        "</section>" +
        '<section class="review paper white tilt-r" aria-labelledby="rv">' +
          '<h3 class="display" id="rv" style="font-size:26px">To review <span class="c-pink hand" style="font-size:26px">(' + missed.length + ")</span></h3>" +
          list +
        "</section>" +
      "</div>";
    window.scrollTo({ top: 0 });
    var first = app.querySelector("[data-retry]") || app.querySelector("[data-again]");
    if (first) first.focus({ preventScroll: true });
  }

  /* ---------- Events ---------- */
  function playWeek(key) {
    if (key === "all") return startGame(ALL, "Mixed deck", "all");
    var w = +key, wk = weekMeta(w);
    startGame(ITEMS[w], "Week " + pad(w) + " · " + wk.name, w);
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.week) return playWeek(b.dataset.week);
    if (b.dataset.set) {
      var v = b.dataset.val; settings[b.dataset.set] = (b.dataset.set === "len" && v !== "all") ? +v : v;
      store.set("settings", settings); return renderHome();
    }
    if (b.dataset.opt != null) return answer(+b.dataset.opt);
    if (b.hasAttribute("data-next")) return advance();
    if (b.hasAttribute("data-home")) return renderHome();
    if (b.hasAttribute("data-again")) return playWeek(String(game.origKey));
    if (b.hasAttribute("data-retry")) {
      var missed = game.results.filter(function (r) { return !r.ok; }).map(function (r) { return r.item; });
      var keep = settings.len; settings.len = "all";
      var base = game.label.replace(/ · retry$/, "");
      startGame(missed, base + " · retry", null, game.origKey);
      settings.len = keep; return;
    }
  });
  document.addEventListener("keydown", function (e) {
    if (!game || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") return renderHome();
    if (!game.q || game.i >= game.deck.length) return;
    if (game.picked === null && /^[1-4]$/.test(e.key)) { e.preventDefault(); return answer(+e.key - 1); }
    if (game.picked !== null && (e.key === "Enter" || e.key === "ArrowRight")) {
      if (document.activeElement && document.activeElement.matches("[data-next]") && e.key === "Enter") return; // button handles it
      e.preventDefault(); advance();
    }
  });

  renderHome();
})();
