"use client";

import { type DragEvent, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { componentPalette } from "@/data/componentPalette";
import { designPatternCatalog } from "@/data/DesignPatternCatalog";


interface SidebarProps {
  mode: "hld" | "lld";
  onLoadPattern?: (patternId: string, append?: boolean) => void;
  onClearDiagram?: () => void;
}

/**
 * Sidebar — handles component palettes and configuration loads for both modes.
 */
export default function Sidebar({ mode, onLoadPattern, onClearDiagram }: SidebarProps) {
  const { getNodes, getEdges, deleteElements } = useReactFlow();

  const [simulationResult, setSimulationResult] = useState<{ totalLatency: number; path: string[] } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const response = await fetch("http://localhost:3001/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Simulation failed");
      }
      setSimulationResult(data);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <aside className="sidebar flex flex-col h-full overflow-y-auto overflow-x-hidden p-4 bg-slate-900 border-r border-slate-800 z-10 basis-64 shrink-0 shadow-xl select-none">
      {mode === "hld" ? (
        <>
          {/* HLD MODE SIDEBAR */}
          <div className="sidebar-header mb-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>🧩</span> HLD Components
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Drag onto the canvas to build topology
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            {componentPalette.map((item) => (
              <div
                key={item.type}
                className="sidebar-item group relative p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-grab active:cursor-grabbing border-l-[3px]"
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                style={{
                  borderLeftColor: item.color,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-white transition-colors">{item.label}</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Engine */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span>🚀</span> Simulation Engine
            </h3>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center justify-center w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors border border-indigo-500/50 shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </button>

            {simulationResult && (
              <div className="mt-2 p-3 bg-slate-950/50 rounded-md border border-slate-800 shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800/60">
                  <span className="text-xs text-slate-400">Total Latency:</span>
                  <span className="text-sm font-bold text-emerald-400">{simulationResult.totalLatency} ms</span>
                </div>
                <div className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Request Path:</div>
                <div className="flex flex-wrap gap-1">
                  {simulationResult.path.length > 0 ? simulationResult.path.map((step, idx) => (
                    <span key={idx} className="flex items-center text-[11px] text-slate-300">
                      {idx > 0 && <span className="mx-1.5 text-slate-600">→</span>}
                      <span className={`px-1.5 py-0.5 rounded border ${step.includes('HIT') ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' : step.includes('MISS') ? 'bg-rose-950/30 border-rose-800 text-rose-400' : 'bg-slate-800 border-slate-700'}`}>{step}</span>
                    </span>
                  )) : (
                    <span className="text-[11px] text-slate-500">No path trace available.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* LLD MODE SIDEBAR */}
          <div className="sidebar-header mb-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>📐</span> UML Components
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Drag onto the canvas to design classes
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            <div
              className="sidebar-item group relative p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/50 hover:bg-indigo-950/35 hover:border-indigo-700/60 transition-all cursor-grab active:cursor-grabbing border-l-[3px] border-l-indigo-400"
              draggable
              onDragStart={(e) => onDragStart(e, "umlClass")}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                <div>
                  <p className="text-sm font-medium text-white transition-colors">UML Class</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Standard class structure or abstract interface
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* Design Pattern Library */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-1">
              <span>📚</span> Design Pattern Presets
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {designPatternCatalog.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {pattern.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 font-mono font-semibold uppercase">
                      {pattern.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {pattern.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/80 mt-0.5">
                    <button
                      type="button"
                      onClick={() => onLoadPattern?.(pattern.id, true)}
                      className="flex-1 bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer border border-indigo-800/80 flex items-center justify-center gap-1"
                      title="Add this pattern's classes into your active diagram"
                    >
                      <span>➕</span> Add to Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadPattern?.(pattern.id, false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer border border-slate-700/80 flex items-center justify-center gap-1"
                      title="Replace current canvas with this pattern"
                    >
                      <span>🔄</span> Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer operations: Delete selected + Delete entire diagram */}
      <div className="mt-auto pt-4 pb-2 flex flex-col gap-2 shrink-0 border-t border-slate-800/80">
        <button
          onClick={() => {
            const selected = getNodes().filter((n) => n.selected);
            if (selected.length > 0) {
              deleteElements({ nodes: selected });
            }
          }}
          className="group flex items-center justify-start gap-2 text-[12px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer w-full text-left bg-transparent"
          title="Delete currently selected nodes"
        >
          <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-800 border border-slate-700 group-hover:border-rose-400/50 group-hover:text-rose-400 group-hover:bg-rose-400/10 transition-colors font-mono text-[10px]">⌫</kbd>
          Delete selected element
        </button>

        {onClearDiagram && (
          <button
            onClick={onClearDiagram}
            className="group flex items-center justify-start gap-2 text-[12px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer w-full text-left bg-transparent"
            title="Clear all nodes and connections from the active diagram"
          >
            <span className="text-xs text-slate-400 group-hover:text-rose-400 transition-colors">🗑️</span>
            Delete entire diagram
          </button>
        )}
      </div>
    </aside>
  );
}
