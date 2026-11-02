import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  CalendarCheck,
  DollarSign,
  Building,
  CheckCircle2,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [downloading, setDownloading] = useState(false);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());

  const handleExportEmployees = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_master_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Employee master CSV generated');
    } catch (err) {
      toast.error('Failed to export employee report');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const res = await api.get(`/attendance/monthly-report?month=${attendanceMonth}&year=${attendanceYear}`);
      if (res.data.success) {
        const rows = [
          ['Employee Name', 'Employee ID', 'Total Logged Days', 'Present', 'Absent', 'Half Days', 'Late Count', 'Total Hours'],
          ...res.data.data.map(r => [
            `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`,
            r.employee?.employeeId || '',
            r.totalDays || 0,
            r.present || 0,
            r.absent || 0,
            r.halfDay || 0,
            r.late || 0,
            r.totalHours || 0
          ])
        ];
        const csv = rows.map(e => e.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_monthly_report_${attendanceMonth}_${attendanceYear}.csv`;
        a.click();
        toast.success('Attendance monthly report exported');
      }
    } catch (err) {
      toast.error('Failed to export attendance report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise Analytics & Reports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export comprehensive datasets for corporate compliance, payroll audits, and headcount tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Employee Directory Report */}
        <div className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Employee Master Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete staff ledger with contact details, designations, departments, join dates, and current employment statuses.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportEmployees}
              disabled={downloading}
              className="btn-primary w-full justify-center text-xs"
            >
              <Download className="w-4 h-4" /> Export CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Attendance Audit Report */}
        <div className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Monthly Attendance Aggregate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated work hours, tardiness count, present days, and half-day computations by individual employee.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <select
                value={attendanceMonth}
                onChange={(e) => setAttendanceMonth(Number(e.target.value))}
                className="input-field text-xs py-1"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
              <select
                value={attendanceYear}
                onChange={(e) => setAttendanceYear(Number(e.target.value))}
                className="input-field text-xs py-1"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportAttendance}
              className="btn-success w-full justify-center text-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Summary CSV
            </button>
          </div>
        </div>

        {/* Organizational Compliance Report */}
        <div className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Workforce Compliance Statement</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official summary of corporate headcount distribution, department managers, and system audit trail.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => window.print()}
              className="btn-secondary w-full justify-center text-xs"
            >
              <Printer className="w-4 h-4" /> Print System Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

