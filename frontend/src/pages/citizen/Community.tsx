// ============================================================
// Community Safety Feed — Full Reference Implementation
// DEMO MODE: set COMMUNITY_DEMO_MODE = false to use real API
// ============================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, Bell, BookOpen, Car, CheckCircle2, ChevronDown,
  Clock3, Flame, Filter, Heart, Home, Info, LayoutDashboard,
  MapPin, MessageCircle, MoreHorizontal, Plus, Radio, RefreshCw,
  Search, Send, Settings, Share2, ShieldAlert, ShieldCheck,
  Stethoscope, TrendingUp, User, Users, Waves, X, Zap,
  Play, Ambulance, Hospital, Copy,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { incidentService } from '../../services/incident.service';
import { socketService } from '../../services/socket';
import {
  COMMUNITY_DEMO_POSTS, DEMO_TRENDING, DEMO_MAP_MARKERS,
  type DemoPost,
} from '../../data/communityDemoData';

// ── DEMO MODE SWITCH ──────────────────────────────────────────
const COMMUNITY_DEMO_MODE = true;
// Set to false to use incidentService.list() from real backend.
// ─────────────────────────────────────────────────────────────

// ── TYPES ─────────────────────────────────────────────────────
type CommunityTab = 'feed' | 'profile';
type SortMode = 'latest' | 'discussed' | 'nearby';
type CommentState = Record<string, string[]>;

const CATEGORIES = [
  { value: 'all',              label: 'All',             emoji: '📋' },
  { value: 'Accident',        label: 'Accidents',       emoji: '🚗' },
  { value: 'Medical',         label: 'Medical',         emoji: '🏥' },
  { value: 'Fire',            label: 'Fire',            emoji: '🔥' },
  { value: 'Natural Disaster',label: 'Natural Disaster',emoji: '🌊' },
  { value: 'Police',          label: 'Police',          emoji: '🚔' },
  { value: 'Infrastructure',  label: 'Infrastructure',  emoji: '🏗️' },
  { value: 'Other',           label: 'Other',           emoji: '⚠️' },
];

const FILTER_OPTIONS = CATEGORIES;

// Status badge config
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Verified:           { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Verified' },
  Ongoing:            { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500 animate-pulse', label: 'Ongoing' },
  'Under Verification':{ bg: 'bg-rose-50',  text: 'text-rose-600',    dot: 'bg-rose-500',   label: 'Under Verification' },
  Information:        { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',   label: 'Information' },
  Resolved:           { bg: 'bg-slate-50',   text: 'text-slate-500',   dot: 'bg-slate-400',  label: 'Resolved' },
  Critical:           { bg: 'bg-red-100',    text: 'text-red-700',     dot: 'bg-red-600 animate-pulse', label: 'Critical' },
};
const getStatusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.Information;

// Category color pills
const CAT_COLOR: Record<string, string> = {
  Medical:           'bg-rose-50 text-rose-700',
  Accident:          'bg-orange-50 text-orange-700',
  Fire:              'bg-red-50 text-red-700',
  'Natural Disaster':'bg-blue-50 text-blue-700',
  Police:            'bg-indigo-50 text-indigo-700',
  Infrastructure:    'bg-amber-50 text-amber-700',
  Other:             'bg-slate-50 text-slate-600',
};
const getCatColor = (c: string) => CAT_COLOR[c] || CAT_COLOR.Other;

// ── CITIZEN SIDEBAR NAV ────────────────────────────────────────
const citizenNav = [
  { label: 'Home',             path: '/citizen',           icon: Home },
  { label: 'Report Emergency', path: '/citizen/report',    icon: Plus },
  { label: 'Community',        path: '/citizen/community', icon: Users },
  { label: 'Map',              path: '/citizen/map',       icon: MapPin },
  { label: 'Hospitals',        path: '/citizen/hospitals', icon: Hospital },
  { label: 'Ambulances',       path: '/citizen/ambulances',icon: Ambulance },
  { label: 'Profile',          path: '/citizen/profile',   icon: User },
  { label: 'Settings',         path: '/citizen/settings',  icon: Settings },
];

// ── MINI SVG MAP ──────────────────────────────────────────────
interface MapMk { id:string; lat:number; lng:number; color:string; title:string; }
const MiniMap: React.FC<{ markers: MapMk[]; onMarkerClick?: (id: string) => void }> = ({ markers, onMarkerClick }) => {
  const base = { minLat:12.855, maxLat:12.900, minLng:74.830, maxLng:74.875 };
  const toXY = (lat:number, lng:number) => ({
    x: Math.max(4,Math.min(96,((lng-base.minLng)/(base.maxLng-base.minLng))*100)),
    y: Math.max(4,Math.min(96,((base.maxLat-lat)/(base.maxLat-base.minLat))*100)),
  });
  return (
    <div className="relative w-full h-[230px] rounded-xl overflow-hidden" style={{background:'linear-gradient(135deg,#e8f4e8 0%,#d4e6d4 30%,#c8ddc8 60%,#b8d4b8 100%)'}}>
      <svg viewBox="0 0 400 230" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {/* Road network */}
        <path d="M 0 115 Q 100 100 200 115 T 400 115" fill="none" stroke="#fff" strokeWidth="8" opacity="0.8"/>
        <path d="M 200 0 Q 210 60 200 115 T 195 230" fill="none" stroke="#fff" strokeWidth="6" opacity="0.7"/>
        <path d="M 50 170 Q 150 140 250 150 T 390 130" fill="none" stroke="#fff" strokeWidth="5" opacity="0.6"/>
        <path d="M 0 60 Q 100 50 170 80 T 280 55" fill="none" stroke="#fff" strokeWidth="4" opacity="0.5"/>
        {/* Water body */}
        <ellipse cx="350" cy="180" rx="60" ry="40" fill="#93c5fd" opacity="0.4"/>
        {/* Area blocks */}
        <rect x="60" y="30" width="80" height="50" rx="4" fill="#fff" opacity="0.15"/>
        <rect x="180" y="50" width="60" height="40" rx="4" fill="#fff" opacity="0.15"/>
        <rect x="100" y="140" width="70" height="50" rx="4" fill="#fff" opacity="0.12"/>
        {/* Labels */}
        <text x="200" y="25" fontSize="9" fill="#4b7a4b" textAnchor="middle" fontWeight="600">Mangaluru</text>
        <text x="355" y="200" fontSize="7" fill="#3b82f6" textAnchor="middle">Sea</text>
        <text x="80" y="70" fontSize="7" fill="#555" textAnchor="middle">Kadri</text>
        <text x="200" y="145" fontSize="7" fill="#555" textAnchor="middle">Hampankatta</text>
        <text x="300" y="80" fontSize="7" fill="#555" textAnchor="middle">Kankanady</text>
        <text x="130" y="175" fontSize="7" fill="#555" textAnchor="middle">Derebail</text>
      </svg>
      {markers.map(mk => {
        const {x,y} = toXY(mk.lat, mk.lng);
        return (
          <button key={mk.id} type="button" title={mk.title}
            onClick={() => onMarkerClick?.(mk.id)}
            className="absolute transform -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform focus:outline-none"
            style={{left:`${x}%`,top:`${y}%`}}>
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{backgroundColor:mk.color}}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </button>
        );
      })}
      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
        {[{c:'#ef4444',l:'Accident'},{c:'#3b82f6',l:'Natural'},{c:'#6366f1',l:'Police'},{c:'#22c55e',l:'Resolved'}].map(({c,l})=>(
          <div key={l} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full border border-white" style={{backgroundColor:c}}/>
            <span className="text-[9px] font-semibold text-slate-600">{l}</span>
          </div>
        ))}
      </div>
      <button type="button" className="absolute bottom-2 right-2 text-[10px] font-bold text-[#0f172a] bg-white/90 rounded-lg px-2.5 py-1 shadow-sm hover:bg-white transition">
        View Full Map →
      </button>
    </div>
  );
};
// ── MAIN COMPONENT ─────────────────────────────────────────────
export const Community: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // ─ UI state
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ─ Social state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [extraComments, setExtraComments] = useState<CommentState>({});
  const [shareMenuId, setShareMenuId] = useState<string | null>(null);
  const [dotMenuId, setDotMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  // ─ Demo posts as state (allows local mutations)
  const [demoPosts] = useState<DemoPost[]>(COMMUNITY_DEMO_POSTS);

  // ─ Real API state (used when COMMUNITY_DEMO_MODE = false)
  const [apiIncidents, setApiIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(!COMMUNITY_DEMO_MODE);
  const [error, setError] = useState('');

  // Initialise likeCounts from demo data once
  useEffect(() => {
    const init: Record<string, number> = {};
    COMMUNITY_DEMO_POSTS.forEach(p => { init[p.id] = p.likes; });
    setLikeCounts(init);
  }, []);

  // ─ Load real API data when demo mode is OFF
  useEffect(() => {
    if (COMMUNITY_DEMO_MODE) return;
    (async () => {
      try {
        setLoading(true);
        const res = await incidentService.list({ limit: 20 });
        setApiIncidents(res.items || []);
      } catch { setError('Unable to load feed.'); }
      finally { setLoading(false); }
    })();
  }, []);

  // ─ Socket realtime (real mode only)
  useEffect(() => {
    if (COMMUNITY_DEMO_MODE) return;
    const u1 = socketService.on('incident_created', (d: any) => {
      if (d?.id) setApiIncidents(prev => [d, ...prev.filter(i => i.id !== d.id)]);
    });
    const u2 = socketService.on('incident_updated', (d: any) => {
      if (d?.id) setApiIncidents(prev => prev.map(i => i.id === d.id ? { ...i, ...d } : i));
    });
    return () => { u1(); u2(); };
  }, []);

  const showNotice = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 2500); };

  // ─ Filter + sort
  const filteredPosts = useMemo(() => {
    let posts = [...demoPosts];
    if (activeCategory !== 'all') posts = posts.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (sortMode === 'discussed') posts.sort((a,b) => b.commentCount - a.commentCount);
    else if (sortMode === 'nearby')  posts.sort((a,b) => a.lat - b.lat);
    // default: 'latest' — already in order by timeAgo relevance
    return posts;
  }, [demoPosts, activeCategory, searchQuery, sortMode]);

  // ─ Social handlers
  const toggleLike = (id: string) => {
    const wasLiked = !!likedPosts[id];
    setLikedPosts(p => ({ ...p, [id]: !wasLiked }));
    setLikeCounts(p => ({ ...p, [id]: (p[id] ?? 0) + (wasLiked ? -1 : 1) }));
  };
  const toggleComments = (id: string) =>
    setOpenComments(p => ({ ...p, [id]: !p[id] }));

  const submitComment = (id: string) => {
    const t = (commentInputs[id] || '').trim();
    if (!t) return;
    setExtraComments(p => ({ ...p, [id]: [...(p[id] || []), t] }));
    setCommentInputs(p => ({ ...p, [id]: '' }));
  };

  const handleShare = async (post: DemoPost) => {
    const url = `${window.location.origin}/citizen/community`;
    try {
      if (navigator.share) { await navigator.share({ title: post.title, text: post.description, url }); return; }
      if (navigator.clipboard) { await navigator.clipboard.writeText(url); showNotice('Link copied to clipboard!'); }
    } catch { /* cancelled */ }
    setShareMenuId(null);
  };

  const mapMarkers = DEMO_MAP_MARKERS;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] font-sans">

      {/* ══ TOP BAR ══════════════════════════════════════════════ */}
      <header className="h-14 bg-white border-b border-slate-200/80 flex items-center gap-4 px-4 sm:px-6 shrink-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 w-[220px] shrink-0">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
            <ShieldAlert className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-[15px] font-black tracking-tight text-[#0f172a]">RESQGRID</span>
        </div>
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search incidents, locations or keywords..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-full outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
            />
          </div>
        </div>
        {/* Right controls */}
        <div className="flex items-center gap-3 ml-auto">
          <button type="button" className="relative p-2 rounded-full hover:bg-slate-100 transition">
            <Bell className="h-5 w-5 text-slate-500" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-50 transition border border-slate-200">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] flex items-center justify-center text-white text-xs font-black">
              {(user?.fullName || 'K').charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] font-semibold text-slate-700">{user?.fullName || 'Khushi'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* ══ BODY: sidebar + main + right ══════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-white border-r border-slate-200/80 py-4 gap-1 shadow-sm">
          {citizenNav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/citizen' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <button key={item.path} type="button" onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={{width:'calc(100% - 16px)'}}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* ── MAIN FEED ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[780px] mx-auto px-4 py-5 sm:px-6">

            {/* PAGE HEADER */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-500">Community</p>
                <h1 className="mt-0.5 text-[24px] font-black text-[#0f172a] tracking-tight leading-7">Community Safety Feed</h1>
                <p className="mt-1 text-[13px] text-slate-500 leading-5">
                  Stay informed about emergency situations reported by people in your community.
                </p>
              </div>
              <button type="button" onClick={() => navigate('/citizen/report')}
                className="shrink-0 ml-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.97] transition-all">
                <Plus className="h-4 w-4" />
                Report Emergency
              </button>
            </div>

            {/* NOTICE */}
            {notice && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{notice}
              </div>
            )}

            {/* ── CATEGORY / STORY ROW ──────────────────────────── */}
            <div className="mb-4 -mx-2">
              <div className="flex items-start gap-3 overflow-x-auto pb-1 px-2 scrollbar-none">
                {/* Report Emergency circle */}
                <button type="button" onClick={() => navigate('/citizen/report')}
                  className="flex flex-col items-center gap-1.5 shrink-0 group">
                  <div className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center w-[68px] leading-3">Report Emergency</span>
                </button>

                {/* Category circles */}
                {CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button key={cat.value} type="button" onClick={() => setActiveCategory(cat.value)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group">
                      <div className={`h-[60px] w-[60px] rounded-full flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105 border-2 ${
                        isActive ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200 bg-white'
                      }`}
                        style={isActive ? {} : {background:'#f8fafc'}}>
                        {cat.emoji}
                      </div>
                      <span className={`text-[10px] font-semibold text-center w-[68px] leading-3 ${isActive ? 'text-red-600' : 'text-slate-500'}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TABS + SORT ───────────────────────────────────── */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/80">
              <div className="flex">
                {(['feed','profile'] as CommunityTab[]).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-2.5 text-[13px] font-semibold capitalize transition-all ${
                      activeTab === tab ? 'text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {tab}
                    {activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-red-500" />}
                  </button>
                ))}
              </div>
              {activeTab === 'feed' && (
                <div className="relative mb-1">
                  <button type="button" onClick={() => setSortOpen(o => !o)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                    {sortMode === 'latest' ? 'Latest' : sortMode === 'discussed' ? 'Most Discussed' : 'Nearby'}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                      {([['latest','Latest'],['discussed','Most Discussed'],['nearby','Nearby']] as [SortMode,string][]).map(([v,l]) => (
                        <button key={v} type="button" onClick={() => { setSortMode(v); setSortOpen(false); }}
                          className={`w-full px-4 py-2 text-[13px] text-left font-semibold hover:bg-slate-50 transition ${sortMode===v ? 'text-red-600' : 'text-slate-700'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── PROFILE TAB ───────────────────────────────────── */}
            {activeTab === 'profile' && (
              <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] flex items-center justify-center text-white font-black text-xl shadow">
                    {(user?.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#0f172a]">{user?.fullName || 'Community Member'}</h2>
                    {user?.email && <p className="text-[13px] text-slate-500">{user.email}</p>}
                    <p className="text-[11px] font-semibold text-slate-400 capitalize">Citizen · ResQGrid Community</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[{v:COMMUNITY_DEMO_POSTS.length,l:'Total Reports'},{v:3,l:'My Reports'},{v:5,l:'Verified'},{v:2,l:'Resolved'}].map(({v,l})=>(
                    <div key={l} className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <p className="text-2xl font-black text-[#0f172a]">{v}</p>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── FEED ──────────────────────────────────────────── */}
            {activeTab === 'feed' && (
              <div className="space-y-3">

                {filteredPosts.length === 0 && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center"><Users className="h-5 w-5 text-slate-400"/></div>
                    <p className="text-[14px] font-bold text-slate-700">No reports found</p>
                    <p className="text-[12px] text-slate-400">Try a different category or search term.</p>
                    <button type="button" onClick={()=>{setActiveCategory('all');setSearchQuery('');}}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition">
                      <X className="h-3 w-3"/>Clear filters
                    </button>
                  </div>
                )}

                {filteredPosts.map(post => {
                  const isLiked = !!likedPosts[post.id];
                  const likeCount = likeCounts[post.id] ?? post.likes;
                  const isCommentOpen = !!openComments[post.id];
                  const extra = extraComments[post.id] || [];
                  const allComments = [...post.comments, ...extra.map((t,i) => ({ id:`x${i}`, author: user?.fullName || 'You', avatar:(user?.fullName||'Y').charAt(0), text:t, timeAgo:'just now' }))];
                  const statusCfg = getStatusCfg(post.status);

                  return (
                    <article key={post.id} id={`post-${post.id}`}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">

                      {/* ── CARD BODY: image left + content right ─── */}
                      <div className="flex gap-0">

                        {/* LEFT IMAGE PANEL */}
                        <div className="relative shrink-0 w-[220px] sm:w-[240px]"
                          style={{background: post.imageGradient, minHeight:'160px'}}>
                          {/* Big emoji centered */}
                          <div className="absolute inset-0 flex items-center justify-center text-5xl select-none pointer-events-none">
                            {post.imageLabel}
                          </div>
                          {/* Video indicator */}
                          {post.hasVideo && (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5">
                                {post.videoDuration}
                              </span>
                            </>
                          )}
                          {/* Image count badge */}
                          {post.imageCount && (
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5">
                              📷 {post.imageCount} images
                            </span>
                          )}
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">

                          {/* Status + time + 3-dot row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} border-transparent`}>
                                {post.status === 'Verified' && <CheckCircle2 className="h-3 w-3" />}
                                {post.status === 'Ongoing' && <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />}
                                {post.status === 'Under Verification' && <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />}
                                {post.status === 'Critical' && <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />}
                                {post.status === 'Information' && <Info className="h-3 w-3" />}
                                {post.status}
                              </span>
                              <span className="text-[11px] text-slate-400">{post.timeAgo}</span>
                            </div>
                            <div className="relative">
                              <button type="button" onClick={()=>setDotMenuId(dotMenuId===post.id?null:post.id)}
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              {dotMenuId === post.id && (
                                <div className="absolute right-0 top-7 z-30 w-36 rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                                  {['View Details','Save','Report'].map(opt=>(
                                    <button key={opt} type="button" onClick={()=>setDotMenuId(null)}
                                      className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition">
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h2 className="text-[15px] font-bold text-[#0f172a] leading-5">{post.title}</h2>

                          {/* Location */}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            <span className="text-[12px] text-slate-500 truncate">{post.location}</span>
                          </div>

                          {/* Description */}
                          <p className="text-[12px] leading-5 text-slate-500 line-clamp-2">{post.description}</p>

                          {/* Category pill */}
                          <div>
                            <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getCatColor(post.category)}`}>
                              {post.category}
                            </span>
                          </div>

                          {/* Actions row */}
                          <div className="flex items-center gap-4 mt-auto pt-1 border-t border-slate-100">
                            {/* Like */}
                            <button type="button" onClick={()=>toggleLike(post.id)}
                              className={`flex items-center gap-1 text-[12px] font-semibold transition-all ${isLiked ? 'text-red-600' : 'text-slate-400 hover:text-red-500'}`}>
                              <Heart className={`h-4 w-4 transition-transform hover:scale-110 ${isLiked?'fill-current':''}`} />
                              {likeCount}
                            </button>
                            {/* Comment */}
                            <button type="button" onClick={()=>toggleComments(post.id)}
                              className={`flex items-center gap-1 text-[12px] font-semibold transition ${isCommentOpen?'text-slate-800':'text-slate-400 hover:text-slate-700'}`}>
                              <MessageCircle className="h-4 w-4" />
                              {allComments.length}
                            </button>
                            {/* Share */}
                            <div className="relative">
                              <button type="button" onClick={()=>setShareMenuId(shareMenuId===post.id?null:post.id)}
                                className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition">
                                <Share2 className="h-4 w-4" /> Share
                              </button>
                              {shareMenuId === post.id && (
                                <div className="absolute left-0 bottom-8 z-30 w-40 rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                                  <button type="button" onClick={async()=>{await handleShare(post);}}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition">
                                    <Copy className="h-3.5 w-3.5"/> Copy Link
                                  </button>
                                  <button type="button" onClick={()=>setShareMenuId(null)}
                                    className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition">
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── COMMENT PANEL ────────────────────────── */}
                      {isCommentOpen && (
                        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                          {allComments.length > 0 && (
                            <div className="mb-2.5 space-y-2">
                              {allComments.map(c => (
                                <div key={c.id} className="flex items-start gap-2.5">
                                  <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white text-[10px] font-black flex items-center justify-center">
                                    {c.avatar}
                                  </div>
                                  <div className="rounded-lg bg-white px-3 py-1.5 text-[12px] text-slate-700 shadow-sm border border-slate-100 flex-1">
                                    <span className="font-semibold text-slate-800 mr-1">{c.author}</span>{c.text}
                                    <span className="ml-1 text-[10px] text-slate-400">{c.timeAgo}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input type="text"
                              value={commentInputs[post.id]||''}
                              onChange={e=>setCommentInputs(p=>({...p,[post.id]:e.target.value}))}
                              onKeyDown={e=>{ if(e.key==='Enter') submitComment(post.id); }}
                              placeholder="Add a comment…"
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition"/>
                            <button type="button" onClick={()=>submitComment(post.id)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-white hover:bg-[#1e293b] transition">
                              <Send className="h-3.5 w-3.5"/>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
        <aside className="hidden xl:flex flex-col w-[320px] shrink-0 overflow-y-auto bg-[#f6f8fb] border-l border-slate-200/80 px-4 py-5 gap-3">

          {/* A. Live Community Map */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#0f172a]">Live Community Map</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/>
                  <span className="text-[11px] font-semibold text-emerald-600">Live</span>
                </div>
                <button type="button" className="p-1 rounded hover:bg-slate-100 transition">
                  <Zap className="h-3.5 w-3.5 text-slate-400"/>
                </button>
              </div>
            </div>
            <MiniMap markers={mapMarkers} onMarkerClick={id => {
              const el = document.getElementById(`post-${id}`);
              el?.scrollIntoView({ behavior:'smooth', block:'center' });
            }}/>
          </div>

          {/* B. Filter Reports */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-[#0f172a]">Filter Reports</span>
              <button type="button" onClick={()=>setActiveCategory('all')}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition">Clear</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={()=>setActiveCategory(opt.value)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all border ${
                    activeCategory===opt.value
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* C. Community Guidelines */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-[#1e3a8a]"/>
              <span className="text-[13px] font-bold text-[#0f172a]">Community Guidelines</span>
            </div>
            <ul className="space-y-2.5">
              {[
                'Share accurate and genuine information',
                'Do not post false or misleading reports',
                'Respect others and maintain a helpful community',
                'In case of real emergencies, call official helplines',
              ].map((g,i)=>(
                <li key={i} className="flex items-start gap-2 text-[12px] leading-5 text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500"/>
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* D. Trending in Your Area */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500"/>
                <span className="text-[13px] font-bold text-[#0f172a]">Trending in Your Area</span>
              </div>
              <button type="button" className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition">View All</button>
            </div>
            <div className="space-y-2.5">
              {DEMO_TRENDING.map(t => (
                <div key={t.rank} className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-400 w-4">{t.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-800 truncate">{t.label}</p>
                    <p className="text-[11px] text-slate-400">{t.count}</p>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">{t.change}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default Community;
