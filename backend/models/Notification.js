const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['new_employee','leave_application','leave_approved','leave_rejected','birthday','anniversary','announcement','payroll'],
    required: true
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

