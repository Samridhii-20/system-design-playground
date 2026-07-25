"use client";

import { useState, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { SavedDiagram } from "@/types/savedDiagram";

interface SavedDiagramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "hld" | "lld";
  currentNodes: Node[];
  currentEdges: Edge[];
  onLoadDiagram: (diagram: SavedDiagram, readOnly: boolean) => void;
}

const STORAGE_KEY = "system_design_saved_diagrams";

export default function SavedDiagramsModal({
  isOpen,
  onClose,
  mode,
  currentNodes,
  currentEdges,
  onLoadDiagram,
}: SavedDiagramsModalProps) {
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [saveName, setSaveName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Sync saved diagrams whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setDiagrams(raw ? JSON.parse(raw) : []);
      } catch (err) {
        console.error("Failed to load saved diagrams:", err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = saveName.trim() || `${mode.toUpperCase()} Diagram ${new Date().toLocaleDateString()}`;

    const newDiagram: SavedDiagram = {
      id: `diag-${Date.now()}`,
      name: trimmed,
      mode,
      updatedAt: new Date().toLocaleString(),
      nodes: currentNodes,
      edges: currentEdges,
    };

    const updated = [newDiagram, ...diagrams];
    setDiagrams(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaveName("");
      showToast(`Saved "${trimmed}" successfully!`);
    } catch (err) {
      console.error("Failed to save diagram:", err);
      showToast("Error saving to localStorage.");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = diagrams.filter((d) => d.id !== id);
    setDiagrams(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast(`Deleted "${name}".`);
    } catch (err) {
      console.error("Failed to delete diagram:", err);
    }
  };

  const handleLoad = (diagram: SavedDiagram, readOnly: boolean) => {
    onLoadDiagram(diagram, readOnly);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📁</span>
            <div>
              <h2 className="text-base font-bold text-white">Saved Diagrams Library</h2>
              <p className="text-xs text-slate-400">View or edit your saved system designs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Save active canvas form */}
        <form onSubmit={handleSaveCurrent} className="p-4 bg-slate-950/60 border-b border-slate-800 flex gap-3 items-center">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder={`Name your current ${mode.toUpperCase()} diagram...`}
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>💾</span> Save Current Canvas
          </button>
        </form>

        {/* Toast Notification */}
        {toast && (
          <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs px-4 py-2 text-center font-medium animate-in fade-in">
            {toast}
          </div>
        )}

        {/* Saved List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {diagrams.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <span className="text-4xl">📥</span>
              <p className="text-sm font-medium text-slate-400">No saved diagrams found.</p>
              <p className="text-xs">Save your current workspace above to access it anytime later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diagrams.map((diag) => (
                <div
                  key={diag.id}
                  className="bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group shadow-sm hover:shadow-indigo-500/5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="truncate">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {diag.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Updated: {diag.updatedAt}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                        diag.mode === "lld"
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {diag.mode.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      📦 {diag.nodes.length} nodes · 🔗 {diag.edges.length} edges
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(diag.id, diag.name)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
                        title="Delete diagram"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => handleLoad(diag, true)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer border border-slate-700 flex items-center gap-1"
                        title="View diagram without editing"
                      >
                        <span>👁️</span> Load
                      </button>
                      <button
                        onClick={() => handleLoad(diag, false)}
                        className="bg-indigo-950 hover:bg-indigo-600 text-indigo-200 hover:text-white px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer border border-indigo-800 hover:border-indigo-500 flex items-center gap-1"
                        title="Open diagram in full edit mode"
                      >
                        <span>✏️</span> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
