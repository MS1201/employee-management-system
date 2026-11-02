const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    unique: true,
    default: () => `DEPT-${Math.random().toString(36).substring(2,10).toUpperCase()}`
  },
  name:        { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
  description: { type: String, trim: true },
  head:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isActive:    { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

departmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department',
  count: true
});

module.exports = mongoose.model('Department', departmentSchema);

