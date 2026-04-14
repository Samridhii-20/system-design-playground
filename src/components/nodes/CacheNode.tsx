"use client";

import { type NodeProps } from "@xyflow/react";
import type { SystemNodeData } from "@/types/nodes";
import SystemNodeWrapper from "./SystemNodeWrapper";

/**
 * Custom node representing an in-memory Cache.
 * Uses the shared SystemNodeWrapper.
 */
export default function CacheNode({ id, selected, data }: NodeProps) {
  return (
    <SystemNodeWrapper
      id={id}
      selected={!!selected}
      data={data as SystemNodeData}
    />
  );
}
