import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  User,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const AttendanceList = () => {
  const { user, isHR } = useAuth();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Daily status for current user
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Manual mark absent modal (HR only)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const empId = !isHR ? (user?.employee?._id || user?.employee) : selectedEmployeeId;
      const params = new URLSearchParams({
        page: currentPage,
        limit: 15,
        month: selectedMonth,
        year: selectedYear,
        ...(empId && { employeeId: empId }),
      });

      const res = await api.get(`/attendance?${params.toString()}`);
      if (res.data.success) {
        setRecords(res.data.data);
        setTotalPages(Math.ceil((res.data.total || 1) / 15));
      }

      // Check current user's today attendance
      const myEmpId = user?.employee?._id || user?.employee;
      if (myEmpId) {
        const todayRes = await api.get(`/attendance?employeeId=${myEmpId}&limit=1`);
        if (todayRes.data.success && todayRes.data.data.length > 0) {
          const latest = todayRes.data.data[0];
          if (new Date(latest.date).toDateString() === new Date().toDateString()) {
            setTodayAttendance(latest);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    if (!isHR) return;
    try {
      const res = await api.get('/employees?limit=200');
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, [isHR]);

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, selectedMonth, selectedYear, selectedEmployeeId]);

  const handleCheckIn = async () => {
    const empId = user?.employee?._id || user?.employee;
    if (!empId) {
      toast.error('No employee profile associated with this account');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/checkin', { employeeId: empId });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        toast.success('Check-in recorded!');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const empId = user?.employee?._id || user?.employee;
    if (!empId) return;
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/checkout', { employeeId: empId });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        toast.success('Check-out recorded!');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualAbsentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/absent', manualData);
      toast.success('Employee marked absent');
      setIsManualModalOpen(false);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & CheckIn Widget */}
      <div className="card p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="badge-purple bg-indigo-500/30 text-indigo-200 border-none mb-2">
            Time & Attendance Tracking
          </span>
          <h1 className="text-2xl font-black">Daily Workplace Attendance</h1>
          <p className="text-xs text-slate-300 mt-1">
            Check-in/out timestamps, daily working hour computations, and attendance logs.
          </p>
        </div>

        {/* Action Controls for Checkin */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
              Today: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-slate-200 font-medium">
              {todayAttendance?.checkIn 
                ? `In: ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not Checked In'}
              {todayAttendance?.checkOut && ` • Out: ${new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>

          {!todayAttendance?.checkIn ? (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="btn-success text-xs px-4 py-2"
            >
              Check In
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="btn-primary text-xs px-4 py-2"
            >
              Check Out
            </button>
          ) : (
            <span className="badge-green text-xs px-3 py-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
            </span>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(Number(e.target.value)); setCurrentPage(1); }}
              className="input-field py-1.5 text-xs w-36"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
              className="input-field py-1.5 text-xs w-28"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {isHR && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Employee Filter</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => { setSelectedEmployeeId(e.target.value); setCurrentPage(1); }}
                className="input-field py-1.5 text-xs w-52"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isHR && (
          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="btn-secondary text-xs"
            >
              <Plus className="w-4 h-4" /> Mark Absent Override
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving attendance history..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          description="There are no attendance events logged for the selected period."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper border-none rounded-none">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Check In</th>
                  <th className="table-th">Check Out</th>
                  <th className="table-th">Working Hours</th>
                  <th className="table-th">Timeliness</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id} className="table-tr">
                    <td className="table-td font-semibold text-slate-700 dark:text-slate-200">
                      {new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : 'System User'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({rec.employee?.employeeId || 'ID'})
                        </span>
                      </div>
                    </td>
                    <td className="table-td font-medium">
                      {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="table-td font-medium">
                      {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="table-td font-bold text-slate-800 dark:text-slate-200">
                      {rec.workingHours || 0} hrs
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1.5">
                        {rec.isLate && <Badge variant="yellow">Late</Badge>}
                        {rec.isEarlyDeparture && <Badge variant="yellow">Early Out</Badge>}
                        {!rec.isLate && !rec.isEarlyDeparture && rec.status === 'present' && (
                          <Badge variant="green">On Time</Badge>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge
                        variant={
                          rec.status === 'present'
                            ? 'green'
                            : rec.status === 'half_day'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {rec.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Manual Absent Override Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Mark Employee Absent"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualAbsentSubmit} className="space-y-4">
          <div>
            <label className="label">Select Employee *</label>
            <select
              required
              value={manualData.employeeId}
              onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })}
              className="input-field"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              required
              value={manualData.date}
              onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger text-xs"
            >
              Confirm Absent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceList;

