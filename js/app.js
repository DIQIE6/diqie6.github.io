import { prepareMolecule } from './chem.js';
import { MOLECULES, CATEGORY_SHORT } from './molecules.js';
import { renderMolecule } from './render.js';
import { buildOptions, drawQuestion } from './quiz.js';

const els = {
  questionNumber: document.getElementById('question-number'),
  familyTag: document.getElementById('family-tag'),
  formulaTag: document.getElementById('formula-tag'),
  structureMeta: document.getElementById('structure-meta'),
  metaDot: document.getElementById('meta-dot'),
  carbonBadge: document.getElementById('carbon-badge'),
  moleculeArt: document.getElementById('molecule-art'),
  moleculeStage: document.getElementById('molecule-stage'),
  namePlate: document.getElementById('name-plate'),
  nameDisplay: document.getElementById('name-display'),
  stageCaption: document.getElementById('stage-caption'),
  questionEyebrow: document.getElementById('question-eyebrow'),
  questionTitle: document.getElementById('question-title'),
  questionHint: document.getElementById('question-hint'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  feedbackTitle: document.getElementById('feedback-title'),
  feedbackLabel: document.getElementById('feedback-label'),
  feedbackAnswer: document.getElementById('feedback-answer'),
  feedbackRule: document.getElementById('feedback-rule'),
  nextButton: document.getElementById('next-button'),
  nextLabel: document.getElementById('next-label'),
  shareButton: document.getElementById('share-button'),
  headerScore: document.getElementById('header-score'),
  headerStreak: document.getElementById('header-streak'),
  scoreValue: document.getElementById('score-value'),
  answeredValue: document.getElementById('answered-value'),
  accuracyValue: document.getElementById('accuracy-value'),
  bestValue: document.getElementById('best-value'),
  streakValue: document.getElementById('streak-value'),
  countControl: document.getElementById('count-control'),
  modeControl: document.getElementById('mode-control'),
  familyFilter: document.getElementById('family-filter'),
  bankCount: document.getElementById('bank-count'),
  liveRegion: document.getElementById('live-region'),
  helpDialog: document.getElementById('help-dialog'),
  helpOpen: document.getElementById('help-open'),
  helpOpenSecondary: document.getElementById('help-open-secondary'),
  helpClose: document.getElementById('help-close'),
  helpStart: document.getElementById('help-start'),
  helpCount: document.getElementById('help-count'),
  confettiLayer: document.getElementById('confetti-layer'),
  toast: document.getElementById('toast'),
};

const STORAGE = {
  count: 'carbon-name-lab:count',
  family: 'carbon-name-lab:family',
  mode: 'carbon-name-lab:mode',
};

const storage = {
  get(key, fallback) {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private mode / file origin: ignore */
    }
  },
};

const state = {
  all: [],
  family: 'all',
  mode: 'name',
  optionCount: 4,
  score: 0,
  answered: 0,
  streak: 0,
  best: 0,
  serial: 0,
  current: null,
  options: [],
  currentAnswered: false,
  recentIds: [],
  recentCategories: [],
  lastHelpFocus: null,
  toastTimer: null,
};

function prepareBank() {
  const prepared = [];
  MOLECULES.forEach((molecule) => {
    try {
      prepared.push(prepareMolecule(molecule));
    } catch (error) {
      console.error('Skipping invalid molecule', molecule.name, error);
    }
  });
  return prepared;
}

function filteredPool() {
  if (state.family === 'all') return state.all;
  return state.all.filter((molecule) => molecule.family === state.family);
}

function updateBankCounts() {
  const chains = state.all.filter((molecule) => molecule.family === 'chain').length;
  const rings = state.all.filter((molecule) => molecule.family === 'ring').length;
  els.bankCount.textContent = String(state.all.length);
  if (els.helpCount) els.helpCount.textContent = `C1–C9 · ${state.all.length} structures`;
  const counts = { all: state.all.length, chain: chains, ring: rings };
  els.familyFilter.querySelectorAll('[data-family]').forEach((button) => {
    const count = button.querySelector('.filter-count');
    if (count) count.textContent = String(counts[button.dataset.family]);
  });
}

function setupFromStorage() {
  const storedCount = Number(storage.get(STORAGE.count, '4'));
  if (storedCount === 5) state.optionCount = 5;
  const storedFamily = storage.get(STORAGE.family, 'all');
  if (['all', 'chain', 'ring'].includes(storedFamily)) state.family = storedFamily;
  const storedMode = storage.get(STORAGE.mode, 'name');
  if (['name', 'structure'].includes(storedMode)) state.mode = storedMode;
}

function paintControls() {
  els.countControl.querySelectorAll('[data-count]').forEach((button) => {
    const active = Number(button.dataset.count) === state.optionCount;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  els.familyFilter.querySelectorAll('[data-family]').forEach((button) => {
    const active = button.dataset.family === state.family;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  els.modeControl.querySelectorAll('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function newQuestion(forcedMolecule = null) {
  const pool = filteredPool();
  if (!pool.length) return;

  const forced = forcedMolecule && state.all.find((molecule) => molecule.id === forcedMolecule.id);
  if (!forced) clearShareQuery();
  const next =
    forced ||
    drawQuestion(pool, {
      avoidIds: state.recentIds.slice(-6),
      recentCategories: state.recentCategories.slice(-2),
    });
  state.current = next;
  state.serial += 1;
  state.currentAnswered = false;
  const byName = new Map(state.all.map((molecule) => [molecule.name, molecule]));
  state.options = buildOptions(next, state.all, state.optionCount)
    .map((option) => ({ ...option, molecule: byName.get(option.name) }))
    .filter((option) => option.molecule);
  state.recentIds.push(next.id);
  state.recentIds = state.recentIds.slice(-12);
  state.recentCategories.push(next.category);
  state.recentCategories = state.recentCategories.slice(-5);

  paintQuestion();
  els.liveRegion.textContent =
    state.mode === 'structure'
      ? `New IUPAC name. Choose the matching structure from ${state.optionCount} options.`
      : `New molecule. Choose the IUPAC name from ${state.optionCount} options.`;
}

function paintQuestion() {
  const molecule = state.current;
  const isReverse = state.mode === 'structure';
  els.questionNumber.textContent = `${isReverse ? 'NAME' : 'MOLECULE'} ${String(state.serial).padStart(2, '0')}`;
  els.structureMeta.classList.toggle('is-name-mode', isReverse);
  els.feedback.hidden = true;
  els.feedback.classList.remove('is-correct', 'is-wrong');
  els.feedbackTitle.textContent = '';
  els.feedbackLabel.textContent = 'Correct answer:';
  els.feedbackAnswer.textContent = '';
  els.feedbackRule.textContent = '';
  els.nextLabel.textContent = isReverse ? 'New name' : 'New molecule';
  els.nextButton.setAttribute('aria-label', 'Skip this question and draw a new one');
  els.options.classList.toggle('structure-options', isReverse);
  els.options.innerHTML = '';

  if (isReverse) {
    els.familyTag.textContent = 'NAME → STRUCTURE';
    els.formulaTag.hidden = true;
    els.metaDot.hidden = true;
    els.moleculeArt.hidden = true;
    els.namePlate.hidden = false;
    els.nameDisplay.textContent = molecule.name;
    els.carbonBadge.hidden = true;
    els.stageCaption.textContent = 'IUPAC NAME';
    els.questionEyebrow.textContent = 'MATCH THE NAME';
    els.questionTitle.textContent = 'Which structure matches?';
    els.questionHint.textContent = 'Choose the skeletal formula that fits the IUPAC name.';
  } else {
    els.familyTag.textContent = molecule.family === 'ring' ? 'RING' : 'ACYCLIC';
    els.formulaTag.hidden = false;
    els.metaDot.hidden = false;
    els.formulaTag.textContent = molecule.formula;
    els.moleculeArt.hidden = false;
    els.namePlate.hidden = true;
    els.nameDisplay.textContent = '';
    els.carbonBadge.hidden = false;
    els.carbonBadge.textContent = `${molecule.carbonCount} C`;
    els.stageCaption.textContent = 'SKELETAL FORMULA';
    els.questionEyebrow.textContent = 'CHOOSE ONE';
    els.questionTitle.textContent = 'What is the IUPAC name?';
    els.questionHint.textContent = 'Pick the systematic English name.';
    els.moleculeArt.innerHTML = renderMolecule(molecule, {
      background: '#f6f2e7',
      alt: 'Skeletal formula of the mystery molecule',
    });
  }

  state.options.forEach((option, index) => {
    const letterText = String.fromCharCode(65 + index);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = isReverse ? 'option is-structure' : 'option';
    button.dataset.index = String(index);
    button.setAttribute(
      'aria-label',
      isReverse ? `Structure option ${letterText}` : `Option ${letterText}: ${option.name}`,
    );
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.textContent = letterText;

    if (isReverse) {
      const structure = document.createElement('span');
      structure.className = 'option-structure';
      structure.innerHTML = renderMolecule(option.molecule, {
        background: '#fffdf7',
        alt: `Structure option ${letterText}`,
      });
      button.append(letter, structure);
    } else {
      const text = document.createElement('span');
      text.className = 'option-text';
      text.textContent = option.name;
      button.append(letter, text);
    }
    button.addEventListener('click', () => selectOption(index));
    els.options.append(button);
  });
}

function selectOption(index) {
  if (state.currentAnswered) return;
  const option = state.options[index];
  if (!option) return;

  state.currentAnswered = true;
  const wasCorrect = option.correct;
  state.answered += 1;
  if (wasCorrect) {
    state.score += 1;
    state.streak += 1;
    state.best = Math.max(state.best, state.streak);
  } else {
    state.streak = 0;
  }

  const buttons = [...els.options.querySelectorAll('.option')];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    const candidate = state.options[buttonIndex];
    if (candidate.correct) {
      button.classList.add('is-correct');
    } else if (buttonIndex === index) {
      button.classList.add('is-wrong');
    } else {
      button.classList.add('is-muted');
    }
  });

  const isReverse = state.mode === 'structure';
  const correctAnswer = state.options.find((candidate) => candidate.correct)?.name || state.current.name;
  const selectedName = option.name;
  if (isReverse) {
    buttons.forEach((button, buttonIndex) => {
      button.setAttribute(
        'aria-label',
        `Option ${String.fromCharCode(65 + buttonIndex)}: ${state.options[buttonIndex].name}`,
      );
    });
  }
  els.feedback.hidden = false;
  els.feedback.classList.toggle('is-correct', wasCorrect);
  els.feedback.classList.toggle('is-wrong', !wasCorrect);
  els.feedbackTitle.textContent = wasCorrect ? 'Correct.' : 'Not quite.';
  els.feedbackLabel.textContent = isReverse ? 'Correct structure:' : 'Correct answer:';
  els.feedbackAnswer.textContent = isReverse
    ? `${correctAnswer} · ${state.current.formula}`
    : correctAnswer;
  const pickPrefix = isReverse && !wasCorrect ? `You picked ${selectedName}. ` : '';
  els.feedbackRule.textContent = `${pickPrefix}${CATEGORY_SHORT[state.current.category] || state.current.category} · ${state.current.rule}`;
  els.nextLabel.textContent = isReverse ? 'Next name' : 'Next molecule';
  els.nextButton.setAttribute('aria-label', 'Continue to the next question');
  els.liveRegion.textContent = isReverse
    ? wasCorrect
      ? `Correct. The matching structure is ${correctAnswer}. ${state.current.rule}`
      : `Not quite. You picked ${selectedName}. The correct structure is ${correctAnswer}. ${state.current.rule}`
    : wasCorrect
      ? `Correct. ${correctAnswer}. ${state.current.rule}`
      : `Not quite. The correct answer is ${correctAnswer}. ${state.current.rule}`;

  updateStats();
  if (wasCorrect) {
    els.scoreValue.classList.remove('is-popping');
    void els.scoreValue.offsetWidth;
    els.scoreValue.classList.add('is-popping');
    burstConfetti();
  }
}

function updateStats() {
  const accuracy = state.answered ? Math.round((state.score / state.answered) * 100) : null;
  els.headerScore.textContent = String(state.score);
  els.headerStreak.textContent = String(state.streak);
  els.scoreValue.textContent = String(state.score);
  els.answeredValue.textContent = String(state.answered);
  els.accuracyValue.textContent = accuracy === null ? '—' : `${accuracy}%`;
  els.bestValue.textContent = String(state.best);
  els.streakValue.textContent = String(state.streak);
}

function burstConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = els.moleculeStage.getBoundingClientRect();
  const colors = ['#dd5a3d', '#e8c565', '#2f7550', '#2e5fa3', '#f7f1e2'];
  for (let i = 0; i < 26; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${stage.left + 20 + Math.random() * (stage.width - 40)}px`;
    piece.style.top = `${stage.top + stage.height * 0.32 + Math.random() * 60}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
    piece.style.setProperty('--dy', `${110 + Math.random() * 180}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 80}ms`;
    els.confettiLayer.append(piece);
    window.setTimeout(() => piece.remove(), 1100);
  }
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 1600);
}

function clearShareQuery() {
  try {
    const url = new URL(location.href);
    if (!['q', 'mode', 'count'].some((key) => url.searchParams.has(key))) return;
    ['q', 'mode', 'count'].forEach((key) => url.searchParams.delete(key));
    const search = url.searchParams.toString();
    history.replaceState(null, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
  } catch {
    /* ignore history errors in embedded/file contexts */
  }
}

function readShareRequest() {
  let params;
  try {
    params = new URLSearchParams(location.search);
  } catch {
    return null;
  }
  const id = params.get('q');
  if (!id) return null;
  const molecule =
    state.all.find((candidate) => candidate.id === id) ||
    state.all.find((candidate) => candidate.id.split('-')[0] === id);
  if (!molecule) return null;
  const mode = params.get('mode');
  const count = Number(params.get('count'));
  return {
    molecule,
    mode: ['name', 'structure'].includes(mode) ? mode : null,
    count: count === 5 ? 5 : count === 4 ? 4 : null,
  };
}

function buildShareUrl() {
  const url = new URL(location.href);
  if (!state.current) return url.toString();
  // Share an opaque numeric key, not the id slug: the slug contains the name.
  url.searchParams.set('q', state.current.id.split('-')[0]);
  url.searchParams.set('mode', state.mode);
  url.searchParams.set('count', String(state.optionCount));
  url.hash = '';
  return url.toString();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to execCommand */
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

async function shareCurrent() {
  if (!state.current) return;
  const url = buildShareUrl();
  try {
    // Make the challenge URL visible even if clipboard access is blocked.
    history.replaceState(null, '', url);
  } catch {
    /* ignore history errors */
  }
  const payload = {
    title: '碳名局 · IUPAC challenge',
    text:
      state.mode === 'structure'
        ? 'Can you match this IUPAC name to the right structure?'
        : 'Can you name this molecule?',
    url,
  };
  const isMobileBrowser =
    navigator.userAgentData?.mobile === true ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const prefersNativeShare = typeof navigator.share === 'function' && isMobileBrowser;
  if (prefersNativeShare) {
    try {
      await navigator.share(payload);
      showToast('Shared');
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
      /* share sheet unavailable: fall back to copying */
    }
  }
  const copied = await copyText(url);
  showToast(copied ? 'Challenge link copied' : 'Copy failed — try the address bar');
}

function changeOptionCount(count) {
  if (count === state.optionCount) return;
  state.optionCount = count;
  storage.set(STORAGE.count, String(count));
  paintControls();
  newQuestion();
  showToast(`${count} answer choices`);
}

function changeFamily(family) {
  if (family === state.family) return;
  state.family = family;
  storage.set(STORAGE.family, family);
  paintControls();
  newQuestion();
  const label = family === 'all' ? 'all structures' : family === 'chain' ? 'chains only' : 'rings only';
  showToast(`Deck: ${label}`);
}

function changeMode(mode) {
  if (!['name', 'structure'].includes(mode) || mode === state.mode) return;
  state.mode = mode;
  storage.set(STORAGE.mode, mode);
  paintControls();
  newQuestion();
  showToast(mode === 'structure' ? 'Mode: Name → Structure' : 'Mode: Structure → Name');
}

function openHelp(event) {
  state.lastHelpFocus = event?.currentTarget || document.activeElement;
  if (typeof els.helpDialog.showModal === 'function') {
    if (!els.helpDialog.open) els.helpDialog.showModal();
  } else {
    els.helpDialog.setAttribute('open', '');
  }
}

function closeHelp() {
  if (typeof els.helpDialog.close === 'function') {
    if (els.helpDialog.open) els.helpDialog.close();
  } else {
    els.helpDialog.removeAttribute('open');
  }
  state.lastHelpFocus?.focus?.();
}

function bindEvents() {
  els.nextButton.addEventListener('click', () => newQuestion());
  els.shareButton.addEventListener('click', shareCurrent);

  els.countControl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-count]');
    if (!button) return;
    changeOptionCount(Number(button.dataset.count));
  });

  els.familyFilter.addEventListener('click', (event) => {
    const button = event.target.closest('[data-family]');
    if (!button) return;
    changeFamily(button.dataset.family);
  });

  els.modeControl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    changeMode(button.dataset.mode);
  });

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (els.helpDialog.open) return;
    const target = event.target;
    if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    if (event.key === 'Enter' && state.currentAnswered) {
      event.preventDefault();
      newQuestion();
      return;
    }

    if (state.currentAnswered) return;
    const key = event.key.toUpperCase();
    let index = -1;
    if (/^[A-E]$/.test(key)) index = key.charCodeAt(0) - 65;
    if (/^[1-5]$/.test(key)) index = Number(key) - 1;
    if (index >= 0 && index < state.options.length) {
      event.preventDefault();
      selectOption(index);
    }
  });

  [els.helpOpen, els.helpOpenSecondary].forEach((button) => {
    button.addEventListener('click', openHelp);
  });
  els.helpClose.addEventListener('click', closeHelp);
  els.helpStart.addEventListener('click', closeHelp);
  els.helpDialog.addEventListener('click', (event) => {
    if (event.target === els.helpDialog) closeHelp();
  });
  els.helpDialog.addEventListener('close', () => {
    state.lastHelpFocus?.focus?.();
  });
}

function init() {
  setupFromStorage();
  state.all = prepareBank();
  updateBankCounts();
  paintControls();
  updateStats();
  bindEvents();
  const shared = readShareRequest();
  if (shared) {
    if (shared.mode) state.mode = shared.mode;
    if (shared.count) state.optionCount = shared.count;
    paintControls();
    newQuestion(shared.molecule);
    showToast('Shared challenge loaded');
  } else {
    newQuestion();
  }

  // A tiny read-only debug surface used by the local QA script.
  window.__carbonQuiz = {
    state,
    getSnapshot: () => ({
      question: state.current?.name,
      formula: state.current?.formula,
      category: state.current?.category,
      family: state.current?.family,
      carbonCount: state.current?.carbonCount,
      mode: state.mode,
      options: state.options.map((option) => ({
        name: option.name,
        correct: option.correct,
        molecule: option.molecule?.name,
      })),
      answered: state.currentAnswered,
      score: state.score,
      serial: state.serial,
    }),
    selectOption,
    newQuestion,
    changeMode,
    getShareUrl: buildShareUrl,
  };
}

init();
