import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Upload,
  Download,
  Trash2,
  FileText,
  Filter,
  CheckCircle,
  File,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export const DocumentList = () => {
  const { user, isHR, isSuperAdmin } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'resume',
    employee: '',
    description: '',
  });

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const myEmpId = user?.employee?._id || user?.employee;
      const params = new URLSearchParams({
        ...(!isHR && myEmpId && { employeeId: myEmpId }),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const res = await api.get(`/documents?${params.toString()}`);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load documents');
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
    fetchDocuments();
  }, [selectedCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const targetEmpId = isHR ? uploadData.employee : (user?.employee?._id || user?.employee);
    if (!targetEmpId) {
      toast.error('Target employee is required');
      return;
    }

    setUploadLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('name', uploadData.name);
    data.append('category', uploadData.category);
    data.append('employee', targetEmpId);
    data.append('description', uploadData.description);

    try {
      await api.post('/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully');
      setIsUploadOpen(false);
      setFile(null);
      setUploadData({ name: '', category: 'resume', employee: '', description: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    try {
      await api.delete(`/documents/${docToDelete._id}`);
      toast.success('Document removed');
      setIsDeleteOpen(false);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Encrypted file storage for resumes, offer letters, government IDs, and compliance papers.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="btn-primary text-xs"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: '', label: 'All Documents' },
          { id: 'resume', label: 'Resumes' },
          { id: 'offer_letter', label: 'Offer Letters' },
          { id: 'joining_document', label: 'Joining Docs' },
          { id: 'identity', label: 'Identity / KYC' },
          { id: 'certificate', label: 'Certificates' },
          { id: 'other', label: 'Other Files' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving employee document vault..." />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title="No documents uploaded"
          description="Upload resumes, contracts, credentials, and verification proofs."
          action={
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn-primary text-xs"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="card p-4 flex flex-col justify-between hover:shadow-card-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="blue">{doc.category?.replace('_', ' ')}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.fileName}</p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`/api/documents/${doc._id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs px-2.5 py-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>

                {isHR && (
                  <button
                    onClick={() => { setDocToDelete(doc); setIsDeleteOpen(true); }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Employee Document"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="label">Document Title *</label>
            <input
              type="text"
              required
              value={uploadData.name}
              onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
              placeholder="e.g. Master Resume 2024"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Document Category *</label>
            <select
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              className="input-field"
            >
              <option value="resume">Resume / CV</option>
              <option value="offer_letter">Offer Letter</option>
              <option value="joining_document">Joining Document</option>
              <option value="identity">Identity / Passport / PAN / Aadhar</option>
              <option value="certificate">Certification / Degree</option>
              <option value="other">Other Document</option>
            </select>
          </div>

          {isHR && (
            <div>
              <label className="label">Assign to Employee *</label>
              <select
                required
                value={uploadData.employee}
                onChange={(e) => setUploadData({ ...uploadData, employee: e.target.value })}
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
          )}

          <div>
            <label className="label">Choose File * (PDF, Images, DOCX up to 10MB)</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field p-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading}
              className="btn-primary text-xs"
            >
              {uploadLoading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message="Are you sure you want to delete this document from the vault? This cannot be restored."
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default DocumentList;

