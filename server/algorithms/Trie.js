/**
 * Trie (Prefix Tree) Data Structure
 * Purpose in BookMyPlayground:
 * - High-speed autocomplete for search bars across Venue names, Cities, and Localities
 * - Time Complexity: O(m) where m is prefix length for lookup and insertion
 * - Space Complexity: O(ALPHABET_SIZE * N * M)
 */

class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.metadata = []; // Stores attached venue/city objects for fast retrieval
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.totalWords = 0;
  }

  // Insert a word or phrase with optional metadata (e.g. venue ID, type)
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

  // Search exact word match
  search(phrase) {
    if (!phrase) return false;
    const clean = phrase.trim().toLowerCase();
    let current = this.root;

    for (const char of clean) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char);
    }
    return current.isEndOfWord;
  }

  // Check if any word starts with prefix
  startsWith(prefix) {
    if (!prefix) return false;
    const clean = prefix.trim().toLowerCase();
    let current = this.root;

    for (const char of clean) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char);
    }
    return true;
  }

  // Autocomplete: returns up to `limit` words starting with prefix
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

  // Helper DFS traversal to collect words
  _collectWords(node, currentWord, results, limit) {
    if (results.length >= limit) return;

    if (node.isEndOfWord) {
      results.push({
        word: currentWord,
        metadata: node.metadata,
      });
    }

    // Traverse children lexicographically
    for (const [char, childNode] of node.children.entries()) {
      if (results.length >= limit) break;
      this._collectWords(childNode, currentWord + char, results, limit);
    }
  }
}

module.exports = { Trie, TrieNode };
