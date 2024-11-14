interface TokenNode {
  token: any;
  connections: Map<string, { pool: any; token: any }>;
}

interface TokenGraph {
  nodes: Map<string, TokenNode>;
  pools: Map<string, any>;
  addToken: (token: any) => void;
  addPool: (pool: any) => void;
  findPath: (fromId: string, toId: string, hasHighExperience: boolean) => any[] | null;
  findAllPaths: (
    fromId: string,
    toId: string,
    hasHighExperience: boolean,
    maxLength: number
  ) => any[] | null;
  getDirectPool: (fromId: string, toId: string) => any | null;
}

export class SwapGraph implements TokenGraph {
  nodes = new Map<string, TokenNode>();
  pools = new Map<string, any>();

  constructor(tokens: any[], pools: any[]) {
    this.buildGraph(tokens, pools);
  }

  private buildGraph(tokens: any[], pools: any[]) {
    console.log('Building graph:', { tokenCount: tokens.length, poolCount: pools.length });

    // First add all tokens as nodes
    tokens.forEach(token => {
      this.addToken(token);
    });

    // Use pools as the primary source of connections
    pools.forEach(pool => {
      if (!pool.token0 || !pool.token1) {
        console.warn('Pool missing tokens:', pool);
        return;
      }

      // Add connection from pool data
      this.addPool(pool);
    });

    // Debug output
    this.nodes.forEach((node, contractId) => {
      console.log(`Token ${node.token.metadata.symbol} (${contractId}):`, {
        connectionCount: node.connections.size,
        connectedTo: Array.from(node.connections.values()).map(c => ({
          symbol: c.token.metadata.symbol,
          poolId: c.pool.poolData.id
        }))
      });
    });

    // Verify graph integrity
    this.verifyConnections();
  }

  addToken(token: any) {
    if (!token.contractId) {
      console.warn('Token missing contractId:', token);
      return;
    }

    if (!this.nodes.has(token.contractId)) {
      this.nodes.set(token.contractId, {
        token,
        connections: new Map()
      });
    }
  }

  addPool(pool: any) {
    if (!pool.token0?.contractId || !pool.token1?.contractId) {
      console.warn('Invalid tokens for connection:', pool);
      return;
    }

    // Store pool data
    this.pools.set(pool.contractId, pool);

    // Get or create nodes
    const node0 = this.nodes.get(pool.token0.contractId);
    const node1 = this.nodes.get(pool.token1.contractId);

    // print out the nodes
    console.log('Pool:', pool.contractId);
    console.log('Node0:', node0?.token.metadata.symbol);
    console.log('Node1:', node1?.token.metadata.symbol);

    if (node0 && node1) {
      // Add bidirectional connections with full pool data
      node0.connections.set(pool.token1.contractId, {
        pool,
        token: pool.token1
      });

      node1.connections.set(pool.token0.contractId, {
        pool,
        token: pool.token0
      });
    } else {
      console.warn('Missing nodes for connection:', {
        token0: pool.token0.metadata.symbol,
        token1: pool.token1.metadata.symbol,
        node0Exists: !!node0,
        node1Exists: !!node1
      });
    }
  }

  findAllPaths(
    fromId: string,
    toId: string,
    hasHighExperience: boolean,
    maxLength: number = 4
  ): any[][] {
    const startNode = this.nodes.get(fromId);
    const endNode = this.nodes.get(toId);

    if (!startNode || !endNode) return [];

    const allPaths: any[][] = [];

    interface QueueItem {
      nodeId: string;
      path: any[];
      poolPath: any[];
      visited: Set<string>;
    }

    const queue: QueueItem[] = [
      {
        nodeId: fromId,
        path: [startNode.token],
        poolPath: [],
        visited: new Set([fromId])
      }
    ];

    while (queue.length > 0) {
      const { nodeId, path, poolPath, visited } = queue.shift()!;
      const currentNode = this.nodes.get(nodeId)!;

      // Check each connection and its pool data
      for (const [nextId, { pool, token }] of currentNode.connections) {
        if (visited.has(nextId)) continue;

        // Check STX restrictions
        if (
          !hasHighExperience &&
          token.metadata?.symbol === 'STX' &&
          startNode.token.metadata?.symbol !== 'synSTX'
        ) {
          continue;
        }

        const newPath = [...path, token];

        // Found a valid path to destination
        if (nextId === toId) {
          allPaths.push(newPath);
          continue; // Continue searching for other paths
        }

        // Only continue if path length is within limit
        if (path.length < maxLength - 1) {
          queue.push({
            nodeId: nextId,
            path: newPath,
            poolPath: [...poolPath, pool],
            visited: new Set([...visited, nextId])
          });
        }
      }
    }

    // Sort paths by length (shortest first)
    allPaths.sort((a, b) => a.length - b.length);

    return allPaths;
  }

  // Path finding with improved pool data usage
  findPath(fromId: string, toId: string, hasHighExperience: boolean): any[] | null {
    const startNode = this.nodes.get(fromId);
    const endNode = this.nodes.get(toId);

    if (!startNode || !endNode) return null;

    interface QueueItem {
      nodeId: string;
      path: any[];
      poolPath: any[];
      visited: Set<string>;
    }

    const queue: QueueItem[] = [
      {
        nodeId: fromId,
        path: [startNode.token],
        poolPath: [],
        visited: new Set([fromId])
      }
    ];

    while (queue.length > 0) {
      const { nodeId, path, poolPath, visited } = queue.shift()!;
      const currentNode = this.nodes.get(nodeId)!;

      // Check each connection and its pool data
      for (const [nextId, { pool, token }] of currentNode.connections) {
        if (visited.has(nextId)) continue;

        // Check STX restrictions
        if (
          !hasHighExperience &&
          token.metadata?.symbol === 'STX' &&
          startNode.token.metadata?.symbol !== 'synSTX'
        ) {
          continue;
        }

        // Found path to destination
        if (nextId === toId) {
          return [...path, token];
        }

        // Limit path length (can be adjusted)
        if (path.length >= 4) continue;

        queue.push({
          nodeId: nextId,
          path: [...path, token],
          poolPath: [...poolPath, pool],
          visited: new Set([...visited, nextId])
        });
      }
    }

    return null;
  }

  getDirectPool(fromId: string, toId: string): any | null {
    const node = this.nodes.get(fromId);
    if (!node) return null;

    const connection = node.connections.get(toId);
    return connection ? connection.pool : null;
  }

  private verifyConnections() {
    let issues = 0;
    this.nodes.forEach((node, contractId) => {
      node.connections.forEach((connection, targetId) => {
        const targetNode = this.nodes.get(targetId);
        if (!targetNode) {
          console.error(`Missing target node ${targetId} for ${node.token.metadata.symbol}`);
          issues++;
          return;
        }
        if (!targetNode.connections.has(contractId)) {
          console.error(
            `Missing reverse connection from ${targetNode.token.metadata.symbol} to ${node.token.metadata.symbol}`
          );
          issues++;
        }
      });
    });
    return issues === 0;
  }
}

// Create and export a singleton instance
let graphInstance: SwapGraph | null = null;

export const initializeGraph = (tokens: any[], pools: any[]) => {
  graphInstance = new SwapGraph(tokens, pools);
  console.log(graphInstance);
};

export const getGraph = (): SwapGraph => {
  if (!graphInstance) {
    throw new Error('Graph not initialized');
  }
  return graphInstance;
};
