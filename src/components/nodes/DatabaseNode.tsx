"use client";

import { type NodeProps } from "@xyflow/react";
import type { SystemNodeData } from "@/types/nodes";
import SystemNodeWrapper from "./SystemNodeWrapper";

/**
 * Custom node representing a Database.
 * Uses the shared SystemNodeWrapper.
 */
export default function DatabaseNode({ id, selected, data }: NodeProps) {
  return (
    <SystemNodeWrapper
      id={id}
      nodeType="database"
      selected={!!selected}
      data={data as unknown as SystemNodeData}
    />
  );
}
