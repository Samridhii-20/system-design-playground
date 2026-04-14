"use client";

import { type NodeProps } from "@xyflow/react";
import type { SystemNodeData } from "@/types/nodes";
import SystemNodeWrapper from "./SystemNodeWrapper";

/**
 * Custom node representing an Application Server.
 * Uses the shared SystemNodeWrapper.
 */
export default function ServerNode({ id, selected, data }: NodeProps) {
  return (
    <SystemNodeWrapper
      id={id}
      selected={!!selected}
      data={data as SystemNodeData}
    />
  );
}
