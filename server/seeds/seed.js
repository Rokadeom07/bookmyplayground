const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const {
  User,
  OwnerProfile,
  State,
  City,
  Locality,
  Venue,
  PlayingArea,
  Booking,
  Payment,
  Review,
  Promotion,
  Notification,
} = require('../models');

dotenv.config();

async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB to seed database...');
  await connectDB();

  console.log('[Seed] Clearing existing collections for fresh seed...');
  await Promise.all([
    User.deleteMany(),
    OwnerProfile.deleteMany(),
    State.deleteMany(),
    City.deleteMany(),
    Locality.deleteMany(),
    Venue.deleteMany(),
    PlayingArea.deleteMany(),
    Booking.deleteMany(),
    Payment.deleteMany(),
    Review.deleteMany(),
    Promotion.deleteMany(),
    Notification.deleteMany(),
  ]);

  // ==========================================
  // 1. SEED USERS & ROLES
  // ==========================================
  console.log('[Seed] Seeding Users (Admin, Owners, Customers)...');

  // Super Admin
  const admin = await User.create({
    name: 'BMS Super Admin',
    email: 'admin@bookmyplayground.in',
    phone: '9820011223',
    password: 'Admin@123456',
    role: 'admin',
    preferredCity: 'Mumbai',
  });

  // Approved Ground Owner 1 (Mumbai)
  const ownerMumbai = await User.create({
    name: 'Rohit Sharma (Owner)',
    email: 'rohit.sharma@mumbaiturfs.in',
    phone: '9820123456',
    password: 'Owner@123456',
    role: 'owner',
    preferredCity: 'Mumbai',
  });

  await OwnerProfile.create({
    user: ownerMumbai._id,
    businessName: 'Mumbai Turf Club & Sports Hub LLP',
    businessAddress: 'Plot 45, Off Linking Road, Bandra West, Mumbai 400050',
    panOrGst: '27AABCM1234R1ZM',
    declarationSigned: true,
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  // Approved Ground Owner 2 (Thane & Kalyan)
  const ownerThane = await User.create({
    name: 'Vikram Patil (Owner)',
    email: 'vikram.patil@thanesports.in',
    phone: '9820234567',
    password: 'Owner@123456',
    role: 'owner',
    preferredCity: 'Thane',
  });

  await OwnerProfile.create({
    user: ownerThane._id,
    businessName: 'Urban Sports Park Thane Pvt Ltd',
    businessAddress: 'Near Viviana Mall, Eastern Express Hwy, Thane West 400606',
    panOrGst: '27AABCU5678R1ZX',
    declarationSigned: true,
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  // Approved Ground Owner 3 (Bengaluru)
  const ownerBengaluru = await User.create({
    name: 'Karthik Rao (Owner)',
    email: 'karthik.rao@bengaluruarenas.in',
    phone: '9820345678',
    password: 'Owner@123456',
    role: 'owner',
    preferredCity: 'Bengaluru',
  });

  await OwnerProfile.create({
    user: ownerBengaluru._id,
    businessName: 'Bengaluru Sports Arenas & Turf Network',
    businessAddress: 'Sarjapur Main Road, Bellandur, Bengaluru 560103',
    panOrGst: '29AABCB9012R1ZT',
    declarationSigned: true,
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  // Pending Ground Owner 4 (Delhi NCR) - for Admin Approval Demo
  const ownerDelhi = await User.create({
    name: 'Amit Kumar (Pending Owner)',
    email: 'amit.kumar@delhisports.in',
    phone: '9820456789',
    password: 'Owner@123456',
    role: 'owner',
    preferredCity: 'New Delhi',
  });

  await OwnerProfile.create({
    user: ownerDelhi._id,
    businessName: 'Capital Turf Arena New Delhi',
    businessAddress: 'Sector 29, Gurugram, Haryana 122001',
    panOrGst: '07AABCD3456R1ZN',
    declarationSigned: true,
    approvalStatus: 'pending', // Pending admin review
  });

  // Customers
  const customerRahul = await User.create({
    name: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    phone: '9876543210',
    password: 'Customer@123456',
    role: 'customer',
    preferredCity: 'Mumbai',
  });

  const customerSneha = await User.create({
    name: 'Sneha Deshmukh',
    email: 'sneha.deshmukh@gmail.com',
    phone: '9876543211',
    password: 'Customer@123456',
    role: 'customer',
    preferredCity: 'Thane',
  });

  const customerArjun = await User.create({
    name: 'Arjun Nair',
    email: 'arjun.nair@gmail.com',
    phone: '9876543212',
    password: 'Customer@123456',
    role: 'customer',
    preferredCity: 'Bengaluru',
  });

  // ==========================================
  // 2. SEED INDIAN STATES, CITIES, LOCALITIES
  // ==========================================
  console.log('[Seed] Seeding Indian States, Cities & Localities...');

  const statesData = [
    { name: 'Maharashtra', code: 'MH' },
    { name: 'Delhi NCR', code: 'DL' },
    { name: 'Karnataka', code: 'KA' },
    { name: 'Telangana', code: 'TS' },
    { name: 'Tamil Nadu', code: 'TN' },
    { name: 'Gujarat', code: 'GJ' },
    { name: 'West Bengal', code: 'WB' },
    { name: 'Rajasthan', code: 'RJ' },
    { name: 'Goa', code: 'GA' },
    { name: 'Kerala', code: 'KL' },
    { name: 'Punjab', code: 'PB' },
    { name: 'Uttar Pradesh', code: 'UP' },
    { name: 'Madhya Pradesh', code: 'MP' },
  ];

  const stateDocs = await State.insertMany(statesData);
  const stateMap = {};
  stateDocs.forEach(s => {
    stateMap[s.name] = s._id;
  });

  // Major Cities
  const citiesData = [
    // Maharashtra
    { name: 'Mumbai', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [72.8777, 19.076] } },
    { name: 'Thane', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [72.9781, 19.2183] } },
    { name: 'Navi Mumbai', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [73.0297, 19.033] } },
    { name: 'Kalyan', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 2, location: { type: 'Point', coordinates: [73.1305, 19.2437] } },
    { name: 'Dombivli', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 2, location: { type: 'Point', coordinates: [73.0863, 19.2184] } },
    { name: 'Pune', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [73.8567, 18.5204] } },
    { name: 'Nashik', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [73.7898, 19.9975] } },
    { name: 'Nagpur', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [79.0882, 21.1458] } },
    { name: 'Kolhapur', state: stateMap['Maharashtra'], stateName: 'Maharashtra', isPopular: false, tier: 3, location: { type: 'Point', coordinates: [74.2433, 16.705] } },

    // Delhi NCR
    { name: 'New Delhi', state: stateMap['Delhi NCR'], stateName: 'Delhi NCR', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [77.209, 28.6139] } },
    { name: 'Gurugram', state: stateMap['Delhi NCR'], stateName: 'Delhi NCR', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [77.0266, 28.4595] } },
    { name: 'Noida', state: stateMap['Delhi NCR'], stateName: 'Delhi NCR', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [77.391, 28.5355] } },
    { name: 'Ghaziabad', state: stateMap['Delhi NCR'], stateName: 'Delhi NCR', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [77.4538, 28.6692] } },
    { name: 'Faridabad', state: stateMap['Delhi NCR'], stateName: 'Delhi NCR', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [77.3178, 28.4089] } },

    // Karnataka
    { name: 'Bengaluru', state: stateMap['Karnataka'], stateName: 'Karnataka', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
    { name: 'Mysuru', state: stateMap['Karnataka'], stateName: 'Karnataka', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [76.6394, 12.2958] } },
    { name: 'Mangaluru', state: stateMap['Karnataka'], stateName: 'Karnataka', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [74.856, 12.9141] } },

    // Telangana
    { name: 'Hyderabad', state: stateMap['Telangana'], stateName: 'Telangana', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [78.4867, 17.385] } },
    { name: 'Warangal', state: stateMap['Telangana'], stateName: 'Telangana', isPopular: false, tier: 3, location: { type: 'Point', coordinates: [79.5941, 17.9689] } },

    // Tamil Nadu
    { name: 'Chennai', state: stateMap['Tamil Nadu'], stateName: 'Tamil Nadu', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [80.2707, 13.0827] } },
    { name: 'Coimbatore', state: stateMap['Tamil Nadu'], stateName: 'Tamil Nadu', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [76.9558, 11.0168] } },

    // Gujarat
    { name: 'Ahmedabad', state: stateMap['Gujarat'], stateName: 'Gujarat', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [72.5714, 23.0225] } },
    { name: 'Surat', state: stateMap['Gujarat'], stateName: 'Gujarat', isPopular: false, tier: 2, location: { type: 'Point', coordinates: [72.8311, 21.1702] } },

    // West Bengal
    { name: 'Kolkata', state: stateMap['West Bengal'], stateName: 'West Bengal', isPopular: true, tier: 1, location: { type: 'Point', coordinates: [88.3639, 22.5726] } },

    // Rajasthan
    { name: 'Jaipur', state: stateMap['Rajasthan'], stateName: 'Rajasthan', isPopular: true, tier: 2, location: { type: 'Point', coordinates: [75.7873, 26.9124] } },
  ];

  const cityDocs = await City.insertMany(citiesData);
  const cityMap = {};
  cityDocs.forEach(c => {
    cityMap[c.name] = c._id;
  });

  // Localities
  const localitiesData = [
    // Mumbai
    { name: 'Bandra West', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400050', location: { type: 'Point', coordinates: [72.8315, 19.0558] } },
    { name: 'Santacruz West', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400054', location: { type: 'Point', coordinates: [72.8375, 19.0833] } },
    { name: 'Andheri East', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400069', location: { type: 'Point', coordinates: [72.8697, 19.1136] } },
    { name: 'Chembur', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400071', location: { type: 'Point', coordinates: [72.8988, 19.0522] } },
    { name: 'Dadar West', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400028', location: { type: 'Point', coordinates: [72.8478, 19.0178] } },
    { name: 'Ghatkopar East', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400077', location: { type: 'Point', coordinates: [72.908, 19.086] } },
    { name: 'Mulund West', city: cityMap['Mumbai'], cityName: 'Mumbai', stateName: 'Maharashtra', pincode: '400080', location: { type: 'Point', coordinates: [72.9559, 19.1726] } },

    // Thane
    { name: 'Thane West', city: cityMap['Thane'], cityName: 'Thane', stateName: 'Maharashtra', pincode: '400601', location: { type: 'Point', coordinates: [72.9781, 19.2183] } },
    { name: 'Yeoor Hills', city: cityMap['Thane'], cityName: 'Thane', stateName: 'Maharashtra', pincode: '400606', location: { type: 'Point', coordinates: [72.9465, 19.2312] } },
    { name: 'Majiwada', city: cityMap['Thane'], cityName: 'Thane', stateName: 'Maharashtra', pincode: '400601', location: { type: 'Point', coordinates: [72.9912, 19.2155] } },

    // Kalyan & Dombivli
    { name: 'Kalyan West', city: cityMap['Kalyan'], cityName: 'Kalyan', stateName: 'Maharashtra', pincode: '421301', location: { type: 'Point', coordinates: [73.1305, 19.2437] } },
    { name: 'Dombivli East', city: cityMap['Dombivli'], cityName: 'Dombivli', stateName: 'Maharashtra', pincode: '421201', location: { type: 'Point', coordinates: [73.0863, 19.2184] } },
    { name: 'Diva Junction', city: cityMap['Thane'], cityName: 'Thane', stateName: 'Maharashtra', pincode: '400612', location: { type: 'Point', coordinates: [73.0427, 19.1889] } },
    { name: 'Mumbra', city: cityMap['Thane'], cityName: 'Thane', stateName: 'Maharashtra', pincode: '400612', location: { type: 'Point', coordinates: [73.0189, 19.1906] } },

    // Navi Mumbai
    { name: 'Vashi', city: cityMap['Navi Mumbai'], cityName: 'Navi Mumbai', stateName: 'Maharashtra', pincode: '400703', location: { type: 'Point', coordinates: [72.9982, 19.0771] } },
    { name: 'Nerul', city: cityMap['Navi Mumbai'], cityName: 'Navi Mumbai', stateName: 'Maharashtra', pincode: '400706', location: { type: 'Point', coordinates: [73.0169, 19.033] } },

    // Bengaluru
    { name: 'Sarjapur Road', city: cityMap['Bengaluru'], cityName: 'Bengaluru', stateName: 'Karnataka', pincode: '560035', location: { type: 'Point', coordinates: [77.6749, 12.9105] } },
    { name: 'Bellandur', city: cityMap['Bengaluru'], cityName: 'Bengaluru', stateName: 'Karnataka', pincode: '560103', location: { type: 'Point', coordinates: [77.6748, 12.926] } },
    { name: 'Ulsoor', city: cityMap['Bengaluru'], cityName: 'Bengaluru', stateName: 'Karnataka', pincode: '560008', location: { type: 'Point', coordinates: [77.6253, 12.9818] } },
    { name: 'High Grounds', city: cityMap['Bengaluru'], cityName: 'Bengaluru', stateName: 'Karnataka', pincode: '560001', location: { type: 'Point', coordinates: [77.5855, 12.9915] } },

    // Delhi NCR
    { name: 'Siri Fort', city: cityMap['New Delhi'], cityName: 'New Delhi', stateName: 'Delhi NCR', pincode: '110049', location: { type: 'Point', coordinates: [77.2208, 28.5528] } },
    { name: 'Vasant Kunj', city: cityMap['New Delhi'], cityName: 'New Delhi', stateName: 'Delhi NCR', pincode: '110070', location: { type: 'Point', coordinates: [77.1518, 28.5303] } },
    { name: 'Sector 29 Gurugram', city: cityMap['Gurugram'], cityName: 'Gurugram', stateName: 'Delhi NCR', pincode: '122001', location: { type: 'Point', coordinates: [77.0625, 28.4682] } },

    // Pune
    { name: 'Mundhwa', city: cityMap['Pune'], cityName: 'Pune', stateName: 'Maharashtra', pincode: '411036', location: { type: 'Point', coordinates: [73.9189, 18.5362] } },
  ];

  await Locality.insertMany(localitiesData);

  // ==========================================================
  // 3. SEED GENUINE INDIAN SPORTS GROUNDS (EXACTLY 6 SPORTS)
  // ==========================================================
  console.log('[Seed] Seeding Genuine Indian Sports Grounds (6 Sports)...');

  const venuesData = [
    // 1. Mumbai Football & Pickleball Turf (Bookable)
    {
      name: "Neville D'Souza Football Turf",
      slug: 'neville-dsouza-football-turf-bandra',
      type: 'bookable',
      description: 'FIFA-approved artificial turf football arena in Bandra West managed by BMC and Mumbai sports council with professional floodlights and spectator seating.',
      sports: ['Football'],
      address: 'Near Bandra Gymkhana, Veronica Road, Bandra West',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Bandra West',
      pincode: '400050',
      location: { type: 'Point', coordinates: [72.8315, 19.0558] },
      images: [
        'https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=1200',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 150000, // ₹1,500/hr
      capacity: 18,
      isIndoor: false,
      hasFloodlights: true,
      hasParking: true,
      hasWashrooms: true,
      hasDrinkingWater: true,
      hasChangingRooms: true,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.8,
      ratingCount: 42,
    },

    // 2. Wings Sports Centre, Bandra (Football, Pickleball - Indoor/Covered option)
    {
      name: 'Wings Sports Centre',
      slug: 'wings-sports-centre-bandra-west',
      type: 'bookable',
      description: 'State-of-the-art multi-sport complex in Bandra offering both open football turfs and weather-proof covered courts for pickleball and 5v5 football.',
      sports: ['Football', 'Pickleball'],
      address: '709, KC Marg, Reclamation, Bandra West',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Bandra West',
      pincode: '400050',
      location: { type: 'Point', coordinates: [72.8295, 19.0544] },
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Indoor Mat',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 180000, // ₹1,800/hr
      capacity: 16,
      isIndoor: true, // All-weather indoor venue
      hasFloodlights: true,
      hasParking: true,
      hasWashrooms: true,
      hasDrinkingWater: true,
      hasChangingRooms: true,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.9,
      ratingCount: 88,
    },

    // 3. Astro Park - Lions Club, Santacruz (Cricket, Football)
    {
      name: 'Astro Park - Lions Club Turf',
      slug: 'astro-park-lions-club-santacruz',
      type: 'bookable',
      description: 'Popular high-grade rubber infill turf for box cricket and 6v6 football located in Santacruz West.',
      sports: ['Cricket', 'Football'],
      address: 'Near Milan Subway, S.V. Road, Santacruz West',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Santacruz West',
      pincode: '400054',
      location: { type: 'Point', coordinates: [72.8375, 19.0833] },
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
        'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 120000, // ₹1,200/hr
      capacity: 16,
      isIndoor: false,
      hasFloodlights: true,
      hasParking: true,
      hasWashrooms: true,
      hasDrinkingWater: true,
      hasChangingRooms: false,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.6,
      ratingCount: 35,
    },

    // 4. Kick Off Turf, Chembur (Football, Cricket)
    {
      name: 'Kick Off Sports Turf Chembur',
      slug: 'kick-off-sports-turf-chembur',
      type: 'bookable',
      description: 'Centrally located sports turf in Eastern Mumbai offering box cricket pitches with full net enclosure and 7v7 football.',
      sports: ['Cricket', 'Football'],
      address: 'Sindhi Society Gymkhana, Chembur East',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Chembur',
      pincode: '400071',
      location: { type: 'Point', coordinates: [72.8988, 19.0522] },
      images: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 130000, // ₹1,300/hr
      capacity: 16,
      isIndoor: false,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.5,
      ratingCount: 29,
    },

    // 5. Urban Sports Park, Thane West (Cricket, Football, Pickleball)
    {
      name: 'Urban Sports Park Thane',
      slug: 'urban-sports-park-thane-west',
      type: 'bookable',
      description: 'Thane premier multi-sports arena featuring 2 box cricket turfs, 1 football arena, and dedicated international standard pickleball courts.',
      sports: ['Cricket', 'Football', 'Pickleball'],
      address: 'Pokhran Road No 2, Near Glady Alwares Road, Thane West',
      state: 'Maharashtra',
      city: 'Thane',
      locality: 'Thane West',
      pincode: '400601',
      location: { type: 'Point', coordinates: [72.9781, 19.2183] },
      images: [
        'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 110000, // ₹1,100/hr
      capacity: 20,
      isIndoor: false,
      owner: ownerThane._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.7,
      ratingCount: 64,
    },

    // 6. Golden Swan Country Club Golf Academy, Yeoor Hills, Thane (Golf)
    {
      name: 'Golden Swan Golf Driving Range & Academy',
      slug: 'golden-swan-golf-academy-thane',
      type: 'bookable',
      description: 'Exclusive 9-hole golf course and floodlit driving range nestled in the lush green foothills of Yeoor, Thane.',
      sports: ['Golf'],
      address: 'Yeoor Hills, Off Pokhran Road No 1, Thane West',
      state: 'Maharashtra',
      city: 'Thane',
      locality: 'Yeoor Hills',
      pincode: '400606',
      location: { type: 'Point', coordinates: [72.9465, 19.2312] },
      images: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Natural Grass',
      operatingHours: { open: '06:00', close: '20:00' },
      baseHourlyPricePaise: 250000, // ₹2,500/hr
      capacity: 10,
      isIndoor: false,
      owner: ownerThane._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.9,
      ratingCount: 19,
    },

    // 7. Kalyan Sports Complex Turf (Cricket, Kabaddi, Football)
    {
      name: 'Kalyan Sports Complex Arena',
      slug: 'kalyan-sports-complex-turf',
      type: 'bookable',
      description: 'Spacious district sports turf in Kalyan West equipped with mud/mat kabaddi courts, box cricket arena, and 7v7 football surface.',
      sports: ['Cricket', 'Kabaddi', 'Football'],
      address: 'Near Subhash Maidan, Tilak Chowk, Kalyan West',
      state: 'Maharashtra',
      city: 'Kalyan',
      locality: 'Kalyan West',
      pincode: '421301',
      location: { type: 'Point', coordinates: [73.1305, 19.2437] },
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water'],
      surface: 'Synthetic Turf',
      operatingHours: { open: '06:00', close: '22:00' },
      baseHourlyPricePaise: 90000, // ₹900/hr
      capacity: 22,
      isIndoor: false,
      owner: ownerThane._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.4,
      ratingCount: 22,
    },

    // 8. Dombivli Gymkhana Grounds (Cricket, Football)
    {
      name: 'Dombivli Gymkhana Turf',
      slug: 'dombivli-gymkhana-turf',
      type: 'bookable',
      description: 'Historical sports ground in Dombivli East with dedicated night cricket turf, professional boundary nets, and coaching facilities.',
      sports: ['Cricket', 'Football'],
      address: 'MIDC Phase II, Near Pendharkar College, Dombivli East',
      state: 'Maharashtra',
      city: 'Dombivli',
      locality: 'Dombivli East',
      pincode: '421201',
      location: { type: 'Point', coordinates: [73.0863, 19.2184] },
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 100000, // ₹1,000/hr
      capacity: 18,
      isIndoor: false,
      owner: ownerThane._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.6,
      ratingCount: 38,
    },

    // 9. Play Arena Sports Complex, Bengaluru (Football, Pickleball, Cricket)
    {
      name: 'Play Arena Bangalore',
      slug: 'play-arena-bangalore-sarjapur',
      type: 'bookable',
      description: 'Indias premier multi-sport destination featuring 5 modern pickleball courts, FIFA standard football turf, and nets box cricket.',
      sports: ['Football', 'Pickleball', 'Cricket'],
      address: 'Silverwood Regency Layout, Central Jail Road, Sarjapur Road, Bengaluru',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Sarjapur Road',
      pincode: '560035',
      location: { type: 'Point', coordinates: [77.6749, 12.9105] },
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 140000, // ₹1,400/hr
      capacity: 20,
      isIndoor: false,
      owner: ownerBengaluru._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.8,
      ratingCount: 110,
    },

    // 10. Bangalore Golf Club, High Grounds (Golf)
    {
      name: 'Bangalore Golf Club Driving Range',
      slug: 'bangalore-golf-club-high-grounds',
      type: 'bookable',
      description: 'Oldest golf club in India outside the British Isles, offering member and guest slot booking for its lush 18-hole course and driving range.',
      sports: ['Golf'],
      address: '2, Sankey Road, High Grounds, Bengaluru',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'High Grounds',
      pincode: '560001',
      location: { type: 'Point', coordinates: [77.5855, 12.9915] },
      images: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Natural Grass',
      operatingHours: { open: '06:00', close: '19:00' },
      baseHourlyPricePaise: 300000, // ₹3,000/hr
      capacity: 8,
      isIndoor: false,
      owner: ownerBengaluru._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.9,
      ratingCount: 45,
    },

    // 11. Siri Fort Sports Complex, New Delhi (Cricket, Hockey, Football)
    {
      name: 'Siri Fort Sports Complex Arena',
      slug: 'siri-fort-sports-complex-new-delhi',
      type: 'bookable',
      description: 'World-class multi-sport facility developed by DDA with dedicated synthetic hockey turf, cricket practice nets, and football ground.',
      sports: ['Cricket', 'Hockey', 'Football'],
      address: 'August Kranti Marg, Siri Fort Institutional Area, New Delhi',
      state: 'Delhi NCR',
      city: 'New Delhi',
      locality: 'Siri Fort',
      pincode: '110049',
      location: { type: 'Point', coordinates: [77.2208, 28.5528] },
      images: [
        'https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=1200',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms', 'Cafeteria'],
      surface: 'Synthetic Turf',
      operatingHours: { open: '06:00', close: '22:00' },
      baseHourlyPricePaise: 160000, // ₹1,600/hr
      capacity: 22,
      isIndoor: false,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.7,
      ratingCount: 78,
    },

    // 12. Plaza Football Turf, Vasant Kunj, New Delhi (Football, Pickleball)
    {
      name: 'Plaza Sports Turf Vasant Kunj',
      slug: 'plaza-sports-turf-vasant-kunj',
      type: 'bookable',
      description: 'South Delhis premier artificial turf offering 5v5 / 7v7 football and fast-paced pickleball courts with floodlights.',
      sports: ['Football', 'Pickleball'],
      address: 'Nelson Mandela Marg, Pocket 8, Sector C, Vasant Kunj, New Delhi',
      state: 'Delhi NCR',
      city: 'New Delhi',
      locality: 'Vasant Kunj',
      pincode: '110070',
      location: { type: 'Point', coordinates: [77.1518, 28.5303] },
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Artificial Turf',
      operatingHours: { open: '06:00', close: '23:00' },
      baseHourlyPricePaise: 150000, // ₹1,500/hr
      capacity: 16,
      isIndoor: false,
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.6,
      ratingCount: 31,
    },

    // 13. Mumbai City Kabaddi Academy Arena (Kabaddi - Indoor Covered)
    {
      name: 'Mumbai Kabaddi Pro Arena',
      slug: 'mumbai-kabaddi-pro-arena-dadar',
      type: 'bookable',
      description: 'Dedicated professional indoor kabaddi arena with shock-absorbing synthetic mats, laser line markings, and spectator gallery.',
      sports: ['Kabaddi'],
      address: 'Near Shivaji Park, Gokhale Road, Dadar West, Mumbai',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Dadar West',
      pincode: '400028',
      location: { type: 'Point', coordinates: [72.8478, 19.0178] },
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Indoor Mat',
      operatingHours: { open: '06:00', close: '22:00' },
      baseHourlyPricePaise: 110000, // ₹1,100/hr
      capacity: 20,
      isIndoor: true, // Indoor covered
      owner: ownerMumbai._id,
      approvalStatus: 'approved',
      isAvailableForBooking: true,
      ratingAverage: 4.8,
      ratingCount: 26,
    },

    // 14. Major Dhyan Chand National Stadium (Hockey - Discovery Venue)
    {
      name: 'Major Dhyan Chand National Hockey Stadium',
      slug: 'major-dhyan-chand-national-hockey-stadium',
      type: 'discovery', // DISCOVERY VENUE: Real venue, explore only, bookings disabled until owner onboarded
      description: 'Historical blue-turf Olympic hockey venue near India Gate. Listed for public discovery and sports complex exploration.',
      sports: ['Hockey'],
      address: 'India Gate Circle, New Delhi',
      state: 'Delhi NCR',
      city: 'New Delhi',
      locality: 'Siri Fort',
      pincode: '110001',
      location: { type: 'Point', coordinates: [77.2372, 28.6128] },
      images: [
        'https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=1200',
      ],
      facilities: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: 'Synthetic Turf',
      operatingHours: { open: '07:00', close: '20:00' },
      baseHourlyPricePaise: 200000,
      capacity: 30,
      isIndoor: false,
      owner: null, // Discovery venue without onboarded owner
      approvalStatus: 'approved',
      isAvailableForBooking: false,
      ratingAverage: 4.9,
      ratingCount: 154,
    },
  ];

  const venueDocs = await Venue.insertMany(venuesData);
  console.log(`[Seed] Seeded ${venueDocs.length} genuine venues.`);

  // ==========================================
  // 4. SEED PLAYING AREAS FOR EACH VENUE
  // ==========================================
  console.log('[Seed] Seeding Playing Areas with weekday/weekend pricing...');

  const playingAreasToInsert = [];
  for (const v of venueDocs) {
    for (let i = 0; i < v.sports.length; i++) {
      const sport = v.sports[i];
      const basePaise = v.baseHourlyPricePaise;
      const weekendPaise = Math.round(basePaise * 1.25);

      playingAreasToInsert.push({
        venue: v._id,
        name: `${sport} Arena 1`,
        sport,
        surfaceType: v.surface,
        dimensions: sport === 'Golf' ? 'Driving Range 250m' : sport === 'Cricket' ? '120ft x 70ft Box' : '100ft x 60ft Turf',
        capacity: v.capacity,
        hourlyPricePaise: basePaise,
        weekendHourlyPricePaise: weekendPaise,
        slotDurationMinutes: 60,
        isActive: true,
      });

      // Add Court 2 for multi-court venues
      if (v.sports.length === 1 && (sport === 'Football' || sport === 'Cricket')) {
        playingAreasToInsert.push({
          venue: v._id,
          name: `${sport} Arena 2`,
          sport,
          surfaceType: v.surface,
          dimensions: '90ft x 55ft Turf',
          capacity: v.capacity,
          hourlyPricePaise: basePaise,
          weekendHourlyPricePaise: weekendPaise,
          slotDurationMinutes: 60,
          isActive: true,
        });
      }
    }
  }

  const areaDocs = await PlayingArea.insertMany(playingAreasToInsert);
  console.log(`[Seed] Seeded ${areaDocs.length} playing areas.`);

  // ==========================================
  // 5. SEED PROMOTIONS
  // ==========================================
  console.log('[Seed] Seeding Owner Promotional Discounts...');

  const promo1 = await Promotion.create({
    venue: venueDocs[0]._id, // Neville D'Souza
    owner: ownerMumbai._id,
    title: 'Weekday Afternoon Happy Hours',
    discountPercentage: 15,
    applicableDays: [1, 2, 3, 4, 5],
    startHour: '14:00',
    endHour: '17:00',
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
    isActive: true,
  });

  const promo2 = await Promotion.create({
    venue: venueDocs[4]._id, // Urban Sports Park Thane
    owner: ownerThane._id,
    title: 'Midweek Cricket Carnival - 20% Off',
    discountPercentage: 20,
    applicableDays: [2, 3, 4], // Tue, Wed, Thu
    startHour: '13:00',
    endHour: '16:00',
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
    isActive: true,
  });

  // ==========================================
  // 6. SEED SAMPLE BOOKINGS & PAYMENTS
  // ==========================================
  console.log('[Seed] Seeding sample confirmed bookings & simulated payments...');

  const targetArea1 = areaDocs.find(a => String(a.venue) === String(venueDocs[0]._id));
  const targetArea2 = areaDocs.find(a => String(a.venue) === String(venueDocs[4]._id));

  const sampleBookingsData = [
    {
      bookingId: 'BMP-20261018-8A3F',
      customer: customerRahul._id,
      owner: ownerMumbai._id,
      venue: venueDocs[0]._id,
      playingArea: targetArea1._id,
      sport: 'Football',
      date: '2026-10-18',
      startTime: '18:00',
      endTime: '19:00',
      totalAmountPaise: 150000,
      originalAmountPaise: 150000,
      discountAmountPaise: 0,
      paymentStatus: 'simulated_success',
      bookingStatus: 'confirmed',
      customerDetails: {
        name: customerRahul.name,
        phone: customerRahul.phone,
        email: customerRahul.email,
      },
      isSimulatedPayment: true,
    },
    {
      bookingId: 'BMP-20261018-9B2C',
      customer: customerSneha._id,
      owner: ownerMumbai._id,
      venue: venueDocs[0]._id,
      playingArea: targetArea1._id,
      sport: 'Football',
      date: '2026-10-18',
      startTime: '19:00',
      endTime: '20:00',
      totalAmountPaise: 150000,
      originalAmountPaise: 150000,
      discountAmountPaise: 0,
      paymentStatus: 'simulated_success',
      bookingStatus: 'confirmed',
      customerDetails: {
        name: customerSneha.name,
        phone: customerSneha.phone,
        email: customerSneha.email,
      },
      isSimulatedPayment: true,
    },
    {
      bookingId: 'BMP-20261019-7D1E',
      customer: customerSneha._id,
      owner: ownerThane._id,
      venue: venueDocs[4]._id,
      playingArea: targetArea2._id,
      sport: 'Cricket',
      date: '2026-10-19',
      startTime: '14:00',
      endTime: '15:00',
      totalAmountPaise: 88000, // 20% discount applied: ₹1,100 - ₹220 = ₹880
      originalAmountPaise: 110000,
      discountAmountPaise: 22000,
      promotionApplied: promo2._id,
      paymentStatus: 'simulated_success',
      bookingStatus: 'confirmed',
      customerDetails: {
        name: customerSneha.name,
        phone: customerSneha.phone,
        email: customerSneha.email,
      },
      isSimulatedPayment: true,
    },
  ];

  const bookingDocs = await Booking.insertMany(sampleBookingsData);

  for (const b of bookingDocs) {
    await Payment.create({
      booking: b._id,
      customer: b.customer,
      amountPaise: b.totalAmountPaise,
      currency: 'INR',
      method: 'simulated_upi',
      transactionId: `TXN_SIM_${Date.now()}_${b.bookingId.slice(-4)}`,
      status: 'success',
      isSimulated: true,
      receiptId: `RCPT_${b.bookingId}`,
      disclaimer: 'DEMO PAYMENT — NO REAL MONEY CHARGED',
    });
  }

  // ==========================================
  // 7. SEED REVIEWS
  // ==========================================
  console.log('[Seed] Seeding customer verified reviews...');

  await Review.create({
    venue: venueDocs[0]._id,
    customer: customerRahul._id,
    booking: bookingDocs[0]._id,
    rating: 5,
    cleanlinessRating: 5,
    facilitiesRating: 5,
    valueRating: 4,
    comment: 'Superb turf quality in Bandra West! The floodlights are bright and even, and the changing rooms are very well maintained.',
  });

  await Review.create({
    venue: venueDocs[4]._id,
    customer: customerSneha._id,
    booking: bookingDocs[2]._id,
    rating: 5,
    cleanlinessRating: 5,
    facilitiesRating: 5,
    valueRating: 5,
    comment: 'Great box cricket turf with high ceiling nets. Booked with the weekday discount and had an awesome game!',
  });

  console.log('====================================================');
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('DEMO ACCOUNTS:');
  console.log('👤 Admin:     admin@bookmyplayground.in    / Admin@123456');
  console.log('🏟️ Owner 1:   rohit.sharma@mumbaiturfs.in   / Owner@123456');
  console.log('🏟️ Owner 2:   vikram.patil@thanesports.in   / Owner@123456');
  console.log('🏟️ Owner 3:   karthik.rao@bengaluruarenas.in / Owner@123456');
  console.log('⚽ Customer 1: rahul.verma@gmail.com        / Customer@123456');
  console.log('⚽ Customer 2: sneha.deshmukh@gmail.com     / Customer@123456');
  console.log('====================================================');

  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('[Seed Error] Failed to seed database:', err);
  process.exit(1);
});
