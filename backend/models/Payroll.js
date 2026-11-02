const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month:       { type: Number, required: true, min: 1, max: 12 },
  year:        { type: Number, required: true },
  basicSalary: { type: Number, required: true, default: 0 },
  allowances: {
    hra:       { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    medical:   { type: Number, default: 0 },
    special:   { type: Number, default: 0 },
    other:     { type: Number, default: 0 }
  },
  bonuses: { type: Number, default: 0 },
  deductions: {
    pf:    { type: Number, default: 0 },
    esi:   { type: Number, default: 0 },
    tax:   { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  grossSalary:    { type: Number, default: 0 },
  totalDeductions:{ type: Number, default: 0 },
  netSalary:      { type: Number, default: 0 },
  paymentStatus:  { type: String, enum: ['pending','paid','on_hold'], default: 'pending' },
  paymentDate:    { type: Date },
  paymentMethod:  { type: String, enum: ['bank_transfer','cash','cheque'], default: 'bank_transfer' },
  notes:          { type: String }
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

payrollSchema.pre('save', function (next) {
  const totalAllowances = Object.values(this.allowances.toObject ? this.allowances.toObject() : this.allowances)
    .reduce((a, b) => a + (b || 0), 0);
  this.grossSalary = (this.basicSalary || 0) + totalAllowances + (this.bonuses || 0);
  const totalDed = Object.values(this.deductions.toObject ? this.deductions.toObject() : this.deductions)
    .reduce((a, b) => a + (b || 0), 0);
  this.totalDeductions = totalDed;
  this.netSalary = this.grossSalary - this.totalDeductions;
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);

