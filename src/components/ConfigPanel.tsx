"use client";

import { useCallback, useState, useEffect } from "react";
import { useReactFlow, type Node, type Edge } from "@xyflow/react";
import type {
  SystemNodeData,
  LoadBalancerConfig,
  ServerConfig,
  DatabaseConfig,
  CacheConfig,
} from "@/types/nodes";
import type { UmlClassConfig, UmlAttribute, UmlMethod, UmlVisibility, UmlRelationshipType } from "@/types/uml";
import { designPatternCatalog } from "@/data/DesignPatternCatalog";

interface ConfigPanelProps {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  activePatternId?: string | null;
  isReadOnly?: boolean;
}

/**
 * ConfigPanel — displays properties and adjustments for System Nodes, UML Class Nodes, or UML Connectors.
 */
export default function ConfigPanel({
  selectedNode,
  selectedEdge,
  activePatternId,
  isReadOnly = false,
}: ConfigPanelProps) {
  const { updateNodeData, setEdges, deleteElements } = useReactFlow();

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdge || isReadOnly) return;
    deleteElements({ edges: [{ id: selectedEdge.id }] });
  }, [selectedEdge, isReadOnly, deleteElements]);

  // ─── HLD Node Updater ───
  const updateHldConfig = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedNode) return;
      const data = selectedNode.data as unknown as SystemNodeData;
      updateNodeData(selectedNode.id, {
        config: { ...data.config, ...patch },
      });
    },
    [selectedNode, updateNodeData]
  );

  // ─── UML Class Configuration Updater ───
  const updateUmlConfig = useCallback(
    (patch: Partial<UmlClassConfig>) => {
      if (!selectedNode) return;
      const data = selectedNode.data as unknown as { config?: UmlClassConfig };
      const currentConfig = data.config || { isInterface: false, isAbstract: false, attributes: [], methods: [] };
      updateNodeData(selectedNode.id, {
        config: { ...currentConfig, ...patch },
      });
    },
    [selectedNode, updateNodeData]
  );

  // ─── UML Edge Updater ───
  const updateEdgeData = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedEdge) return;
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedEdge.id) {
            return {
              ...e,
              data: { ...e.data, ...patch },
            };
          }
          return e;
        })
      );
    },
    [selectedEdge, setEdges]
  );

  // 1. Render pattern-level SOLID analysis
  const currentPattern = designPatternCatalog.find((p) => p.id === activePatternId);

  // 2. Determine selected element and render appropriate config
  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="config-panel overflow-y-auto" id="config-panel">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <span className="text-4xl mb-3">🧭</span>
          <h3 className="text-sm font-semibold text-slate-300">Property Inspector</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Select a node on the canvas or click a connection line to view and edit properties.
          </p>
          {isReadOnly && (
            <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-[11px] text-amber-300">
              👁️ View-Only Mode Active (Click &quot;Enable Editing&quot; in top bar to make changes).
            </div>
          )}

          {currentPattern && (
            <div className="mt-6 text-left w-full p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎓</span> {currentPattern.name} SOLID Analysis
              </span>
              {currentPattern.solidPrinciples.map((sp, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-t border-slate-800/60 pt-2 first:border-0 first:pt-0">
                  <span className="text-xs font-semibold text-white">{sp.principle}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{sp.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ─── Render Edge Properties ───
  if (selectedEdge) {
    const relationship = (selectedEdge.data?.relationship as UmlRelationshipType) || "association";
    const label = (selectedEdge.data?.label as string) || "";

    const info = {
      inheritance: {
        title: "Inheritance (Generalization)",
        symbol: "───▷",
        badge: "Is-A",
        concept: "Child class inherits fields & methods from superclass.",
        coupling: "High (Tight coupling)",
        codeSnippet: "class Dog extends Animal",
      },
      association: {
        title: "Simple Association",
        symbol: "───>",
        badge: "Knows-A / Uses-A",
        concept: "Peer object reference without lifecycle ownership.",
        coupling: "Low (Loose coupling)",
        codeSnippet: "public carRef?: Car;",
      },
      aggregation: {
        title: "Aggregation Association",
        symbol: "◇───",
        badge: "Weak Has-A",
        concept: "Shared Whole-Part. Contained components can exist independently outside container.",
        coupling: "Moderate (Shared)",
        codeSnippet: "Department(teachers[])",
      },
      composition: {
        title: "Composition Association",
        symbol: "◆───",
        badge: "Strong Has-A",
        concept: "Exclusive Whole-Part. Container owns child lifecycle; destroying container destroys parts.",
        coupling: "High (Exclusive lifecycle)",
        codeSnippet: "this.engine = new Engine()",
      },
      realization: {
        title: "Realization (Implementation)",
        symbol: "- - -▷",
        badge: "Implements",
        concept: "Class fulfills an Interface contract.",
        coupling: "Low (Interface contract)",
        codeSnippet: "class Card implements Payment",
      },
      dependency: {
        title: "Dependency",
        symbol: "- - ->",
        badge: "Uses-Transiently",
        concept: "Short-lived usage via method parameter or local variable.",
        coupling: "Very Low",
        codeSnippet: "doTask(util: Utility)",
      },
    }[relationship];

    return (
      <aside className="config-panel overflow-y-auto" id="config-panel">
        <div className="config-panel-header flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="config-panel-icon bg-indigo-950/40 text-indigo-400">🔗</span>
            <div>
              <h3 className="text-sm font-semibold text-white truncate">UML Connection</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Edit UML relationships</p>
            </div>
          </div>
          {!isReadOnly && (
            <button
              onClick={handleDeleteEdge}
              className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Delete this relationship connector"
            >
              <span>🗑️</span> Delete
            </button>
          )}
        </div>

        <div className="config-panel-divider" />

        <div className="config-panel-body flex flex-col gap-4">
          <h4 className="config-section-title">⚙️ Connector Properties</h4>

          <div className="config-field-group">
            <label className="config-label mb-2 block">Relationship Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "inheritance", name: "Inheritance", symbol: "───▷", badge: "extends" },
                { id: "association", name: "Association", symbol: "───>", badge: "knows-a" },
                { id: "aggregation", name: "Aggregation", symbol: "◇───", badge: "weak has-a" },
                { id: "composition", name: "Composition", symbol: "◆───", badge: "strong has-a" },
              ].map((item) => {
                const isActive = relationship === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateEdgeData({ relationship: item.id as UmlRelationshipType })}
                    className={`flex flex-col gap-1 p-2.5 rounded-lg text-left transition-all cursor-pointer border ${isActive
                      ? "bg-indigo-950/90 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/20"
                      : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">{item.symbol}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{item.badge}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-2">
              {[
                { id: "realization", name: "Realization (implements)" },
                { id: "dependency", name: "Dependency (uses)" },
              ].map((item) => {
                const isActive = relationship === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateEdgeData({ relationship: item.id as UmlRelationshipType })}
                    className={`flex-1 text-[10px] p-2 rounded-md text-center transition-all cursor-pointer border ${isActive
                      ? "bg-indigo-950 border-indigo-500 text-white font-bold"
                      : "bg-slate-900/40 hover:bg-slate-800 border-slate-800/80 text-slate-400"
                      }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="config-field-group">
            <label className="config-label">Relationship Label</label>
            <EdgeLabelInput
              label={label}
              onChange={(val) => updateEdgeData({ label: val })}
            />
          </div>

          {/* Educational Connection Guide Box */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-300">{info.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 font-mono font-bold">
                {info.badge}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">Notation:</span>
              <span className="text-indigo-400 font-bold">{info.symbol}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              {info.concept}
            </p>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              <span>Coupling: <strong className="text-slate-300">{info.coupling}</strong></span>
            </div>

            <div className="text-[10px] font-mono text-emerald-400 bg-slate-900/60 p-1.5 rounded border border-slate-800/80 mt-0.5">
              {info.codeSnippet}
            </div>
          </div>
        </div>

        <div className="config-panel-footer">
          <span className="text-[10px] text-slate-500 font-mono">ID: {selectedEdge.id}</span>
        </div>
      </aside>
    );
  }


  // ─── Render Node Properties ───
  if (!selectedNode) return null;

  const nodeData = selectedNode.data as unknown as {
    label: string;
    description: string;
    color: string;
    icon?: string;
    config?: UmlClassConfig | SystemNodeData["config"];
  };
  const nodeType = selectedNode.type ?? "";

  // Check if it is a UML Node
  const isUmlNode = nodeType === "umlClass";

  if (isUmlNode) {
    const config = nodeData.config as UmlClassConfig;

    const toggleInterface = () => {
      updateUmlConfig({ isInterface: !config.isInterface, isAbstract: false });
    };

    const toggleAbstract = () => {
      updateUmlConfig({ isAbstract: !config.isAbstract, isInterface: false });
    };

    // Attribute Operations
    const addAttribute = () => {
      const randId = Math.random().toString(36).substr(2, 9);
      const newAttr: UmlAttribute = { id: randId, name: "newField", type: "string", visibility: "private" };
      updateUmlConfig({ attributes: [...config.attributes, newAttr] });
    };

    const updateAttribute = (attrId: string, patch: Partial<UmlAttribute>) => {
      const updated = config.attributes.map((a) => (a.id === attrId ? { ...a, ...patch } : a));
      updateUmlConfig({ attributes: updated });
    };

    const deleteAttribute = (attrId: string) => {
      updateUmlConfig({ attributes: config.attributes.filter((a) => a.id !== attrId) });
    };

    // Method Operations
    const addMethod = () => {
      const randId = Math.random().toString(36).substr(2, 9);
      const newMeth: UmlMethod = { id: randId, name: "newMethod", returnType: "void", parameters: [], visibility: "public" };
      updateUmlConfig({ methods: [...config.methods, newMeth] });
    };

    const updateMethod = (methId: string, patch: Partial<UmlMethod>) => {
      const updated = config.methods.map((m) => (m.id === methId ? { ...m, ...patch } : m));
      updateUmlConfig({ methods: updated });
    };

    const deleteMethod = (methId: string) => {
      updateUmlConfig({ methods: config.methods.filter((m) => m.id !== methId) });
    };



    return (
      <aside className="config-panel overflow-y-auto" id="config-panel">
        {/* Header */}
        <div className="config-panel-header">
          <div className="flex items-center gap-3">
            <span
              className="config-panel-icon"
              style={{ background: `${nodeData.color}22`, color: nodeData.color }}
            >
              📦
            </span>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                className="text-sm font-semibold text-white bg-transparent border-none outline-none focus:bg-slate-800/40 rounded px-1 -ml-1 w-full"
                value={nodeData.label}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                placeholder="Class Name"
              />
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="text"
                  className="text-[11px] text-slate-400 bg-transparent border-none outline-none focus:bg-slate-800/40 focus:text-slate-200 rounded px-1 -ml-1 flex-1 placeholder:text-slate-600 italic"
                  value={nodeData.description || ""}
                  placeholder="Add class description or note..."
                  onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                />
                {nodeData.description ? (
                  <button
                    type="button"
                    onClick={() => updateNodeData(selectedNode.id, { description: "" })}
                    className="text-[10px] text-slate-500 hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer shrink-0"
                    title="Remove description"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="config-panel-divider" />

        <div className="config-panel-body flex flex-col gap-5">
          {/* Class Options */}
          <div className="config-field-group">
            <label className="config-label">Class Modifier</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isInterface}
                  onChange={toggleInterface}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                «Interface»
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isAbstract}
                  onChange={toggleAbstract}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                «Abstract»
              </label>
            </div>
          </div>

          <div className="config-panel-divider !my-1" />

          {/* Attributes List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="config-section-title !m-0">📦 Fields (Attributes)</h4>
              <button
                onClick={addAttribute}
                className="text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                + Add Field
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {config.attributes.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic block py-1">No attributes declared yet.</span>
              ) : (
                config.attributes.map((attr) => (
                  <div key={attr.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1.5">
                    {/* Full Signature Preview Badge */}
                    <div className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      <span className="truncate">
                        <span className="text-indigo-400 font-bold mr-1">{attr.visibility === "public" ? "+" : attr.visibility === "private" ? "-" : "#"}</span>
                        <span className="text-white font-semibold">{attr.name}</span>
                        <span className="text-slate-500"> : </span>
                        <span className="text-indigo-300 font-medium">{attr.type}</span>
                      </span>
                      <button
                        onClick={() => deleteAttribute(attr.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs px-1 transition-colors cursor-pointer shrink-0 ml-1"
                        title="Delete field"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Inline Edit Inputs */}
                    <div className="flex gap-1.5 items-center w-full">
                      <select
                        className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 outline-none cursor-pointer font-mono font-medium focus:border-indigo-500 w-[108px] shrink-0"
                        value={attr.visibility}
                        onChange={(e) => updateAttribute(attr.id, { visibility: e.target.value as UmlVisibility })}
                      >
                        <option value="private">- Private</option>
                        <option value="public">+ Public</option>
                        <option value="protected"># Protected</option>
                      </select>

                      <input
                        type="text"
                        className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none flex-1 min-w-0 font-mono focus:border-indigo-500 transition-colors"
                        value={attr.name}
                        onChange={(e) => updateAttribute(attr.id, { name: e.target.value })}
                        placeholder="Name"
                        title={attr.name}
                      />

                      <span className="text-slate-500 text-[10px] shrink-0">:</span>

                      <input
                        type="text"
                        className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-indigo-300 outline-none flex-1 min-w-0 font-mono focus:border-indigo-500 transition-colors"
                        value={attr.type}
                        onChange={(e) => updateAttribute(attr.id, { type: e.target.value })}
                        placeholder="Type"
                        title={attr.type}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="config-panel-divider !my-1" />

          {/* Methods List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="config-section-title !m-0">⚙️ Methods (Functions)</h4>
              <button
                onClick={addMethod}
                className="text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                + Add Method
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {config.methods.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic block py-1">No methods declared yet.</span>
              ) : (
                config.methods.map((meth) => {
                  const paramsText = meth.parameters.map((p) => `${p.name}:${p.type}`).join(", ");
                  const fullMethodSig = `${meth.visibility === "public" ? "+" : meth.visibility === "private" ? "-" : "#"} ${meth.name}(${paramsText}) : ${meth.returnType}`;

                  return (
                    <div key={meth.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-2">
                      {/* Full Method Signature Preview Badge */}
                      <div className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                        <span className="truncate" title={fullMethodSig}>
                          <span className="text-emerald-400 font-bold mr-1">{meth.visibility === "public" ? "+" : meth.visibility === "private" ? "-" : "#"}</span>
                          <span className="text-white font-semibold">{meth.name}</span>
                          <span className="text-slate-400">({paramsText})</span>
                          <span className="text-slate-500"> : </span>
                          <span className="text-indigo-300 font-medium">{meth.returnType}</span>
                        </span>
                        <button
                          onClick={() => deleteMethod(meth.id)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1 transition-colors cursor-pointer shrink-0 ml-1"
                          title="Delete method"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Method Inputs */}
                      <div className="flex gap-1.5 items-center w-full">
                        <select
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 outline-none cursor-pointer font-mono font-medium focus:border-indigo-500 w-[108px] shrink-0"
                          value={meth.visibility}
                          onChange={(e) => updateMethod(meth.id, { visibility: e.target.value as UmlVisibility })}
                        >
                          <option value="private">- Private</option>
                          <option value="public">+ Public</option>
                          <option value="protected"># Protected</option>
                        </select>

                        <input
                          type="text"
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none flex-1 min-w-0 font-mono focus:border-indigo-500 transition-colors"
                          value={meth.name}
                          onChange={(e) => updateMethod(meth.id, { name: e.target.value })}
                          placeholder="Method Name"
                          title={meth.name}
                        />

                        <span className="text-slate-500 text-[10px] shrink-0">:</span>

                        <input
                          type="text"
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-indigo-300 outline-none flex-1 min-w-0 font-mono focus:border-indigo-500 transition-colors"
                          value={meth.returnType}
                          onChange={(e) => updateMethod(meth.id, { returnType: e.target.value })}
                          placeholder="Return Type"
                          title={meth.returnType}
                        />
                      </div>

                      {/* Params Editor */}
                      <div className="flex gap-1.5 items-center w-full">
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">Params:</span>
                        <MethodParamsInput
                          key={meth.id}
                          parameters={meth.parameters}
                          onChange={(newParams) => updateMethod(meth.id, { parameters: newParams })}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="config-panel-footer">
          <span className="text-[10px] text-slate-500 font-mono">ID: {selectedNode.id}</span>
        </div>
      </aside>
    );
  }

  // ─── Render HLD / System Node Properties ───
  const config = nodeData.config;

  return (
    <aside className="config-panel" id="config-panel">
      <div className="config-panel-header">
        <div className="flex items-center gap-3">
          <span
            className="config-panel-icon"
            style={{ background: `${nodeData.color}22`, color: nodeData.color }}
          >
            {nodeData.icon}
          </span>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              className="text-sm font-semibold text-white bg-transparent border-none outline-none focus:bg-slate-800/40 rounded px-1 -ml-1 w-full"
              value={nodeData.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              placeholder="Node Name"
            />
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="text"
                className="text-[11px] text-slate-400 bg-transparent border-none outline-none focus:bg-slate-800/40 focus:text-slate-200 rounded px-1 -ml-1 flex-1 placeholder:text-slate-600 italic"
                value={nodeData.description || ""}
                placeholder="Add node description..."
                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
              />
              {nodeData.description ? (
                <button
                  type="button"
                  onClick={() => updateNodeData(selectedNode.id, { description: "" })}
                  className="text-[10px] text-slate-500 hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer shrink-0"
                  title="Remove description"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div
          className="config-panel-badge"
          style={{ background: `${nodeData.color}18`, color: nodeData.color }}
        >
          {nodeType}
        </div>
      </div>

      <div className="config-panel-divider" />

      <div className="config-panel-body">
        <h4 className="config-section-title">⚙️ Configuration</h4>

        {nodeType === "loadBalancer" && (
          <LoadBalancerFields
            config={config as LoadBalancerConfig}
            onChange={updateHldConfig}
          />
        )}
        {nodeType === "server" && (
          <ServerFields
            config={config as ServerConfig}
            onChange={updateHldConfig}
          />
        )}
        {nodeType === "database" && (
          <DatabaseFields
            config={config as DatabaseConfig}
            onChange={updateHldConfig}
          />
        )}
        {nodeType === "cache" && (
          <CacheFields
            config={config as CacheConfig}
            onChange={updateHldConfig}
          />
        )}
      </div>

      <div className="config-panel-footer">
        <span className="text-[10px] text-slate-500 font-mono">ID: {selectedNode.id}</span>
      </div>
    </aside>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Node-specific HLD field components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface FieldProps<T> {
  config: T;
  onChange: (patch: Record<string, unknown>) => void;
}

function LoadBalancerFields({
  config,
  onChange,
}: FieldProps<LoadBalancerConfig>) {
  return (
    <div className="config-field-group">
      <label className="config-label" htmlFor="lb-algorithm">
        Algorithm
      </label>
      <select
        id="lb-algorithm"
        className="config-select"
        value={config?.algorithm ?? "round-robin"}
        onChange={(e) => onChange({ algorithm: e.target.value })}
      >
        <option value="round-robin">Round Robin</option>
        <option value="least-connections">Least Connections</option>
      </select>
    </div>
  );
}

function ServerFields({ config, onChange }: FieldProps<ServerConfig>) {
  return (
    <>
      <div className="config-field-group">
        <label className="config-label" htmlFor="server-instances">
          Number of Instances
        </label>
        <input
          id="server-instances"
          type="number"
          className="config-input"
          min={1}
          max={100}
          value={config?.instances ?? 1}
          onChange={(e) =>
            onChange({ instances: Math.max(1, parseInt(e.target.value) || 1) })
          }
        />
      </div>
      <div className="config-field-group">
        <label className="config-label" htmlFor="server-processing-time">
          Processing Time
          <span className="config-unit">ms</span>
        </label>
        <input
          id="server-processing-time"
          type="number"
          className="config-input"
          min={1}
          max={10000}
          value={config?.processingTime ?? 100}
          onChange={(e) =>
            onChange({
              processingTime: Math.max(1, parseInt(e.target.value) || 1),
            })
          }
        />
      </div>
    </>
  );
}

function DatabaseFields({ config, onChange }: FieldProps<DatabaseConfig>) {
  return (
    <>
      <div className="config-field-group">
        <label className="config-label" htmlFor="db-read-latency">
          Read Latency
          <span className="config-unit">ms</span>
        </label>
        <input
          id="db-read-latency"
          type="number"
          className="config-input"
          min={0}
          max={10000}
          value={config?.readLatency ?? 5}
          onChange={(e) =>
            onChange({
              readLatency: Math.max(0, parseInt(e.target.value) || 0),
            })
          }
        />
      </div>
      <div className="config-field-group">
        <label className="config-label" htmlFor="db-write-latency">
          Write Latency
          <span className="config-unit">ms</span>
        </label>
        <input
          id="db-write-latency"
          type="number"
          className="config-input"
          min={0}
          max={10000}
          value={config?.writeLatency ?? 20}
          onChange={(e) =>
            onChange({
              writeLatency: Math.max(0, parseInt(e.target.value) || 0),
            })
          }
        />
      </div>
    </>
  );
}

function CacheFields({ config, onChange }: FieldProps<CacheConfig>) {
  return (
    <div className="config-field-group">
      <label className="config-label" htmlFor="cache-hit-rate">
        Cache Hit Rate
        <span className="config-unit">%</span>
      </label>
      <div className="config-slider-group">
        <input
          id="cache-hit-rate"
          type="range"
          className="config-slider"
          min={0}
          max={100}
          value={config?.hitRate ?? 80}
          onChange={(e) => onChange({ hitRate: parseInt(e.target.value) })}
        />
        <span className="config-slider-value">{config?.hitRate ?? 80}%</span>
      </div>
    </div>
  );
}

function EdgeLabelInput({
  label,
  onChange,
}: {
  label: string;
  onChange: (newLabel: string) => void;
}) {
  const [val, setVal] = useState(label);

  useEffect(() => {
    setVal(label);
  }, [label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setVal(text);
    onChange(text);
  };

  return (
    <input
      type="text"
      className="config-input"
      value={val}
      onChange={handleChange}
      placeholder="e.g. extends, has, uses, creates"
    />
  );
}

function MethodParamsInput({
  parameters,
  onChange,
}: {
  parameters: UmlMethod["parameters"];
  onChange: (parameters: UmlMethod["parameters"]) => void;
}) {
  const formatParams = (params: UmlMethod["parameters"]) =>
    params.map((p) => (p.type ? `${p.name}:${p.type}` : p.name)).join(", ");

  const [val, setVal] = useState(() => formatParams(parameters));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setVal(text);

    const parts = text.split(",").map((p) => p.trim());
    const parsedParams = parts
      .map((p) => {
        if (!p) return null;
        const [n, t] = p.split(":").map((sub) => sub.trim());
        if (!n) return null;
        return { name: n, type: t !== undefined ? t : "any" };
      })
      .filter(Boolean) as UmlMethod["parameters"];

    onChange(parsedParams);
  };

  return (
    <input
      type="text"
      className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 outline-none flex-1 font-mono focus:border-indigo-500 transition-colors"
      value={val}
      onChange={handleChange}
      placeholder="e.g. observer:a, count:number"
    />
  );
}
