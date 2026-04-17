"use client";

import { useState } from "react";
import { ReactFlowProvider, type Node } from "@xyflow/react";
import Sidebar from "@/components/Sidebar";
import FlowCanvas from "@/components/FlowCanvas";
import ConfigPanel from "@/components/ConfigPanel";

/**
 * Home page — sidebar + canvas + config panel layout.
 *
 * ReactFlowProvider wraps the entire page so that both
 * Sidebar, FlowCanvas, and ConfigPanel can share the same React Flow instance.
 */
export default function Home() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <ReactFlowProvider>
      <main className="flex w-screen h-screen">
        <Sidebar />
        <div className="flex-1 h-full relative">
          <FlowCanvas onNodeSelect={setSelectedNode} />
        </div>
        <ConfigPanel selectedNode={selectedNode} />
      </main>
    </ReactFlowProvider>
  );
}
