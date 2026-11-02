const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name:       { type: String, required: true, trim: true },
  category:   { type: String, enum: ['resume','offer_letter','joining_document','identity','certificate','other'], required: true },
  fileName:   { type: String, required: true },
  filePath:   { type: String, required: true },
  fileType:   { type: String },
  fileSize:   { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description:{ type: String }
}, { timestamps: true });

documentSchema.index({ employee: 1, category: 1 });

module.exports = mongoose.model('Document', documentSchema);

