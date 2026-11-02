const Leave       = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee    = require('../models/Employee');
const Notification = require('../models/Notification');
const User        = require('../models/User');

exports.applyLeave = async (req, res, next) => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Calculate business days
    let totalDays = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) totalDays++;
      cur.setDate(cur.getDate() + 1);
    }
    if (totalDays === 0) totalDays = 1;

    // Check balance
    const balance = await LeaveBalance.findOne({ employee });
    if (balance && leaveType !== 'unpaid' && balance[leaveType]) {
      const remaining = balance[leaveType].total - balance[leaveType].used;
      if (totalDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Available: ${remaining} days`
        });
      }
    }

    const leaveData = { employee, leaveType, startDate: start, endDate: end, totalDays, reason };
    if (req.file) leaveData.supportingDocument = `/uploads/${req.file.filename}`;

    const leave = await Leave.create(leaveData);

    const emp = await Employee.findById(employee);
    const admins = await User.find({ role: { $in: ['super_admin','hr_manager'] } });
    if (admins.length && emp) {
      await Notification.insertMany(admins.map(a => ({
        recipient: a._id,
        type: 'leave_application',
        title: 'New Leave Application',
        message: `${emp.firstName} ${emp.lastName} applied for ${totalDays} day(s) of ${leaveType} leave.`,
        data: { leaveId: leave._id }
      })));
    }

    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

exports.getLeaves = async (req, res, next) => {
  try {
    const { employeeId, status, leaveType, page = 1, limit = 10 } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (status)     query.status = status;
    if (leaveType)  query.leaveType = leaveType;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId avatar department')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: leaves.length, total, data: leaves });
  } catch (error) { next(error); }
};

exports.getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId avatar')
      .populate('approvedBy', 'firstName lastName');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave has already been processed' });
    }

    leave.status     = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    if (status === 'rejected' && rejectionReason) leave.rejectionReason = rejectionReason;

    if (status === 'approved') {
      await LeaveBalance.findOneAndUpdate(
        { employee: leave.employee._id },
        { $inc: { [`${leave.leaveType}.used`]: leave.totalDays } }
      );
      // Update employee status
      await Employee.findByIdAndUpdate(leave.employee._id, { employmentStatus: 'on_leave' });
    }

    await leave.save();

    const empUser = await User.findOne({ employee: leave.employee._id });
    if (empUser) {
      await Notification.create({
        recipient: empUser._id,
        type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
        title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your ${leave.leaveType} leave request has been ${status}.`,
        data: { leaveId: leave._id }
      });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled' });
    }
    leave.status = 'cancelled';
    await leave.save();
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

exports.getLeaveBalance = async (req, res, next) => {
  try {
    const balance = await LeaveBalance.findOne({ employee: req.params.employeeId });
    if (!balance) return res.status(404).json({ success: false, message: 'Leave balance not found' });
    res.status(200).json({ success: true, data: balance });
  } catch (error) { next(error); }
};

exports.updateLeaveBalance = async (req, res, next) => {
  try {
    const balance = await LeaveBalance.findOneAndUpdate(
      { employee: req.params.employeeId },
      req.body,
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: balance });
  } catch (error) { next(error); }
};

