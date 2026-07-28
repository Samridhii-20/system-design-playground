"use client";

import { useState, useMemo, useEffect } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
import Sidebar from "@/components/Sidebar";
import FlowCanvas from "@/components/FlowCanvas";
import ConfigPanel from "@/components/ConfigPanel";
import CodePanel from "@/components/CodePanel";

// ─── Initial elements for HLD mode ───
import { initialNodes, initialEdges } from "@/data/initialElements";
import { designPatternCatalog } from "@/data/DesignPatternCatalog";
import { generateBoilerplate } from "@/utils/CodeGenerator";
import SavedDiagramsModal from "@/components/SavedDiagramsModal";
import type { SavedDiagram } from "@/types/savedDiagram";

/**
 * Main Layout containing the HLD & LLD Playground.
 *
 * Implements a dual-canvas state architecture so that HLD system topologies
 * and LLD UML class diagrams remain isolated and perfectly preserved on toggle.
 */
function MainApp() {
  const [mode, setMode] = useState<"hld" | "lld">("hld");

  // ─── Dual-Canvas Node/Edge States ───
  const [hldNodes, setHldNodes, onHldNodesChange] = useNodesState(initialNodes);
  const [hldEdges, setHldEdges, onHldEdgesChange] = useEdgesState(initialEdges);

  const [lldNodes, setLldNodes, onLldNodesChange] = useNodesState<Node>([]);
  const [lldEdges, setLldEdges, onLldEdgesChange] = useEdgesState<Edge>([]);

  // ─── Selections ───
  const [selectedHldNode, setSelectedHldNode] = useState<Node | null>(null);
  const [selectedLldNode, setSelectedLldNode] = useState<Node | null>(null);
  const [selectedLldEdge, setSelectedLldEdge] = useState<Edge | null>(null);

  // ─── LLD Preset Catalog tracking ───
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  // ─── Saved Diagrams Modal State ───
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // ─── Code Panel Drawer States ───
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"cpp" | "java" | "typescript" | "python">("typescript");

  // ─── Read-Only Mode State ───
  const [isReadOnly, setIsReadOnly] = useState(false);

  // ─── Adjustable & Collapsible Sidebars State ───
  const [leftWidth, setLeftWidth] = useState(280);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(320);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Load sidebar preferences from localStorage
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem("leftSidebarWidth");
      const savedLeftCollapsed = localStorage.getItem("isLeftCollapsed");
      const savedRight = localStorage.getItem("rightSidebarWidth");
      const savedRightCollapsed = localStorage.getItem("isRightCollapsed");

      if (savedLeft) setLeftWidth(Math.max(180, Math.min(500, Number(savedLeft))));
      if (savedLeftCollapsed !== null) setIsLeftCollapsed(savedLeftCollapsed === "true");
      if (savedRight) setRightWidth(Math.max(220, Math.min(600, Number(savedRight))));
      if (savedRightCollapsed !== null) setIsRightCollapsed(savedRightCollapsed === "true");
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save sidebar preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("leftSidebarWidth", String(leftWidth));
      localStorage.setItem("isLeftCollapsed", String(isLeftCollapsed));
      localStorage.setItem("rightSidebarWidth", String(rightWidth));
      localStorage.setItem("isRightCollapsed", String(isRightCollapsed));
    } catch {
      // Ignore localStorage errors
    }
  }, [leftWidth, isLeftCollapsed, rightWidth, isRightCollapsed]);

  // Global mousemove and mouseup listeners for dragging resizers
  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const newWidth = e.clientX;
        if (newWidth < 100) {
          setIsLeftCollapsed(true);
        } else {
          setIsLeftCollapsed(false);
          setLeftWidth(Math.max(180, Math.min(500, newWidth)));
        }
        window.dispatchEvent(new Event("resize"));
      } else if (isDraggingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth < 100) {
          setIsRightCollapsed(true);
        } else {
          setIsRightCollapsed(false);
          setRightWidth(Math.max(220, Math.min(600, newWidth)));
        }
        window.dispatchEvent(new Event("resize"));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      document.body.style.userSelect = "";
      window.dispatchEvent(new Event("resize"));
    };

    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Load a saved diagram onto the canvas (readOnly parameter determines View vs Edit mode)
  const handleLoadDiagram = (diagram: SavedDiagram, readOnly: boolean) => {
    setMode(diagram.mode);
    setIsReadOnly(readOnly);

    // Sanitize node IDs to guarantee 100% uniqueness and heal legacy saved duplicates
    const seenNodeIds = new Set<string>();
    const nodeRenameMap: Record<string, string> = {};

    const sanitizedNodes: Node[] = (diagram.nodes || []).map((node, index) => {
      let uniqueId = node.id;
      if (!uniqueId || seenNodeIds.has(uniqueId)) {
        uniqueId = `node-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;
        if (node.id) nodeRenameMap[node.id] = uniqueId;
      }
      seenNodeIds.add(uniqueId);
      return { ...node, id: uniqueId };
    });

    const seenEdgeIds = new Set<string>();
    const sanitizedEdges: Edge[] = (diagram.edges || []).map((edge, index) => {
      const source = nodeRenameMap[edge.source] || edge.source;
      const target = nodeRenameMap[edge.target] || edge.target;
      let uniqueEdgeId = edge.id;
      if (!uniqueEdgeId || seenEdgeIds.has(uniqueEdgeId)) {
        uniqueEdgeId = `edge-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;
      }
      seenEdgeIds.add(uniqueEdgeId);
      return { ...edge, id: uniqueEdgeId, source, target };
    });

    if (diagram.mode === "hld") {
      setHldNodes(sanitizedNodes);
      setHldEdges(sanitizedEdges);
      setSelectedHldNode(null);
    } else {
      setLldNodes(sanitizedNodes);
      setLldEdges(sanitizedEdges);
      setSelectedLldNode(null);
      setSelectedLldEdge(null);
    }
  };

  // Load or Append a pre-built Design Pattern Template onto LLD Canvas
  const handleLoadPattern = (patternId: string, append: boolean = false) => {
    const pattern = designPatternCatalog.find((p) => p.id === patternId);
    if (!pattern) return;

    // Deep copy to prevent mutating the original catalog preset elements
    const copiedNodes = JSON.parse(JSON.stringify(pattern.nodes));
    const copiedEdges = JSON.parse(JSON.stringify(pattern.edges));

    if (!append || lldNodes.length === 0) {
      setSelectedLldNode(null);
      setSelectedLldEdge(null);
      setActivePatternId(patternId);

      const formattedNodes: Node[] = copiedNodes.map((n: typeof pattern.nodes[0]) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.label,
          description: n.description,
          color: n.color,
          config: n.config,
        },
      }));

      setLldNodes(formattedNodes);
      setLldEdges(copiedEdges);
    } else {
      // Append mode: Add pattern classes into existing active diagram without overwriting
      const timestamp = Date.now();
      const idMap: Record<string, string> = {};

      // Calculate bounding box offset so newly added pattern spawns neatly to the right
      const maxExistingX = Math.max(...lldNodes.map((n) => n.position.x), 50);
      const minNewX = Math.min(...copiedNodes.map((n: typeof pattern.nodes[0]) => n.position.x));
      const offsetX = maxExistingX + 320 - minNewX;

      const formattedNodes: Node[] = copiedNodes.map((n: typeof pattern.nodes[0]) => {
        const newId = `${n.id}-${timestamp}`;
        idMap[n.id] = newId;
        return {
          id: newId,
          type: n.type,
          position: {
            x: n.position.x + offsetX,
            y: n.position.y,
          },
          data: {
            label: n.label,
            description: n.description,
            color: n.color,
            config: n.config,
          },
        };
      });

      const formattedEdges: Edge[] = copiedEdges.map((e: typeof pattern.edges[0]) => ({
        ...e,
        id: `${e.id}-${timestamp}`,
        source: idMap[e.source] || e.source,
        target: idMap[e.target] || e.target,
      }));

      setLldNodes((prev) => [...prev, ...formattedNodes]);
      setLldEdges((prev) => [...prev, ...formattedEdges]);
      setActivePatternId(patternId);
    }
  };

  // Clear all elements from the active canvas
  const handleClearDiagram = () => {
    if (confirm("Are you sure you want to delete the entire diagram?")) {
      if (mode === "hld") {
        setHldNodes([]);
        setHldEdges([]);
        setSelectedHldNode(null);
      } else {
        setLldNodes([]);
        setLldEdges([]);
        setSelectedLldNode(null);
        setSelectedLldEdge(null);
        setActivePatternId(null);
      }
    }
  };

  // Compile active LLD canvas class models to object-oriented code
  const generatedCode = useMemo(() => {
    if (mode !== "lld") return "";
    return generateBoilerplate(lldNodes, lldEdges, activeLanguage);
  }, [lldNodes, lldEdges, activeLanguage, mode]);

  // Find the active selected node from nodes array to avoid stale values during edits
  const activeSelectedNode = useMemo(() => {
    if (mode === "hld") {
      if (!selectedHldNode) return null;
      return hldNodes.find((n) => n.id === selectedHldNode.id) || null;
    } else {
      if (!selectedLldNode) return null;
      return lldNodes.find((n) => n.id === selectedLldNode.id) || null;
    }
  }, [mode, selectedHldNode, selectedLldNode, hldNodes, lldNodes]);

  // Find the active selected edge from lldEdges array to maintain exact reference stability during edits
  const activeSelectedEdge = useMemo(() => {
    if (mode !== "lld" || !selectedLldEdge) return null;
    return lldEdges.find((e) => e.id === selectedLldEdge.id) || null;
  }, [mode, selectedLldEdge, lldEdges]);

  const activeNodes = mode === "hld" ? hldNodes : lldNodes;
  const activeEdges = mode === "hld" ? hldEdges : lldEdges;

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* ─── Sleek Header & Mode Switcher ─── */}
      <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🛠️</span>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SYSTEM DESIGN & LLD PLAYGROUND
          </span>
        </div>

        {/* Premium Mode Switcher Pill */}
        <div className="flex bg-slate-950 p-1 rounded-full border border-slate-800 shadow-inner">
          <button
            onClick={() => setMode("hld")}
            className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
              mode === "hld"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ HLD System Topology
          </button>
          <button
            onClick={() => setMode("lld")}
            className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
              mode === "lld"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📐 UML LLD Diagram
          </button>
        </div>

        {/* Saved Diagrams & Status */}
        <div className="flex items-center gap-3">
          {isReadOnly && (
            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-800 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold shadow-inner animate-in fade-in">
              <span>👁️ View-Only Mode</span>
              <button
                onClick={() => setIsReadOnly(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer text-[10px]"
              >
                ✏️ Enable Editing
              </button>
            </div>
          )}
          <button
            onClick={() => setIsSavedModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 px-3 py-1.5 rounded-md border border-indigo-800 font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <span>📁</span> Saved Diagrams
          </button>
          <span className="text-xs text-slate-500">v1.2.0</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* ─── Main Content Layout ─── */}
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* Floating Restore Button for Left Sidebar */}
        {isLeftCollapsed && (
          <button
            onClick={() => {
              setIsLeftCollapsed(false);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
            }}
            className="absolute left-2 top-4 z-30 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-indigo-400 hover:text-white px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-xl transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            title="Expand Left Sidebar"
          >
            <span>▶</span>
            <span>Components</span>
          </button>
        )}

        {/* Sidebar */}
        <Sidebar
          mode={mode}
          onLoadPattern={handleLoadPattern}
          onClearDiagram={handleClearDiagram}
          width={leftWidth}
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={() => {
            setIsLeftCollapsed(!isLeftCollapsed);
            setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
          }}
        />

        {/* Left Resizer Drag Handle */}
        {!isLeftCollapsed && (
          <div
            className={`resizer-handle ${isDraggingLeft ? "is-dragging" : ""}`}
            onMouseDown={() => setIsDraggingLeft(true)}
            onDoubleClick={() => {
              setIsLeftCollapsed(true);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
            }}
            title="Drag to resize sidebar • Double-click to collapse"
          />
        )}

        {/* Dynamic Canvas Container */}
        <div className="flex-1 h-full relative">
          {mode === "hld" ? (
            <FlowCanvas
              mode="hld"
              nodes={hldNodes}
              edges={hldEdges}
              onNodesChange={onHldNodesChange}
              onEdgesChange={onHldEdgesChange}
              setNodes={setHldNodes}
              setEdges={setHldEdges}
              onNodeSelect={setSelectedHldNode}
              isReadOnly={isReadOnly}
            />
          ) : (
            <FlowCanvas
              mode="lld"
              nodes={lldNodes}
              edges={lldEdges}
              onNodesChange={onLldNodesChange}
              onEdgesChange={onLldEdgesChange}
              setNodes={setLldNodes}
              setEdges={setLldEdges}
              onNodeSelect={setSelectedLldNode}
              onEdgeSelect={setSelectedLldEdge}
              isReadOnly={isReadOnly}
            />
          )}
        </div>

        {/* Dynamic Bottom Code Drawer (LLD Only) */}
        {mode === "lld" && (
          <CodePanel
            code={generatedCode}
            activeLanguage={activeLanguage}
            onLanguageChange={setActiveLanguage}
            isOpen={isCodeDrawerOpen}
            onToggle={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
          />
        )}

        {/* Right Resizer Drag Handle */}
        {!isRightCollapsed && (
          <div
            className={`resizer-handle ${isDraggingRight ? "is-dragging" : ""}`}
            onMouseDown={() => setIsDraggingRight(true)}
            onDoubleClick={() => {
              setIsRightCollapsed(true);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
            }}
            title="Drag to resize inspector • Double-click to collapse"
          />
        )}

        {/* Floating Restore Button for Right Sidebar */}
        {isRightCollapsed && (
          <button
            onClick={() => {
              setIsRightCollapsed(false);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
            }}
            className="absolute right-2 top-4 z-30 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-indigo-400 hover:text-white px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-xl transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            title="Expand Inspector"
          >
            <span>◀</span>
            <span>Inspector</span>
          </button>
        )}

        {/* Config / Inspector Panel */}
        <ConfigPanel
          selectedNode={activeSelectedNode}
          selectedEdge={activeSelectedEdge}
          activePatternId={mode === "lld" ? activePatternId : null}
          isReadOnly={isReadOnly}
          width={rightWidth}
          isCollapsed={isRightCollapsed}
          onToggleCollapse={() => {
            setIsRightCollapsed(!isRightCollapsed);
            setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
          }}
        />
      </div>

      {/* Saved Diagrams Manager Modal */}
      <SavedDiagramsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        mode={mode}
        currentNodes={activeNodes}
        currentEdges={activeEdges}
        onLoadDiagram={handleLoadDiagram}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <MainApp />
    </ReactFlowProvider>
  );
}
