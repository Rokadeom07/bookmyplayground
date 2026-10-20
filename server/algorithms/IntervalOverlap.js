/**
 * Interval Overlap and Free Window Detection Algorithm
 * Purpose in BookMyPlayground:
 * - Concurrency conflict checking: detects whether a requested booking slot overlaps with existing confirmed bookings or holds
 * - Free slot finder: scans operating hours and identifies unbooked windows for customer selection
 * Time Complexity:
 * - Single overlap check: O(1)
 * - Scanning N existing bookings: O(N log N) (due to sorting) + O(N) sweep
 * Space Complexity: O(N)
 */

// Helper to convert "HH:MM" string to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Helper to convert minutes from midnight to "HH:MM"
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Check if two intervals [startA, endA] and [startB, endB] overlap.
 * Strictly: startA < endB && startB < endA
 * (Touch boundaries, e.g. 17:00-18:00 and 18:00-19:00, do NOT overlap)
 */
function intervalsOverlap(startA, endA, startB, endB) {
  const sA = typeof startA === 'number' ? startA : timeToMinutes(startA);
  const eA = typeof endA === 'number' ? endA : timeToMinutes(endA);
  const sB = typeof startB === 'number' ? startB : timeToMinutes(startB);
  const eB = typeof endB === 'number' ? endB : timeToMinutes(endB);

  return sA < eB && sB < eA;
}

/**
 * Check whether a candidate booking interval conflicts with any existing booked or held slots.
 * @param {string} candidateStart "HH:MM"
 * @param {string} candidateEnd "HH:MM"
 * @param {Array<{ startTime: string, endTime: string, status?: string }>} existingSlots
 * @returns {{ hasConflict: boolean, conflictingSlot: Object | null }}
 */
function checkBookingConflict(candidateStart, candidateEnd, existingSlots) {
  const candS = timeToMinutes(candidateStart);
  const candE = timeToMinutes(candidateEnd);

  for (const slot of existingSlots) {
    if (slot.bookingStatus === 'cancelled') continue; // Cancelled slots do not conflict

    const slotS = timeToMinutes(slot.startTime);
    const slotE = timeToMinutes(slot.endTime);

    if (candS < slotE && slotS < candE) {
      return {
        hasConflict: true,
        conflictingSlot: slot,
      };
    }
  }

  return {
    hasConflict: false,
    conflictingSlot: null,
  };
}

/**
 * Find all available slots within operating hours given existing bookings.
 * @param {string} openTime "06:00"
 * @param {string} closeTime "23:00"
 * @param {number} slotDurationMinutes 60
 * @param {Array} bookedSlots Array of { startTime, endTime }
 * @param {Array} heldSlots Array of { startTime, endTime }
 * @returns {Array<{ startTime: string, endTime: string, status: 'available' | 'booked' | 'held' }>}
 */
function generateHourlySlots(openTime, closeTime, slotDurationMinutes = 60, bookedSlots = [], heldSlots = [], blockedSlots = []) {
  const openMin = timeToMinutes(openTime);
  const closeMin = timeToMinutes(closeTime);
  const slots = [];

  for (let currentMin = openMin; currentMin + slotDurationMinutes <= closeMin; currentMin += slotDurationMinutes) {
    const startStr = minutesToTime(currentMin);
    const endStr = minutesToTime(currentMin + slotDurationMinutes);

    // Check maintenance blocked conflict
    const matchedBlock = blockedSlots.find(
      b => intervalsOverlap(startStr, endStr, b.openTime || b.startTime, b.closeTime || b.endTime)
    );

    // Check booked conflict
    const isBooked = !matchedBlock && bookedSlots.some(
      b => b.bookingStatus !== 'cancelled' && intervalsOverlap(startStr, endStr, b.startTime, b.endTime)
    );

    // Check held conflict
    const isHeld = !matchedBlock && !isBooked && heldSlots.some(
      h => intervalsOverlap(startStr, endStr, h.startTime, h.endTime)
    );

    let status = 'available';
    let blockReason = null;
    if (matchedBlock) {
      status = 'maintenance';
      blockReason = matchedBlock.blockReason || 'Scheduled Maintenance';
    } else if (isBooked) {
      status = 'booked';
    } else if (isHeld) {
      status = 'held';
    }

    slots.push({
      startTime: startStr,
      endTime: endStr,
      status,
      blockReason,
    });
  }

  return slots;
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  intervalsOverlap,
  checkBookingConflict,
  generateHourlySlots,
};
