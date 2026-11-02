import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  FileText,
  AlertCircle
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

export const LeaveList = () => {
  const { user, isHR } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Apply Leave Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyData, setApplyData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Action review modal (Approve / Reject)
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const myEmpId = user?.employee?._id || user?.employee;
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(!isHR && myEmpId && { employeeId: myEmpId }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { leaveType: typeFilter }),
      });

      const res = await api.get(`/leaves?${params.toString()}`);
      if (res.data.success) {
        setLeaves(res.data.data);
        setTotalPages(Math.ceil((res.data.total || 1) / 10));
      }

      // Fetch balance for current user
      if (myEmpId) {
        const balRes = await api.get(`/leaves/balance/${myEmpId}`);
        if (balRes.data.success) {
          setBalance(balRes.data.data);
        }
      }
    } catch (err) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [currentPage, statusFilter, typeFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const myEmpId = user?.employee?._id || user?.employee;
    if (!myEmpId) {
      toast.error('Employee record not linked');
      return;
    }

    setApplyLoading(true);
    try {
      await api.post('/leaves', {
        ...applyData,
        employee: myEmpId,
      });
      toast.success('Leave application submitted!');
      setIsApplyOpen(false);
      setApplyData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaveData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      await api.put(`/leaves/${selectedLeave._id}/status`, {
        status: reviewAction,
        ...(reviewAction === 'rejected' && { rejectionReason }),
      });
      toast.success(`Leave request ${reviewAction}!`);
      setIsReviewOpen(false);
      setSelectedLeave(null);
      setRejectionReason('');
      fetchLeaveData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process leave');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    try {
      await api.put(`/leaves/${leaveId}/cancel`);
      toast.success('Leave cancelled');
      fetchLeaveData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Request time off, track annual allocations, and manage corporate approval workflows.
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances Cards */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'casual', label: 'Casual Leave', data: balance.casual, color: 'text-indigo-600' },
            { key: 'sick', label: 'Sick Leave', data: balance.sick, color: 'text-rose-600' },
            { key: 'earned', label: 'Earned Leave', data: balance.earned, color: 'text-emerald-600' },
            { key: 'paid', label: 'Paid Leave', data: balance.paid, color: 'text-sky-600' },
            { key: 'unpaid', label: 'Unpaid Leave', data: balance.unpaid, color: 'text-amber-600' },
            { key: 'other', label: 'Other Leave', data: balance.other, color: 'text-purple-600' },
          ].map((item) => (
            <div key={item.key} className="card p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.label}</span>
              <div className="mt-2">
                <span className={`text-xl font-black ${item.color}`}>
                  {(item.data?.total || 0) - (item.data?.used || 0)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">/ {item.data?.total || 0} days</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="input-field w-36 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="input-field w-36 text-xs"
        >
          <option value="">All Types</option>
          <option value="casual">Casual</option>
          <option value="sick">Sick</option>
          <option value="earned">Earned</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Leaves Table */}
      {loading ? (
        <LoadingSpinner text="Fetching leave applications..." />
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No leave requests found"
          description="There are currently no active or historical leave applications matching your filter."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper border-none rounded-none">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Leave Type</th>
                  <th className="table-th">Period</th>
                  <th className="table-th">Days</th>
                  <th className="table-th">Reason</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({leave.employee?.employeeId})
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="capitalize font-semibold text-xs text-slate-700 dark:text-slate-300">
                        {leave.leaveType} Leave
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-600 dark:text-slate-400">
                      {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="table-td font-bold text-slate-800 dark:text-slate-100">
                      {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                    </td>
                    <td className="table-td max-w-xs truncate text-xs text-slate-500" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="table-td">
                      <Badge
                        variant={
                          leave.status === 'approved'
                            ? 'green'
                            : leave.status === 'pending'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isHR && leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelectedLeave(leave); setReviewAction('approved'); setIsReviewOpen(true); }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelectedLeave(leave); setReviewAction('rejected'); setIsReviewOpen(true); }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {!isHR && leave.status === 'pending' && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Leave"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="label">Leave Type *</label>
            <select
              required
              value={applyData.leaveType}
              onChange={(e) => setApplyData({ ...applyData, leaveType: e.target.value })}
              className="input-field"
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="paid">Paid Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="other">Other Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                required
                value={applyData.startDate}
                onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                type="date"
                required
                value={applyData.endDate}
                onChange={(e) => setApplyData({ ...applyData, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              value={applyData.reason}
              onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
              placeholder="Provide a clear description of the reason..."
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyLoading}
              className="btn-primary text-xs"
            >
              {applyLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={reviewAction === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You are about to <span className="font-bold uppercase">{reviewAction}</span> the leave application for{' '}
            <span className="font-semibold">{selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}</span> ({selectedLeave?.totalDays} days).
          </p>

          {reviewAction === 'rejected' && (
            <div>
              <label className="label">Rejection Reason</label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for decision..."
                className="input-field"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReviewSubmit}
              disabled={reviewLoading}
              className={reviewAction === 'approved' ? 'btn-success text-xs' : 'btn-danger text-xs'}
            >
              {reviewLoading ? 'Processing...' : `Confirm ${reviewAction}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveList;

