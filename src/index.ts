export interface CapacityEdge {
  from: number;
  to: number;
  capacity: number;
}
export interface FlowOptions {
  maxWork?: number;
}
export interface FlowResult {
  value: number;
  sourceSide: number[];
  cutEdgeIds: number[];
}
interface ResidualEdge {
  to: number;
  reverse: number;
  residual: number;
  originalId: number;
}
export function maxFlow(
  vertexCount: number,
  edges: readonly CapacityEdge[],
  source: number,
  sink: number,
  options: FlowOptions = {},
): FlowResult {
  if (!Number.isSafeInteger(vertexCount) || vertexCount < 1 || vertexCount > 1_000)
    throw new RangeError('Invalid vertexCount');
  const validVertex = (v: number) => {
    if (!Number.isSafeInteger(v) || v < 0 || v >= vertexCount)
      throw new RangeError('Invalid vertex');
  };
  validVertex(source);
  validVertex(sink);
  if (source === sink) throw new RangeError('Source and sink must differ');
  if (!options || typeof options !== 'object') throw new RangeError('Invalid options');
  if (!Array.isArray(edges) || edges.length > 100_000) throw new RangeError('Invalid edges');
  const maxWork = options.maxWork === undefined ? 10_000_000 : options.maxWork;
  if (!Number.isSafeInteger(maxWork) || maxWork < 1 || maxWork > 100_000_000)
    throw new RangeError('Invalid maxWork');
  const graph: ResidualEdge[][] = Array.from({ length: vertexCount }, () => []);
  let outgoingCapacity = 0;
  edges.forEach((edge, id) => {
    if (!edge || typeof edge !== 'object') throw new RangeError('Invalid edge');
    const { from, to, capacity } = edge;
    validVertex(from);
    validVertex(to);
    if (!Number.isSafeInteger(capacity) || capacity < 0)
      throw new RangeError('Capacities must be nonnegative safe integers');
    if (from === source) {
      outgoingCapacity += capacity;
      if (!Number.isSafeInteger(outgoingCapacity)) throw new RangeError('Flow value may overflow');
    }
    const forward: ResidualEdge = {
      to,
      reverse: graph[to]!.length + (from === to ? 1 : 0),
      residual: capacity,
      originalId: id,
    };
    const reverse: ResidualEdge = {
      to: from,
      reverse: graph[from]!.length,
      residual: 0,
      originalId: -1,
    };
    graph[from]!.push(forward);
    graph[to]!.push(reverse);
  });
  let work = 0;
  let value = 0;
  const tick = () => {
    if (++work > maxWork) throw new RangeError('Work limit exceeded');
  };
  while (true) {
    const previousVertex = new Int32Array(vertexCount).fill(-1);
    const previousEdge = new Int32Array(vertexCount).fill(-1);
    const queue = [source];
    previousVertex[source] = source;
    for (let head = 0; head < queue.length && previousVertex[sink]! < 0; head++) {
      const node = queue[head]!;
      for (let i = 0; i < graph[node]!.length; i++) {
        tick();
        const edge = graph[node]![i]!;
        if (edge.residual > 0 && previousVertex[edge.to]! < 0) {
          previousVertex[edge.to] = node;
          previousEdge[edge.to] = i;
          queue.push(edge.to);
          if (edge.to === sink) break;
        }
      }
    }
    if (previousVertex[sink]! < 0) break;
    let amount = Number.MAX_SAFE_INTEGER;
    for (let node = sink; node !== source; node = previousVertex[node]!)
      amount = Math.min(amount, graph[previousVertex[node]!]![previousEdge[node]!]!.residual);
    if (!Number.isSafeInteger(value + amount)) throw new RangeError('Flow value overflow');
    value += amount;
    for (let node = sink; node !== source; node = previousVertex[node]!) {
      const edge = graph[previousVertex[node]!]![previousEdge[node]!]!;
      edge.residual -= amount;
      graph[node]![edge.reverse]!.residual += amount;
    }
  }
  const reachable = new Uint8Array(vertexCount);
  const queue = [source];
  reachable[source] = 1;
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]!;
    for (const edge of graph[node]!) {
      tick();
      if (edge.residual > 0 && !reachable[edge.to]) {
        reachable[edge.to] = 1;
        queue.push(edge.to);
      }
    }
  }
  const sourceSide = Array.from({ length: vertexCount }, (_, i) => i).filter((i) => reachable[i]);
  const cutEdgeIds = edges
    .map((edge, id) => ({ edge, id }))
    .filter(({ edge }) => reachable[edge.from] && !reachable[edge.to])
    .map(({ id }) => id);
  return { value, sourceSide, cutEdgeIds };
}
