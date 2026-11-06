# @lp-labs/graph-flow

Edmonds–Karp maximum flow with independent residual arcs and a minimum-cut certificate. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes. No browser globals are accessed at import.

## Install

```sh
npm install @lp-labs/graph-flow
```

## Quick start

```js
import { maxFlow } from '@lp-labs/graph-flow';
console.log(maxFlow(2, [{ from: 0, to: 1, capacity: 7 }], 0, 1));
```

Use the named ESM imports shown above. CommonJS uses `const { maxFlow } = require('@lp-labs/graph-flow');`. Both formats ship declarations.

## Public API and customization

Runtime exports: `maxFlow`.

Public signatures: `maxFlow(vertexCount: number, edges: readonly CapacityEdge[], source: number, sink: number, options?: FlowOptions): FlowResult`.

Types: `CapacityEdge = { from: number; to: number; capacity: number }`; `FlowOptions = { maxWork?: number }`; `FlowResult = { value: number; sourceSide: number[]; cutEdgeIds: number[] }`. `maxWork` defaults to 10,000,000.

Capacities must be nonnegative safe integers. Returns max-flow value, residual-reachable sourceSide vertices, and original cutEdgeIds. Directed input arcs, parallel/antiparallel arcs, zero capacities, and self-loops are supported. All graph vertices are integer indices from `0` to `vertexCount - 1`; edges are copied into algorithm-owned structures. Options are per call; no global configuration.

## Errors, ownership and limits

Edmonds–Karp BFS augmentation uses O(VE²) worst-case time with a configurable residual-edge scan budget (default 10,000,000, maximum 100,000,000); V≤1,000 and E≤100,000. Flow totals that exceed safe integers throw. Invalid vertex counts, endpoints, edge shapes, option values, work exhaustion, and impossible numeric results raise `RangeError`. Results are fresh arrays/objects; input arrays are not mutated.

Synchronous algorithms are bounded by stated input/work limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, or callbacks. Finite floating-point behavior applies where weights are used. No I/O, network, persistence, or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript NodeNext builds produce ESM, CommonJS, and declarations. Installed ESM/CommonJS consumer checks and seeded or exhaustive reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
