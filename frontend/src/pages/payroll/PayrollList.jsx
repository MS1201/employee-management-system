import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Printer,
  Download,
  Filter,
  CheckCircle,
  Clock,
  Building,
  ShieldCheck,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export const PayrollList = () => {
  const { user, isHR, isSuperAdmin } = useAuth();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Create Payroll Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 5000,
    allowances: { hra: 1000, transport: 300, medical: 200, special: 500, other: 0 },
    bonuses: 0,
    deductions: { pf: 600, esi: 150, tax: 500, other: 0 },
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
  });

  // Payslip View Modal
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        month,
        year,
      });
      const [payRes, sumRes] = await Promise.all([
        api.get(`/payroll?${params.toString()}`),
        isHR ? api.get(`/payroll/summary?month=${month}&year=${year}`) : Promise.resolve({ data: { success: false } }),
      ]);

      if (payRes.data.success) {
        setPayrolls(payRes.data.data);
        setTotalPages(Math.ceil((payRes.data.total || 1) / 10));
      }
      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load payroll data');
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
    fetchPayrolls();
  }, [currentPage, month, year]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/payroll', formData);
      toast.success('Payroll record generated');
      setIsCreateOpen(false);
      fetchPayrolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payroll');
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compensation distribution, tax deductions, benefits breakdown, and digital payslips.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" /> Generate Payroll Record
          </button>
        )}
      </div>

      {/* Summary Cards for HR */}
      {isHR && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Total Disbursed Net</span>
            <p className="text-2xl font-black text-emerald-600">${(summary.totalNet || 0).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Gross Incurred</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">${(summary.totalGross || 0).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Total Statutory Deductions</span>
            <p className="text-2xl font-black text-rose-600">${(summary.totalDeductions || 0).toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Bonuses Issued</span>
            <p className="text-2xl font-black text-indigo-600">${(summary.totalBonuses || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setCurrentPage(1); }}
          className="input-field w-36 text-xs"
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setCurrentPage(1); }}
          className="input-field w-28 text-xs"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving payroll ledgers..." />
      ) : payrolls.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payroll records"
          description="There are no payslips generated for this cycle."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper border-none rounded-none">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Cycle</th>
                  <th className="table-th">Basic Pay</th>
                  <th className="table-th">Gross Pay</th>
                  <th className="table-th">Deductions</th>
                  <th className="table-th">Net Salary</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p._id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {p.employee?.firstName} {p.employee?.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">({p.employee?.employeeId})</span>
                      </div>
                    </td>
                    <td className="table-td text-xs font-medium text-slate-600 dark:text-slate-300">
                      {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                    </td>
                    <td className="table-td font-semibold">${p.basicSalary?.toLocaleString()}</td>
                    <td className="table-td font-semibold text-slate-700 dark:text-slate-200">${p.grossSalary?.toLocaleString()}</td>
                    <td className="table-td font-semibold text-rose-600">-${p.totalDeductions?.toLocaleString()}</td>
                    <td className="table-td font-black text-emerald-600 text-sm">${p.netSalary?.toLocaleString()}</td>
                    <td className="table-td">
                      <Badge variant={p.paymentStatus === 'paid' ? 'green' : 'yellow'}>
                        {p.paymentStatus}
                      </Badge>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => { setSelectedPayroll(p); setIsPayslipOpen(true); }}
                        className="btn-secondary text-xs px-2.5 py-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Slip
                      </button>
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

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Payroll Record"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Employee *</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
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
              <label className="label">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="input-field"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="label">Basic Salary ($) *</label>
              <input
                type="number"
                required
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Performance Bonus ($)</label>
              <input
                type="number"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Allowances</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">HRA</label>
                <input
                  type="number"
                  value={formData.allowances.hra}
                  onChange={(e) => setFormData({ ...formData, allowances: { ...formData.allowances, hra: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Transport</label>
                <input
                  type="number"
                  value={formData.allowances.transport}
                  onChange={(e) => setFormData({ ...formData, allowances: { ...formData.allowances, transport: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Medical</label>
                <input
                  type="number"
                  value={formData.allowances.medical}
                  onChange={(e) => setFormData({ ...formData, allowances: { ...formData.allowances, medical: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Special</label>
                <input
                  type="number"
                  value={formData.allowances.special}
                  onChange={(e) => setFormData({ ...formData, allowances: { ...formData.allowances, special: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deductions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Provident Fund (PF)</label>
                <input
                  type="number"
                  value={formData.deductions.pf}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, pf: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">ESI Insurance</label>
                <input
                  type="number"
                  value={formData.deductions.esi}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, esi: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Income Tax Deduction</label>
                <input
                  type="number"
                  value={formData.deductions.tax}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, tax: Number(e.target.value) } })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="btn-primary text-xs"
            >
              {createLoading ? 'Generating...' : 'Confirm & Save Payroll'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal View / Printable */}
      <Modal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        title="Official Salary Payslip"
        maxWidth="max-w-2xl"
      >
        {selectedPayroll && (
          <div className="space-y-6 print:p-6 print:m-0" id="printable-payslip">
            {/* Payslip Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">NexusEMS Corporation</h2>
                  <p className="text-[11px] text-slate-500">Official Monthly Earnings Statement</p>
                </div>
              </div>

              <div className="text-right">
                <span className="badge-green text-xs font-mono uppercase">{selectedPayroll.paymentStatus}</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  Pay Cycle: {new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayroll.year}
                </p>
              </div>
            </div>

            {/* Employee summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block">Employee Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedPayroll.employee?.firstName} {selectedPayroll.employee?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Employee ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {selectedPayroll.employee?.employeeId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Designation:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedPayroll.employee?.designation || 'Staff'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Mode:</span>
                <span className="font-semibold capitalize text-slate-800 dark:text-slate-100">
                  {selectedPayroll.paymentMethod?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="card p-3 border border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-emerald-600 mb-2 border-b pb-1 dark:border-slate-800">Earnings (+)</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-semibold">${selectedPayroll.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-semibold">${selectedPayroll.allowances?.hra?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Allowance</span>
                    <span className="font-semibold">${selectedPayroll.allowances?.transport?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance</span>
                    <span className="font-semibold">${selectedPayroll.allowances?.medical?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Bonus</span>
                    <span className="font-semibold">${selectedPayroll.bonuses?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 dark:border-slate-800">
                    <span>Total Gross</span>
                    <span>${selectedPayroll.grossSalary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="card p-3 border border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-rose-600 mb-2 border-b pb-1 dark:border-slate-800">Deductions (-)</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Provident Fund (PF)</span>
                    <span className="font-semibold">${selectedPayroll.deductions?.pf?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee State Insurance (ESI)</span>
                    <span className="font-semibold">${selectedPayroll.deductions?.esi?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax Deduction</span>
                    <span className="font-semibold">${selectedPayroll.deductions?.tax?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 dark:border-slate-800">
                    <span>Total Deductions</span>
                    <span className="text-rose-600">-${selectedPayroll.totalDeductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300">
                  Net Salary Payable
                </span>
                <p className="text-[11px] text-slate-500">Transferred electronically to employee bank account</p>
              </div>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                ${selectedPayroll.netSalary?.toLocaleString()}
              </span>
            </div>

            {/* Footer print action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="btn-primary text-xs"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayrollList;

