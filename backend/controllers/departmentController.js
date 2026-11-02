const Department = require('../models/Department');
const Employee   = require('../models/Employee');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('head', 'firstName lastName designation avatar')
      .populate('employeeCount');
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) { next(error); }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'firstName lastName designation avatar')
      .populate('employeeCount');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    const employees = await Employee.find({ department: req.params.id })
      .select('firstName lastName designation employmentStatus avatar employeeId');
    res.status(200).json({ success: true, data: { ...department.toObject(), employees } });
  } catch (error) { next(error); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate('head', 'firstName lastName designation')
      .populate('employeeCount');
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const empCount = await Employee.countDocuments({ department: req.params.id });
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${empCount} employee(s). Please reassign them first.`
      });
    }
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) { next(error); }
};

