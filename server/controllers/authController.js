const jwt = require('jsonwebtoken');
const { User, OwnerProfile, Notification } = require('../models');

// Helper to generate JWT token
const generateToken = user => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'bmp_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a Customer
// @route   POST /api/auth/register-customer
// @access  Public
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password, preferredCity } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, 10-digit mobile number, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer',
      preferredCity: preferredCity || 'Mumbai',
    });

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to BookMyPlayground!',
      message: `Welcome, ${user.name}! Discover and book premier sports venues across India.`,
      type: 'system',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Customer account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredCity: user.preferredCity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a Ground Owner
// @route   POST /api/auth/register-owner
// @access  Public
exports.registerOwner = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      businessName,
      businessAddress,
      panOrGst,
      declarationSigned,
    } = req.body;

    if (!name || !email || !phone || !password || !businessName || !businessAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required owner and business information.',
      });
    }

    if (!declarationSigned) {
      return res.status(400).json({
        success: false,
        message: 'You must confirm ownership/operational authorization for this facility.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'owner',
    });

    const ownerProfile = await OwnerProfile.create({
      user: user._id,
      businessName,
      businessAddress,
      panOrGst: panOrGst || '',
      declarationSigned: true,
      approvalStatus: 'pending', // Starts pending admin approval
    });

    // Welcome notification
    await Notification.create({
      user: user._id,
      title: 'Owner Application Submitted',
      message:
        'Your ground owner application is under review by the BookMyPlayground admin team. You can start setting up your venue listings.',
      type: 'approval',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Owner registration successful. Application submitted for admin review.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ownerProfile: {
          businessName: ownerProfile.businessName,
          approvalStatus: ownerProfile.approvalStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login User (Customer, Owner, or Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    let ownerProfile = null;
    if (user.role === 'owner') {
      ownerProfile = await OwnerProfile.findOne({ user: user._id });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredCity: user.preferredCity,
        ownerProfile: ownerProfile
          ? {
              id: ownerProfile._id,
              businessName: ownerProfile.businessName,
              approvalStatus: ownerProfile.approvalStatus,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged In User Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let ownerProfile = null;
    if (user.role === 'owner') {
      ownerProfile = await OwnerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredCity: user.preferredCity,
        ownerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Profile (City preference, Name, Phone)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredCity } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredCity) user.preferredCity = preferredCity;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredCity: user.preferredCity,
      },
    });
  } catch (error) {
    next(error);
  }
};
