const Document = require('../models/Document');
const Employee = require('../models/Employee');
const path = require('path');
const fs   = require('fs');

exports.getDocuments = async (req, res, next) => {
  try {
    const { employeeId, category } = req.query;
    const query = {};
    if (category) query.category = category;

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp) return res.status(403).json({ success: false, message: 'Access denied' });
      query.employee = emp._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    const docs = await Document.find(query)
      .populate('employee',   'firstName lastName employeeId')
      .populate('uploadedBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('employee',   'firstName lastName employeeId')
      .populate('uploadedBy', 'firstName lastName');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const doc = await Document.create({
      ...req.body,
      fileName:   req.file.originalname,
      filePath:   `/uploads/${req.file.filename}`,
      fileType:   req.file.mimetype,
      fileSize:   req.file.size,
      uploadedBy: req.user._id
    });
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (!emp || doc.employee.toString() !== emp._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const filePath = path.join(__dirname, '..', doc.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    res.download(filePath, doc.fileName);
  } catch (error) { next(error); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const filePath = path.join(__dirname, '..', doc.filePath);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* file already gone */ }
    }
    await doc.deleteOne();
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) { next(error); }
};

