// =====================================================
// PROFESSIONAL ADMIN DASHBOARD
// Xainik Platform - Professional Rewrite
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  User,
  Pitch,
  Endorsement,
  Donation,
  Invoice,
  Receipt
} from '@/types/domain';
import {
  USER_ROLES,
  PITCH_STATUSES,
  INVOICE_STATUSES,
  NOTIFICATION_STATUSES
} from '@/types/domain';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// DASHBOARD STATISTICS COMPONENT
// =====================================================

interface DashboardStats {
  totalUsers: number;
  totalPitches: number;
  totalEndorsements: number;
  totalDonations: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

function DashboardStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Pitches</h3>
        <p className="text-3xl font-bold text-green-600">{stats.totalPitches}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Endorsements</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.totalEndorsements}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Donations</h3>
        <p className="text-3xl font-bold text-orange-600">{stats.totalDonations}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
        <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
        <p className="text-3xl font-bold text-indigo-600">{stats.activeSubscriptions}</p>
      </div>
    </div>
  );
}

// =====================================================
// DATA TABLE COMPONENT
// =====================================================

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
  title: string;
}

function DataTable<T>({ data, columns, title }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// MAIN ADMIN DASHBOARD COMPONENT
// =====================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPitches: 0,
    totalEndorsements: 0,
    totalDonations: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const [
        { count: userCount },
        { count: pitchCount },
        { count: endorsementCount },
        { count: donationCount },
        { count: subscriptionCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('pitches').select('*', { count: 'exact', head: true }),
        supabase.from('endorsements').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true })
      ]);

      // Calculate total revenue from donations
      const { data: donationData } = await supabase
        .from('donations')
        .select('amount_cents, currency');

      const totalRevenue = donationData?.reduce((sum, donation) => {
        if (donation.currency === 'INR') {
          return sum + (donation.amount_cents / 100);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalPitches: pitchCount || 0,
        totalEndorsements: endorsementCount || 0,
        totalDonations: donationCount || 0,
        totalRevenue: Math.round(totalRevenue),
        activeSubscriptions: subscriptionCount || 0
      });

      // Fetch recent data
      const [
        { data: recentUsers },
        { data: recentPitches },
        { data: recentDonations },
        { data: recentInvoices }
      ] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('pitches').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      setUsers(recentUsers || []);
      setPitches(recentPitches || []);
      setDonations(recentDonations || []);
      setInvoices(recentInvoices || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <DashboardStats stats={stats} />
        
        <DataTable
          data={users.slice(0, 10)}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
          ]}
          title="Recent Users"
        />
        
        <DataTable
          data={pitches.slice(0, 10)}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Title' },
            { key: 'user_id', label: 'User ID' },
            { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
          ]}
          title="Recent Pitches"
        />
        
        <DataTable
          data={donations.slice(0, 10)}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'amount', label: 'Amount', render: (value) => `₹${value}` },
            { key: 'currency', label: 'Currency' },
            { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
          ]}
          title="Recent Donations"
        />
        
        <DataTable
          data={invoices.slice(0, 10)}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'amount', label: 'Amount', render: (value) => `₹${value}` },
            { key: 'status', label: 'Status' },
            { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
          ]}
          title="Recent Invoices"
        />
      </div>
    </div>
  );
}
