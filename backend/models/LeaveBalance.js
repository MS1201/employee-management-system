const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  year:     { type: Number, default: () => new Date().getFullYear() },
  casual:   { total: { type: Number, default: 12 }, used: { type: Number, default: 0 } },
  sick:     { total: { type: Number, default: 12 }, used: { type: Number, default: 0 } },
  earned:   { total: { type: Number, default: 15 }, used: { type: Number, default: 0 } },
  paid:     { total: { type: Number, default: 10 }, used: { type: Number, default: 0 } },
  unpaid:   { total: { type: Number, default: 0 },  used: { type: Number, default: 0 } },
  other:    { total: { type: Number, default: 5 },  used: { type: Number, default: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);

