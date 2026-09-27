// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Primary Portal - Clean Instagram Style Incident Feed
// SYSTEM: ResQGrid Life-Saver Star Karma & Community Emergency Dispatch
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useIncidentStore } from '../../store/incidentStore';
import { allocateOptimalEmergencyResources, type EmergencyCategory } from '../../services/hospitalAllocation.service';
import { AppShell } from '../../components/layout/AppShell';
import { FeedCard } from '../../components/feed/FeedCard';
import { StoriesBar } from '../../components/feed/StoriesBar';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { LeaderboardModal } from '../../components/feed/LeaderboardModal';
import {
  Camera,
  Radio,
  Star,
  Trophy,
  Heart,
  MapPin,
  Flame,
  Activity,
  HeartPulse,
  Brain,
  Car,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const EmergencyHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const geo = useGeolocation(true);
  const { createIncident } = useIncidentStore();

  const {
    posts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    userStats,
  } = useFeedStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTriggeringSos, setIsTriggeringSos] = useState(false);

  // Clear legacy cache keys so browser loads updated authentic imagery
  React.useEffect(() => {
    try {
      localStorage.removeItem('resqgrid_social_feed_storage');
      localStorage.removeItem('resqgrid_social_feed_storage_v2');
      localStorage.removeItem('resqgrid_social_feed_storage_v3');
    } catch {
      // ignore
    }
  }, []);

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'all' || post.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const handleInstantSos = async (categoryId?: EmergencyCategory) => {
    setIsTriggeringSos(true);
    try {
      const lat = geo.latitude || 12.9716;
      const lng = geo.longitude || 77.5946;
      const category = categoryId || 'medical';

      const allocation = await allocateOptimalEmergencyResources(
        { latitude: lat, longitude: lng },
        category
      );

      const categoryTitles: Record<string, string> = {
        cardiac: 'Cardiac Emergency Assistance',
        stroke: 'Acute Stroke Medical Assistance',
        trauma: 'Severe Trauma Injury Assistance',
        accident: 'Road Collision Assistance',
        respiratory: 'Respiratory Distress Assistance',
        fire: 'Burns and Fire Medical Assistance',
        medical: 'Emergency SOS Medical Assistance',
      };
      const title = categoryTitles[category] || `Emergency SOS ${category.toUpperCase()} Medical Response`;
      const reporterName = user?.fullName || 'Citizen Emergency Caller';
      const reporterPhone = '+91 98765 43210';

      const incident = await createIncident({
        emergencyType: category as any,
        title: title,
        description: `Rapid dispatch initiated for ${title}. ${allocation.rationale}`,
        latitude: lat,
        longitude: lng,
        address: geo.address || 'Bengaluru Metro Area (GPS Pinpoint)',
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        assigned_hospital_id: allocation.hospital?.id,
        assigned_hospital_name: allocation.hospital?.name,
        assigned_ambulance_id: allocation.ambulance?.id,
        assigned_ambulance_number: allocation.ambulance?.ambulance_number,
        severity: 'critical',
      });

      localStorage.setItem('resqgrid_active_incident_id', incident.id);
      localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(incident));
      localStorage.setItem('resqgrid_active_incident_timestamp', String(Date.now()));
      useIncidentStore.getState().setActiveIncident(incident);

      setIsTriggeringSos(false);
      navigate(`/citizen/confirm?incidentId=${incident.id}&type=${category}`);
    } catch {
      setIsTriggeringSos(false);
      navigate('/citizen/report', { state: { category: categoryId || 'medical' } });
    }
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="max-w-6xl mx-auto space-y-4 pb-16 font-sans">
        
        {/* 1. Instagram Stories Carousel at Top */}
        <StoriesBar
          onAddPost={() => setIsCreateModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* 2. Sleek Filter Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          {/* Clean Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'accident', label: 'Accidents' },
              { id: 'traffic', label: 'Traffic' },
              { id: 'life_saved', label: 'Lives Saved' },
              { id: 'corridor', label: 'Corridors' },
              { id: 'blood_donor', label: 'Blood Needs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-white text-slate-950 font-bold shadow'
                    : 'bg-[#0B1B4F]/80 text-slate-300 hover:text-white border border-[#1E3A8A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Create Post & 1-Tap SOS Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Post Incident</span>
            </button>

            <button
              onClick={() => handleInstantSos('cardiac')}
              disabled={isTriggeringSos}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <Radio className="w-3 h-3 text-rose-400" />
              <span>{isTriggeringSos ? 'Dispatching...' : '1-Tap SOS'}</span>
            </button>
          </div>
        </div>

        {/* 3. Main Two-Column Layout: Central Clean Feed + Minimal Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Central Feed Column (Instagram Single-Column Stream) */}
          <div className="lg:col-span-8 space-y-5 max-w-2xl mx-auto w-full">
            {filteredPosts.length === 0 ? (
              <div className="p-10 text-center bg-[#0B1B4F]/90 rounded-2xl border border-[#1E3A8A] text-white">
                <Camera className="w-10 h-10 mx-auto text-slate-400 mb-2.5" />
                <h3 className="text-sm font-bold text-white">No Posts in this Category</h3>
                <p className="text-xs text-slate-300 mt-1 mb-3">
                  Be the first to share a live incident or traffic condition update.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-1.5 bg-red-600 text-white font-semibold text-xs rounded-full shadow cursor-pointer"
                >
                  Create Post
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <FeedCard key={post.id} post={post} />
              ))
            )}
          </div>

          {/* Minimalist Right Sidebar (Instagram Suggestion Bar Style) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-20">
            
            {/* User Profile Mini Card */}
            <div className="p-3.5 bg-[#0B1B4F]/90 rounded-2xl border border-[#1E3A8A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-sky-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {user?.fullName || 'Citizen Responder'}
                  </h4>
                  <p className="text-[11px] text-amber-300 font-medium mt-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{userStats.stars} Stars</span>
                    <span className="text-slate-400">•</span>
                    <span>{userStats.livesSaved} Saved</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                Top Ranks
              </button>
            </div>

            {/* 1-Tap Rapid Emergency Dispatch */}
            <div className="p-3.5 bg-[#0B1B4F]/90 rounded-2xl border border-[#1E3A8A] text-white">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Emergency Dispatch
                </h4>
                <span className="text-[10px] text-emerald-400 font-medium">Auto-Allocate</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cardiac', label: 'Cardiac', icon: <HeartPulse className="w-3.5 h-3.5 text-red-400" /> },
                  { id: 'stroke', label: 'Stroke', icon: <Brain className="w-3.5 h-3.5 text-indigo-400" /> },
                  { id: 'trauma', label: 'Trauma', icon: <Activity className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: 'accident', label: 'Accident', icon: <Car className="w-3.5 h-3.5 text-purple-400" /> },
                  { id: 'respiratory', label: 'Breathing', icon: <AlertTriangle className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: 'fire', label: 'Burns/Fire', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleInstantSos(cat.id as any)}
                    className="p-2 bg-slate-900/70 hover:bg-red-600/30 border border-white/10 hover:border-red-500 rounded-xl text-xs font-medium text-left transition flex items-center gap-2 cursor-pointer"
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top First Responders */}
            <div className="p-3.5 bg-[#0B1B4F]/90 rounded-2xl border border-[#1E3A8A] text-white">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Top First Responders
                </h4>
                <button
                  onClick={() => setIsLeaderboardOpen(true)}
                  className="text-xs font-semibold text-amber-300 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Dr. Priya Hegde', role: 'Surgeon', stars: 85, avatar: 'https://images.unsplash.com/photo-1594824813598-a28a30e8c891?auto=format&fit=crop&w=200&q=80' },
                  { name: 'Paramedic Ananya', role: 'ALS Lead', stars: 62, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
                  { name: 'Rajesh Kumar', role: 'First Responder', stars: 48, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={h.avatar} alt={h.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                      <div>
                        <p className="font-semibold text-white leading-none">{h.name}</p>
                        <span className="text-[10px] text-slate-400">{h.role}</span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-amber-300 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-300" />
                      {h.stars}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helplines */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-white flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">Helplines:</span>
              <a href="tel:108" className="text-red-400 hover:underline">108 Ambulance</a>
              <span>•</span>
              <a href="tel:112" className="text-sky-400 hover:underline">112 Police</a>
              <span>•</span>
              <a href="tel:101" className="text-orange-400 hover:underline">101 Fire</a>
            </div>

          </div>
        </div>
      </div>

      {/* Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </AppShell>
  );
};

export default EmergencyHome;
