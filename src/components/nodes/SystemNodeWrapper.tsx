"use client";

import { useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type {
  SystemNodeData,
  LoadBalancerConfig,
  ServerConfig,
  DatabaseConfig,
  CacheConfig,
} from "@/types/nodes";

interface SystemNodeWrapperProps {
  /** Node ID — needed for deletion */
  id: string;
  /** The node type string */
  nodeType: string;
  /** Whether this node is currently selected */
  selected: boolean;
  /** The node's data payload */
  data: SystemNodeData;
}

/**
 * SystemNodeWrapper — shared layout for all custom node types.
 *
 * Provides:
 *   - Glassmorphism card with accent color
 *   - Visible selection indicator (bright glow + ring)
 *   - Delete button (✕) that appears when the node is selected
 *   - Config summary badges
 *   - Top/bottom connection handles
 */
export default function SystemNodeWrapper({
  id,
  nodeType,
  selected,
  data,
}: SystemNodeWrapperProps) {
  const { label, icon, description, color, config } = data;
  const { deleteElements, updateNodeData } = useReactFlow();

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent node selection toggle
      deleteElements({ nodes: [{ id }] });
    },
    [id, deleteElements]
  );

  return (
    <div
      className={`system-node ${selected ? "system-node--selected" : ""}`}
      style={{
        borderColor: color,
        boxShadow: selected
          ? `0 0 0 2px ${color}, 0 0 30px ${color}66`
          : `0 0 20px ${color}33`,
      }}
    >
      {/* ─── Top handle (input) ─── */}
      <Handle type="target" position={Position.Top} className="handle" />

      {/* ─── Delete button (only visible when selected) ─── */}
      {selected && (
        <button
          className="node-delete-btn"
          onClick={onDelete}
          title="Delete node"
          aria-label="Delete node"
        >
          ✕
        </button>
      )}

      {/* ─── Content ─── */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <input
            type="text"
            className="font-semibold text-white text-sm bg-transparent border-none outline-none focus:bg-slate-800/50 focus:ring-1 focus:ring-slate-500 rounded px-1 -ml-1 w-full nodrag"
            value={label}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
          />
          <input
            type="text"
            className="text-xs text-slate-400 bg-transparent border-none outline-none focus:bg-slate-800/50 focus:ring-1 focus:ring-slate-500 rounded px-1 -ml-1 w-full nodrag"
            value={description}
            onChange={(e) =>
              updateNodeData(id, { description: e.target.value })
            }
          />
        </div>
      </div>

      {/* ─── Config Summary Badges ─── */}
      {config && (
        <div className="node-config-badges">
          <ConfigBadges nodeType={nodeType} config={config} color={color} />
        </div>
      )}

      {/* ─── Bottom handle (output) ─── */}
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}

/* ─── Config badge renderer ─── */

function ConfigBadges({
  nodeType,
  config,
  color,
}: {
  nodeType: string;
  config: SystemNodeData["config"];
  color: string;
}) {
  if (!config) return null;

  const badgeStyle = {
    background: `${color}15`,
    borderColor: `${color}30`,
    color: `${color}dd`,
  };

  switch (nodeType) {
    case "loadBalancer": {
      const c = config as LoadBalancerConfig;
      return (
        <span className="node-badge" style={badgeStyle}>
          {c.algorithm === "round-robin" ? "🔄 Round Robin" : "📊 Least Conn"}
        </span>
      );
    }
    case "server": {
      const c = config as ServerConfig;
      return (
        <>
          <span className="node-badge" style={badgeStyle}>
            ×{c.instances} inst
          </span>
          <span className="node-badge" style={badgeStyle}>
            {c.processingTime}ms
          </span>
        </>
      );
    }
    case "database": {
      const c = config as DatabaseConfig;
      return (
        <>
          <span className="node-badge" style={badgeStyle}>
            R: {c.readLatency}ms
          </span>
          <span className="node-badge" style={badgeStyle}>
            W: {c.writeLatency}ms
          </span>
        </>
      );
    }
    case "cache": {
      const c = config as CacheConfig;
      return (
        <span className="node-badge" style={badgeStyle}>
          Hit: {c.hitRate}%
        </span>
      );
    }
    default:
      return null;
  }
}
