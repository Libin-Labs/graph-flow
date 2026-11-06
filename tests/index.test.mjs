import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
test('classic network max flow equals its minimum cut', () => {
  const edges = [
    { from: 0, to: 1, capacity: 3 },
    { from: 0, to: 2, capacity: 2 },
    { from: 1, to: 2, capacity: 1 },
    { from: 1, to: 3, capacity: 2 },
    { from: 2, to: 3, capacity: 4 },
  ];
  const result = lib.maxFlow(4, edges, 0, 3);
  assert.equal(result.value, 5);
  assert.deepEqual(result.sourceSide, [0]);
  assert.deepEqual(result.cutEdgeIds, [0, 1]);
});
test('residual reverse arcs permit rerouting and parallel capacities add', () => {
  const edges = [
    { from: 0, to: 1, capacity: 1 },
    { from: 0, to: 1, capacity: 2 },
    { from: 1, to: 2, capacity: 3 },
    { from: 2, to: 3, capacity: 3 },
    { from: 1, to: 3, capacity: 1 },
  ];
  assert.equal(lib.maxFlow(4, edges, 0, 3).value, 3);
});
test('zero capacities, loops and disconnected sink', () => {
  const result = lib.maxFlow(
    3,
    [
      { from: 0, to: 0, capacity: 4 },
      { from: 0, to: 1, capacity: 0 },
    ],
    0,
    2,
  );
  assert.equal(result.value, 0);
  assert.deepEqual(result.sourceSide, [0]);
});
test('seeded small networks match exhaustive source-sink cut enumeration', () => {
  let seed = 9251;
  const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let trial = 0; trial < 60; trial++) {
    const n = 5,
      edges = [];
    for (let from = 0; from < n; from++)
      for (let to = 0; to < n; to++)
        if (from !== to && rand() < 0.28)
          edges.push({ from, to, capacity: Math.floor(rand() * 6) });
    let cut = Infinity;
    for (let mask = 0; mask < 2 ** n; mask++)
      if (mask & 1 && !(mask & (1 << (n - 1)))) {
        let capacity = 0;
        for (const edge of edges)
          if (mask & (1 << edge.from) && !(mask & (1 << edge.to))) capacity += edge.capacity;
        cut = Math.min(cut, capacity);
      }
    assert.equal(lib.maxFlow(n, edges, 0, n - 1).value, cut);
  }
});
test('capacity arithmetic rejects total safe-integer overflow', () => {
  assert.throws(
    () =>
      lib.maxFlow(
        3,
        [
          { from: 0, to: 1, capacity: Number.MAX_SAFE_INTEGER },
          { from: 0, to: 2, capacity: 1 },
        ],
        0,
        2,
      ),
    RangeError,
  );
});
test('invalid endpoints, capacities, source and work are rejected', () => {
  assert.throws(() => lib.maxFlow(2, [{ from: 0, to: 1, capacity: -1 }], 0, 1), RangeError);
  assert.throws(() => lib.maxFlow(2, [], 0, 0), RangeError);
  assert.throws(
    () => lib.maxFlow(3, [{ from: 0, to: 1, capacity: 1 }], 0, 2, { maxWork: 1 }),
    RangeError,
  );
});
