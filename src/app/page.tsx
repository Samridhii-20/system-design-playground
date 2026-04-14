"use client";

import { ReactFlowProvider } from "@xyflow/react";
import Sidebar from "@/components/Sidebar";
import FlowCanvas from "@/components/FlowCanvas";

/**
 * Home page — sidebar + canvas layout.
 *
 * ReactFlowProvider wraps the entire page so that both
 * Sidebar and FlowCanvas can share the same React Flow instance.
 * (FlowCanvas needs useReactFlow() for screenToFlowPosition.)
 */
export default function Home() {
  return (
    <ReactFlowProvider>
      <main className="flex w-screen h-screen">
        <Sidebar />
        <div className="flex-1 h-full">
          <FlowCanvas />
        </div>
      </main>
    </ReactFlowProvider>
  );
}
