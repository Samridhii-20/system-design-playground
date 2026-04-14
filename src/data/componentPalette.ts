import type { SystemNodeData } from "@/types/nodes";

/**
 * Component palette — defines all node types available in the sidebar.
 *
 * Each entry drives both the sidebar card rendering and the
 * data injected into newly created nodes on drop.
 */
export interface PaletteItem {
  /** React Flow node type (must match a key in nodeTypes) */
  type: string;
  /** Default display label (auto-incremented on drop, e.g. "Server 1") */
  label: string;
  /** Emoji icon */
  icon: string;
  /** Short description */
  description: string;
  /** Accent color for border & glow */
  color: string;
}

export const componentPalette: PaletteItem[] = [
  {
    type: "loadBalancer",
    label: "Load Balancer",
    icon: "⚖️",
    description: "Distributes incoming traffic",
    color: "#6366f1",
  },
  {
    type: "server",
    label: "Server",
    icon: "🖥️",
    description: "Handles API requests",
    color: "#22d3ee",
  },
  {
    type: "database",
    label: "Database",
    icon: "🗄️",
    description: "Stores persistent data",
    color: "#f59e0b",
  },
  {
    type: "cache",
    label: "Cache",
    icon: "⚡",
    description: "In-memory data store",
    color: "#a855f7",
  },
];
