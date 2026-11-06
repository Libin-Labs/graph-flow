import { maxFlow, type CapacityEdge, type FlowOptions, type FlowResult } from '@lp-labs/graph-flow';
export type PublicTypes = [CapacityEdge, FlowOptions, FlowResult];
void maxFlow;
// @ts-expect-error public API requires numeric vertex counts
maxFlow('invalid', []);
