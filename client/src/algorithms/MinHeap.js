/**
 * Min Heap / Priority Queue Data Structure
 * Purpose in BookMyPlayground:
 * - Efficiently retrieve Top-K ranked sports venues
 * - Nearest ground extraction in O(log N)
 * - Weather-safe alternative ranking
 * - Group fairness rank sorting
 * Time Complexity:
 * - Insert: O(log N)
 * - Extract-Min: O(log N)
 * - Peek: O(1)
 * - Heapify: O(N)
 * Space Complexity: O(N)
 */

class PriorityQueue {
  /**
   * @param {Function} comparator - function(a, b) returning < 0 if a has higher priority than b (min-heap default)
   */
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

  // Build heap from existing array in O(N) time
  heapify(items) {
    this.heap = [...items];
    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this._sinkDown(i);
    }
  }

  // Extract top K items
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

      if (
        leftChild < length &&
        this.comparator(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.comparator(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
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

module.exports = { PriorityQueue };
