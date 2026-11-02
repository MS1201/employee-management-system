import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import EmployeeFormModal from './EmployeeFormModal';
import toast from 'react-hot-toast';

export const EmployeeList = () => {
  const { isSuperAdmin, isHR } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(department && { department }),
        ...(status && { status }),
      });
      const res = await api.get(`/employees?${params.toString()}`);
      if (res.data.success) {
        setEmployees(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, department, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Employee directory exported');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employees/${employeeToDelete._id}`);
      toast.success('Employee deleted successfully');
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your complete staff, credentials, profiles, and departmental assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs"
            title="Download CSV report"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          {isHR && (
            <button
              onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, email, or designation..."
            className="input-field pl-10"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setCurrentPage(1); }}
            className="input-field w-40 text-xs"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            className="input-field w-36 text-xs"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Fetching employee records..." />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Try modifying your search criteria or add a new team member."
          action={
            isHR && (
              <button
                onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}
                className="btn-primary text-xs"
              >
                <Plus className="w-4 h-4" /> Add New Employee
              </button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper border-none rounded-none">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">ID</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Designation</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td font-mono text-xs text-slate-500 font-medium">
                      {emp.employeeId}
                    </td>
                    <td className="table-td">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {emp.department?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="table-td text-slate-600 dark:text-slate-400">
                      {emp.designation || 'N/A'}
                    </td>
                    <td className="table-td">
                      <span className="capitalize text-xs font-medium text-slate-500">
                        {emp.employmentType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-td">
                      <Badge
                        variant={
                          emp.employmentStatus === 'active'
                            ? 'green'
                            : emp.employmentStatus === 'on_leave'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {emp.employmentStatus?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/employees/${emp._id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isHR && (
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsFormOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => { setEmployeeToDelete(emp); setIsDeleteOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <EmployeeFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          employee={selectedEmployee}
          onSuccess={fetchEmployees}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete employee ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action will permanently remove their records.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default EmployeeList;

