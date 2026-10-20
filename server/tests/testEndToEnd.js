const assert = require('assert');
const axios = require('axios');

const API = 'http://localhost:5000/api';

console.log('====================================================');
console.log('🚀 RUNNING END-TO-END HTTP INTEGRATION TEST SUITE');
console.log('====================================================');

async function runE2E() {
  let passed = 0;
  let total = 0;

  async function step(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.response?.data?.message || err.message}`);
    }
  }

  let customerToken = null;
  let ownerToken = null;
  let adminToken = null;
  let createdVenueId = null;
  let targetPlayingAreaId = null;
  let testBookingId = null;
  let testDate = '2026-10-25';
  let groupSessionId = null;

  // 1. Customer Login
  await step('1. Customer Login & Token Generation', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'rahul.verma@gmail.com',
      password: 'Customer@123456',
    });
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'customer');
    customerToken = res.data.token;
  });

  // 2. Owner Login
  await step('2. Ground Owner Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'rohit.sharma@mumbaiturfs.in',
      password: 'Owner@123456',
    });
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'owner');
    ownerToken = res.data.token;
  });

  // 3. Super Admin Login
  await step('3. Super Admin Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'admin@bookmyplayground.in',
      password: 'Admin@123456',
    });
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'admin');
    adminToken = res.data.token;
  });

  // 4. Role Authorization Isolation (Customer cannot access Owner Analytics)
  await step('4. RBAC Security: Customer rejected from Owner Analytics', async () => {
    try {
      await axios.get(`${API}/owner/analytics`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.fail('Should have been rejected with 403');
    } catch (err) {
      assert.strictEqual(err.response.status, 403);
    }
  });

  // 5. Owner creates a new ground
  await step('5. Owner creates new turf listing', async () => {
    const res = await axios.post(
      `${API}/venues`,
      {
        name: 'Apex Arena Football & Pickleball',
        sports: ['Football', 'Pickleball'],
        address: 'Linking Road, Khar West',
        state: 'Maharashtra',
        city: 'Mumbai',
        locality: 'Bandra West',
        pincode: '400052',
        coordinates: [72.835, 19.068],
        baseHourlyPriceInr: 1600,
        surface: 'Artificial Turf',
        isIndoor: false,
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    assert.strictEqual(res.data.success, true);
    createdVenueId = res.data.venue._id;
  });

  // 6. Admin approves the ground
  await step('6. Admin approves owner turf listing', async () => {
    const res = await axios.patch(
      `${API}/admin/venues/${createdVenueId}/approval`,
      { status: 'approved' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.venue.approvalStatus, 'approved');
  });

  // 7. Venue appears in public venue list and details lookup
  await step('7. Venue lookup with playing areas', async () => {
    const res = await axios.get(`${API}/venues/${createdVenueId}`);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.venue.playingAreas.length > 0);
    targetPlayingAreaId = res.data.venue.playingAreas[0]._id;
  });

  // 8. Slot availability query
  await step('8. Query slot availability for date', async () => {
    const res = await axios.get(
      `${API}/bookings/slots?venueId=${createdVenueId}&playingAreaId=${targetPlayingAreaId}&date=${testDate}`
    );
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.slots.length > 0);
  });

  // 9. Concurrency hold
  let holdSessionToken = null;
  await step('9. 10-Minute Concurrency Slot Hold', async () => {
    const res = await axios.post(
      `${API}/bookings/hold`,
      {
        venueId: createdVenueId,
        playingAreaId: targetPlayingAreaId,
        date: testDate,
        startTime: '18:00',
        endTime: '19:00',
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.sessionToken);
    holdSessionToken = res.data.sessionToken;
  });

  // 10. Simulated Checkout & Confirmation
  await step('10. Simulated Checkout & Atomic Booking Confirmation', async () => {
    const res = await axios.post(
      `${API}/bookings/checkout`,
      {
        venueId: createdVenueId,
        playingAreaId: targetPlayingAreaId,
        sport: 'Football',
        date: testDate,
        startTime: '18:00',
        endTime: '19:00',
        paymentMethod: 'simulated_upi',
        sessionToken: holdSessionToken,
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.booking.bookingId.startsWith('BMP-'));
    testBookingId = res.data.booking.id;
  });

  // 11. Overlapping Booking Prevention: second customer attempts to book same slot
  await step('11. Zero Double-Booking: Conflicting reservation strictly rejected', async () => {
    try {
      await axios.post(
        `${API}/bookings/checkout`,
        {
          venueId: createdVenueId,
          playingAreaId: targetPlayingAreaId,
          sport: 'Football',
          date: testDate,
          startTime: '18:00',
          endTime: '19:00',
          paymentMethod: 'simulated_card',
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      assert.fail('Should have been rejected with 409 conflict');
    } catch (err) {
      assert.strictEqual(err.response.status, 409);
    }
  });

  // 12. Receipt lookup
  await step('12. Generate & View Booking Receipt', async () => {
    const res = await axios.get(`${API}/bookings/${testBookingId}/receipt`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.receipt.receiptNumber);
    assert.strictEqual(res.data.receipt.payment.disclaimer, 'DEMO PAYMENT — NO REAL MONEY CHARGED');
  });

  // 13. Cancellation
  await step('13. Customer cancels booking', async () => {
    const res = await axios.post(
      `${API}/bookings/${testBookingId}/cancel`,
      { reason: 'Change of schedule' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.booking.bookingStatus, 'cancelled');
  });

  // 14. Smart Ground Recommendation Engine
  await step('14. Smart Ground Recommendation Engine (POST /api/recommendations/smart)', async () => {
    const res = await axios.post(`${API}/recommendations/smart`, {
      sport: 'Football',
      city: 'Mumbai',
      preferredLocality: 'Bandra West',
      budgetInr: 2000,
      maxDistanceKm: 25,
      preferredDate: testDate,
      preferredTime: '18:00',
      requiredFacilities: ['Floodlights'],
    });
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.recommendations.length > 0);
    const top = res.data.recommendations[0];
    assert.ok(top.matchPercentage >= 70);
    assert.ok(top.scoreBreakdown.distance);
  });

  // 15. Group Finder & Dijkstra Path Computation
  await step('15. Group-Friendly Ground Finder & Dijkstra Demo', async () => {
    const sRes = await axios.post(
      `${API}/groups`,
      {
        name: 'Weekend Football Group',
        sport: 'Football',
        city: 'Mumbai',
        preferredDate: testDate,
        initialParticipant: {
          name: 'Rahul (Kalyan)',
          localityName: 'Kalyan West',
          coordinates: [73.1305, 19.2437],
        },
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    assert.strictEqual(sRes.data.success, true);
    groupSessionId = sRes.data.session._id;

    // Second participant joins from Dombivli
    await axios.post(`${API}/groups/${groupSessionId}/join`, {
      name: 'Sneha (Dombivli)',
      localityName: 'Dombivli East',
      coordinates: [73.0863, 19.2184],
    });

    // Third participant joins from Thane
    await axios.post(`${API}/groups/${groupSessionId}/join`, {
      name: 'Vikram (Thane)',
      localityName: 'Thane West',
      coordinates: [72.9781, 19.2183],
    });

    // Fetch fairness recommendations
    const recRes = await axios.post(`${API}/groups/${groupSessionId}/recommendations`, {
      fairnessMode: 'fairest_travel',
    });
    assert.strictEqual(recRes.data.success, true);
    assert.ok(recRes.data.recommendations.length > 0);
    assert.ok(recRes.data.educationalDijkstra.optimalPath.length >= 2);
  });

  // 16. Weather API integration
  await step('16. Weather Intelligence API (Open-Meteo)', async () => {
    const res = await axios.get(`${API}/weather/venue/${createdVenueId}?date=${testDate}`);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.summary || res.data.message);
  });

  // 17. Owner Slot Optimisation & Analytics
  await step('17. Owner Smart Slot Optimisation & Analytics', async () => {
    const res = await axios.get(`${API}/owner/analytics`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.metrics.revenueType.includes('SIMULATED'));
  });

  // 18. Admin lists & approves pending owners
  await step('18. Super Admin Reviews Pending Owner Application', async () => {
    const res = await axios.get(`${API}/admin/owners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.data.success, true);
    const pending = res.data.owners.find(o => o.approvalStatus === 'pending');
    if (pending) {
      const revRes = await axios.patch(
        `${API}/admin/owners/${pending._id}/approval`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert.strictEqual(revRes.data.success, true);
    }
  });

  console.log('====================================================');
  console.log(`📊 INTEGRATION TEST RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runE2E();
