import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import type {
  VSMNode,
  VSMEdge,
  VSMMapData,
  VSMMapSummary,
  MapSettings,
  VSMNodeType,
  VSMEdgeType,
  VSMMetrics,
} from '../types/vsm';
import { defaultNodeData, defaultSettings } from '../types/vsm';
import { calculateMetrics } from '../lib/metrics';

interface VSMStore {
  // ── Map metadata ────────────────────────────────────────────────
  currentMapId: string | null;
  currentMapName: string;
  maps: VSMMapSummary[];
  view: 'home' | 'editor';

  // ── Canvas state ────────────────────────────────────────────────
  nodes: VSMNode[];
  edges: VSMEdge[];
  settings: MapSettings;
  selectedNodeId: string | null;
  metrics: VSMMetrics;

  // ── UI state ────────────────────────────────────────────────────
  activeEdgeType: VSMEdgeType;
  isSaving: boolean;
  isDirty: boolean;
  connectedUsers: number;

  // ── Actions ─────────────────────────────────────────────────────
  setView: (view: 'home' | 'editor') => void;
  setMaps: (maps: VSMMapSummary[]) => void;
  openMap: (id: string, name: string, data: VSMMapData) => void;
  closeMap: () => void;
  setCurrentMapName: (name: string) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: VSMNodeType, position: { x: number; y: number }) => VSMNode;
  updateNodeData: (id: string, data: Partial<VSMNode['data']>) => void;
  removeNode: (id: string) => void;

  setSelectedNode: (id: string | null) => void;
  setActiveEdgeType: (type: VSMEdgeType) => void;
  updateSettings: (settings: Partial<MapSettings>) => void;

  setNodes: (nodes: VSMNode[]) => void;
  setEdges: (edges: VSMEdge[]) => void;
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
  setConnectedUsers: (n: number) => void;

  getMapData: () => VSMMapData;
}

function recomputeMetrics(
  nodes: VSMNode[],
  edges: VSMEdge[],
  settings: MapSettings
): VSMMetrics {
  return calculateMetrics(nodes, edges, settings);
}

export const useVSMStore = create<VSMStore>((set, get) => ({
  currentMapId: null,
  currentMapName: 'Sin título',
  maps: [],
  view: 'home',
  nodes: [],
  edges: [],
  settings: defaultSettings,
  selectedNodeId: null,
  metrics: {
    taktTime: 0,
    leadTime: 0,
    vaTime: 0,
    nvaTime: 0,
    percentVA: 0,
    processCount: 0,
    inventoryCount: 0,
  },
  activeEdgeType: 'push',
  isSaving: false,
  isDirty: false,
  connectedUsers: 1,

  setView: (view) => set({ view }),
  setMaps: (maps) => set({ maps }),

  openMap: (id, name, data) => {
    const metrics = recomputeMetrics(data.nodes, data.edges, data.settings);
    set({
      currentMapId: id,
      currentMapName: name,
      nodes: data.nodes,
      edges: data.edges,
      settings: data.settings,
      metrics,
      view: 'editor',
      isDirty: false,
      selectedNodeId: null,
    });
  },

  closeMap: () =>
    set({
      view: 'home',
      currentMapId: null,
      currentMapName: 'Sin título',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
    }),

  setCurrentMapName: (name) => set({ currentMapName: name, isDirty: true }),

  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes) as VSMNode[];
    const metrics = recomputeMetrics(nodes, get().edges, get().settings);
    set({ nodes, metrics, isDirty: true });
  },

  onEdgesChange: (changes) => {
    const edges = applyEdgeChanges(changes, get().edges) as VSMEdge[];
    set({ edges, isDirty: true });
  },

  onConnect: (connection) => {
    const type = get().activeEdgeType;
    const edge = {
      ...connection,
      id: `e-${uuidv4()}`,
      type,
    } as VSMEdge;
    const edges = addEdge(edge, get().edges) as VSMEdge[];
    set({ edges, isDirty: true });
  },

  addNode: (type, position) => {
    const node: VSMNode = {
      id: `${type}-${uuidv4()}`,
      type,
      position,
      data: defaultNodeData(type),
    } as VSMNode;
    const nodes = [...get().nodes, node];
    const metrics = recomputeMetrics(nodes, get().edges, get().settings);
    set({ nodes, metrics, isDirty: true });
    return node;
  },

  updateNodeData: (id, data) => {
    const nodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    ) as VSMNode[];
    const metrics = recomputeMetrics(nodes, get().edges, get().settings);
    set({ nodes, metrics, isDirty: true });
  },

  removeNode: (id) => {
    const nodes = get().nodes.filter((n) => n.id !== id);
    const edges = get().edges.filter((e) => e.source !== id && e.target !== id);
    const metrics = recomputeMetrics(nodes, edges, get().settings);
    set({ nodes, edges, metrics, isDirty: true, selectedNodeId: null });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setActiveEdgeType: (type) => set({ activeEdgeType: type }),

  updateSettings: (s) => {
    const settings = { ...get().settings, ...s };
    const metrics = recomputeMetrics(get().nodes, get().edges, settings);
    set({ settings, metrics, isDirty: true });
  },

  setNodes: (nodes) => {
    const metrics = recomputeMetrics(nodes, get().edges, get().settings);
    set({ nodes, metrics });
  },
  setEdges: (edges) => set({ edges }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),
  setConnectedUsers: (connectedUsers) => set({ connectedUsers }),

  getMapData: () => ({
    nodes: get().nodes,
    edges: get().edges,
    settings: get().settings,
  }),
}));
