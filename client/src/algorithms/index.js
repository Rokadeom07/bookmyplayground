const { Trie, TrieNode } = require('./Trie');
const { PriorityQueue } = require('./MinHeap');
const { Graph, createDemoTransitGraph } = require('./Graph');
const { CustomHashMap } = require('./HashMap');
const { mergeSort } = require('./MergeSort');
const {
  timeToMinutes,
  minutesToTime,
  intervalsOverlap,
  checkBookingConflict,
  generateHourlySlots,
} = require('./IntervalOverlap');
const {
  calculateHaversineDistance,
  estimateTravelTimeMinutes,
  EARTH_RADIUS_KM,
} = require('./Haversine');
const {
  DEFAULT_WEIGHTS,
  calculateDistanceScore,
  calculatePriceScore,
  calculateFacilitiesScore,
  calculateRatingScore,
  scoreVenue,
} = require('./WeightedRecommendation');

module.exports = {
  Trie,
  TrieNode,
  PriorityQueue,
  Graph,
  createDemoTransitGraph,
  CustomHashMap,
  mergeSort,
  timeToMinutes,
  minutesToTime,
  intervalsOverlap,
  checkBookingConflict,
  generateHourlySlots,
  calculateHaversineDistance,
  estimateTravelTimeMinutes,
  EARTH_RADIUS_KM,
  DEFAULT_WEIGHTS,
  calculateDistanceScore,
  calculatePriceScore,
  calculateFacilitiesScore,
  calculateRatingScore,
  scoreVenue,
};
