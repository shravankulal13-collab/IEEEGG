import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import {
  Star,
  ShieldCheck,
  HeartPulse,
  Brain,
  Activity,
  Car,
  Flame,
  AlertTriangle,
  PhoneCall,
  Radio,
} from 'lucide-react';
import type { EmergencyCategory } from '../../services/hospitalAllocation.service';

interface SuggestedResponder {
  id: string;
  name: string;
  role: string;
  stars: number;
  avatar: string;
  isFollowing?: boolean;
}

const SUGGESTED_RESPONDERS: SuggestedResponder[] = [
  {
    id: 'sug-1',
    name: 'Dr. Priya Hegde',
    role: 'Trauma Surgeon • Manipal',
    stars: 85,
    avatar: 'https://media.istockphoto.com/id/519361223/photo/young-indian-woman.jpg?s=170667a&w=0&k=20&c=Z5yzzlD7kVqP7UhIe8Qb7VGQoXBbNS4NoQMIHBzjWGI=',
  },
  {
    id: 'sug-2',
    name: 'Paramedic Ananya',
    role: 'ALS Lead • St. Johns',
    stars: 62,
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbboQP6Mp1TVio-h8t9177WFi6MUbgeIrRQ7qqtAfshSkYoOqb5MCGtSk8&s=10',
  },
  {
    id: 'sug-3',
    name: 'Traffic Warden Suresh',
    role: 'Traffic Command • Silk Board',
    stars: 34,
    avatar: 'https://st.depositphotos.com/1093689/1376/i/450/depositphotos_13767307-stock-photo-close-up-profile-photo-of.jpg',
  },
  {
    id: 'sug-4',
    name: 'Meera Nambiar',
    role: 'Blood Bank Coordinator',
    stars: 29,
    avatar: 'https://img.magnific.com/free-photo/indian-woman-posing-cute-stylish-outfit-camera-smiling_482257-122351.jpg',
  },
  {
    id: 'sug-5',
    name: 'Amit Shah',
    role: 'Corridor First Responder',
    stars: 19,
    avatar: 'https://images.pexels.com/photos/36876208/pexels-photo-36876208/free-photo-of-portrait-of-an-indian-man-outdoors.jpeg?cs=tinysrgb&dpr=1&w=500',
  },
];

interface FeedRightSidebarProps {
  onOpenLeaderboard: () => void;
  onInstantSos: (cat: EmergencyCategory) => void;
}

export const FeedRightSidebar: React.FC<FeedRightSidebarProps> = ({
  onOpenLeaderboard,
  onInstantSos,
}) => {
  const { user } = useAuthStore();
  const { userStats } = useFeedStore();
  const [responders, setResponders] = useState<SuggestedResponder[]>(SUGGESTED_RESPONDERS);

  const toggleConnect = (id: string) => {
    setResponders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFollowing: !r.isFollowing } : r))
    );
  };

  return (
    <aside className="w-[320px] shrink-0 space-y-4 text-white select-none">
      
      {/* 1. Current User Profile Row */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1B4F]/80 border border-[#1E3A8A] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 shrink-0">
            <img
              src="https://www.shutterstock.com/image-photo/portrait-confident-young-indian-business-260nw-2695542473.jpg"
              alt="My Avatar"
              className="w-full h-full rounded-full object-cover border border-[#0B1B4F]"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              {user?.fullName || 'Shravan Kulal'}
            </p>
            <p className="text-[11px] text-amber-300 font-medium mt-0.5 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{userStats.stars} Stars</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400">{userStats.livesSaved} Saved</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
        >
          Top Ranks
        </button>
      </div>

      {/* 2. 1-Tap SOS Rapid Dispatch */}
      <div className="p-3.5 rounded-2xl bg-[#0B1B4F]/80 border border-[#1E3A8A] backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              1-Tap Rapid Dispatch
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">GPS Auto</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'cardiac', label: 'Cardiac SOS', icon: <HeartPulse className="w-3.5 h-3.5 text-red-400" /> },
            { id: 'trauma', label: 'Severe Trauma', icon: <Activity className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'accident', label: 'Road Accident', icon: <Car className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'stroke', label: 'Stroke SOS', icon: <Brain className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'respiratory', label: 'Breathing SOS', icon: <AlertTriangle className="w-3.5 h-3.5 text-sky-400" /> },
            { id: 'fire', label: 'Burns / Fire', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onInstantSos(cat.id as EmergencyCategory)}
              className="p-2 bg-slate-900/80 hover:bg-red-600/30 border border-white/10 hover:border-red-500 rounded-xl text-xs font-medium text-left transition flex items-center gap-1.5 cursor-pointer"
            >
              {cat.icon}
              <span className="truncate text-[11px] font-semibold text-slate-200">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Suggested First Responders */}
      <div className="p-3.5 rounded-2xl bg-[#0B1B4F]/80 border border-[#1E3A8A] backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            Suggested Responders
          </span>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
          >
            See all
          </button>
        </div>

        <div className="space-y-2.5">
          {responders.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="max-w-[150px]">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white leading-tight truncate">
                      {item.name}
                    </p>
                    <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                    {item.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleConnect(item.id)}
                className={`text-xs font-bold transition cursor-pointer px-2 py-0.5 rounded-md ${
                  item.isFollowing
                    ? 'text-slate-400 hover:text-white bg-white/5'
                    : 'text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20'
                }`}
              >
                {item.isFollowing ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Emergency Toll-Free Helplines */}
      <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10 text-white flex items-center justify-between text-xs font-medium">
        <span className="text-slate-400 flex items-center gap-1">
          <PhoneCall className="w-3 h-3 text-red-400" />
          <span>Helplines:</span>
        </span>
        <a href="tel:108" className="text-red-400 hover:underline font-bold">108 Amb</a>
        <span>•</span>
        <a href="tel:112" className="text-sky-400 hover:underline font-bold">112 Police</a>
        <span>•</span>
        <a href="tel:101" className="text-orange-400 hover:underline font-bold">101 Fire</a>
      </div>

      {/* 5. Footer */}
      <div className="text-[11px] text-slate-500 font-normal leading-relaxed text-center">
        <p>© 2026 RESQGRID • LIFE-SAVING EMERGENCY NETWORK</p>
      </div>
    </aside>
  );
};

export default FeedRightSidebar;
