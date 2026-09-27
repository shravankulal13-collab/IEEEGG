// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// MODULE: Citizen Community & Social Emergency Feed Store
// SYSTEM: ResQGrid Life-Saver Star Karma & Community Intel
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeedComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  authorStars: number;
  text: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'citizen' | 'paramedic' | 'traffic_warden' | 'hospital_staff' | 'dispatcher';
  authorStars: number;
  authorLivesSaved: number;
  isVerifiedReporter: boolean;
  title: string;
  content: string;
  image?: string;
  category: 'accident' | 'traffic' | 'medical' | 'corridor' | 'hazard' | 'blood_donor' | 'life_saved';
  location: string;
  coordinates?: { lat: number; lng: number };
  timestamp: string;
  likesCount: number;
  isLiked: boolean;
  starsAwarded: number;
  isStarAwardedByMe: boolean;
  isLifeSaved: boolean;
  lifeSavedCount: number;
  comments: FeedComment[];
  sharesCount: number;
  severity: 'critical' | 'high' | 'medium' | 'info';
  status: 'active' | 'resolved' | 'dispatched' | 'verified';
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  stars: number;
  livesSaved: number;
  verifiedReports: number;
  badge: 'Platinum Hero' | 'Gold Life Saver' | 'Silver First Responder' | 'Bronze Guardian';
}

interface FeedState {
  posts: FeedPost[];
  activeCategory: string;
  searchQuery: string;
  userStats: {
    stars: number;
    livesSaved: number;
    reportsCount: number;
    rank: string;
  };
  // Actions
  createPost: (postData: {
    title: string;
    content: string;
    category: FeedPost['category'];
    location: string;
    image?: string;
    severity?: FeedPost['severity'];
    authorName?: string;
  }) => void;
  likePost: (postId: string) => void;
  awardStar: (postId: string) => void;
  confirmLifeSaved: (postId: string) => void;
  addComment: (postId: string, text: string, authorName?: string) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  getLeaderboard: () => LeaderboardUser[];
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    authorName: 'Rajesh Kumar',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    authorRole: 'citizen',
    authorStars: 48,
    authorLivesSaved: 3,
    isVerifiedReporter: true,
    title: 'Two vehicle collision on Hosur Road near Silk Board flyover',
    content: 'Collision blocking two right lanes towards Electronic City. Paramedic unit dispatched from St. Johns Hospital. Green Corridor cleared by traffic police. Please keep the right-most lane clear for inbound emergency unit.',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
    category: 'accident',
    location: 'Silk Board Flyover, Bengaluru',
    coordinates: { lat: 12.9176, lng: 77.6238 },
    timestamp: '12m ago',
    likesCount: 142,
    isLiked: false,
    starsAwarded: 18,
    isStarAwardedByMe: false,
    isLifeSaved: true,
    lifeSavedCount: 1,
    sharesCount: 38,
    severity: 'critical',
    status: 'dispatched',
    comments: [
      {
        id: 'c-1',
        authorName: 'Paramedic Ananya',
        authorRole: 'paramedic',
        authorStars: 62,
        text: 'Unit AMB-104 is on scene. Patient stabilized with IV support and en route to Trauma ICU.',
        timestamp: '8m ago',
      },
      {
        id: 'c-2',
        authorName: 'Vikram Singh',
        authorRole: 'citizen',
        authorStars: 15,
        text: 'Green corridor is clear till Forum signal. Good work team.',
        timestamp: '5m ago',
      },
    ],
  },
  {
    id: 'post-2',
    authorName: 'Dr. Priya Hegde',
    authorAvatar: 'https://images.unsplash.com/photo-1594824813598-a28a30e8c891?auto=format&fit=crop&w=200&q=80',
    authorRole: 'hospital_staff',
    authorStars: 85,
    authorLivesSaved: 12,
    isVerifiedReporter: true,
    title: 'Emergency Cath-Lab resuscitation completed in 18 minutes',
    content: 'Patient transferred via ResQGrid dynamic corridor from Indiranagar with acute STEMI cardiac condition. Pre-arrival ECG telemetry streamed while ambulance was 6 mins away. Cath-lab prepared and stent placed successfully.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    category: 'life_saved',
    location: 'Manipal Hospital Trauma Center, Old Airport Road',
    coordinates: { lat: 12.9592, lng: 77.6534 },
    timestamp: '35m ago',
    likesCount: 320,
    isLiked: true,
    starsAwarded: 42,
    isStarAwardedByMe: true,
    isLifeSaved: true,
    lifeSavedCount: 1,
    sharesCount: 89,
    severity: 'info',
    status: 'resolved',
    comments: [
      {
        id: 'c-3',
        authorName: 'Suresh Patil',
        authorRole: 'citizen',
        authorStars: 22,
        text: 'Fast emergency coordination. Glad the patient is stable.',
        timestamp: '20m ago',
      },
    ],
  },
  {
    id: 'post-3',
    authorName: 'Traffic Warden Suresh B.',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    authorRole: 'traffic_warden',
    authorStars: 34,
    authorLivesSaved: 2,
    isVerifiedReporter: true,
    title: 'Waterlogging and heavy traffic congestion at Sony World Junction',
    content: 'Water stagnation following evening rains. Traffic moving at slow speed. Ambulances bound for St. Johns are being dynamically rerouted via 80 Feet Road corridor to avoid the intersection delay.',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    category: 'traffic',
    location: 'Sony World Junction, Koramangala',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    timestamp: '48m ago',
    likesCount: 94,
    isLiked: false,
    starsAwarded: 9,
    isStarAwardedByMe: false,
    isLifeSaved: false,
    lifeSavedCount: 0,
    sharesCount: 45,
    severity: 'high',
    status: 'active',
    comments: [
      {
        id: 'c-4',
        authorName: 'Dispatcher Naveen',
        authorRole: 'dispatcher',
        authorStars: 50,
        text: 'Automated dynamic rerouting active for fleet units in Zone 3.',
        timestamp: '40m ago',
      },
    ],
  },
  {
    id: 'post-4',
    authorName: 'Meera Nambiar',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    authorRole: 'citizen',
    authorStars: 29,
    authorLivesSaved: 1,
    isVerifiedReporter: false,
    title: 'Urgent: O-Negative blood units required at Victoria Hospital ER',
    content: 'Trauma admissions admitted from expressway road incident. Blood bank inventory requires urgent replenishment of O-Negative units. Donors in the area please report to Victoria Hospital blood bank.',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
    category: 'blood_donor',
    location: 'Victoria Hospital Emergency Ward, City Market',
    coordinates: { lat: 12.9628, lng: 77.5746 },
    timestamp: '1h ago',
    likesCount: 215,
    isLiked: false,
    starsAwarded: 24,
    isStarAwardedByMe: false,
    isLifeSaved: true,
    lifeSavedCount: 2,
    sharesCount: 110,
    severity: 'critical',
    status: 'active',
    comments: [
      {
        id: 'c-5',
        authorName: 'Arjun Verma',
        authorRole: 'citizen',
        authorStars: 19,
        text: 'On my way to Victoria Hospital blood bank now.',
        timestamp: '45m ago',
      },
    ],
  },
  {
    id: 'post-5',
    authorName: 'Amit Shah',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    authorRole: 'citizen',
    authorStars: 19,
    authorLivesSaved: 1,
    isVerifiedReporter: false,
    title: 'Emergency Green Corridor cleared from MG Road to Airport Road',
    content: 'Critical medical transport corridor enabled across 6 traffic junctions. Signal preemptive timing enabled clear transit in 14 minutes, preventing route delay.',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80',
    category: 'corridor',
    location: 'MG Road Trinity Circle to Domlur',
    coordinates: { lat: 12.9738, lng: 77.6186 },
    timestamp: '2h ago',
    likesCount: 405,
    isLiked: true,
    starsAwarded: 58,
    isStarAwardedByMe: true,
    isLifeSaved: true,
    lifeSavedCount: 1,
    sharesCount: 142,
    severity: 'info',
    status: 'resolved',
    comments: [],
  },
];

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: INITIAL_POSTS,
      activeCategory: 'all',
      searchQuery: '',
      userStats: {
        stars: 24,
        livesSaved: 2,
        reportsCount: 5,
        rank: 'Gold Life Saver',
      },

      createPost: (postData) => {
        const newPost: FeedPost = {
          id: `post-${Date.now()}`,
          authorName: postData.authorName || 'Current User',
          authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
          authorRole: 'citizen',
          authorStars: get().userStats.stars + 1,
          authorLivesSaved: get().userStats.livesSaved,
          isVerifiedReporter: true,
          title: postData.title,
          content: postData.content,
          image:
            postData.image ||
            (postData.category === 'accident'
              ? 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Bangalore_India_traffic.jpg'
              : postData.category === 'traffic'
              ? 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80'
              : postData.category === 'medical'
              ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80'
              : postData.category === 'blood_donor'
              ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Blood_Donation_Camp_organized_by_the_Indian_Navy.jpg/800px-Blood_Donation_Camp_organized_by_the_Indian_Navy.jpg'
              : 'https://upload.wikimedia.org/wikipedia/commons/c/ca/108_Ambulance.jpg'),
          category: postData.category,
          location: postData.location || 'Bengaluru City (GPS Verified)',
          timestamp: 'Just now',
          likesCount: 1,
          isLiked: true,
          starsAwarded: 1,
          isStarAwardedByMe: false,
          isLifeSaved: false,
          lifeSavedCount: 0,
          sharesCount: 0,
          severity: postData.severity || 'high',
          status: 'active',
          comments: [],
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
          userStats: {
            ...state.userStats,
            stars: state.userStats.stars + 2,
            reportsCount: state.userStats.reportsCount + 1,
          },
        }));
      },

      likePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              const newLiked = !p.isLiked;
              return {
                ...p,
                isLiked: newLiked,
                likesCount: newLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
              };
            }
            return p;
          }),
        }));
      },

      awardStar: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              const alreadyAwarded = p.isStarAwardedByMe;
              return {
                ...p,
                isStarAwardedByMe: !alreadyAwarded,
                starsAwarded: !alreadyAwarded ? p.starsAwarded + 1 : Math.max(0, p.starsAwarded - 1),
                authorStars: !alreadyAwarded ? p.authorStars + 1 : Math.max(0, p.authorStars - 1),
              };
            }
            return p;
          }),
        }));
      },

      confirmLifeSaved: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                isLifeSaved: true,
                lifeSavedCount: p.lifeSavedCount + 1,
                starsAwarded: p.starsAwarded + 5,
                authorStars: p.authorStars + 5,
                authorLivesSaved: p.authorLivesSaved + 1,
                status: 'resolved',
              };
            }
            return p;
          }),
        }));
      },

      addComment: (postId, text, authorName = 'Current User') => {
        const newComment: FeedComment = {
          id: `comment-${Date.now()}`,
          authorName,
          authorRole: 'citizen',
          authorStars: get().userStats.stars,
          text,
          timestamp: 'Just now',
        };

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...p.comments, newComment],
              };
            }
            return p;
          }),
        }));
      },

      setActiveCategory: (cat) => set({ activeCategory: cat }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      getLeaderboard: () => {
        return [
          {
            id: 'u-1',
            name: 'Dr. Priya Hegde',
            avatar: 'https://images.unsplash.com/photo-1594824813598-a28a30e8c891?auto=format&fit=crop&w=200&q=80',
            role: 'Hospital Surgeon',
            stars: 85,
            livesSaved: 12,
            verifiedReports: 28,
            badge: 'Platinum Hero',
          },
          {
            id: 'u-2',
            name: 'Paramedic Ananya',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
            role: 'ALS Paramedic Lead',
            stars: 62,
            livesSaved: 8,
            verifiedReports: 34,
            badge: 'Gold Life Saver',
          },
          {
            id: 'u-3',
            name: 'Rajesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
            role: 'Citizen First Responder',
            stars: 48,
            livesSaved: 3,
            verifiedReports: 14,
            badge: 'Gold Life Saver',
          },
          {
            id: 'u-4',
            name: 'Traffic Warden Suresh',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            role: 'Traffic Command',
            stars: 34,
            livesSaved: 2,
            verifiedReports: 22,
            badge: 'Silver First Responder',
          },
          {
            id: 'u-5',
            name: 'Meera Nambiar',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: 'Blood Donor Coordinator',
            stars: 29,
            livesSaved: 1,
            verifiedReports: 9,
            badge: 'Bronze Guardian',
          },
        ];
      },
    }),
    {
      name: 'resqgrid_social_feed_storage_v4',
    }
  )
);
