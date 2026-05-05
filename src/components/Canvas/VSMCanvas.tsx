import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useVSMStore } from '../../store/vsmStore';
import { useCollaboration } from '../../hooks/useCollaboration';
import type { VSMNodeType } from '../../types/vsm';

import SupplierNode from '../Symbols/SupplierNode';
import CustomerNode from '../Symbols/CustomerNode';
import ProcessNode from '../Symbols/ProcessNode';
import InventoryNode from '../Symbols/InventoryNode';
import KaizenNode from '../Symbols/KaizenNode';
import OperatorNode from '../Symbols/OperatorNode';

import PushEdge from '../Edges/PushEdge';
import PullEdge from '../Edges/PullEdge';
import InfoEdge from '../Edges/InfoEdge';

const nodeTypes = {
  supplier: SupplierNode,
  customer: CustomerNode,
  process: ProcessNode,
  inventory: InventoryNode,
  kaizen: KaizenNode,
  operator: OperatorNode,
};

const edgeTypes = {
  push: PushEdge,
  pull: PullEdge,
  infoManual: InfoEdge,
  infoElectronic: InfoEdge,
};

const defaultEdgeOptions = {
  animated: true,
};

export default function VSMCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, setSelectedNode, selectedNodeId,
    currentMapId,
    getMapData,
  } = useVSMStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const { broadcast, isRemoteUpdate } = useCollaboration(currentMapId);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!reactFlowWrapper.current || !rfInstance.current) return;
      const type = e.dataTransfer.getData('application/vsm-node') as VSMNodeType;
      if (!type) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      addNode(type, position);
    },
    [addNode]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      if (!isRemoteUpdate.current) {
        const data = getMapData();
        broadcast(data.nodes, data.edges);
      }
    },
    [onNodesChange, getMapData, broadcast, isRemoteUpdate]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      if (!isRemoteUpdate.current) {
        const data = getMapData();
        broadcast(data.nodes, data.edges);
      }
    },
    [onEdgesChange, getMapData, broadcast, isRemoteUpdate]
  );

  const handleConnect = useCallback(
    (connection: Parameters<typeof onConnect>[0]) => {
      onConnect(connection);
      const data = getMapData();
      broadcast(data.nodes, data.edges);
    },
    [onConnect, getMapData, broadcast]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onInit={onInit}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        className="bg-canvas-bg"
        style={{ cursor: selectedNodeId ? 'default' : 'grab' }}
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls
          className="!bg-panel !border-border-dark [&>button]:!bg-panel [&>button]:!text-slate-300 [&>button:hover]:!bg-panel-light [&>button]:!border-border-dark"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'supplier') return '#3b82f6';
            if (n.type === 'customer') return '#22c55e';
            if (n.type === 'inventory') return '#f59e0b';
            if (n.type === 'kaizen') return '#ef4444';
            if (n.type === 'operator') return '#94a3b8';
            return '#60a5fa';
          }}
          className="!bg-panel !border-border-dark"
          maskColor="rgba(15,23,42,0.6)"
        />
        <Panel position="top-right" className="text-[10px] text-slate-400 bg-white/60 px-2 py-1 rounded">
          Suelta elementos desde la paleta · Conecta arrastrando los handles
        </Panel>
      </ReactFlow>
    </div>
  );
}
