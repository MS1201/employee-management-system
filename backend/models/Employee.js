const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    default: () => `EMP-${Math.random().toString(36).substring(2,10).toUpperCase()}`
  },
  firstName:      { type: String, required: [true,'First name required'], trim: true },
  lastName:       { type: String, required: [true,'Last name required'],  trim: true },
  email:          { type: String, required: [true,'Email required'], unique: true, lowercase: true, trim: true },
  phone:          { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  dateOfBirth:    { type: Date },
  gender:         { type: String, enum: ['male','female','other','prefer_not_to_say'] },
  bloodGroup:     { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] },
  avatar:         { type: String, default: '' },
  currentAddress: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
  permanentAddress: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
  emergencyContact: {
    name: String, relationship: String, phone: String
  },
  department:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation:     { type: String, trim: true },
  jobTitle:        { type: String, trim: true },
  employmentType:  { type: String, enum: ['full_time','part_time','contract','intern'], default: 'full_time' },
  joiningDate:     { type: Date, default: Date.now },
  employmentStatus:{ type: String, enum: ['active','inactive','terminated','on_leave','probation'], default: 'active' },
  reportingManager:{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  workLocation:    { type: String, trim: true },
  salary:          { type: Number, select: false },
  workExperience: [{
    company: String, position: String, from: Date, to: Date, description: String
  }],
  skills:    [{ type: String }],
  education: [{
    degree: String, institution: String, fieldOfStudy: String, from: Date, to: Date, grade: String
  }],
  bankDetails: {
    accountName: { type: String, select: false },
    accountNumber:{ type: String, select: false },
    bankName:    { type: String, select: false },
    ifscCode:    { type: String, select: false }
  },
  governmentIds: {
    panNumber:      { type: String, select: false },
    aadharNumber:   { type: String, select: false },
    passportNumber: { type: String, select: false }
  },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text', designation: 'text' });
employeeSchema.index({ department: 1 });
employeeSchema.index({ employmentStatus: 1 });
employeeSchema.index({ joiningDate: -1 });

module.exports = mongoose.model('Employee', employeeSchema);

