const Performance = require('../models/Performance');
const Employee    = require('../models/Employee');

exports.getPerformances = async (req, res, next) => {
  try {
    const { employeeId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (emp) query.employee = emp._id;
    }

    const total   = await Performance.countDocuments(query);
    const reviews = await Performance.find(query)
      .populate('employee',   'firstName lastName employeeId designation avatar')
      .populate('reviewedBy', 'firstName lastName')
      .sort('-reviewDate')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: reviews.length, total, data: reviews });
  } catch (error) { next(error); }
};

exports.getPerformance = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id)
      .populate('employee',   'firstName lastName employeeId designation avatar department')
      .populate('reviewedBy', 'firstName lastName');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, data: review });
  } catch (error) { next(error); }
};

exports.createPerformance = async (req, res, next) => {
  try {
    const review = await Performance.create({ ...req.body, reviewedBy: req.user._id });
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
};

exports.updatePerformance = async (req, res, next) => {
  try {
    const review = await Performance.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, data: review });
  } catch (error) { next(error); }
};

exports.deletePerformance = async (req, res, next) => {
  try {
    const review = await Performance.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) { next(error); }
};

