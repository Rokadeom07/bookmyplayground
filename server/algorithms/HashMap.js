/**
 * Hash Map Data Structure (Separate Chaining with Buckets)
 * Purpose in BookMyPlayground:
 * - O(1) average-time booking slot lookup and conflict detection
 * - Fast feature indexing and availability groupings
 * - Aggregation of owner analytics by date and hour
 * Time Complexity:
 * - Insert: O(1) average, O(n) worst case (with clustering)
 * - Get: O(1) average, O(n) worst case
 * - Delete: O(1) average
 * Space Complexity: O(buckets + entries)
 */

class HashNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

class CustomHashMap {
  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
    this.loadFactorThreshold = 0.75;
  }

  // Polynomial rolling hash function
  _hash(key) {
    const keyStr = String(key);
    let hash = 0;
    const PRIME = 31;
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash * PRIME + keyStr.charCodeAt(i)) % this.capacity;
    }
    return Math.abs(hash);
  }

  put(key, value) {
    const index = this._hash(key);
    let head = this.buckets[index];

    // Check if key already exists in bucket chain
    let current = head;
    while (current !== null) {
      if (current.key === key) {
        current.value = value; // update
        return;
      }
      current = current.next;
    }

    // Insert new node at head of chain
    const newNode = new HashNode(key, value);
    newNode.next = head;
    this.buckets[index] = newNode;
    this.size++;

    // Resize if load factor exceeds threshold
    if (this.size / this.capacity > this.loadFactorThreshold) {
      this._resize(this.capacity * 2);
    }
  }

  get(key) {
    const index = this._hash(key);
    let current = this.buckets[index];

    while (current !== null) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  remove(key) {
    const index = this._hash(key);
    let current = this.buckets[index];
    let prev = null;

    while (current !== null) {
      if (current.key === key) {
        if (prev === null) {
          this.buckets[index] = current.next;
        } else {
          prev.next = current.next;
        }
        this.size--;
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  keys() {
    const allKeys = [];
    for (let i = 0; i < this.capacity; i++) {
      let current = this.buckets[i];
      while (current !== null) {
        allKeys.push(current.key);
        current = current.next;
      }
    }
    return allKeys;
  }

  values() {
    const allVals = [];
    for (let i = 0; i < this.capacity; i++) {
      let current = this.buckets[i];
      while (current !== null) {
        allVals.push(current.value);
        current = current.next;
      }
    }
    return allVals;
  }

  entries() {
    const result = [];
    for (let i = 0; i < this.capacity; i++) {
      let current = this.buckets[i];
      while (current !== null) {
        result.push([current.key, current.value]);
        current = current.next;
      }
    }
    return result;
  }

  // Get bucket details for Viva visualizer
  getBucketState() {
    const state = [];
    for (let i = 0; i < this.capacity; i++) {
      const chain = [];
      let current = this.buckets[i];
      while (current !== null) {
        chain.push({ key: current.key, value: current.value });
        current = current.next;
      }
      state.push({ bucketIndex: i, chainCount: chain.length, items: chain });
    }
    return {
      capacity: this.capacity,
      size: this.size,
      loadFactor: (this.size / this.capacity).toFixed(2),
      buckets: state,
    };
  }

  _resize(newCapacity) {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;

    for (let i = 0; i < oldBuckets.length; i++) {
      let current = oldBuckets[i];
      while (current !== null) {
        this.put(current.key, current.value);
        current = current.next;
      }
    }
  }
}

module.exports = { CustomHashMap };
