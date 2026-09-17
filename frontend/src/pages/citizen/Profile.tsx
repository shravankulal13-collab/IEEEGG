// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Medical Profile & Emergency Contacts
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Phone, Heart, ShieldCheck, Edit3, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Saishree Shet',
    citizenId: 'CIT-88492',
    bloodGroup: 'O Positive (O+)',
    allergies: 'Penicillin, Latex',
    chronicConditions: 'Mild Asthma (Inhaler Prescribed)',
    primaryContactName: 'Next of Kin / Spouse',
    primaryContactPhone: '+91 91234 56789',
    secondaryContactName: 'Emergency Physician',
    secondaryContactPhone: '+91 98765 43210',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <PageHeader
          pillTag="Citizen Medical ID"
          title="Personal Emergency Profile"
          subtitle="Pre-configured medical triage record, blood group specifications, and authorized emergency contacts."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to SOS Portal
            </Button>
          }
        />

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Emergency medical profile updated successfully! Changes synced to dispatch database.</span>
          </div>
        )}

        {/* User Identity Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0B1B4F] text-white flex items-center justify-center text-xl font-black shadow-md border border-blue-900">
              {profile.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{profile.fullName}</h2>
              <p className="text-xs text-slate-500 font-mono">Citizen ID: {profile.citizenId}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Location & Identity Verified</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Cancel Edit' : 'Edit Medical ID'}</span>
            </button>
          </div>
        </div>

        {/* Form or Read-Only Card Grid */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Edit Medical Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={profile.allergies}
                    onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Chronic Medical Conditions</label>
                  <input
                    type="text"
                    value={profile.chronicConditions}
                    onChange={(e) => setProfile({ ...profile, chronicConditions: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Edit Emergency Contacts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    value={profile.primaryContactName}
                    onChange={(e) => setProfile({ ...profile, primaryContactName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Contact Phone</label>
                  <input
                    type="text"
                    value={profile.primaryContactPhone}
                    onChange={(e) => setProfile({ ...profile, primaryContactPhone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Secondary Contact Name</label>
                  <input
                    type="text"
                    value={profile.secondaryContactName}
                    onChange={(e) => setProfile({ ...profile, secondaryContactName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Secondary Contact Phone</label>
                  <input
                    type="text"
                    value={profile.secondaryContactPhone}
                    onChange={(e) => setProfile({ ...profile, secondaryContactPhone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-lift p-6">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Medical & Triage Profile</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase">Blood Group</span>
                  <span className="font-black text-slate-900 text-sm">{profile.bloodGroup}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase">Allergies</span>
                  <span className="font-black text-slate-900 text-sm">{profile.allergies}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 col-span-2">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase">Chronic Conditions</span>
                  <span className="font-bold text-slate-900 text-xs">{profile.chronicConditions}</span>
                </div>
              </div>
            </Card>

            <Card className="hover-lift p-6">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Emergency SOS Contacts</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-900">{profile.primaryContactName}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{profile.primaryContactPhone}</p>
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Primary
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-900">{profile.secondaryContactName}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{profile.secondaryContactPhone}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                    Secondary
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Profile;
