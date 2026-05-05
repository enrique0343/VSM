import type { Node, Edge } from 'reactflow';

export type VSMNodeType =
  | 'supplier'
  | 'customer'
  | 'process'
  | 'inventory'
  | 'kaizen'
  | 'operator';

export type VSMEdgeType = 'push' | 'pull' | 'infoManual' | 'infoElectronic';

// ── Node data shapes ────────────────────────────────────────────────────────

export interface SupplierData {
  label: string;
}

export interface CustomerData {
  label: string;
  demandPerDay: number;
  demandUnit: string;
}

export interface ProcessData {
  label: string;
  cycleTime: number;        // segundos
  changeoverTime: number;   // segundos
  uptime: number;           // porcentaje 0-100
  operators: number;
  isValueAdded: boolean;
}

export interface InventoryData {
  label: string;
  units: number;
  waitDays: number;
}

export interface KaizenData {
  label: string;
  description: string;
}

export interface OperatorData {
  label: string;
  count: number;
}

export type VSMNodeData =
  | SupplierData
  | CustomerData
  | ProcessData
  | InventoryData
  | KaizenData
  | OperatorData;

// ── Typed React Flow nodes/edges ────────────────────────────────────────────

export type VSMNode = Node<VSMNodeData, VSMNodeType>;
export type VSMEdge = Edge & { type: VSMEdgeType };

// ── Map structure ───────────────────────────────────────────────────────────

export interface MapSettings {
  availableTimePerDay: number; // segundos disponibles por día
  demandPerDay: number;        // unidades demandadas por día
}

export interface VSMMapData {
  nodes: VSMNode[];
  edges: VSMEdge[];
  settings: MapSettings;
}

export interface VSMMapSummary {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface VSMMapFull extends VSMMapSummary {
  data: VSMMapData;
}

// ── Metrics ─────────────────────────────────────────────────────────────────

export interface VSMMetrics {
  taktTime: number;    // segundos/unidad
  leadTime: number;    // segundos totales
  vaTime: number;      // segundos de valor añadido
  nvaTime: number;     // segundos sin valor añadido
  percentVA: number;   // 0-100
  processCount: number;
  inventoryCount: number;
}

// ── Default data factories ───────────────────────────────────────────────────

export const defaultSettings: MapSettings = {
  availableTimePerDay: 28800, // 8 horas
  demandPerDay: 100,
};

export function defaultNodeData(type: VSMNodeType): VSMNodeData {
  switch (type) {
    case 'supplier':
      return { label: 'Proveedor' } satisfies SupplierData;
    case 'customer':
      return { label: 'Cliente', demandPerDay: 100, demandUnit: 'uds/día' } satisfies CustomerData;
    case 'process':
      return {
        label: 'Proceso',
        cycleTime: 60,
        changeoverTime: 300,
        uptime: 95,
        operators: 1,
        isValueAdded: true,
      } satisfies ProcessData;
    case 'inventory':
      return { label: 'Inventario', units: 500, waitDays: 2 } satisfies InventoryData;
    case 'kaizen':
      return { label: 'Kaizen', description: 'Área de mejora' } satisfies KaizenData;
    case 'operator':
      return { label: 'Operario', count: 1 } satisfies OperatorData;
  }
}
