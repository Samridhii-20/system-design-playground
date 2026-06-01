"use client";

import { useCallback } from "react";
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
}

/**
 * ConfigPanel — displays properties and adjustments for System Nodes, UML Class Nodes, or UML Connectors.
 */
export default function ConfigPanel({
  selectedNode,
  selectedEdge,
  activePatternId,
}: ConfigPanelProps) {
  const { updateNodeData, setEdges } = useReactFlow();

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
          <h3 className="text-sm font-semibold text-slate-300">Property inspector</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
            Select a node on the canvas or click a connection line to view and edit properties
          </p>

          {currentPattern && (
            <div className="mt-8 p-3.5 bg-slate-950/40 rounded-lg border border-slate-800 text-left w-full">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                🎓 {currentPattern.name} SOLID Analysis
              </h4>
              <div className="flex flex-col gap-3.5 mt-2">
                {currentPattern.solidPrinciples.map((sp, idx) => (
                  <div key={idx} className="border-t border-slate-900 pt-2.5 first:border-none first:pt-0">
                    <span className="text-[11px] font-bold text-slate-200 block">{sp.principle}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{sp.explanation}</p>
                  </div>
                ))}
              </div>
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

    return (
      <aside className="config-panel overflow-y-auto" id="config-panel">
        <div className="config-panel-header">
          <div className="flex items-center gap-3">
            <span className="config-panel-icon bg-indigo-950/40 text-indigo-400">🔗</span>
            <div>
              <h3 className="text-sm font-semibold text-white truncate">UML Connection</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Edit UML relationships</p>
            </div>
          </div>
        </div>

        <div className="config-panel-divider" />

        <div className="config-panel-body flex flex-col gap-4">
          <h4 className="config-section-title">⚙️ Connector Properties</h4>

          <div className="config-field-group">
            <label className="config-label">Relationship Type</label>
            <select
              className="config-select"
              value={relationship}
              onChange={(e) => updateEdgeData({ relationship: e.target.value as UmlRelationshipType })}
            >
              <option value="association">Association (uses / standard arrow)</option>
              <option value="inheritance">Inheritance (extends / hollow arrow)</option>
              <option value="realization">Realization (implements / dashed hollow)</option>
              <option value="composition">Composition (filled diamond)</option>
              <option value="aggregation">Aggregation (hollow diamond)</option>
              <option value="dependency">Dependency (client → supplier dashed)</option>
            </select>
          </div>

          <div className="config-field-group">
            <label className="config-label">Relationship Label</label>
            <input
              type="text"
              className="config-input"
              value={label}
              onChange={(e) => updateEdgeData({ label: e.target.value })}
              placeholder="e.g. uses, creates, notifies"
            />
          </div>
        </div>

        <div className="config-panel-footer">
          <span className="text-[10px] text-slate-500 font-mono">ID: {selectedEdge.id}</span>
        </div>
      </aside>
    );
  }

  // ─── Render Node Properties ───
  const nodeData = selectedNode.data as unknown as {
    label: string;
    description: string;
    color: string;
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

    // Method Parameter Parsing Helper
    const handleParamsTextChange = (methId: string, text: string) => {
      // Expecting format: name:type, name:type
      const parts = text.split(",").map((p) => p.trim());
      const parameters = parts
        .map((p) => {
          const [n, t] = p.split(":").map((sub) => sub.trim());
          if (!n) return null;
          return { name: n, type: t || "any" };
        })
        .filter(Boolean) as UmlMethod["parameters"];

      updateMethod(methId, { parameters });
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
              />
              <p className="text-[11px] text-slate-400 mt-0.5">{nodeData.description}</p>
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
                  <div key={attr.id} className="flex gap-1.5 items-center bg-slate-900/50 p-2 rounded border border-slate-800/80">
                    <select
                      className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-300 outline-none w-10 shrink-0"
                      value={attr.visibility}
                      onChange={(e) => updateAttribute(attr.id, { visibility: e.target.value as UmlVisibility })}
                    >
                      <option value="private">-</option>
                      <option value="public">+</option>
                      <option value="protected">#</option>
                    </select>

                    <input
                      type="text"
                      className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white outline-none w-16"
                      value={attr.name}
                      onChange={(e) => updateAttribute(attr.id, { name: e.target.value })}
                      placeholder="name"
                    />

                    <span className="text-slate-500 text-[10px] shrink-0">:</span>

                    <input
                      type="text"
                      className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 outline-none w-16"
                      value={attr.type}
                      onChange={(e) => updateAttribute(attr.id, { type: e.target.value })}
                      placeholder="type"
                    />

                    <button
                      onClick={() => deleteAttribute(attr.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1.5 transition-colors cursor-pointer"
                      title="Delete field"
                    >
                      ✕
                    </button>
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
                  return (
                    <div key={meth.id} className="bg-slate-900/50 p-2 rounded border border-slate-800/80 flex flex-col gap-1.5">
                      <div className="flex gap-1.5 items-center w-full">
                        <select
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-300 outline-none w-10 shrink-0"
                          value={meth.visibility}
                          onChange={(e) => updateMethod(meth.id, { visibility: e.target.value as UmlVisibility })}
                        >
                          <option value="public">+</option>
                          <option value="private">-</option>
                          <option value="protected">#</option>
                        </select>

                        <input
                          type="text"
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white outline-none w-20 flex-1 min-w-0"
                          value={meth.name}
                          onChange={(e) => updateMethod(meth.id, { name: e.target.value })}
                          placeholder="methodName"
                        />

                        <span className="text-slate-500 text-[10px] shrink-0">:</span>

                        <input
                          type="text"
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 outline-none w-12 shrink-0"
                          value={meth.returnType}
                          onChange={(e) => updateMethod(meth.id, { returnType: e.target.value })}
                          placeholder="void"
                        />

                        <button
                          onClick={() => deleteMethod(meth.id)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1.5 transition-colors cursor-pointer shrink-0"
                          title="Delete method"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Params Editor */}
                      <div className="flex gap-1.5 items-center w-full">
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">Params:</span>
                        <input
                          type="text"
                          className="text-[9px] bg-slate-950 border border-slate-800/80 rounded px-1.5 py-0.5 text-slate-400 outline-none flex-1 font-mono"
                          value={paramsText}
                          onChange={(e) => handleParamsTextChange(meth.id, e.target.value)}
                          placeholder="e.g. key:string, val:number"
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
            <h3 className="text-sm font-semibold text-white truncate">{nodeData.label}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{nodeData.description}</p>
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
