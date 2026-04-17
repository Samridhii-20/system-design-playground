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
  /** Node-specific configuration */
  config?: NodeConfig;
}

/* ─── Per-node-type configuration interfaces ─── */

export interface LoadBalancerConfig {
  /** Routing algorithm */
  algorithm: "round-robin" | "least-connections";
}

export interface ServerConfig {
  /** Number of server instances */
  instances: number;
  /** Time to process a single request (ms) */
  processingTime: number;
}

export interface DatabaseConfig {
  /** Read latency in milliseconds */
  readLatency: number;
  /** Write latency in milliseconds */
  writeLatency: number;
}

export interface CacheConfig {
  /** Cache hit rate percentage (0–100) */
  hitRate: number;
}

/** Discriminated union of all node configs */
export type NodeConfig =
  | LoadBalancerConfig
  | ServerConfig
  | DatabaseConfig
  | CacheConfig;

/* ─── Default configs per node type ─── */

export const defaultConfigs: Record<string, NodeConfig> = {
  loadBalancer: { algorithm: "round-robin" } as LoadBalancerConfig,
  server: { instances: 1, processingTime: 100 } as ServerConfig,
  database: { readLatency: 5, writeLatency: 20 } as DatabaseConfig,
  cache: { hitRate: 80 } as CacheConfig,
};
