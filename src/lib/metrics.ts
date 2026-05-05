import type { VSMNode, VSMEdge, MapSettings, VSMMetrics, ProcessData, InventoryData } from '../types/vsm';

export function calculateMetrics(
  nodes: VSMNode[],
  _edges: VSMEdge[],
  settings: MapSettings
): VSMMetrics {
  const processNodes = nodes
    .filter((n) => n.type === 'process')
    .sort((a, b) => a.position.x - b.position.x);

  const inventoryNodes = nodes
    .filter((n) => n.type === 'inventory')
    .sort((a, b) => a.position.x - b.position.x);

  const taktTime =
    settings.demandPerDay > 0
      ? settings.availableTimePerDay / settings.demandPerDay
      : 0;

  const totalCycleTime = processNodes.reduce(
    (sum, n) => sum + ((n.data as ProcessData).cycleTime ?? 0),
    0
  );

  const totalInventoryTime = inventoryNodes.reduce(
    (sum, n) => sum + ((n.data as InventoryData).waitDays ?? 0) * 86400,
    0
  );

  const leadTime = totalCycleTime + totalInventoryTime;

  const vaTime = processNodes
    .filter((n) => (n.data as ProcessData).isValueAdded !== false)
    .reduce((sum, n) => sum + ((n.data as ProcessData).cycleTime ?? 0), 0);

  const nvaTime = leadTime - vaTime;
  const percentVA = leadTime > 0 ? (vaTime / leadTime) * 100 : 0;

  return {
    taktTime,
    leadTime,
    vaTime,
    nvaTime,
    percentVA,
    processCount: processNodes.length,
    inventoryCount: inventoryNodes.length,
  };
}

export function formatTime(seconds: number): string {
  if (seconds === 0) return '0 s';
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86400).toFixed(1)} días`;
}
