const Payroll  = require('../models/Payroll');
const Employee = require('../models/Employee');

exports.getPayrolls = async (req, res, next) => {
  try {
    const { employeeId, month, year, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (month)  query.month = parseInt(month);
    if (year)   query.year  = parseInt(year);
    if (status) query.paymentStatus = status;

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(404).json({ success: false, message: 'Employee record not found' });
      query.employee = emp._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    const total    = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId designation department avatar')
      .sort({ year: -1, month: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: payrolls.length, total, data: payrolls });
  } catch (error) { next(error); }
};

exports.getPayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId designation department avatar');
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.status(200).json({ success: true, data: payroll });
  } catch (error) { next(error); }
};

exports.createPayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.create(req.body);
    res.status(201).json({ success: true, data: payroll });
  } catch (error) { next(error); }
};

exports.updatePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.status(200).json({ success: true, data: payroll });
  } catch (error) { next(error); }
};

exports.deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.status(200).json({ success: true, message: 'Payroll record deleted' });
  } catch (error) { next(error); }
};

exports.getPayrollSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const match = {};
    if (month) match.month = parseInt(month);
    if (year)  match.year  = parseInt(year);

    const summary = await Payroll.aggregate([
      { $match: match },
      { $group: {
          _id: null,
          totalGross:      { $sum: '$grossSalary' },
          totalNet:        { $sum: '$netSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalBonuses:    { $sum: '$bonuses' },
          count:           { $sum: 1 }
      }}
    ]);

    res.status(200).json({ success: true, data: summary[0] || {} });
  } catch (error) { next(error); }
};

