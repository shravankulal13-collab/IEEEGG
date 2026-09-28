// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// MODULE: Citizen Community Live Feed
// SYSTEM: ResQGrid Life-Saver Karma & Verified Community Alerts
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useIncidentStore } from '../../store/incidentStore';
import { allocateOptimalEmergencyResources, type EmergencyCategory } from '../../services/hospitalAllocation.service';
import { AppShell } from '../../components/layout/AppShell';
import { StoriesBar } from '../../components/feed/StoriesBar';
import { FeedCard } from '../../components/feed/FeedCard';
import { FeedRightSidebar } from '../../components/feed/FeedRightSidebar';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { LeaderboardModal } from '../../components/feed/LeaderboardModal';
import {
  Camera,
  Radio,
} from 'lucide-react';

export const LiveFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const geo = useGeolocation(true);
  const { createIncident } = useIncidentStore();

  const {
    posts,
    activeCategory,
    setActiveCategory,
    searchQuery,
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
      localStorage.removeItem('resqgrid_social_feed_storage_v4');
      localStorage.removeItem('resqgrid_social_feed_storage_v5');
      localStorage.removeItem('resqgrid_social_feed_storage_v6');
    } catch {
      // ignore
    }
  }, []);

  // Filter logic
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

      const incident = await createIncident({
        emergencyType: category as any,
        title: `Emergency SOS ${category.toUpperCase()} Assistance`,
        description: `Rapid dispatch initiated for ${category}. ${allocation.rationale}`,
        latitude: lat,
        longitude: lng,
        address: geo.address || 'Bengaluru Metro Area (GPS Pinpoint)',
        reporter_name: user?.fullName || 'Citizen Caller',
        reporter_phone: '+91 98765 43210',
        assigned_hospital_id: allocation.hospital?.id,
        assigned_hospital_name: allocation.hospital?.name,
        assigned_ambulance_id: allocation.ambulance?.id,
        assigned_ambulance_number: allocation.ambulance?.ambulance_number,
        severity: 'critical',
      });

      localStorage.setItem('resqgrid_active_incident_id', incident.id);
      localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(incident));
      setIsTriggeringSos(false);
      navigate(`/citizen/confirm?incidentId=${incident.id}&type=${category}`);
    } catch {
      setIsTriggeringSos(false);
      navigate('/citizen/report', { state: { category: categoryId || 'medical' } });
    }
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="max-w-5xl mx-auto space-y-4 pb-16 font-sans">
        
        {/* 1. Top Stories Carousel */}
        <StoriesBar
          onAddPost={() => setIsCreateModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* 2. Sleek Filter Bar & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-5xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'accident', label: 'Accidents' },
              { id: 'traffic', label: 'Traffic' },
              { id: 'life_saved', label: 'Lives Saved' },
              { id: 'corridor', label: 'Green Corridors' },
              { id: 'blood_donor', label: 'Blood Needs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-white text-slate-950 font-bold shadow'
                    : 'bg-[#0B1B4F]/80 text-slate-300 hover:text-white border border-[#1E3A8A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
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
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>{isTriggeringSos ? 'Dispatching...' : '1-Tap SOS'}</span>
            </button>
          </div>
        </div>

        {/* 3. Main Two-Column Layout: Central Feed Stream + Right Sidebar */}
        <div className="flex justify-center items-start gap-8 pt-2">
          
          {/* Central Feed Stream */}
          <main className="w-full max-w-[500px] shrink-0 space-y-4">
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
          </main>

          {/* Right Sidebar */}
          <div className="hidden lg:block sticky top-24">
            <FeedRightSidebar
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onInstantSos={handleInstantSos}
            />
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

export default LiveFeed;
