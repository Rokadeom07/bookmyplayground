/**
 * Multi-Factor Weighted Recommendation Algorithm
 * Purpose in BookMyPlayground:
 * - Smart Ground Finder: calculates transparent, multi-dimensional ranking scores (0-100%)
 * - Evaluates Distance, Price, Slot Availability, Facilities, and Rating
 * Formula:
 *   Score = w_dist * S_dist + w_price * S_price + w_avail * S_avail + w_fac * S_fac + w_rate * S_rate
 * Time Complexity: O(1) per candidate venue evaluation
 * Space Complexity: O(1)
 */

const DEFAULT_WEIGHTS = {
  distance: 0.25,
  price: 0.25,
  availability: 0.25,
  facilities: 0.15,
  rating: 0.1,
};

/**
 * Normalise distance score (closer is better: 0 km = 1.0, maxDistanceKm = 0.0)
 */
function calculateDistanceScore(distanceKm, maxDistanceKm = 25) {
  if (distanceKm <= 0) return 1.0;
  if (distanceKm >= maxDistanceKm) return 0.0;
  return Math.max(0, 1.0 - distanceKm / maxDistanceKm);
}

/**
 * Normalise price score (lower price relative to user's budget is better)
 */
function calculatePriceScore(hourlyPriceInr, budgetInr) {
  if (budgetInr <= 0) return 0.5;
  if (hourlyPriceInr <= budgetInr) {
    // Under budget: reward savings
    const ratio = hourlyPriceInr / budgetInr;
    return 1.0 - ratio * 0.3; // between 0.7 and 1.0
  }
  // Over budget
  const overshoot = (hourlyPriceInr - budgetInr) / budgetInr;
  return Math.max(0, 0.7 - overshoot);
}

/**
 * Normalise facilities score based on requested required facilities
 */
function calculateFacilitiesScore(venueFacilities = [], requestedFacilities = []) {
  if (!requestedFacilities || requestedFacilities.length === 0) {
    // If no specific facilities required, base on count of premium amenities
    const totalPossible = 5;
    return Math.min(1.0, venueFacilities.length / totalPossible);
  }

  let matched = 0;
  const venueSet = new Set(venueFacilities.map(f => f.toLowerCase().trim()));

  for (const req of requestedFacilities) {
    if (venueSet.has(req.toLowerCase().trim())) {
      matched++;
    }
  }

  return matched / requestedFacilities.length;
}

/**
 * Normalise rating score (5.0 = 1.0, 0.0 = 0.0, missing handled neutrally as 0.7)
 */
function calculateRatingScore(ratingAverage, ratingCount = 0) {
  if (!ratingCount || ratingCount === 0 || !ratingAverage) {
    return 0.7; // Neutral prior for unrated verified venues
  }
  return Math.min(1.0, Math.max(0, ratingAverage / 5.0));
}

/**
 * Compute the complete composite recommendation score and explanation
 */
function scoreVenue(venue, preferences, weights = DEFAULT_WEIGHTS) {
  const {
    distanceKm = 5,
    maxDistanceKm = 25,
    budgetInr = 2000,
    requestedFacilities = [],
    isSlotAvailable = true,
  } = preferences;

  const hourlyPriceInr = (venue.baseHourlyPricePaise || 120000) / 100;

  const sDist = calculateDistanceScore(distanceKm, maxDistanceKm);
  const sPrice = calculatePriceScore(hourlyPriceInr, budgetInr);
  const sAvail = isSlotAvailable ? 1.0 : 0.2; // Confirmed available slots receive full score
  const sFac = calculateFacilitiesScore(venue.facilities, requestedFacilities);
  const sRate = calculateRatingScore(venue.ratingAverage, venue.ratingCount);

  const rawScore =
    weights.distance * sDist +
    weights.price * sPrice +
    weights.availability * sAvail +
    weights.facilities * sFac +
    weights.rating * sRate;

  const matchPercentage = Math.round(Math.min(100, Math.max(10, rawScore * 100)));

  // Generate transparent human-readable explanation
  const explanationParts = [];
  explanationParts.push(`${matchPercentage}% Match`);

  if (distanceKm <= 3) {
    explanationParts.push(`located just ${distanceKm.toFixed(1)} km away`);
  } else if (distanceKm <= 10) {
    explanationParts.push(`${distanceKm.toFixed(1)} km distance`);
  }

  if (hourlyPriceInr <= budgetInr) {
    explanationParts.push(`fits well within your ₹${budgetInr} budget (₹${hourlyPriceInr}/hr)`);
  } else {
    explanationParts.push(`₹${hourlyPriceInr}/hr`);
  }

  if (venue.hasFloodlights) {
    explanationParts.push(`has floodlights`);
  }

  if (isSlotAvailable) {
    explanationParts.push(`has confirmed slot available`);
  }

  const explanation = `${explanationParts[0]} — This ${venue.sports?.[0] || 'sports'} venue is ${explanationParts
    .slice(1)
    .join(', ')}.`;

  return {
    rawScore,
    matchPercentage,
    explanation,
    breakdown: {
      distance: { score: Math.round(sDist * 100), weight: weights.distance, valueKm: distanceKm },
      price: { score: Math.round(sPrice * 100), weight: weights.price, valueInr: hourlyPriceInr },
      availability: { score: Math.round(sAvail * 100), weight: weights.availability, available: isSlotAvailable },
      facilities: { score: Math.round(sFac * 100), weight: weights.facilities, matchedCount: venue.facilities?.length || 0 },
      rating: { score: Math.round(sRate * 100), weight: weights.rating, average: venue.ratingAverage || 4.5 },
    },
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  calculateDistanceScore,
  calculatePriceScore,
  calculateFacilitiesScore,
  calculateRatingScore,
  scoreVenue,
};
