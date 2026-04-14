import type { Node, Edge } from "@xyflow/react";

/**
 * Default nodes arranged as:
 *   Load Balancer  →  Server 1  →  Database
 *                  →  Server 2  ↗
 */
export const initialNodes: Node[] = [
  {
    id: "lb-1",
    type: "loadBalancer",
    position: { x: 400, y: 60 },
    data: {
      label: "Load Balancer",
      icon: "⚖️",
      description: "Distributes incoming traffic",
      color: "#6366f1", // indigo
    },
  },
  {
    id: "server-1",
    type: "server",
    position: { x: 150, y: 260 },
    data: {
      label: "Server 1",
      icon: "🖥️",
      description: "Handles API requests",
      color: "#22d3ee", // cyan
    },
  },
  {
    id: "server-2",
    type: "server",
    position: { x: 650, y: 260 },
    data: {
      label: "Server 2",
      icon: "🖥️",
      description: "Handles API requests",
      color: "#22d3ee", // cyan
    },
  },
  {
    id: "db-1",
    type: "database",
    position: { x: 400, y: 480 },
    data: {
      label: "Database",
      icon: "🗄️",
      description: "Stores persistent data",
      color: "#f59e0b", // amber
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e-lb-s1",
    source: "lb-1",
    target: "server-1",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "e-lb-s2",
    source: "lb-1",
    target: "server-2",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "e-s1-db",
    source: "server-1",
    target: "db-1",
    animated: true,
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e-s2-db",
    source: "server-2",
    target: "db-1",
    animated: true,
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
];
