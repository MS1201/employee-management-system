import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Star,
  Target,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Filter
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

export const PerformanceList = () => {
  const { user, isHR, isSuperAdmin } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Create review modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    overallRating: 4,
    categories: {
      productivity: 4,
      quality: 4,
      communication: 4,
      teamwork: 4,
      initiative: 4,
      punctuality: 4,
    },
    feedback: '',
    achievements: '',
    areasOfImprovement: '',
    status: 'submitted',
  });

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const myEmpId = user?.employee?._id || user?.employee;
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(!isHR && myEmpId && { employeeId: myEmpId }),
      });
      const res = await api.get(`/performance?${params.toString()}`);
      if (res.data.success) {
        setReviews(res.data.data);
        setTotalPages(Math.ceil((res.data.total || 1) / 10));
      }
    } catch (err) {
      toast.error('Failed to load performance evaluations');
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
    fetchReviews();
  }, [currentPage]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/performance', formData);
      toast.success('Performance review recorded');
      setIsCreateOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    try {
      await api.delete(`/performance/${reviewToDelete._id}`);
      toast.success('Review deleted');
      setIsDeleteOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-200">{rating}.0</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conduct appraisals, track employee KPI delivery, feedback loops, and competency metrics.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" /> Conduct New Review
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading appraisal records..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No appraisals found"
          description="There are no performance reviews registered yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div key={rev._id} className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {rev.employee?.firstName} {rev.employee?.lastName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {rev.employee?.designation || 'Staff'} • {new Date(rev.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {renderStars(rev.overallRating)}
                </div>

                {/* Radar/Competency Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Productivity</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.productivity || 0}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quality</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.quality || 0}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Communication</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.communication || 0}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teamwork</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.teamwork || 0}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Initiative</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.initiative || 0}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Punctuality</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{rev.categories?.punctuality || 0}/5</span>
                  </div>
                </div>

                {/* Feedback */}
                {rev.feedback && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Manager Feedback
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{rev.feedback}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400">
                  Reviewed by: <strong className="text-slate-600 dark:text-slate-300">{rev.reviewedBy?.firstName} {rev.reviewedBy?.lastName}</strong>
                </span>

                {isSuperAdmin && (
                  <button
                    onClick={() => { setReviewToDelete(rev); setIsDeleteOpen(true); }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Review Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Conduct Employee Performance Appraisal"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
            <label className="label">Overall Rating (1 - 5 Stars) *</label>
            <select
              value={formData.overallRating}
              onChange={(e) => setFormData({ ...formData, overallRating: Number(e.target.value) })}
              className="input-field"
            >
              <option value={5}>5 - Outstanding</option>
              <option value={4}>4 - Exceeds Expectations</option>
              <option value={3}>3 - Meets Expectations</option>
              <option value={2}>2 - Needs Improvement</option>
              <option value={1}>1 - Unsatisfactory</option>
            </select>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category Scores (1 to 5)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['productivity', 'quality', 'communication', 'teamwork', 'initiative', 'punctuality'].map((cat) => (
                <div key={cat}>
                  <label className="text-[10px] capitalize text-slate-400">{cat}</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.categories[cat]}
                    onChange={(e) => setFormData({
                      ...formData,
                      categories: { ...formData.categories, [cat]: Number(e.target.value) }
                    })}
                    className="input-field py-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Manager Feedback & Evaluation Notes</label>
            <textarea
              rows={3}
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              placeholder="Highlight strengths, delivery consistency, and impact..."
              className="input-field"
            />
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
              {createLoading ? 'Submitting...' : 'Record Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appraisal"
        message="Are you sure you want to delete this performance review record?"
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default PerformanceList;

