"use client";

import {
  useCallback,
  useRef,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";

// ─── CSS ───
import "@xyflow/react/dist/style.css";

// ─── Custom node components ───
import LoadBalancerNode from "./nodes/LoadBalancerNode";
import ServerNode from "./nodes/ServerNode";
import DatabaseNode from "./nodes/DatabaseNode";
import CacheNode from "./nodes/CacheNode";
import UmlClassNode from "./nodes/UmlClassNode";

// ─── Custom edge components ───
import UmlEdge from "./edges/UmlEdge";

// ─── Data ───
import { componentPalette } from "@/data/componentPalette";
import { defaultConfigs } from "@/types/nodes";

// ─── Node & Edge mappings ───
const nodeTypes = {
  loadBalancer: LoadBalancerNode,
  server: ServerNode,
  database: DatabaseNode,
  cache: CacheNode,
  umlClass: UmlClassNode,
};

const edgeTypes = {
  umlEdge: UmlEdge,
};

interface FlowCanvasProps {
  mode: "hld" | "lld";
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodeSelect?: (node: Node | null) => void;
  onEdgeSelect?: (edge: Edge | null) => void;
}

/**
 * FlowCanvas — the interactive grid editor. Supports HLD system models & LLD UML diagram modes.
 */
export default function FlowCanvas({
  mode,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onNodeSelect,
  onEdgeSelect,
}: FlowCanvasProps) {
  // Simple incrementing ID for new nodes
  const nextId = useRef(200);
  const getId = () => `node-${nextId.current++}`;

  // ─── Selection tracking ─────────────────────────────────
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      if (onNodeSelect) {
        onNodeSelect(selectedNodes.length === 1 ? selectedNodes[0] : null);
      }
      if (onEdgeSelect) {
        onEdgeSelect(selectedEdges.length === 1 ? selectedEdges[0] : null);
      }
    },
    [onNodeSelect, onEdgeSelect]
  );

  // ─── Edge creation ───────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: mode === "lld" ? "umlEdge" : "smoothstep",
            animated: mode === "hld",
            data: mode === "lld" ? { relationship: "association" } : undefined,
            style: mode === "lld" ? { stroke: "#818cf8", strokeWidth: 2 } : { stroke: "#94a3b8", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges, mode]
  );

  // ─── Drag & Drop ────────────────────────────────────────
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      // 1. Read the component type from dataTransfer
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      let label = "";
      let configObj: unknown = undefined;
      let color = "#818cf8";
      let description = "UML Class Diagram box";

      if (mode === "lld" && nodeType === "umlClass") {
        const existingCount = nodes.filter((n) => n.type === "umlClass").length;
        label = `CustomClass${existingCount + 1}`;
        color = "#818cf8";
        description = "A standard low-level class structure";
        configObj = {
          isInterface: false,
          isAbstract: false,
          attributes: [],
          methods: [],
        };
      } else {
        // Look up the HLD palette config for this type
        const config = componentPalette.find((c) => c.type === nodeType);
        if (!config) return;

        const existingCount = nodes.filter((n) => n.type === nodeType).length;
        label = `${config.label} ${existingCount + 1}`;
        color = config.color;
        description = config.description;
        configObj = defaultConfigs[nodeType] ? { ...defaultConfigs[nodeType] } : undefined;
      }

      // 2. Convert drop position → flow coordinates
      // Instead of getReactFlowInstance, we can approximate drop position or let React Flow align it.
      // To ensure correct drop coordinates, standard window translation is applied.
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - 100;
      const y = event.clientY - rect.top - 50;

      // 3. Create the new node with default config
      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position: { x, y },
        data: {
          label,
          icon: nodeType === "umlClass" ? "📦" : (componentPalette.find((c) => c.type === nodeType)?.icon || "⚙️"),
          description,
          color,
          config: configObj,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes, mode]
  );

  // ─── Keyboard Delete ─────────────────────────────────────
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;

      if (event.key === "Backspace" || event.key === "Delete") {
        const selectedIds = new Set(
          nodes.filter((n) => n.selected).map((n) => n.id)
        );

        if (selectedIds.size === 0) return;

        setNodes((nds) => nds.filter((n) => !selectedIds.has(n.id)));
        setEdges((eds) =>
          eds.filter(
            (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
          )
        );

        if (onNodeSelect) onNodeSelect(null);
        if (onEdgeSelect) onEdgeSelect(null);
      }
    },
    [nodes, setNodes, setEdges, onNodeSelect, onEdgeSelect]
  );

  return (
    <div className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={null}
        defaultEdgeOptions={{
          type: mode === "lld" ? "umlEdge" : "smoothstep",
          animated: mode === "hld",
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* Custom SVG marker shapes for standard UML relationship lines */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            {/* Hollow arrowhead for UML Generalization / Inheritance (extends) */}
            <marker
              id="uml-inheritance-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
            </marker>

            {/* Simple open arrowhead for UML Association / Dependency */}
            <marker
              id="uml-association-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            {/* Filled diamond for UML Composition */}
            <marker
              id="uml-composition-diamond"
              viewBox="0 0 12 12"
              refX="0"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#818cf8" stroke="#818cf8" />
            </marker>

            {/* Hollow diamond for UML Aggregation */}
            <marker
              id="uml-aggregation-diamond"
              viewBox="0 0 12 12"
              refX="0"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
            </marker>
          </defs>
        </svg>

        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />

        <Controls position="bottom-right" className="controls-panel" />

        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            const color = (node.data as { color?: string })?.color;
            return color ?? "#64748b";
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="minimap-panel"
        />
      </ReactFlow>
    </div>
  );
}
