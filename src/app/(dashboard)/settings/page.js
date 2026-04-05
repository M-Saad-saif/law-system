'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { Spinner } from '@/components/ui';
import { User, Shield, Database, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', barCouncilNo: user?.barCouncilNo || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/api/auth/me', profile);
      await refetch();
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will add demo cases and reminders. Continue?')) return;
    setSeeding(true);
    try {
      const res = await api.post('/api/seed', {});
      toast.success(`Demo data seeded! Login: ${res.credentials?.email} / ${res.credentials?.password}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <h2 className="font-bold text-slate-800 font-display">Profile Information</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input bg-slate-50 cursor-not-allowed" value={user?.email || ''} readOnly />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" placeholder="+92-300-0000000" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Bar Council No.</label>
              <input className="input" placeholder="LHC-XXXX-XXXX" value={profile.barCouncilNo} onChange={e => setProfile({ ...profile, barCouncilNo: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Spinner size="sm" className="text-white" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="font-bold text-slate-800 font-display">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Role</span>
            <span className="text-sm font-semibold text-slate-800 capitalize">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Account Status</span>
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
          </div>
        </div>
      </div>

      {/* Demo Data */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="card p-6 border-amber-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 font-display">Demo Data</h2>
              <p className="text-xs text-slate-400">Development only</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Seed the database with sample cases, clients, and reminders for testing.
          </p>
          <button onClick={handleSeed} disabled={seeding} className="btn-secondary">
            {seeding ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
            Seed Demo Data
          </button>
        </div>
      )}
    </div>
  );
}
