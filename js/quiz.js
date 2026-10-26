/* Quiz-specific logic: random selection and plausible option pools.
   Distractors come from other real molecules in the bank, so every option is
   a valid IUPAC name of a structure that is genuinely different. */

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function weightedIndex(items, weights, random) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let cursor = random() * total;
  for (let i = 0; i < items.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return i;
  }
  return items.length - 1;
}

/**
 * Pick a random question. Ring structures are boosted a little so the
 * "chains or rings" mix stays interesting even though chains are more common.
 */
export function drawQuestion(pool, options = {}) {
  const { random = Math.random, avoidIds = [], recentCategories = [] } = options;
  const filtered = pool.filter((molecule) => !avoidIds.includes(molecule.id));
  const candidates = filtered.length ? filtered : pool;
  const lastCategory = recentCategories.at(-1);
  const weights = candidates.map((molecule) => {
    let weight = molecule.carbonCount < 3 ? 0.35 : 1;
    if (molecule.family === 'ring') weight *= 2.1;
    if (molecule.category === lastCategory) weight *= 0.45;
    return weight;
  });
  return candidates[weightedIndex(candidates, weights, random)];
}

export function buildOptions(question, allMolecules, count = 4, random = Math.random) {
  const correctName = question.name;
  const seen = new Set([correctName.toLowerCase()]);
  const selected = [];
  const add = (molecule) => {
    if (selected.length >= count - 1) return;
    const key = molecule.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    selected.push(molecule.name);
  };

  const others = allMolecules.filter((molecule) => molecule.id !== question.id);
  const groups = [
    others.filter(
      (molecule) =>
        molecule.formula === question.formula &&
        molecule.category === question.category &&
        molecule.family === question.family,
    ),
    others.filter(
      (molecule) =>
        molecule.formula === question.formula && molecule.category !== question.category,
    ),
    others.filter(
      (molecule) =>
        molecule.category === question.category &&
        molecule.carbonCount === question.carbonCount &&
        molecule.formula !== question.formula,
    ),
    others.filter(
      (molecule) =>
        molecule.category === question.category && molecule.formula !== question.formula,
    ),
    others.filter(
      (molecule) => molecule.family === question.family && molecule.formula !== question.formula,
    ),
    others,
  ];

  groups.forEach((group) => {
    const shuffled = shuffle(group, random);
    shuffled.forEach(add);
  });

  // This should never trigger with the curated bank, but keeps the UI robust
  // if a future edit leaves a category with only one valid candidate.
  let fallback = 1;
  while (selected.length < count - 1) {
    const candidate = `${question.name.replace(/\d+/g, String(fallback))}`;
    if (!seen.has(candidate.toLowerCase())) {
      seen.add(candidate.toLowerCase());
      selected.push(candidate);
    }
    fallback += 1;
    if (fallback > 40) break;
  }

  return shuffle(
    [{ name: correctName, correct: true }, ...selected.map((name) => ({ name, correct: false }))],
    random,
  );
}

export function answerFeedback(option, question) {
  if (option.correct) {
    return {
      tone: 'correct',
      title: 'Correct.',
      detail: question.rule,
    };
  }
  return {
    tone: 'wrong',
    title: 'Not quite.',
    detail: question.rule,
  };
}
