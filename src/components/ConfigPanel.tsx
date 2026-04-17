"use client";

import { useCallback } from "react";
import { useReactFlow, type Node } from "@xyflow/react";
import type {
  SystemNodeData,
  LoadBalancerConfig,
  ServerConfig,
  DatabaseConfig,
  CacheConfig,
} from "@/types/nodes";

interface ConfigPanelProps {
  /** The currently selected node (null if none) */
  selectedNode: Node | null;
}

/**
 * ConfigPanel — right-side panel for configuring the selected node.
 *
 * Shows node-type-specific fields. Changes are pushed into
 * React Flow state immediately via `updateNodeData`.
 */
export default function ConfigPanel({ selectedNode }: ConfigPanelProps) {
  const { updateNodeData } = useReactFlow();

  const updateConfig = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedNode) return;
      const data = selectedNode.data as unknown as SystemNodeData;
      updateNodeData(selectedNode.id, {
        config: { ...data.config, ...patch },
      });
    },
    [selectedNode, updateNodeData]
  );

  if (!selectedNode) return null;

  const data = selectedNode.data as unknown as SystemNodeData;
  const config = data.config;
  const nodeType = selectedNode.type ?? "";

  return (
    <aside className="config-panel" id="config-panel">
      {/* ─── Header ─── */}
      <div className="config-panel-header">
        <div className="flex items-center gap-3">
          <span
            className="config-panel-icon"
            style={{ background: `${data.color}22`, color: data.color }}
          >
            {data.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate">
              {data.label}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {data.description}
            </p>
          </div>
        </div>
        <div
          className="config-panel-badge"
          style={{ background: `${data.color}18`, color: data.color }}
        >
          {nodeType}
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="config-panel-divider" />

      {/* ─── Config Fields ─── */}
      <div className="config-panel-body">
        <h4 className="config-section-title">⚙️ Configuration</h4>

        {nodeType === "loadBalancer" && (
          <LoadBalancerFields
            config={config as LoadBalancerConfig}
            onChange={updateConfig}
          />
        )}
        {nodeType === "server" && (
          <ServerFields
            config={config as ServerConfig}
            onChange={updateConfig}
          />
        )}
        {nodeType === "database" && (
          <DatabaseFields
            config={config as DatabaseConfig}
            onChange={updateConfig}
          />
        )}
        {nodeType === "cache" && (
          <CacheFields
            config={config as CacheConfig}
            onChange={updateConfig}
          />
        )}
      </div>

      {/* ─── Footer: Node ID ─── */}
      <div className="config-panel-footer">
        <span className="text-[10px] text-slate-500 font-mono">
          ID: {selectedNode.id}
        </span>
      </div>
    </aside>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Node-specific field components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface FieldProps<T> {
  config: T;
  onChange: (patch: Record<string, unknown>) => void;
}

/** Load Balancer — algorithm dropdown */
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

/** Server — instances count + processing time */
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

/** Database — read & write latency */
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

/** Cache — hit rate percentage */
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
