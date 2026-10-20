/**
 * Haversine Distance Formula
 * Purpose in BookMyPlayground:
 * - Calculate true straight-line geographical distance between user coordinates and Indian sports turfs
 * - Filter venues within 2 km, 5 km, 10 km, 20 km, 50 km radii
 * - Calculate group participant distances for group fairness ranking
 * Formula:
 *   a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
 *   c = 2 * atan2(√a, √(1-a))
 *   d = R * c  (where R = 6371 km)
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */

const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates geographical distance between two points in kilometers.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Estimate straight-line travel time in minutes assuming average urban traffic speed.
 * Note: Clearly labelled as an estimated travel time based on 25 km/h urban speed.
 */
function estimateTravelTimeMinutes(distanceKm, averageUrbanSpeedKmh = 25) {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / averageUrbanSpeedKmh;
  return Math.round(hours * 60);
}

module.exports = {
  calculateHaversineDistance,
  estimateTravelTimeMinutes,
  EARTH_RADIUS_KM,
};
