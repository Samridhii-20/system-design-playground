"use client";

import { type DragEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import { componentPalette } from "@/data/componentPalette";

/**
 * Sidebar — the component palette panel.
 *
 * Each card is HTML5-draggable. On drag start we stash the component
 * type in `dataTransfer` so the FlowCanvas can read it on drop.
 */
export default function Sidebar() {
  const { getNodes, deleteElements } = useReactFlow();

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="text-base font-semibold text-white tracking-tight">
          🧩 Components
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Drag onto the canvas to add
        </p>
      </div>

      {/* Palette cards */}
      <div className="flex flex-col gap-2.5 mt-4">
        {componentPalette.map((item) => (
          <div
            key={item.type}
            className="sidebar-item"
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            style={{
              borderLeftColor: item.color,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard hint acting as a delete button */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 pb-10 flex">
        <button
          onClick={() => {
            const selected = getNodes().filter((n) => n.selected);
            if (selected.length > 0) {
              deleteElements({ nodes: selected });
            }
          }}
          className="group flex items-center justify-start gap-2 text-[12px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer w-full text-left"
          title="Delete currently selected nodes"
        >
          <kbd className="kbd group-hover:border-red-400 group-hover:text-red-400 transition-colors">⌫</kbd>
          Delete selected node
        </button>
      </div>
    </aside>
  );
}
