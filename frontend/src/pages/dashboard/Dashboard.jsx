import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Building2,
  Calendar,
  Gift,
  Award,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const Dashboard = () => {
  const { user, isHR } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      if (isHR) {
        const res = await api.get('/employees/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      }
      // Check user's today attendance status
      if (user?.employee?._id || user?.employee) {
        const empId = user.employee?._id || user.employee;
        const res = await api.get(`/attendance?employeeId=${empId}&limit=1`);
        if (res.data.success && res.data.data.length > 0) {
          const latest = res.data.data[0];
          const isToday = new Date(latest.date).toDateString() === new Date().toDateString();
          if (isToday) setAttendanceToday(latest);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isHR, user]);

  const handleCheckIn = async () => {
    const empId = user?.employee?._id || user?.employee;
    if (!empId) {
      toast.error('No employee profile linked to this user');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/checkin', { employeeId: empId });
      if (res.data.success) {
        setAttendanceToday(res.data.data);
        toast.success('Successfully checked in!');
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
        setAttendanceToday(res.data.data);
        toast.success('Successfully checked out!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard analytics..." />;

  const statCards = [
    { title: 'Total Employees', value: stats?.total || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { title: 'Active Workforce', value: stats?.active || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'New This Month', value: stats?.newThisMonth || 0, icon: UserPlus, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40' },
    { title: 'On Leave Today', value: stats?.onLeave || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { title: 'Total Departments', value: stats?.totalDepts || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { title: 'Inactive/Terminated', value: stats?.inactive || 0, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  const deptChartData = stats?.departmentStats?.map(d => ({
    name: d.name,
    count: d.count
  })) || [];

  const statusChartData = stats?.statusDistribution?.map(s => ({
    name: s._id ? s._id.replace('_', ' ') : 'Unknown',
    value: s.count
  })) || [];

  const monthlyJoinData = stats?.monthlyJoining?.map(m => ({
    month: `${m._id.month}/${m._id.year}`,
    joined: m.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-primary-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="badge-purple bg-indigo-500/30 text-indigo-200 border-none mb-2">
              Enterprise Dashboard
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {isHR 
                ? 'Overview of your corporate workforce, real-time analytics, and operational metrics.'
                : 'Welcome to your employee self-service portal. Manage your attendance, leaves, and records.'}
            </p>
          </div>

          {/* Quick Check-in / Out Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary-300" /> Today's Attendance
              </span>
              <span className="text-xs font-medium text-white mt-0.5">
                {attendanceToday?.checkIn 
                  ? `In: ${new Date(attendanceToday.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Not checked in yet'}
              </span>
            </div>

            {!attendanceToday?.checkIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="btn-success text-xs px-3.5 py-1.5"
              >
                Check In
              </button>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="btn-primary text-xs px-3.5 py-1.5"
              >
                Check Out
              </button>
            ) : (
              <span className="badge-green text-xs px-2.5 py-1">Completed</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Stat Cards */}
      {isHR && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="card p-4 flex flex-col justify-between hover:shadow-card-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{card.value}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{card.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      {isHR && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Breakdown */}
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
              <span>Department Headcount</span>
              <span className="text-xs font-normal text-slate-400">Total Assigned</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
              Workforce Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {statusChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="capitalize">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Joining Trend & Tables */}
      {isHR && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Joining Trend Area Chart */}
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
              Monthly Recruitment Velocity
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyJoinData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="joinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="joined" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#joinGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Celebrations & Anniversaries */}
          <div className="card p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-500" /> Upcoming Birthdays
              </h3>
              <div className="space-y-2.5 mb-6">
                {!stats?.upcomingBirthdays || stats.upcomingBirthdays.length === 0 ? (
                  <p className="text-xs text-slate-400">No birthdays in the next 30 days</p>
                ) : (
                  stats.upcomingBirthdays.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {b.firstName} {b.lastName}
                      </span>
                      <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                        in {b.daysUntil} day{b.daysUntil > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Work Anniversaries
              </h3>
              <div className="space-y-2.5">
                {!stats?.upcomingAnniversaries || stats.upcomingAnniversaries.length === 0 ? (
                  <p className="text-xs text-slate-400">No anniversaries in next 30 days</p>
                ) : (
                  stats.upcomingAnniversaries.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {a.firstName} {a.lastName}
                      </span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {a.years} Year{a.years > 1 ? 's' : ''} milestone
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Employees Table */}
      {isHR && stats?.recentEmployees && stats.recentEmployees.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Recently Onboarded Employees
            </h3>
          </div>
          <div className="table-wrapper">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">ID</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Designation</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmployees.map((emp) => (
                  <tr key={emp._id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-xs font-mono text-slate-500">{emp.employeeId}</td>
                    <td className="table-td">{emp.department?.name || 'Unassigned'}</td>
                    <td className="table-td">{emp.designation || 'N/A'}</td>
                    <td className="table-td">
                      <Badge variant={emp.employmentStatus === 'active' ? 'green' : 'gray'}>
                        {emp.employmentStatus}
                      </Badge>
                    </td>
                    <td className="table-td text-xs text-slate-500">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

