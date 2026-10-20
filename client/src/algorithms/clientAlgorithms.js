/**
 * Data Structures & Algorithms (Client-Side Interactive Viva Implementations)
 * BookMyPlayground 2.0
 */

// 1. TRIE
export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.metadata = [];
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
    this.totalWords = 0;
  }

  insert(phrase, metadata = null) {
    if (!phrase) return;
    const clean = phrase.trim().toLowerCase();
    let current = this.root;

    for (const char of clean) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      this.totalWords++;
    }
    if (metadata) {
      current.metadata.push(metadata);
    }
  }

  autocomplete(prefix, limit = 10) {
    if (!prefix) return [];
    const clean = prefix.trim().toLowerCase();
    let current = this.root;

    for (const char of clean) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char);
    }

    const results = [];
    this._collectWords(current, clean, results, limit);
    return results;
  }

  _collectWords(node, currentWord, results, limit) {
    if (results.length >= limit) return;
    if (node.isEndOfWord) {
      results.push({ word: currentWord, metadata: node.metadata });
    }
    for (const [char, childNode] of node.children.entries()) {
      if (results.length >= limit) break;
      this._collectWords(childNode, currentWord + char, results, limit);
    }
  }
}

// 2. MIN HEAP / PRIORITY QUEUE
export class PriorityQueue {
  constructor(comparator = (a, b) => a.score - b.score) {
    this.heap = [];
    this.comparator = comparator;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  insert(value) {
    this.heap.push(value);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min;
  }

  extractTopK(k) {
    const results = [];
    const count = Math.min(k, this.heap.length);
    for (let i = 0; i < count; i++) {
      results.push(this.extractMin());
    }
    return results;
  }

  _bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.comparator(this.heap[current], this.heap[parent]) < 0) {
        [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
        current = parent;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * current + 1;
      const rightChild = 2 * current + 2;
      let smallest = current;

      if (leftChild < length && this.comparator(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }
      if (rightChild < length && this.comparator(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }

      if (smallest !== current) {
        [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
        current = smallest;
      } else {
        break;
      }
    }
  }
}

// 3. GRAPH & DIJKSTRA
export class Graph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodeDetails = new Map();
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

  dijkstra(startNode, endNode = null) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const steps = [];

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
      step: 1,
      current: startNode,
      description: `Initialized starting node "${startNode}" to 0 km, all other nodes to ∞.`,
    });

    let stepCounter = 2;

    while (!pq.isEmpty()) {
      const { node: current, distance: currentDist } = pq.extractMin();
      if (visited.has(current)) continue;
      visited.add(current);

      if (endNode && current === endNode) {
        steps.push({
          step: stepCounter++,
          current,
          description: `Target destination "${endNode}" reached with optimal distance ${currentDist.toFixed(1)} km!`,
        });
        break;
      }

      for (const neighbor of this.getNeighbors(current)) {
        if (visited.has(neighbor.node)) continue;
        const candidateDistance = currentDist + neighbor.weight;

        if (candidateDistance < distances[neighbor.node]) {
          const old = distances[neighbor.node];
          distances[neighbor.node] = candidateDistance;
          previous[neighbor.node] = current;
          pq.insert({ node: neighbor.node, distance: candidateDistance });

          steps.push({
            step: stepCounter++,
            from: current,
            to: neighbor.node,
            weight: neighbor.weight,
            description: `Relaxed edge ${current} → ${neighbor.node} (${neighbor.weight} km): updated from ${
              old === Infinity ? '∞' : old.toFixed(1) + ' km'
            } to ${candidateDistance.toFixed(1)} km.`,
          });
        }
      }
    }

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

    return { distances, previous, path, totalDistance, steps };
  }
}

export function createDemoTransitGraph() {
  const g = new Graph();
  g.addVertex('Kalyan West', { type: 'locality' });
  g.addVertex('Dombivli East', { type: 'locality' });
  g.addVertex('Diva Junction', { type: 'locality' });
  g.addVertex('Mumbra', { type: 'locality' });
  g.addVertex('Thane West (Urban Sports Turf)', { type: 'venue' });
  g.addVertex('Mulund West', { type: 'locality' });
  g.addVertex('Ghatkopar East', { type: 'locality' });
  g.addVertex('Bandra West (Wings Sports Centre)', { type: 'venue' });
  g.addVertex('Navi Mumbai Vashi', { type: 'locality' });
  g.addVertex('Chembur (Kick Off Turf)', { type: 'venue' });

  g.addEdge('Kalyan West', 'Dombivli East', 6.2);
  g.addEdge('Dombivli East', 'Diva Junction', 5.5);
  g.addEdge('Diva Junction', 'Mumbra', 4.8);
  g.addEdge('Mumbra', 'Thane West (Urban Sports Turf)', 7.1);
  g.addEdge('Dombivli East', 'Thane West (Urban Sports Turf)', 16.5);
  g.addEdge('Thane West (Urban Sports Turf)', 'Mulund West', 5.2);
  g.addEdge('Thane West (Urban Sports Turf)', 'Navi Mumbai Vashi', 18.0);
  g.addEdge('Mulund West', 'Ghatkopar East', 11.4);
  g.addEdge('Ghatkopar East', 'Chembur (Kick Off Turf)', 5.8);
  g.addEdge('Ghatkopar East', 'Bandra West (Wings Sports Centre)', 12.6);
  g.addEdge('Chembur (Kick Off Turf)', 'Bandra West (Wings Sports Centre)', 9.8);
  g.addEdge('Navi Mumbai Vashi', 'Chembur (Kick Off Turf)', 12.3);

  return g;
}

// 4. HASH MAP
export class CustomHashMap {
  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
  }

  _hash(key) {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.capacity;
    }
    return Math.abs(hash);
  }

  put(key, value) {
    const idx = this._hash(key);
    let head = this.buckets[idx];
    let curr = head;
    while (curr) {
      if (curr.key === key) {
        curr.value = value;
        return;
      }
      curr = curr.next;
    }
    const newNode = { key, value, next: head };
    this.buckets[idx] = newNode;
    this.size++;
  }

  get(key) {
    const idx = this._hash(key);
    let curr = this.buckets[idx];
    while (curr) {
      if (curr.key === key) return curr.value;
      curr = curr.next;
    }
    return undefined;
  }

  getBucketState() {
    const state = [];
    for (let i = 0; i < this.capacity; i++) {
      const chain = [];
      let curr = this.buckets[i];
      while (curr) {
        chain.push({ key: curr.key, value: curr.value });
        curr = curr.next;
      }
      state.push({ bucketIndex: i, chainCount: chain.length, items: chain });
    }
    return { capacity: this.capacity, size: this.size, buckets: state };
  }
}

// 5. MERGE SORT
export function mergeSort(array, comparator = (a, b) => a - b) {
  const steps = [];

  function sort(arr, depth = 0) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    steps.push({
      action: 'DIVIDE',
      depth,
      description: `Dividing chunk of ${arr.length} items into [${left.length}] and [${right.length}].`,
    });

    const sLeft = sort(left, depth + 1);
    const sRight = sort(right, depth + 1);

    const merged = [];
    let i = 0, j = 0;
    while (i < sLeft.length && j < sRight.length) {
      if (comparator(sLeft[i], sRight[j]) <= 0) {
        merged.push(sLeft[i]);
        i++;
      } else {
        merged.push(sRight[j]);
        j++;
      }
    }
    while (i < sLeft.length) merged.push(sLeft[i++]);
    while (j < sRight.length) merged.push(sRight[j++]);

    steps.push({
      action: 'CONQUER',
      depth,
      description: `Merged sorted sub-arrays into chunk of length ${merged.length}.`,
    });

    return merged;
  }

  const sorted = sort(array);
  return { sorted, steps };
}

// 6. INTERVAL OVERLAP
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function intervalsOverlap(startA, endA, startB, endB) {
  const sA = typeof startA === 'number' ? startA : timeToMinutes(startA);
  const eA = typeof endA === 'number' ? endA : timeToMinutes(endA);
  const sB = typeof startB === 'number' ? startB : timeToMinutes(startB);
  const eB = typeof endB === 'number' ? endB : timeToMinutes(endB);
  return sA < eB && sB < eA;
}

// 7. HAVERSINE
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371.0;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// 8. WEIGHTED RECOMMENDATION FORMULA
export function calculateWeightedRecommendation(params) {
  const {
    distanceKm = 5,
    maxDistanceKm = 25,
    priceInr = 1200,
    budgetInr = 2000,
    isAvailable = true,
    matchedFacilities = 4,
    totalFacilities = 5,
    rating = 4.5,
    weights = { distance: 0.25, price: 0.25, availability: 0.25, facilities: 0.15, rating: 0.1 },
  } = params;

  const sDist = Math.max(0, 1.0 - distanceKm / maxDistanceKm);
  const sPrice = priceInr <= budgetInr ? 1.0 - (priceInr / budgetInr) * 0.3 : Math.max(0, 0.7 - (priceInr - budgetInr) / budgetInr);
  const sAvail = isAvailable ? 1.0 : 0.2;
  const sFac = Math.min(1.0, matchedFacilities / totalFacilities);
  const sRate = Math.min(1.0, rating / 5.0);

  const rawScore =
    weights.distance * sDist +
    weights.price * sPrice +
    weights.availability * sAvail +
    weights.facilities * sFac +
    weights.rating * sRate;

  const matchPercent = Math.round(Math.min(100, Math.max(10, rawScore * 100)));

  return {
    matchPercent,
    rawScore,
    breakdown: [
      { factor: 'Distance (25%)', score: Math.round(sDist * 100), value: `${distanceKm} km` },
      { factor: 'Price & Budget (25%)', score: Math.round(sPrice * 100), value: `₹${priceInr} / ₹${budgetInr}` },
      { factor: 'Slot Availability (25%)', score: Math.round(sAvail * 100), value: isAvailable ? 'Confirmed' : 'Limited' },
      { factor: 'Facilities (15%)', score: Math.round(sFac * 100), value: `${matchedFacilities}/${totalFacilities} amenities` },
      { factor: 'Rating (10%)', score: Math.round(sRate * 100), value: `${rating} ★` },
    ],
  };
}
