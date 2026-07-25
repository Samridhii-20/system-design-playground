import type { Node, Edge } from "@xyflow/react";

export interface SavedDiagram {
  id: string;
  name: string;
  mode: "hld" | "lld";
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
}
