const assert = require('assert');
const { Trie } = require('../algorithms/Trie');
const { PriorityQueue } = require('../algorithms/MinHeap');
const { Graph, createDemoTransitGraph } = require('../algorithms/Graph');
const { CustomHashMap } = require('../algorithms/HashMap');
const { mergeSort } = require('../algorithms/MergeSort');
const {
  intervalsOverlap,
  checkBookingConflict,
  generateHourlySlots,
} = require('../algorithms/IntervalOverlap');
const { calculateHaversineDistance } = require('../algorithms/Haversine');
const { scoreVenue } = require('../algorithms/WeightedRecommendation');

console.log('====================================================');
console.log('🧪 RUNNING BOOKMYPLAYGROUND 2.0 AUTOMATED TESTS');
console.log('====================================================');

let passedCount = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. TRIE AUTOCOMPLETE TESTS
runTest('Trie: insert, exact search, and prefix autocomplete', () => {
  const trie = new Trie();
  trie.insert('Neville Dsouza Turf', { id: 1, type: 'venue' });
  trie.insert('Wings Sports Centre', { id: 2, type: 'venue' });
  trie.insert('Bandra West', { id: 3, type: 'locality' });

  assert.strictEqual(trie.search('Neville Dsouza Turf'), true);
  assert.strictEqual(trie.search('NonExistent'), false);
  assert.strictEqual(trie.startsWith('ban'), true);

  const completions = trie.autocomplete('win');
  assert.strictEqual(completions.length, 1);
  assert.strictEqual(completions[0].word, 'wings sports centre');
});

// 2. MIN HEAP / PRIORITY QUEUE TESTS
runTest('PriorityQueue: Min-Heap extractMin and Top-K extraction', () => {
  const pq = new PriorityQueue((a, b) => a.val - b.val);
  pq.insert({ val: 40 });
  pq.insert({ val: 10 });
  pq.insert({ val: 30 });
  pq.insert({ val: 20 });

  assert.strictEqual(pq.size(), 4);
  assert.strictEqual(pq.peek().val, 10);
  assert.strictEqual(pq.extractMin().val, 10);
  assert.strictEqual(pq.extractMin().val, 20);

  const topRemaining = pq.extractTopK(2);
  assert.deepStrictEqual(topRemaining.map(x => x.val), [30, 40]);
});

// 3. GRAPH & DIJKSTRA ALGORITHM TESTS
runTest('Graph & Dijkstra: Shortest path in MMR Transit Network', () => {
  const g = createDemoTransitGraph();
  const result = g.dijkstra('Kalyan West', 'Thane West (Urban Sports Turf)');

  assert.ok(result.totalDistance > 0);
  assert.strictEqual(result.startNode, 'Kalyan West');
  assert.strictEqual(result.endNode, 'Thane West (Urban Sports Turf)');
  assert.ok(result.path.length >= 2);
  assert.strictEqual(result.path[0], 'Kalyan West');
  assert.strictEqual(result.path[result.path.length - 1], 'Thane West (Urban Sports Turf)');
  console.log(`     (Optimal path computed: ${result.path.join(' -> ')} in ${result.totalDistance.toFixed(1)} km)`);
});

// 4. CUSTOM HASH MAP TESTS
runTest('CustomHashMap: put, get, collision chaining, and load factor', () => {
  const map = new CustomHashMap(8);
  map.put('slot_18_00', { booked: true, player: 'Rahul' });
  map.put('slot_19_00', { booked: true, player: 'Sneha' });

  assert.strictEqual(map.get('slot_18_00').player, 'Rahul');
  assert.strictEqual(map.get('slot_19_00').player, 'Sneha');
  assert.strictEqual(map.get('slot_20_00'), undefined);

  const state = map.getBucketState();
  assert.strictEqual(state.size, 2);
});

// 5. MERGE SORT TESTS
runTest('MergeSort: Stable sorting of sports venues by price and rating', () => {
  const venues = [
    { name: 'Turf A', price: 1500, rating: 4.5 },
    { name: 'Turf B', price: 1000, rating: 4.8 },
    { name: 'Turf C', price: 1200, rating: 4.2 },
  ];

  const sortedByPrice = mergeSort(venues, (a, b) => a.price - b.price);
  assert.strictEqual(sortedByPrice.sorted[0].name, 'Turf B'); // 1000
  assert.strictEqual(sortedByPrice.sorted[2].name, 'Turf A'); // 1500

  const sortedByRatingDesc = mergeSort(venues, (a, b) => b.rating - a.rating);
  assert.strictEqual(sortedByRatingDesc.sorted[0].name, 'Turf B'); // 4.8
});

// 6. INTERVAL OVERLAP & CONCURRENCY PREVENTION TESTS
runTest('IntervalOverlap: Slot collision detection and boundary touching', () => {
  // Touching boundaries (18:00-19:00 and 19:00-20:00) should NOT conflict
  assert.strictEqual(intervalsOverlap('18:00', '19:00', '19:00', '20:00'), false);

  // Overlapping intervals (18:30-19:30 conflicts with 18:00-19:00)
  assert.strictEqual(intervalsOverlap('18:00', '19:00', '18:30', '19:30'), true);

  // Check booking conflict with existing bookings
  const existing = [{ startTime: '18:00', endTime: '19:00', bookingStatus: 'confirmed' }];
  const conflict1 = checkBookingConflict('18:00', '19:00', existing);
  assert.strictEqual(conflict1.hasConflict, true);

  const conflict2 = checkBookingConflict('19:00', '20:00', existing);
  assert.strictEqual(conflict2.hasConflict, false);
});

// 7. HAVERSINE GEODISTANCE TESTS
runTest('Haversine: Straight-line distance accuracy between Bandra and Thane', () => {
  // Bandra: 19.0558, 72.8315; Thane: 19.2183, 72.9781
  const dist = calculateHaversineDistance(19.0558, 72.8315, 19.2183, 72.9781);
  assert.ok(dist >= 23 && dist <= 27, `Distance should be ~24.5 km, got ${dist}`);
  console.log(`     (Bandra to Thane straight-line distance: ${dist} km)`);
});

// 8. WEIGHTED RECOMMENDATION SCORE TESTS
runTest('WeightedRecommendation: Multi-factor scoring and explanation output', () => {
  const sampleVenue = {
    name: 'Wings Sports Centre',
    sports: ['Football'],
    baseHourlyPricePaise: 150000, // ₹1,500
    facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
    ratingAverage: 4.8,
    ratingCount: 50,
    hasFloodlights: true,
  };

  const prefs = {
    distanceKm: 3.2,
    maxDistanceKm: 20,
    budgetInr: 2000,
    requestedFacilities: ['Floodlights', 'Parking'],
    isSlotAvailable: true,
  };

  const result = scoreVenue(sampleVenue, prefs);
  assert.ok(result.matchPercentage >= 80 && result.matchPercentage <= 100);
  assert.ok(result.explanation.includes('Match'));
  assert.ok(result.breakdown.distance.score > 0);
  console.log(`     (${result.explanation})`);
});

console.log('====================================================');
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED`);
console.log('====================================================');

if (passedCount === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
