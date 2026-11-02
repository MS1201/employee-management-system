const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      employee: user.employee
    }
  });
};

// @desc  Register user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    // Only super_admin can create admins
    let assignedRole = 'employee';
    if (role && req.user && req.user.role === 'super_admin') {
      assignedRole = role;
    }
    const user = await User.create({ firstName, lastName, email, password, role: assignedRole });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc  Login
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated. Contact HR.' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('employee');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (super_admin only)
// @route GET /api/auth/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('employee', 'employeeId firstName lastName designation');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user role
// @route PUT /api/auth/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status
// @route PUT /api/auth/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

