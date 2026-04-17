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
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Node,
  type NodeChange,
} from "@xyflow/react";

// ─── CSS (must be imported after Tailwind globals) ───
import "@xyflow/react/dist/style.css";

// ─── Custom node components ───
import LoadBalancerNode from "./nodes/LoadBalancerNode";
import ServerNode from "./nodes/ServerNode";
import DatabaseNode from "./nodes/DatabaseNode";
import CacheNode from "./nodes/CacheNode";

// ─── Data ───
import { initialNodes, initialEdges } from "@/data/initialElements";
import { componentPalette } from "@/data/componentPalette";
import { defaultConfigs } from "@/types/nodes";

/**
 * Register all custom node types.
 * Must be defined OUTSIDE the component to avoid re-creating on every render.
 */
const nodeTypes = {
  loadBalancer: LoadBalancerNode,
  server: ServerNode,
  database: DatabaseNode,
  cache: CacheNode,
};

interface FlowCanvasProps {
  /** Called whenever the selected node changes (or becomes null) */
  onNodeSelect?: (node: Node | null) => void;
}

/**
 * FlowCanvas — the main interactive graph editor.
 *
 * Handles:
 *   - Rendering nodes & edges
 *   - Drag-and-drop from sidebar → create new nodes
 *   - Keyboard delete (Backspace / Delete) → remove selected nodes
 *   - Drawing new edges between handles
 *   - Tracking which node is selected → dispatching to ConfigPanel
 *
 * Must be wrapped in <ReactFlowProvider> by the parent.
 */
export default function FlowCanvas({ onNodeSelect }: FlowCanvasProps) {
  // ─── State ───────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // screenToFlowPosition converts screen px → flow coordinates
  const { screenToFlowPosition } = useReactFlow();

  // Simple incrementing ID for new nodes
  const nextId = useRef(100);
  const getId = () => `node-${nextId.current++}`;

  // ─── Selection tracking ─────────────────────────────────
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Let React Flow apply all changes first
      onNodesChange(changes);

      // Check if any selection-related changes occurred
      const hasSelectionChange = changes.some(
        (c) => c.type === "select" || c.type === "remove"
      );

      if (hasSelectionChange && onNodeSelect) {
        // Defer reading the nodes state to after React Flow applies changes
        // We use setTimeout(0) to read from the next tick after state updates
        setTimeout(() => {
          // We need to read from the React Flow instance for the latest state
          // But since useNodesState is local, we compute the next state manually
        }, 0);
      }
    },
    [onNodesChange, onNodeSelect]
  );

  // We use onSelectionChange from ReactFlow for a cleaner approach
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (onNodeSelect) {
        onNodeSelect(selectedNodes.length === 1 ? selectedNodes[0] : null);
      }
    },
    [onNodeSelect]
  );

  // ─── Edge creation ───────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#94a3b8", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
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

      // 2. Look up the palette config for this type
      const config = componentPalette.find((c) => c.type === nodeType);
      if (!config) return;

      // 3. Convert screen position → flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 4. Auto-increment the label (e.g., "Server 3" if 2 servers exist)
      const existingCount = nodes.filter((n) => n.type === nodeType).length;
      const label = `${config.label} ${existingCount + 1}`;

      // 5. Create the new node with default config
      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position,
        data: {
          label,
          icon: config.icon,
          description: config.description,
          color: config.color,
          config: defaultConfigs[nodeType]
            ? { ...defaultConfigs[nodeType] }
            : undefined,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes, screenToFlowPosition]
  );

  // ─── Keyboard Delete ─────────────────────────────────────
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore keydown if user is typing in an input/textarea/select
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;

      if (event.key === "Backspace" || event.key === "Delete") {
        // Find all selected node IDs
        const selectedIds = new Set(
          nodes.filter((n) => n.selected).map((n) => n.id)
        );

        if (selectedIds.size === 0) return;

        // Remove selected nodes
        setNodes((nds) => nds.filter((n) => !selectedIds.has(n.id)));

        // Remove edges connected to deleted nodes
        setEdges((eds) =>
          eds.filter(
            (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
          )
        );

        // Clear selection
        if (onNodeSelect) onNodeSelect(null);
      }
    },
    [nodes, setNodes, setEdges, onNodeSelect]
  );

  // ─── Render ──────────────────────────────────────────────
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
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={null}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
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
