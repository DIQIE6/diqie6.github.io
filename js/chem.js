/* Chemistry primitives: a tiny SMILES reader, formula counter and 2D layout.
   The quiz only uses a curated set of small, valence-clean structures, so this
   deliberately supports the subset of SMILES needed by the bank. */

export const VALENCE = {
  C: 4,
  N: 3,
  O: 2,
  S: 2,
  Cl: 1,
  Br: 1,
  F: 1,
  I: 1,
};

const ELEMENT_RE = /^(Cl|Br|C|N|O|S|F|I)/;
const STEMS = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
const ELEMENT_ORDER = ['Br', 'Cl', 'F', 'I', 'N', 'O', 'S'];

function addBond(atoms, a, b, order = 1, closure = false) {
  if (a === b) throw new Error('A bond cannot join an atom to itself');
  const existing = atoms[a].bonds.find((bond) => bond.to === b);
  if (existing) {
    existing.order = order;
    existing.closure = closure || existing.closure;
    const back = atoms[b].bonds.find((bond) => bond.to === a);
    back.order = order;
    back.closure = closure || back.closure;
    return;
  }
  atoms[a].bonds.push({ to: b, order, closure });
  atoms[b].bonds.push({ to: a, order, closure });
}

/**
 * Parse the small-molecule subset of SMILES used by the question bank.
 * Supports: C/N/O/S/Cl/Br/F/I, branches, ring closures 1-9,
 * single/double/triple bonds, and implicit hydrogens.
 */
export function parseSmiles(smiles) {
  if (typeof smiles !== 'string' || !smiles.trim()) throw new Error('SMILES is empty');
  const source = smiles.trim();
  const atoms = [];
  const ringOpen = new Map();
  const ringClosures = [];
  const stack = [];
  let current = -1;
  let pendingOrder = 1;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (char === '(') {
      if (current < 0) throw new Error(`Unexpected branch at ${i}`);
      stack.push(current);
      continue;
    }
    if (char === ')') {
      if (!stack.length) throw new Error(`Unmatched branch close at ${i}`);
      current = stack.pop();
      continue;
    }
    if (char === '-' || char === '=' || char === '#') {
      pendingOrder = char === '-' ? 1 : char === '=' ? 2 : 3;
      continue;
    }
    if (/[1-9]/.test(char)) {
      if (current < 0) throw new Error(`Ring digit without an atom at ${i}`);
      const open = ringOpen.get(char);
      if (open) {
        addBond(atoms, open.index, current, pendingOrder, true);
        ringClosures.push({ a: open.index, b: current, order: pendingOrder });
        ringOpen.delete(char);
      } else {
        ringOpen.set(char, { index: current, order: pendingOrder });
      }
      pendingOrder = 1;
      continue;
    }
    if (char === ' ') {
      continue;
    }

    const match = source.slice(i).match(ELEMENT_RE);
    if (!match) throw new Error(`Unsupported SMILES token "${char}" at ${i}`);
    const element = match[1];
    const index = atoms.length;
    atoms.push({
      index,
      element,
      bonds: [],
      ringClosure: false,
    });
    if (current >= 0) addBond(atoms, current, index, pendingOrder);
    current = index;
    pendingOrder = 1;
    i += element.length - 1;
  }

  if (ringOpen.size) throw new Error(`Unclosed ring digit(s): ${[...ringOpen.keys()].join(', ')}`);
  if (stack.length) throw new Error('Unclosed branch');
  if (!atoms.length) throw new Error('SMILES contains no atoms');

  const bonds = [];
  atoms.forEach((atom) => {
    atom.bonds.forEach((bond) => {
      if (bond.to > atom.index) {
        bonds.push({ a: atom.index, b: bond.to, order: bond.order, closure: bond.closure });
      }
    });
  });

  const rings = findRings(atoms, ringClosures, bonds);
  const formula = countFormula(atoms);
  const carbonCount = atoms.filter((atom) => atom.element === 'C').length;

  return {
    source,
    atoms,
    bonds,
    ringClosures,
    rings,
    formula,
    carbonCount,
    isRing: rings.length > 0,
    ringSize: rings[0]?.length ?? 0,
  };
}

function countFormula(atoms) {
  const counts = { C: 0, H: 0 };
  atoms.forEach((atom) => {
    counts[atom.element] = (counts[atom.element] || 0) + 1;
    const used = atom.bonds.reduce((sum, bond) => sum + bond.order, 0);
    const hydrogens = Math.max(0, (VALENCE[atom.element] ?? 0) - used);
    counts.H += hydrogens;
  });

  let formula = '';
  const write = (element, count) => {
    if (!count) return;
    formula += element + (count === 1 ? '' : String(count));
  };
  write('C', counts.C);
  write('H', counts.H);
  ELEMENT_ORDER.forEach((element) => write(element, counts[element]));
  return formula;
}

function findRings(atoms, ringClosures, bonds) {
  const rings = [];
  ringClosures.forEach((closure) => {
    // Find a simple path between the two closure atoms without using the
    // closure bond itself. This is enough for the single-ring bank.
    const queue = [closure.a];
    const previous = new Map([[closure.a, null]]);
    while (queue.length) {
      const node = queue.shift();
      if (node === closure.b) break;
      atoms[node].bonds.forEach((bond) => {
        if (bond.to === closure.b && node === closure.a) return;
        if (bond.closure && bond.to === closure.b) return;
        if (previous.has(bond.to)) return;
        previous.set(bond.to, node);
        queue.push(bond.to);
      });
    }
    if (!previous.has(closure.b)) return;
    const path = [];
    let cursor = closure.b;
    while (cursor !== null) {
      path.push(cursor);
      cursor = previous.get(cursor);
    }
    path.reverse();
    if (path.length >= 3) rings.push(path);
  });
  return rings;
}

export function hydrogensOn(atom) {
  const used = atom.bonds.reduce((sum, bond) => sum + bond.order, 0);
  return Math.max(0, (VALENCE[atom.element] ?? 0) - used);
}

export function atomLabel(atom) {
  if (atom.element === 'C') return '';
  if (atom.element === 'O') {
    return hydrogensOn(atom) >= 1 ? 'OH' : 'O';
  }
  if (atom.element === 'S') {
    return hydrogensOn(atom) >= 1 ? 'SH' : 'S';
  }
  if (atom.element === 'N') {
    const h = hydrogensOn(atom);
    if (h === 0) return 'N';
    if (h === 1) return 'NH';
    return 'NH₂';
  }
  return atom.element;
}

export function displayFormula(parsed) {
  return parsed.formula;
}

export function carbonLabel(count) {
  return `${count} carbon${count === 1 ? '' : 's'}`;
}

export function stemForCarbonCount(count) {
  return STEMS[count - 1] ?? null;
}

/* ---------- 2D layout ---------- */

const BOND_LENGTH = 64;
const TAU = Math.PI * 2;

function normalize(v) {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function rotate(v, degrees) {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: v.x * Math.cos(rad) - v.y * Math.sin(rad),
    y: v.x * Math.sin(rad) + v.y * Math.cos(rad),
  };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(v, factor) {
  return { x: v.x * factor, y: v.y * factor };
}

function longestPath(parsed) {
  const adjacency = parsed.atoms.map((atom) => atom.bonds.map((bond) => bond.to));
  const n = parsed.atoms.length;
  let best = { path: [0], atomCount: 1, carbonCount: parsed.atoms[0].element === 'C' ? 1 : 0 };

  const walk = (start) => {
    const previous = new Map([[start, null]]);
    const queue = [start];
    let farthest = start;
    let farthestDistance = 0;
    while (queue.length) {
      const node = queue.shift();
      const d = previous.get(node);
      const depth = d === null ? 0 : pathDepth(previous, node);
      if (depth > farthestDistance) {
        farthestDistance = depth;
        farthest = node;
      }
      adjacency[node].forEach((next) => {
        if (previous.has(next)) return;
        previous.set(next, node);
        queue.push(next);
      });
    }
    const path = [];
    let cursor = farthest;
    while (cursor !== null) {
      path.push(cursor);
      cursor = previous.get(cursor);
    }
    path.reverse();
    const carbonCount = path.filter((index) => parsed.atoms[index].element === 'C').length;
    if (
      path.length > best.atomCount ||
      (path.length === best.atomCount && carbonCount > best.carbonCount)
    ) {
      best = { path, atomCount: path.length, carbonCount };
    }
  };

  for (let i = 0; i < n; i += 1) walk(i);
  return best.path;
}

function pathDepth(previous, node) {
  let depth = 0;
  let cursor = node;
  while (previous.get(cursor) !== null && previous.get(cursor) !== undefined) {
    depth += 1;
    cursor = previous.get(cursor);
  }
  return depth;
}

function polygonLayout(ring) {
  const n = ring.length;
  const radius = BOND_LENGTH / (2 * Math.sin(Math.PI / n));
  const center = { x: 0, y: 0 };
  const positions = new Map();
  ring.forEach((index, i) => {
    // Pointy-top rings read naturally for 5 and 6 membered rings.
    const angle = -Math.PI / 2 + (i * TAU) / n;
    positions.set(index, {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  });
  return { positions, center, radius };
}

function ringBranchDirections(center, atomPos, count) {
  const radial = normalize({ x: atomPos.x - center.x, y: atomPos.y - center.y });
  if (count <= 1) return [radial];
  const spread = 58;
  return Array.from({ length: count }, (_, i) => {
    const offset = (i - (count - 1) / 2) * spread;
    return rotate(radial, offset);
  });
}

function fanDirections(base, count) {
  if (count <= 1) return [base];
  const spread = count === 2 ? 56 : count === 3 ? 52 : 42;
  return Array.from({ length: count }, (_, i) => {
    const offset = (i - (count - 1) / 2) * spread;
    return rotate(base, offset);
  });
}

function acyclicLayout(parsed) {
  const positions = new Map();
  const path = longestPath(parsed);
  const pathSet = new Set(path);

  path.forEach((atomIndex, i) => {
    const x = i * BOND_LENGTH * Math.cos(Math.PI / 6);
    // Regular skeletal zigzag: 0, -h, 0, -h, ... keeps every bond at 64px.
    const y = i % 2 === 1 ? -BOND_LENGTH / 2 : 0;
    positions.set(atomIndex, { x, y });
  });

  function placeSubtree(atomIndex, parentIndex, start, direction, depth) {
    const pos = add(start, scale(direction, BOND_LENGTH));
    positions.set(atomIndex, pos);
    const children = parsed.atoms[atomIndex].bonds
      .map((bond) => bond.to)
      .filter((next) => next !== parentIndex);
    if (!children.length) return;

    if (children.length === 1) {
      // A 120-degree turn keeps the branch legible as a zigzag.
      const turn = depth % 2 === 0 ? 60 : -60;
      placeSubtree(children[0], atomIndex, pos, rotate(direction, turn), depth + 1);
      return;
    }

    const directions = fanDirections(direction, children.length);
    children.forEach((child, i) => {
      placeSubtree(child, atomIndex, pos, directions[i], depth + 1);
    });
  }

  path.forEach((atomIndex, i) => {
    const branches = parsed.atoms[atomIndex].bonds
      .map((bond) => bond.to)
      .filter((next) => !pathSet.has(next));
    if (!branches.length) return;

    const pos = positions.get(atomIndex);
    const prevIndex = i > 0 ? path[i - 1] : null;
    const nextIndex = i < path.length - 1 ? path[i + 1] : null;
    const prevDir = prevIndex !== null ? normalize({
      x: positions.get(prevIndex).x - pos.x,
      y: positions.get(prevIndex).y - pos.y,
    }) : null;
    const nextDir = nextIndex !== null ? normalize({
      x: positions.get(nextIndex).x - pos.x,
      y: positions.get(nextIndex).y - pos.y,
    }) : null;

    let base;
    if (prevDir && nextDir) {
      const bisector = normalize(add(prevDir, nextDir));
      base = scale(bisector, -1);
    } else {
      const towardChain = prevDir || nextDir;
      if (towardChain) {
        // Point away from the chain, choosing the upper/lower side in a
        // deterministic alternating pattern.
        base = rotate(towardChain, i % 2 === 0 ? -120 : 120);
      } else {
        base = { x: 0, y: -1 };
      }
    }

    const directions = fanDirections(base, branches.length);
    branches.forEach((child, branchIndex) => {
      placeSubtree(child, atomIndex, pos, directions[branchIndex], 0);
    });
  });

  return { positions, center: { x: 0, y: 0 } };
}

function ringLayout(parsed) {
  const positions = new Map();
  const ring = parsed.rings[0];
  const ringSet = new Set(ring);
  const polygon = polygonLayout(ring);
  polygon.positions.forEach((position, index) => positions.set(index, position));

  function placeSubtree(atomIndex, parentIndex, start, direction, depth) {
    const pos = add(start, scale(direction, BOND_LENGTH));
    positions.set(atomIndex, pos);
    const children = parsed.atoms[atomIndex].bonds
      .map((bond) => bond.to)
      .filter((next) => next !== parentIndex);
    if (!children.length) return;

    if (children.length === 1) {
      const turn = depth % 2 === 0 ? 60 : -60;
      placeSubtree(children[0], atomIndex, pos, rotate(direction, turn), depth + 1);
      return;
    }
    const directions = fanDirections(direction, children.length);
    children.forEach((child, i) => {
      placeSubtree(child, atomIndex, pos, directions[i], depth + 1);
    });
  }

  ring.forEach((atomIndex) => {
    const outside = parsed.atoms[atomIndex].bonds
      .map((bond) => bond.to)
      .filter((next) => !ringSet.has(next));
    if (!outside.length) return;
    const atomPos = positions.get(atomIndex);
    const directions = ringBranchDirections(polygon.center, atomPos, outside.length);
    outside.forEach((child, i) => {
      placeSubtree(child, atomIndex, atomPos, directions[i], 0);
    });
  });

  return { positions, center: polygon.center };
}

export function layoutMolecule(parsed) {
  return parsed.isRing ? ringLayout(parsed) : acyclicLayout(parsed);
}

export function prepareMolecule(molecule) {
  const parsed = parseSmiles(molecule.smiles);
  const layout = layoutMolecule(parsed);
  const points = [...layout.positions.values()];
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const padding = 58;
  const width = Math.max(150, maxX - minX) + padding * 2;
  const height = Math.max(130, maxY - minY) + padding * 2;
  const offsetX = padding - minX;
  const offsetY = padding - minY;

  const atomPositions = parsed.atoms.map((atom) => {
    const position = layout.positions.get(atom.index);
    return {
      index: atom.index,
      element: atom.element,
      label: atomLabel(atom),
      x: position.x + offsetX,
      y: position.y + offsetY,
      hydrogens: hydrogensOn(atom),
    };
  });

  return {
    ...parsed,
    ...molecule,
    atomPositions,
    width,
    height,
    viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
  };
}
