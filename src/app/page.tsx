"use client";

import { useState, useMemo } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
import Sidebar from "@/components/Sidebar";
import FlowCanvas from "@/components/FlowCanvas";
import ConfigPanel from "@/components/ConfigPanel";
import CodePanel from "@/components/CodePanel";

// ─── Initial elements for HLD mode ───
import { initialNodes, initialEdges } from "@/data/initialElements";
import { designPatternCatalog } from "@/data/DesignPatternCatalog";
import { generateBoilerplate } from "@/utils/CodeGenerator";

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

  const [lldNodes, setLldNodes, onLldNodesChange] = useNodesState([]);
  const [lldEdges, setLldEdges, onLldEdgesChange] = useEdgesState([]);

  // ─── Selections ───
  const [selectedHldNode, setSelectedHldNode] = useState<Node | null>(null);
  const [selectedLldNode, setSelectedLldNode] = useState<Node | null>(null);
  const [selectedLldEdge, setSelectedLldEdge] = useState<Edge | null>(null);

  // ─── LLD Preset Catalog tracking ───
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  // ─── Code Panel Drawer States ───
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<"typescript" | "java" | "csharp" | "python">("typescript");

  // Load a pre-built Design Pattern Template onto LLD Canvas
  const handleLoadPattern = (patternId: string) => {
    const pattern = designPatternCatalog.find((p) => p.id === patternId);
    if (!pattern) return;

    setSelectedLldNode(null);
    setSelectedLldEdge(null);
    setActivePatternId(patternId);

    // Deep copy to prevent mutating the original catalog preset elements
    const copiedNodes = JSON.parse(JSON.stringify(pattern.nodes));
    const copiedEdges = JSON.parse(JSON.stringify(pattern.edges));

    // Format nodes to standard React Flow structure with 'data' payload
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

        {/* Status badges */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">v1.2.0</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* ─── Main Content Layout ─── */}
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* Sidebar */}
        <Sidebar mode={mode} onLoadPattern={handleLoadPattern} />

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

        {/* Config / Inspector Panel */}
        <ConfigPanel
          selectedNode={activeSelectedNode}
          selectedEdge={mode === "lld" ? selectedLldEdge : null}
          activePatternId={mode === "lld" ? activePatternId : null}
        />
      </div>
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
