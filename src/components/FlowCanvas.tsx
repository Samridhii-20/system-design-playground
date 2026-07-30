"use client";

import {
  useCallback,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  addEdge,
  useReactFlow,
  Panel,
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

import type { UmlRelationshipType } from "@/types/uml";

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
  defaultRelationship?: UmlRelationshipType;
  isReadOnly?: boolean;
  onClearDiagram?: () => void;
  isLeftCollapsed?: boolean;
  onExpandLeftSidebar?: () => void;
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
  defaultRelationship = "association",
  isReadOnly = false,
  onClearDiagram,
  isLeftCollapsed = false,
  onExpandLeftSidebar,
}: FlowCanvasProps) {
  const { getNodes, getEdges, deleteElements } = useReactFlow();

  const handleDeleteSelected = useCallback(() => {
    if (isReadOnly) return;
    const selectedNodes = getNodes().filter((n) => n.selected);
    const selectedEdges = getEdges().filter((e) => e.selected);
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      deleteElements({ nodes: selectedNodes, edges: selectedEdges });
      if (onNodeSelect) onNodeSelect(null);
      if (onEdgeSelect) onEdgeSelect(null);
    }
  }, [isReadOnly, getNodes, getEdges, deleteElements, onNodeSelect, onEdgeSelect]);

  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  // Unique ID generator using timestamp and random salt to prevent React key collisions
  const getId = useCallback(
    () => `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    []
  );

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
      if (isReadOnly) return;
      const edgeId = `edge-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: edgeId,
            type: mode === "lld" ? "umlEdge" : "smoothstep",
            animated: mode === "hld",
            data: mode === "lld" ? { relationship: defaultRelationship } : undefined,
            style: mode === "lld" ? { stroke: "#818cf8", strokeWidth: 2.5 } : { stroke: "#94a3b8", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges, mode, defaultRelationship, isReadOnly]
  );

  // ─── Drag & Drop ────────────────────────────────────────
  const onDragOver = useCallback((event: DragEvent) => {
    if (isReadOnly) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, [isReadOnly]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      if (isReadOnly) return;
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
    [nodes, setNodes, mode, isReadOnly, getId]
  );

  // ─── Keyboard Delete ─────────────────────────────────────
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isReadOnly) return;
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
    [nodes, setNodes, setEdges, onNodeSelect, onEdgeSelect, isReadOnly]
  );

  return (
    <div className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isReadOnly ? () => {} : onNodesChange}
        onEdgesChange={isReadOnly ? () => {} : onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={!isReadOnly}
        nodesDraggable={true}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={null}
        defaultEdgeOptions={{
          type: mode === "lld" ? "umlEdge" : "smoothstep",
          animated: mode === "hld",
        }}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnDrag={true}
        proOptions={{ hideAttribution: true }}
      >
        {/* Custom SVG marker shapes for standard UML relationship lines */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            {/* Hollow arrowhead for UML Generalization / Inheritance (extends) */}
            <marker
              id="uml-inheritance-arrow"
              viewBox="0 0 14 14"
              refX="13"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 12 7 L 0 13 z" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
            </marker>
            <marker
              id="uml-inheritance-arrow-selected"
              viewBox="0 0 14 14"
              refX="13"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 12 7 L 0 13 z" fill="#3b0764" stroke="#c084fc" strokeWidth="2.5" />
            </marker>

            {/* Simple open arrowhead for UML Association / Dependency */}
            <marker
              id="uml-association-arrow"
              viewBox="0 0 14 14"
              refX="13"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 12 7 L 1 13" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker
              id="uml-association-arrow-selected"
              viewBox="0 0 14 14"
              refX="13"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 12 7 L 1 13" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            {/* Filled diamond for UML Composition */}
            <marker
              id="uml-composition-diamond"
              viewBox="0 0 16 16"
              refX="15"
              refY="8"
              markerWidth="12"
              markerHeight="12"
              orient="auto-start-reverse"
            >
              <path d="M 0 8 L 8 1 L 16 8 L 8 15 z" fill="#818cf8" stroke="#818cf8" strokeWidth="1.5" />
            </marker>
            <marker
              id="uml-composition-diamond-selected"
              viewBox="0 0 16 16"
              refX="15"
              refY="8"
              markerWidth="12"
              markerHeight="12"
              orient="auto-start-reverse"
            >
              <path d="M 0 8 L 8 1 L 16 8 L 8 15 z" fill="#c084fc" stroke="#f0abfc" strokeWidth="2" />
            </marker>

            {/* Hollow diamond for UML Aggregation */}
            <marker
              id="uml-aggregation-diamond"
              viewBox="0 0 16 16"
              refX="15"
              refY="8"
              markerWidth="12"
              markerHeight="12"
              orient="auto-start-reverse"
            >
              <path d="M 0 8 L 8 1 L 16 8 L 8 15 z" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
            </marker>
            <marker
              id="uml-aggregation-diamond-selected"
              viewBox="0 0 16 16"
              refX="15"
              refY="8"
              markerWidth="12"
              markerHeight="12"
              orient="auto-start-reverse"
            >
              <path d="M 0 8 L 8 1 L 16 8 L 8 15 z" fill="#3b0764" stroke="#c084fc" strokeWidth="2.5" />
            </marker>
          </defs>
        </svg>

        <Panel
          position="top-left"
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-2xl backdrop-blur-md z-20 select-none"
        >
          {isLeftCollapsed && onExpandLeftSidebar && (
            <>
              <button
                type="button"
                onClick={onExpandLeftSidebar}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-slate-800/80 hover:bg-slate-700 text-indigo-400 hover:text-white border border-slate-700/80 shadow-sm shrink-0"
                title="Expand Left Sidebar"
              >
                <span>▶</span>
                <span>Components</span>
              </button>
              <div className="h-4 w-px bg-slate-800 shrink-0" />
            </>
          )}

          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!hasSelection || isReadOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/80 shadow-sm shrink-0"
            title="Delete selected element (Backspace / Del)"
          >
            <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">⌫</kbd>
            <span>Delete selected element</span>
          </button>

          {onClearDiagram && (
            <>
              <div className="h-4 w-px bg-slate-800 shrink-0" />
              <button
                type="button"
                onClick={onClearDiagram}
                disabled={isReadOnly}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/80 shadow-sm shrink-0"
                title="Clear all nodes and connections from active diagram"
              >
                <span className="text-xs">🗑️</span>
                <span>Delete entire diagram</span>
              </button>
            </>
          )}
        </Panel>

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
