import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  ShieldAlert,
  Clock,
  FileText,
  Edit,
  Award
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmployeeFormModal from './EmployeeFormModal';
import toast from 'react-hot-toast';

export const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isHR } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [attendance, setAttendance] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [documents, setDocuments] = useState([]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/employees/${id}`);
      if (res.data.success) {
        setEmployee(res.data.data);
      }

      // Fetch extra info
      const [attRes, leaveRes, docRes] = await Promise.allSettled([
        api.get(`/attendance?employeeId=${id}&limit=10`),
        api.get(`/leaves/balance/${id}`),
        api.get(`/documents?employeeId=${id}`),
      ]);

      if (attRes.status === 'fulfilled' && attRes.value.data.success) {
        setAttendance(attRes.value.data.data);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value.data.success) {
        setLeaveBalance(leaveRes.value.data.data);
      }
      if (docRes.status === 'fulfilled' && docRes.value.data.success) {
        setDocuments(docRes.value.data.data);
      }
    } catch (err) {
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading employee profile..." />;
  if (!employee) return <div className="p-8 text-center text-slate-500">Employee not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="btn-secondary text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>

        {isHR && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn-primary text-xs"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Header Profile Card */}
      <div className="card p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-primary-500/30 border-2 border-white/20">
            {employee.firstName?.[0]}{employee.lastName?.[0]}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <span className="badge-purple bg-indigo-500/30 text-indigo-200 border-none w-fit mx-auto sm:mx-0">
                {employee.employeeId}
              </span>
              <Badge variant={employee.employmentStatus === 'active' ? 'green' : 'yellow'}>
                {employee.employmentStatus}
              </Badge>
            </div>

            <p className="text-sm text-slate-300 font-medium">
              {employee.designation || 'Staff'} • {employee.department?.name || 'Unassigned Department'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary-400" /> {employee.email}
              </span>
              {employee.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary-400" /> {employee.phone}
                </span>
              )}
              {employee.workLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" /> {employee.workLocation}
                </span>
              )}
              {employee.joiningDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-400" /> Joined {new Date(employee.joiningDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        {[
          { id: 'overview', label: 'Profile Overview' },
          { id: 'attendance', label: 'Attendance History' },
          { id: 'leaves', label: 'Leave Balances' },
          { id: 'documents', label: `Documents (${documents.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Professional Information */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Briefcase className="w-4 h-4 text-primary-600" /> Professional Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.department?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Designation</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.designation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Job Title</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.jobTitle || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Employment Type</span>
                <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{employee.employmentType?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Reporting Manager</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {employee.reportingManager ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}` : 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Work Location</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.workLocation || 'Standard'}</span>
              </div>
            </div>

            {employee.skills && employee.skills.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-400 block text-xs mb-2">Skills & Competencies</span>
                <div className="flex flex-wrap gap-1.5">
                  {employee.skills.map((skill, i) => (
                    <span key={i} className="badge-blue text-[11px] px-2 py-0.5">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-primary-600" /> Personal & Emergency Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{employee.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Blood Group</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.bloodGroup || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {employee.emergencyContact?.name ? `${employee.emergencyContact.name} (${employee.emergencyContact.relationship || 'Contact'})` : 'N/A'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Current Address</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {employee.currentAddress?.street 
                    ? `${employee.currentAddress.street}, ${employee.currentAddress.city || ''} ${employee.currentAddress.state || ''} ${employee.currentAddress.zipCode || ''}`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Salary / Bank Details (Admin Only) */}
          {employee.salary !== undefined && (
            <div className="card p-5 md:col-span-2 space-y-4 border-amber-200/50 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-amber-100 dark:border-amber-900/40 pb-2">
                <DollarSign className="w-4 h-4 text-amber-600" /> Confidential Compensation & Banking
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Annual Salary</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                    ${Number(employee.salary).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Bank Account Holder</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {employee.bankDetails?.accountName || 'On File'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Bank Name & IFSC</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {employee.bankDetails?.bankName ? `${employee.bankDetails.bankName} (${employee.bankDetails.ifscCode})` : 'Confidential'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Attendance */}
      {activeTab === 'attendance' && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Recent Attendance Log
          </h3>
          {attendance.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">No attendance logs found</p>
          ) : (
            <div className="table-wrapper">
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Check In</th>
                    <th className="table-th">Check Out</th>
                    <th className="table-th">Working Hours</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((att) => (
                    <tr key={att._id} className="table-tr">
                      <td className="table-td font-medium">{new Date(att.date).toLocaleDateString()}</td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="table-td font-semibold">{att.workingHours || 0} hrs</td>
                      <td className="table-td">
                        <Badge variant={att.status === 'present' ? 'green' : att.status === 'half_day' ? 'yellow' : 'red'}>
                          {att.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Leaves */}
      {activeTab === 'leaves' && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Annual Leave Entitlement ({leaveBalance?.year || new Date().getFullYear()})
          </h3>
          {leaveBalance ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'Casual Leave', data: leaveBalance.casual },
                { title: 'Sick Leave', data: leaveBalance.sick },
                { title: 'Earned Leave', data: leaveBalance.earned },
                { title: 'Paid Leave', data: leaveBalance.paid },
              ].map((item, i) => (
                <div key={i} className="card p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">{item.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                      {(item.data?.total || 0) - (item.data?.used || 0)}
                    </span>
                    <span className="text-xs text-slate-400">/ {item.data?.total || 0} left</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-4 text-center">Leave balance not initialized</p>
          )}
        </div>
      )}

      {/* Tab Content: Documents */}
      {activeTab === 'documents' && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Employee Uploaded Documents
          </h3>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">No documents uploaded for this employee</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <div key={doc._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{doc.category?.replace('_', ' ')} • {doc.fileName}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditOpen && (
        <EmployeeFormModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          employee={employee}
          onSuccess={fetchEmployeeData}
        />
      )}
    </div>
  );
};

export default EmployeeDetail;

