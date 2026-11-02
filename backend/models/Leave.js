const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee:          { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType:         { type: String, enum: ['casual','sick','earned','paid','unpaid','other'], required: true },
  startDate:         { type: Date, required: true },
  endDate:           { type: Date, required: true },
  totalDays:         { type: Number, required: true },
  reason:            { type: String, required: [true,'Reason is required'], trim: true },
  supportingDocument:{ type: String },
  status:            { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  approvedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:        { type: Date },
  rejectionReason:   { type: String }
}, { timestamps: true });

leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: -1 });

module.exports = mongoose.model('Leave', leaveSchema);

