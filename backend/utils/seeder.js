const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const connectDB  = require('../config/db');
const User       = require('../models/User');
const Department = require('../models/Department');
const Employee   = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');

const seed = async () => {
  await connectDB();
  try {
    // Super Admin
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (!existingAdmin) {
      await User.create({
        firstName: 'Super',
        lastName:  'Admin',
        email:     'admin@ems.com',
        password:  'Admin@123456',
        role:      'super_admin',
        isActive:  true
      });
      console.log('✅ Super Admin created: admin@ems.com / Admin@123456');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }

    // Departments
    const deptCount = await Department.countDocuments();
    let departments = [];
    if (deptCount === 0) {
      departments = await Department.insertMany([
        { name: 'Engineering',     description: 'Software development and technical operations' },
        { name: 'Human Resources', description: 'Employee relations and HR operations' },
        { name: 'Finance',         description: 'Financial planning and accounting' },
        { name: 'Marketing',       description: 'Brand, marketing and communications' },
        { name: 'Operations',      description: 'Business operations and logistics' },
        { name: 'Sales',           description: 'Sales and business development' }
      ]);
      console.log('✅ Departments seeded');
    } else {
      departments = await Department.find();
      console.log('ℹ️  Departments already exist');
    }

    // Demo HR Manager
    const hrExists = await User.findOne({ email: 'hr@ems.com' });
    if (!hrExists) {
      const hrUser = await User.create({
        firstName: 'HR',
        lastName:  'Manager',
        email:     'hr@ems.com',
        password:  'Hr@123456',
        role:      'hr_manager',
        isActive:  true
      });
      const hrEmp = await Employee.create({
        firstName: 'HR',
        lastName:  'Manager',
        email:     'hr@ems.com',
        department: departments.find(d => d.name === 'Human Resources')?._id,
        designation: 'HR Manager',
        jobTitle: 'HR Manager',
        joiningDate: new Date('2023-01-15'),
        employmentStatus: 'active',
        employmentType: 'full_time',
        user: hrUser._id
      });
      await User.findByIdAndUpdate(hrUser._id, { employee: hrEmp._id });
      await LeaveBalance.create({ employee: hrEmp._id });
      console.log('✅ HR Manager created: hr@ems.com / Hr@123456');
    }

    // Demo Employee
    const empExists = await User.findOne({ email: 'employee@ems.com' });
    if (!empExists) {
      const empUser = await User.create({
        firstName: 'John',
        lastName:  'Doe',
        email:     'employee@ems.com',
        password:  'Emp@123456',
        role:      'employee',
        isActive:  true
      });
      const emp = await Employee.create({
        firstName: 'John',
        lastName:  'Doe',
        email:     'employee@ems.com',
        phone:     '+1-555-0100',
        department: departments.find(d => d.name === 'Engineering')?._id,
        designation: 'Software Engineer',
        jobTitle:   'Senior Software Engineer',
        joiningDate: new Date('2023-06-01'),
        employmentStatus: 'active',
        employmentType:   'full_time',
        dateOfBirth: new Date('1995-03-15'),
        gender: 'male',
        skills: ['JavaScript','React','Node.js','MongoDB'],
        user: empUser._id
      });
      await User.findByIdAndUpdate(empUser._id, { employee: emp._id });
      await LeaveBalance.create({ employee: emp._id });
      console.log('✅ Demo Employee created: employee@ems.com / Emp@123456');
    }

    console.log('\n🎉 Seeding complete!');
    console.log('─────────────────────────────────');
    console.log('Login Credentials:');
    console.log('  Super Admin : admin@ems.com    / Admin@123456');
    console.log('  HR Manager  : hr@ems.com       / Hr@123456');
    console.log('  Employee    : employee@ems.com  / Emp@123456');
    console.log('─────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seed();

