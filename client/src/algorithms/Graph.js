/**
 * Graph Data Structure and Dijkstra's Shortest Path Algorithm
 * Purpose in BookMyPlayground:
 * - Group Ground Finder: shortest network paths between participant localities and candidate turfs
 * - Educational DS viva demonstration
 * Time Complexity:
 * - Dijkstra with Priority Queue: O((V + E) log V)
 * - Graph construction: O(V + E)
 * Space Complexity: O(V + E)
 */

const { PriorityQueue } = require('./MinHeap');

class Graph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodeDetails = new Map(); // Stores { name, coordinates: [lng, lat], type: 'locality' | 'venue' }
  }

  addVertex(vertex, details = {}) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
      this.nodeDetails.set(vertex, details);
    }
  }

  addEdge(source, destination, weight, isBidirectional = true) {
    if (!this.adjacencyList.has(source)) this.addVertex(source);
    if (!this.adjacencyList.has(destination)) this.addVertex(destination);

    this.adjacencyList.get(source).push({ node: destination, weight });
    if (isBidirectional) {
      this.adjacencyList.get(destination).push({ node: source, weight });
    }
  }

  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  getAllVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Dijkstra's Algorithm: computes shortest path and distance from startNode to endNode
   * @param {string} startNode
   * @param {string} endNode (optional, if omitted computes to all nodes)
   * @returns {{ distances: Object, previous: Object, path: Array, totalDistance: number, steps: Array }}
   */
  dijkstra(startNode, endNode = null) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const steps = []; // Step-by-step trace for viva visualizer

    // Priority queue of { node, distance }
    const pq = new PriorityQueue((a, b) => a.distance - b.distance);

    for (const vertex of this.adjacencyList.keys()) {
      if (vertex === startNode) {
        distances[vertex] = 0;
        pq.insert({ node: vertex, distance: 0 });
      } else {
        distances[vertex] = Infinity;
      }
      previous[vertex] = null;
    }

    steps.push({
      event: 'INITIALIZE',
      current: startNode,
      distances: { ...distances },
      description: `Initialized source node "${startNode}" with distance 0, all other nodes with Infinity.`,
    });

    while (!pq.isEmpty()) {
      const { node: current, distance: currentDist } = pq.extractMin();

      if (visited.has(current)) continue;
      visited.add(current);

      steps.push({
        event: 'VISITING',
        current,
        currentDist,
        description: `Extracted minimum distance node "${current}" (distance: ${currentDist.toFixed(1)} km).`,
      });

      if (endNode && current === endNode) {
        break; // Early exit when target is reached
      }

      for (const neighbor of this.getNeighbors(current)) {
        if (visited.has(neighbor.node)) continue;

        const candidateDistance = currentDist + neighbor.weight;

        if (candidateDistance < distances[neighbor.node]) {
          const oldDist = distances[neighbor.node];
          distances[neighbor.node] = candidateDistance;
          previous[neighbor.node] = current;
          pq.insert({ node: neighbor.node, distance: candidateDistance });

          steps.push({
            event: 'RELAX_EDGE',
            from: current,
            to: neighbor.node,
            weight: neighbor.weight,
            oldDist: oldDist === Infinity ? 'Infinity' : oldDist.toFixed(1),
            newDist: candidateDistance.toFixed(1),
            description: `Relaxed edge (${current} -> ${neighbor.node}): updated distance from ${
              oldDist === Infinity ? 'Inf' : oldDist.toFixed(1)
            } km to ${candidateDistance.toFixed(1)} km.`,
          });
        }
      }
    }

    // Reconstruct path to endNode if specified
    let path = [];
    let totalDistance = Infinity;

    if (endNode && distances[endNode] !== Infinity) {
      totalDistance = distances[endNode];
      let curr = endNode;
      while (curr) {
        path.unshift(curr);
        curr = previous[curr];
      }
    }

    return {
      startNode,
      endNode,
      distances,
      previous,
      path,
      totalDistance: totalDistance === Infinity ? 0 : totalDistance,
      steps,
    };
  }
}

/**
 * Pre-configured Demonstration Network of MMR (Mumbai, Thane, Kalyan, Dombivli, Navi Mumbai)
 * Used for Group-Friendly Ground Finder demo and College Viva presentation.
 */
function createDemoTransitGraph() {
  const g = new Graph();

  // Localities / Hubs with approximate real-world relative road/metro distances (km)
  g.addVertex('Kalyan West', { type: 'locality', coords: [73.1305, 19.2437] });
  g.addVertex('Dombivli East', { type: 'locality', coords: [73.0863, 19.2184] });
  g.addVertex('Diva Junction', { type: 'locality', coords: [73.0427, 19.1889] });
  g.addVertex('Mumbra', { type: 'locality', coords: [73.0189, 19.1906] });
  g.addVertex('Thane West (Urban Sports Turf)', { type: 'venue', coords: [72.9781, 19.2183] });
  g.addVertex('Mulund West', { type: 'locality', coords: [72.9559, 19.1726] });
  g.addVertex('Ghatkopar East', { type: 'locality', coords: [72.908, 19.086] });
  g.addVertex('Bandra West (Wings Sports Centre)', { type: 'venue', coords: [72.8295, 19.0544] });
  g.addVertex('Navi Mumbai Vashi', { type: 'locality', coords: [72.9982, 19.0771] });
  g.addVertex('Chembur (Kick Off Turf)', { type: 'venue', coords: [72.8988, 19.0522] });

  // Connected corridors with travel distance in km
  g.addEdge('Kalyan West', 'Dombivli East', 6.2);
  g.addEdge('Dombivli East', 'Diva Junction', 5.5);
  g.addEdge('Diva Junction', 'Mumbra', 4.8);
  g.addEdge('Mumbra', 'Thane West (Urban Sports Turf)', 7.1);
  g.addEdge('Dombivli East', 'Thane West (Urban Sports Turf)', 16.5); // via Shilphata-Kalyan road
  g.addEdge('Thane West (Urban Sports Turf)', 'Mulund West', 5.2);
  g.addEdge('Thane West (Urban Sports Turf)', 'Navi Mumbai Vashi', 18.0); // via Thane-Belapur road
  g.addEdge('Mulund West', 'Ghatkopar East', 11.4);
  g.addEdge('Ghatkopar East', 'Chembur (Kick Off Turf)', 5.8);
  g.addEdge('Ghatkopar East', 'Bandra West (Wings Sports Centre)', 12.6); // via SCLR
  g.addEdge('Chembur (Kick Off Turf)', 'Bandra West (Wings Sports Centre)', 9.8);
  g.addEdge('Navi Mumbai Vashi', 'Chembur (Kick Off Turf)', 12.3); // via Sion-Panvel hwy

  return g;
}

module.exports = { Graph, createDemoTransitGraph };
