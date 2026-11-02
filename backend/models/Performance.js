const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  reviewPeriod: {
    start: Date,
    end:   Date
  },
  reviewDate:    { type: Date, default: Date.now },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  categories: {
    productivity:  { type: Number, min: 1, max: 5, default: 3 },
    quality:       { type: Number, min: 1, max: 5, default: 3 },
    communication: { type: Number, min: 1, max: 5, default: 3 },
    teamwork:      { type: Number, min: 1, max: 5, default: 3 },
    initiative:    { type: Number, min: 1, max: 5, default: 3 },
    punctuality:   { type: Number, min: 1, max: 5, default: 3 }
  },
  goals: [{
    title:       String,
    description: String,
    targetDate:  Date,
    status:      { type: String, enum: ['pending','in_progress','completed'], default: 'pending' }
  }],
  feedback:            { type: String },
  achievements:        { type: String },
  areasOfImprovement:  { type: String },
  status: { type: String, enum: ['draft','submitted','acknowledged'], default: 'submitted' }
}, { timestamps: true });

performanceSchema.index({ employee: 1 });

module.exports = mongoose.model('Performance', performanceSchema);

