import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const EmployeeFormModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    department: '',
    designation: '',
    jobTitle: '',
    employmentType: 'full_time',
    employmentStatus: 'active',
    workLocation: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    currentAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    permanentAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    skills: '',
    createAccount: true,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data);
      } catch (err) {
        // ignore
      }
    };
    if (isOpen) fetchDepartments();
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        alternatePhone: employee.alternatePhone || '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        gender: employee.gender || 'male',
        bloodGroup: employee.bloodGroup || '',
        department: employee.department?._id || employee.department || '',
        designation: employee.designation || '',
        jobTitle: employee.jobTitle || '',
        employmentType: employee.employmentType || 'full_time',
        employmentStatus: employee.employmentStatus || 'active',
        workLocation: employee.workLocation || '',
        salary: employee.salary || '',
        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
        currentAddress: employee.currentAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
        permanentAddress: employee.permanentAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
        emergencyContact: employee.emergencyContact || { name: '', relationship: '', phone: '' },
        skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : '',
        createAccount: false,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        dateOfBirth: '',
        gender: 'male',
        bloodGroup: '',
        department: '',
        designation: '',
        jobTitle: '',
        employmentType: 'full_time',
        employmentStatus: 'active',
        workLocation: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        currentAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        permanentAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        emergencyContact: { name: '', relationship: '', phone: '' },
        skills: '',
        createAccount: true,
      });
    }
    setActiveTab('personal');
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    if (!payload.department) delete payload.department;

    try {
      if (employee) {
        await api.put(`/employees/${employee._id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', payload);
        toast.success('Employee created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Edit Employee: ${employee.firstName} ${employee.lastName}` : 'Add New Employee'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
          {[
            { id: 'personal', label: '1. Personal Info' },
            { id: 'professional', label: '2. Professional Details' },
            { id: 'address', label: '3. Address & Emergency' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Personal */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="jane.smith@company.com"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 555-0199"
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
                <option value="">Select blood group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {!employee && (
              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="createAccount"
                  name="createAccount"
                  checked={formData.createAccount}
                  onChange={handleChange}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <label htmlFor="createAccount" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Automatically create a system login user account with standard temporary credentials
                </label>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Professional */}
        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="input-field">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input-field"
                placeholder="Senior Engineer"
              />
            </div>
            <div>
              <label className="label">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="input-field"
                placeholder="Full-Stack Developer"
              />
            </div>
            <div>
              <label className="label">Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="input-field">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="label">Employment Status</label>
              <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="input-field">
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Work Location</label>
              <input
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                className="input-field"
                placeholder="San Francisco / Remote"
              />
            </div>
            <div>
              <label className="label">Annual Base Salary ($)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="input-field"
                placeholder="85000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input-field"
                placeholder="React, Node.js, MongoDB, TypeScript, AWS"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Address & Emergency */}
        {activeTab === 'address' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  name="currentAddress.street"
                  value={formData.currentAddress.street}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123 Corporate Way, Suite 400"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="currentAddress.city"
                  value={formData.currentAddress.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="currentAddress.state"
                  value={formData.currentAddress.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="label">Zip Code</label>
                <input
                  type="text"
                  name="currentAddress.zipCode"
                  value={formData.currentAddress.zipCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="10001"
                />
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Emergency Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Contact Name</label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Robert Smith"
                />
              </div>
              <div>
                <label className="label">Relationship</label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Spouse / Parent"
                />
              </div>
              <div>
                <label className="label">Emergency Phone</label>
                <input
                  type="text"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 555-0188"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {activeTab !== 'personal' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'address' ? 'professional' : 'personal')}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            {activeTab !== 'address' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'personal' ? 'professional' : 'address')}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Create Employee')}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;

