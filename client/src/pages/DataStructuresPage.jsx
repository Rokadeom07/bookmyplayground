import React, { useState } from 'react';
import {
  Binary,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import {
  Trie,
  PriorityQueue,
  Graph,
  createDemoTransitGraph,
  CustomHashMap,
  mergeSort,
  intervalsOverlap,
  calculateHaversineDistance,
  calculateWeightedRecommendation,
} from '../algorithms/clientAlgorithms';

export default function DataStructuresPage() {
  const [activeTab, setActiveTab] = useState('trie');

  // 1. TRIE STATE
  const [triePrefix, setTriePrefix] = useState('ban');
  const [trieResults, setTrieResults] = useState(() => {
    const t = new Trie();
    t.insert('Neville Dsouza Turf Bandra', { type: 'venue' });
    t.insert('Wings Sports Centre Bandra', { type: 'venue' });
    t.insert('Bandra West', { type: 'locality' });
    t.insert('Bangalore Golf Club', { type: 'venue' });
    t.insert('Box Cricket Arena', { type: 'venue' });
    return t.autocomplete('ban');
  });

  const handleTrieSearch = prefix => {
    setTriePrefix(prefix);
    const t = new Trie();
    t.insert('Neville Dsouza Turf Bandra', { type: 'venue' });
    t.insert('Wings Sports Centre Bandra', { type: 'venue' });
    t.insert('Bandra West', { type: 'locality' });
    t.insert('Bangalore Golf Club', { type: 'venue' });
    t.insert('Box Cricket Arena', { type: 'venue' });
    t.insert('Kalyan Sports Complex', { type: 'venue' });
    t.insert('Urban Sports Park Thane', { type: 'venue' });
    setTrieResults(t.autocomplete(prefix));
  };

  // 2. PRIORITY QUEUE / MIN HEAP STATE
  const [pqItems, setPqItems] = useState([
    { name: 'Turf A (3.2 km)', score: 3.2 },
    { name: 'Turf B (1.5 km)', score: 1.5 },
    { name: 'Turf C (5.0 km)', score: 5.0 },
    { name: 'Turf D (0.8 km)', score: 0.8 },
  ]);
  const [pqExtracted, setPqExtracted] = useState([]);

  const handleExtractMin = () => {
    if (pqItems.length === 0) return;
    const pq = new PriorityQueue((a, b) => a.score - b.score);
    pqItems.forEach(i => pq.insert(i));
    const min = pq.extractMin();
    const remaining = [];
    while (!pq.isEmpty()) {
      remaining.push(pq.extractMin());
    }
    setPqItems(remaining);
    setPqExtracted(prev => [min, ...prev]);
  };

  // 3. GRAPH & DIJKSTRA STATE
  const [startNode, setStartNode] = useState('Kalyan West');
  const [endNode, setEndNode] = useState('Thane West (Urban Sports Turf)');
  const [dijkstraResult, setDijkstraResult] = useState(() => {
    const g = createDemoTransitGraph();
    return g.dijkstra('Kalyan West', 'Thane West (Urban Sports Turf)');
  });

  const handleRunDijkstra = () => {
    const g = createDemoTransitGraph();
    setDijkstraResult(g.dijkstra(startNode, endNode));
  };

  // 4. HASH MAP STATE
  const [hashKey, setHashKey] = useState('slot_18_00');
  const [hashValue, setHashValue] = useState('Rahul (Confirmed)');
  const [hashMapState, setHashMapState] = useState(() => {
    const hm = new CustomHashMap(8);
    hm.put('slot_17_00', 'Amit');
    hm.put('slot_18_00', 'Rahul');
    hm.put('slot_19_00', 'Sneha');
    return hm.getBucketState();
  });

  const handleAddHashKey = e => {
    e.preventDefault();
    const hm = new CustomHashMap(8);
    // restore existing items
    hashMapState.buckets.forEach(b => {
      b.items.forEach(it => hm.put(it.key, it.value));
    });
    hm.put(hashKey, hashValue);
    setHashMapState(hm.getBucketState());
  };

  // 5. MERGE SORT STATE
  const [sortInput, setSortInput] = useState('1500, 800, 2200, 1100, 950, 1800');
  const [sortTrace, setSortTrace] = useState(() => {
    const arr = [1500, 800, 2200, 1100, 950, 1800];
    return mergeSort(arr, (a, b) => a - b);
  });

  const handleRunSort = () => {
    const arr = sortInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    setSortTrace(mergeSort(arr, (a, b) => a - b));
  };

  // 6. INTERVAL OVERLAP STATE
  const [slotAStart, setSlotAStart] = useState('18:00');
  const [slotAEnd, setSlotAEnd] = useState('19:00');
  const [slotBStart, setSlotBStart] = useState('18:30');
  const [slotBEnd, setSlotBEnd] = useState('19:30');
  const isOverlap = intervalsOverlap(slotAStart, slotAEnd, slotBStart, slotBEnd);

  // 7. HAVERSINE STATE
  const [lat1, setLat1] = useState(19.0558); // Bandra
  const [lon1, setLon1] = useState(72.8315);
  const [lat2, setLat2] = useState(19.2183); // Thane
  const [lon2, setLon2] = useState(72.9781);
  const haversineDist = calculateHaversineDistance(lat1, lon1, lat2, lon2);

  // 8. WEIGHTED RECOMMENDATION STATE
  const [recDist, setRecDist] = useState(4);
  const [recPrice, setRecPrice] = useState(1400);
  const [recBudget, setRecBudget] = useState(2000);
  const recResult = calculateWeightedRecommendation({
    distanceKm: recDist,
    priceInr: recPrice,
    budgetInr: recBudget,
  });

  const algorithms = [
    { id: 'trie', label: '1. Trie (Prefix Tree)', tag: 'Autocomplete' },
    { id: 'heap', label: '2. Min Heap / PQ', tag: 'Top-K Ranking' },
    { id: 'graph', label: '3. Graph & Dijkstra', tag: 'Shortest Path' },
    { id: 'hash', label: '4. Custom Hash Map', tag: 'O(1) Slot Lookup' },
    { id: 'sort', label: '5. Merge Sort', tag: 'Divide & Conquer' },
    { id: 'interval', label: '6. Interval Overlap', tag: 'Concurrency Lock' },
    { id: 'haversine', label: '7. Haversine Formula', tag: 'Geospatial Radar' },
    { id: 'weighted', label: '8. Weighted Scoring', tag: 'Decision Engine' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-charcoal-900 text-white rounded-3xl p-8 border border-gray-800 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/30">
          <Binary className="w-3.5 h-3.5" />
          <span>Computer Engineering WDL & Data Structures Project Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Data Structures & Algorithms Viva Lab
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-3xl leading-relaxed">
          Interactive executable implementations of all 8 core Data Structures powering BookMyPlayground 2.0.
          Every algorithm is written in genuine JavaScript and demonstrated live with execution metrics, time/space complexity, and viva explanations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {algorithms.map(alg => (
          <button
            key={alg.id}
            onClick={() => setActiveTab(alg.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
              activeTab === alg.id
                ? 'bg-charcoal-900 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{alg.label}</span>
            <span
              className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                activeTab === alg.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {alg.tag}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        {/* 1. TRIE */}
        {activeTab === 'trie' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Trie (Prefix Tree) Implementation</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Powers the global navbar autocomplete with sub-millisecond prefix searches.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Time: <strong>O(m)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Space: <strong>O(Σ · N · M)</strong>
                </span>
              </div>
            </div>

            {/* Live Interactive Runner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Test Autocomplete Prefix
                </label>
                <input
                  type="text"
                  value={triePrefix}
                  onChange={e => handleTrieSearch(e.target.value)}
                  placeholder="Type prefix: e.g. 'ban', 'turf', 'box'..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-brand-600"
                />

                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-700 block mb-2">
                    Trie Autocomplete Results ({trieResults.length}):
                  </span>
                  <div className="space-y-1.5">
                    {trieResults.map((r, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-900">{r.word}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                          Match Found
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Viva Theory Box */}
              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Instead of running a slow linear scan `O(N)` over thousands of venues on every keystroke, a Trie stores characters hierarchically at each node.
                </p>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong>Insert:</strong> Traverses character by character, branching at missing nodes.</li>
                  <li>• <strong>Prefix Search:</strong> Follows children matching the input prefix in `O(m)` time where `m` is prefix length.</li>
                  <li>• <strong>DFS Word Collector:</strong> Gathers matching words recursively.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. MIN HEAP / PRIORITY QUEUE */}
        {activeTab === 'heap' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Min Heap / Priority Queue</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Used in Smart Ground Recommendations and Weather Alternatives to extract Top-K optimal venues in O(N log K).
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Insert/Extract: <strong>O(log N)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Peek: <strong>O(1)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase">
                    Current Min-Heap State ({pqItems.length} elements)
                  </span>
                  <button
                    onClick={handleExtractMin}
                    disabled={pqItems.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition"
                  >
                    extractMin() [Bubble Down]
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {pqItems.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs flex justify-between items-center"
                    >
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="font-bold text-brand-600 font-mono">Priority: {item.score}</span>
                    </div>
                  ))}
                </div>

                {pqExtracted.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-gray-500 block mb-1">
                      Extracted In Priority Order (Lowest Score First):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pqExtracted.map((ex, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                        >
                          {ex.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  A binary heap maintains the heap invariant where parent nodes have smaller keys than children (`heap[parent] &lt;= heap[child]`).
                </p>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong>Bubble Up:</strong> Swaps newly inserted elements upward until order is restored.</li>
                  <li>• <strong>Sink Down:</strong> Replaces extracted root with last element and trickles down with smallest child.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. GRAPH & DIJKSTRA */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Graph Adjacency List & Dijkstra's Algorithm</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculates shortest geographical paths through our MMR transit network for group travel fairness.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Time: <strong>O((V + E) log V)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Space: <strong>O(V + E)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Source Node</label>
                    <select
                      value={startNode}
                      onChange={e => setStartNode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold"
                    >
                      <option value="Kalyan West">Kalyan West</option>
                      <option value="Dombivli East">Dombivli East</option>
                      <option value="Diva Junction">Diva Junction</option>
                      <option value="Mumbra">Mumbra</option>
                      <option value="Mulund West">Mulund West</option>
                      <option value="Ghatkopar East">Ghatkopar East</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Venue Node</label>
                    <select
                      value={endNode}
                      onChange={e => setEndNode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold"
                    >
                      <option value="Thane West (Urban Sports Turf)">Thane West (Urban Sports Turf)</option>
                      <option value="Bandra West (Wings Sports Centre)">Bandra West (Wings Sports Centre)</option>
                      <option value="Chembur (Kick Off Turf)">Chembur (Kick Off Turf)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRunDijkstra}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Dijkstra Shortest Path</span>
                </button>

                {dijkstraResult && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-700">Computed Shortest Distance:</span>
                      <span className="text-emerald-600 text-sm font-mono font-black">
                        {dijkstraResult.totalDistance.toFixed(1)} km
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase font-bold">
                        Reconstructed Path:
                      </span>
                      <div className="flex flex-wrap items-center gap-1 mt-1 font-mono text-gray-900 font-bold">
                        {dijkstraResult.path.map((node, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white border border-gray-300">
                            {node} {i < dijkstraResult.path.length - 1 && '→'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-blue-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Our graph models real-world locality hubs as vertices `V` and road corridors as weighted edges `E`.
                </p>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• Uses a Min-Priority Queue of distances to greedily explore the closest unvisited node.</li>
                  <li>• Relaxes adjacent edges whenever `dist[u] + weight(u, v) &lt; dist[v]`.</li>
                  <li>• Reconstructs the complete optimal trajectory via a `previous` pointer map.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 4. CUSTOM HASH MAP */}
        {activeTab === 'hash' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Custom Hash Map (Separate Chaining)</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Demonstrates polynomial rolling hash and collision handling via linked lists in buckets.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Average: <strong>O(1)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Worst: <strong>O(N)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <form onSubmit={handleAddHashKey} className="flex gap-2">
                  <input
                    type="text"
                    value={hashKey}
                    onChange={e => setHashKey(e.target.value)}
                    placeholder="Key (e.g. slot_20_00)"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                  />
                  <input
                    type="text"
                    value={hashValue}
                    onChange={e => setHashValue(e.target.value)}
                    placeholder="Value (e.g. Booked)"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                  >
                    put(k, v)
                  </button>
                </form>

                {/* Bucket visualizer */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-gray-700 uppercase block">
                    Bucket State (Capacity: 8):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {hashMapState.buckets.map(b => (
                      <div
                        key={b.bucketIndex}
                        className={`p-2.5 rounded-xl border text-xs ${
                          b.chainCount > 0 ? 'bg-brand-50/50 border-brand-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-mono text-[10px] text-gray-400 block">
                          Bucket #{b.bucketIndex} ({b.chainCount})
                        </span>
                        {b.items.map((it, idx) => (
                          <div key={idx} className="mt-1 font-mono font-bold text-gray-900 truncate">
                            {it.key}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Polynomial rolling hash: `hash = (hash * PRIME + charCode) % capacity`.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Colliding keys are chained into singly linked lists attached to each bucket.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. MERGE SORT */}
        {activeTab === 'sort' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Merge Sort (Divide and Conquer)</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Provides guaranteed stable sorting for venues by price, rating, or match score.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Time: <strong>O(N log N)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Space: <strong>O(N)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Enter Comma-Separated Numbers (Turf Prices)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sortInput}
                      onChange={e => setSortInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                    />
                    <button
                      onClick={handleRunSort}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                    >
                      Sort
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Sorted Array Output:</span>
                    <span className="font-mono font-black text-brand-600">
                      [{sortTrace.sorted.join(', ')}]
                    </span>
                  </div>
                </div>

                {sortTrace.steps && (
                  <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Execution Step Trace:
                    </span>
                    {sortTrace.steps.slice(0, 6).map((st, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
                        <span className="font-bold text-brand-600 mr-2">[{st.action}]</span>
                        <span>{st.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Merge sort recursively halves arrays down to single elements and merges the sorted sublists in linear time.
                  Unlike QuickSort, Merge Sort has a guaranteed `O(N log N)` worst-case time complexity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. INTERVAL OVERLAP */}
        {activeTab === 'interval' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Interval Overlap Detection Algorithm</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enforces zero double bookings and calculates unbooked gap windows during operating hours.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Condition: <strong>sA &lt; eB && sB &lt; eA</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 block">Existing Slot A</span>
                    <input
                      type="time"
                      value={slotAStart}
                      onChange={e => setSlotAStart(e.target.value)}
                      className="w-full px-2 py-1 rounded border text-xs"
                    />
                    <input
                      type="time"
                      value={slotAEnd}
                      onChange={e => setSlotAEnd(e.target.value)}
                      className="w-full px-2 py-1 rounded border text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 block">Candidate Slot B</span>
                    <input
                      type="time"
                      value={slotBStart}
                      onChange={e => setSlotBStart(e.target.value)}
                      className="w-full px-2 py-1 rounded border text-xs"
                    />
                    <input
                      type="time"
                      value={slotBEnd}
                      onChange={e => setSlotBEnd(e.target.value)}
                      className="w-full px-2 py-1 rounded border text-xs"
                    />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-center font-bold text-sm ${
                    isOverlap
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {isOverlap
                    ? '⚠️ CONFLICT DETECTED: Overlapping intervals! Booking rejected.'
                    : '✅ NO CONFLICT: Slots can safely be booked concurrently.'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Two intervals touch boundaries at `18:00-19:00` and `19:00-20:00` without conflict because `19:00` is strictly equal.
                  Concurrency holds use this formula with atomic conditional updates in MongoDB.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. HAVERSINE FORMULA */}
        {activeTab === 'haversine' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Haversine Distance Formula</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculates true great-circle distance between GPS coordinates on Earth's sphere (R = 6371 km).
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Time: <strong>O(1)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 block">Point 1 (Bandra Turf)</span>
                    <label className="text-[10px] text-gray-500">Lat: {lat1}, Lon: {lon1}</label>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 block">Point 2 (Thane Turf)</span>
                    <label className="text-[10px] text-gray-500">Lat: {lat2}, Lon: {lon2}</label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center">
                  <span className="text-xs text-brand-700 block font-medium">Computed Straight-Line Distance:</span>
                  <span className="text-2xl font-black text-brand-900 font-mono mt-1 block">
                    {haversineDist} km
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Viva Presentation Notes:</h4>
                <p className="text-gray-300 leading-relaxed font-mono">
                  a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)<br />
                  c = 2·atan2(√a, √(1-a))<br />
                  d = R · c
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 8. WEIGHTED RANKING FORMULA */}
        {activeTab === 'weighted' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Multi-Factor Weighted Ranking Formula</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Combines normalized metrics into a transparent 0-100% composite recommendation score.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                  Formula: <strong>Σ (w_i · S_i)</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>Distance: {recDist} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={recDist}
                    onChange={e => setRecDist(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>Ground Price: ₹{recPrice} (Budget: ₹{recBudget})</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="3000"
                    step="100"
                    value={recPrice}
                    onChange={e => setRecPrice(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center">
                  <span className="text-xs text-brand-700 block font-medium">Computed Recommendation Score:</span>
                  <span className="text-3xl font-black text-brand-900 font-mono mt-1 block">
                    {recResult.matchPercent}% Match
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-3 text-xs">
                <h4 className="font-bold text-sm text-brand-400">Score Breakdown:</h4>
                <div className="space-y-1.5">
                  {recResult.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between text-gray-300">
                      <span>{b.factor}</span>
                      <span className="font-mono text-brand-400 font-bold">{b.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
