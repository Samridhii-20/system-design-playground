/** Shared data shape for all custom system-design nodes. */
export interface SystemNodeData {
  /** Display label shown on the node card */
  label: string;
  /** Emoji icon rendered beside the label */
  icon: string;
  /** Short description shown below the label */
  description: string;
  /** Accent color used for the left border & glow */
  color: string;
}
