const Attendance = require('../models/Attendance');

const LATE_THRESHOLD_HOUR   = 9;
const LATE_THRESHOLD_MIN    = 15;
const EARLY_DEPART_HOUR     = 17;
const EARLY_DEPART_MIN      = 30;

exports.checkIn = async (req, res, next) => {
  try {
    const { employeeId, notes } = req.body;
    const today = new Date(); today.setHours(0,0,0,0);

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const now = new Date();
    const isLate = now.getHours() > LATE_THRESHOLD_HOUR ||
      (now.getHours() === LATE_THRESHOLD_HOUR && now.getMinutes() > LATE_THRESHOLD_MIN);

    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: today },
      { employee: employeeId, date: today, checkIn: now, status: 'present', isLate, notes: notes || '' },
      { upsert: true, new: true }
    ).populate('employee', 'firstName lastName employeeId');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) { next(error); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const today = new Date(); today.setHours(0,0,0,0);

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    const now = new Date();
    const workingHours = (now - attendance.checkIn) / (1000 * 60 * 60);
    const isEarlyDeparture = now.getHours() < EARLY_DEPART_HOUR ||
      (now.getHours() === EARLY_DEPART_HOUR && now.getMinutes() < EARLY_DEPART_MIN);
    const status = workingHours < 4 ? 'half_day' : 'present';

    attendance.checkOut      = now;
    attendance.workingHours  = parseFloat(workingHours.toFixed(2));
    attendance.isEarlyDeparture = isEarlyDeparture;
    attendance.status        = status;
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) { next(error); }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const { employeeId, month, year, page = 1, limit = 31 } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0)
      };
    }
    const total   = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId avatar')
      .sort('-date')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: records.length, total, data: records });
  } catch (error) { next(error); }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (error) { next(error); }
};

exports.markAbsent = async (req, res, next) => {
  try {
    const { employeeId, date } = req.body;
    const d = new Date(date); d.setHours(0,0,0,0);
    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: d },
      { employee: employeeId, date: d, status: 'absent' },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: record });
  } catch (error) { next(error); }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0);

    const report = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$employee',
          totalDays:  { $sum: 1 },
          present:    { $sum: { $cond: [{ $eq: ['$status','present'] },  1, 0] } },
          absent:     { $sum: { $cond: [{ $eq: ['$status','absent'] },   1, 0] } },
          halfDay:    { $sum: { $cond: [{ $eq: ['$status','half_day'] }, 1, 0] } },
          late:       { $sum: { $cond: ['$isLate', 1, 0] } },
          totalHours: { $sum: '$workingHours' }
        }
      },
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      { $sort: { 'employee.firstName': 1 } }
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) { next(error); }
};

