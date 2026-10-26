/* Skeletal-formula renderer for the curated molecule bank. */

const INK = '#173b32';
const HETERO_COLORS = {
  O: '#c64c35',
  N: '#2e5fa3',
  Cl: '#397a43',
  Br: '#8b4f2f',
  F: '#397a43',
  I: '#6b4c8a',
  S: '#a1741d',
};

function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function trimStart(a, b, radius) {
  const direction = normalize({ x: b.x - a.x, y: b.y - a.y });
  return { x: a.x + direction.x * radius, y: a.y + direction.y * radius };
}

function labelWidth(label) {
  return Math.max(24, label.length * 14 + 12);
}

function labelRadius(atom) {
  if (!atom.label) return 0;
  return labelWidth(atom.label) / 2 - 3;
}

function bondGeometry(bond, atoms, ringCenter) {
  const a = atoms.get(bond.a);
  const b = atoms.get(bond.b);
  const pa = { x: a.x, y: a.y };
  const pb = { x: b.x, y: b.y };
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const length = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / length, y: dy / length };
  const normal = { x: -unit.y, y: unit.x };
  const aTrim = labelRadius(a);
  const bTrim = labelRadius(b);

  const makeLine = (offset, shorten = 0) => {
    const oa = { x: pa.x + normal.x * offset, y: pa.y + normal.y * offset };
    const ob = { x: pb.x + normal.x * offset, y: pb.y + normal.y * offset };
    const start = trimStart(oa, ob, aTrim);
    const end = trimStart(ob, oa, bTrim);
    const innerStart = trimStart(start, end, shorten);
    const innerEnd = trimStart(end, start, shorten);
    return { x1: innerStart.x, y1: innerStart.y, x2: innerEnd.x, y2: innerEnd.y };
  };

  if (bond.order === 1) return [makeLine(0)];
  if (bond.order === 2) {
    if (ringCenter) {
      // Put the second line inside the ring.
      const center = ringCenter;
      const toCenter = { x: center.x - mid(pa, pb).x, y: center.y - mid(pa, pb).y };
      const side = Math.sign(toCenter.x * normal.x + toCenter.y * normal.y) || 1;
      return [makeLine(0), makeLine(side * 7, 18)];
    }
    return [makeLine(-4.5), makeLine(4.5)];
  }
  if (bond.order === 3) return [makeLine(-7), makeLine(0), makeLine(7)];
  return [makeLine(0)];
}

export function renderMolecule(molecule, options = {}) {
  const background = options.background || '#fbfaf4';
  const atomById = new Map(molecule.atomPositions.map((atom) => [atom.index, atom]));
  const ringCenters = new Map();
  molecule.rings.forEach((ring) => {
    const points = ring.map((index) => atomById.get(index));
    const center = points.reduce(
      (acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }),
      { x: 0, y: 0 },
    );
    ringCenters.set(ring.join(','), center);
    ring.forEach((index) => ringCenters.set(index, center));
  });

  const bondMarkup = molecule.bonds
    .map((bond) => {
      const sameRing = molecule.rings.find(
        (ring) => ring.includes(bond.a) && ring.includes(bond.b),
      );
      const center = sameRing ? ringCenters.get(sameRing.join(',')) : null;
      const lines = bondGeometry(bond, atomById, center);
      return lines
        .map(
          (line) =>
            `<line class="bond-casing" x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}" />` +
            `<line class="bond-line" x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}" />`,
        )
        .join('');
    })
    .join('');

  const labelMarkup = molecule.atomPositions
    .filter((atom) => atom.label)
    .map((atom) => {
      const width = labelWidth(atom.label);
      const height = 32;
      const color = HETERO_COLORS[atom.element] || INK;
      return (
        `<g class="atom-label" transform="translate(${atom.x.toFixed(2)} ${atom.y.toFixed(2)})">` +
        `<rect x="${(-width / 2).toFixed(2)}" y="-16" width="${width.toFixed(2)}" height="${height}" rx="9" fill="${background}" />` +
        `<text text-anchor="middle" dominant-baseline="central" fill="${color}">${atom.label}</text>` +
        '</g>'
      );
    })
    .join('');

  const alt = options.alt || 'Chemical structure';
  return (
    `<svg class="molecule-svg" viewBox="${molecule.viewBox}" role="img" aria-label="${escapeHtml(alt)}" xmlns="http://www.w3.org/2000/svg">` +
    `<g stroke-linecap="round" stroke-linejoin="round">${bondMarkup}</g>` +
    labelMarkup +
    '</svg>'
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
