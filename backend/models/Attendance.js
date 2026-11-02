const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date:            { type: Date, required: true },
  checkIn:         { type: Date },
  checkOut:        { type: Date },
  workingHours:    { type: Number, default: 0 },
  status:          { type: String, enum: ['present','absent','half_day','leave','holiday','weekend'], default: 'present' },
  isLate:          { type: Boolean, default: false },
  isEarlyDeparture:{ type: Boolean, default: false },
  notes:           { type: String }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

