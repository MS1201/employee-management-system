const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const Notification = require('../models/Notification');

// @desc   Get all employees (with search/filter/pagination)
// @route  GET /api/employees
exports.getEmployees = async (req, res, next) => {
  try {
    const {
      search, department, status, designation,
      employmentType, page = 1, limit = 10, sort = '-createdAt'
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { employeeId:{ $regex: search, $options: 'i' } },
        { designation:{ $regex: search, $options: 'i' } }
      ];
    }
    if (department)     query.department = department;
    if (status)         query.employmentStatus = status;
    if (designation)    query.designation = { $regex: designation, $options: 'i' };
    if (employmentType) query.employmentType = employmentType;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('reportingManager', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-bankDetails -governmentIds -salary');

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single employee
// @route  GET /api/employees/:id
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name description')
      .populate('reportingManager', 'firstName lastName designation avatar')
      .populate('user', 'email role lastLogin isActive');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let empData = employee.toObject();

    // Restrict salary/bank/govIDs for non-admins unless own record
    if (!['super_admin', 'hr_manager'].includes(req.user.role)) {
      const isOwn = employee.user &&
        employee.user._id.toString() === req.user._id.toString();
      if (!isOwn) {
        delete empData.salary;
        delete empData.bankDetails;
        delete empData.governmentIds;
      }
    } else {
      // For admins, re-fetch with salary
      const withSalary = await Employee.findById(req.params.id).select('+salary +bankDetails +governmentIds');
      empData.salary = withSalary.salary;
      empData.bankDetails = withSalary.bankDetails;
      empData.governmentIds = withSalary.governmentIds;
    }

    res.status(200).json({ success: true, data: empData });
  } catch (error) {
    next(error);
  }
};

// @desc   Create employee
// @route  POST /api/employees
exports.createEmployee = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.avatar = `/uploads/${req.file.filename}`;

    // Parse JSON string fields
    ['currentAddress','permanentAddress','emergencyContact','workExperience','education','skills'].forEach(field => {
      if (body[field] && typeof body[field] === 'string') {
        try { body[field] = JSON.parse(body[field]); } catch (e) { /* ignore */ }
      }
    });

    const employee = await Employee.create(body);

    // Create leave balance record
    await LeaveBalance.create({ employee: employee._id });

    // Notify admins
    const admins = await User.find({ role: { $in: ['super_admin', 'hr_manager'] } });
    if (admins.length) {
      await Notification.insertMany(admins.map(a => ({
        recipient: a._id,
        type: 'new_employee',
        title: 'New Employee Added',
        message: `${employee.firstName} ${employee.lastName} (${employee.employeeId}) has joined.`,
        data: { employeeId: employee._id }
      })));
    }

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc   Update employee
// @route  PUT /api/employees/:id
exports.updateEmployee = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.avatar = `/uploads/${req.file.filename}`;

    ['currentAddress','permanentAddress','emergencyContact','workExperience','education','skills'].forEach(field => {
      if (body[field] && typeof body[field] === 'string') {
        try { body[field] = JSON.parse(body[field]); } catch (e) { /* ignore */ }
      }
    });

    const employee = await Employee.findByIdAndUpdate(req.params.id, body, {
      new: true, runValidators: true
    })
      .populate('department', 'name')
      .populate('reportingManager', 'firstName lastName');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete employee
// @route  DELETE /api/employees/:id
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { isActive: false, employee: null });
    }
    await employee.deleteOne();
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get dashboard stats
// @route  GET /api/employees/stats
exports.getEmployeeStats = async (req, res, next) => {
  try {
    const total    = await Employee.countDocuments();
    const active   = await Employee.countDocuments({ employmentStatus: 'active' });
    const inactive = await Employee.countDocuments({ employmentStatus: { $in: ['inactive','terminated'] } });
    const onLeave  = await Employee.countDocuments({ employmentStatus: 'on_leave' });

    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const newThisMonth = await Employee.countDocuments({ createdAt: { $gte: monthStart } });

    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } }
    ]);

    const monthlyJoining = await Employee.aggregate([
      {
        $group: {
          _id: { year: { $year: '$joiningDate' }, month: { $month: '$joiningDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const statusDistribution = await Employee.aggregate([
      { $group: { _id: '$employmentStatus', count: { $sum: 1 } } }
    ]);

    const recentEmployees = await Employee.find()
      .populate('department', 'name')
      .sort('-createdAt')
      .limit(5)
      .select('firstName lastName designation department avatar createdAt employmentStatus employeeId');

    // Upcoming birthdays in next 30 days
    const allWithDOB = await Employee.find({ dateOfBirth: { $exists: true, $ne: null } })
      .select('firstName lastName dateOfBirth avatar department employeeId')
      .populate('department', 'name');

    const today = new Date();
    const upcomingBirthdays = allWithDOB
      .map(emp => {
        const dob = new Date(emp.dateOfBirth);
        let bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (bday < today) bday.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));
        return { ...emp.toObject(), daysUntil, birthdayThisYear: bday };
      })
      .filter(e => e.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // Work anniversaries
    const upcomingAnniversaries = await Employee.find({
      joiningDate: { $exists: true, $ne: null },
      employmentStatus: 'active'
    })
      .select('firstName lastName joiningDate avatar employeeId')
      .lean();

    const anniversaries = upcomingAnniversaries
      .map(emp => {
        const joined = new Date(emp.joiningDate);
        let anniv = new Date(today.getFullYear(), joined.getMonth(), joined.getDate());
        if (anniv < today) anniv.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((anniv - today) / (1000 * 60 * 60 * 24));
        const years = anniv.getFullYear() - joined.getFullYear();
        return { ...emp, daysUntil, years };
      })
      .filter(e => e.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    const totalDepts = await (require('../models/Department')).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        total, active, inactive, onLeave, newThisMonth, totalDepts,
        departmentStats, monthlyJoining, statusDistribution,
        recentEmployees, upcomingBirthdays, upcomingAnniversaries: anniversaries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Export employees CSV
// @route  GET /api/employees/export
exports.exportEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find()
      .populate('department', 'name')
      .populate('reportingManager', 'firstName lastName')
      .select('-bankDetails -governmentIds -__v');

    const headers = ['Employee ID','First Name','Last Name','Email','Phone','Department','Designation','Job Title','Employment Type','Status','Joining Date','Work Location'];
    const rows = employees.map(e => [
      e.employeeId, e.firstName, e.lastName, e.email, e.phone || '',
      e.department ? e.department.name : '',
      e.designation || '', e.jobTitle || '',
      e.employmentType, e.employmentStatus,
      e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : '',
      e.workLocation || ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

