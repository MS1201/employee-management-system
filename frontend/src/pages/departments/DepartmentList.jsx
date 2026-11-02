import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Edit,
  Trash2,
  UserCheck,
  Search
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const DepartmentList = () => {
  const { isSuperAdmin, isHR } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', head: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Members modal
  const [viewMembersModal, setViewMembersModal] = useState(false);
  const [activeDeptDetails, setActiveDeptDetails] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees?limit=100'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedDept(null);
    setFormData({ name: '', description: '', head: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      head: dept.head?._id || dept.head || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...formData };
    if (!payload.head) delete payload.head;

    try {
      if (selectedDept) {
        await api.put(`/departments/${selectedDept._id}`, payload);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', payload);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/departments/${deptToDelete._id}`);
      toast.success('Department deleted');
      setIsDeleteOpen(false);
      setDeptToDelete(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewMembers = async (deptId) => {
    try {
      const res = await api.get(`/departments/${deptId}`);
      if (res.data.success) {
        setActiveDeptDetails(res.data.data);
        setViewMembersModal(true);
      }
    } catch (err) {
      toast.error('Failed to load members');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize corporate functional units, team leads, and division workforce counts.
          </p>
        </div>

        {isHR && (
          <button onClick={handleOpenCreate} className="btn-primary text-xs">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first corporate division or business unit."
          action={
            isHR && (
              <button onClick={handleOpenCreate} className="btn-primary text-xs">
                <Plus className="w-4 h-4" /> Add Department
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div key={dept._id} className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {isHR && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Department"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => { setDeptToDelete(dept); setIsDeleteOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{dept.name}</h3>
                <span className="text-[10px] font-mono text-slate-400 block mb-2">{dept.departmentId}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Department Head:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary-500" /> Total Staff:
                  </span>
                  <button
                    onClick={() => handleViewMembers(dept._id)}
                    className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                  >
                    {dept.employeeCount || 0} Member{dept.employeeCount !== 1 ? 's' : ''} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDept ? 'Edit Department' : 'Create New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Information Technology"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              placeholder="Brief summary of responsibilities and scope..."
            />
          </div>

          <div>
            <label className="label">Department Head (Manager)</label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="input-field"
            >
              <option value="">Select Manager</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.designation || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs"
            >
              {submitting ? 'Saving...' : (selectedDept ? 'Update Department' : 'Create Department')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Department Members Modal */}
      <Modal
        isOpen={viewMembersModal}
        onClose={() => setViewMembersModal(false)}
        title={activeDeptDetails ? `${activeDeptDetails.name} Team Members` : 'Members'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeDeptDetails?.description || 'Department members list'}
          </p>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {!activeDeptDetails?.employees || activeDeptDetails.employees.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No employees currently assigned to this department.</p>
            ) : (
              activeDeptDetails.employees.map((emp) => (
                <div key={emp._id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-[10px] text-slate-400">{emp.designation || 'Staff'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{emp.employeeId}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name}? Note that departments with assigned employees cannot be removed until staff are reassigned.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default DepartmentList;

