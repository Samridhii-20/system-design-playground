"use client";

import { useState, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { SavedDiagram } from "@/types/savedDiagram";
import { exportDiagramAsEditablePNG, extractDiagramFromPNG } from "@/utils/pngMetadata";

interface SavedDiagramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "hld" | "lld";
  currentNodes: Node[];
  currentEdges: Edge[];
  activeDiagramId?: string | null;
  activeDiagramName?: string | null;
  hasUnsavedChanges?: boolean;
  onMarkChangesSaved?: () => void;
  onLoadDiagram: (diagram: SavedDiagram, readOnly: boolean) => void;
}

const STORAGE_KEY = "system_design_saved_diagrams";

export default function SavedDiagramsModal({
  isOpen,
  onClose,
  mode,
  currentNodes,
  currentEdges,
  activeDiagramId,
  activeDiagramName,
  hasUnsavedChanges,
  onMarkChangesSaved,
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
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Sync saved diagrams whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed: SavedDiagram[] = raw ? JSON.parse(raw) : [];
        setDiagrams(parsed);
        // Do NOT auto-select any card when opening!
      } catch (err) {
        console.error("Failed to load saved diagrams:", err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isLoadedDiagramExisting = Boolean(
    activeDiagramId && diagrams.some((d) => d.id === activeDiagramId)
  );

  // Show Update Modification button ONLY if there are unsaved changes since last save/load
  const showUpdateBtn = isLoadedDiagramExisting && Boolean(hasUnsavedChanges);

  const handleUpdateLoadedDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiagramId) return;

    const trimmed = saveName.trim() || activeDiagramName || `${mode.toUpperCase()} Diagram`;

    const updated = diagrams.map((diag) => {
      if (diag.id === activeDiagramId) {
        return {
          ...diag,
          name: trimmed,
          updatedAt: new Date().toLocaleString(),
          nodes: currentNodes,
          edges: currentEdges,
        };
      }
      return diag;
    });

    setDiagrams(updated);
    if (onMarkChangesSaved) onMarkChangesSaved();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast(`Updated "${trimmed}" modifications!`);
    } catch (err) {
      console.error("Failed to update diagram:", err);
      showToast("Error updating diagram in localStorage.");
    }
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = saveName.trim();

    if (!trimmed) {
      showToast("Please enter a name for your diagram!");
      return;
    }

    if (isLoadedDiagramExisting && trimmed.toLowerCase() === (activeDiagramName || "").toLowerCase()) {
      showToast("Please enter a new distinct name to save as a new diagram!");
      return;
    }

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
    setSelectedDiagramId(newDiagram.id);
    if (onMarkChangesSaved) onMarkChangesSaved();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaveName("");
      showToast(`Saved "${trimmed}" to library!`);
    } catch (err) {
      console.error("Failed to save diagram:", err);
      showToast("Error saving to localStorage.");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = diagrams.filter((d) => d.id !== id);
    setDiagrams(updated);
    if (selectedDiagramId === id) {
      setSelectedDiagramId(null);
    }
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

  // Export selected diagram (or active canvas if no card is selected)
  const handleHeaderExportPNG = async () => {
    const selected = diagrams.find((d) => d.id === selectedDiagramId);
    if (selected) {
      try {
        await exportDiagramAsEditablePNG({
          name: selected.name,
          mode: selected.mode,
          nodes: selected.nodes,
          edges: selected.edges,
        });
        showToast(`Exported "${selected.name}" as editable PNG image!`);
      } catch (err) {
        console.error("PNG export error:", err);
        showToast("Failed to export PNG image.");
      }
      return;
    }

    if (currentNodes.length > 0) {
      const name = saveName.trim() || `${mode.toUpperCase()} Diagram`;
      try {
        await exportDiagramAsEditablePNG({
          name,
          mode,
          nodes: currentNodes,
          edges: currentEdges,
        });
        showToast(`Exported active canvas "${name}" as editable PNG image!`);
      } catch (err) {
        console.error("PNG export error:", err);
        showToast("Failed to export PNG image.");
      }
      return;
    }

    showToast("Please select a diagram card from the library to export!");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".png")) {
      const extracted = await extractDiagramFromPNG(file);
      if (extracted) {
        const updated = [extracted, ...diagrams];
        setDiagrams(updated);
        setSelectedDiagramId(extracted.id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        showToast(`Imported "${extracted.name}" successfully into your library!`);
      } else {
        showToast("Selected PNG does not contain editable diagram metadata.");
      }
    } else if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          const list = Array.isArray(imported) ? imported : [imported];
          const existingIds = new Set(diagrams.map((d) => d.id));
          const newDiagrams = list.filter(
            (d) => d && d.id && d.name && d.nodes && d.edges && !existingIds.has(d.id)
          );
          if (newDiagrams.length > 0) {
            const updated = [...newDiagrams, ...diagrams];
            setDiagrams(updated);
            setSelectedDiagramId(newDiagrams[0].id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            showToast(`Imported ${newDiagrams.length} diagram(s) into library!`);
          } else {
            showToast("No new diagrams found in JSON file.");
          }
        } catch (err) {
          console.error("Failed to import JSON:", err);
          showToast("Error parsing JSON backup file.");
        }
      };
      reader.readAsText(file);
    }
    e.target.value = "";
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
              <p className="text-xs text-slate-400">Select a diagram to export as PNG • Import diagrams directly into library</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHeaderExportPNG}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Export selected diagram from library as an editable PNG image"
            >
              <span>🖼️</span> Export PNG
            </button>

            <label
              className="bg-indigo-950 hover:bg-indigo-600 text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-800 hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Import an editable PNG image or JSON backup file into library"
            >
              <span>📤</span> Import (PNG / JSON)
              <input type="file" accept=".png,.json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-lg font-bold ml-1"
              title="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Save & Update Active Form */}
        <form onSubmit={showUpdateBtn ? handleUpdateLoadedDiagram : handleSaveCurrent} className="p-4 bg-slate-950/60 border-b border-slate-800 flex gap-2.5 items-center">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder={
              isLoadedDiagramExisting
                ? `Enter a new name to save as a separate diagram copy...`
                : `Name your current ${mode.toUpperCase()} diagram...`
            }
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />

          {showUpdateBtn ? (
            <>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Save modifications to the currently loaded diagram"
              >
                <span>💾</span> Update Modification
              </button>
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Save as a new separate diagram in library"
              >
                <span>➕</span> Save as New
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>💾</span> Save to Library
            </button>
          )}
        </form>

        {/* Toast Notification */}
        {toast && (
          <div className="bg-indigo-950/90 border-y border-indigo-800/80 text-indigo-200 text-xs px-4 py-2 text-center font-medium animate-in fade-in flex items-center justify-center gap-2">
            <span>✨</span>
            <span>{toast}</span>
          </div>
        )}

        {/* Saved List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {diagrams.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <span className="text-4xl">📥</span>
              <p className="text-sm font-medium text-slate-400">No saved diagrams found in library.</p>
              <p className="text-xs">Save your workspace above, or click "Import (PNG / JSON)" to add a diagram image!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diagrams.map((diag) => {
                const isSelected = selectedDiagramId === diag.id;
                const isCurrentlyActiveOnCanvas = activeDiagramId === diag.id;

                return (
                  <div
                    key={diag.id}
                    onClick={() => setSelectedDiagramId(diag.id)}
                    className={`rounded-xl p-4 flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-950/50 border-2 border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10 shadow-lg"
                        : "bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="text-indigo-400 text-xs font-bold">✓</span>}
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                            {diag.name}
                          </h3>
                          {isCurrentlyActiveOnCanvas && (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              Active
                            </span>
                          )}
                        </div>
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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(diag.id, diag.name);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
                          title="Delete diagram"
                        >
                          🗑️
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoad(diag, true);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer border border-slate-700 flex items-center gap-1"
                          title="View diagram without editing"
                        >
                          <span>👁️</span> Load
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoad(diag, false);
                          }}
                          className="bg-indigo-950 hover:bg-indigo-600 text-indigo-200 hover:text-white px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer border border-indigo-800 hover:border-indigo-500 flex items-center gap-1"
                          title="Open diagram in full edit mode"
                        >
                          <span>✏️</span> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
