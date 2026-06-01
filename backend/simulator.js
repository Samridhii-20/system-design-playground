/**
 * Validates and runs a single request simulation through the system architecture.
 *
 * @param {Array} nodes React Flow nodes
 * @param {Array} edges React Flow edges
 * @returns {Object} { totalLatency: number, path: string[] }
 */
export function simulateRequest(nodes, edges) {
  if (nodes.length === 0) {
    return { totalLatency: 0, path: [] };
  }

  // 1. Build adjacency list for forward edges
  const adj = {};
  const inDegree = {};
  const nodeMap = {};

  nodes.forEach((node) => {
    adj[node.id] = [];
    inDegree[node.id] = 0;
    nodeMap[node.id] = node;
  });

  edges.forEach((edge) => {
    if (adj[edge.source] && inDegree[edge.target] !== undefined) {
      adj[edge.source].push(edge.target);
      inDegree[edge.target]++;
    }
  });

  // 2. Identify the starting node
  // Prefer a load balancer that has 0 in-degree, or any node with 0 in-degree
  let startNodeId = null;
  const lbNodes = nodes.filter((n) => n.type === 'loadBalancer' && inDegree[n.id] === 0);
  
  if (lbNodes.length > 0) {
    startNodeId = lbNodes[0].id;
  } else {
    // Fallback: finding any node with 0 in-degree
    const rootNodes = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
    if (rootNodes.length > 0) {
      startNodeId = rootNodes[0];
    } else {
      // Complete fallback (e.g. cycle with no roots)
      startNodeId = nodes[0].id;
    }
  }

  // 3. Simulate request flow
  let totalLatency = 0;
  let path = [];
  let currentNodeId = startNodeId;

  // Set to avoid infinite loops in case of cycles
  const visited = new Set();

  while (currentNodeId) {
    if (visited.has(currentNodeId)) {
      path.push(`${nodeMap[currentNodeId].data.label} (Cycle Detected)`);
      break;
    }
    visited.add(currentNodeId);

    const currentNode = nodeMap[currentNodeId];
    path.push(currentNode.data.label);

    const type = currentNode.type;
    const config = currentNode.data.config || {};

    // Calculate latency logic based on node type
    let isCacheHit = false;

    if (type === 'server') {
      const processingTime = config.processingTime || 100;
      totalLatency += processingTime;
    } else if (type === 'database') {
      const readLatency = config.readLatency || 5;
      const writeLatency = config.writeLatency || 20;
      // Assume a generic request takes both a read and a write for simulation depth
      totalLatency += (readLatency + writeLatency);
    } else if (type === 'cache') {
      const hitRate = config.hitRate || 80;
      const isHit = Math.random() * 100 <= hitRate;
      
      // Assume a small latency to check cache (e.g., 2ms)
      totalLatency += 2;

      if (isHit) {
        path[path.length - 1] += ' [HIT]';
        isCacheHit = true;
      } else {
        path[path.length - 1] += ' [MISS]';
      }
    } else if (type === 'loadBalancer') {
      // LB doesn't add significant latency in this basic sim, maybe 1ms
      totalLatency += 1;
    }

    if (isCacheHit) {
      break; // Request completely served from cache
    }

    // Determine the next step
    const neighbors = adj[currentNodeId];
    if (neighbors && neighbors.length > 0) {
      // For a single request, Load Balancer might just pick the first connected node.
      // If we implement round-robin or least-connections, we'd need state.
      // For basic correctness matching requirements, "pick first" is sufficient for 1 req.
      currentNodeId = neighbors[0];
    } else {
      currentNodeId = null; // Reached end of path
    }
  }

  return {
    totalLatency,
    path
  };
}
